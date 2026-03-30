import { ChatGoogleGenerativeAI } from "@langchain/google-genai";
import { BufferWindowMemory, ChatMessageHistory } from "langchain/memory";
import { ChatPromptTemplate, SystemMessagePromptTemplate, MessagesPlaceholder, HumanMessagePromptTemplate } from "@langchain/core/prompts";

// Reusable system prompt based on user's exact specification
export const SYSTEM_PROMPT = `You are "Sugar Reflect Buddy" — a super kind, fun, and encouraging reflection friend for kids aged 8 to 12 years old.
Your job is to help children reflect on their Sugar projects (like Turtle Art drawings, Music Blocks songs, paintings, or Python creations) in a playful way.

Rules you MUST follow:
- Use very simple, short sentences and happy, excited language.
- Add appropriate emojis (🎨, 🚀, ⭐, 😊, etc.) to make it fun.
- Never lecture or give advice. Only ask warm, curious questions.
- Always make the child feel proud of what they created.
- Keep every question short and easy to understand.
- Output ONLY valid JSON representing your response.
-Avoid template-like phrasing.
-Make questions sound like natural conversation.
{
  "reply": "Your actual fun response, combining your encouragement and your next short question with emoji"
}

Always respond with valid JSON only. Keep responses under 2-3 sentences max. NEVER include extra markdown formatting around the JSON block.`;

/**
 * Initializes the Gemini 2.5 Flash model specifically via LangChain
 */
export function getChatModel() {
  return new ChatGoogleGenerativeAI({
    modelName: "gemini-2.5-flash",
    apiKey: process.env.GOOGLE_GEMINI_API_KEY || process.env.GEMINI_API_KEY,
    maxOutputTokens: 2048,
    temperature: 0.7,
  });
}

/**
 * Converts generic { role, content } messages into LangChain compatible memory objects
 * @param {Array} messages - Incoming past messages
 * @param {Number} k - Number of past messages to remember to prevent token bloat
 */
export function createMemoryFromMessages(messages = [], k = 6) {
  const history = new ChatMessageHistory();
  
  messages.forEach((msg) => {
    if (msg.role === "user") {
      history.addUserMessage(msg.content);
    } else if (msg.role === "assistant" || msg.role === "model") {
      history.addAIChatMessage(msg.content);
    }
  });

  // Keep only the last 'k' messages in memory
  return new BufferWindowMemory({
    k: k,
    chatHistory: history,
    returnMessages: true,
    memoryKey: "history",
  });
}

// Prepare the standard chat prompt sequence
export const chatPrompt = ChatPromptTemplate.fromMessages([
  SystemMessagePromptTemplate.fromTemplate(SYSTEM_PROMPT),
  new MessagesPlaceholder("history"),
  HumanMessagePromptTemplate.fromTemplate("{input}")
]);
