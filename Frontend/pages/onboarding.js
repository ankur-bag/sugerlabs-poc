import { useState } from "react";
import { useRouter } from "next/router";
import { useAuth, useUser } from "@clerk/nextjs";
import { motion } from "framer-motion";

export default function Onboarding() {
  const router = useRouter();
  const { isLoaded, isSignedIn, userId } = useAuth();
  const { user } = useUser();

  const [formData, setFormData] = useState({
    name: "",
    ageGroup: "",
    interests: [],
    currentFocus: "",
    skillLevel: ""
  });
  const [customInterest, setCustomInterest] = useState("");
  const [customFocus, setCustomFocus] = useState("");
  const [loading, setLoading] = useState(false);

  if (!isLoaded) return <div className="h-screen bg-white" />;
  if (!isSignedIn) {
     router.push("/");
     return null;
  }

  const handleInterestChange = (interest) => {
    setFormData(prev => {
      if (prev.interests.includes(interest)) {
        return { ...prev, interests: prev.interests.filter(i => i !== interest) };
      }
      return { ...prev, interests: [...prev.interests, interest] };
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name || !formData.ageGroup || formData.interests.length === 0 || !formData.currentFocus || !formData.skillLevel) {
      alert("Please fill in all options.");
      return;
    }
    
    // Process "other" selections
    let finalInterests = [...formData.interests];
    if (finalInterests.includes("other") && customInterest.trim()) {
      finalInterests = finalInterests.filter(i => i !== "other");
      finalInterests.push(customInterest.trim());
    }

    let finalFocus = formData.currentFocus;
    if (finalFocus === "other" && customFocus.trim()) {
      finalFocus = customFocus.trim();
    }
    
    setLoading(true);
    try {
      const dbPayload = {
        clerkId: userId,
        name: formData.name || user?.firstName || "Learner",
        ageGroup: formData.ageGroup,
        interests: finalInterests,
        currentFocus: finalFocus,
        skillLevel: formData.skillLevel
      };

      // 1. Check if user already exists
      const checkRes = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/user/${user.id}`);
      if (checkRes.ok) {
        router.push("/");
        return;
      }

      // 2. Otherwise create profile
      const res = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/onboarding`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(dbPayload)
      });
      if (!res.ok) throw new Error("Onboarding failed");
      router.push("/");
    } catch (err) {
      console.error(err);
      alert("Error saving your profile.");
    } finally {
      setLoading(false);
    }
  };

  return (
     <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4 py-12">
       <form onSubmit={handleSubmit} className="framer-panel p-8 md:p-12 w-full max-w-2xl bg-white shadow-lg rounded-3xl border border-gray-100">
         <h1 className="text-3xl font-light mb-10 text-gray-900 border-b pb-4">Let's set up your profile</h1>
         
         <div className="space-y-10">
           {/* Question 1: Name */}
           <div>
             <label className="block text-xl font-medium text-gray-900 mb-4">1. What should I call you?</label>
             <input required type="text" className="w-full framer-input px-5 py-4 border border-gray-200 rounded-xl text-lg" 
               value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} placeholder="Your preferred name"
             />
           </div>

           {/* Question 2: Age group */}
           <div>
             <label className="block text-xl font-medium text-gray-900 mb-4">2. Which group are you in?</label>
             <div className="flex gap-4 flex-wrap">
               {["6-8", "9-12", "13+"].map(age => (
                 <button type="button" key={age} onClick={() => setFormData({...formData, ageGroup: age})}
                   className={`px-6 py-3 border rounded-xl transition-all font-medium text-lg ${formData.ageGroup === age ? 'bg-gray-900 border-gray-900 text-white shadow-md' : 'bg-white text-gray-600 hover:bg-gray-50 hover:border-gray-300'}`}>{age}</button>
               ))}
             </div>
           </div>

           {/* Question 3: Interests */}
           <div>
             <label className="block text-xl font-medium text-gray-900 mb-4">3. What do you enjoy the most?</label>
             <div className="flex gap-3 flex-wrap">
               {["music", "coding", "drawing", "writing", "other"].map(interest => (
                 <button type="button" key={interest} onClick={() => handleInterestChange(interest)}
                   className={`px-6 py-3 border rounded-xl transition-all font-medium text-lg capitalize ${formData.interests.includes(interest) ? 'bg-gray-900 border-gray-900 text-white shadow-md' : 'bg-white text-gray-600 hover:bg-gray-50 hover:border-gray-300'}`}>{interest}</button>
               ))}
             </div>
             {formData.interests.includes("other") && (
               <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} className="mt-4">
                 <input type="text" className="w-full framer-input px-5 py-3 border border-gray-200 rounded-xl text-lg" 
                   value={customInterest} onChange={e => setCustomInterest(e.target.value)} placeholder="Type your other interest here..." required
                 />
               </motion.div>
             )}
           </div>

           {/* Question 4: Current activity */}
           <div>
             <label className="block text-xl font-medium text-gray-900 mb-4">4. What are you doing these days?</label>
             <div className="flex gap-3 flex-wrap">
               {["coding", "music", "drawing", "writing", "school", "other"].map(focus => (
                 <button type="button" key={focus} onClick={() => setFormData({...formData, currentFocus: focus})}
                   className={`px-6 py-3 border rounded-xl transition-all font-medium text-lg flex-1 sm:flex-none capitalize text-center ${formData.currentFocus === focus ? 'bg-gray-900 border-gray-900 text-white shadow-md' : 'bg-white text-gray-600 hover:bg-gray-50 hover:border-gray-300'}`}>{focus}</button>
               ))}
             </div>
             {formData.currentFocus === "other" && (
               <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} className="mt-4">
                 <input type="text" className="w-full framer-input px-5 py-3 border border-gray-200 rounded-xl text-lg" 
                   value={customFocus} onChange={e => setCustomFocus(e.target.value)} placeholder="Type what you are working on..." required
                 />
               </motion.div>
             )}
           </div>

           {/* Question 5: Skill level */}
           <div>
             <label className="block text-xl font-medium text-gray-900 mb-4">5. How good are you at this?</label>
             <div className="flex gap-3 flex-wrap">
               {["Just starting", "Getting better", "Pretty good", "Awesome at it"].map(level => (
                 <button type="button" key={level} onClick={() => setFormData({...formData, skillLevel: level})}
                   className={`px-6 py-3 border rounded-xl transition-all font-medium text-lg ${formData.skillLevel === level ? 'bg-blue-600 border-blue-600 text-white shadow-md' : 'bg-white text-gray-600 hover:bg-gray-50 hover:border-gray-300'}`}>{level}</button>
               ))}
             </div>
           </div>
         </div>

         <div className="mt-14">
           <button type="submit" disabled={loading} className="w-full framer-button px-6 py-5 bg-gray-900 text-white rounded-2xl hover:bg-gray-800 transition-colors text-xl font-medium shadow-xl">
             {loading ? "Saving..." : "Start Journaling ✨"}
           </button>
         </div>
       </form>
     </div>
  )
}
