import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import dotenv from "dotenv";

import authRoutes from "./modules/user/user.routes";
import itemRoutes from "./modules/user/items/item.routes"; 
import uploadRoutes from "./modules/upload/upload.routes"; // ← أضيفي هذا السطر

dotenv.config();

const app = express();

app.use(cors());
app.use(helmet());
app.use(morgan("dev"));
app.use(express.json());

// Health check
app.get("/health", (req, res) => {
  res.status(200).json({ status: "ok" });
});

// auth routes
app.use("/auth", authRoutes);

// items routes
app.use("/items", itemRoutes); 

// upload routes
app.use("/upload", uploadRoutes); 

export default app;
