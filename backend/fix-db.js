import mongoose from "mongoose";
import dotenv from "dotenv";
dotenv.config();

import InterviewSession from "./src/modules/interview/models/InterviewSession.js";
import Interview from "./src/modules/interview/models/interview.model.js";

async function fixDatabase() {
  await mongoose.connect(process.env.MONGODB_URI);
  console.log("Connected to MongoDB.");

  // Find the latest completed session
  const session = await InterviewSession.findOne({ status: "COMPLETED" }).sort({ updatedAt: -1 });
  if (!session) {
    console.log("No completed sessions found.");
    process.exit(0);
  }

  console.log(`Found session: ${session._id}`);
  
  // Reset AI session to ACTIVE
  session.status = "ACTIVE";
  await session.save();
  console.log("Reset InterviewSession status to ACTIVE.");

  // Find the legacy interview and reset candidate to In Progress
  const interview = await Interview.findById(session.interviewId);
  if (interview) {
    const candidate = interview.assignedCandidates.find(c => c.email === "testcandidate@example.com" || c.email === "aman@gmail.com" || c._id.toString() === session.candidateId.toString());
    
    if (candidate) {
      candidate.status = "In Progress";
      await interview.save();
      console.log(`Reset legacy Interview candidate status to In Progress for ${candidate.email}`);
    } else {
      console.log("Candidate not found in legacy Interview.");
      // Just forcefully set all pending to In progress for testing
      interview.assignedCandidates.forEach(c => c.status = "In Progress");
      await interview.save();
    }
  }

  process.exit(0);
}

fixDatabase();
