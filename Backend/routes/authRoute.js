import express from "express";
import authController from "../controller/authController.js";
import authMiddleware from "../middleware/authMiddleware.js";

const router = express.Router();

// Async handler wrapper
const asyncHandler = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

router.post("/register", asyncHandler(authController.register.bind(authController)));
router.post("/login", asyncHandler(authController.login.bind(authController)));
router.get("/me", authMiddleware, asyncHandler(authController.getMe.bind(authController)));
router.patch("/update", authMiddleware, asyncHandler(authController.updateProfile.bind(authController)));

export default router;