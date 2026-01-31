import { GoogleGenAI } from "@google/genai";
import { COUNSELLOR_SYSTEM_PROMPT } from "../utils/prompts.js";

const genAI = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
});

/**
 * Create a Gemini chat session with memory
 */
export const createCounsellorChat = (history = []) => {
  return genAI.chats.create({
    model: "gemini-2.5-flash",
    config: {
      systemInstruction: COUNSELLOR_SYSTEM_PROMPT,
      temperature: 0.6,
      maxOutputTokens: 800,
    },
    history, // 👈 memory injected here
  });
};
