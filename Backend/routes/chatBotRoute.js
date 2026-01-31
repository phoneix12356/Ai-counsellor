import express from "express";
import chatbotController from "../controller/chatbotController.js";
import authMiddleware from "../middleware/authMiddleware.js";
import onboardingMiddleware from "../middleware/onboardingMiddleware.js";

const router = express.Router();

// Async handler wrapper
const asyncHandler = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

// Chat with AI Counsellor
router.post("/chat", authMiddleware, onboardingMiddleware, asyncHandler(chatbotController.chat));

// Get chat history
router.get("/history", authMiddleware, onboardingMiddleware, asyncHandler(chatbotController.getChatHistory));

// Save conversation
router.post("/history", authMiddleware, onboardingMiddleware, asyncHandler(chatbotController.saveConversation));

// Get university recommendations
router.get("/universities", authMiddleware, onboardingMiddleware, asyncHandler(chatbotController.getUniversityRecommendations));

// University actions
router.post("/lock", authMiddleware, onboardingMiddleware, asyncHandler(chatbotController.lockUniversity));
router.post("/shortlist", authMiddleware, onboardingMiddleware, asyncHandler(chatbotController.shortlistUniversity));
router.get("/tasks", authMiddleware, onboardingMiddleware, asyncHandler(chatbotController.getTasks));
router.put("/tasks/:id", authMiddleware, onboardingMiddleware, asyncHandler(chatbotController.updateTask));

export default router;
