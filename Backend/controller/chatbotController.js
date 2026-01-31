import { GoogleGenAI } from "@google/genai";
import prisma from "../config/dbConnect.js";
import logger from "../utils/logger.js";
import {
  COUNSELLOR_SYSTEM_PROMPT,
  getUniversityRecommendationPrompt,
  formatProfileContext,
} from "../utils/prompts.js";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

// Chat endpoint - streams AI reply to client and saves/upserts response in DB as chunks arrive
const chat = async (req, res) => {
  try {
    const userId = req.user?.id;
    const { message } = req.body;
    logger.info(`User ${userId} message: ${message}`);

    if (!userId) {
      return res.status(401).json({ success: false, message: "Unauthorized" });
    }

    if (!message) {
      return res.status(400).json({ success: false, message: "Message is required" });
    }

    // Get user's onboarding/profile for context
    const user = await prisma.users.findUnique({
      where: { id: userId },
      include: { onboarding: true },
    });

    const profileContext = formatProfileContext(user?.onboarding);

    // Create DB record first so we have an id to update incrementally
    const chatRecord = await prisma.userChatHistory.create({
      data: {
        userId,
        message,
        response: "", // we'll append as chunks arrive
      },
    });

    // Set streaming headers for client (fetch + ReadableStream on frontend)
    // Use plain text chunked streaming; frontend will read progressively
    res.setHeader("Content-Type", "text/plain; charset=utf-8");
    res.setHeader("Transfer-Encoding", "chunked");
    // Optionally allow CORS here if you don't handle it globally
    // res.setHeader('Access-Control-Allow-Origin', '*');

    // flush headers so client starts receiving immediately
    if (res.flushHeaders) res.flushHeaders();

    let aggregatedResponse = "";
    let aborted = false;

    // If client disconnects, mark aborted so we stop reading and update DB
    req.on("close", async () => {
      aborted = true;
      logger.info(`Client disconnected while streaming for chatId=${chatRecord.id}`);
      try {
        await prisma.userChatHistory.update({
          where: { id: chatRecord.id },
          data: { response: aggregatedResponse },
        });
      } catch (e) {
        logger.error("DB update error on client close:", e);
      }
    });

    // Start streaming from Gemini
    const stream = await ai.models.generateContentStream({
      model: "gemini-2.5-flash",
      contents: `${COUNSELLOR_SYSTEM_PROMPT}\n\n${profileContext}\n\nStudent's message: ${message}`,
    });

    try {
      for await (const chunk of stream) {
        if (aborted || res.writableEnded) break;

        if (!chunk) continue;

        // Many chunk objects include a `text` property; guard for that
        const chunkText = typeof chunk.text === "string" ? chunk.text : "";
        if (!chunkText) continue;

        // 1) send to client immediately
        try {
          res.write(chunkText);
        } catch (e) {
          logger.warn("Error writing chunk to response stream:", e);
          // If writing fails, we'll break and let the close handler update DB
          break;
        }

        // 2) append to aggregatedResponse
        aggregatedResponse += chunkText;

        // 3) update DB with latest partial response
        // Note: This does an update per chunk. To reduce DB writes in production,
        // you can buffer chunks and write every N ms or N chunks.
        try {
          await prisma.userChatHistory.update({
            where: { id: chatRecord.id },
            data: { response: aggregatedResponse },
          });
        } catch (dbErr) {
          // don't fail streaming because of a DB hiccup; log and continue
          logger.error("DB update error while streaming:", dbErr);
        }
      }

      // end the response stream gracefully
      if (!res.writableEnded) res.end();

      // final DB update to ensure full response is stored (in case last chunk update failed)
      try {
        await prisma.userChatHistory.update({
          where: { id: chatRecord.id },
          data: { response: aggregatedResponse, status: "completed" },
        });
      } catch (finalDbErr) {
        logger.error("Final DB update error after stream:", finalDbErr);
      }
    } catch (streamErr) {
      // handle error occurred during streaming iteration
      logger.error("Error during streaming:", streamErr);

      const userFriendly =
        streamErr?.status === 429 || String(streamErr?.message)?.includes("429")
          ? "I'm currently receiving too many requests. Please try again in about a minute."
          : "Sorry — something went wrong while generating the response.";

      // attempt to notify client (if possible) and save the error into DB
      try {
        if (!res.writableEnded) res.write(`\n\n${userFriendly}`);
        if (!res.writableEnded) res.end();
      } catch (e) {
        logger.warn("Could not write error message to client:", e);
      }

      try {
        await prisma.userChatHistory.update({
          where: { id: chatRecord.id },
          data: { response: aggregatedResponse + "\n\n" + userFriendly, status: "failed" },
        });
      } catch (dbErr) {
        logger.error("DB update error after stream failure:", dbErr);
      }
    }
  } catch (error) {
    logger.error("Chat handler error:", error);

    // If we haven't already sent a response, return JSON error
    if (!res.headersSent) {
      if (error.status === 429 || String(error.message).includes("429")) {
        return res.status(429).json({
          success: false,
          message: "I'm currently receiving too many requests. Please try again in about a minute.",
        });
      }

      return res.status(500).json({
        success: false,
        message: "Failed to generate response",
        error: error.message,
      });
    }
    // If headers already sent, there's nothing else we can do here
  }
};

