import { generateText } from "../../lib/gemini";
import { getAuth } from "@clerk/nextjs/server";

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });
  
  const { userId } = getAuth(req);
  if (!userId) return res.status(401).json({ error: "Unauthorized" });

  const { action } = req.query;

  try {
    if (action === 'reflect') {
      const { history, activityType, projectName } = req.body;
      
      const userReplies = history.filter(m => m.role === 'user').length;
      if (userReplies >= 5) {
        return res.json({
          stage: "complete",
          question: "Thank you for taking the time to reflect! I'm saving this to your journal now."
        });
      }

      const conversation = history.map(msg => `${msg.role === 'user' ? 'Learner' : 'Assistant'}: ${msg.content || msg.text}`).join("\n");
      
      const prompt = `You are a reflective learning assistant.

Your task:
1. Analyze the conversation
2. Identify the current reflection stage
3. Ask the next appropriate question

Activity Context:
- Activity Type: ${activityType}
- Project Name: ${projectName}

Reflection stages:
1. description → what the learner did
2. feelings → emotional response
3. evaluation → what went well or poorly
4. learning → key takeaways
5. next_steps → future improvements

Instructions:
- First, determine which stages are already covered from the conversation log.
- Move to the NEXT missing stage strictly in order. Do not skip stages.
- Ask ONLY one question.
- Keep it under 30 words.
- No emojis. No excessive praise.
- Be calm, thoughtful, and concise.
- Avoid repeating questions.
- If ALL 5 stages are fully covered by the learner, or if the conversation has naturally concluded, output EXACTLY "Stage: complete" and "Question: Thank you for your reflections."

Conversation so far:
${conversation}

Output format:
Stage: <stage_name>
Question: <your question>`;
      
      const reply = await generateText(prompt);
      
      const stageLine = reply.split("\n").find(l => l.toLowerCase().startsWith("stage:"));
      const questionLine = reply.split("\n").find(l => l.toLowerCase().startsWith("question:"));
      
      const extractedStage = stageLine ? stageLine.replace(/Stage:/i, "").trim().toLowerCase() : "unknown";
      
      res.json({
        stage: extractedStage,
        question: questionLine ? questionLine.replace(/Question:/i, "").trim() : reply,
      });

    } else if (action === 'summarize') {
      const { qaPairs } = req.body;
      const conversation = qaPairs.map(qa => `AI: ${qa.question}\nLearner: ${qa.answer}`).join("\n\n");
      
      const prompt = `You are an expert reflection assistant.

Your task is to convert a conversation into a high-quality reflective journal entry.

Follow these rules strictly:

Structure:
1. Start with what the user did
2. Include how they felt
3. Include what went well or challenges
4. Include what they learned
5. End with what they will do next

Style:
- Write in FIRST PERSON ("I")
- Make it sound natural and human, not robotic
- Keep it concise (80–120 words)
- Do NOT use bullet points
- Do NOT repeat phrases
- No emojis
- No exaggeration or praise
- Maintain a thoughtful and reflective tone

Quality:
- Connect ideas smoothly (use transitions)
- Infer meaning if needed (but do not hallucinate)
- Make it sound like a real student reflection

Conversation:
${conversation}

Output:
A single well-written paragraph.`;
      
      const text = await generateText(prompt);
      res.status(200).json({ summary: text.trim() });
    } else {
      res.status(400).json({ error: 'Invalid action' });
    }
  } catch (error) {
    console.error(`AI API Error [${action}]:`, error);
    res.status(500).json({ error: `Failed AI action: ${action}` });
  }
}
