import prisma from "../config/dbConnect.js";
import logger from "../utils/logger.js";

// Helper function to calculate match score between user profile and university
const calculateMatchScore = (university, userProfile) => {
  if (!userProfile) return Math.floor(Math.random() * 30) + 60;

  let score = 50;

  if (userProfile.gpa) {
    const gpaScore = userProfile.gpa * 6.25;
    score += Math.min(gpaScore, 25);
  }

  if (userProfile.testStatus === 'completed') score += 7;
  if (userProfile.greStatus === 'completed') {
    score += 5;
    if (userProfile.greScore >= 320) score += 3;
  }

  if (university.fees && userProfile.budget) {
    const affordability = (userProfile.budget / university.fees) * 20;
    score += Math.min(affordability, 20);
  }

  if (userProfile.preferredCountries && university.country) {
    const preferred = userProfile.preferredCountries.toLowerCase().split(',').map(c => c.trim());
    if (preferred.includes(university.country.toLowerCase())) {
      score += 15;
    }
  }

  if (userProfile.fieldOfStudy) {
    const field = userProfile.fieldOfStudy.toLowerCase();
    if (field.includes('computer') || field.includes('data') || field.includes('engineer')) {
      score += 10;
    } else {
      score += 5;
    }
  }

  if (university.ranking <= 10) score += 10;
  else if (university.ranking <= 50) score += 8;
  else if (university.ranking <= 100) score += 6;
  else if (university.ranking <= 200) score += 4;

  const randomAdjustment = Math.floor(Math.random() * 11) - 5;
  return Math.max(30, Math.min(100, Math.floor(score + randomAdjustment)));
};

class UniversityController {
  // Get all universities
  getAllUniversities = async (req, res) => {
    try {
      console.log("📚 Fetching all universities...");

      const universities = await prisma.university.findMany({
        orderBy: { ranking: 'asc' }
      });

      let userProfile = null;
      if (req.user?.id) {
        userProfile = await prisma.onboarding.findUnique({
          where: { userId: req.user.id }
        });
      }

      const universitiesWithScores = universities.map(university => ({
        ...university,
        matchScore: calculateMatchScore(university, userProfile)
      }));

      res.status(200).json({
        success: true,
        count: universitiesWithScores.length,
        data: universitiesWithScores
      });
    } catch (error) {
      logger.error("Error fetching universities:", error);
      res.status(500).json({
        success: false,
        message: "Failed to fetch universities",
        error: error.message
      });
    }
  }

  // Get university by ID
  getUniversityById = async (req, res) => {
    try {
      const { id } = req.params;

      if (!id || isNaN(parseInt(id))) {
        return res.status(400).json({
          success: false,
          message: "Invalid university ID"
        });
      }

      const universityId = parseInt(id);

      const university = await prisma.university.findUnique({
        where: { id: universityId }
      });

      if (!university) {
        return res.status(404).json({
          success: false,
          message: "University not found"
        });
      }

      let userProfile = null;
      if (req.user?.id) {
        userProfile = await prisma.onboarding.findUnique({
          where: { userId: req.user.id }
        });
      }

      const matchScore = calculateMatchScore(university, userProfile);

      let category = "Safe";
      if (matchScore >= 80) category = "Dream";
      else if (matchScore >= 60) category = "Target";

      // Check if shortlisted using new model
      let isShortlisted = false;
      let isLocked = false;

      if (req.user?.id) {
        const shortlistEntry = await prisma.shortlist.findUnique({
          where: {
            userId_universityId: {
              userId: req.user.id,
              universityId: universityId
            }
          }
        });
        isShortlisted = !!shortlistEntry;

        const lockEntry = await prisma.lock.findUnique({
          where: {
            userId_universityId: {
              userId: req.user.id,
              universityId: universityId
            }
          }
        });
        isLocked = !!lockEntry;
      }

      const universityWithDetails = {
        ...university,
        matchScore,
        category,
        isShortlisted,
        isLocked
      };

      res.status(200).json({
        success: true,
        data: universityWithDetails
      });
    } catch (error) {
      logger.error("Error fetching university:", error);
      res.status(500).json({
        success: false,
        message: "Failed to fetch university details",
        error: error.message
      });
    }
  }

