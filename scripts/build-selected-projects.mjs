/**
 * Merges zone list CSV + main form CSV + poster form CSV into:
 * - data/selected-projects-merged.csv (QA review; emails stripped)
 * - src/data/selected-projects.json (committed; website shape)
 *
 * Poster sheet rows are matched to the same 55 official titles; presence on the
 * poster list forces poster: true for the site.
 *
 * Run: npm run data:merge
 */
import { parse } from 'csv-parse/sync';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, '..');

const GROUPED_FILE = path.join(
  root,
  'data',
  'Selected_Projects(Final Grouped List To Consider).csv',
);
const FORM_FILE = path.join(root, 'data', 'Selected_Projects(Form Responses 1).csv');
const POSTER_FILE = path.join(root, 'data', 'Selected_Projects(Poster).csv');
const OUT_MERGED_CSV = path.join(root, 'data', 'selected-projects-merged.csv');
const OUT_JSON = path.join(root, 'src', 'data', 'selected-projects.json');

function readUtf8(p) {
  return fs.readFileSync(p, 'utf8');
}

function normalizeTitle(s) {
  if (s == null) return '';
  return String(s)
    .normalize('NFKD')
    .replace(/[\u2013\u2014\u2212]/g, '-')
    .replace(/[''']/g, "'")
    .toLowerCase()
    .replace(/\banamoly\b/g, 'anomaly')
    .replace(/\bmachine[- ]learning\b/gi, 'ml')
    .replace(/\bwith\s+a\s+ml\b/g, 'with ml')
    .replace(/\s+framework\b/g, '')
    .replace(/\s+/g, ' ')
    .trim();
}

function cleanText(s) {
  if (s == null) return '';
  let out = String(s);
  // Common mojibake / replacement-char cleanup from spreadsheet exports.
  out = out
    .replace(/\u00a0/g, ' ')
    .replace(/â€™|’/g, "'")
    .replace(/â€“|â€”/g, ' - ')
    .replace(/â€œ|â€/g, '"')
    // word�word => apostrophe (don�t -> don't)
    .replace(/([A-Za-z])�([A-Za-z])/g, "$1'$2")
    // space�space => dash separator (A � B -> A - B)
    .replace(/\s�\s/g, ' - ')
    // Any remaining replacement chars are dropped.
    .replace(/�/g, '');
  return out.replace(/\s+/g, ' ').trim();
}

function normalizeTitleLoose(s) {
  let t = normalizeTitle(s);
  t = t.replace(/\([^)]*\)/g, ' ');
  t = t.replace(/[^a-z0-9]+/g, ' ');
  return t.replace(/\s+/g, ' ').trim();
}

function levenshtein(a, b) {
  if (a === b) return 0;
  if (!a.length) return b.length;
  if (!b.length) return a.length;
  const v0 = new Array(b.length + 1);
  for (let i = 0; i <= b.length; i += 1) v0[i] = i;
  for (let i = 0; i < a.length; i += 1) {
    let prev = i + 1;
    for (let j = 0; j < b.length; j += 1) {
      const cur = Math.min(
        prev + 1,
        v0[j + 1] + 1,
        v0[j] + (a[i] === b[j] ? 0 : 1),
      );
      v0[j] = prev;
      prev = cur;
    }
    v0[b.length] = prev;
  }
  return v0[b.length];
}

function scoreTitleMatch(listTitle, formTitle) {
  const a = normalizeTitle(listTitle);
  const b = normalizeTitle(formTitle);
  if (!a || !b) return 0;
  if (a === b) return 100;

  const al = normalizeTitleLoose(listTitle);
  const bl = normalizeTitleLoose(formTitle);
  if (al && bl && al === bl) return 96;

  if (a.includes(b) || b.includes(a)) return 88;

  const maxLen = Math.max(a.length, b.length, 1);
  const dist = levenshtein(a, b);
  const ratio = 1 - dist / maxLen;
  if (ratio >= 0.82) return Math.round(70 + ratio * 25);

  const distL = levenshtein(al, bl);
  const maxL = Math.max(al.length, bl.length, 1);
  const ratioL = 1 - distL / maxL;
  if (ratioL >= 0.85) return Math.round(65 + ratioL * 20);

  return 0;
}

function parseGroupedList(content) {
  const records = parse(content, {
    skip_empty_lines: false,
    relax_column_count: true,
    trim: false,
  });

  const zones = [];
  let current = null;

  for (const row of records) {
    const c0 = (row[0] ?? '').trim();
    const c1 = cleanText((row[1] ?? '').replace(/^"|"$/g, '').trim());

    const zoneHeader =
      /zone\s*\d+/i.test(c0) || /zone\s*\d+/i.test(c1) ? (c0 || c1) : null;
    const themeCell = c1.startsWith('Theme:') ? c1 : null;

    if (zoneHeader && /zone\s*\d+/i.test(zoneHeader) && !/^\d+$/.test(c0)) {
      const name = c1 && /zone\s*\d+/i.test(c1) ? c1 : c0 || c1;
      current = {
        name: cleanText(name.replace(/^"|"$/g, '').trim()),
        theme: '',
        projects: [],
      };
      zones.push(current);
      continue;
    }

    if (current && themeCell) {
      current.theme = cleanText(themeCell.replace(/^Theme:\s*/i, '').trim());
      continue;
    }

    if (!current) continue;

    if (/^total$/i.test(c1) || /^total$/i.test(c0)) continue;

    const idx = c0.trim();
    const title = cleanText(c1.trim().replace(/^"|"$/g, ''));
    if (/^\d+$/.test(idx) && title) {
      current.projects.push({
        listIndex: parseInt(idx, 10),
        title,
      });
    }
  }

  return zones.map((z, zi) => ({
    id: `zone-${zi + 1}`,
    name: z.name,
    theme: z.theme,
    projects: z.projects,
  }));
}

function cleanName(n) {
  if (!n) return '';
  return cleanText(n)
    .replace(/\s+/g, ' ')
    .replace(/,\s*$/, '')
    .trim();
}

/** One person segment from the "additional members" field (comma/newline separated). */
function parsePersonSegment(part) {
  if (!part) return '';
  let s = String(part).trim();
  s = s.replace(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/gi, '');
  s = s.replace(/\s*\([^)]*@[^)]*\)/g, '');
  s = s.replace(/\([^)]*\)/g, (block) => {
    const inner = block.slice(1, -1).trim();
    if (!inner) return '';
    if (/^[\w.-]+$/i.test(inner) && inner.length <= 20) return '';
    return block;
  });
  s = s.replace(/\(\s*$/g, '');
  return cleanName(s.replace(/\s+/g, ' '));
}

function splitAdditionalMembers(raw) {
  if (!raw) return [];
  return raw
    .split(/,|\n/)
    .map(parsePersonSegment)
    .filter(Boolean);
}

function fullName(first, last) {
  return cleanName(`${first ?? ''} ${last ?? ''}`);
}

function yesNoToBool(v) {
  const s = String(v ?? '')
    .trim()
    .toLowerCase();
  if (s === 'yes' || s === 'y' || s === 'true') return true;
  if (s === 'no' || s === 'n' || s === 'false') return false;
  return false;
}

function uniqNames(names) {
  const seen = new Set();
  const out = [];
  for (const n of names) {
    const key = n.toLowerCase();
    if (!key || seen.has(key)) continue;
    seen.add(key);
    out.push(n);
  }
  return out;
}

function buildTeamFromRow(row, col) {
  const team = [];
  const multi = String(row[col.multi] ?? '')
    .trim()
    .toLowerCase();

  const submitter = fullName(row[col.first], row[col.last]);
  if (submitter) team.push(submitter);

  const m1 = cleanName(row[col.m1]);
  const m2 = cleanName(row[col.m2]);

  if (multi === 'yes' || multi === 'y') {
    if (m1) team.push(m1);
    if (m2) team.push(m2);
  }

  const extraRaw = row[col.extra] ?? '';
  for (const part of splitAdditionalMembers(extraRaw)) {
    const nameOnly = cleanName(part.replace(/^\s*\(/, '').replace(/\)\s*$/, ''));
    if (nameOnly) team.push(nameOnly);
  }

  return uniqNames(team);
}

function parseFormResponses(content) {
  const rows = parse(content, {
    columns: true,
    skip_empty_lines: true,
    relax_column_count: true,
    relax_quotes: true,
    bom: true,
  });

  if (!rows.length) return { rows: [], col: null };

  const sampleKey = Object.keys(rows[0]);
  const pick = (pred) => sampleKey.find(pred);

  const col = {
    no: pick((k) => k.trim() === 'No'),
    first: pick((k) => k.trim().startsWith('First Name')),
    last: pick((k) => k.trim().startsWith('Last Name:')),
    multi: pick((k) => k.includes('multiple student')),
    m1: pick((k) => k.includes('Member 1 First and Last Name')),
    m2: pick((k) => k.includes('Member 2 First and Last Name')),
    extra: pick((k) => k.includes('Additional members who involved')),
    title: pick((k) => k.includes('Project Title:')),
    desc: pick((k) => k.includes('Short Description about the project')),
    supervisor: pick((k) => k.includes('supervisor') && k.includes('professor')),
    demo: pick((k) => k.includes('working demo as an app')),
    poster: pick((k) => k.trim().startsWith('Do you need a poster')),
  };

  const out = [];
  for (const row of rows) {
    const no = String(row[col.no] ?? '').trim();
    const title = String(row[col.title] ?? '').trim();
    if (/^total$/i.test(no)) continue;
    if (!title) continue;
    if (/^total$/i.test(title)) continue;
    if (/excluding duplicate/i.test(title)) continue;

    out.push({
      no,
      formTitle: cleanText(title),
      description: cleanText(String(row[col.desc] ?? '')),
      team: buildTeamFromRow(row, col),
      demo: yesNoToBool(row[col.demo]),
      poster: yesNoToBool(row[col.poster]),
      supervisor: cleanText(String(row[col.supervisor] ?? '')),
    });
  }

  return { rows: out, col };
}

function escapeCsvCell(v) {
  const s = v == null ? '' : String(v);
  if (/[",\n\r]/.test(s)) return `"${s.replace(/"/g, '""')}"`;
  return s;
}

function assignMatches(listProjectsFlat, formRows, threshold = 72) {
  const matches = new Map();
  const formToListScore = [];

  for (let li = 0; li < listProjectsFlat.length; li += 1) {
    const lp = listProjectsFlat[li];
    let best = -1;
    let bestFi = -1;
    for (let fi = 0; fi < formRows.length; fi += 1) {
      const sc = scoreTitleMatch(lp.title, formRows[fi].formTitle);
      if (sc > best) {
        best = sc;
        bestFi = fi;
      }
    }
    formToListScore.push({
      li,
      fi: bestFi,
      score: best,
    });
  }

  formToListScore.sort((a, b) => b.score - a.score);

  const usedForm = new Set();

  for (const item of formToListScore) {
    const { li, fi, score } = item;
    if (matches.has(li)) continue;
    if (score < threshold || fi < 0) continue;
    if (usedForm.has(fi)) continue;
    usedForm.add(fi);
    matches.set(li, { fi, score });
  }

  return { matches, usedForm };
}

function main() {
  if (!fs.existsSync(GROUPED_FILE) || !fs.existsSync(FORM_FILE)) {
    console.error('Missing data/*.csv files. Expected:');
    console.error(GROUPED_FILE);
    console.error(FORM_FILE);
    process.exit(1);
  }

  const groupedContent = readUtf8(GROUPED_FILE);
  const formContent = readUtf8(FORM_FILE);

  const zones = parseGroupedList(groupedContent);
  const { rows: formRows } = parseFormResponses(formContent);
  const posterContent = fs.existsSync(POSTER_FILE) ? readUtf8(POSTER_FILE) : '';
  const { rows: posterFormRows } = posterContent
    ? parseFormResponses(posterContent)
    : { rows: [] };

  const listProjectsFlat = [];
  for (const z of zones) {
    for (const p of z.projects) {
      listProjectsFlat.push({
        zoneId: z.id,
        zoneName: z.name,
        zoneTheme: z.theme,
        listIndex: p.listIndex,
        title: p.title,
      });
    }
  }

  const { matches, usedForm } = assignMatches(listProjectsFlat, formRows, 72);
  const { matches: posterMatches, usedForm: usedPosterForm } = assignMatches(
    listProjectsFlat,
    posterFormRows,
    68,
  );

  const csvLines = [
    [
      'zone_id',
      'zone_name',
      'zone_theme',
      'list_index',
      'title',
      'description',
      'team',
      'demo',
      'poster',
      'supervisor',
      'match_status',
      'demo_form_title',
      'demo_match_score',
      'poster_form_title',
      'poster_match_score',
      'match_note',
    ].join(','),
  ];

  const zonesOut = zones.map((z) => ({
    id: z.id,
    name: z.name,
    theme: z.theme,
    projects: [],
  }));
  const zoneById = Object.fromEntries(zonesOut.map((z) => [z.id, z]));

  const unmappedDemoForms = [];
  const unmappedPosterForms = [];

  for (let li = 0; li < listProjectsFlat.length; li += 1) {
    const lp = listProjectsFlat[li];
    const m = matches.get(li);
    const pm = posterMatches.get(li);
    const demoForm = m ? formRows[m.fi] : null;
    const posterForm = pm ? posterFormRows[pm.fi] : null;

    const onPosterSheet = Boolean(posterForm);
    const demo = demoForm?.demo ?? posterForm?.demo ?? false;
    const poster = onPosterSheet || Boolean(demoForm?.poster);

    let description = '';
    if (demoForm?.description) description = demoForm.description;
    else if (posterForm?.description) description = posterForm.description;

    let team = [];
    if (demoForm?.team?.length && posterForm?.team?.length) {
      team = uniqNames([...demoForm.team, ...posterForm.team]);
    } else if (demoForm?.team?.length) team = demoForm.team;
    else if (posterForm?.team?.length) team = posterForm.team;

    const supervisor = demoForm?.supervisor || posterForm?.supervisor || '';

    let matchStatus = 'list_only';
    if (demoForm && posterForm) matchStatus = 'matched_both';
    else if (demoForm) matchStatus = 'matched_demo';
    else if (posterForm) matchStatus = 'matched_poster';

    const demoTitle = demoForm ? demoForm.formTitle : '';
    const demoScore = m ? m.score : '';
    const posterTitle = posterForm ? posterForm.formTitle : '';
    const posterScore = pm ? pm.score : '';

    const notes = [];
    if (demoForm && normalizeTitle(lp.title) !== normalizeTitle(demoForm.formTitle)) {
      notes.push('fuzzy_demo_title');
    }
    if (posterForm && normalizeTitle(lp.title) !== normalizeTitle(posterForm.formTitle)) {
      notes.push('fuzzy_poster_title');
    }
    const note = notes.join(';');

    const pid = `p-${String(lp.listIndex).padStart(2, '0')}`;

    const teamCell = team.join(' | ');
    csvLines.push(
      [
        lp.zoneId,
        escapeCsvCell(lp.zoneName),
        escapeCsvCell(lp.zoneTheme),
        lp.listIndex,
        escapeCsvCell(lp.title),
        escapeCsvCell(description),
        escapeCsvCell(teamCell),
        demo ? 'true' : 'false',
        poster ? 'true' : 'false',
        escapeCsvCell(supervisor),
        matchStatus,
        escapeCsvCell(demoTitle),
        demoScore,
        escapeCsvCell(posterTitle),
        posterScore,
        escapeCsvCell(note),
      ].join(','),
    );

    zoneById[lp.zoneId].projects.push({
      id: pid,
      title: lp.title,
      description: description || 'Details coming soon.',
      team,
      demo,
      poster,
      supervisor: supervisor || undefined,
    });
  }

  for (let fi = 0; fi < formRows.length; fi += 1) {
    if (usedForm.has(fi)) continue;
    const f = formRows[fi];
    unmappedDemoForms.push(f);
    csvLines.push(
      [
        '',
        '',
        '',
        '',
        escapeCsvCell(f.formTitle),
        escapeCsvCell(f.description),
        escapeCsvCell(f.team.join(' | ')),
        f.demo ? 'true' : 'false',
        f.poster ? 'true' : 'false',
        escapeCsvCell(f.supervisor),
        'demo_form_only',
        escapeCsvCell(f.formTitle),
        '',
        '',
        '',
        escapeCsvCell('no_list_row'),
      ].join(','),
    );
  }

  for (let fi = 0; fi < posterFormRows.length; fi += 1) {
    if (usedPosterForm.has(fi)) continue;
    const f = posterFormRows[fi];
    unmappedPosterForms.push(f);
    csvLines.push(
      [
        '',
        '',
        '',
        '',
        escapeCsvCell(f.formTitle),
        escapeCsvCell(f.description),
        escapeCsvCell(f.team.join(' | ')),
        f.demo ? 'true' : 'false',
        'true',
        escapeCsvCell(f.supervisor),
        'poster_form_only',
        '',
        '',
        escapeCsvCell(f.formTitle),
        '',
        escapeCsvCell('no_list_row'),
      ].join(','),
    );
  }

  fs.mkdirSync(path.dirname(OUT_MERGED_CSV), { recursive: true });
  fs.mkdirSync(path.dirname(OUT_JSON), { recursive: true });

  fs.writeFileSync(OUT_MERGED_CSV, csvLines.join('\n'), 'utf8');
  fs.writeFileSync(OUT_JSON, `${JSON.stringify(zonesOut, null, 2)}\n`, 'utf8');

  const demoMatched = [...matches.keys()].length;
  const posterMatched = [...posterMatches.keys()].length;
  const fullyList = listProjectsFlat.length;
  console.log(
    `Wrote ${OUT_MERGED_CSV} and ${OUT_JSON} (demo sheet: ${demoMatched}/${fullyList} list rows; poster sheet: ${posterMatched}/${fullyList}; ${unmappedDemoForms.length} demo-only + ${unmappedPosterForms.length} poster-only rows appended).`,
  );
}

main();
