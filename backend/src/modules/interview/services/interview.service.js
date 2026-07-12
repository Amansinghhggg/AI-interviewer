import crypto from "crypto";
import Interview from "../models/interview.model.js";
import { getQuestionsForInterview } from "../providers/QuestionProvider/index.js";

const generateInterviewCode = () => {
  return crypto.randomBytes(4).toString("hex").toUpperCase();
};

class InterviewService {
  async createInterview(employerId, validatedData) {
    const assignedCandidates = validatedData.candidateEmails.map((email) => ({
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
      numberOfQuestions: validatedData.numberOfQuestions,
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

    return await Interview.findOne(query);
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
      const existingEmails = interview.assignedCandidates.map(c => c.email);
      const newCandidates = validatedData.candidateEmails
        .filter(email => !existingEmails.includes(email.toLowerCase()))
        .map(email => ({ email: email.toLowerCase(), status: "Pending" }));
      
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
      const existingEmails = interview.assignedCandidates.map(c => c.email);
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
    return await Interview.find({
      "assignedCandidates.email": candidateEmail,
      status: "active",
    })
      .populate("employer", "name")
      .select("-assignedCandidates")
      .sort({ createdAt: -1 });
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
      (c) => c.email === candidateEmail
    );

    if (!isAssigned) {
      throw new Error("unauthorized");
    }

    const interviewData = interview.toObject();
    delete interviewData.assignedCandidates;

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

    // Call the provider abstraction layer
    const questions = await getQuestionsForInterview(interview);
    return questions;
  }
}

export default new InterviewService();