  // Add university to shortlist
  // addToShortlist = async (req, res) => {
  //   try {
  //     const { universityId } = req.body;
  //     const userId = req.user.id;

  //     if (!universityId) {
  //       return res.status(400).json({
  //         success: false,
  //         message: "University ID is required"
  //       });
  //     }

  //     const universityIdNum = parseInt(universityId);
  //     if (isNaN(universityIdNum)) {
  //       return res.status(400).json({
  //         success: false,
  //         message: "Invalid university ID format"
  //       });
  //     }

  //     const university = await prisma.university.findUnique({
  //       where: { id: universityIdNum }
  //     });

  //     if (!university) {
  //       return res.status(404).json({
  //         success: false,
  //         message: "University not found"
  //       });
  //     }

  //     // Check if already shortlisted using new model
  //     const existingShortlist = await prisma.shortlist.findUnique({
  //       where: {
  //         userId_universityId: {
  //           userId,
  //           universityId: universityIdNum
  //         }
  //       }
  //     });

  //     if (existingShortlist) {
  //       return res.status(400).json({
  //         success: false,
  //         message: "University is already in your shortlist"
  //       });
  //     }

  //     // Add to shortlist using new model
  //     await prisma.shortlist.create({
  //       data: {
  //         userId,
  //         universityId: universityIdNum
  //       }
  //     });

  //     res.status(200).json({
  //       success: true,
  //       message: "University added to shortlist",
  //       data: university
  //     });
  //   } catch (error) {
  //     logger.error("Error adding to shortlist:", error);
  //     res.status(500).json({
  //       success: false,
  //       message: "Failed to add university to shortlist",
  //       error: error.message
  //     });
  //   }
  // } 

  // In addToShortlist method
  addToShortlist = async (req, res) => {
    try {
      console.log("🔍 addToShortlist - User ID:", req.user?.id);
      console.log("🔍 addToShortlist - Request body:", req.body);

      const { universityId } = req.body;
      const userId = req.user.id;

      if (!universityId) {
        console.log("❌ No universityId provided");
        return res.status(400).json({
          success: false,
          message: "University ID is required"
        });
      }

      const universityIdNum = parseInt(universityId);
      console.log("🔍 Parsed universityId:", universityIdNum);

      if (isNaN(universityIdNum)) {
        console.log("❌ Invalid universityId format:", universityId);
        return res.status(400).json({
          success: false,
          message: "Invalid university ID format"
        });
      }

      // Check if university exists
      const university = await prisma.university.findUnique({
        where: { id: universityIdNum }
      });

      if (!university) {
        console.log("❌ University not found with ID:", universityIdNum);
        return res.status(404).json({
          success: false,
          message: "University not found"
        });
      }

      // Check if already shortlisted
      const existingShortlist = await prisma.shortlist.findUnique({
        where: {
          userId_universityId: {
            userId,
            universityId: universityIdNum
          }
        }
      });

      if (existingShortlist) {
        console.log("❌ Already shortlisted");
        return res.status(400).json({
          success: false,
          message: "University is already in your shortlist"
        });
      }

      // Add to shortlist
      console.log("✅ Adding to shortlist - userId:", userId, "universityId:", universityIdNum);
      await prisma.shortlist.create({
        data: {
          userId,
          universityId: universityIdNum
        }
      });

      console.log("✅ Successfully added to shortlist");
      res.status(200).json({
        success: true,
        message: "University added to shortlist",
        data: university
      });
    } catch (error) {
      console.error("❌ Error in addToShortlist:", error);
      console.error("❌ Error stack:", error.stack);
      logger.error("Error adding to shortlist:", error);
      res.status(500).json({
        success: false,
        message: "Failed to add university to shortlist",
        error: error.message
      });
    }
  }

