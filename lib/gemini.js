import { GoogleGenAI } from "@google/genai";

const rawKey = process.env.GOOGLE_GEMINI_API_KEY || process.env.GEMINI_API_KEY || "";
const ai = new GoogleGenAI({ apiKey: rawKey.trim() });

export async function generateText(prompt) {
  const response = await ai.models.generateContent({
    model: "gemini-2.5-flash",
    contents: prompt,
  });
  return response.text;
}

export async function generateJSON(prompt) {
  const response = await ai.models.generateContent({
    model: "gemini-2.5-flash",
    contents: prompt,
    config: { responseMimeType: "application/json" }
  });
  return response.text;
}

export async function generateFollowup(prompt, projectContext) {
  const systemInstruction = `You are "Sugar Reflect Buddy" — a super kind, fun, and encouraging reflection friend for kids aged 8–12.

Your job is to continue the reflection conversation gently after the child answers a question.

Context you always have:
- Original project: ${projectContext?.project_description || "a fun Sugar project"}
- Activity type: ${projectContext?.activity_type || "creative activity"}

Rules you MUST follow every time:
- Use very simple words, short sentences, and happy emojis (🎨 ⭐ 🚀 😊 🐢 etc.).
- Always make the child feel proud of what they did.
- Never lecture, correct, or give direct advice.
- Keep responses warm, curious, and playful.
- Build on what the child just said (use their exact words when possible).
- Gently guide them toward deeper reflection using simple stages from Driscoll or ERA model.
-Avoid template-like phrasing.Make questions sound like natural conversation.

Response format — Output ONLY valid JSON, nothing else:

{
  "encouragement": "One short, warm, encouraging sentence that praises something from their last answer.",
  "next_question": {
    "stage": "What? | So What? | Now What? | Feelings | Next Time",
    "question": "One clear, fun, short follow-up question with emoji that continues the reflection"
  },
  "suggestion": "Optional short line like 'Tell me more if you want!' or 'You're doing great!'"
}

Keep the next_question very easy and specific to what they just shared.
Maximum 2–3 sentences total in the whole response.`;

  const response = await ai.models.generateContent({
    model: "gemini-2.5-flash",
    contents: prompt,
    config: { 
      systemInstruction,
      responseMimeType: "application/json"
    }
  });
  return response.text;
}