// Get chat history for a user
const getChatHistory = async (req, res) => {
  try {
    const userId = req.user?.id;
    if (!userId) return res.status(401).json({ success: false, message: "Unauthorized" });

    const history = await prisma.userChatHistory.findMany({
      where: { userId },
      orderBy: { createdAt: "asc" },
    });

    res.status(200).json({ success: true, history });
  } catch (error) {
    logger.error("Get history error:", error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};

// Save conversation manually (for batch saves)
const saveConversation = async (req, res) => {
  try {
    const userId = req.user?.id;
    if (!userId) return res.status(401).json({ success: false, message: "Unauthorized" });

    const { message, response } = req.body;

    const newConversation = await prisma.userChatHistory.create({
      data: {
        userId,
        message,
        response,
        status: "completed",
      },
    });

    res.status(200).json({ success: true, message: "Conversation saved", data: newConversation });
  } catch (error) {
    logger.error("Save conversation error:", error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};

// Generate university recommendations (non-streaming)
const getUniversityRecommendations = async (req, res) => {
  try {
    const userId = req.user?.id;
    if (!userId) return res.status(401).json({ success: false, message: "Unauthorized" });

    logger.info(`Fetching recommendations for user ${userId}`);

    const user = await prisma.users.findUnique({
      where: { id: userId },
      include: { onboarding: true },
    });

    if (!user?.onboarding) {
      return res.status(400).json({ success: false, message: "Please complete onboarding first" });
    }
    if (user?.onboarding.universityRecommendations) {
      return res.status(200).json({ success: true, recommendations: user.onboarding.universityRecommendations });
    }
    const profile = user.onboarding;
    const prompt = getUniversityRecommendationPrompt(profile);

    // Use ai.models.generateContent for a simple single-shot response
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: getUniversityRecommendationPrompt(profile),
      generationConfig: {
        responseMimeType: "application/json",
        maxOutputTokens: 600,
        responseSchema: {
          type: "object",
          required: ["dream", "target", "safe"],
          additionalProperties: false,
          properties: {
            dream: { $ref: "#/definitions/universityArray" },
            target: { $ref: "#/definitions/universityArray" },
            safe: { $ref: "#/definitions/universityArray" }
          },
          definitions: {
            universityArray: {
              type: "array",
              minItems: 2,
              maxItems: 2,
              items: {
                type: "object",
                required: ["name", "country", "reason", "risk", "imageUrl"],
                additionalProperties: false,
                properties: {
                  name: { type: "string" },
                  country: { type: ["string", "null"] },
                  reason: { type: "string" },
                  risk: { type: "string" },
                  imageUrl: { type: ["string", "null"] }
                }
              }
            }
          }
        }
      }
    });


    const text = response?.text ?? "";

    let recommendations = null;
    try {
      const jsonMatch = text.match(/\{[\s\S]*\}/);
      recommendations = jsonMatch ? JSON.parse(jsonMatch[0]) : null;
      // Save valid recommendations to DB
      if (recommendations && (recommendations.dream || recommendations.target || recommendations.safe)) {
        await prisma.onboarding.update({
          where: { userId },
          data: { universityRecommendations: recommendations },
        });
        logger.info(`Saved new recommendations for user ${userId}`);
      }
    } catch (e) {
      logger.error("JSON Parse Error for recommendations:", e);
      recommendations = null;
    }

    res.status(200).json({ success: true, recommendations, rawResponse: recommendations ? null : text });
  } catch (error) {
    logger.error("Recommendations error:", error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};

export default {
  chat,
  getChatHistory,
  saveConversation,
  getUniversityRecommendations,
};