  // Remove university from shortlist
  removeFromShortlist = async (req, res) => {
    try {
      const { id } = req.params;
      const userId = req.user.id;

      if (!id || isNaN(parseInt(id))) {
        return res.status(400).json({
          success: false,
          message: "Invalid university ID"
        });
      }

      const universityId = parseInt(id);

      await prisma.shortlist.delete({
        where: {
          userId_universityId: {
            userId,
            universityId
          }
        }
      });

      res.status(200).json({
        success: true,
        message: "University removed from shortlist"
      });
    } catch (error) {
      logger.error("Error removing from shortlist:", error);

      // Handle case where entry doesn't exist
      if (error.code === 'P2025') {
        return res.status(404).json({
          success: false,
          message: "University not found in your shortlist"
        });
      }

      res.status(500).json({
        success: false,
        message: "Failed to remove university from shortlist",
        error: error.message
      });
    }
  }

  // Get user's shortlisted universities
  getShortlisted = async (req, res) => {
    try {
      const userId = req.user.id;

      const shortlistEntries = await prisma.shortlist.findMany({
        where: { userId },
        include: {
          university: true
        },
        orderBy: {
          university: {
            ranking: 'asc'
          }
        }
      });

      const userProfile = await prisma.onboarding.findUnique({
        where: { userId }
      });

      const shortlistedUniversities = shortlistEntries.map(entry => ({
        ...entry.university,
        matchScore: calculateMatchScore(entry.university, userProfile),
        shortlistedAt: entry.createdAt
      }));

      res.status(200).json({
        success: true,
        count: shortlistedUniversities.length,
        data: shortlistedUniversities
      });
    } catch (error) {
      logger.error("Error fetching shortlisted:", error);
      res.status(500).json({
        success: false,
        message: "Failed to fetch shortlisted universities",
        error: error.message
      });
    }
  }

  // Get AI recommendations
  getAIRecommendations = async (req, res) => {
    try {
      const userId = req.user.id;

      const userProfile = await prisma.onboarding.findUnique({
        where: { userId }
      });

      if (!userProfile) {
        return res.status(400).json({
          success: false,
          message: "Please complete your profile first"
        });
      }

      const universities = await prisma.university.findMany();

      const recommendations = universities
        .map(university => ({
          ...university,
          matchScore: calculateMatchScore(university, userProfile)
        }))
        .sort((a, b) => b.matchScore - a.matchScore)
        .slice(0, 8);

      const categorized = {
        dream: recommendations.filter(u => u.matchScore >= 80),
        target: recommendations.filter(u => u.matchScore >= 60 && u.matchScore < 80),
        safe: recommendations.filter(u => u.matchScore < 60)
      };

      res.status(200).json({
        success: true,
        data: {
          recommendations: categorized,
          profileMatch: {
            totalUniversities: universities.length,
            analyzedCount: recommendations.length,
            averageMatchScore: Math.round(recommendations.reduce((sum, u) => sum + u.matchScore, 0) / recommendations.length)
          }
        }
      });
    } catch (error) {
      logger.error("Error getting AI recommendations:", error);
      res.status(500).json({
        success: false,
        message: "Failed to generate recommendations",
        error: error.message
      });
    }
  }

  // Lock a university
  lockUniversity = async (req, res) => {
    try {
      const { universityId } = req.body;
      const userId = req.user.id;

      if (!universityId) {
        return res.status(400).json({
          success: false,
          message: "University ID is required"
        });
      }

      const universityIdNum = parseInt(universityId);
      if (isNaN(universityIdNum)) {
        return res.status(400).json({
          success: false,
          message: "Invalid university ID format"
        });
      }

      const university = await prisma.university.findUnique({
        where: { id: universityIdNum }
      });

      if (!university) {
        return res.status(404).json({
          success: false,
          message: "University not found"
        });
      }

      const existingLock = await prisma.lock.findUnique({
        where: {
          userId_universityId: {
            userId,
            universityId: universityIdNum
          }
        }
      });

      if (existingLock) {
        return res.status(400).json({
          success: false,
          message: "University is already locked"
        });
      }

      await prisma.lock.create({
        data: {
          userId,
          universityId: universityIdNum
        }
      });

      res.status(200).json({
        success: true,
        message: "University locked successfully",
        data: university
      });
    } catch (error) {
      logger.error("Error locking university:", error);
      res.status(500).json({
        success: false,
        message: "Failed to lock university",
        error: error.message
      });
    }
  }

