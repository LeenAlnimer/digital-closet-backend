import app from "./app";
import * as Prisma from '@prisma/client';
import dotenv from "dotenv";
import { PrismaClient } from "@prisma/client/extension";


dotenv.config();

const prisma = new PrismaClient();
const port = process.env.PORT || 3000;

async function startServer() {
  try {
    await prisma.$connect();
    console.log("Connected to DB");

    app.listen(port, () => {
      console.log(`Server running on port ${port}`);
    });
  } catch (error) {
    console.error("Error starting server:", error);
    process.exit(1);
  }
}

startServer();
