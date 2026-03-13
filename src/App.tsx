import { Calendar, MapPin, Clock, Users, Lightbulb, Trophy, CalendarCheck, ChevronDown, Menu, X } from 'lucide-react';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from './components/ui/accordion';
import { Carousel } from './components/ui/carousel';
import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence, useInView } from 'motion/react';
import { useNavigate } from 'react-router-dom';

const SECTION_IDS = ['hero', 'about', 'gallery', 'submit', 'attend', 'schedule', 'faq'] as const;

const scheduleStaggerVariants = { hidden: {}, visible: { transition: { staggerChildren: 0.065, delayChildren: 0.12 } } };
const scheduleItemVariants = { hidden: { opacity: 0, y: 16 }, visible: { opacity: 1, y: 0, transition: { duration: 0.4 } } };

const PARTICIPANT_REGISTRATION_URL = 'https://docs.google.com/forms/d/e/1FAIpQLSelqknwzF-ht4gNg1FALEAf7pL-A8gUeTTS9CnCIv5bBvr4nQ/viewform';
const PROJECT_SUBMISSION_URL = 'https://docs.google.com/forms/d/e/1FAIpQLSevBxky8AILviHbGyK3XLmtiOqw8ddW8tQ0AIy7ZLS1MInYBg/viewform';

// This just takes the names and appends it to the path, so to add new images you can just drop them in the folder and name them in the format "1.jpg", "2.jpg", etc. for correct ordering. Supported formats are jpg and jpeg.
const imageModules = import.meta.glob<{ default: string }>('/public/prev-demoday-images/*.{jpg,jpeg}', { eager: true });
const CAROUSEL_IMAGES = Object.entries(imageModules).map(([path, module], index) => ({
  src: module.default,
  alt: `${index + 1}`,
})).sort((a, b) => {
  const numA = parseInt(a.alt);
  const numB = parseInt(b.alt);
  return numA - numB;
});

// Load team member images from /public/team-pics/
const teamImageModules = import.meta.glob<{ default: string }>('/public/team-pics/*.{jpg,jpeg,png}', { eager: true });

const getTeamImagePath = (name: string): string => {
  // Convert name to possible filename formats
  // Remove common titles/prefixes first
  let cleanedName = name.toLowerCase().replace(/^(dr\.|mr\.|mrs\.|ms\.|prof\.|professor)\s+/i, '');
  const nameParts = cleanedName.split(/\s+/);
  const firstNameOnly = nameParts[0];
  const lastNameOnly = nameParts[nameParts.length - 1];
  const firstAndLast = `${nameParts[0]}-${nameParts[nameParts.length - 1]}`;
  const firstAndLastUnderscore = `${nameParts[0]}_${nameParts[nameParts.length - 1]}`;
  
  const nameFormats = [
    name.toLowerCase().replace(/\s+/g, '-'),
    name.toLowerCase().replace(/\s+/g, '_'),
    name.toLowerCase(),
    firstAndLast,
    firstAndLastUnderscore,
    firstNameOnly,
    lastNameOnly,
  ];
  
  for (const format of nameFormats) {
    for (const [path, module] of Object.entries(teamImageModules)) {
      if (path.toLowerCase().includes(format)) {
        return module.default;
      }
    }
  }
  
  // Fallback to placeholder
  return `${import.meta.env.BASE_URL}team-placeholder.jpg`;
};

const EVENT_DATE = new Date('2026-03-27T10:00:00');
const EVENT_END_DATE = new Date('2026-03-27T12:30:00'); // 12:30 PM

const TEAM_MEMBERS_BASE = [
  { id: 1, name: 'Dr. Ziad Kobti', designation: 'Director, School of Computer Science' },
  { id: 2, name: 'Dr. Boubakeur Boufama', designation: 'Master of Applied Computing Chair' },
  { id: 3, name: 'Dr. Kalyani Selvarajah', designation: 'Demo Day Chair' },
  { id: 4, name: 'Dr. Prashanth Cheluvasai Ranga', designation: 'Demo Day Co-Chair' },
  { id: 5, name: 'Dr. Olena Syrotkina', designation: 'Demo Day Project Selection Committee' },
  { id: 6, name: 'Dr. Aznam Yacoub', designation: 'Demo Day Project Selection Committee' },
  { id: 7, name: 'Dr. Shaoquan Jiang', designation: 'Demo Day Poster Presentation Committee' },
  { id: 8, name: 'Mrs. Katie Noonan', designation: 'MAC Program Secretary' },
  { id: 9, name: 'Mr. Rithish Ashwin Suresh Kumar', designation: 'Website Development' },
  { id: 10, name: 'Mr. Mohammad Faisal Alam', designation: 'Website Development' },
];

const TEAM_MEMBERS = TEAM_MEMBERS_BASE.map(member => ({
  ...member,
  image: getTeamImagePath(member.name)
}));

// Set to true to test: event "starts" in 5s, "ends" in 20s. Set back to false when done.
const TEST_COUNTDOWN = false;
const EVENT_DATE_TEST = (() => { const d = new Date(); d.setSeconds(d.getSeconds() + 5); return d; })();
const EVENT_END_DATE_TEST = (() => { const d = new Date(); d.setSeconds(d.getSeconds() + 20); return d; })();

type CountdownState =
  | { status: 'countdown'; days: number; hours: number; minutes: number; seconds: number }
  | { status: 'live' }
  | { status: 'ended' };

function getCountdown(): CountdownState {
  const now = new Date();
  const startAt = TEST_COUNTDOWN ? EVENT_DATE_TEST : EVENT_DATE;
  const endAt = TEST_COUNTDOWN ? EVENT_END_DATE_TEST : EVENT_END_DATE;
  if (now >= endAt) return { status: 'ended' };
  if (now >= startAt) return { status: 'live' };
  const diff = startAt.getTime() - now.getTime();
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
  const seconds = Math.floor((diff % (1000 * 60)) / 1000);
  return { status: 'countdown', days, hours, minutes, seconds };
}

