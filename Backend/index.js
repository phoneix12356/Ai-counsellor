import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";
import router from "./routes/index.js";
import prisma from "./config/dbConnect.js";
import GlobalExceptionalHandler from "./exceptions/GlobalExceptionalHandler.js";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors({
  origin: "http://localhost:5173",
  credentials: true
}));
app.use(express.json());
app.use(cookieParser());
app.use("/api", router);

// Error handler middleware (must be last)
app.use(GlobalExceptionalHandler);

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
})