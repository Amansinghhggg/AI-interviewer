const express = require("express");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const errorHandler = require("./middleware/errorHandler");

// Route imports
const authRoutes = require("./routes/auth.routes");
const interviewRoutes = require("./routes/interview.routes");

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
  res.status(200).json({ success: true, message: "Server is running 🚀" });
});

// Mount routes
app.use("/api/auth", authRoutes);
app.use("/api/interviews", interviewRoutes);

// Global error handler
app.use(errorHandler);

module.exports = app;
