import { getChatModel, createMemoryFromMessages, chatPrompt } from "../../lib/langchain";
import { ConversationChain } from "langchain/chains";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const { messages } = req.body;
    
    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      return res.status(400).json({ error: "Messages array is required." });
    }

    // Isolate past history from the current immediate user question
    const pastMessages = messages.slice(0, -1);
    const currentUserMessage = messages[messages.length - 1].content;

    // Load Memory and Model configurations
    const memory = createMemoryFromMessages(pastMessages, 6);
    const llm = getChatModel();

    // Construct the LangChain ConversationChain
    const chain = new ConversationChain({
      llm: llm,
      prompt: chatPrompt,
      memory: memory,
    });

    // Invoke LangChain execution
    const response = await chain.call({ input: currentUserMessage });
    
    // The prompt enforces raw JSON generation: we clean it just in case
    const rawReply = response.response.replace(/```json/g, '').replace(/```/g, '').trim();
    
    let aiResponseText = rawReply;
    try {
       const parsedJSON = JSON.parse(rawReply);
       aiResponseText = parsedJSON.reply || parsedJSON.text || rawReply;
    } catch (e) {
       // If Gemini didn't return perfect JSON, return the raw text gracefully
       console.warn("Failed to parse JSON reply from Gemini, returning raw text:", e);
    }

    return res.status(200).json({ reply: aiResponseText });
  } catch (error) {
    console.error("LangChain Error:", error);
    return res.status(500).json({ error: "Internal Server Error" });
  }
}
