import mongoose from "mongoose";
import dotenv from "dotenv";
dotenv.config();

import Interview from "./src/modules/interview/models/interview.model.js";

async function fixDatabase() {
  await mongoose.connect(process.env.MONGODB_URI);
  console.log("Connected to MongoDB.");

  // Fetch the latest interview
  const interview = await Interview.findOne({ _id: "6a55103046cbf592c581408a" });
  
  if (interview) {
    let updated = false;
    interview.assignedCandidates.forEach(c => {
      c.status = "In Progress";
      updated = true;
    });

    if (updated) {
      await interview.save();
      console.log("Successfully fixed candidate status to 'In Progress'");
    }
  }

  process.exit(0);
}

fixDatabase();
