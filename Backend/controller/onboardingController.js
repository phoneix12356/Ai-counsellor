import prisma from "../config/dbConnect.js";
import ErrorResponse from "../exceptions/ErrorResponse.js";
import logger from "../utils/logger.js";
import { calculateProfileScore, determineCurrentStage } from "../utils/profileLogic.js";
import { getProfileAnalysisPrompt } from "../utils/prompts.js";
import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

const getAIProfileAnalysis = async (profile) => {
  try {
    const prompt = getProfileAnalysisPrompt(profile);
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
    });

    // Safely extract text based on SDK behavior
    const text = response?.text ?? "";
    const jsonStr = text.replace(/```json/g, "").replace(/```/g, "").trim();
    return JSON.parse(jsonStr);
  } catch (error) {
    logger.error("AI Analysis Error", error);
    // Fallback if AI fails
    return { score: 10, analysis: "Profile analysis pending. Please check back later." };
  }
};

// Helper function to parse GPA safely
const parseGPA = (gpaString) => {
  if (!gpaString) return null;

  // Try to extract first valid number from string
  const match = gpaString.toString().match(/(\d+\.?\d*)/);
  if (match) {
    const value = parseFloat(match[0]);
    // Ensure it's a valid GPA range (0-4.0 or 0-100)
    if (value >= 0 && value <= 100) {
      // If it's likely a percentage (e.g., 85), convert to 4.0 scale
      if (value > 4.0 && value <= 100) {
        return (value / 100) * 4.0;
      }
      return value;
    }
  }
  return null;
};

// Helper function to parse budget
const parseBudget = (budgetValue) => {
  if (!budgetValue) return 0;

  // If it's already a number
  if (typeof budgetValue === 'number') {
    return budgetValue;
  }

  // If it's a string like "$20k-$40k" or "<$20k"
  const str = budgetValue.toString();

  // Extract numbers
  const match = str.match(/\$?(\d+)/);
  if (match) {
    let num = parseInt(match[1]);

    // Handle k suffix (thousands)
    if (str.toLowerCase().includes('k')) {
      num = num * 1000;
    }

    // For ranges like "$20k-$40k", take average
    const rangeMatch = str.match(/\$?(\d+).*?(\d+)/);
    if (rangeMatch && rangeMatch.length >= 3) {
      const num1 = parseInt(rangeMatch[1]);
      const num2 = parseInt(rangeMatch[2]);
      const avg = Math.round((num1 + num2) / 2);
      return str.toLowerCase().includes('k') ? avg * 1000 : avg;
    }

    return num;
  }

  return 0;
};

// Helper function to convert array to comma-separated string for database
const convertArrayToString = (value) => {
  if (Array.isArray(value)) {
    return value.join(', ');
  }
  return value;
};

// Helper function to convert string to array for frontend
const convertStringToArray = (value) => {
  if (typeof value === 'string' && value.trim() !== '') {
    return value.split(',').map(item => item.trim());
  }
  return [];
};

