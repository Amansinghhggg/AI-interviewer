import Interview from "../models/Interview.js";

// @desc    Create a new interview
// @route   POST /api/interviews
// @access  Employer only
const createInterview = async (req, res, next) => {
  try {
    const {
      title,
      description,
      topics,
      difficulty,
      duration,
      numberOfQuestions,
      instructions,
    } = req.body;

    const interview = await Interview.create({
      title,
      description,
      topics: topics || [],
      difficulty,
      duration,
      numberOfQuestions,
      instructions,
      createdBy: req.user._id,
    });

    res.status(201).json({
      success: true,
      interview,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get interviews
// @route   GET /api/interviews
// @access  Protected
const getInterviews = async (req, res, next) => {
  try {
    let interviews;

    if (req.user.role === "employer") {
      // Employer sees only their own interviews
      interviews = await Interview.find({ createdBy: req.user._id }).sort({
        createdAt: -1,
      });
    } else {
      // Candidate sees all active interviews
      interviews = await Interview.find({ status: "active" })
        .populate("createdBy", "name email")
        .sort({ createdAt: -1 });
    }

    res.status(200).json({
      success: true,
      count: interviews.length,
      interviews,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single interview
// @route   GET /api/interviews/:id
// @access  Protected
const getInterviewById = async (req, res, next) => {
  try {
    const interview = await Interview.findById(req.params.id).populate(
      "createdBy",
      "name email"
    );

    if (!interview) {
      return res.status(404).json({
        success: false,
        message: "Interview not found",
      });
    }

    res.status(200).json({
      success: true,
      interview,
    });
  } catch (error) {
    next(error);
  }
};

export { createInterview, getInterviews, getInterviewById };
