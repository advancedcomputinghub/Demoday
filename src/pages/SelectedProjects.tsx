import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Calendar, MapPin, Clock, Menu, X } from 'lucide-react';
 
const SELECTED_PROJECTS_DATE = new Date('2026-03-22T12:00:00'); // Mar 22, 2026 at noon
 
export default function SelectedProjects() {
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
 
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
 
  const navLinks = [
    { id: '#about', label: 'About' },
    { id: '#gallery', label: 'Gallery' },
    { id: '#submit', label: 'Apply' },
    { id: '#attend', label: 'Attend' },
    { id: '#schedule', label: 'Schedule' },
    { id: '#faq', label: 'FAQ' },
  ];
 
  const navButtonClass =
    'pb-0.5 border-b-2 transition-all duration-300 text-gray-400 hover:text-white hover:border-white/50 border-transparent hover:[text-shadow:0_0_12px_rgba(255,255,255,0.35),0_0_24px_rgba(192,132,252,0.4),0_0_36px_rgba(139,92,246,0.2)]';
  const navButtonActiveClass =
    'pb-0.5 border-b-2 transition-all duration-300 text-white border-white/70 [text-shadow:0_0_12px_rgba(255,255,255,0.35),0_0_24px_rgba(192,132,252,0.4),0_0_36px_rgba(139,92,246,0.2)]';
 
  const content =
    new Date() < SELECTED_PROJECTS_DATE ? (
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
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="p-8 md:p-12 rounded-2xl bg-gradient-to-br from-white/5 to-white/[0.02] border border-white/10 text-center max-w-2xl">
          <p className="text-lg md:text-2xl text-gray-300">Projects will be displayed here once finalized.</p>
        </div>
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
            {navLinks.map(({ id, label }) => (
              <button key={id} onClick={() => goHome(id)} className={navButtonClass}>
                {label}
              </button>
            ))}
            <button onClick={() => navigate('/selected-projects')} className={navButtonActiveClass}>
              Selected Projects
            </button>
            <button onClick={() => navigate('/team')} className={navButtonClass}>
              Our Team
            </button>
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
 
      {/* Mobile menu overlay — matches Team.tsx pattern */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-40 bg-black/60 md:hidden" aria-hidden={!mobileMenuOpen}>
          <div className="absolute inset-x-0 top-[56px] bg-[#050509] border-b border-white/10 shadow-2xl">
            <div className="max-w-7xl mx-auto px-4 py-4 space-y-1">
              {navLinks.map(({ id, label }) => (
                <button
                  key={id}
                  onClick={() => goHome(id)}
                  className="w-full text-left py-3 px-4 rounded-xl text-lg font-medium transition-all min-h-[48px] text-gray-400 hover:text-white hover:bg-white/5"
                >
                  {label}
                </button>
              ))}
              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  navigate('/selected-projects');
                }}
                className="w-full text-left py-3 px-4 rounded-xl text-lg font-medium transition-all min-h-[48px] text-white bg-white/10"
              >
                Selected Projects
              </button>
              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  navigate('/team');
                }}
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
            <p className="text-lg md:text-xl text-gray-400">Projects showcasing innovation and excellence</p>
          </div>
 
          {content}
        </div>
      </main>
 
      {/* Footer — identical to Team.tsx */}
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
                <button onClick={() => goHome('#about')} className="block text-gray-400 hover:text-white transition-all duration-200 hover:[text-shadow:0_0_12px_rgba(255,255,255,0.35),0_0_24px_rgba(192,132,252,0.4),0_0_36px_rgba(139,92,246,0.2)]">
                  About
                </button>
                <button onClick={() => goHome('#submit')} className="block text-gray-400 hover:text-white transition-all duration-200 hover:[text-shadow:0_0_12px_rgba(255,255,255,0.35),0_0_24px_rgba(192,132,252,0.4),0_0_36px_rgba(139,92,246,0.2)]">
                  Apply
                </button>
                <button onClick={() => goHome('#attend')} className="block text-gray-400 hover:text-white transition-all duration-200 hover:[text-shadow:0_0_12px_rgba(255,255,255,0.35),0_0_24px_rgba(192,132,252,0.4),0_0_36px_rgba(139,92,246,0.2)]">
                  Attend
                </button>
                <button onClick={() => goHome('#schedule')} className="block text-gray-400 hover:text-white transition-all duration-200 hover:[text-shadow:0_0_12px_rgba(255,255,255,0.35),0_0_24px_rgba(192,132,252,0.4),0_0_36px_rgba(139,92,246,0.2)]">
                  Schedule
                </button>
                <button onClick={() => goHome('#faq')} className="block text-gray-400 hover:text-white transition-all duration-200 hover:[text-shadow:0_0_12px_rgba(255,255,255,0.35),0_0_24px_rgba(192,132,252,0.4),0_0_36px_rgba(139,92,246,0.2)]">
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
    </div>
  );
}