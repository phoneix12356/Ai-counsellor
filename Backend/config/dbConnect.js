import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import pg from "pg";
import dotenv from "dotenv";
import logger from "../utils/logger.js";



dotenv.config();

const pool = new pg.Pool({
  connectionString: process.env.DATABASE_URL,
});

const adapter = new PrismaPg(pool);

const prisma = new PrismaClient({
  adapter,
});

async function testConnection() {
  try {
    await prisma.$connect();
    logger.info("🟢 Database Connected Successfully");
  } catch (error) {
    logger.error("🔴 Database Connection Failed:", error);
    process.exit(1);
  }
}

testConnection();

export default prisma;
