import express from "express";
import { signup, login, logout, getMe, updateProfile, updatePassword, googleAuth } from "./auth.controller.js";
import { protect } from "./auth.middleware.js";

import multer from "multer";

const router = express.Router();

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 }, // 5 MB
});

router.post("/signup", upload.single("resume"), signup);
router.post("/login", login);
router.post("/google", googleAuth);
router.post("/logout", logout);
router.get("/me", protect, getMe);
router.put("/profile", protect, updateProfile);
router.put("/password", protect, updatePassword);

export default router;
