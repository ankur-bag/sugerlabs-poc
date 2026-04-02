import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { useRouter } from "next/router";
import { FaCode, FaStar } from "react-icons/fa";
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
      default: return <LuNotepadText />;
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

  const sortedEntries = [...entries].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

  return (
    <motion.div 
      initial={{ opacity: 0 }} 
      animate={{ opacity: 1 }} 
      exit={{ opacity: 0 }}
      className="max-w-7xl mx-auto px-6 py-12 min-h-screen bg-white relative"
    >
      <button onClick={() => router.push('/')} className="mb-12 text-gray-400 hover:text-gray-900 transition-colors text-sm font-light flex items-center gap-1 group">
        <span className="group-hover:-translate-x-1 transition-transform">←</span> Home
      </button>

      <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-16 gap-6">
        <div>
          <h1 className="text-4xl font-light text-gray-900 mb-2 tracking-tight italic">
            Reflections
          </h1>
          <p className="text-sm text-gray-400 font-light tracking-widest uppercase">
            Your Creative Archive
          </p>
        </div>
        <Link href="/" className="framer-button px-8 py-3 text-xs tracking-widest font-medium uppercase border-gray-900 bg-gray-900 text-white hover:bg-white hover:text-gray-900">
          New Entry
        </Link>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {[1, 2, 3, 4, 5, 6].map(i => (
            <div key={i} className="framer-panel h-96 animate-pulse border border-gray-50 bg-gray-50/30" />
          ))}
        </div>
      ) : entries.length === 0 ? (
        <motion.div 
          initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} transition={springTransition}
          className="framer-panel max-w-xl mx-auto text-center py-32 px-10 border border-gray-100/50"
        >
          <LuNotepadText className="text-4xl text-gray-200 mx-auto mb-8" strokeWidth={1} />
          <h3 className="text-2xl font-light text-gray-900 mb-4 tracking-tight">Empty Journal</h3>
          <p className="text-gray-400 font-light text-sm max-w-xs mx-auto leading-relaxed">Start an activity to begin your story.</p>
        </motion.div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 items-start">
          {/* Pinterest-style Column 1 */}
          <div className="flex flex-col gap-8">
            {sortedEntries.filter((_, i) => i % 3 === 0).map((entry, idx) => (
              <JournalCard key={entry._id || idx} entry={entry} getIcon={getIcon} formatDate={formatDate} />
            ))}
          </div>
          {/* Pinterest-style Column 2 */}
          <div className="flex flex-col gap-8">
            {sortedEntries.filter((_, i) => i % 3 === 1).map((entry, idx) => (
              <JournalCard key={entry._id || idx} entry={entry} getIcon={getIcon} formatDate={formatDate} />
            ))}
          </div>
          {/* Pinterest-style Column 3 */}
          <div className="flex flex-col gap-8">
            {sortedEntries.filter((_, i) => i % 3 === 2).map((entry, idx) => (
              <JournalCard key={entry._id || idx} entry={entry} getIcon={getIcon} formatDate={formatDate} />
            ))}
          </div>
        </div>
      )}
    </motion.div>
  );
}

function JournalCard({ entry, getIcon, formatDate }) {
  return (
    <motion.div 
      layout
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="framer-panel flex flex-col group border border-gray-100 bg-white hover:border-gray-900/10 hover:shadow-[0_20px_50px_rgba(0,0,0,0.04)] transition-all duration-500 overflow-hidden relative"
    >
      {/* Header: Activity Icon & Date */}
      <div className="p-8 pb-4 flex justify-between items-center">
        <div className="w-12 h-12 rounded-2xl bg-gray-50 flex items-center justify-center text-xl text-gray-400 border border-transparent group-hover:bg-gray-900 group-hover:text-white transition-all duration-500">
          {getIcon(entry.activityType)}
        </div>
        <div className="text-[10px] text-gray-300 font-bold uppercase tracking-[0.2em]">
          {formatDate(entry.createdAt)}
        </div>
      </div>

      {/* Body: Title & Summary */}
      <div className="px-8 pb-8">
        <h3 className="font-medium text-xl text-gray-900 mb-6 tracking-tight leading-tight">
          {entry.projectName}
        </h3>
        <p className="text-gray-500 font-light leading-relaxed text-sm italic">
          “{entry.summary}”
        </p>
      </div>

      {/* Footer: Structured Scorecard */}
      <div className="mt-auto px-4 pb-4">
        <div className="bg-gray-50 group-hover:bg-gray-900/[0.02] rounded-[1.5rem] p-6 border border-gray-50/50 transition-all duration-500">
          <div className="flex items-center justify-between mb-6">
            <span className="text-[10px] uppercase font-bold tracking-widest text-gray-400">Reflection Metrics</span>
          </div>

          <div className="grid grid-cols-1 gap-4">
            {entry.quality_score?.scores && Object.entries(entry.quality_score.scores).map(([key, score]) => (
              <MetricRow key={key} label={key} score={score} reasoning={entry.quality_score.reasoning?.[key]} />
            ))}
          </div>
          
          {entry.quality_score?.feedback && (
            <div className="mt-6 pt-6 border-t border-gray-100">
              <div className="text-[9px] uppercase font-bold text-gray-300 tracking-[0.2em] mb-2">Feedback</div>
              <p className="text-[11px] text-gray-500 font-light leading-relaxed italic">
                {entry.quality_score.feedback}
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Transcript Link */}
      <div className="absolute top-4 right-4 flex items-center gap-2">
         <button 
          onClick={() => {/* Implement Transcript Modal */}}
          className="text-[9px] font-bold text-gray-200 uppercase tracking-widest opacity-0 group-hover:opacity-100 transition-opacity hover:text-gray-900"
        >
          Transcript
        </button>
      </div>
    </motion.div>
  );
}

function MetricRow({ label, score, reasoning }) {
  const [isHovered, setIsHovered] = useState(false);
  
  return (
    <div 
      className="group/metric relative"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className="flex justify-between items-center mb-1">
        <span className="text-[11px] font-medium text-gray-500 uppercase tracking-wider">{label}</span>
        <div className="flex gap-1">
          {[1, 2, 3, 4, 5].map(star => (
            <FaStar 
              key={star} 
              className={`text-[10px] transition-colors duration-500 ${star <= score ? 'text-amber-400' : 'text-gray-200'}`} 
            />
          ))}
        </div>
      </div>
      
      <AnimatePresence>
        {isHovered && reasoning && (
          <motion.div 
            initial={{ height: 0, opacity: 0, marginTop: 0 }}
            animate={{ height: "auto", opacity: 1, marginTop: 4 }}
            exit={{ height: 0, opacity: 0, marginTop: 0 }}
            transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
            className="overflow-hidden"
          >
            <div className="text-[11px] leading-relaxed text-gray-400 font-light pb-2">
              {reasoning}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
