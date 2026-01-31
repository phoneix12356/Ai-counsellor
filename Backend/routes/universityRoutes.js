import express from "express";
import UniversityController from "../controller/universityController.js";
import authMiddleware from "../middleware/authMiddleware.js";

const router = express.Router();

// Public routes
router.get("/", UniversityController.getAllUniversities);
router.get("/search", UniversityController.searchUniversities);
router.get("/countries", UniversityController.getCountries);
router.get("/stats", UniversityController.getUniversityStats);

// IMPORTANT: Protected routes MUST come BEFORE the parameterized route
// Otherwise, /shortlisted matches /:id with id="shortlisted"
router.get("/shortlisted", authMiddleware, UniversityController.getShortlisted);
router.post("/shortlist", authMiddleware, UniversityController.addToShortlist);
router.delete("/shortlist/:id", authMiddleware, UniversityController.removeFromShortlist);
router.get("/ai/recommendations", authMiddleware, UniversityController.getAIRecommendations);
router.post("/lock", authMiddleware, UniversityController.lockUniversity);
router.get("/locked", authMiddleware, UniversityController.getLockedUniversities);

// Public route - MUST BE LAST
router.get("/:id", UniversityController.getUniversityById);

export default router;