class OnboardingController {
  async completeOnboarding(req, res) {
    const userId = req.user.id;
    const {
      educationLevel,
      major,
      graduationYear,
      gpa,
      intendedDegree,
      fieldOfStudy,
      intakeYear,
      preferredCountries,
      budget,
      fundingPlan,
      testStatus,
      greStatus,
      greScore,
      sopStatus,
    } = req.body;

    // Validation
    if (!educationLevel || !major || !graduationYear || !intendedDegree ||
      !fieldOfStudy || !intakeYear || !preferredCountries || !budget || !fundingPlan) {
      throw new ErrorResponse("All mandatory fields must be filled", 400);
    }

    // Parse and prepare data
    const parsedGPA = parseGPA(gpa);
    const parsedBudget = parseBudget(budget);
    const preferredCountriesString = convertArrayToString(preferredCountries);

    // Prepare data for AI analysis
    const profileData = {
      educationLevel,
      major,
      graduationYear: graduationYear ? parseInt(graduationYear) : null,
      gpa: parsedGPA,
      intendedDegree,
      fieldOfStudy,
      intakeYear: intakeYear ? parseInt(intakeYear) : null,
      preferredCountries: preferredCountriesString,
      budget: parsedBudget,
      fundingPlan,
      testStatus: testStatus || "not-started",
      greStatus: greStatus || "not-required",
      greScore: greScore ? parseInt(greScore) : 0,
      sopStatus: sopStatus || "not-started",
    };

    try {
      // 1. Get AI Analysis (convert back to array for AI)
      const aiAnalysis = await getAIProfileAnalysis({
        ...profileData,
        preferredCountries: convertStringToArray(profileData.preferredCountries)
      });

      // 2. Calculate Score using User's Formula + AI Score
      const score = calculateProfileScore({
        ...profileData,
        preferredCountries: convertStringToArray(profileData.preferredCountries)
      }, aiAnalysis.score);

      // 3. Determine Stage (Assume 0 locked as it's first time)
      const stage = determineCurrentStage({
        ...profileData,
        preferredCountries: convertStringToArray(profileData.preferredCountries),
        onboardingComplete: true,
        lockedCount: 0,
        shortlistedCount: 0
      });

      // Use a transaction to ensure both updates happen together
      const result = await prisma.$transaction(async (tx) => {
        const onboarding = await tx.onboarding.upsert({
          where: { userId },
          update: {
            educationLevel,
            major,
            graduationYear: profileData.graduationYear,
            gpa: profileData.gpa,
            intendedDegree,
            fieldOfStudy,
            intakeYear: profileData.intakeYear,
            preferredCountries: profileData.preferredCountries,
            budget: profileData.budget,
            fundingPlan,
            testStatus: profileData.testStatus,
            greStatus: profileData.greStatus,
            greScore: profileData.greScore,
            sopStatus: profileData.sopStatus,
            profileScore: score,
            profileAnalysis: aiAnalysis.analysis,
            currentStage: stage,
          },
          create: {
            userId,
            educationLevel,
            major,
            graduationYear: profileData.graduationYear,
            gpa: profileData.gpa,
            intendedDegree,
            fieldOfStudy,
            intakeYear: profileData.intakeYear,
            preferredCountries: profileData.preferredCountries,
            budget: profileData.budget,
            fundingPlan,
            testStatus: profileData.testStatus,
            greStatus: profileData.greStatus,
            greScore: profileData.greScore,
            sopStatus: profileData.sopStatus,
            profileScore: score,
            profileAnalysis: aiAnalysis.analysis,
            currentStage: stage,
          },
        });

        const updatedUser = await tx.users.update({
          where: { id: userId },
          data: { onboardingComplete: true },
          include: { onboarding: true }
        });

        return updatedUser;
      });

      res.status(200).json({
        success: true,
        message: "Onboarding completed successfully",
        user: {
          id: result.id,
          name: result.name,
          email: result.email,
          onboardingComplete: result.onboardingComplete,
          onboarding: {
            ...result.onboarding,
            preferredCountries: convertStringToArray(result.onboarding?.preferredCountries)
          }
        },
      });
    } catch (error) {
      logger.error("Onboarding completion error:", error);
      throw new ErrorResponse("Failed to complete onboarding", 500);
    }
  }

