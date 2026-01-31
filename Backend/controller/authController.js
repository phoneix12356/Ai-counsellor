import prisma from "../config/dbConnect.js";
import { generateToken } from "../utils/jwt.js";
import { hashPassword, verifyPassword } from "../utils/bcrypt.js";
import ErrorResponse from "../exceptions/ErrorResponse.js";
import logger from "../utils/logger.js";

class AuthController {
  async register(req, res) {
    const { name, email, password } = req.body;
    logger.debug(`Registering user: ${email}`);

    if (!name || !email || !password) {
      throw new ErrorResponse("All fields are required", 400);
    }

    const isUserExist = await prisma.users.findUnique({
      where: { email }
    });

    if (isUserExist) {
      throw new ErrorResponse("Email already exists", 400);
    }

    const hashedPassword = await hashPassword(password);

    const newUser = await prisma.users.create({
      data: {
        name,
        email,
        password: hashedPassword
      },
      include: { onboarding: true }
    });

    const token = generateToken({ id: newUser.id });

    res.cookie("auth-token", token, {
      httpOnly: true,
      sameSite: "strict",
      maxAge: 24 * 60 * 60 * 1000
    });

    res.status(201).json({
      success: true,
      message: "User registered successfully",
      user: {
        id: newUser.id,
        name: newUser.name,
        email: newUser.email,
        onboardingComplete: newUser.onboardingComplete,
        onboarding: newUser.onboarding
      }
    });
  }

  async login(req, res) {
    const { email, password } = req.body;

    if (!email || !password) {
      throw new ErrorResponse("Email and password are required", 400);
    }

    const user = await prisma.users.findUnique({
      where: { email },
      include: { onboarding: true }
    });

    if (!user) {
      throw new ErrorResponse("Invalid credentials", 401);
    }

    const isPasswordValid = await verifyPassword(password, user.password);

    if (!isPasswordValid) {
      throw new ErrorResponse("Invalid credentials", 401);
    }

    const token = generateToken({ id: user.id });

    res.cookie("auth-token", token, {
      httpOnly: true,
      sameSite: "none",
      maxAge: 24 * 60 * 60 * 1000
    });

    res.status(200).json({
      success: true,
      message: "Login successful",
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        onboardingComplete: user.onboardingComplete,
        onboarding: user.onboarding
      }
    });
  }

  async getMe(req, res) {
    const user = await prisma.users.findUnique({
      where: { id: req.user.id },
      include: { onboarding: true }
    });

    if (!user) {
      throw new ErrorResponse("User not found", 404);
    }

    res.status(200).json({
      success: true,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        onboardingComplete: user.onboardingComplete,
        onboarding: user.onboarding
      }
    });
  }

  async updateProfile(req, res) {
    const { name, email } = req.body;
    const userId = req.user.id;

    const user = await prisma.users.findUnique({
      where: { id: userId }
    });

    if (!user) {
      throw new ErrorResponse("User not found", 404);
    }

    if (email && email !== user.email) {
      const isEmailExist = await prisma.users.findUnique({
        where: { email }
      });
      if (isEmailExist) {
        throw new ErrorResponse("Email already exists", 400);
      }
    }

    const updatedUser = await prisma.users.update({
      where: { id: userId },
      data: {
        name: name || user.name,
        email: email || user.email
      },
      include: { onboarding: true }
    });

    res.status(200).json({
      success: true,
      message: "Profile updated successfully",
      user: {
        id: updatedUser.id,
        name: updatedUser.name,
        email: updatedUser.email,
        onboardingComplete: updatedUser.onboardingComplete,
        onboarding: updatedUser.onboarding
      }
    });
  }
}

export default new AuthController();