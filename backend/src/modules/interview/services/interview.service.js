import crypto from "crypto";
import Interview from "../models/interview.model.js";
import { createInterviewEngine } from "./interviewEngine.js";
import { InterviewConfig } from "./InterviewConfig.js";

const generateInterviewCode = () => {
  return crypto.randomBytes(4).toString("hex").toUpperCase();
};

class InterviewService {
  async createInterview(employerId, validatedData) {
    const uniqueEmails = [...new Set((validatedData.candidateEmails || []).map(e => e.toLowerCase()))];
    const assignedCandidates = uniqueEmails.map((email) => ({
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

    return await Interview.create({
      title: validatedData.title,
      jobRole: validatedData.jobRole,
      description: validatedData.description,
      topics: validatedData.topics || [],
      difficulty: validatedData.difficulty,
      duration: validatedData.duration,
      instructions: validatedData.instructions,
      interviewCode,
      employer: employerId,
      assignedCandidates,
    });
  }

  async getEmployerInterviews(employerId) {
    return await Interview.find({ employer: employerId }).sort({
      createdAt: -1,
    });
  }

  async getInterviewById(interviewId, userRole, userEmail, userId) {
    let query = { _id: interviewId };

    if (userRole === "employer") {
      query.employer = userId;
    } else if (userRole === "candidate") {
      query["assignedCandidates.email"] = userEmail;
    }

    const interview = await Interview.findOne(query);
    if (interview && !interview.interviewType) {
      interview.interviewType = process.env.QUESTION_PROVIDER || "gemini";
    }
    return interview;
  }

  async updateInterview(interviewId, employerId, validatedData) {
    const interview = await Interview.findOne({
      _id: interviewId,
      employer: employerId,
    });

    if (!interview) {
      return null;
    }

    // Merge new candidates if provided
    if (validatedData.candidateEmails) {
      const existingEmails = interview.assignedCandidates.map(c => c.email.toLowerCase());
      const uniqueNewEmails = [...new Set(validatedData.candidateEmails.map(e => e.toLowerCase()))];
      
      const newCandidates = uniqueNewEmails
        .filter(email => !existingEmails.includes(email))
        .map(email => ({ email, status: "Pending" }));
      
      interview.assignedCandidates.push(...newCandidates);
      delete validatedData.candidateEmails;
    }

    // Remove candidate if provided
    if (validatedData.removeCandidateEmail) {
      const emailToRemove = validatedData.removeCandidateEmail.toLowerCase();
      interview.assignedCandidates = interview.assignedCandidates.filter(
        (c) => c.email !== emailToRemove
      );
      delete validatedData.removeCandidateEmail;
    }

    // Add single candidate if provided
    if (validatedData.addCandidateEmail) {
      const emailToAdd = validatedData.addCandidateEmail.toLowerCase();
      const existingEmails = interview.assignedCandidates.map(c => c.email.toLowerCase());
      if (!existingEmails.includes(emailToAdd)) {
        interview.assignedCandidates.push({ email: emailToAdd, status: "Pending" });
      }
      delete validatedData.addCandidateEmail;
    }

    Object.assign(interview, validatedData);
    await interview.save();

    return interview;
  }

  async deleteInterview(interviewId, employerId) {
    return await Interview.findOneAndDelete({
      _id: interviewId,
      employer: employerId,
    });
  }

  async getAssignedInterviews(candidateEmail) {
    const interviews = await Interview.find({
      "assignedCandidates.email": candidateEmail,
      status: { $in: ["active", "completed"] },
    })
      .populate("employer", "name")
      .sort({ createdAt: -1 })
      .lean();
      
    return interviews.map(interview => {
      const candidateInfo = interview.assignedCandidates?.find(c => c.email === candidateEmail);
      delete interview.assignedCandidates; // Protect other candidates' data
      return {
        ...interview,
        candidateStatus: candidateInfo?.status || "Pending"
      };
    });
  }

  async joinInterview(interviewCode, candidateEmail) {
    const interview = await Interview.findOne({
      interviewCode: interviewCode.toUpperCase(),
      status: "active",
    }).populate("employer", "name");

    if (!interview) {
      throw new Error("Interview not found or inactive");
    }

    const isAssigned = interview.assignedCandidates.some(
      (c) => c.email.toLowerCase() === candidateEmail.toLowerCase()
    );

    if (!isAssigned) {
      // Auto-enroll candidate if they have the code
      interview.assignedCandidates.push({
        email: candidateEmail,
        status: "Pending",
      });
      await interview.save();
    }

    const interviewData = interview.toObject();
    delete interviewData.assignedCandidates;

    if (!interviewData.interviewType) {
      interviewData.interviewType = process.env.QUESTION_PROVIDER || "gemini";
    }

    return interviewData;
  }

  async startInterview(interviewId, candidateEmail) {
    const interview = await Interview.findOne({
      _id: interviewId,
      "assignedCandidates.email": candidateEmail,
    });

    if (!interview) {
      throw new Error("not_found");
    }

    const candidateIndex = interview.assignedCandidates.findIndex(
      (c) => c.email === candidateEmail
    );

    if (interview.assignedCandidates[candidateIndex].status === "Completed") {
      throw new Error("already_completed");
    }

    if (interview.assignedCandidates[candidateIndex].status === "Pending") {
      interview.assignedCandidates[candidateIndex].status = "In Progress";
      interview.assignedCandidates[candidateIndex].joinedAt = new Date();
      await interview.save();
    }

    return true;
  }

  async submitInterview(interviewId, candidateEmail) {
    const interview = await Interview.findOne({
      _id: interviewId,
      "assignedCandidates.email": candidateEmail,
    });

    if (!interview) {
      throw new Error("not_found");
    }

    const candidateIndex = interview.assignedCandidates.findIndex(
      (c) => c.email === candidateEmail
    );

    if (interview.assignedCandidates[candidateIndex].status === "Completed") {
      throw new Error("already_completed");
    }

    if (interview.assignedCandidates[candidateIndex].status !== "In Progress") {
      throw new Error("not_started");
    }

    interview.assignedCandidates[candidateIndex].status = "Completed";
    interview.assignedCandidates[candidateIndex].submittedAt = new Date();
    await interview.save();

    return true;
  }

  async getInterviewQuestions(interviewId, candidateEmail) {
    const interview = await Interview.findOne({
      _id: interviewId,
      "assignedCandidates.email": candidateEmail,
    });

    if (!interview) {
      throw new Error("not_found");
    }

    const candidateIndex = interview.assignedCandidates.findIndex(
      (c) => c.email === candidateEmail
    );

    if (interview.assignedCandidates[candidateIndex].status !== "In Progress") {
      throw new Error("not_started");
    }

    // Route through the Interview Engine orchestration layer
    const config = InterviewConfig.fromInterview(interview);
    const engine = createInterviewEngine(config.interviewType);
    const questions = await engine.getQuestions(config);
    return questions;
  }
}

export default new InterviewService();
