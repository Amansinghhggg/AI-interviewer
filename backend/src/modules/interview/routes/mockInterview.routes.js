import express from "express";
import { protect, authorize } from "../../auth/auth.middleware.js";
import {
  createMockInterview,
  getCandidateHistory,
  getResumeableMocks,
  getMockEvaluation,
  deleteMockInterview,
} from "../controllers/mockInterview.controller.js";

const router = express.Router();

// All mock interview endpoints require candidate authentication
router.use(protect, authorize("candidate"));

router.post("/", createMockInterview);
router.get("/history", getCandidateHistory);
router.get("/resumeable", getResumeableMocks);
router.get("/evaluations/:resultId", getMockEvaluation);
router.delete("/:id", deleteMockInterview);

export default router;
