import express from "express"
import {
  createInterview,
  getInterviews,
  getInterviewById,
} from "../controllers/interview.controller.js";
import { protect, authorize } from "../middleware/auth.middleware.js";

const router = express.Router();

router.post("/", protect, authorize("employer"), createInterview);
router.get("/", protect, getInterviews);
router.get("/:id", protect, getInterviewById);

export default router
