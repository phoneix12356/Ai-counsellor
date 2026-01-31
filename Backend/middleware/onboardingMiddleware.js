import prisma from "../config/dbConnect.js";
import ErrorResponse from "../exceptions/ErrorResponse.js";

const onboardingMiddleware = async (req, res, next) => {
  try {
    const userId = req.user.id;

    const user = await prisma.users.findUnique({
      where: { id: userId },
      select: { onboardingComplete: true }
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found"
      });
    }

    if (!user.onboardingComplete) {
      return res.status(403).json({
        success: false,
        message: "Please complete onboarding first",
        redirectTo: "/onboarding"
      });
    }

    next();
  } catch (error) {
    next(error);
  }
};

export default onboardingMiddleware;