  // Get user's locked universities
  getLockedUniversities = async (req, res) => {
    try {
      const userId = req.user.id;

      const lockEntries = await prisma.lock.findMany({
        where: { userId },
        include: {
          university: true
        },
        orderBy: {
          university: {
            ranking: 'asc'
          }
        }
      });

      const lockedUniversities = lockEntries.map(entry => ({
        ...entry.university,
        lockedAt: entry.createdAt
      }));

      res.status(200).json({
        success: true,
        count: lockedUniversities.length,
        data: lockedUniversities
      });
    } catch (error) {
      logger.error("Error fetching locked universities:", error);
      res.status(500).json({
        success: false,
        message: "Failed to fetch locked universities",
        error: error.message
      });
    }
  }

  // Search universities
  searchUniversities = async (req, res) => {
    try {
      const { query, country, minRank, maxFees, category } = req.query;

      let where = {};

      if (query) {
        where.OR = [
          { name: { contains: query, mode: 'insensitive' } },
          { description: { contains: query, mode: 'insensitive' } },
          { location: { contains: query, mode: 'insensitive' } }
        ];
      }

      if (country) {
        where.country = country;
      }

      if (minRank) {
        where.ranking = { lte: parseInt(minRank) };
      }

      if (maxFees) {
        where.fees = { lte: parseInt(maxFees) };
      }

      const universities = await prisma.university.findMany({
        where,
        orderBy: { ranking: 'asc' },
        take: 50
      });

      let userProfile = null;
      if (req.user?.id) {
        userProfile = await prisma.onboarding.findUnique({
          where: { userId: req.user.id }
        });
      }

      const universitiesWithScores = universities.map(university => ({
        ...university,
        matchScore: calculateMatchScore(university, userProfile)
      }));

      let filteredResults = universitiesWithScores;
      if (category) {
        filteredResults = universitiesWithScores.filter(university => {
          const score = university.matchScore || 0;
          if (category === 'dream') return score >= 80;
          if (category === 'target') return score >= 60 && score < 80;
          if (category === 'safe') return score < 60;
          return true;
        });
      }

      res.status(200).json({
        success: true,
        count: filteredResults.length,
        data: filteredResults
      });
    } catch (error) {
      logger.error("Error searching universities:", error);
      res.status(500).json({
        success: false,
        message: "Failed to search universities",
        error: error.message
      });
    }
  }

  // Get countries
  getCountries = async (req, res) => {
    try {
      const countries = await prisma.university.findMany({
        distinct: ['country'],
        select: { country: true },
        where: { country: { not: null } },
        orderBy: { country: 'asc' }
      });

      res.status(200).json({
        success: true,
        data: countries.map(c => c.country)
      });
    } catch (error) {
      logger.error("Error fetching countries:", error);
      res.status(500).json({
        success: false,
        message: "Failed to fetch countries",
        error: error.message
      });
    }
  }

  // Get statistics
  getUniversityStats = async (req, res) => {
    try {
      const totalUniversities = await prisma.university.count();

      const countries = await prisma.university.groupBy({
        by: ['country'],
        _count: { id: true },
        orderBy: { _count: { id: 'desc' } },
        take: 10
      });

      const feesStats = await prisma.university.aggregate({
        _avg: { fees: true },
        _min: { fees: true },
        _max: { fees: true }
      });

      const rankingStats = await prisma.university.aggregate({
        _avg: { ranking: true },
        _min: { ranking: true },
        _max: { ranking: true }
      });

      res.status(200).json({
        success: true,
        data: {
          totalUniversities,
          countries: countries.map(c => ({ country: c.country, count: c._count.id })),
          fees: {
            average: Math.round(feesStats._avg.fees || 0),
            minimum: feesStats._min.fees || 0,
            maximum: feesStats._max.fees || 0
          },
          rankings: {
            average: Math.round(rankingStats._avg.ranking || 0),
            minimum: rankingStats._min.ranking || 0,
            maximum: rankingStats._max.ranking || 0
          }
        }
      });
    } catch (error) {
      logger.error("Error fetching university stats:", error);
      res.status(500).json({
        success: false,
        message: "Failed to fetch university statistics",
        error: error.message
      });
    }
  }
}

export default new UniversityController();