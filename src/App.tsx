import { Calendar, MapPin, Clock, Users, Lightbulb, Trophy, Zap, ChevronDown } from 'lucide-react';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from './components/ui/accordion';
import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';

const SECTION_IDS = ['hero', 'about', 'submit', 'schedule', 'faq', 'footer'] as const;

export default function App() {
  const [openFaq, setOpenFaq] = useState<string>('');
  const [heroStage, setHeroStage] = useState<1 | 2 | 3>(1);
  const [activeSectionIndex, setActiveSectionIndex] = useState(0);
  const scrollContainerRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const stage2Timer = setTimeout(() => {
      setHeroStage(2);
    }, 1800);

    const stage3Timer = setTimeout(() => {
      setHeroStage(3);
    }, 3600);

    return () => {
      clearTimeout(stage2Timer);
      clearTimeout(stage3Timer);
    };
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
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
              <Zap className="w-5 h-5 text-white" />
            </div>
            <div className="flex flex-col">
              <span className="font-semibold text-lg leading-tight">CS Demo Day</span>
              <span className="text-xs text-gray-400">University of Windsor</span>
            </div>
          </div>
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
              onClick={() => scrollToSection('submit')}
              className={`pb-0.5 border-b-2 transition-all duration-300 ${
                activeSectionIndex === 2
                  ? 'text-white border-white/70 [text-shadow:0_0_12px_rgba(255,255,255,0.35),0_0_24px_rgba(192,132,252,0.4),0_0_36px_rgba(139,92,246,0.2)]'
                  : 'text-gray-400 hover:text-white hover:border-white/50 border-transparent hover:[text-shadow:0_0_12px_rgba(255,255,255,0.35),0_0_24px_rgba(192,132,252,0.4),0_0_36px_rgba(139,92,246,0.2)]'
              }`}
            >
              Apply
            </button>
            <button
              onClick={() => scrollToSection('schedule')}
              className={`pb-0.5 border-b-2 transition-all duration-300 ${
                activeSectionIndex === 3
                  ? 'text-white border-white/70 [text-shadow:0_0_12px_rgba(255,255,255,0.35),0_0_24px_rgba(192,132,252,0.4),0_0_36px_rgba(139,92,246,0.2)]'
                  : 'text-gray-400 hover:text-white hover:border-white/50 border-transparent hover:[text-shadow:0_0_12px_rgba(255,255,255,0.35),0_0_24px_rgba(192,132,252,0.4),0_0_36px_rgba(139,92,246,0.2)]'
              }`}
            >
              Schedule
            </button>
            <button
              onClick={() => scrollToSection('faq')}
              className={`pb-0.5 border-b-2 transition-all duration-300 ${
                activeSectionIndex === 4
                  ? 'text-white border-white/70 [text-shadow:0_0_12px_rgba(255,255,255,0.35),0_0_24px_rgba(192,132,252,0.4),0_0_36px_rgba(139,92,246,0.2)]'
                  : 'text-gray-400 hover:text-white hover:border-white/50 border-transparent hover:[text-shadow:0_0_12px_rgba(255,255,255,0.35),0_0_24px_rgba(192,132,252,0.4),0_0_36px_rgba(139,92,246,0.2)]'
              }`}
            >
              FAQ
            </button>
          </div>
        </div>
      </nav>

      <main
        ref={scrollContainerRef}
        className="h-screen overflow-y-auto snap-y snap-mandatory scroll-smooth"
      >
      {/* Hero Section */}
      <section id="hero" className="relative pt-32 pb-20 px-6 overflow-hidden min-h-screen flex items-center snap-start snap-always">
        {/* Background Effects */}
        <div className="absolute inset-0 bg-gradient-to-b from-blue-950/20 via-purple-950/20 to-[#0a0a0f]"></div>
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl"></div>
        <div className="absolute top-20 right-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl"></div>
        
        <div className="max-w-7xl mx-auto relative z-10 w-full">
          <div className="text-center mb-16">
            {/* Animated Title Section */}
            <div className="relative h-[400px] md:h-[500px] flex items-center justify-center">
              <AnimatePresence mode="wait">
                {heroStage === 1 && (
                  <motion.div
                    key="uw"
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 1.1 }}
                    transition={{ duration: 0.8, ease: "easeInOut" }}
                    className="absolute inset-0 flex flex-col items-center justify-center"
                  >
                    <div className="mb-8 flex h-16 w-16 items-center justify-center rounded-2xl border border-white/20 bg-white/10 text-sm font-semibold text-white">
                      UW
                    </div>
                    <motion.div
                      animate={{
                        textShadow: [
                          "0 0 20px rgba(139, 92, 246, 0.3)",
                          "0 0 40px rgba(139, 92, 246, 0.5)",
                          "0 0 20px rgba(139, 92, 246, 0.3)",
                        ],
                      }}
                      transition={{ duration: 2, repeat: Infinity }}
                    >
                      <h1 className="text-4xl md:text-6xl mb-4">
                        <span className="block text-gray-300">University of Windsor</span>
                      </h1>
                    </motion.div>
                  </motion.div>
                )}

                {heroStage === 2 && (
                  <motion.div
                    key="presents"
                    initial={{ opacity: 0, scale: 0.9, y: 16 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 1.08, y: -8 }}
                    transition={{ duration: 0.7, ease: "easeInOut" }}
                    className="absolute inset-0 flex flex-col items-center justify-center"
                  >
                    <div className="mb-8 flex h-16 w-16 items-center justify-center rounded-2xl border border-white/20 bg-white/10 text-sm font-semibold text-white">
                      UW
                    </div>
                    <h1 className="text-3xl md:text-5xl mb-4">
                      <span className="block text-gray-300">School of Computer Science</span>
                    </h1>
                    <p className="text-4xl md:text-6xl bg-gradient-to-r from-blue-400 via-purple-500 to-blue-400 bg-clip-text text-transparent">
                      Presents
                    </p>
                  </motion.div>
                )}

                {heroStage === 3 && (
                  <motion.div
                    key="demoday"
                    initial={{ opacity: 0, scale: 0.9, y: 20 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    transition={{ duration: 1, ease: "easeOut" }}
                    className="absolute inset-0 flex flex-col items-center justify-center"
                  >
                    <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-purple-500/30 bg-purple-500/10 mb-8">
                      <Zap className="w-4 h-4 text-purple-400" />
                      <span className="text-sm text-purple-300">University of Windsor · Computer Science</span>
                    </div>
                    
                    <motion.h1
                      className="text-6xl md:text-8xl mb-6"
                      animate={{
                        textShadow: [
                          "0 0 30px rgba(139, 92, 246, 0.4), 0 0 60px rgba(59, 130, 246, 0.3)",
                          "0 0 50px rgba(139, 92, 246, 0.6), 0 0 80px rgba(59, 130, 246, 0.5)",
                          "0 0 30px rgba(139, 92, 246, 0.4), 0 0 60px rgba(59, 130, 246, 0.3)",
                        ],
                      }}
                      transition={{ duration: 3, repeat: Infinity }}
                    >
                      <span className="block">Demo <span className="bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent">Day</span></span>
                      <span className="block mt-2">2026</span>
                    </motion.h1>
                    
                    <motion.p
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 0.5, duration: 0.8 }}
                      className="text-xl md:text-2xl text-gray-400 max-w-3xl mx-auto mb-12 leading-relaxed"
                    >
                      A celebration of innovation, creativity, and engineering excellence — where students showcase the projects that define the future of technology.
                    </motion.p>
                    
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.8, duration: 0.8 }}
                      className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16"
                    >
                      <a 
                        href="https://docs.google.com/forms/d/e/1FAIpQLSevBxky8AILviHbGyK3XLmtiOqw8ddW8tQ0AIy7ZLS1MInYBg/viewform" 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="px-8 py-4 rounded-xl bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 transition-all shadow-lg shadow-purple-500/30 text-lg font-medium"
                      >
                        Submit Your Project
                      </a>
                      <button 
                        onClick={() => scrollToSection('about')}
                        className="px-8 py-4 rounded-xl border-2 border-white/10 hover:border-white/20 transition-all text-lg"
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
                      <div className="flex items-center gap-2">
                        <MapPin className="w-5 h-5 text-blue-400" />
                        <span>Advanced Computing Hub, University of Windsor</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Clock className="w-5 h-5 text-purple-400" />
                        <span>10:00 AM – 1:00 PM</span>
                      </div>
                    </motion.div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>
      </section>

      {/* About Section — single viewport, content sized to fit */}
      <section id="about" className="h-screen min-h-0 overflow-hidden snap-start flex flex-col py-8 px-6 md:py-10 md:px-6 relative">
        <div className="max-w-7xl mx-auto w-full flex flex-col flex-1 min-h-0">
          <div className="text-center shrink-0 mb-4 md:mb-6">
            <span className="text-xs md:text-sm uppercase tracking-wider text-purple-400 font-medium">About the Event</span>
            <h2 className="text-3xl md:text-4xl mt-2 md:mt-3">
              Where Ideas <span className="bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent">Become Reality</span>
            </h2>
          </div>

          <div className="grid md:grid-cols-2 gap-4 md:gap-6 flex-1 min-h-0 overflow-y-auto mb-4 md:mb-6">
            <div className="p-5 md:p-6 rounded-2xl bg-gradient-to-br from-white/5 to-white/[0.02] border border-white/10 backdrop-blur-sm shrink-0 md:min-h-0">
              <p className="text-sm md:text-base text-gray-300 leading-relaxed mb-4">
                CS Demo Day is the University of Windsor's flagship Computer Science event, bringing together students, faculty, industry professionals, and recruiters to celebrate student innovation and excellence.
              </p>
              <p className="text-sm md:text-base text-gray-300 leading-relaxed">
                Teams present their semester-long projects — from AI and machine learning systems to web apps, embedded systems, and beyond. It's a unique opportunity to showcase your work to a live audience and compete for recognition.
              </p>
            </div>
            <div className="grid grid-cols-2 gap-3 md:gap-4 shrink-0">
              <div className="p-4 md:p-5 rounded-2xl bg-gradient-to-br from-blue-500/10 to-blue-500/5 border border-blue-500/20">
                <Users className="w-8 h-8 md:w-9 md:h-9 text-blue-400 mb-2 md:mb-3" />
                <div className="text-2xl md:text-3xl font-bold mb-1">200+</div>
                <div className="text-gray-400 text-sm md:text-base">Attendees</div>
              </div>
              <div className="p-4 md:p-5 rounded-2xl bg-gradient-to-br from-purple-500/10 to-purple-500/5 border border-purple-500/20">
                <Lightbulb className="w-8 h-8 md:w-9 md:h-9 text-purple-400 mb-2 md:mb-3" />
                <div className="text-2xl md:text-3xl font-bold mb-1">40+</div>
                <div className="text-gray-400 text-sm md:text-base">Projects</div>
              </div>
              <div className="p-4 md:p-5 rounded-2xl bg-gradient-to-br from-purple-500/10 to-purple-500/5 border border-purple-500/20">
                <Trophy className="w-8 h-8 md:w-9 md:h-9 text-purple-400 mb-2 md:mb-3" />
                <div className="text-2xl md:text-3xl font-bold mb-1">12</div>
                <div className="text-gray-400 text-sm md:text-base">Awards</div>
              </div>
              <div className="p-4 md:p-5 rounded-2xl bg-gradient-to-br from-blue-500/10 to-blue-500/5 border border-blue-500/20">
                <Zap className="w-8 h-8 md:w-9 md:h-9 text-blue-400 mb-2 md:mb-3" />
                <div className="text-2xl md:text-3xl font-bold mb-1">5th</div>
                <div className="text-gray-400 text-sm md:text-base">Annual Event</div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 md:gap-4 shrink-0">
            <div className="p-4 md:p-5 rounded-2xl bg-gradient-to-br from-white/5 to-white/[0.02] border border-white/10">
              <div className="w-10 h-10 rounded-lg bg-blue-500/10 flex items-center justify-center mb-3">
                <Lightbulb className="w-5 h-5 text-blue-400" />
              </div>
              <h3 className="text-base md:text-lg font-semibold mb-1">Live Demos & Presentations</h3>
              <p className="text-gray-400 text-sm">Interactive showcases where students demonstrate their projects in real-time</p>
            </div>
            <div className="p-4 md:p-5 rounded-2xl bg-gradient-to-br from-white/5 to-white/[0.02] border border-white/10">
              <div className="w-10 h-10 rounded-lg bg-purple-500/10 flex items-center justify-center mb-3">
                <Users className="w-5 h-5 text-purple-400" />
              </div>
              <h3 className="text-base md:text-lg font-semibold mb-1">Networking Opportunities</h3>
              <p className="text-gray-400 text-sm">Connect with industry professionals, alumni, and fellow innovators</p>
            </div>
            <div className="p-4 md:p-5 rounded-2xl bg-gradient-to-br from-white/5 to-white/[0.02] border border-white/10">
              <div className="w-10 h-10 rounded-lg bg-blue-500/10 flex items-center justify-center mb-3">
                <Trophy className="w-5 h-5 text-blue-400" />
              </div>
              <h3 className="text-base md:text-lg font-semibold mb-1">Awards & Recognition</h3>
              <p className="text-gray-400 text-sm">Outstanding projects recognized across multiple categories</p>
            </div>
          </div>
        </div>
      </section>

      {/* Call for Submissions */}
      <section id="submit" className="py-20 px-6 relative min-h-screen snap-start flex flex-col justify-center">
        <div className="max-w-4xl mx-auto">
          <div className="p-10 rounded-3xl bg-gradient-to-br from-blue-500/10 via-purple-500/10 to-blue-500/10 border border-purple-500/20 relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-r from-blue-500/5 to-purple-500/5"></div>
            <div className="relative z-10">
              <span className="text-sm uppercase tracking-wider text-purple-400 font-medium">Call for Demos</span>
              <h2 className="text-4xl md:text-5xl mt-4 mb-6">Submit Your Project</h2>
              <p className="text-xl text-gray-300 mb-8 leading-relaxed">
                Applications are open! Fill out the form below to register your project. Deadline: <span className="text-white font-medium">April 30, 2026</span>
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
                  <p className="text-gray-300">Teams of 1–4 members are eligible to participate</p>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded-full bg-blue-500/20 border-2 border-blue-500 flex items-center justify-center mt-1 flex-shrink-0">
                    <div className="w-2 h-2 rounded-full bg-blue-500"></div>
                  </div>
                  <p className="text-gray-300">A working demo or prototype is required — slides alone are not sufficient</p>
                </div>
              </div>
              
              <a 
                href="https://docs.google.com/forms/d/e/1FAIpQLSevBxky8AILviHbGyK3XLmtiOqw8ddW8tQ0AIy7ZLS1MInYBg/viewform" 
                target="_blank" 
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-8 py-4 rounded-xl bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 transition-all shadow-lg shadow-purple-500/30 text-lg font-medium"
              >
                Submit Application
                <ChevronDown className="w-5 h-5 rotate-[-90deg]" />
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* Schedule Section */}
      <section id="schedule" className="py-20 px-6 relative min-h-screen snap-start flex flex-col justify-center">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-16">
            <span className="text-sm uppercase tracking-wider text-purple-400 font-medium">Day of the Event</span>
            <h2 className="text-4xl md:text-5xl mt-4 mb-4">Schedule</h2>
            <p className="text-gray-400 text-lg">March 27, 2026 · Advanced Computing Hub, University of Windsor</p>
          </div>
          
          <div className="space-y-4">
            <div className="flex gap-6 items-start group">
              <div className="flex flex-col items-center">
                <div className="w-3 h-3 rounded-full bg-blue-500 ring-4 ring-blue-500/20"></div>
                <div className="w-0.5 h-full bg-gradient-to-b from-blue-500/50 to-transparent mt-2"></div>
              </div>
              <div className="flex-1 pb-12">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-gray-400 font-medium">10:00 AM</span>
                  <span className="px-3 py-1 rounded-full bg-blue-500/10 text-blue-400 text-sm">Setup</span>
                </div>
                <h3 className="text-xl mb-2">Welcome & Opening</h3>
                <p className="text-gray-400">Teams set up their booths and attendees register</p>
              </div>
            </div>

            <div className="flex gap-6 items-start group">
              <div className="flex flex-col items-center">
                <div className="w-3 h-3 rounded-full bg-purple-500 ring-4 ring-purple-500/20"></div>
                <div className="w-0.5 h-full bg-gradient-to-b from-purple-500/50 to-transparent mt-2"></div>
              </div>
              <div className="flex-1 pb-12">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-gray-400 font-medium">10:15 AM</span>
                  <span className="px-3 py-1 rounded-full bg-purple-500/10 text-purple-400 text-sm">Demos</span>
                </div>
                <h3 className="text-xl mb-2">Student Demo Showcase Begins</h3>
                <p className="text-gray-400">First batch of project presentations. Judges and attendees circulate the floor</p>
              </div>
            </div>

            <div className="flex gap-6 items-start group">
              <div className="flex flex-col items-center">
                <div className="w-3 h-3 rounded-full bg-blue-500 ring-4 ring-blue-500/20"></div>
                <div className="w-0.5 h-full bg-gradient-to-b from-blue-500/50 to-transparent mt-2"></div>
              </div>
              <div className="flex-1 pb-12">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-gray-400 font-medium">11:00 AM</span>
                  <span className="px-3 py-1 rounded-full bg-blue-500/10 text-blue-400 text-sm">Networking</span>
                </div>
                <h3 className="text-xl mb-2">Poster Presentations & Networking</h3>
                <p className="text-gray-400">Interactive poster sessions with industry guests and faculty</p>
              </div>
            </div>

            <div className="flex gap-6 items-start group">
              <div className="flex flex-col items-center">
                <div className="w-3 h-3 rounded-full bg-purple-500 ring-4 ring-purple-500/20"></div>
                <div className="w-0.5 h-full bg-gradient-to-b from-purple-500/50 to-transparent mt-2"></div>
              </div>
              <div className="flex-1 pb-12">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-gray-400 font-medium">12:30 PM</span>
                  <span className="px-3 py-1 rounded-full bg-purple-500/10 text-purple-400 text-sm">Closing</span>
                </div>
                <h3 className="text-xl mb-2">Closing & Final Networking</h3>
                <p className="text-gray-400">Event concludes. Informal networking with guests and recruiters</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section id="faq" className="py-20 px-6 relative min-h-screen snap-start flex flex-col justify-center">
        <div className="max-w-3xl mx-auto">
          <div className="text-center mb-16">
            <span className="text-sm uppercase tracking-wider text-purple-400 font-medium">FAQ</span>
            <h2 className="text-4xl md:text-5xl mt-4">Common Questions</h2>
          </div>
          
          <Accordion type="single" collapsible value={openFaq} onValueChange={setOpenFaq}>
            <AccordionItem value="item-1" className="border-white/10 mb-4">
              <AccordionTrigger className="text-lg hover:no-underline py-6 px-6 rounded-xl bg-white/5 hover:bg-white/10 transition-all data-[state=open]:bg-white/10 data-[state=open]:rounded-b-none">
                Who can attend?
              </AccordionTrigger>
              <AccordionContent className="px-6 py-6 bg-white/5 rounded-b-xl border-t border-white/10">
                <p className="text-gray-300 leading-relaxed">
                  CS Demo Day is open to everyone! Students, faculty, industry professionals, alumni, and members of the broader community are all welcome to attend. No registration is required for attendees.
                </p>
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="item-2" className="border-white/10 mb-4">
              <AccordionTrigger className="text-lg hover:no-underline py-6 px-6 rounded-xl bg-white/5 hover:bg-white/10 transition-all data-[state=open]:bg-white/10 data-[state=open]:rounded-b-none">
                Who can submit a project?
              </AccordionTrigger>
              <AccordionContent className="px-6 py-6 bg-white/5 rounded-b-xl border-t border-white/10">
                <p className="text-gray-300 leading-relaxed">
                  Any current Computer Science student at the University of Windsor (undergraduate or graduate) can submit a project. Teams of 1-4 members are eligible. Projects must be original work completed during the current academic year.
                </p>
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="item-3" className="border-white/10 mb-4">
              <AccordionTrigger className="text-lg hover:no-underline py-6 px-6 rounded-xl bg-white/5 hover:bg-white/10 transition-all data-[state=open]:bg-white/10 data-[state=open]:rounded-b-none">
                What kinds of projects are accepted?
              </AccordionTrigger>
              <AccordionContent className="px-6 py-6 bg-white/5 rounded-b-xl border-t border-white/10">
                <p className="text-gray-300 leading-relaxed">
                  We accept a wide range of projects including personal projects, course-based work, advanced research, and thesis projects. Categories include AI & Machine Learning, Web & Mobile Development, Systems & Networking, Human-Computer Interaction, Cybersecurity, Data Science & Visualization, Embedded & IoT Systems, and more. A working demo or prototype is required.
                </p>
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="item-4" className="border-white/10 mb-4">
              <AccordionTrigger className="text-lg hover:no-underline py-6 px-6 rounded-xl bg-white/5 hover:bg-white/10 transition-all data-[state=open]:bg-white/10 data-[state=open]:rounded-b-none">
                Is registration required?
              </AccordionTrigger>
              <AccordionContent className="px-6 py-6 bg-white/5 rounded-b-xl border-t border-white/10">
                <p className="text-gray-300 leading-relaxed">
                  Registration is not required for general attendees. However, if you wish to present a project, you must submit your project through the submission form by the deadline (April 30, 2026).
                </p>
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="item-5" className="border-white/10 mb-4">
              <AccordionTrigger className="text-lg hover:no-underline py-6 px-6 rounded-xl bg-white/5 hover:bg-white/10 transition-all data-[state=open]:bg-white/10 data-[state=open]:rounded-b-none">
                Where is the venue?
              </AccordionTrigger>
              <AccordionContent className="px-6 py-6 bg-white/5 rounded-b-xl border-t border-white/10">
                <p className="text-gray-300 leading-relaxed">
                  The event will be held at the Advanced Computing Hub, University of Windsor. Detailed directions and parking information will be shared closer to the event date.
                </p>
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="item-6" className="border-white/10">
              <AccordionTrigger className="text-lg hover:no-underline py-6 px-6 rounded-xl bg-white/5 hover:bg-white/10 transition-all data-[state=open]:bg-white/10 data-[state=open]:rounded-b-none">
                Can I attend even if I'm not presenting?
              </AccordionTrigger>
              <AccordionContent className="px-6 py-6 bg-white/5 rounded-b-xl border-t border-white/10">
                <p className="text-gray-300 leading-relaxed">
                  Absolutely! We encourage all students, faculty, and community members to attend and support our presenters. It's a great opportunity to see innovative projects, network with peers and industry professionals, and get inspired.
                </p>
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </div>
      </section>

      {/* Footer */}
      <footer id="footer" className="border-t border-white/10 py-12 px-6 min-h-screen snap-start flex flex-col justify-center">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-3 gap-12 mb-12">
            <div>
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
                  <Zap className="w-5 h-5 text-white" />
                </div>
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
                <button onClick={() => scrollToSection('about')} className="block text-gray-400 hover:text-white transition-colors">
                  About
                </button>
                <button onClick={() => scrollToSection('submit')} className="block text-gray-400 hover:text-white transition-colors">
                  Apply
                </button>
                <button onClick={() => scrollToSection('schedule')} className="block text-gray-400 hover:text-white transition-colors">
                  Schedule
                </button>
                <button onClick={() => scrollToSection('faq')} className="block text-gray-400 hover:text-white transition-colors">
                  FAQ
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
                <div className="flex items-start gap-2">
                  <MapPin className="w-5 h-5 text-blue-400 mt-0.5 flex-shrink-0" />
                  <span>Advanced Computing Hub, University of Windsor</span>
                </div>
                <div className="flex items-start gap-2">
                  <Clock className="w-5 h-5 text-purple-400 mt-0.5 flex-shrink-0" />
                  <span>10:00 AM – 1:00 PM</span>
                </div>
              </div>
            </div>
          </div>
          
          <div className="pt-8 border-t border-white/10 flex flex-col md:flex-row items-center justify-between gap-4">
            <p className="text-gray-400 text-sm">
              © 2026 School of Computer Science, University of Windsor. All rights reserved.
            </p>
            <p className="text-gray-400 text-sm">
              Submission deadline: <span className="text-white">April 30, 2026</span>
            </p>
          </div>
        </div>
      </footer>
      </main>

      {/* Section progress indicator */}
      <div
        className="fixed right-6 top-1/2 z-50 -translate-y-1/2 flex flex-col gap-3"
        aria-label="Page sections"
      >
        {SECTION_IDS.map((id, i) => (
          <button
            key={id}
            onClick={() => scrollToSection(id)}
            className="rounded-full p-1 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-white/50"
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
            className="fixed bottom-8 left-1/2 z-50 -translate-x-1/2 flex items-center justify-center w-11 h-11 rounded-full border border-white/20 bg-white/5 hover:bg-white/10 hover:border-white/30 transition-colors"
            aria-label="Scroll to next section"
          >
            <ChevronDown className="w-5 h-5 text-white/80" />
          </motion.button>
        )}
      </AnimatePresence>
    </div>
  );
}
