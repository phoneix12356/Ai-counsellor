import dotenv from "dotenv";
dotenv.config();
import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import router from "./routes/index.js";
import prisma from "./config/dbConnect.js";
import GlobalExceptionalHandler from "./exceptions/GlobalExceptionalHandler.js";


const app = express();
const PORT = process.env.PORT || 5000;

// Add this after the CORS middleware
app.use((req, res, next) => {
  res.on('finish', () => {
    console.log('CORS Headers set for response:');
    console.log('Access-Control-Allow-Origin:', res.getHeader('Access-Control-Allow-Origin'));
    console.log('Access-Control-Allow-Credentials:', res.getHeader('Access-Control-Allow-Credentials'));
  });
  next();
});

app.use(cors({
  origin: function (origin, callback) {
    // List of allowed origins
    const allowedOrigins = [
      'https://ai-counsellor-3ccp.vercel.app',
      'http://localhost:3000',
      'http://localhost:5173', // Vite dev server
      // Add other domains as needed
    ];

    // Allow requests with no origin (like mobile apps, curl, etc.)
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true
}));




app.use(express.json());
app.use(cookieParser());

app.get("/health", async (req, res) => {
  try {
    await prisma.$queryRaw`SELECT 1`; // simple check
    res.json({ status: "ok" });
  } catch (err) {
    res.status(500).json({ status: "db_error", message: err.message });
  }
});
app.use("/api", router);

// Error handler middleware (must be last)
app.use(GlobalExceptionalHandler);

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
})