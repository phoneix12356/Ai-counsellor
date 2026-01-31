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

app.set("trust proxy", 1);
app.use((req, res, next) => {
  res.setHeader("Cache-Control", "no-store");
  next();
});


const allowedOrigins = [
  "https://ai-counsellor-3ccp.vercel.app",
  "http://localhost:3000",
  "http://localhost:5173"
];

app.use(cors({
  origin: (origin, callback) => {
    if (!origin) return callback(null, true);

    if (origin.endsWith(".vercel.app")) {
      return callback(null, origin);
    }

    if (allowedOrigins.includes(origin)) {
      return callback(null, origin);
    }

    return callback(null, false);
  },
  credentials: true
}));

app.use(express.json());
app.use(cookieParser());

app.get("/health", async (req, res) => {
  try {
    await prisma.$queryRaw`SELECT 1`;
    res.json({ status: "ok" });
  } catch (err) {
    res.status(500).json({ status: "db_error", message: err.message });
  }
});

app.use("/api", router);

// must be last
app.use(GlobalExceptionalHandler);

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
