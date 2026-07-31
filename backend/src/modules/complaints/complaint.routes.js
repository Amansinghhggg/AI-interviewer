import express from "express";
import { protect } from "../auth/auth.middleware.js";
import { createComplaint, getMyComplaints } from "./complaint.controller.js";

const router = express.Router();

// Require auth for all complaint routes
router.use(protect);

router.post("/", createComplaint);
router.get("/my-tickets", getMyComplaints);

export default router;
