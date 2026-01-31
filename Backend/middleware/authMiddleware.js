import { verifyToken } from "../utils/jwt.js";

const authMiddleware = (req, res, next) => {
  console.log("🔍 === AUTH MIDDLEWARE DEBUG ===");
  console.log("📍 Path:", req.path);
  console.log("📅 Time:", new Date().toISOString());

  // Log ALL headers to see what's coming
  console.log("📋 Request Headers:");
  Object.keys(req.headers).forEach(key => {
    if (key.toLowerCase().includes('auth') || key.toLowerCase().includes('cookie')) {
      console.log(`  ${key}: ${req.headers[key]}`);
    }
  });

  // Also log all cookies
  console.log("🍪 Parsed Cookies:", req.cookies);

  // Check for token in multiple places
  const authHeader = req.headers.authorization;
  const cookieToken = req.cookies?.["auth-token"];
  const altCookieToken = req.cookies?.token;

  console.log("🔑 Checking for token in:");
  console.log("  - Authorization header:", authHeader);
  console.log("  - Cookie 'auth-token':", cookieToken ? "YES" : "NO");
  console.log("  - Cookie 'token':", altCookieToken ? "YES" : "NO");
  console.log("  - All cookies:", Object.keys(req.cookies || {}));

  let token = null;

  // Priority 1: Cookie named "auth-token"
  if (cookieToken) {
    token = cookieToken;
    console.log("✅ Using token from 'auth-token' cookie");
  }
  // Priority 2: Cookie named "token"
  else if (altCookieToken) {
    token = altCookieToken;
    console.log("✅ Using token from 'token' cookie");
  }
  // Priority 3: Authorization Bearer header
  else if (authHeader && authHeader.startsWith("Bearer ")) {
    token = authHeader.split(" ")[1];
    console.log("✅ Using token from Authorization header");
  }
  // Priority 4: Query parameter (for testing)
  else if (req.query.token) {
    token = req.query.token;
    console.log("✅ Using token from query parameter");
  }

  console.log("🎯 Token found:", token ? `YES (${token.substring(0, 20)}...)` : "NO");

  if (!token) {
    console.log("❌ No token found in any location");
    return res.status(401).json({
      success: false,
      message: "Authentication required",
      debug: {
        headers: Object.keys(req.headers),
        cookies: req.cookies,
        authHeader: authHeader
      }
    });
  }

  try {
    const isVerified = verifyToken(token);
    req.user = isVerified;
    console.log("✅ Token verified successfully");
    next();
  } catch (error) {
    console.log("❌ Token verification failed:", error.message);
    return res.status(401).json({
      success: false,
      message: "Invalid or expired token",
      error: error.message
    });
  }
}

export default authMiddleware;