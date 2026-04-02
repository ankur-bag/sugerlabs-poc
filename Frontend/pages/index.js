import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import { motion, useScroll, useTransform, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { FaCode } from "react-icons/fa";
import { IoMdColorPalette } from "react-icons/io";
import { FiMusic } from "react-icons/fi";
import { useAuth, SignInButton } from "@clerk/nextjs";
import { LuNotepadText, LuBrain, LuStar, LuUser } from "react-icons/lu";

const activities = [
  { id: "Coding", title: "Coding", desc: "Reflect on your logic, debugging, and creative problem solving.", icon: <FaCode /> },
  { id: "Drawing", title: "Drawing", desc: "Explore your artistic process, color choices, and visual expression.", icon: <IoMdColorPalette /> },
  { id: "MusicBlocks", title: "Music", desc: "Capture the rhythm of your composition and musical ideas.", icon: <FiMusic /> },
  { id: "Writing", title: "Writing", desc: "Document your narrative flow, character development, and themes.", icon: <LuNotepadText /> }
];

const springTransition = { type: "spring", stiffness: 100, damping: 20, mass: 1 };

export default function LandingPage() {
  const router = useRouter();
  const { isSignedIn, isLoaded, userId } = useAuth();
  const { scrollYProgress } = useScroll();
  const y = useTransform(scrollYProgress, [0, 1], [0, -100]);
  const opacity = useTransform(scrollYProgress, [0, 0.5], [1, 0]);

  const [selectedActivity, setSelectedActivity] = useState(null);
  const [projectName, setProjectName] = useState("");

  useEffect(() => {
    if (isLoaded && isSignedIn && userId) {
      const checkUser = async () => {
        try {
          const res = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/user/${userId}`);
          if (res.status === 404) router.push('/onboarding');
        } catch (err) {
          console.error("Error checking user:", err);
        }
      };
      checkUser();
    }
  }, [isLoaded, isSignedIn, userId, router]);

  const handleStart = () => {
    if (selectedActivity && projectName.trim()) {
      router.push(`/reflect?activity=${encodeURIComponent(selectedActivity)}&project=${encodeURIComponent(projectName)}`);
    }
  };

  return (
    <div className="min-h-screen relative overflow-hidden text-gray-800 bg-white">
      {/* Removed Navbar */}

      {/* Minimalist Hero Section */}
      <section className="pt-32 pb-40 px-6 max-w-5xl mx-auto text-center relative z-10 flex flex-col items-center justify-center min-h-[85vh]">
        {/* Subtle background glow */}
        <div className="absolute top-20 left-1/2 -translate-x-1/2 w-full max-w-3xl h-96 bg-gray-50 rounded-full blur-[100px] opacity-70 -z-10 pointer-events-none" />
        
        <motion.div style={{ y, opacity }} className="w-full">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
            className="flex flex-col items-center"
          >
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/60 backdrop-blur-md border border-gray-100 text-gray-500 text-xs md:text-sm font-light mb-8 md:mb-12 shadow-sm">
              <span className="w-2 h-2 rounded-full bg-gray-900 animate-pulse" />
              INTELLIGENT REFLECTION
            </div>

            <h1 className="text-5xl sm:text-6xl md:text-[6rem] font-light text-gray-900 mb-8 md:mb-10 tracking-tighter leading-[1.05] px-2">
              A thoughtful space <br className="hidden sm:block" />
              <span className="text-gray-300 italic font-serif tracking-normal">for young minds.</span>
            </h1>
            <p className="text-lg sm:text-xl md:text-2xl text-gray-400 font-light leading-relaxed max-w-2xl mx-auto mb-10 md:mb-14 px-6 md:px-4">
              Turn your everyday creative activities into profound learning experiences through gentle, AI-guided journaling.
            </p>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4, duration: 1 }}
            className="flex flex-col sm:flex-row items-center justify-center gap-4 px-6 sm:px-0"
          >
            <button 
              onClick={() => document.getElementById("start-section").scrollIntoView({ behavior: 'smooth' })}
              className="framer-button px-10 py-4 text-lg cursor-pointer flex items-center justify-center gap-2 w-full sm:w-auto"
            >
              Start Reflection
            </button>
            <button 
              onClick={() => router.push('/journal')}
              className="px-10 py-4 bg-white border border-gray-200 rounded-full text-gray-600 hover:text-gray-900 hover:border-gray-300 hover:bg-gray-50 font-normal transition-all text-lg cursor-pointer shadow-sm w-full sm:w-auto"
            >
              Journals
            </button>
          </motion.div>
        </motion.div>

        {/* Feature Highlights Grid */}
        <motion.div 
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.6, duration: 1 }}
          className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-10 mt-24 md:mt-32 w-full max-w-5xl mx-auto px-4"
        >
          {[
            { icon: <LuBrain className="text-gray-900" />, title: "AI Buddy", text: "A gentle mentor that uses Kolb's cycle to guide your reflection with natural dialogue." },
            { icon: <LuStar className="text-gray-900" />, title: "Star Metrics", text: "Get clear, star-rated feedback for every stage, with detailed AI reasoning personalized to you." },
            { icon: <LuUser className="text-gray-900" />, title: "Personal Journals", text: "Your thoughts are turned into 3-5 sentence first-person stories, creating a rich record of growth." }
          ].map((feature, i) => (
            <div key={i} className="flex flex-col items-center p-8 rounded-[2rem] bg-gray-50/50 border border-gray-100/50 hover:bg-white hover:shadow-xl hover:border-gray-200 transition-all duration-500 group">
              <div className="w-12 h-12 rounded-2xl bg-white flex items-center justify-center mb-6 shadow-sm group-hover:scale-110 transition-transform">
                {feature.icon}
              </div>
              <h4 className="text-[12px] font-bold uppercase tracking-widest text-gray-900 mb-3">{feature.title}</h4>
              <p className="text-[11px] text-gray-400 font-light text-center leading-relaxed px-2">{feature.text}</p>
            </div>
          ))}
        </motion.div>
      </section>

      {/* How Reflection Works — Kolb's Experiential Learning Cycle */}
      <section id="how-it-works" className="py-28 md:py-36 px-6 relative z-10 bg-white/60">
        <div className="max-w-5xl mx-auto">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: "-100px" }}
            transition={springTransition}
            className="text-center mb-6"
          >
            <p className="text-xs uppercase tracking-[0.25em] text-gray-400 font-medium mb-5">Grounded in Learning Science</p>
            <h2 className="text-4xl md:text-5xl font-light text-gray-900 tracking-tight">
              How Reflection Works
            </h2>
          </motion.div>

          <motion.p
            initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }}
            transition={{ delay: 0.15, duration: 0.8 }}
            className="text-center text-gray-400 font-light text-base md:text-lg max-w-2xl mx-auto mb-20 leading-relaxed"
          >
            Our AI guides every child through <span className="text-gray-600 font-normal">Kolb&apos;s Experiential Learning Cycle</span> — four simple stages that turn creative projects into deep understanding.
          </motion.p>

          {/* 4 Stage Cards — Vertical Timeline */}
          <div className="relative max-w-3xl mx-auto">
            {/* Vertical connector line (desktop) */}
            <div className="hidden md:block absolute left-[27px] top-8 bottom-8 w-px bg-gradient-to-b from-gray-200 via-gray-200 to-transparent" />

            {[{
              num: "01",
              title: "Concrete Experience",
              subtitle: "What did you do?",
              desc: "The child describes the activity they just completed — what they built, created, or explored in their Sugar project.",
              accent: "bg-gray-900",
              ring: "ring-gray-900/10",
              bg: "bg-white"
            }, {
              num: "02",
              title: "Reflective Observation",
              subtitle: "How did it feel?",
              desc: "They reflect on the experience — what surprised them, what was hard, and what emotions came up while working.",
              accent: "bg-gray-700",
              ring: "ring-gray-700/10",
              bg: "bg-white"
            }, {
              num: "03",
              title: "Abstract Conceptualization",
              subtitle: "What did you learn?",
              desc: "The child connects their experience to a lesson — a new skill, a pattern they noticed, or an idea they now understand better.",
              accent: "bg-gray-500",
              ring: "ring-gray-500/10",
              bg: "bg-white"
            }, {
              num: "04",
              title: "Active Experimentation",
              subtitle: "What will you try next?",
              desc: "They look forward — planning how to apply what they learned in their next project or iteration.",
              accent: "bg-gray-400",
              ring: "ring-gray-400/10",
              bg: "bg-white"
            }].map((stage, i) => (
              <motion.div
                key={stage.num}
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true, margin: "-60px" }}
                transition={{ ...springTransition, delay: i * 0.1 }}
                className="relative flex items-start gap-6 md:gap-8 mb-6 last:mb-0 group"
              >
                {/* Timeline dot */}
                <div className="relative z-10 flex-shrink-0">
                  <div className={`w-[54px] h-[54px] rounded-2xl ${stage.accent} text-white flex items-center justify-center text-sm font-medium shadow-sm ring-4 ${stage.ring} transition-all duration-300 group-hover:shadow-md group-hover:scale-105`}>
                    {stage.num}
                  </div>
                </div>

                {/* Card */}
                <motion.div
                  whileHover={{ y: -2 }}
                  className={`${stage.bg} flex-1 p-6 md:p-8 rounded-2xl border border-gray-100 shadow-[0_1px_3px_rgba(0,0,0,0.04)] transition-all duration-300 group-hover:shadow-lg group-hover:border-gray-200`}
                >
                  <div className="flex flex-col sm:flex-row sm:items-baseline sm:gap-3 mb-2">
                    <h3 className="text-lg md:text-xl font-medium text-gray-900 tracking-tight">{stage.title}</h3>
                    <span className="text-sm text-gray-400 font-light italic">{stage.subtitle}</span>
                  </div>
                  <p className="text-gray-500 font-light text-sm md:text-base leading-relaxed">{stage.desc}</p>
                </motion.div>
              </motion.div>
            ))}
          </div>

          {/* Cycle indicator */}
          <motion.div
            initial={{ opacity: 0, y: 10 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
            transition={{ delay: 0.5, duration: 0.8 }}
            className="flex justify-center mt-16"
          >
            <div className="inline-flex items-center gap-3 px-6 py-3 rounded-full bg-white border border-gray-100 shadow-sm">
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none" className="text-gray-400 animate-spin" style={{ animationDuration: '8s' }}>
                <path d="M10 2 A8 8 0 1 1 2 10" stroke="currentColor" strokeWidth="1.5" fill="none" strokeLinecap="round" />
                <path d="M10 2 L 12 4.5 M10 2 L 12 0" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
              </svg>
              <span className="text-sm text-gray-400 font-light">The cycle repeats with every new project</span>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Clean Interaction Section */}
      <section id="start-section" className="py-24 px-6 max-w-5xl mx-auto relative z-10">
        <div className="mb-14 text-center">
          <h2 className="text-3xl md:text-4xl font-light text-gray-900 tracking-tight mb-4">
            Begin writing
          </h2>
          <p className="text-gray-500 font-light text-lg">Select your medium to get started.</p>
        </div>

        {(!isLoaded || !isSignedIn) ? (
          <motion.div 
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
            className="framer-panel p-16 text-center flex flex-col items-center justify-center max-w-2xl mx-auto relative overflow-hidden"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-gray-50/50 to-white -z-10" />
            <h3 className="text-2xl font-normal text-gray-900 mb-3 tracking-tight">Authentication Required</h3>
            <p className="text-gray-500 font-light mb-10 max-w-md leading-relaxed text-lg">Your reflections are deeply personal. Please sign in or create an account to start your secure journaling journey.</p>
            <SignInButton mode="modal">
              <button className="framer-button px-10 py-4 bg-gray-900 text-white rounded-full text-lg shadow-sm hover:shadow-md transition-all flex items-center gap-2 cursor-pointer">
                Sign In to Continue <span className="text-sm">→</span>
              </button>
            </SignInButton>
          </motion.div>
        ) : (
          <motion.div 
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={springTransition}
            className="framer-panel p-10 md:p-16 relative"
          >
            <div className="mb-14">
              <h3 className="text-lg font-normal text-gray-900 mb-6">1. Activity</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {activities.map(act => (
                  <motion.button
                    key={act.id}
                    whileTap={{ scale: 0.97 }}
                    onClick={() => setSelectedActivity(act.title)}
                    className={`p-6 rounded-2xl flex flex-col items-center gap-4 transition-all duration-300 border cursor-pointer ${
                      selectedActivity === act.title 
                        ? 'border-gray-900 bg-gray-900 text-white shadow-lg' 
                        : 'border-gray-100 bg-white text-gray-400 hover:border-gray-300 hover:text-gray-900'
                    }`}
                  >
                    <div className="text-3xl">
                      {act.icon}
                    </div>
                    <span className="text-sm font-normal tracking-wide">
                      {act.title}
                    </span>
                  </motion.button>
                ))}
              </div>
            </div>

            <div className="mb-14">
              <h3 className="text-lg font-normal text-gray-900 mb-6">2. Project Title</h3>
              <input 
                type="text" 
                value={projectName}
                onChange={(e) => setProjectName(e.target.value)}
                placeholder="e.g. My First Game" 
                className="w-full px-6 py-4 framer-input text-lg"
              />
            </div>

            <div className="flex justify-center pt-6">
              <button
                onClick={handleStart}
                disabled={!selectedActivity || !projectName.trim()}
                className="framer-button px-12 py-4 text-lg w-full md:w-auto cursor-pointer"
              >
                Continue
              </button>
            </div>
          </motion.div>
        )}
      </section>
      
      {/* Minimal Footer */}
      <footer className="flex flex-col items-center gap-4 justify-center pb-12 text-gray-400 text-sm font-light">
        <p>A minimalist space for reflection.</p>
      </footer>
    </div>
  );
}
