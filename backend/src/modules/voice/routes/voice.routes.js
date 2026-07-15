import { Router } from "express";
import { transcribeAudio, speakAudio, health } from "../controllers/voice.controller.js";
import { uploadMiddleware } from "../middleware/upload.middleware.js";
import { validateAudio } from "../validators/audio.validator.js";

const router = Router();

// Health check endpoint
router.get("/health", health);

// Transcribe audio endpoint
router.post(
  "/transcribe",
  uploadMiddleware.single("audio"),
  validateAudio,
  transcribeAudio
);

// TTS Endpoint
router.post("/speak", speakAudio);

export default router;
