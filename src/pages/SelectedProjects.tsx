import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Calendar, MapPin, Clock, Menu, X } from 'lucide-react';
import { AnimatePresence, motion } from 'motion/react';
import { EVENT_DATE, SUBMISSION_DEADLINE_DATE } from '../constants/dates';
import zonesData from '../data/selected-projects.json';

//const SUBMISSION_DEADLINE_DATE = new Date('2026-03-20T12:00:00'); // Mar 20, 2026 at noon

export default function SelectedProjects() {
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const showSelectedProjects = new Date() >= SUBMISSION_DEADLINE_DATE;

  type Mode = 'projects' | 'posters';
  type SelectedProject = {
    id: string;
    title: string;
    description: string;
    team: string[];
    demo: boolean;
    poster: boolean;
    supervisor?: string;
  };
  type Zone = {
    id: string;
    name: string;
    theme: string;
    projects: SelectedProject[];
  };

  const ZONES: Zone[] = zonesData as Zone[];

  const [mode, setMode] = useState<Mode>('projects');
  const [activeZoneId, setActiveZoneId] = useState<string | null>(null);
  const [expandedProjectId, setExpandedProjectId] = useState<string | null>(null);
  const [zoneQuery, setZoneQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [pageDirection, setPageDirection] = useState<1 | -1>(1);
  const PAGE_SIZE = 5;

  useEffect(() => {
    // In step-based flow, user explicitly picks zone after choosing mode.
    setActiveZoneId(null);
    setExpandedProjectId(null);
    setZoneQuery('');
    setCurrentPage(1);
  }, [mode]);

  useEffect(() => {
    setZoneQuery('');
    setCurrentPage(1);
    setExpandedProjectId(null);
  }, [activeZoneId]);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const goHome = (hash?: string) => {
    setMobileMenuOpen(false);
    if (hash) {
      const sectionId = hash.startsWith('#') ? hash.slice(1) : hash;
      navigate('/', { replace: true, state: { targetSection: sectionId } });
    } else {
      navigate('/', { replace: true });
    }
  };

  const navButtonClass =
    'pb-0.5 border-b-2 transition-all duration-300 text-gray-400 hover:text-white hover:border-white/50 border-transparent hover:[text-shadow:0_0_12px_rgba(255,255,255,0.35),0_0_24px_rgba(192,132,252,0.4),0_0_36px_rgba(139,92,246,0.2)]';
  const navButtonActiveClass =
    'pb-0.5 border-b-2 transition-all duration-300 text-white border-white/70 [text-shadow:0_0_12px_rgba(255,255,255,0.35),0_0_24px_rgba(192,132,252,0.4),0_0_36px_rgba(139,92,246,0.2)]';

  const content =
    new Date() < SUBMISSION_DEADLINE_DATE ? (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="p-8 md:p-12 rounded-2xl bg-gradient-to-br from-white/5 to-white/[0.02] border border-white/10 text-center max-w-2xl">
          <p className="text-xl text-gray-400 mb-8">Selected projects will be put up soon.</p>
          <button
            onClick={() => goHome()}
            className="px-8 py-3 rounded-xl bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 transition-all duration-300 font-medium"
          >
            Back to Home
          </button>
        </div>
      </div>
    ) : (
      <div className="w-full max-w-6xl mx-auto">
        {/* Mode switch */}
        <div className="mb-8 md:mb-10 p-3 rounded-2xl bg-white/[0.02] shadow-[0_0_46px_rgba(139,92,246,0.24)]">
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => setMode('projects')}
              className={`px-4 py-2.5 rounded-xl border text-sm md:text-base font-medium transition-all duration-300 ${
                mode === 'projects'
                  ? 'border-white/25 bg-gradient-to-r from-purple-500/20 to-blue-500/20 text-white shadow-[0_0_26px_rgba(139,92,246,0.2)]'
                  : 'border-white/10 bg-transparent text-gray-400 hover:text-white hover:border-white/20'
              }`}
            >
              Projects View
            </button>
            <button
              type="button"
              onClick={() => setMode('posters')}
              className={`px-4 py-2.5 rounded-xl border text-sm md:text-base font-medium transition-all duration-300 ${
                mode === 'posters'
                  ? 'border-white/25 bg-gradient-to-r from-blue-500/20 to-purple-500/20 text-white shadow-[0_0_26px_rgba(59,130,246,0.2)]'
                  : 'border-white/10 bg-transparent text-gray-400 hover:text-white hover:border-white/20'
              }`}
            >
              Posters View
            </button>
          </div>
        </div>

        {(() => {
          const zoneCards = ZONES.map((zone) => {
            const count = zone.projects.filter((p) => (mode === 'projects' ? p.demo : p.poster)).length;
            return { zone, count };
          });
          const activeZone = activeZoneId ? ZONES.find((z) => z.id === activeZoneId) ?? null : null;
          const filtered = activeZone
            ? activeZone.projects.filter((p) => (mode === 'projects' ? p.demo : p.poster))
            : [];
          const normalizedQuery = zoneQuery.trim().toLowerCase();
          const searched = normalizedQuery
            ? filtered.filter((p) => {
                const haystack = [p.title, ...p.team, p.description, p.supervisor ?? '']
                  .join(' ')
                  .toLowerCase();
                return haystack.includes(normalizedQuery);
              })
            : filtered;
          searched.sort((a, b) => a.title.localeCompare(b.title, undefined, { sensitivity: 'base' }));
          const totalPages = Math.max(1, Math.ceil(searched.length / PAGE_SIZE));
          const clampedPage = Math.min(currentPage, totalPages);
          const pageStart = (clampedPage - 1) * PAGE_SIZE;
          const pageItems = searched.slice(pageStart, pageStart + PAGE_SIZE);
          const hasPrev = clampedPage > 1;
          const hasNext = clampedPage < totalPages;

          return (
            <div className="space-y-6">
              <AnimatePresence mode="wait" initial={false}>
                {!activeZone ? (
                  <motion.section
                    key={`zone-select-${mode}`}
                    initial={{ opacity: 0, x: 24 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -24 }}
                    transition={{ duration: 0.28, ease: 'easeOut' }}
                    className="rounded-2xl bg-white/[0.02] p-4 md:p-5 shadow-[0_0_42px_rgba(59,130,246,0.2)]"
                  >
                    <div className="text-xs uppercase tracking-wider text-blue-300/90 mb-4">Select Zone</div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {zoneCards.map(({ zone, count }) => (
                        <button
                          key={zone.id}
                          type="button"
                          onClick={() => {
                            if (count > 0) {
                              setActiveZoneId(zone.id);
                              setExpandedProjectId(null);
                            }
                          }}
                          disabled={count === 0}
                          className={`text-left rounded-xl border p-4 transition-all duration-300 ${
                            activeZoneId === zone.id
                              ? 'border-white/30 bg-white/10 shadow-[0_0_30px_rgba(139,92,246,0.28)]'
                              : 'border-white/10 bg-white/[0.015] hover:border-white/30 hover:shadow-[0_0_34px_rgba(139,92,246,0.34)] hover:animate-[pulse_1.5s_ease-in-out_infinite]'
                          } ${count === 0 ? 'opacity-40 cursor-not-allowed' : ''}`}
                        >
                          <div className="text-white font-medium">{zone.name}</div>
                          <div className="text-gray-400 text-sm mt-1">
                            {count} {mode === 'projects' ? 'project' : 'poster'}{count === 1 ? '' : 's'}
                          </div>
                        </button>
                      ))}
                    </div>
                  </motion.section>
                ) : (
                  <motion.section
                    key={`zone-content-${activeZone.id}-${mode}`}
                    initial={{ opacity: 0, x: 24 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -24 }}
                    transition={{ duration: 0.28, ease: 'easeOut' }}
                    className="rounded-2xl bg-white/[0.02] p-4 md:p-6 shadow-[0_0_46px_rgba(139,92,246,0.24)]"
                  >
                    <div className="mb-6 pb-4 border-b border-white/10 flex items-start justify-between gap-4">
                      <div>
                        <div className="text-sm uppercase tracking-wider text-purple-400 font-medium">{activeZone.name}</div>
                        <div className="text-gray-400 mt-2">{activeZone.theme}</div>
                      </div>
                      <button
                        type="button"
                        onClick={() => {
                          setActiveZoneId(null);
                          setExpandedProjectId(null);
                        }}
                        className="px-3 py-1.5 rounded-lg border border-white/20 text-sm text-gray-300 hover:text-white hover:border-white/40 hover:shadow-[0_0_22px_rgba(139,92,246,0.34)] transition-all"
                      >
                        Back to zones
                      </button>
                    </div>

                    <div className="mb-5">
                      <input
                        type="text"
                        value={zoneQuery}
                        onChange={(e) => {
                          setZoneQuery(e.target.value);
                          setCurrentPage(1);
                        }}
                        placeholder={`Search ${mode} in this zone`}
                        className="w-full rounded-xl border border-white/15 bg-white/[0.04] px-4 py-2.5 text-sm text-white placeholder:text-gray-500 outline-none focus-visible:ring-2 focus-visible:ring-purple-500/60 focus-visible:shadow-[0_0_28px_rgba(139,92,246,0.34)]"
                      />
                    </div>

                    {searched.length === 0 ? (
                      <div className="p-8 rounded-2xl border border-white/10 bg-white/[0.02] text-center text-gray-400">
                        No {mode} match this zone/filter yet.
                      </div>
                    ) : (
                      <div className="space-y-5">
                        <div className="flex items-center justify-between text-xs text-gray-500">
                          <span>
                            Showing {pageStart + 1}-{Math.min(pageStart + pageItems.length, searched.length)} of {searched.length} {mode}
                          </span>
                          <span className="text-purple-300/80">Program View</span>
                        </div>
                        <AnimatePresence mode="wait" initial={false}>
                          <motion.div
                            key={`page-${clampedPage}-${mode}-${activeZone.id}`}
                            initial={{ opacity: 0, x: pageDirection === 1 ? 22 : -22 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: pageDirection === 1 ? -22 : 22 }}
                            transition={{ duration: 0.24, ease: 'easeOut' }}
                            className="space-y-4"
                          >
                            {pageItems.map((p) => {
                              const expanded = expandedProjectId === p.id;
                              return (
                                <article key={p.id} className="group flex gap-3 md:gap-4 items-start">
                                  <div className="flex flex-col items-center shrink-0 mt-1">
                                    <div className="w-3 h-3 rounded-full bg-purple-400 ring-4 ring-purple-400/20 transition-all group-hover:scale-110 group-hover:ring-purple-400/30" />
                                    <div className="w-0.5 h-full min-h-[2.5rem] bg-gradient-to-b from-white/20 to-transparent mt-2" />
                                  </div>
                                  <button
                                    type="button"
                                    onClick={() => setExpandedProjectId((cur) => (cur === p.id ? null : p.id))}
                                    aria-expanded={expanded}
                                    className={`flex-1 text-left rounded-2xl border bg-gradient-to-br from-white/[0.04] to-white/[0.015] p-4 md:p-5 transition-all duration-300 ${
                                      expanded
                                        ? 'border-white/25 shadow-[0_0_28px_rgba(139,92,246,0.24)]'
                                        : 'border-white/10 group-hover:border-white/20 group-hover:shadow-[0_0_24px_rgba(139,92,246,0.18)]'
                                    }`}
                                  >
                                    <div className="flex items-start justify-between gap-3">
                                      <h3 className="text-base md:text-lg font-semibold text-white leading-snug">{p.title}</h3>
                                      <div className="flex gap-2 shrink-0">
                                        {p.demo && (
                                          <span className="px-2.5 py-0.5 rounded-full text-xs bg-blue-500/10 text-blue-300 border border-blue-500/20">
                                            Demo
                                          </span>
                                        )}
                                        {p.poster && (
                                          <span className="px-2.5 py-0.5 rounded-full text-xs bg-purple-500/10 text-purple-300 border border-purple-500/20">
                                            Poster
                                          </span>
                                        )}
                                      </div>
                                    </div>

                                    <p className="mt-2.5 text-sm text-gray-400">
                                      {p.team.length > 0
                                        ? `Team: ${expanded || p.team.length <= 3 ? p.team.join(', ') : `${p.team.slice(0, 2).join(', ')} +${p.team.length - 2}`}`
                                        : 'Team: TBA'}
                                    </p>
                                    {p.supervisor ? (
                                      <p className="mt-1.5 text-sm text-gray-500">Supervisor: {p.supervisor}</p>
                                    ) : null}

                                    <div className="mt-3 text-gray-400 text-sm leading-relaxed">
                                      <div className={expanded ? '' : 'max-h-12 overflow-hidden'}>{p.description}</div>
                                    </div>
                                    <p className="mt-3 text-xs text-purple-300/80">{expanded ? 'Show less' : 'Read more'}</p>
                                  </button>
                                </article>
                              );
                            })}
                          </motion.div>
                        </AnimatePresence>
                        {totalPages > 1 && (
                          <div className="flex items-center justify-center gap-2 md:gap-3 pt-1 flex-wrap">
                            <button
                              type="button"
                              onClick={() => {
                                if (!hasPrev) return;
                                setPageDirection(-1);
                                setCurrentPage((p) => Math.max(1, p - 1));
                              }}
                              disabled={!hasPrev}
                              className={`px-3 md:px-4 py-2 rounded-xl border text-sm transition-all ${
                                hasPrev
                                  ? 'border-white/20 bg-white/[0.04] text-gray-300 hover:text-white hover:border-white/40 hover:shadow-[0_0_24px_rgba(139,92,246,0.34)]'
                                  : 'border-white/10 bg-white/[0.02] text-gray-600 cursor-not-allowed'
                              }`}
                            >
                              Prev
                            </button>

                            <div className="hidden md:flex items-center gap-2">
                              {Array.from({ length: totalPages }, (_, idx) => idx + 1).map((pageNum) => (
                                <button
                                  key={pageNum}
                                  type="button"
                                  onClick={() => {
                                    if (pageNum === clampedPage) return;
                                    setPageDirection(pageNum > clampedPage ? 1 : -1);
                                    setCurrentPage(pageNum);
                                  }}
                                  className={`w-9 h-9 rounded-lg border text-sm transition-all ${
                                    pageNum === clampedPage
                                      ? 'border-white/25 bg-white/10 text-white shadow-[0_0_18px_rgba(139,92,246,0.22)]'
                                      : 'border-white/10 bg-white/[0.03] text-gray-400 hover:text-white hover:border-white/35 hover:shadow-[0_0_20px_rgba(139,92,246,0.28)]'
                                  }`}
                                  aria-label={`Go to page ${pageNum}`}
                                  aria-current={pageNum === clampedPage ? 'page' : undefined}
                                >
                                  {pageNum}
                                </button>
                              ))}
                            </div>

                            <span className="md:hidden text-xs text-gray-500 min-w-[54px] text-center">
                              {clampedPage}/{totalPages}
                            </span>
                            <span className="hidden md:inline text-xs text-gray-500">
                              Page {clampedPage} of {totalPages}
                            </span>

                            <button
                              type="button"
                              onClick={() => {
                                if (!hasNext) return;
                                setPageDirection(1);
                                setCurrentPage((p) => Math.min(totalPages, p + 1));
                              }}
                              disabled={!hasNext}
                              className={`px-3 md:px-4 py-2 rounded-xl border text-sm transition-all ${
                                hasNext
                                  ? 'border-white/20 bg-white/[0.04] text-gray-300 hover:text-white hover:border-white/40 hover:shadow-[0_0_24px_rgba(139,92,246,0.34)]'
                                  : 'border-white/10 bg-white/[0.02] text-gray-600 cursor-not-allowed'
                              }`}
                            >
                              Next
                            </button>
                          </div>
                        )}
                      </div>
                    )}
                  </motion.section>
                )}
              </AnimatePresence>
            </div>
          );
        })()}
      </div>
    );

  return (
    <div className="min-h-screen bg-[#0a0a0f] text-white">
      {/* Navigation */}
      <nav className="fixed top-0 w-full z-50 bg-[#0a0a0f]/80 backdrop-blur-xl border-b border-white/5">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3 md:py-4 flex items-center justify-between">
          <button
            type="button"
            onClick={() => goHome()}
            className="flex items-center gap-3 text-left cursor-pointer transition-opacity hover:opacity-90 focus:outline-none focus-visible:ring-2 focus-visible:ring-purple-500/50 focus-visible:ring-offset-2 focus-visible:ring-offset-[#0a0a0f] rounded-lg"
            aria-label="Back to home"
          >
            <img src={`${import.meta.env.BASE_URL}uw-logo-shield.png`} alt="" className="h-10 w-10 shrink-0 object-contain" />
            <div className="flex flex-col">
              <span className="font-semibold text-lg leading-tight">CS Demo Day</span>
              <span className="text-xs text-gray-400">University of Windsor</span>
            </div>
          </button>

          {/* Desktop nav */}
          <div className="hidden md:flex items-center gap-8">
            <button onClick={() => goHome('#about')} className={navButtonClass}>About</button>
            <button onClick={() => goHome('#gallery')} className={navButtonClass}>Gallery</button>
            {showSelectedProjects ? (
              <button onClick={() => navigate('/selected-projects')} className={navButtonActiveClass}>
                Selected Projects
              </button>
            ) : (
              <button onClick={() => goHome('#submit')} className={navButtonClass}>Apply</button>
            )}
            <button onClick={() => goHome('#attend')} className={navButtonClass}>Attend</button>
            <button onClick={() => goHome('#schedule')} className={navButtonClass}>Schedule</button>
            <button onClick={() => goHome('#faq')} className={navButtonClass}>FAQ</button>
            <button onClick={() => navigate('/team')} className={navButtonClass}>Our Team</button>
          </div>

          {/* Mobile hamburger */}
          <button
            type="button"
            onClick={() => setMobileMenuOpen((o) => !o)}
            className="md:hidden p-2 rounded-lg text-white/80 hover:text-white hover:bg-white/10 transition-colors min-h-[44px] min-w-[44px] flex items-center justify-center"
            aria-label={mobileMenuOpen ? 'Close menu' : 'Open menu'}
            aria-expanded={mobileMenuOpen}
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </nav>

      {/* Mobile menu */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-40 bg-black/60 md:hidden" aria-hidden={!mobileMenuOpen}>
          <div className="absolute inset-x-0 top-[56px] bg-[#050509] border-b border-white/10 shadow-2xl">
            <div className="max-w-7xl mx-auto px-4 py-4 space-y-1">
              {[
                { id: '#about', label: 'About' },
                { id: '#gallery', label: 'Gallery' },
                { id: '#attend', label: 'Attend' },
                { id: '#schedule', label: 'Schedule' },
                { id: '#faq', label: 'FAQ' },
              ].map(({ id, label }) => (
                <button
                  key={id}
                  onClick={() => goHome(id)}
                  className="w-full text-left py-3 px-4 rounded-xl text-lg font-medium transition-all min-h-[48px] text-gray-400 hover:text-white hover:bg-white/5"
                >
                  {label}
                </button>
              ))}
              {showSelectedProjects ? (
                <button
                  onClick={() => { setMobileMenuOpen(false); navigate('/selected-projects'); }}
                  className="w-full text-left py-3 px-4 rounded-xl text-lg font-medium transition-all min-h-[48px] text-white bg-white/10"
                >
                  Selected Projects
                </button>
              ) : (
                <button
                  onClick={() => goHome('#submit')}
                  className="w-full text-left py-3 px-4 rounded-xl text-lg font-medium transition-all min-h-[48px] text-gray-400 hover:text-white hover:bg-white/5"
                >
                  Apply
                </button>
              )}
              <button
                onClick={() => { setMobileMenuOpen(false); navigate('/team'); }}
                className="w-full text-left py-3 px-4 rounded-xl text-lg font-medium transition-all min-h-[48px] text-gray-400 hover:text-white hover:bg-white/5"
              >
                Our Team
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Main Content */}
      <main className="pt-24 pb-12 px-4 sm:px-6 md:pt-32 md:pb-20 md:px-6">
        <div className="max-w-4xl mx-auto w-full">
          <div className="text-center mb-12 md:mb-16">
            <span className="text-xs md:text-sm uppercase tracking-wider text-purple-400 font-medium">Demo Day</span>
            <h1 className="text-4xl md:text-6xl mt-4 md:mt-6 mb-6">
              <span className="bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent">
                Selected Projects
              </span>
            </h1>
            <p className="text-lg md:text-xl text-gray-400">A curated showcase of our students’ top shortlisted projects.</p>
          </div>
          {content}
        </div>
      </main>

      {/* Footer */}
      <footer id="footer" className="border-t border-white/10 py-8 px-4 sm:px-6 md:py-12 md:px-6">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-3 gap-8 md:gap-12 mb-8 md:mb-12">
            <div>
              <div className="flex items-center gap-3 mb-4">
                <img src={`${import.meta.env.BASE_URL}uw-logo-shield.png`} alt="University of Windsor" className="h-10 w-10 shrink-0 object-contain" />
                <div className="flex flex-col">
                  <span className="font-semibold text-lg leading-tight">CS Demo Day</span>
                  <span className="text-xs text-gray-400">University of Windsor</span>
                </div>
              </div>
              <p className="text-gray-400 leading-relaxed">
                Hosted by the School of Computer Science at the University of Windsor. Celebrating student innovation and excellence.
              </p>
            </div>
            <div>
              <h3 className="font-medium mb-4">Quick Links</h3>
              <div className="space-y-2">
                <button onClick={() => goHome('#about')} className="block text-gray-400 hover:text-white transition-all duration-200 hover:[text-shadow:0_0_12px_rgba(255,255,255,0.35),0_0_24px_rgba(192,132,252,0.4),0_0_36px_rgba(139,92,246,0.2)]">About</button>
                {showSelectedProjects ? (
                  <button onClick={() => navigate('/selected-projects')} className="block text-gray-400 hover:text-white transition-all duration-200 hover:[text-shadow:0_0_12px_rgba(255,255,255,0.35),0_0_24px_rgba(192,132,252,0.4),0_0_36px_rgba(139,92,246,0.2)]">Selected Projects</button>
                ) : (
                  <button onClick={() => goHome('#submit')} className="block text-gray-400 hover:text-white transition-all duration-200 hover:[text-shadow:0_0_12px_rgba(255,255,255,0.35),0_0_24px_rgba(192,132,252,0.4),0_0_36px_rgba(139,92,246,0.2)]">Apply</button>
                )}
                <button onClick={() => goHome('#attend')} className="block text-gray-400 hover:text-white transition-all duration-200 hover:[text-shadow:0_0_12px_rgba(255,255,255,0.35),0_0_24px_rgba(192,132,252,0.4),0_0_36px_rgba(139,92,246,0.2)]">Attend</button>
                <button onClick={() => goHome('#schedule')} className="block text-gray-400 hover:text-white transition-all duration-200 hover:[text-shadow:0_0_12px_rgba(255,255,255,0.35),0_0_24px_rgba(192,132,252,0.4),0_0_36px_rgba(139,92,246,0.2)]">Schedule</button>
                <button onClick={() => goHome('#faq')} className="block text-gray-400 hover:text-white transition-all duration-200 hover:[text-shadow:0_0_12px_rgba(255,255,255,0.35),0_0_24px_rgba(192,132,252,0.4),0_0_36px_rgba(139,92,246,0.2)]">FAQ</button>
                <button onClick={() => navigate('/team')} className="block text-gray-400 hover:text-white transition-all duration-200 hover:[text-shadow:0_0_12px_rgba(255,255,255,0.35),0_0_24px_rgba(192,132,252,0.4),0_0_36px_rgba(139,92,246,0.2)]">Our Team</button>
              </div>
            </div>
            <div>
              <h3 className="font-medium mb-4">Event Details</h3>
              <div className="space-y-3 text-gray-400">
                <div className="flex items-start gap-2">
                  <Calendar className="w-5 h-5 text-purple-400 mt-0.5 flex-shrink-0" />
                  <span>{EVENT_DATE.toDateString()}</span>
                </div>
                <div className="flex items-start gap-1.5">
                  <MapPin className="w-5 h-5 text-blue-400 mt-0.5 flex-shrink-0" />
                  <span>Advanced Computing Hub, University of Windsor</span>
                </div>
                <div className="flex items-start gap-2">
                  <Clock className="w-5 h-5 text-purple-400 mt-0.5 flex-shrink-0" />
                  <span>9:30 AM – 12:30 PM</span>
                </div>
              </div>
            </div>
          </div>
          <div className="pt-8 border-t border-white/10 flex flex-col md:flex-row items-center justify-between gap-4">
            <p className="text-gray-400 text-sm">© 2026 School of Computer Science, University of Windsor. All rights reserved.</p>
            <p className="text-gray-400 text-sm">Submission deadline: <span className="text-white">{SUBMISSION_DEADLINE_DATE.toDateString()}</span></p>
          </div>
        </div>
      </footer>
    </div>
  );
}