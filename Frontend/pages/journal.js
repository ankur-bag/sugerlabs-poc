import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { useRouter } from "next/router";
import { FaCode } from "react-icons/fa";
import { IoMdColorPalette } from "react-icons/io";
import { FiMusic } from "react-icons/fi";
import { LuNotepadText } from "react-icons/lu";
import { useAuth } from "@clerk/nextjs";

const springTransition = { type: "spring", stiffness: 100, damping: 20, mass: 1 };

export default function Journal() {
  const router = useRouter();
  const { isLoaded, isSignedIn, userId } = useAuth();
  const [entries, setEntries] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isLoaded || !isSignedIn || !userId) return;
    fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/reflections/${userId}`)
      .then(res => res.json())
      .then(data => {
        setEntries(data.entries || []);
        setLoading(false);
      })
      .catch(console.error);
  }, [isLoaded, isSignedIn, userId]);

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      month: 'long', day: 'numeric', year: 'numeric'
    });
  };

  const getIcon = (type) => {
    switch (type) {
      case "Coding": return <FaCode />;
      case "Drawing": return <IoMdColorPalette />;
      case "MusicBlocks": return <FiMusic />;
      case "Writing": return <LuNotepadText />;
      default: return "✨";
    }
  };

  if (!isLoaded) return <div className="min-h-screen bg-white"></div>;
  if (!isSignedIn) {
    return (
      <div className="h-screen flex flex-col items-center justify-center bg-white px-6">
        <div className="framer-panel p-12 text-center max-w-md mx-6">
          <h2 className="text-2xl font-light text-gray-900 mb-4">Private Journal</h2>
          <p className="text-gray-500 font-light mb-8">Please sign in to view your reflection archives.</p>
          <button onClick={() => router.push('/')} className="framer-button px-8 py-3">Return Home</button>
        </div>
      </div>
    );
  }

  return (
    <motion.div 
      initial={{ opacity: 0 }} 
      animate={{ opacity: 1 }} 
      exit={{ opacity: 0 }}
      className="max-w-5xl mx-auto px-6 py-20 min-h-screen bg-white relative"
    >
      <button onClick={() => router.push('/')} className="absolute top-8 left-6 text-gray-400 hover:text-gray-900 transition-colors text-sm font-light flex items-center gap-1">
        ← Back
      </button>

      <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-20 gap-8 pb-4">
        <div>
          <h1 className="text-4xl md:text-5xl font-light text-gray-900 mb-4 tracking-tight">
            Journal
          </h1>
          <p className="text-lg text-gray-400 font-light tracking-wide">
            Your archives of reflection.
          </p>
        </div>
        <Link href="/" className="framer-button px-8 py-3 text-sm">
          New Entry
        </Link>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {[1, 2, 3, 4].map(i => (
            <div key={i} className="framer-panel h-64 animate-pulse border border-gray-50 bg-gray-50/50" />
          ))}
        </div>
      ) : entries.length === 0 ? (
        <motion.div 
          initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} transition={springTransition}
          className="framer-panel max-w-2xl mx-auto text-center py-32 px-10 border border-gray-100"
        >
          <div className="text-4xl text-gray-300 mb-8 flex justify-center">
            <LuNotepadText />
          </div>
          <h3 className="text-2xl font-light text-gray-900 mb-4">Nothing here yet</h3>
          <p className="text-lg text-gray-500 font-light">Complete an activity to begin your journal.</p>
        </motion.div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          <AnimatePresence>
            {entries.map((entry, idx) => (
              <motion.div 
                key={entry._id || idx}
                initial={{ opacity: 0, y: 40 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.1, ...springTransition }}
                className="framer-panel p-10 flex flex-col group overflow-hidden"
              >
                <div className="flex justify-between items-start mb-8">
                  <div className="w-12 h-12 rounded-full bg-gray-50 flex items-center justify-center text-xl text-gray-600 border border-gray-100 group-hover:bg-gray-900 group-hover:text-white transition-colors duration-500">
                    {getIcon(entry.activityType)}
                  </div>
                  <div className="text-right">
                    <span className="inline-block px-3 py-1 bg-gray-50 border border-gray-100 text-gray-500 rounded-full text-xs font-normal tracking-wide mb-2">
                      {entry.activityType}
                    </span>
                    <div className="text-xs text-gray-400 font-light uppercase tracking-widest">
                      {formatDate(entry.createdAt)}
                    </div>
                  </div>
                </div>
                
                <h3 className="font-normal text-2xl text-gray-900 mb-4 tracking-tight">
                  {entry.projectName}
                </h3>
                
                <p className="text-gray-500 font-light leading-relaxed mb-8 flex-1 text-md">
                  {entry.summary}
                </p>
                
                {entry.reflections && entry.reflections.length > 0 && (
                  <details className="mt-auto group/details border-t border-gray-100 pt-6">
                    <summary className="text-gray-900 font-normal cursor-pointer list-none hover:text-gray-500 transition-colors text-sm flex items-center gap-2 select-none">
                      <span className="opacity-70 group-hover/details:opacity-100">Transcripts</span>
                      <svg className="w-4 h-4 transition-transform group-open/details:rotate-180 opacity-50" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                      </svg>
                    </summary>
                    <motion.div 
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="mt-6 space-y-6"
                    >
                      {entry.reflections.map((r, i) => (
                        <div key={i} className="text-sm">
                          <div className="font-normal text-gray-900 mb-2">Q: {r.question}</div>
                          <div className="text-gray-500 font-light leading-relaxed">A: {r.answer}</div>
                        </div>
                      ))}
                    </motion.div>
                  </details>
                )}
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}
    </motion.div>
  );
}
