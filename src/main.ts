import dotenv from "dotenv";
dotenv.config();

import app from "./app";
import { PrismaClient } from "./generated/prisma/client";

const prisma = new PrismaClient({
  // pass the datasource URL to the generated client
  datasourceUrl: process.env.DATABASE_URL!,
} as any);

const port = Number(process.env.PORT ?? 3000);

async function startServer() {
  try {
    await prisma.$connect();
    console.log("Connected to DB");

    const server = app.listen(port, () => {
      console.log(`Server running on port ${port}`);
    });

    const shutdown = async (signal?: string) => {
      console.log(`Received ${signal ?? "shutdown"}, closing server...`);
      server.close(async () => {
        await prisma.$disconnect();
        console.log("Prisma disconnected. Exiting.");
        process.exit(0);
      });
      setTimeout(() => {
        console.error("Forcing shutdown.");
        process.exit(1);
      }, 10_000).unref();
    };

    process.on("SIGINT", () => shutdown("SIGINT"));
    process.on("SIGTERM", () => shutdown("SIGTERM"));
    process.on("uncaughtException", async (err) => {
      console.error("Uncaught exception:", err);
      await shutdown("uncaughtException");
    });
    process.on("unhandledRejection", async (reason) => {
      console.error("Unhandled rejection:", reason);
      await shutdown("unhandledRejection");
    });
  } catch (error) {
    console.error("Error starting server:", error);
    try {
      await prisma.$disconnect();
    } catch {}
    process.exit(1);
  }
}

startServer();