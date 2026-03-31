import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/router";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth, UserButton } from "@clerk/nextjs";
import Link from "next/link";

const springTransition = { type: "spring", stiffness: 100, damping: 20, mass: 1 };

export default function Reflect() {
  const router = useRouter();
  const { activity, project } = router.query;
  const { isLoaded, isSignedIn, userId } = useAuth();
  
  const [history, setHistory] = useState([]); 
  const [inputText, setInputText] = useState("");
  const [isTyping, setIsTyping] = useState(true);
  const [isFinished, setIsFinished] = useState(false);
  const [sessionId, setSessionId] = useState(null);
  
  const messagesEndRef = useRef(null);
  
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };
  
  useEffect(() => {
    scrollToBottom();
  }, [history, isTyping]);

  useEffect(() => {
    if (!activity || !project || !isLoaded || !isSignedIn || !userId) return;
    
    // Check if we already started
    if (sessionId) return;
    
    const startReflection = async () => {
      try {
        // [GSoC Trigger Simulation] 
        // This fires when project is paused or saved: onSave() -> POST /start-reflection
        // 1. Start reflection session
        const startRes = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/start-reflection`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ clerk_id: userId, activity_type: activity, project_name: project })
        });
        
        if (!startRes.ok) {
           const errText = await startRes.text();
           throw new Error(`[Backend 1] Start failed: ${startRes.status} ${errText}`);
        }
        const sessionData = await startRes.json();
        const sid = sessionData._id || sessionData.id;
        setSessionId(sid);
        
        // 2. Fetch first question
        const qRes = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/next-question`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ session_id: sid })
        });
        
        if (!qRes.ok) {
           const qErrText = await qRes.text();
           throw new Error(`[Backend 2] Next Question failed: ${qRes.status} ${qErrText}`);
        }
        
        const qData = await qRes.json();
        
        if (qData.question) {
           setHistory([{ role: 'model', text: qData.question }]);
        }
      } catch (err) {
        console.error(err);
        setHistory([{ role: 'model', text: "Error: " + err.message }]);
      } finally {
        setIsTyping(false);
      }
    };
    
    startReflection();
  }, [activity, project, isLoaded, isSignedIn, userId, sessionId]);

  const handleSend = async () => {
    if (!inputText.trim() || isTyping || !sessionId) return;
    
    const userMessage = inputText.trim();
    setInputText("");
    
    const newHistory = [...history, { role: 'user', text: userMessage }];
    setHistory(newHistory);
    setIsTyping(true);

    try {
      // 1. Submit response
      await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/submit-response`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ session_id: sessionId, content: userMessage })
      });
      
      // 2. Get next question
      const qRes = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/next-question`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ session_id: sessionId })
      });
      
      const qData = await qRes.json();
      
      let nextHistory = [...newHistory, { role: 'model', text: qData.question }];
      setHistory(nextHistory);
      
      if (qData.current_stage === "done") {
        finishReflection(sessionId);
      } else {
        setIsTyping(false);
      }
      
    } catch (err) {
      console.error(err);
      setHistory(prev => [...prev, { role: 'model', text: "Error contacting server: " + err.message }]);
      setIsTyping(false);
    }
  };

  const finishReflection = async (sid) => {
    setIsTyping(true);
    try {
      const sumRes = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/summarize`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ session_id: sid })
      });
      
      if (!sumRes.ok) throw new Error("Summarize failed");
      
      setIsFinished(true);
      setIsTyping(false);
      
      setTimeout(() => {
        router.push('/journal');
      }, 3500);
    } catch (err) {
      console.error(err);
      setHistory(prev => [...prev, { 
        role: 'model', 
        text: "Error saving summary: " + err.message 
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
          <p className="text-gray-500 font-light mb-8">Please sign in from the home page.</p>
          <button onClick={() => router.push('/')} className="framer-button px-8 py-3">Return Home</button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center p-4 md:p-0">
      <header className="absolute top-0 right-0 p-4 md:p-6 z-50 flex items-center gap-4">
        <Link href="/" className="text-sm font-light text-gray-500 hover:text-gray-900 transition-colors hidden sm:block">Home</Link>
        <UserButton afterSignOutUrl="/" />
      </header>
      <div className="w-full max-w-2xl mx-auto flex flex-col h-[90vh] md:h-[85vh] framer-panel relative my-4 md:my-auto">
        <div className="p-4 md:p-8 flex justify-between items-center border-b border-gray-50 bg-white/50 backdrop-blur-sm z-10 sticky top-0 rounded-t-3xl">
          <div>
            <h1 className="text-lg font-medium text-gray-900">Reflecting</h1>
            <p className="text-xs text-gray-400">{project} — {activity}</p>
          </div>
        </div>
        <div className="flex-1 overflow-y-auto p-4 md:p-8 flex flex-col space-y-6">
          {history.length === 0 && isTyping && (
             <div className="h-full flex items-center justify-center">
               <div className="w-5 h-5 rounded-full border-2 border-gray-100 border-t-gray-900 animate-spin" />
             </div>
          )}
          <AnimatePresence initial={false}>
            {history.map((msg, i) => (
              <motion.div key={i} initial={{ opacity: 0, scale: 0.95, y: 10 }} animate={{ opacity: 1, scale: 1, y: 0 }} transition={springTransition} className={`flex ${isUser(msg.role) ? 'justify-end' : 'justify-start'}`}>
                <div className={`px-5 py-3 text-sm md:text-base rounded-2xl max-w-[90%] ${isUser(msg.role) ? 'bg-gray-900 text-white rounded-tr-sm' : 'bg-white text-gray-800 rounded-tl-sm border border-gray-100'}`}>
                  {msg.text}
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
          {isTyping && history.length > 0 && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="self-start bg-white p-4 rounded-2xl rounded-tl-sm border border-gray-100">
              <div className="flex gap-2">
                <div className="w-2 h-2 rounded-full bg-gray-400 animate-pulse delay-150"></div>
              </div>
            </motion.div>
          )}
          <div ref={messagesEndRef} className="h-4" />
        </div>
        <div className="p-4 md:p-6 bg-white/80 backdrop-blur-md rounded-b-3xl border-t border-gray-50">
          {!isFinished ? (
            <div className="flex gap-2 md:gap-4">
              <input 
                type="text" 
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                disabled={isTyping}
                placeholder="Write your thoughts..." 
                className="flex-1 px-4 md:px-6 py-3 md:py-4 framer-input text-base md:text-lg"
              />
              <button onClick={handleSend} disabled={!inputText.trim() || isTyping} className="framer-button w-12 h-12 md:w-14 md:h-14 flex items-center justify-center flex-shrink-0">➔</button>
            </div>
          ) : (
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col items-center justify-center gap-2 py-2">
              <div className="w-6 h-6 rounded-full border-2 border-gray-100 border-t-gray-900 animate-spin" />
              <p className="text-gray-400 font-light text-sm">Saving to private journal...</p>
            </motion.div>
          )}
        </div>
      </div>
    </div>
  );
}
