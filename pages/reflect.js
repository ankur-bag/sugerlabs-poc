import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/router";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "@clerk/nextjs";

const springTransition = { type: "spring", stiffness: 100, damping: 20, mass: 1 };

export default function Reflect() {
  const router = useRouter();
  const { activity, project } = router.query;
  const { isLoaded, isSignedIn } = useAuth();
  
  const [history, setHistory] = useState([]); 
  const [inputText, setInputText] = useState("");
  const [isTyping, setIsTyping] = useState(true);
  const [isFinished, setIsFinished] = useState(false);
  
  const messagesEndRef = useRef(null);
  
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };
  
  useEffect(() => {
    scrollToBottom();
  }, [history, isTyping]);

  useEffect(() => {
    if (!activity || !project || !isLoaded || !isSignedIn) return;
    
    // Start dynamic reflection by sending an empty history to let AI infer the first stage
    const startReflection = async () => {
      try {
        const res = await fetch("/api/ai?action=reflect", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ history: [], activityType: activity, projectName: project })
        });
        const data = await res.json();
        
        if (data.question) {
          setHistory([{ role: 'model', text: data.question }]);
          setIsTyping(false);
        }
      } catch (err) {
        setHistory([{ role: 'model', text: "Service unavailable." }]);
        setIsTyping(false);
      }
    };
    
    startReflection();
  }, [activity, project, isLoaded, isSignedIn]);

  const handleSend = async () => {
    if (!inputText.trim() || isTyping) return;
    
    const userMessage = inputText.trim();
    setInputText("");
    
    const newHistory = [...history, { role: 'user', text: userMessage }];
    setHistory(newHistory);
    setIsTyping(true);

    try {
      const res = await fetch("/api/ai?action=reflect", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          history: newHistory,
          activityType: activity,
          projectName: project
        })
      });
      
      const resText = await res.text();
      if (!res.ok) throw new Error(resText);
      const data = JSON.parse(resText);
      
      let nextHistory = [...newHistory, { role: 'model', text: data.question }];
      setHistory(nextHistory);
      
      // AI indicates all 5 stages met
      if (data.stage === "complete" || data.stage.includes("complete")) {
        finishReflection(nextHistory);
      } else {
        setIsTyping(false);
      }
      
    } catch (err) {
      console.error(err);
      setHistory(prev => [...prev, { role: 'model', text: "Error contacting server: " + err.message }]);
      setIsTyping(false);
    }
  };

  const finishReflection = async (finalHistory) => {
    setIsTyping(true);
    try {
      const qaPairs = [];
      for (let i = 0; i < finalHistory.length; i++) {
        if (finalHistory[i].role === 'model' && finalHistory[i+1]?.role === 'user') {
          qaPairs.push({
            question: finalHistory[i].text,
            answer: finalHistory[i+1].text
          });
        }
      }

      const sumRes = await fetch("/api/ai?action=summarize", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ qaPairs, activityType: activity, projectName: project })
      });
      
      const sumText = await sumRes.text();
      if (!sumRes.ok) throw new Error("Summarize failed: " + sumText);
      const sumData = JSON.parse(sumText);

      const entryRes = await fetch("/api/entries", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          activityType: activity, 
          projectName: project,
          reflections: qaPairs,
          summary: sumData.summary
        })
      });

      if (!entryRes.ok) {
        const errorText = await entryRes.text();
        throw new Error("Failed to save entry to DB: " + errorText);
      }

      setIsFinished(true);
      setIsTyping(false);
      
      // Give the user a moment to read the final "Thank you!" AI message, then redirect
      setTimeout(() => {
        router.push('/journal');
      }, 3500);
    } catch (err) {
      console.error(err);
      setHistory(prev => [...prev, { 
        role: 'model', 
        text: "Error saving entry: " + err.message 
      }]);
      setIsTyping(false);
      setIsFinished(true);
    }
  };

  const isUser = (role) => role === 'user';

  if (!isLoaded) return <div className="h-screen bg-white"></div>;
  if (!isSignedIn) {
    return (
      <div className="h-screen flex items-center justify-center bg-white">
        <div className="framer-panel p-12 text-center max-w-md mx-6">
          <h2 className="text-2xl font-light text-gray-900 mb-4">Sign in required</h2>
          <p className="text-gray-500 font-light mb-8">Please sign in from the top right of the home page to start your reflection.</p>
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
      className="max-w-3xl mx-auto px-6 py-6 h-screen flex flex-col bg-white"
    >
      <div className="flex items-center justify-between mb-8 pb-4 border-b border-gray-100">
        <div className="flex items-center gap-4">
          <div>
            <h1 className="text-xl font-normal text-gray-900 tracking-tight">Reflecting</h1>
            <p className="text-sm text-gray-400 font-light">{project} — {activity}</p>
          </div>
        </div>
        <button onClick={() => router.push('/')} className="text-gray-400 hover:text-gray-900 transition-colors text-sm font-light flex items-center gap-1">
          ← Back
        </button>
      </div>

      <div className="flex-1 overflow-y-auto mb-6 flex flex-col space-y-8 pr-4">
        {history.length === 0 && isTyping && (
           <div className="h-full flex items-center justify-center">
             <div className="w-5 h-5 rounded-full border-2 border-gray-100 border-t-gray-900 animate-spin" />
           </div>
        )}
        
        <AnimatePresence initial={false}>
          {history.map((msg, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, scale: 0.95, y: 10, originX: isUser(msg.role) ? 1 : 0 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              transition={springTransition}
              className={`flex flex-col max-w-[85%] ${isUser(msg.role) ? 'self-end' : 'self-start'}`}
            >
              <div className={`px-6 py-4 text-[1.05rem] leading-relaxed rounded-[20px] ${
                isUser(msg.role) 
                  ? 'bg-gray-900 text-white rounded-tr-sm border border-gray-800' 
                  : 'bg-white text-gray-800 rounded-tl-sm border border-gray-100 shadow-sm'
              }`}>
                {(msg.text || '').split('\n').map((line, j) => (
                  <span key={j} className="font-light">{line}<br/></span>
                ))}
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
        
        {isTyping && history.length > 0 && (
          <motion.div 
            initial={{ opacity: 0 }} animate={{ opacity: 1 }}
            className="self-start bg-white p-5 rounded-[20px] rounded-tl-sm border border-gray-100 shadow-sm"
          >
            <div className="flex gap-2 px-1">
              <div className="w-1.5 h-1.5 rounded-full bg-gray-300 animate-pulse" />
              <div className="w-1.5 h-1.5 rounded-full bg-gray-300 animate-pulse" style={{ animationDelay: '150ms' }} />
              <div className="w-1.5 h-1.5 rounded-full bg-gray-300 animate-pulse" style={{ animationDelay: '300ms' }} />
            </div>
          </motion.div>
        )}
        <div ref={messagesEndRef} className="h-4" />
      </div>

      <div className="pt-4 bg-white">
        {!isFinished ? (
          <div className="flex gap-4">
            <input 
              type="text" 
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSend()}
              disabled={isTyping}
              placeholder="Write your thoughts..." 
              className="flex-1 px-6 py-4 framer-input text-lg"
            />
            <button 
              onClick={handleSend}
              disabled={!inputText.trim() || isTyping}
              className="framer-button w-14 h-14 flex items-center justify-center flex-shrink-0"
            >
              ➔
            </button>
          </div>
        ) : (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col items-center justify-center gap-2 py-2">
            <div className="w-6 h-6 rounded-full border-2 border-gray-100 border-t-gray-900 animate-spin" />
            <p className="text-gray-400 font-light text-sm">Saving to private journal...</p>
          </motion.div>
        )}
      </div>
    </motion.div>
  );
}
