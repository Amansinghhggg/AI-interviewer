/**
 * InterviewConfig
 *
 * A clean, provider-friendly configuration object that decouples providers
 * from Mongoose documents. Providers receive this instead of raw DB documents.
 * Normalizes configuration from both Employer and Candidate Mock Interviews.
 */
export class InterviewConfig {
  constructor({
    companyName,
    jobRole,
    description,
    instructions,
    topics = [],
    difficulty = "Medium",
    experienceLevel = "1-2 Years",
    duration = 30,
    language = "English",
    interviewType = "gemini",
    mode = "EMPLOYER",
  }) {
    this.companyName = companyName;
    this.jobRole = jobRole;
    this.description = description;
    this.instructions = instructions;
    this.topics = topics;
    this.difficulty = difficulty;
    this.experienceLevel = experienceLevel;
    this.duration = duration;
    this.language = language;
    this.interviewType = interviewType;
    this.mode = mode;
  }

  /**
   * Create an InterviewConfig from a Mongoose interview or mock document.
   * Single normalization point so downstream services receive identical parameters.
   *
   * @param {Object} interviewDoc - A Mongoose interview document or plain object.
   * @returns {InterviewConfig}
   */
  static fromInterview(interviewDoc) {
    if (!interviewDoc) return new InterviewConfig({ jobRole: "Software Engineer" });

    // Handle nested configuration sub-document if present (e.g. MockInterview)
    const config = interviewDoc.configuration || interviewDoc;

    const jobRole = config.jobRole || interviewDoc.jobRole || "Software Engineer";
    const topics = config.topics || interviewDoc.topics || [];
    const expLevel = config.experienceLevel || interviewDoc.experienceLevel || "1-2 Years";
    const duration = config.duration || interviewDoc.duration || 30;
    const instructions = config.instructions || interviewDoc.instructions || "";
    const mode = interviewDoc.mode || (interviewDoc.candidate ? "MOCK" : "EMPLOYER");

    let defaultDifficulty = "Medium";
    if (expLevel === "Fresher") defaultDifficulty = "Easy";
    else if (expLevel === "1-2 Years") defaultDifficulty = "Medium";
    else if (expLevel === "3-5 Years") defaultDifficulty = "Medium";
    else if (expLevel === "5+ Years") defaultDifficulty = "Hard";

    return new InterviewConfig({
      companyName: interviewDoc.title || `Interview - ${jobRole}`,
      jobRole,
      description: interviewDoc.description || "",
      instructions,
      topics,
      difficulty: config.difficulty || interviewDoc.difficulty || defaultDifficulty,
      experienceLevel: expLevel,
      duration,
      language: interviewDoc.language || "English",
      interviewType: interviewDoc.interviewType || "gemini",
      mode,
    });
  }

  static create(params) {
    return new InterviewConfig(params);
  }
}
