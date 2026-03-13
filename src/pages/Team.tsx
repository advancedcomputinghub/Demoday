import { useRef, useEffect, useState } from 'react';
import { motion, useInView } from 'motion/react';
import { ChevronLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

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

export default function Team() {
  const navigate = useNavigate();
  const pageRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const contentInView = useInView(contentRef, { once: true, amount: 0.1 });

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.6 },
    },
  };

  return (
    <div ref={pageRef} className="min-h-screen bg-[#0a0a0f] text-white">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-[#0a0a0f]/80 backdrop-blur-xl border-b border-white/5">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4 flex items-center justify-between">
          <button
            type="button"
            onClick={() => navigate('/')}
            className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors"
            aria-label="Back to home"
          >
            <ChevronLeft className="w-5 h-5" />
            <span className="text-sm md:text-base">Back to Home</span>
          </button>
          <h1 className="text-xl md:text-2xl font-semibold">Our Team</h1>
          <div className="w-20" />
        </div>
      </header>

      {/* Our Team Section */}
      <main className="py-12 px-4 sm:px-6 md:py-20 md:px-6">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-10 md:mb-16" ref={contentRef}>
            <motion.span
              initial={{ opacity: 0 }}
              animate={contentInView ? { opacity: 1 } : { opacity: 0 }}
              transition={{ duration: 0.6 }}
              className="text-sm uppercase tracking-wider text-purple-400 font-medium"
            >
              Our Team
            </motion.span>
            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              animate={contentInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="text-3xl md:text-5xl mt-3 md:mt-4"
            >
              Meet the Team
            </motion.h2>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={contentInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="text-gray-400 mt-6 max-w-2xl mx-auto"
            >
              The dedicated faculty and staff making CS Demo Day 2026 possible
            </motion.p>
          </div>

          <motion.div
            className="space-y-8 md:space-y-12"
            variants={containerVariants}
            initial="hidden"
            animate={contentInView ? "visible" : "hidden"}
          >
            {/* Layer 1: Members 1-2 */}
            <div className="flex flex-wrap justify-center gap-6 md:gap-8">
              {TEAM_MEMBERS.slice(0, 2).map((member) => (
                <motion.div
                  key={member.id}
                  variants={itemVariants}
                  className="group relative flex flex-col items-center text-center rounded-xl overflow-hidden border border-white/10 hover:border-purple-500/30 transition-all duration-300 hover:shadow-[0_0_24px_rgba(139,92,246,0.18)] bg-white/[0.03] hover:bg-white/[0.06] p-6 w-full sm:w-auto"
                >
                  <div className="w-32 h-32 md:w-40 md:h-40 mb-6 rounded-full overflow-hidden bg-gradient-to-br from-purple-500/20 to-blue-500/20 flex items-center justify-center border border-white/10">
                    <img
                      src={member.image}
                      alt={member.name}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                    />
                  </div>
                  <h3 className="text-lg md:text-xl font-semibold text-white mb-2">{member.name}</h3>
                  <p className="text-sm md:text-base text-purple-400 font-medium">{member.designation}</p>
                </motion.div>
              ))}
            </div>

            {/* Layer 2: Members 3-4 */}
            <div className="flex flex-wrap justify-center gap-6 md:gap-8">
              {TEAM_MEMBERS.slice(2, 4).map((member) => (
                <motion.div
                  key={member.id}
                  variants={itemVariants}
                  className="group relative flex flex-col items-center text-center rounded-xl overflow-hidden border border-white/10 hover:border-purple-500/30 transition-all duration-300 hover:shadow-[0_0_24px_rgba(139,92,246,0.18)] bg-white/[0.03] hover:bg-white/[0.06] p-6 w-full sm:w-auto"
                >
                  <div className="w-32 h-32 md:w-40 md:h-40 mb-6 rounded-full overflow-hidden bg-gradient-to-br from-purple-500/20 to-blue-500/20 flex items-center justify-center border border-white/10">
                    <img
                      src={member.image}
                      alt={member.name}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                    />
                  </div>
                  <h3 className="text-lg md:text-xl font-semibold text-white mb-2">{member.name}</h3>
                  <p className="text-sm md:text-base text-purple-400 font-medium">{member.designation}</p>
                </motion.div>
              ))}
            </div>

            {/* Layer 3: Members 5-7 */}
            <div className="flex flex-wrap justify-center gap-6 md:gap-8">
              {TEAM_MEMBERS.slice(4, 7).map((member) => (
                <motion.div
                  key={member.id}
                  variants={itemVariants}
                  className="group relative flex flex-col items-center text-center rounded-xl overflow-hidden border border-white/10 hover:border-purple-500/30 transition-all duration-300 hover:shadow-[0_0_24px_rgba(139,92,246,0.18)] bg-white/[0.03] hover:bg-white/[0.06] p-6 w-full sm:w-auto"
                >
                  <div className="w-32 h-32 md:w-40 md:h-40 mb-6 rounded-full overflow-hidden bg-gradient-to-br from-purple-500/20 to-blue-500/20 flex items-center justify-center border border-white/10">
                    <img
                      src={member.image}
                      alt={member.name}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                    />
                  </div>
                  <h3 className="text-lg md:text-xl font-semibold text-white mb-2">{member.name}</h3>
                  <p className="text-sm md:text-base text-purple-400 font-medium">{member.designation}</p>
                </motion.div>
              ))}
            </div>

            {/* Layer 4: Members 8-10 */}
            <div className="flex flex-wrap justify-center gap-6 md:gap-8">
              {TEAM_MEMBERS.slice(7, 10).map((member) => (
                <motion.div
                  key={member.id}
                  variants={itemVariants}
                  className="group relative flex flex-col items-center text-center rounded-xl overflow-hidden border border-white/10 hover:border-purple-500/30 transition-all duration-300 hover:shadow-[0_0_24px_rgba(139,92,246,0.18)] bg-white/[0.03] hover:bg-white/[0.06] p-6 w-full sm:w-auto"
                >
                  <div className="w-32 h-32 md:w-40 md:h-40 mb-6 rounded-full overflow-hidden bg-gradient-to-br from-purple-500/20 to-blue-500/20 flex items-center justify-center border border-white/10">
                    <img
                      src={member.image}
                      alt={member.name}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                    />
                  </div>
                  <h3 className="text-lg md:text-xl font-semibold text-white mb-2">{member.name}</h3>
                  <p className="text-sm md:text-base text-purple-400 font-medium">{member.designation}</p>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      </main>
    </div>
  );
}
