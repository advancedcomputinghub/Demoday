import { useRef, useEffect, useState } from 'react';
import { motion, useInView } from 'motion/react';
import { Calendar, MapPin, Clock, Menu, X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { SUBMISSION_DEADLINE_DATE } from '../constants/dates';

const teamImageModules = import.meta.glob<{ default: string }>('/public/team-pics/*.{jpg,jpeg,png}', { eager: true });

//const SUBMISSION_DEADLINE_DATE = new Date('2026-03-20T12:00:00'); // Mar 20, 2026 at noon

const normalizeNameForFilename = (name: string) => {
  const cleaned = name.replace(/^(Dr\.|Mr\.|Mrs\.|Ms\.|Prof\.|Professor)\s+/i, '').trim();
  return cleaned.toLowerCase();
};

const getTeamImagePath = (name: string): string | null => {
  const base = normalizeNameForFilename(name);
  const parts = base.split(/\s+/);
  const first = parts[0];
  const last = parts[parts.length - 1];
  const candidates = [
    base.replace(/\s+/g, '-'),
    base.replace(/\s+/g, '_'),
    base,
    `${first}-${last}`,
    `${first}_${last}`,
    first,
    last,
  ];
  for (const candidate of candidates) {
    for (const [path, module] of Object.entries(teamImageModules)) {
      if (path.toLowerCase().includes(candidate)) return module.default;
    }
  }
  return null;
};

const getInitials = (name: string): string => {
  const cleaned = name.replace(/^(Dr\.|Mr\.|Mrs\.|Ms\.|Prof\.|Professor)\s+/i, '').trim();
  const parts = cleaned.split(/\s+/);
  if (parts.length === 1) return parts[0].charAt(0).toUpperCase();
  return (parts[0].charAt(0) + parts[parts.length - 1].charAt(0)).toUpperCase();
};

const TEAM_MEMBERS_BASE = [
  {
    id: 1,
    name: 'Dr. Ziad Kobti',
    designation: 'Director, School of Computer Science',
    url: 'https://www.uwindsor.ca/science/computerscience/1060/dr-ziad',
  },
  {
    id: 2,
    name: 'Dr. Boubakeur Boufama',
    designation: 'Master of Applied Computing Chair',
    url: 'https://www.uwindsor.ca/science/computerscience/1059/dr-boubakeur-boufama',
  },
  {
    id: 3,
    name: 'Dr. Kalyani Selvarajah',
    designation: 'Demo Day Chair',
    url: 'https://www.uwindsor.ca/science/computerscience/242401/dr-kalyani-selvarajah',
  },
  {
    id: 4,
    name: 'Dr. Prashanth Cheluvasai Ranga',
    designation: 'Demo Day Co-Chair',
    url: 'https://www.uwindsor.ca/science/computerscience/242400/dr-prashanth-cheluvasai-ranga',
  },
  {
    id: 5,
    name: 'Dr. Olena Syrotkina',
    designation: 'Demo Day Project Selection Committee',
    url: 'https://www.uwindsor.ca/science/computerscience/318557/dr-olena-syrotkina',
  },
  {
    id: 6,
    name: 'Dr. Aznam Yacoub',
    designation: 'Demo Day Project Selection Committee',
    url: 'https://www.uwindsor.ca/science/computerscience/242402/dr-aznam-yacoub',
  },
  {
    id: 7,
    name: 'Dr. Shaoquan Jiang',
    designation: 'Demo Day Poster Presentation Committee',
    url: 'https://www.uwindsor.ca/science/computerscience/242398/dr-shaoquan-jiang',
  },
  { id: 8, name: 'Mrs. Katie Noonan', designation: 'MAC Program Secretary' },
  { id: 9, name: 'Mr. Rithish Ashwin Suresh Kumar', designation: 'Website Development', url: 'https://www.linkedin.com/in/rithish-ashwin',},
  { id: 10, name: 'Mr. Mohammad Faisal Alam', designation: 'Website Development' },
];

const TEAM_MEMBERS = TEAM_MEMBERS_BASE.map(member => ({
  ...member,
  image: getTeamImagePath(member.name)
}));

export default function Team() {
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const contentRef = useRef<HTMLDivElement>(null);
  const contentInView = useInView(contentRef, { once: true, amount: 0.1 });
  const showSelectedProjects = new Date() >= SUBMISSION_DEADLINE_DATE;

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.1, delayChildren: 0.1 } },
  };
  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6 } },
  };

  const goHome = (hash?: string) => {
    setMobileMenuOpen(false);
    if (hash) {
      const sectionId = hash.startsWith('#') ? hash.slice(1) : hash;
      navigate('/', { replace: true, state: { targetSection: sectionId } });
    } else {
      navigate('/', { replace: true });
    }
  };

  const navButtonClass = 'pb-0.5 border-b-2 transition-all duration-300 text-gray-400 hover:text-white hover:border-white/50 border-transparent hover:[text-shadow:0_0_12px_rgba(255,255,255,0.35),0_0_24px_rgba(192,132,252,0.4),0_0_36px_rgba(139,92,246,0.2)]';
  const navButtonActiveClass = 'pb-0.5 border-b-2 transition-all duration-300 text-white border-white/70 [text-shadow:0_0_12px_rgba(255,255,255,0.35),0_0_24px_rgba(192,132,252,0.4),0_0_36px_rgba(139,92,246,0.2)]';

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
              <button onClick={() => navigate('/selected-projects')} className={navButtonClass}>Selected Projects</button>
            ) : (
              <button onClick={() => goHome('#submit')} className={navButtonClass}>Apply</button>
            )}
            <button onClick={() => goHome('#attend')} className={navButtonClass}>Attend</button>
            <button onClick={() => goHome('#schedule')} className={navButtonClass}>Schedule</button>
            <button onClick={() => goHome('#faq')} className={navButtonClass}>FAQ</button>
            <button onClick={() => navigate('/team')} className={navButtonActiveClass}>Our Team</button>
          </div>

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
                  className="w-full text-left py-3 px-4 rounded-xl text-lg font-medium transition-all min-h-[48px] text-gray-400 hover:text-white hover:bg-white/5"
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
                className="w-full text-left py-3 px-4 rounded-xl text-lg font-medium transition-all min-h-[48px] text-white bg-white/10"
              >
                Our Team
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Our Team Section */}
      <main className="pt-24 pb-12 px-4 sm:px-6 md:pt-28 md:pb-20 md:px-6">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-10 md:mb-16" ref={contentRef}>
            <motion.span initial={{ opacity: 0 }} animate={contentInView ? { opacity: 1 } : { opacity: 0 }} transition={{ duration: 0.6 }} className="text-sm uppercase tracking-wider text-purple-400 font-medium">
              Our Team
            </motion.span>
            <motion.h2 initial={{ opacity: 0, y: 20 }} animate={contentInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }} transition={{ duration: 0.6, delay: 0.1 }} className="text-3xl md:text-5xl mt-3 md:mt-4">
              Meet the Team
            </motion.h2>
            <motion.p initial={{ opacity: 0, y: 20 }} animate={contentInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }} transition={{ duration: 0.6, delay: 0.2 }} className="text-gray-400 mt-6 max-w-2xl mx-auto">
              The dedicated faculty and staff making CS Demo Day 2026 possible
            </motion.p>
          </div>

          <motion.div className="space-y-10 md:space-y-14" variants={containerVariants} initial="hidden" animate={contentInView ? 'visible' : 'hidden'}>
            {/* Layer 1: Members 1-2 */}
            <div className="space-y-4">
              <div className="flex flex-wrap justify-center gap-8 md:gap-12">
                {TEAM_MEMBERS.slice(0, 2).map((member) => (
                <motion.div
                  key={member.id}
                  variants={itemVariants}
                  className="group flex flex-col items-center text-center w-56 md:w-64"
                >
                  {member.url ? (
                    <a
                      href={member.url}
                      target="_blank"
                      rel="noreferrer"
                      className="flex flex-col items-center text-center focus:outline-none focus-visible:ring-2 focus-visible:ring-purple-500/60 focus-visible:ring-offset-2 focus-visible:ring-offset-[#0a0a0f] rounded-xl"
                    >
                      <div className="w-32 h-32 md:w-40 md:h-40 mb-4 rounded-full overflow-hidden p-[3px] bg-gradient-to-br from-red-500/50 via-rose-500/50 to-orange-400/50 shadow-[0_0_24px_rgba(248,113,113,0.32)] group-hover:shadow-[0_0_32px_rgba(248,113,113,0.5)] transition-all duration-300 flex items-center justify-center team-avatar-pulse-red">
                        <div className="w-full h-full rounded-full overflow-hidden bg-[#0a0a0f]">
                          {member.image ? (
                            <img
                              src={member.image}
                              alt={member.name}
                              className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center bg-[#050509]">
                              <span className="text-xl md:text-2xl font-semibold tracking-wide text-purple-100">
                                {getInitials(member.name)}
                              </span>
                            </div>
                          )}
                        </div>
                      </div>
                      <h3 className="text-lg md:text-xl font-semibold text-white mb-1">{member.name}</h3>
                      <p className="text-sm md:text-base text-purple-200 font-medium">{member.designation}</p>
                    </a>
                  ) : (
                    <>
                      <div className="w-32 h-32 md:w-40 md:h-40 mb-4 rounded-full overflow-hidden p-[3px] bg-gradient-to-br from-red-500/50 via-rose-500/50 to-orange-400/50 shadow-[0_0_24px_rgba(248,113,113,0.32)] group-hover:shadow-[0_0_32px_rgba(248,113,113,0.5)] transition-all duration-300 flex items-center justify-center team-avatar-pulse-red">
                        <div className="w-full h-full rounded-full overflow-hidden bg-[#0a0a0f]">
                          {member.image ? (
                            <img
                              src={member.image}
                              alt={member.name}
                              className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center bg-[#050509]">
                              <span className="text-xl md:text-2xl font-semibold tracking-wide text-purple-100">
                                {getInitials(member.name)}
                              </span>
                            </div>
                          )}
                        </div>
                      </div>
                      <h3 className="text-lg md:text-xl font-semibold text-white mb-1">{member.name}</h3>
                      <p className="text-sm md:text-base text-purple-200 font-medium">{member.designation}</p>
                    </>
                  )}
                </motion.div>
                ))}
              </div>
            </div>

            {/* Layer 2: Members 3-4 */}
            <div className="space-y-4">
              <div className="flex flex-wrap justify-center gap-8 md:gap-12">
                {TEAM_MEMBERS.slice(2, 4).map((member) => (
                <motion.div
                  key={member.id}
                  variants={itemVariants}
                  className="group flex flex-col items-center text-center w-56 md:w-64"
                >
                  {member.url ? (
                    <a
                      href={member.url}
                      target="_blank"
                      rel="noreferrer"
                      className="flex flex-col items-center text-center focus:outline-none focus-visible:ring-2 focus-visible:ring-purple-500/60 focus-visible:ring-offset-2 focus-visible:ring-offset-[#0a0a0f] rounded-xl"
                    >
                      <div className="w-32 h-32 md:w-40 md:h-40 mb-4 rounded-full overflow-hidden p-[3px] bg-gradient-to-br from-purple-500/40 to-blue-500/40 shadow-[0_0_24px_rgba(139,92,246,0.28)] group-hover:shadow-[0_0_32px_rgba(139,92,246,0.42)] transition-all duration-300 flex items-center justify-center team-avatar-pulse-purple">
                        <div className="w-full h-full rounded-full overflow-hidden bg-[#0a0a0f]">
                          {member.image ? (
                            <img
                              src={member.image}
                              alt={member.name}
                              className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center bg-[#050509]">
                              <span className="text-xl md:text-2xl font-semibold tracking-wide text-purple-100">
                                {getInitials(member.name)}
                              </span>
                            </div>
                          )}
                        </div>
                      </div>
                      <h3 className="text-lg md:text-xl font-semibold text-white mb-1">{member.name}</h3>
                      <p className="text-sm md:text-base text-purple-200 font-medium">{member.designation}</p>
                    </a>
                  ) : (
                    <>
                      <div className="w-32 h-32 md:w-40 md:h-40 mb-4 rounded-full overflow-hidden p-[3px] bg-gradient-to-br from-purple-500/40 to-blue-500/40 shadow-[0_0_24px_rgba(139,92,246,0.28)] group-hover:shadow-[0_0_32px_rgba(139,92,246,0.42)] transition-all duration-300 flex items-center justify-center team-avatar-pulse-purple">
                        <div className="w-full h-full rounded-full overflow-hidden bg-[#0a0a0f]">
                          {member.image ? (
                            <img
                              src={member.image}
                              alt={member.name}
                              className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center bg-[#050509]">
                              <span className="text-xl md:text-2xl font-semibold tracking-wide text-purple-100">
                                {getInitials(member.name)}
                              </span>
                            </div>
                          )}
                        </div>
                      </div>
                      <h3 className="text-lg md:text-xl font-semibold text-white mb-1">{member.name}</h3>
                      <p className="text-sm md:text-base text-purple-200 font-medium">{member.designation}</p>
                    </>
                  )}
                </motion.div>
                ))}
              </div>
            </div>

            {/* Layer 3: Members 5-7 */}
            <div className="space-y-4">
              <div className="flex flex-wrap justify-center gap-8 md:gap-12">
                {TEAM_MEMBERS.slice(4, 7).map((member) => (
                  <motion.div
                    key={member.id}
                    variants={itemVariants}
                    className="group flex flex-col items-center text-center w-56 md:w-64"
                  >
                    {member.url ? (
                      <a
                        href={member.url}
                        target="_blank"
                        rel="noreferrer"
                        className="flex flex-col items-center text-center focus:outline-none focus-visible:ring-2 focus-visible:ring-purple-500/60 focus-visible:ring-offset-2 focus-visible:ring-offset-[#0a0a0f] rounded-xl"
                      >
                        <div className="w-32 h-32 md:w-40 md:h-40 mb-4 rounded-full overflow-hidden p-[3px] bg-gradient-to-br from-purple-500/40 to-blue-500/40 shadow-[0_0_24px_rgba(139,92,246,0.28)] group-hover:shadow-[0_0_32px_rgba(139,92,246,0.42)] transition-all duration-300 flex items-center justify-center team-avatar-pulse-purple">
                          <div className="w-full h-full rounded-full overflow-hidden bg-[#0a0a0f]">
                            {member.image ? (
                              <img
                                src={member.image}
                                alt={member.name}
                                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                              />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center bg-[#050509]">
                                <span className="text-xl md:text-2xl font-semibold tracking-wide text-purple-100">
                                  {getInitials(member.name)}
                                </span>
                              </div>
                            )}
                          </div>
                        </div>
                        <h3 className="text-lg md:text-xl font-semibold text-white mb-1">{member.name}</h3>
                        <p className="text-sm md:text-base text-purple-200 font-medium">{member.designation}</p>
                      </a>
                    ) : (
                      <>
                        <div className="w-32 h-32 md:w-40 md:h-40 mb-4 rounded-full overflow-hidden p-[3px] bg-gradient-to-br from-purple-500/40 to-blue-500/40 shadow-[0_0_24px_rgba(139,92,246,0.28)] group-hover:shadow-[0_0_32px_rgba(139,92,246,0.42)] transition-all duration-300 flex items-center justify-center team-avatar-pulse-purple">
                          <div className="w-full h-full rounded-full overflow-hidden bg-[#0a0a0f]">
                            {member.image ? (
                              <img
                                src={member.image}
                                alt={member.name}
                                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                              />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center bg-[#050509]">
                                <span className="text-xl md:text-2xl font-semibold tracking-wide text-purple-100">
                                  {getInitials(member.name)}
                                </span>
                              </div>
                            )}
                          </div>
                        </div>
                        <h3 className="text-lg md:text-xl font-semibold text-white mb-1">{member.name}</h3>
                        <p className="text-sm md:text-base text-purple-200 font-medium">{member.designation}</p>
                      </>
                    )}
                  </motion.div>
                ))}
              </div>
            </div>

            {/* Layer 4: Members 8-10 */}
            <div className="flex flex-wrap justify-center gap-8 md:gap-12">
              {TEAM_MEMBERS.slice(7, 10).map((member) => (
                <motion.div key={member.id} variants={itemVariants} className="group flex flex-col items-center text-center w-56 md:w-64">
                  {member.url ? (
                    <a
                      href={member.url}
                      target="_blank"
                      rel="noreferrer"
                      className="flex flex-col items-center text-center focus:outline-none focus-visible:ring-2 focus-visible:ring-purple-500/60 focus-visible:ring-offset-2 focus-visible:ring-offset-[#0a0a0f] rounded-xl"
                    >
                      <div className="w-32 h-32 md:w-40 md:h-40 mb-4 rounded-full overflow-hidden p-[3px] bg-gradient-to-br from-purple-500/40 to-blue-500/40 shadow-[0_0_24px_rgba(139,92,246,0.28)] group-hover:shadow-[0_0_32px_rgba(139,92,246,0.42)] transition-all duration-300 flex items-center justify-center team-avatar-pulse-purple">
                        <div className="w-full h-full rounded-full overflow-hidden bg-[#0a0a0f]">
                          {member.image ? <img src={member.image} alt={member.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300" /> : <div className="w-full h-full flex items-center justify-center bg-[#050509]"><span className="text-xl md:text-2xl font-semibold tracking-wide text-purple-100">{getInitials(member.name)}</span></div>}
                        </div>
                      </div>
                      <h3 className="text-lg md:text-xl font-semibold text-white mb-1">{member.name}</h3>
                      <p className="text-sm md:text-base text-purple-200 font-medium">{member.designation}</p>
                    </a>
                  ) : (
                    <>
                      <div className="w-32 h-32 md:w-40 md:h-40 mb-4 rounded-full overflow-hidden p-[3px] bg-gradient-to-br from-purple-500/40 to-blue-500/40 shadow-[0_0_24px_rgba(139,92,246,0.28)] group-hover:shadow-[0_0_32px_rgba(139,92,246,0.42)] transition-all duration-300 flex items-center justify-center team-avatar-pulse-purple">
                        <div className="w-full h-full rounded-full overflow-hidden bg-[#0a0a0f]">
                          {member.image ? <img src={member.image} alt={member.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300" /> : <div className="w-full h-full flex items-center justify-center bg-[#050509]"><span className="text-xl md:text-2xl font-semibold tracking-wide text-purple-100">{getInitials(member.name)}</span></div>}
                        </div>
                      </div>
                      <h3 className="text-lg md:text-xl font-semibold text-white mb-1">{member.name}</h3>
                      <p className="text-sm md:text-base text-purple-200 font-medium">{member.designation}</p>
                    </>
                  )}
                </motion.div>
              ))}
            </div>
          </motion.div>
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
              <p className="text-gray-400 leading-relaxed">Hosted by the School of Computer Science at the University of Windsor. Celebrating student innovation and excellence.</p>
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
                  <span>March 27, 2026</span>
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
            <p className="text-gray-400 text-sm">Submission deadline: <span className="text-white">March 20, 2026</span></p>
          </div>
        </div>
      </footer>
    </div>
  );
}