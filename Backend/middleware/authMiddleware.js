import { verifyToken } from "../utils/jwt.js";

const authMiddleware = (req, res, next) => {
  console.log("authMiddleware - Full req:", req.body);
  const authHeader = req.headers.authorization;
  let token = req.cookies?.["auth-token"];

  if (!token && authHeader && authHeader.startsWith("Bearer ")) {
    token = authHeader.split(" ")[1];
  }

  if (!token) {
    return res.status(401).json({
      success: false,
      message: "no token found"
    })
  }

  try {
    const isVerfied = verifyToken(token);
    req.user = isVerfied;
    next();
  } catch (error) {
    return res.status(401).json({
      success: false,
      message: "unauthorized"
    })
  }
}

export default authMiddleware;