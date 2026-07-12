import Interview from "./interview.model.js";
import {
  createInterviewSchema,
  updateInterviewSchema,
  joinInterviewSchema,
} from "./interview.validation.js";
import crypto from "crypto";

const generateInterviewCode = () => {
  return crypto.randomBytes(4).toString("hex").toUpperCase();
};

// @desc    Create a new interview
// @route   POST /api/interviews
// @access  Employer only
const createInterview = async (req, res, next) => {
  try {
    const validated = createInterviewSchema.parse(req.body);

    const assignedCandidates = validated.candidateEmails.map((email) => ({
      email,
      status: "Pending",
    }));

    let interviewCode;
    let isUnique = false;
    while (!isUnique) {
      interviewCode = generateInterviewCode();
      const existing = await Interview.findOne({ interviewCode });
      if (!existing) isUnique = true;
    }

    const interview = await Interview.create({
      title: validated.title,
      jobRole: validated.jobRole,
      description: validated.description,
      topics: validated.topics || [],
      difficulty: validated.difficulty,
      duration: validated.duration,
      numberOfQuestions: validated.numberOfQuestions,
      instructions: validated.instructions,
      interviewCode,
      employer: req.user._id,
      assignedCandidates,
    });

    res.status(201).json({
      success: true,
      interview,
    });
  } catch (error) {
    if (error.name === "ZodError") {
      return res.status(400).json({
        success: false,
        message: error.errors[0].message,
      });
    }
    next(error);
  }
};

// @desc    Get interviews created by employer
// @route   GET /api/interviews
// @access  Employer only
const getInterviews = async (req, res, next) => {
  try {
    const interviews = await Interview.find({ employer: req.user._id }).sort({
      createdAt: -1,
    });

    res.status(200).json({
      success: true,
      count: interviews.length,
      interviews,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single interview details
// @route   GET /api/interviews/:id
// @access  Employer only
const getInterviewById = async (req, res, next) => {
  try {
    let query = { _id: req.params.id };

    if (req.user.role === "employer") {
      query.employer = req.user._id;
    } else if (req.user.role === "candidate") {
      query["assignedCandidates.email"] = req.user.email;
    }

    const interview = await Interview.findOne(query);

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

// @desc    Update interview details
// @route   PATCH /api/interviews/:id
// @access  Employer only
const updateInterview = async (req, res, next) => {
  try {
    const validated = updateInterviewSchema.parse(req.body);
    
    const interview = await Interview.findOne({
      _id: req.params.id,
      employer: req.user._id,
    });

    if (!interview) {
      return res.status(404).json({
        success: false,
        message: "Interview not found",
      });
    }

    // Merge new candidates if provided
    if (validated.candidateEmails) {
      const existingEmails = interview.assignedCandidates.map(c => c.email);
      const newCandidates = validated.candidateEmails
        .filter(email => !existingEmails.includes(email.toLowerCase()))
        .map(email => ({ email: email.toLowerCase(), status: "Pending" }));
      
      interview.assignedCandidates.push(...newCandidates);
      delete validated.candidateEmails;
    }

    // Remove candidate if provided
    if (validated.removeCandidateEmail) {
      const emailToRemove = validated.removeCandidateEmail.toLowerCase();
      interview.assignedCandidates = interview.assignedCandidates.filter(
        (c) => c.email !== emailToRemove
      );
      delete validated.removeCandidateEmail;
    }

    // Add single candidate if provided
    if (validated.addCandidateEmail) {
      const emailToAdd = validated.addCandidateEmail.toLowerCase();
      const existingEmails = interview.assignedCandidates.map(c => c.email);
      if (!existingEmails.includes(emailToAdd)) {
        interview.assignedCandidates.push({ email: emailToAdd, status: "Pending" });
      }
      delete validated.addCandidateEmail;
    }

    Object.assign(interview, validated);
    await interview.save();

    res.status(200).json({
      success: true,
      interview,
    });
  } catch (error) {
    if (error.name === "ZodError") {
      return res.status(400).json({
        success: false,
        message: error.errors[0].message,
      });
    }
    next(error);
  }
};

// @desc    Delete an interview
// @route   DELETE /api/interviews/:id
// @access  Employer only
const deleteInterview = async (req, res, next) => {
  try {
    const interview = await Interview.findOneAndDelete({
      _id: req.params.id,
      employer: req.user._id,
    });

    if (!interview) {
      return res.status(404).json({
        success: false,
        message: "Interview not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Interview deleted",
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Candidate gets assigned interviews
// @route   GET /api/interviews/assigned
// @access  Candidate only
const getAssignedInterviews = async (req, res, next) => {
  try {
    const interviews = await Interview.find({
      "assignedCandidates.email": req.user.email,
      status: "active",
    })
      .populate("employer", "name")
      .select("-assignedCandidates")
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: interviews.length,
      interviews,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Candidate joins an interview via code
// @route   POST /api/interviews/join
// @access  Candidate only
const joinInterview = async (req, res, next) => {
  try {
    const validated = joinInterviewSchema.parse(req.body);

    const interview = await Interview.findOne({
      interviewCode: validated.interviewCode.toUpperCase(),
      status: "active",
    }).populate("employer", "name");

    if (!interview) {
      return res.status(404).json({
        success: false,
        message: "Interview not found or inactive",
      });
    }

    // Check if candidate is assigned
    const isAssigned = interview.assignedCandidates.some(
      (c) => c.email === req.user.email
    );

    if (!isAssigned) {
      return res.status(403).json({
        success: false,
        message: "You are not authorized to join this interview.",
      });
    }

    // Return the interview details (omitting sensitive info like other candidates)
    const interviewData = interview.toObject();
    delete interviewData.assignedCandidates;

    res.status(200).json({
      success: true,
      interview: interviewData,
    });
  } catch (error) {
    if (error.name === "ZodError") {
      return res.status(400).json({
        success: false,
        message: error.errors[0].message,
      });
    }
    next(error);
  }
};

export {
  createInterview,
  getInterviews,
  getInterviewById,
  updateInterview,
  deleteInterview,
  getAssignedInterviews,
  joinInterview,
};
