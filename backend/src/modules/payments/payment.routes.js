import express from "express";
import { protect } from "../auth/auth.middleware.js";
import {
  createOrder,
  verifyPayment,
  getCreditHistory,
  handleWebhook,
} from "./payment.controller.js";

const router = express.Router();

// Protected candidate payment routes
router.post("/create-order", protect, createOrder);
router.post("/verify", protect, verifyPayment);
router.get("/history", protect, getCreditHistory);

// Public Razorpay Webhook endpoint
router.post("/webhook", handleWebhook);

export default router;
