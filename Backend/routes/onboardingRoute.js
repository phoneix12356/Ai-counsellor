import express from "express";
import onboardingController from "../controller/onboardingController.js";
import authMiddleware from "../middleware/authMiddleware.js";

const router = express.Router();

// Async handler wrapper
const asyncHandler = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

// Add GET route
router.get("/", authMiddleware, asyncHandler(onboardingController.getOnboarding.bind(onboardingController)));

router.post("/complete", authMiddleware, asyncHandler(onboardingController.completeOnboarding.bind(onboardingController)));
router.patch("/update", authMiddleware, asyncHandler(onboardingController.updateOnboarding.bind(onboardingController)));

export default router;