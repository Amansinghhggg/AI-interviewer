import express from "express";
import multer from "multer";
import { protect } from "../auth/auth.middleware.js";
import { replaceResume, getMyResume, downloadMyResume } from "./profile.controller.js";

const router = express.Router();

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 }, // 5 MB
});

// Candidate routes
router.post("/resume", protect, upload.single("resume"), replaceResume);
router.get("/resume", protect, getMyResume);
router.get("/resume/download", protect, downloadMyResume);

export default router;
