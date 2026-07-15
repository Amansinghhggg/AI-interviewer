import { Router } from "express";
import { transcribeAudio, health } from "../controllers/voice.controller.js";
import { uploadMiddleware } from "../middleware/upload.middleware.js";
import { validateAudio } from "../validators/audio.validator.js";

const router = Router();

// Health check endpoint
router.get("/health", health);

// Transcribe audio endpoint
router.post(
  "/transcribe",
  uploadMiddleware.single("audio"), // Handles memory storage and basic limits/mimes
  validateAudio,                    // Strict secondary validation
  transcribeAudio                   // Controller logic
);

export default router;
