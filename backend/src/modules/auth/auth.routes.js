import express from "express";
import { signup, login, logout, getMe, updateProfile, updatePassword } from "./auth.controller.js";
import { protect } from "./auth.middleware.js";

const router = express.Router();

router.post("/signup", signup);
router.post("/login", login);
router.post("/logout", logout);
router.get("/me", protect, getMe);
router.put("/profile", protect, updateProfile);
router.put("/password", protect, updatePassword);

export default router
