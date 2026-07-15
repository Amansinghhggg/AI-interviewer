import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";

import errorHandler from "./middleware/errorHandler.js";

// Route imports
import authRoutes from "./modules/auth/auth.routes.js";
import interviewRoutes from "./modules/interview/routes/interview.routes.js";
import voiceRoutes from "./modules/voice/routes/voice.routes.js";

const app = express();

// Body parser
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Cookie parser
app.use(cookieParser());

// CORS
app.use(
  cors({
    origin: process.env.CORS_ORIGIN,
    credentials: true,
  })
);

// Health check
app.get("/api/health", (req, res) => {
  res.status(200).json({
    success: true,
    message: "Server is running 🚀",
  });
});

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/interviews", interviewRoutes);
app.use("/api/voice", voiceRoutes);

// Global Error Handler
app.use(errorHandler);

export default app;
