import express from "express";
import {
  createInterview,
  getInterviews,
  getInterviewById,
  updateInterview,
  deleteInterview,
  getAssignedInterviews,
  joinInterview,
  startInterview,
  submitInterview,
  getInterviewQuestions,
} from "../controllers/interview.controller.js";
import { protect, authorize } from "../../auth/auth.middleware.js";

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
router.post("/:id/start", authorize("candidate"), startInterview);
router.post("/:id/submit", authorize("candidate"), submitInterview);
router.get("/:id/questions", authorize("candidate"), getInterviewQuestions);

router
  .route("/:id")
  .get(authorize("employer", "candidate"), getInterviewById)
  .patch(authorize("employer"), updateInterview)
  .delete(authorize("employer"), deleteInterview);

export default router;
