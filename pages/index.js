import { useState } from "react";
import { useRouter } from "next/router";
import { motion, useScroll, useTransform, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { FaCode } from "react-icons/fa";
import { IoMdColorPalette } from "react-icons/io";
import { FiMusic } from "react-icons/fi";
import { LuNotepadText } from "react-icons/lu";
import { useAuth, SignInButton } from "@clerk/nextjs";

const activities = [
  { id: "Coding", title: "Coding", desc: "Reflect on your logic, debugging, and creative problem solving.", icon: <FaCode /> },
  { id: "Drawing", title: "Drawing", desc: "Explore your artistic process, color choices, and visual expression.", icon: <IoMdColorPalette /> },
  { id: "MusicBlocks", title: "Music", desc: "Capture the rhythm of your composition and musical ideas.", icon: <FiMusic /> },
  { id: "Writing", title: "Writing", desc: "Document your narrative flow, character development, and themes.", icon: <LuNotepadText /> }
];

const springTransition = { type: "spring", stiffness: 100, damping: 20, mass: 1 };

export default function LandingPage() {
  const router = useRouter();
  const { isSignedIn, isLoaded } = useAuth();
  const { scrollYProgress } = useScroll();
  const y = useTransform(scrollYProgress, [0, 1], [0, -100]);
  const opacity = useTransform(scrollYProgress, [0, 0.5], [1, 0]);

  const [selectedActivity, setSelectedActivity] = useState(null);
  const [projectName, setProjectName] = useState("");

  const handleStart = () => {
    if (selectedActivity && projectName.trim()) {
      router.push(`/reflect?activity=${encodeURIComponent(selectedActivity)}&project=${encodeURIComponent(projectName)}`);
    }
  };

  return (
    <div className="min-h-screen relative overflow-hidden text-gray-800 bg-white">
      {/* Removed Navbar */}

      {/* Minimalist Hero Section */}
      <section className="pt-24 pb-32 px-6 max-w-5xl mx-auto text-center relative z-10">
        <motion.div style={{ y, opacity }}>
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
          >
            <h1 className="text-5xl md:text-7xl font-light text-gray-900 mb-8 tracking-tight leading-tight">
              A thoughtful space <br/>
              <span className="text-gray-400">for young minds.</span>
            </h1>
            <p className="text-xl md:text-2xl text-gray-500 font-light leading-relaxed max-w-3xl mx-auto mb-16">
              Turn your everyday activities into profound learning experiences with gentle guided reflections.
            </p>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5, duration: 1 }}
            className="flex justify-center gap-6"
          >
            <button 
              onClick={() => document.getElementById("start-section").scrollIntoView({ behavior: 'smooth' })}
              className="framer-button px-8 py-4 text-lg"
            >
              Start Reflection
            </button>
            <button 
              onClick={() => document.getElementById("how-it-works").scrollIntoView({ behavior: 'smooth' })}
              className="px-8 py-4 text-gray-500 hover:text-gray-900 font-normal transition-colors text-lg"
            >
              Learn more
            </button>
          </motion.div>
        </motion.div>
      </section>

      {/* Elegant How it works Section */}
      <section id="how-it-works" className="py-32 px-6 bg-gray-50/50 border-y border-gray-100 relative z-10">
        <div className="max-w-6xl mx-auto">
          <motion.h2 
            initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: "-100px" }}
            transition={springTransition}
            className="text-3xl md:text-4xl font-light text-center mb-24 text-gray-900 tracking-tight"
          >
            How it works
          </motion.h2>

          <div className="grid md:grid-cols-3 gap-12 md:gap-8">
            {[
              { title: "Create", desc: "Build something new using code, art, music, or writing.", icon: <IoMdColorPalette /> },
              { title: "Reflect", desc: "Interact with an intelligent guide to explore your process and feelings.", icon: <LuNotepadText /> },
              { title: "Grow", desc: "Review your elegant journal to see your progress over time.", icon: <FiMusic /> }
            ].map((item, i) => (
              <motion.div 
                key={i}
                initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: "-50px" }} 
                transition={{ delay: i * 0.1, ...springTransition }}
                className="framer-panel p-10 text-center flex flex-col items-center group cursor-default"
              >
                <div className="text-4xl text-gray-300 group-hover:text-gray-900 transition-colors duration-500 mb-8">
                  {item.icon}
                </div>
                <h3 className="text-xl font-normal text-gray-900 mb-4">{item.title}</h3>
                <p className="text-gray-500 font-light leading-relaxed">{item.desc}</p>
              </motion.div>
            ))}
          </div>
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
              <button className="framer-button px-10 py-4 bg-gray-900 text-white rounded-full text-lg shadow-sm hover:shadow-md transition-all flex items-center gap-2">
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
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                {activities.map(act => (
                  <motion.button
                    key={act.id}
                    whileTap={{ scale: 0.97 }}
                    onClick={() => setSelectedActivity(act.title)}
                    className={`p-6 rounded-2xl flex flex-col items-center gap-4 transition-all duration-300 border ${
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
                className="framer-button px-12 py-4 text-lg w-full md:w-auto"
              >
                Continue
              </button>
            </div>
          </motion.div>
        )}
      </section>
      
      {/* Minimal Footer */}
      <footer className="flex flex-col items-center gap-4 justify-center py-16 text-gray-400 text-sm font-light">
        <p>A minimalist space for reflection.</p>
        <Link href="/journal" className="hover:text-gray-900 transition-colors underline-offset-4 decoration-gray-200 hover:decoration-gray-300">
          View Journal Archive
        </Link>
      </footer>
    </div>
  );
}
