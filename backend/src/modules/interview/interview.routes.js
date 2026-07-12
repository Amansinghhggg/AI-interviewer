import express from "express";
import {
  createInterview,
  getInterviews,
  getInterviewById,
  updateInterview,
  deleteInterview,
  getAssignedInterviews,
  joinInterview,
} from "./interview.controller.js";
import { protect, authorize } from "../auth/auth.middleware.js";

const router = express.Router();

router.use(protect);

// Employer Routes
router
  .route("/")
  .post(authorize("employer"), createInterview)
  .get(authorize("employer"), getInterviews);

// Candidate Routes
router.get("/candidate/assigned", authorize("candidate"), getAssignedInterviews);
router.post("/join", authorize("candidate"), joinInterview);

router
  .route("/:id")
  .get(authorize("employer", "candidate"), getInterviewById)
  .patch(authorize("employer"), updateInterview)
  .delete(authorize("employer"), deleteInterview);

export default router;