  async updateOnboarding(req, res) {
    const userId = req.user.id;
    const updateData = { ...req.body };

    try {
      // Get existing data AND relations to correctly determine stage
      const user = await prisma.users.findUnique({
        where: { id: userId },
        include: {
          onboarding: true,
          locked: {
            include: {
              university: true
            }
          },
          shortlisted: {
            include: {
              university: true
            }
          },
          chatHistory: true
        }
      });

      if (!user || !user.onboarding) {
        throw new ErrorResponse("Onboarding record not found", 404);
      }

      const existing = user.onboarding;

      // Parse numeric fields if present
      if (updateData.graduationYear !== undefined) {
        updateData.graduationYear = updateData.graduationYear ? parseInt(updateData.graduationYear) : null;
      }
      if (updateData.intakeYear !== undefined) {
        updateData.intakeYear = updateData.intakeYear ? parseInt(updateData.intakeYear) : null;
      }
      if (updateData.gpa !== undefined) {
        updateData.gpa = parseGPA(updateData.gpa);
      }
      if (updateData.greScore !== undefined) {
        updateData.greScore = updateData.greScore ? parseInt(updateData.greScore) : 0;
      }
      if (updateData.budget !== undefined) {
        updateData.budget = parseBudget(updateData.budget);
      }

      // Convert preferredCountries array to string for database
      if (updateData.preferredCountries !== undefined) {
        updateData.preferredCountries = convertArrayToString(updateData.preferredCountries);
      }

      // Merge with existing data
      const mergedData = { ...existing, ...updateData };

      // Remove id and userId from mergedData for AI analysis
      const { id, userId: _, ...profileForAI } = mergedData;

      // Convert preferredCountries back to array for AI analysis
      const profileForAIWithArray = {
        ...profileForAI,
        preferredCountries: convertStringToArray(profileForAI.preferredCountries)
      };

      // We re-run AI analysis implies a significant update to profile
      const aiAnalysis = await getAIProfileAnalysis(profileForAIWithArray);
      const score = calculateProfileScore(profileForAIWithArray, aiAnalysis.score);

      // Extract university counts
      const lockedCount = user.locked.length;
      const shortlistedCount = user.shortlisted.length;

      // Determine stage based on profile data and counts
      const stage = determineCurrentStage({
        ...profileForAIWithArray,
        onboardingComplete: true,
        lockedCount,
        shortlistedCount
      });

      const updatedUser = await prisma.users.update({
        where: { id: userId },
        data: {
          onboarding: {
            update: {
              ...updateData,
              profileScore: score,
              profileAnalysis: aiAnalysis.analysis,
              currentStage: stage
            }
          }
        },
        include: {
          onboarding: true,
          locked: {
            include: {
              university: true
            }
          },
          shortlisted: {
            include: {
              university: true
            }
          }
        }
      });

      // Transform response for frontend
      const responseData = {
        success: true,
        message: "Onboarding updated successfully",
        user: {
          id: updatedUser.id,
          name: updatedUser.name,
          email: updatedUser.email,
          onboardingComplete: updatedUser.onboardingComplete,
          onboarding: {
            ...updatedUser.onboarding,
            preferredCountries: convertStringToArray(updatedUser.onboarding?.preferredCountries)
          },
          // Add these arrays for compatibility if needed
          lockedUniversities: updatedUser.locked.map(item => item.university),
          shortlistedUniversities: updatedUser.shortlisted.map(item => item.university)
        },
      };

      res.status(200).json(responseData);
    } catch (error) {
      logger.error("Onboarding update error:", error);
      throw new ErrorResponse("Failed to update onboarding", 500);
    }
  }

  async getOnboarding(req, res) {
    const userId = req.user.id;

    try {
      const user = await prisma.users.findUnique({
        where: { id: userId },
        include: {
          onboarding: true,
          locked: {
            include: {
              university: true
            }
          },
          shortlisted: {
            include: {
              university: true
            }
          }
        }
      });

      if (!user || !user.onboarding) {
        throw new ErrorResponse("Onboarding record not found", 404);
      }

      // Transform response for frontend
      const responseData = {
        success: true,
        onboarding: {
          ...user.onboarding,
          preferredCountries: convertStringToArray(user.onboarding?.preferredCountries)
        },
        // Add these for compatibility if needed
        lockedUniversities: user.locked.map(item => item.university),
        shortlistedUniversities: user.shortlisted.map(item => item.university)
      };

      res.status(200).json(responseData);
    } catch (error) {
      logger.error("Get onboarding error:", error);
      throw new ErrorResponse("Failed to fetch onboarding data", 500);
    }
  }
}

export default new OnboardingController();