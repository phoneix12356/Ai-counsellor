import express from "express";
import authRoute from "./authRoute.js";
import onboardingRoute from "./onboardingRoute.js";
import chatBotRoute from "./chatBotRoute.js";
import universityRoutes from "./universityRoutes.js";

const router = express.Router();

router.use("/auth", authRoute);
router.use("/onboarding", onboardingRoute);
router.use("/counsellor", chatBotRoute);
router.use("/universities", universityRoutes);

export default router;