export default function App() {
  const [openFaq, setOpenFaq] = useState<string>('');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [heroStage, setHeroStage] = useState<1 | 2>(1);
  const [activeSectionIndex, setActiveSectionIndex] = useState(0);
  const [countdown, setCountdown] = useState<CountdownState>(getCountdown);
  const scrollContainerRef = useRef<HTMLElement>(null);
  const scheduleRef = useRef<HTMLDivElement>(null);
  const scheduleInView = useInView(scheduleRef, { once: true, amount: 0.05 });
  const navigate = useNavigate();

  useEffect(() => {
    const toDemoDay = setTimeout(() => setHeroStage(2), 1300);
    return () => clearTimeout(toDemoDay);
  }, []);

  useEffect(() => {
    setCountdown(getCountdown());
    const interval = setInterval(() => setCountdown(getCountdown()), 1000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const container = scrollContainerRef.current;
    if (!container) return;

    const elements = SECTION_IDS.map((id) => document.getElementById(id)).filter(Boolean) as HTMLElement[];
    const observer = new IntersectionObserver(
      (entries) => {
        const intersecting = entries.filter((e) => e.isIntersecting);
        if (intersecting.length === 0) return;
        const byRatio = [...intersecting].sort((a, b) => b.intersectionRatio - a.intersectionRatio);
        const top = byRatio[0]?.target;
        if (!top?.id) return;
        const idx = SECTION_IDS.indexOf(top.id as (typeof SECTION_IDS)[number]);
        if (idx !== -1) setActiveSectionIndex(idx);
      },
      { root: container, rootMargin: '-20% 0px -20% 0px', threshold: 0 }
    );

    elements.forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, []);

  const scrollToSection = (id: string) => {
    setMobileMenuOpen(false);
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  const scrollToNextSection = () => {
    const next = activeSectionIndex + 1;
    if (next < SECTION_IDS.length) scrollToSection(SECTION_IDS[next]);
  };

  return (
    <div className="min-h-screen bg-[#0a0a0f] text-white">
      {/* Navigation */}
      <nav className="fixed top-0 w-full z-50 bg-[#0a0a0f]/80 backdrop-blur-xl border-b border-white/5">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3 md:py-4 flex items-center justify-between">
          <button
            type="button"
            onClick={() => scrollToSection('hero')}
            className="flex items-center gap-3 text-left cursor-pointer transition-opacity hover:opacity-90 focus:outline-none focus-visible:ring-2 focus-visible:ring-purple-500/50 focus-visible:ring-offset-2 focus-visible:ring-offset-[#0a0a0f] rounded-lg"
            aria-label="Back to top"
          >
            <img src={`${import.meta.env.BASE_URL}uw-logo-shield.png`} alt="" className="h-10 w-10 shrink-0 object-contain" />
            <div className="flex flex-col">
              <span className="font-semibold text-lg leading-tight">CS Demo Day</span>
              <span className="text-xs text-gray-400">University of Windsor</span>
            </div>
          </button>
          <div className="hidden md:flex items-center gap-8">
            <button
              onClick={() => scrollToSection('about')}
              className={`pb-0.5 border-b-2 transition-all duration-300 ${
                activeSectionIndex === 1
                  ? 'text-white border-white/70 [text-shadow:0_0_12px_rgba(255,255,255,0.35),0_0_24px_rgba(192,132,252,0.4),0_0_36px_rgba(139,92,246,0.2)]'
                  : 'text-gray-400 hover:text-white hover:border-white/50 border-transparent hover:[text-shadow:0_0_12px_rgba(255,255,255,0.35),0_0_24px_rgba(192,132,252,0.4),0_0_36px_rgba(139,92,246,0.2)]'
              }`}
            >
              About
            </button>
            <button
              onClick={() => scrollToSection('gallery')}
              className={`pb-0.5 border-b-2 transition-all duration-300 ${
                activeSectionIndex === 2
                  ? 'text-white border-white/70 [text-shadow:0_0_12px_rgba(255,255,255,0.35),0_0_24px_rgba(192,132,252,0.4),0_0_36px_rgba(139,92,246,0.2)]'
                  : 'text-gray-400 hover:text-white hover:border-white/50 border-transparent hover:[text-shadow:0_0_12px_rgba(255,255,255,0.35),0_0_24px_rgba(192,132,252,0.4),0_0_36px_rgba(139,92,246,0.2)]'
              }`}
            >
              Gallery
            </button>
            <button
              onClick={() => scrollToSection('submit')}
              className={`pb-0.5 border-b-2 transition-all duration-300 ${
                activeSectionIndex === 3
                  ? 'text-white border-white/70 [text-shadow:0_0_12px_rgba(255,255,255,0.35),0_0_24px_rgba(192,132,252,0.4),0_0_36px_rgba(139,92,246,0.2)]'
                  : 'text-gray-400 hover:text-white hover:border-white/50 border-transparent hover:[text-shadow:0_0_12px_rgba(255,255,255,0.35),0_0_24px_rgba(192,132,252,0.4),0_0_36px_rgba(139,92,246,0.2)]'
              }`}
            >
              Apply
            </button>
            <button
              onClick={() => scrollToSection('attend')}
              className={`pb-0.5 border-b-2 transition-all duration-300 ${
                activeSectionIndex === 4
                  ? 'text-white border-white/70 [text-shadow:0_0_12px_rgba(255,255,255,0.35),0_0_24px_rgba(192,132,252,0.4),0_0_36px_rgba(139,92,246,0.2)]'
                  : 'text-gray-400 hover:text-white hover:border-white/50 border-transparent hover:[text-shadow:0_0_12px_rgba(255,255,255,0.35),0_0_24px_rgba(192,132,252,0.4),0_0_36px_rgba(139,92,246,0.2)]'
              }`}
            >
              Attend
            </button>
            <button
              onClick={() => scrollToSection('schedule')}
              className={`pb-0.5 border-b-2 transition-all duration-300 ${
                activeSectionIndex === 5
                  ? 'text-white border-white/70 [text-shadow:0_0_12px_rgba(255,255,255,0.35),0_0_24px_rgba(192,132,252,0.4),0_0_36px_rgba(139,92,246,0.2)]'
                  : 'text-gray-400 hover:text-white hover:border-white/50 border-transparent hover:[text-shadow:0_0_12px_rgba(255,255,255,0.35),0_0_24px_rgba(192,132,252,0.4),0_0_36px_rgba(139,92,246,0.2)]'
              }`}
            >
              Schedule
            </button>
            <button
              onClick={() => scrollToSection('faq')}
              className={`pb-0.5 border-b-2 transition-all duration-300 ${
                activeSectionIndex === 6
                  ? 'text-white border-white/70 [text-shadow:0_0_12px_rgba(255,255,255,0.35),0_0_24px_rgba(192,132,252,0.4),0_0_36px_rgba(139,92,246,0.2)]'
                  : 'text-gray-400 hover:text-white hover:border-white/50 border-transparent hover:[text-shadow:0_0_12px_rgba(255,255,255,0.35),0_0_24px_rgba(192,132,252,0.4),0_0_36px_rgba(139,92,246,0.2)]'
              }`}
            >
              FAQ
            </button>
            <button
              onClick={() => navigate('/team')}
              className={`pb-0.5 border-b-2 transition-all duration-300 ${
                false
                  ? 'text-white border-white/70 [text-shadow:0_0_12px_rgba(255,255,255,0.35),0_0_24px_rgba(192,132,252,0.4),0_0_36px_rgba(139,92,246,0.2)]'
                  : 'text-gray-400 hover:text-white hover:border-white/50 border-transparent hover:[text-shadow:0_0_12px_rgba(255,255,255,0.35),0_0_24px_rgba(192,132,252,0.4),0_0_36px_rgba(139,92,246,0.2)]'
              }`}
            >
              Our Team
            </button>
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

      {/* Mobile menu overlay */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm md:hidden"
              aria-hidden="true"
              onClick={() => setMobileMenuOpen(false)}
            />
            <motion.div
              initial={{ opacity: 0, x: '100%' }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: '100%' }}
              transition={{ type: 'tween', duration: 0.25 }}
              className="fixed top-0 right-0 bottom-0 z-50 w-full max-w-[280px] bg-[#0a0a0f]/98 border-l border-white/10 py-20 px-6 flex flex-col gap-2 md:hidden"
            >
              {[
                { id: 'about', label: 'About' },
                { id: 'gallery', label: 'Gallery' },
                { id: 'submit', label: 'Apply' },
                { id: 'attend', label: 'Attend' },
                { id: 'schedule', label: 'Schedule' },
                { id: 'faq', label: 'FAQ' },
              ].map(({ id, label }) => (
                <button
                  key={id}
                  onClick={() => scrollToSection(id)}
                  className={`text-left py-3 px-4 rounded-xl text-lg font-medium transition-all min-h-[48px] ${
                    activeSectionIndex === SECTION_IDS.indexOf(id as (typeof SECTION_IDS)[number])
                      ? 'text-white bg-white/10'
                      : 'text-gray-400 hover:text-white hover:bg-white/5'
                  }`}
                >
                  {label}
                </button>
              ))}
              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  navigate('/team');
                }}
                className="text-left py-3 px-4 rounded-xl text-lg font-medium transition-all min-h-[48px] text-gray-400 hover:text-white hover:bg-white/5"
              >
                Our Team
              </button>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      <main
        ref={scrollContainerRef}
        className="h-screen overflow-y-auto overflow-x-hidden md:snap-y md:snap-mandatory md:scroll-smooth"
      >
      {/* Hero Section */}
      <section id="hero" className="relative pt-24 pb-14 px-4 sm:px-6 md:pt-32 md:pb-20 md:px-6 min-h-screen flex items-start md:items-center overflow-y-auto overflow-x-hidden md:overflow-hidden md:snap-start md:snap-always">
        {/* Background Effects */}
        <div className="absolute inset-0 bg-gradient-to-b from-blue-950/20 via-purple-950/20 to-[#0a0a0f]"></div>
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl"></div>
        <div className="absolute top-20 right-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl"></div>
        {/* Subtle shield watermark — very low opacity, blends with theme */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none" aria-hidden="true">
          <img
            src={`${import.meta.env.BASE_URL}uw-logo-shield.png`}
            alt=""
            className="max-w-[480px] md:max-w-[560px] w-full h-auto object-contain opacity-[0.06]"
          />
        </div>

        <div className="max-w-7xl mx-auto relative z-10 w-full">
          <div className="text-center mb-8 md:mb-16">
            {/* Animated Title Section */}
            <div className="relative w-full min-h-0 h-auto md:h-[500px] flex flex-col items-center justify-start md:justify-center pt-2 pb-8 md:py-0">
              <AnimatePresence mode="wait">
                {heroStage === 1 && (
                  <motion.div
                    key="presents"
                    initial={{ opacity: 0, scale: 0.9, y: 16 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 1.08, y: -8 }}
                    transition={{ duration: 0.7, ease: "easeInOut" }}
                    className="relative md:absolute md:inset-0 flex flex-col items-center justify-center w-full"
                  >
                    <img
                      src={`${import.meta.env.BASE_URL}uw-logo-full.png`}
                      alt="University of Windsor"
                      className="max-w-[340px] md:max-w-[460px] w-full h-auto object-contain mb-8"
                    />
                    <h1 className="text-3xl md:text-5xl mb-4">
                      <span className="block text-gray-300">School of Computer Science</span>
                    </h1>
                    <p className="text-4xl md:text-6xl bg-gradient-to-r from-blue-400 via-purple-500 to-blue-400 bg-clip-text text-transparent">
                      Presents
                    </p>
                  </motion.div>
                )}

                {heroStage === 2 && (
                  <motion.div
                    key="demoday"
                    initial={{ opacity: 0, scale: 0.9, y: 20 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    transition={{ duration: 1, ease: "easeOut" }}
                    className="relative md:absolute md:inset-0 flex flex-col items-center justify-center w-full"
                  >
                    <div className="inline-flex flex-col items-center gap-1 mb-6 md:mb-8 countdown-glow">
                      {countdown.status === 'countdown' && (
                        <div className="inline-flex items-center gap-3 sm:gap-5">
                          <div className="flex flex-col items-center">
                            <span className="text-2xl sm:text-3xl font-bold tabular-nums text-white">{String(countdown.days).padStart(2, '0')}</span>
                            <span className="text-xs text-purple-300 uppercase tracking-wider">Days</span>
                          </div>
                          <span className="text-xl text-purple-400/80 font-medium">:</span>
                          <div className="flex flex-col items-center">
                            <span className="text-2xl sm:text-3xl font-bold tabular-nums text-white">{String(countdown.hours).padStart(2, '0')}</span>
                            <span className="text-xs text-purple-300 uppercase tracking-wider">Hours</span>
                          </div>
                          <span className="text-xl text-purple-400/80 font-medium">:</span>
                          <div className="flex flex-col items-center">
                            <span className="text-2xl sm:text-3xl font-bold tabular-nums text-white">{String(countdown.minutes).padStart(2, '0')}</span>
                            <span className="text-xs text-purple-300 uppercase tracking-wider">Min</span>
                          </div>
                          <span className="text-xl text-purple-400/80 font-medium">:</span>
                          <div className="flex flex-col items-center">
                            <span className="text-2xl sm:text-3xl font-bold tabular-nums text-white">{String(countdown.seconds).padStart(2, '0')}</span>
                            <span className="text-xs text-purple-300 uppercase tracking-wider">Sec</span>
                          </div>
                        </div>
                      )}
                      {countdown.status === 'live' && (
                        <div className="flex flex-col items-center gap-1 text-center">
                          <motion.span
                            className="text-xl sm:text-2xl font-semibold text-white [text-shadow:0_0_20px_rgba(255,255,255,0.4),0_0_40px_rgba(192,132,252,0.35),0_0_60px_rgba(139,92,246,0.2)]"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ duration: 0.6 }}
                          >
                            Happening Now
                          </motion.span>
                          <motion.span
                            className="text-lg text-purple-300"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: 0.8, duration: 0.6 }}
                          >
                            at
                          </motion.span>
                          <motion.span
                            className="text-base text-purple-300/90"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: 1.4, duration: 0.6 }}
                          >
                            Advanced Computing Hub, 300 Ouellette Ave
                          </motion.span>
                        </div>
                      )}
                      {countdown.status === 'ended' && (
                        <div className="flex flex-col items-center gap-1 text-center">
                          <motion.span
                            className="text-lg sm:text-xl font-medium text-white"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ duration: 0.6 }}
                          >
                            The event has ended.
                          </motion.span>
                          <motion.span
                            className="text-base text-purple-300"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: 0.9, duration: 0.6 }}
                          >
                            Thank you for attending.
                          </motion.span>
                        </div>
                      )}
                    </div>
                    
                    <h1 className="font-hero-display text-5xl sm:text-6xl md:text-8xl mb-4 md:mb-6 tracking-tight hero-title-glow">
                      <span className="block">
                        Demo <span className="bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent">Day</span>
                      </span>
                      <span className="block mt-2">2026</span>
                    </h1>
                    
                    <motion.p
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 0.5, duration: 0.8 }}
                      className="text-base sm:text-xl md:text-2xl text-gray-400 max-w-3xl mx-auto mb-8 md:mb-12 leading-relaxed"
                    >
                      A celebration of innovation, creativity, and engineering excellence — where students showcase the projects that define the future of technology.
                    </motion.p>
                    
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.8, duration: 0.8 }}
                      className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-10 md:mb-16"
                    >
                      <a 
                        href={PROJECT_SUBMISSION_URL} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="cta-glow-pulse px-8 py-4 rounded-xl bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 transition-all duration-300 text-lg font-medium hover:shadow-[0_0_32px_rgba(139,92,246,0.55),0_0_48px_rgba(59,130,246,0.25)] hover:scale-[1.02]"
                      >
                        Submit Your Project
                      </a>
                      <button 
                        onClick={() => scrollToSection('about')}
                        className="px-8 py-4 rounded-xl border-2 border-white/10 hover:border-white/30 hover:bg-white/5 transition-all duration-300 text-lg hover:scale-[1.02] hover:shadow-[0_0_20px_rgba(255,255,255,0.06)]"
                      >
                        Learn More
                      </button>
                    </motion.div>
                    
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 1.2, duration: 0.8 }}
                      className="flex flex-col sm:flex-row items-center justify-center gap-6 text-gray-400"
                    >
                      <div className="flex items-center gap-2">
                        <Calendar className="w-5 h-5 text-purple-400" />
                        <span>March 27, 2026</span>
                      </div>
                      <div className="flex items-start gap-1.5">
                        <MapPin className="w-5 h-5 text-blue-400 mt-0.5 flex-shrink-0" />
                        <span>Advanced Computing Hub, University of Windsor</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Clock className="w-5 h-5 text-purple-400" />
                        <span>9:30 AM – 12:30 PM</span>
                      </div>
                    </motion.div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>
      </section>

      {/* About Section — desktop: single viewport with inner scroll; mobile: natural scroll, intro + stats in separate boxes */}
      <section id="about" className="min-h-screen md:h-screen md:min-h-0 md:overflow-hidden md:snap-start flex flex-col py-8 px-6 md:py-10 md:px-6 relative">
        <div className="max-w-7xl mx-auto w-full flex flex-col flex-1 md:min-h-0">
          <div className="text-center shrink-0 mb-4 md:mb-6">
            <span className="text-xs md:text-sm uppercase tracking-wider text-purple-400 font-medium">About the Event</span>
            <h2 className="text-3xl md:text-4xl mt-2 md:mt-3">
              Where Ideas <span className="bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent">Become Reality</span>
            </h2>
          </div>

          {/* Desktop: one scrollable grid (intro | stats). Mobile: two separate blocks, no inner scroll */}
          <div className="grid md:grid-cols-2 gap-4 md:gap-6 md:flex-1 md:min-h-0 md:overflow-y-auto mb-4 md:mb-6">
            {/* Intro text — own card on both */}
            <div className="p-5 md:p-6 rounded-2xl bg-gradient-to-br from-white/5 to-white/[0.02] border border-white/10 backdrop-blur-sm shrink-0 md:min-h-0 transition-all duration-300 hover:border-white/20 hover:shadow-[0_0_28px_rgba(139,92,246,0.22)]">
              <p className="text-sm md:text-base text-gray-300 leading-relaxed mb-4">
                CS Demo Day is the University of Windsor's flagship Computer Science event, bringing together students, faculty, industry professionals, and recruiters to celebrate student innovation and excellence.
              </p>
              <p className="text-sm md:text-base text-gray-300 leading-relaxed">
                Teams present their semester-long projects — from AI and machine learning systems to web apps, embedded systems, and beyond. It's a unique opportunity to showcase your work to a live audience and compete for recognition.
              </p>
            </div>
            {/* Stats — on mobile: separate "By the numbers" box; on desktop: same grid cell, unchanged */}
            <div className="md:min-h-0 flex flex-col">
              <div className="p-4 rounded-2xl border border-white/10 bg-white/[0.02] md:p-0 md:border-0 md:bg-transparent md:rounded-none flex-1 min-h-0 flex flex-col justify-center">
                <span className="text-xs uppercase tracking-wider text-blue-400/90 font-medium mb-3 block text-center md:hidden">By the numbers</span>
                <div className="grid grid-cols-2 gap-3 md:gap-4 shrink-0">
                  <div className="p-4 md:p-5 rounded-2xl bg-gradient-to-br from-blue-500/10 to-blue-500/5 border border-blue-500/20 transition-all duration-300 hover:border-blue-500/40 hover:shadow-[0_0_24px_rgba(59,130,246,0.28)]">
                    <Users className="w-8 h-8 md:w-9 md:h-9 text-blue-400 mb-2 md:mb-3" />
                    <div className="text-2xl md:text-3xl font-bold mb-1">200+</div>
                    <div className="text-gray-400 text-sm md:text-base">Attendees</div>
                  </div>
                  <div className="p-4 md:p-5 rounded-2xl bg-gradient-to-br from-purple-500/10 to-purple-500/5 border border-purple-500/20 transition-all duration-300 hover:border-purple-500/40 hover:shadow-[0_0_24px_rgba(139,92,246,0.28)]">
                    <Lightbulb className="w-8 h-8 md:w-9 md:h-9 text-purple-400 mb-2 md:mb-3" />
                    <div className="text-2xl md:text-3xl font-bold mb-1">40+</div>
                    <div className="text-gray-400 text-sm md:text-base">Projects</div>
                  </div>
                  <div className="p-4 md:p-5 rounded-2xl bg-gradient-to-br from-purple-500/10 to-purple-500/5 border border-purple-500/20 transition-all duration-300 hover:border-purple-500/40 hover:shadow-[0_0_24px_rgba(139,92,246,0.28)]">
                    <Trophy className="w-8 h-8 md:w-9 md:h-9 text-purple-400 mb-2 md:mb-3" />
                    <div className="text-2xl md:text-3xl font-bold mb-1">12</div>
                    <div className="text-gray-400 text-sm md:text-base">Awards</div>
                  </div>
                  <div className="p-4 md:p-5 rounded-2xl bg-gradient-to-br from-blue-500/10 to-blue-500/5 border border-blue-500/20 transition-all duration-300 hover:border-blue-500/40 hover:shadow-[0_0_24px_rgba(59,130,246,0.28)]">
                    <CalendarCheck className="w-8 h-8 md:w-9 md:h-9 text-blue-400 mb-2 md:mb-3" />
                    <div className="text-2xl md:text-3xl font-bold mb-1">5th</div>
                    <div className="text-gray-400 text-sm md:text-base">Annual Event</div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 md:gap-4 shrink-0">
            <div className="p-4 md:p-5 rounded-2xl bg-gradient-to-br from-white/5 to-white/[0.02] border border-white/10 transition-all duration-300 hover:border-white/20 hover:shadow-[0_0_24px_rgba(59,130,246,0.26)]">
              <div className="w-10 h-10 rounded-lg bg-blue-500/10 flex items-center justify-center mb-3">
                <Lightbulb className="w-5 h-5 text-blue-400" />
              </div>
              <h3 className="text-base md:text-lg font-semibold mb-1">Live Demos & Presentations</h3>
              <p className="text-gray-400 text-sm">Interactive showcases where students demonstrate their projects in real-time</p>
            </div>
            <div className="p-4 md:p-5 rounded-2xl bg-gradient-to-br from-white/5 to-white/[0.02] border border-white/10 transition-all duration-300 hover:border-white/20 hover:shadow-[0_0_24px_rgba(139,92,246,0.26)]">
              <div className="w-10 h-10 rounded-lg bg-purple-500/10 flex items-center justify-center mb-3">
                <Users className="w-5 h-5 text-purple-400" />
              </div>
              <h3 className="text-base md:text-lg font-semibold mb-1">Networking Opportunities</h3>
              <p className="text-gray-400 text-sm">Connect with industry professionals, alumni, and fellow innovators</p>
            </div>
            <div className="p-4 md:p-5 rounded-2xl bg-gradient-to-br from-white/5 to-white/[0.02] border border-white/10 transition-all duration-300 hover:border-white/20 hover:shadow-[0_0_24px_rgba(59,130,246,0.26)]">
              <div className="w-10 h-10 rounded-lg bg-blue-500/10 flex items-center justify-center mb-3">
                <Trophy className="w-5 h-5 text-blue-400" />
              </div>
              <h3 className="text-base md:text-lg font-semibold mb-1">Awards & Recognition</h3>
              <p className="text-gray-400 text-sm">Outstanding projects recognized across multiple categories</p>
            </div>
          </div>
        </div>
      </section>

      {/* Gallery Section */}
      <section className="py-12 px-4 sm:px-6 md:py-20 md:px-6 relative min-h-screen flex flex-col justify-center">
        <div className="max-w-7xl mx-auto w-full">
          <div className="text-center shrink-0 mb-8 md:mb-12">
            <span className="text-xs md:text-sm uppercase tracking-wider text-purple-400 font-medium">Event Gallery</span>
            <h2 id="gallery" className="text-3xl md:text-5xl mt-3 md:mt-4 mb-4 scroll-mt-20 md:snap-start">
              <span className="bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent">Highlights</span> From Past Events
            </h2>
            <p className="text-gray-400 text-lg">See the innovation and energy from previous Demo Days</p>
          </div>

          <div className="w-full rounded-2xl overflow-hidden max-h-[500px] md:max-h-[550px] h-[500px] md:h-[550px]">
            <Carousel images={CAROUSEL_IMAGES} autoPlay autoPlayInterval={3850} />
          </div>
        </div>
      </section>

      {/* Call for Submissions */}
      <section id="submit" className="py-12 px-4 sm:px-6 md:py-20 md:px-6 relative min-h-screen md:snap-start flex flex-col justify-center">
        <div className="max-w-4xl mx-auto w-full">
          <div className="section-cta-glow p-6 sm:p-8 md:p-10 rounded-2xl md:rounded-3xl bg-gradient-to-br from-blue-500/10 via-purple-500/10 to-blue-500/10 border relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-r from-blue-500/5 to-purple-500/5"></div>
            <div className="relative z-10">
              <span className="text-sm uppercase tracking-wider text-purple-400 font-medium">Call for Demos</span>
              <h2 className="text-3xl md:text-5xl mt-3 md:mt-4 mb-4 md:mb-6">Submit Your <span className="bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent">Project</span></h2>
              <p className="text-xl text-gray-300 mb-8 leading-relaxed">
                Applications are open! Fill out the form below to register your project. Deadline: <span className="text-white font-medium">March 20, 2026</span>
              </p>
              
              <div className="space-y-4 mb-8">
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded-full bg-blue-500/20 border-2 border-blue-500 flex items-center justify-center mt-1 flex-shrink-0">
                    <div className="w-2 h-2 rounded-full bg-blue-500"></div>
                  </div>
                  <p className="text-gray-300">Must be enrolled as a current CS student (undergraduate or graduate)</p>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded-full bg-blue-500/20 border-2 border-blue-500 flex items-center justify-center mt-1 flex-shrink-0">
                    <div className="w-2 h-2 rounded-full bg-blue-500"></div>
                  </div>
                  <p className="text-gray-300">Projects must be original work completed during the academic year</p>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded-full bg-blue-500/20 border-2 border-blue-500 flex items-center justify-center mt-1 flex-shrink-0">
                    <div className="w-2 h-2 rounded-full bg-blue-500"></div>
                  </div>
                  <p className="text-gray-300">All students are eligible to participate — individually or as a team.</p>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded-full bg-blue-500/20 border-2 border-blue-500 flex items-center justify-center mt-1 flex-shrink-0">
                    <div className="w-2 h-2 rounded-full bg-blue-500"></div>
                  </div>
                  <p className="text-gray-300">A working demo or prototype is required — slides alone are not sufficient</p>
                </div>
              </div>
              
              <a 
                href={PROJECT_SUBMISSION_URL} 
                target="_blank" 
                rel="noopener noreferrer"
                className="cta-glow-pulse inline-flex items-center gap-2 px-8 py-4 rounded-xl bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 transition-all duration-300 text-lg font-medium hover:shadow-[0_0_32px_rgba(139,92,246,0.55),0_0_48px_rgba(59,130,246,0.25)] hover:scale-[1.02]"
              >
                Submit Application
                <ChevronDown className="w-5 h-5 rotate-[-90deg]" />
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* Attend Section — Register as participant (industry, faculty, guests) */}
      <section id="attend" className="py-12 px-4 sm:px-6 md:py-20 md:px-6 relative min-h-screen md:snap-start flex flex-col justify-center">
        <div className="max-w-4xl mx-auto w-full">
          <div className="section-cta-glow p-6 sm:p-8 md:p-10 rounded-2xl md:rounded-3xl bg-gradient-to-br from-blue-500/10 via-purple-500/10 to-blue-500/10 border relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-r from-blue-500/5 to-purple-500/5"></div>
            <div className="relative z-10 text-left">
              <span className="text-sm uppercase tracking-wider text-purple-400 font-medium">Join as an attendee</span>
              <h2 className="text-3xl md:text-5xl mt-3 md:mt-4 mb-4 md:mb-6">
                Register to <span className="bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent">Attend</span>
              </h2>
              <p className="text-xl text-gray-300 mb-8 leading-relaxed">
                Industry professionals, faculty members, and guests are invited to attend CS Demo Day – Winter 2026. Please complete the form below to register your participation. <span className="text-white font-medium">March 27, 2026 · 9:30 AM – 12:30 PM</span>
              </p>
              <div className="space-y-4 mb-8">
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded-full bg-blue-500/20 border-2 border-blue-500 flex items-center justify-center mt-1 flex-shrink-0">
                    <div className="w-2 h-2 rounded-full bg-blue-500"></div>
                  </div>
                  <p className="text-gray-300">Open to industry professionals, faculty, alumni, and community guests</p>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded-full bg-blue-500/20 border-2 border-blue-500 flex items-center justify-center mt-1 flex-shrink-0">
                    <div className="w-2 h-2 rounded-full bg-blue-500"></div>
                  </div>
                  <p className="text-gray-300">Engage with students, explore innovative projects, and connect with colleagues from academia and industry</p>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded-full bg-blue-500/20 border-2 border-blue-500 flex items-center justify-center mt-1 flex-shrink-0">
                    <div className="w-2 h-2 rounded-full bg-blue-500"></div>
                  </div>
                  <p className="text-gray-300">Advanced Computing Hub, 300 Ouellette Ave, 4th Floor, University of Windsor</p>
                </div>
              </div>
              <a
                href={PARTICIPANT_REGISTRATION_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="cta-glow-pulse inline-flex items-center gap-2 px-8 py-4 rounded-xl bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 transition-all duration-300 text-lg font-medium hover:shadow-[0_0_32px_rgba(139,92,246,0.55),0_0_48px_rgba(59,130,246,0.25)] hover:scale-[1.02]"
              >
                Register To Attend
                <ChevronDown className="w-5 h-5 rotate-[-90deg]" />
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* Schedule Section */}
      <section id="schedule" className="py-12 px-4 sm:px-6 md:py-20 md:px-6 relative min-h-screen md:snap-start flex flex-col justify-center">
        <div className="max-w-5xl mx-auto w-full">
          <div className="text-center mb-10 md:mb-16">
            <span className="text-sm uppercase tracking-wider text-purple-400 font-medium">Day of the Event</span>
            <h2 className="text-3xl md:text-5xl mt-3 md:mt-4 mb-4 [text-shadow:0_0_24px_rgba(192,132,252,0.25),0_0_48px_rgba(139,92,246,0.15)]">Schedule</h2>
            <p className="text-gray-400 text-lg">March 27, 2026 · Advanced Computing Hub, University of Windsor</p>
          </div>

          <motion.div
            ref={scheduleRef}
            className="space-y-5"
            initial="hidden"
            animate={scheduleInView ? 'visible' : 'hidden'}
            variants={scheduleStaggerVariants}
          >
            {[
              { time: '9:30 AM', tag: 'Registration', tagBlue: true, title: 'Registration', desc: 'Check-in and registration for attendees and teams.' },
              { time: '10:00 AM', tag: 'Opening', tagBlue: false, title: 'Opening Ceremony & Demo Sessions', desc: 'Welcome remarks and beginning of project demos.' },
              { time: '12:00 PM', tag: 'Awards', tagBlue: false, title: 'Award Ceremony', desc: 'Announcing winners and recognition of outstanding projects.' },
              { time: '12:30 PM', tag: 'Closing', tagBlue: true, title: 'Closing & Networking', desc: 'Event concludes. Informal networking with guests and recruiters.', last: true },
            ].map((item, i) => (
              <motion.div key={i} className="group flex gap-4 md:gap-6 items-start" variants={scheduleItemVariants}>
                <div className="flex flex-col items-center shrink-0 -mb-5">
                  <div className={`w-3 h-3 rounded-full ring-4 shrink-0 transition-shadow duration-300 ${item.tagBlue ? 'bg-blue-500 ring-blue-500/20 schedule-dot-pulse-blue' : 'bg-purple-500 ring-purple-500/20 schedule-dot-pulse-purple'}`} />
                  {!item.last && <div className="w-0.5 flex-1 min-h-[2rem] bg-gradient-to-b from-white/25 to-transparent mt-2" />}
                </div>
                <div className={`flex-1 min-w-0 rounded-xl border border-white/10 bg-white/5 px-4 py-3 md:px-5 md:py-4 transition-all duration-300 hover:bg-white/[0.07] hover:border-white/20 ${item.tagBlue ? 'hover:shadow-[0_0_28px_rgba(59,130,246,0.28)]' : 'hover:shadow-[0_0_28px_rgba(139,92,246,0.28)]'} ${item.last ? 'pb-3 md:pb-4' : 'pb-8 md:pb-12'}`}>
                  <div className="flex items-center justify-between gap-2 md:gap-4 mb-1 md:mb-2">
                    <span className="text-gray-400 font-medium tabular-nums shrink-0 w-14 md:w-20 text-sm md:text-base">{item.time}</span>
                    <span className={`px-2.5 py-0.5 md:px-3 md:py-1 rounded-full text-xs md:text-sm shrink-0 ${item.tagBlue ? 'bg-blue-500/10 text-blue-400' : 'bg-purple-500/10 text-purple-400'}`}>{item.tag}</span>
                  </div>
                  <h3 className="text-lg md:text-xl mb-1 md:mb-2">{item.title}</h3>
                  <p className="text-gray-400 text-xs md:text-sm leading-relaxed">{item.desc}</p>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* FAQ Section */}
      <section id="faq" className="py-12 px-4 sm:px-6 md:py-20 md:px-6 relative min-h-screen md:snap-start flex flex-col justify-center">
        <div className="max-w-3xl mx-auto w-full">
          <div className="text-center mb-10 md:mb-16">
            <span className="text-sm uppercase tracking-wider text-purple-400 font-medium">FAQ</span>
            <h2 className="text-3xl md:text-5xl mt-3 md:mt-4">Common Questions</h2>
          </div>

          <Accordion type="single" collapsible value={openFaq} onValueChange={setOpenFaq} className="w-full space-y-4">
            <AccordionItem value="item-1" className="faq-item-glow w-full border-b-0 border border-white/10 rounded-xl overflow-hidden transition-all duration-300 hover:border-white/20 hover:shadow-[0_0_24px_rgba(139,92,246,0.18)] data-[state=open]:border-purple-500/30">
              <AccordionTrigger className="w-full text-base md:text-lg hover:no-underline py-5 px-4 md:py-6 md:px-6 rounded-t-xl bg-white/5 hover:bg-white/[0.08] transition-all duration-300 data-[state=open]:bg-white/[0.08] data-[state=open]:rounded-b-none text-left [&[data-state=open]]:rounded-b-none">
                Who can submit a project?
              </AccordionTrigger>
              <AccordionContent className="w-full px-4 py-4 md:px-6 md:py-6 bg-white/[0.03] rounded-b-xl border-t border-white/10">
                <p className="text-gray-300 leading-relaxed">
                  Any currently enrolled undergraduate or graduate student in the Computer Science department. Individuals and teams of any size may participate.
                </p>
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="item-2" className="faq-item-glow w-full border-b-0 border border-white/10 rounded-xl overflow-hidden transition-all duration-300 hover:border-white/20 hover:shadow-[0_0_24px_rgba(139,92,246,0.18)] data-[state=open]:border-purple-500/30">
              <AccordionTrigger className="w-full text-base md:text-lg hover:no-underline py-5 px-4 md:py-6 md:px-6 rounded-t-xl bg-white/5 hover:bg-white/[0.08] transition-all duration-300 data-[state=open]:bg-white/[0.08] data-[state=open]:rounded-b-none text-left [&[data-state=open]]:rounded-b-none">
                Does my project have to be from a class?
              </AccordionTrigger>
              <AccordionContent className="w-full px-4 py-4 md:px-6 md:py-6 bg-white/[0.03] rounded-b-xl border-t border-white/10">
                <p className="text-gray-300 leading-relaxed">
                  No! Projects can be personal, research-based, or from a course. The key requirement is that the work is original and completed during the current academic year.
                </p>
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="item-3" className="faq-item-glow w-full border-b-0 border border-white/10 rounded-xl overflow-hidden transition-all duration-300 hover:border-white/20 hover:shadow-[0_0_24px_rgba(139,92,246,0.18)] data-[state=open]:border-purple-500/30">
              <AccordionTrigger className="w-full text-base md:text-lg hover:no-underline py-5 px-4 md:py-6 md:px-6 rounded-t-xl bg-white/5 hover:bg-white/[0.08] transition-all duration-300 data-[state=open]:bg-white/[0.08] data-[state=open]:rounded-b-none text-left [&[data-state=open]]:rounded-b-none">
                What should I bring on Demo Day?
              </AccordionTrigger>
              <AccordionContent className="w-full px-4 py-4 md:px-6 md:py-6 bg-white/[0.03] rounded-b-xl border-t border-white/10">
                <p className="text-gray-300 leading-relaxed">
                  Bring all necessary equipment and materials: your laptop, extra monitors, power cords, and any prototypes or visuals. You will need a working demo of your project to showcase at your desk. Power outlets will be available.
                </p>
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="item-8" className="faq-item-glow w-full border-b-0 border border-white/10 rounded-xl overflow-hidden transition-all duration-300 hover:border-white/20 hover:shadow-[0_0_24px_rgba(139,92,246,0.18)] data-[state=open]:border-purple-500/30">
              <AccordionTrigger className="w-full text-base md:text-lg hover:no-underline py-5 px-4 md:py-6 md:px-6 rounded-t-xl bg-white/5 hover:bg-white/[0.08] transition-all duration-300 data-[state=open]:bg-white/[0.08] data-[state=open]:rounded-b-none text-left [&[data-state=open]]:rounded-b-none">
                When and where is CS Demo Day?
              </AccordionTrigger>
              <AccordionContent className="w-full px-4 py-4 md:px-6 md:py-6 bg-white/[0.03] rounded-b-xl border-t border-white/10">
                <p className="text-gray-300 leading-relaxed">
                  Friday, March 27, 2026, from 9:30 AM to 12:30 PM at the School of Computer Science Advanced Computing Hub, 300 Ouellette Avenue, 4th floor.
                </p>
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="item-9" className="faq-item-glow w-full border-b-0 border border-white/10 rounded-xl overflow-hidden transition-all duration-300 hover:border-white/20 hover:shadow-[0_0_24px_rgba(139,92,246,0.18)] data-[state=open]:border-purple-500/30">
              <AccordionTrigger className="w-full text-base md:text-lg hover:no-underline py-5 px-4 md:py-6 md:px-6 rounded-t-xl bg-white/5 hover:bg-white/[0.08] transition-all duration-300 data-[state=open]:bg-white/[0.08] data-[state=open]:rounded-b-none text-left [&[data-state=open]]:rounded-b-none">
                When can I set up my desk?
              </AccordionTrigger>
              <AccordionContent className="w-full px-4 py-4 md:px-6 md:py-6 bg-white/[0.03] rounded-b-xl border-t border-white/10">
                <p className="text-gray-300 leading-relaxed">
                  You can set up your desk between 8:00 AM and 9:00 AM. Please ensure you bring all necessary equipment and materials before the event begins at 9:30 AM.
                </p>
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="item-10" className="faq-item-glow w-full border-b-0 border border-white/10 rounded-xl overflow-hidden transition-all duration-300 hover:border-white/20 hover:shadow-[0_0_24px_rgba(139,92,246,0.18)] data-[state=open]:border-purple-500/30">
              <AccordionTrigger className="w-full text-base md:text-lg hover:no-underline py-5 px-4 md:py-6 md:px-6 rounded-t-xl bg-white/5 hover:bg-white/[0.08] transition-all duration-300 data-[state=open]:bg-white/[0.08] data-[state=open]:rounded-b-none text-left [&[data-state=open]]:rounded-b-none">
                Will there be a PowerPoint or formal presentation?
              </AccordionTrigger>
              <AccordionContent className="w-full px-4 py-4 md:px-6 md:py-6 bg-white/[0.03] rounded-b-xl border-t border-white/10">
                <p className="text-gray-300 leading-relaxed">
                  No. There will be no PowerPoint or formal presentation. You will showcase your project at your desk with a working demo. We encourage you to make your desk as engaging and interactive as possible to attract industry attendees and showcase the unique features of your project.
                </p>
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="item-11" className="faq-item-glow w-full border-b-0 border border-white/10 rounded-xl overflow-hidden transition-all duration-300 hover:border-white/20 hover:shadow-[0_0_24px_rgba(139,92,246,0.18)] data-[state=open]:border-purple-500/30">
              <AccordionTrigger className="w-full text-base md:text-lg hover:no-underline py-5 px-4 md:py-6 md:px-6 rounded-t-xl bg-white/5 hover:bg-white/[0.08] transition-all duration-300 data-[state=open]:bg-white/[0.08] data-[state=open]:rounded-b-none text-left [&[data-state=open]]:rounded-b-none">
                How many presenters can be at the desk at once?
              </AccordionTrigger>
              <AccordionContent className="w-full px-4 py-4 md:px-6 md:py-6 bg-white/[0.03] rounded-b-xl border-t border-white/10">
                <p className="text-gray-300 leading-relaxed">
                  Please avoid having more than 3 presenters standing near the desk at once. This gives industry attendees and visitors enough space to see your demo.
                </p>
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="item-4" className="faq-item-glow w-full border-b-0 border border-white/10 rounded-xl overflow-hidden transition-all duration-300 hover:border-white/20 hover:shadow-[0_0_24px_rgba(139,92,246,0.18)] data-[state=open]:border-purple-500/30">
              <AccordionTrigger className="w-full text-base md:text-lg hover:no-underline py-5 px-4 md:py-6 md:px-6 rounded-t-xl bg-white/5 hover:bg-white/[0.08] transition-all duration-300 data-[state=open]:bg-white/[0.08] data-[state=open]:rounded-b-none text-left [&[data-state=open]]:rounded-b-none">
                Is there a registration fee?
              </AccordionTrigger>
              <AccordionContent className="w-full px-4 py-4 md:px-6 md:py-6 bg-white/[0.03] rounded-b-xl border-t border-white/10">
                <p className="text-gray-300 leading-relaxed">
                  No. Participation is completely free for all students. Attending as a guest is also free and open to the public.
                </p>
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="item-5" className="faq-item-glow w-full border-b-0 border border-white/10 rounded-xl overflow-hidden transition-all duration-300 hover:border-white/20 hover:shadow-[0_0_24px_rgba(139,92,246,0.18)] data-[state=open]:border-purple-500/30">
              <AccordionTrigger className="w-full text-base md:text-lg hover:no-underline py-5 px-4 md:py-6 md:px-6 rounded-t-xl bg-white/5 hover:bg-white/[0.08] transition-all duration-300 data-[state=open]:bg-white/[0.08] data-[state=open]:rounded-b-none text-left [&[data-state=open]]:rounded-b-none">
                How will projects be judged?
              </AccordionTrigger>
              <AccordionContent className="w-full px-4 py-4 md:px-6 md:py-6 bg-white/[0.03] rounded-b-xl border-t border-white/10">
                <p className="text-gray-300 leading-relaxed">
                  A panel of faculty and industry judges evaluates projects on innovation, technical complexity, presentation quality, and real-world impact.
                </p>
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="item-6" className="faq-item-glow w-full border-b-0 border border-white/10 rounded-xl overflow-hidden transition-all duration-300 hover:border-white/20 hover:shadow-[0_0_24px_rgba(139,92,246,0.18)] data-[state=open]:border-purple-500/30">
              <AccordionTrigger className="w-full text-base md:text-lg hover:no-underline py-5 px-4 md:py-6 md:px-6 rounded-t-xl bg-white/5 hover:bg-white/[0.08] transition-all duration-300 data-[state=open]:bg-white/[0.08] data-[state=open]:rounded-b-none text-left [&[data-state=open]]:rounded-b-none">
                Can I attend even if I&apos;m not presenting?
              </AccordionTrigger>
              <AccordionContent className="w-full px-4 py-4 md:px-6 md:py-6 bg-white/[0.03] rounded-b-xl border-t border-white/10">
                <p className="text-gray-300 leading-relaxed">
                  Absolutely! We encourage all students, faculty, and guests to attend and explore the projects on display.
                </p>
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="item-7" className="faq-item-glow w-full border-b-0 border border-white/10 rounded-xl overflow-hidden transition-all duration-300 hover:border-white/20 hover:shadow-[0_0_24px_rgba(139,92,246,0.18)] data-[state=open]:border-purple-500/30">
              <AccordionTrigger className="w-full text-base md:text-lg hover:no-underline py-5 px-4 md:py-6 md:px-6 rounded-t-xl bg-white/5 hover:bg-white/[0.08] transition-all duration-300 data-[state=open]:bg-white/[0.08] data-[state=open]:rounded-b-none text-left [&[data-state=open]]:rounded-b-none">
                What prizes or recognition are available?
              </AccordionTrigger>
              <AccordionContent className="w-full px-4 py-4 md:px-6 md:py-6 bg-white/[0.03] rounded-b-xl border-t border-white/10">
                <p className="text-gray-300 leading-relaxed">
                  All presenters will receive a certificate of participation. Winners in categories such as Best Overall Project, Best Technical Achievement, Best Design & UX, Best Social Impact, and People&apos;s Choice will receive winner certificates.
                </p>
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="item-12" className="faq-item-glow w-full border-b-0 border border-white/10 rounded-xl overflow-hidden transition-all duration-300 hover:border-white/20 hover:shadow-[0_0_24px_rgba(139,92,246,0.18)] data-[state=open]:border-purple-500/30">
              <AccordionTrigger className="w-full text-base md:text-lg hover:no-underline py-5 px-4 md:py-6 md:px-6 rounded-t-xl bg-white/5 hover:bg-white/[0.08] transition-all duration-300 data-[state=open]:bg-white/[0.08] data-[state=open]:rounded-b-none text-left [&[data-state=open]]:rounded-b-none">
                What is the dress code?
              </AccordionTrigger>
              <AccordionContent className="w-full px-4 py-4 md:px-6 md:py-6 bg-white/[0.03] rounded-b-xl border-t border-white/10">
                <p className="text-gray-300 leading-relaxed">
                  Participants are expected to wear formal or semi-formal attire at the event.
                </p>
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </div>
      </section>



      {/* Footer */}
      <footer id="footer" className="border-t border-white/10 py-8 px-4 sm:px-6 md:py-12 md:px-6 md:snap-start">
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
                <button onClick={() => scrollToSection('about')} className="block text-gray-400 hover:text-white transition-all duration-200 hover:[text-shadow:0_0_12px_rgba(255,255,255,0.35),0_0_24px_rgba(192,132,252,0.4),0_0_36px_rgba(139,92,246,0.2)]">
                  About
                </button>
                <button onClick={() => scrollToSection('submit')} className="block text-gray-400 hover:text-white transition-all duration-200 hover:[text-shadow:0_0_12px_rgba(255,255,255,0.35),0_0_24px_rgba(192,132,252,0.4),0_0_36px_rgba(139,92,246,0.2)]">
                  Apply
                </button>
                <button onClick={() => scrollToSection('attend')} className="block text-gray-400 hover:text-white transition-all duration-200 hover:[text-shadow:0_0_12px_rgba(255,255,255,0.35),0_0_24px_rgba(192,132,252,0.4),0_0_36px_rgba(139,92,246,0.2)]">
                  Attend
                </button>
                <button onClick={() => scrollToSection('schedule')} className="block text-gray-400 hover:text-white transition-all duration-200 hover:[text-shadow:0_0_12px_rgba(255,255,255,0.35),0_0_24px_rgba(192,132,252,0.4),0_0_36px_rgba(139,92,246,0.2)]">
                  Schedule
                </button>
                <button onClick={() => scrollToSection('faq')} className="block text-gray-400 hover:text-white transition-all duration-200 hover:[text-shadow:0_0_12px_rgba(255,255,255,0.35),0_0_24px_rgba(192,132,252,0.4),0_0_36px_rgba(139,92,246,0.2)]">
                  FAQ
                </button>
                <button onClick={() => navigate('/team')} className="block text-gray-400 hover:text-white transition-all duration-200 hover:[text-shadow:0_0_12px_rgba(255,255,255,0.35),0_0_24px_rgba(192,132,252,0.4),0_0_36px_rgba(139,92,246,0.2)]">
                  Our Team
                </button>
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
            <p className="text-gray-400 text-sm">
              © 2026 School of Computer Science, University of Windsor. All rights reserved.
            </p>
            <p className="text-gray-400 text-sm">
              Submission deadline: <span className="text-white">March 20, 2026</span>
            </p>
          </div>
        </div>
      </footer>
      </main>

      {/* Section progress indicator — hidden on small screens to avoid clutter */}
      <div
        className="fixed right-4 md:right-6 top-1/2 z-30 -translate-y-1/2 hidden sm:flex flex-col gap-3"
        aria-label="Page sections"
      >
        {SECTION_IDS.map((id, i) => (
          <button
            key={id}
            onClick={() => scrollToSection(id)}
            className="rounded-full p-1 transition-all duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-white/50 hover:scale-125"
            aria-label={`Go to section ${i + 1}`}
            aria-current={activeSectionIndex === i ? 'true' : undefined}
          >
            <span
              className={`block h-2 w-2 rounded-full transition-all duration-200 ${
                activeSectionIndex === i
                  ? 'bg-white scale-125 ring-2 ring-white/30'
                  : 'bg-white/40 hover:bg-white/60'
              }`}
            />
          </button>
        ))}
      </div>

      {/* Down arrow — scroll to next section */}
      <AnimatePresence>
        {activeSectionIndex === 0 && (
          <motion.button
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            onClick={scrollToNextSection}
            className="fixed bottom-6 left-1/2 z-50 -translate-x-1/2 flex items-center justify-center w-12 h-12 md:w-11 md:h-11 rounded-full border border-white/20 bg-white/5 hover:bg-white/10 hover:border-white/30 transition-all duration-300 hover:scale-110 hover:shadow-[0_0_20px_rgba(139,92,246,0.25)] touch-manipulation"
            aria-label="Scroll to next section"
          >
            <ChevronDown className="w-5 h-5 text-white/80" />
          </motion.button>
        )}
      </AnimatePresence>
    </div>
  );
}
