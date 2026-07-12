const express = require("express");
const {
  createInterview,
  getInterviews,
  getInterviewById,
} = require("../controllers/interview.controller");
const { protect, authorize } = require("../middleware/auth.middleware");

const router = express.Router();

router.post("/", protect, authorize("employer"), createInterview);
router.get("/", protect, getInterviews);
router.get("/:id", protect, getInterviewById);

module.exports = router;
