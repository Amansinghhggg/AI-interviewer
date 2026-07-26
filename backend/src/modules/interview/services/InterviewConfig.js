/**
 * InterviewConfig
 *
 * A clean, provider-friendly configuration object that decouples providers
 * from Mongoose documents. Providers receive this instead of raw DB documents.
 *
 * This ensures providers never depend on MongoDB or any persistence layer.
 */
export class InterviewConfig {
  /**
   * @param {Object} params
   * @param {string} params.jobRole - The job role being interviewed for.
   * @param {string[]} [params.topics=[]] - Topics to cover in the interview.
   * @param {string} [params.difficulty='Medium'] - Question difficulty level.
   * @param {string} [params.experienceLevel='Fresher'] - Candidate experience level.
   * @param {number} [params.duration=30] - Interview duration in minutes.
   * @param {string} [params.language='English'] - Interview language.
   * @param {string} [params.interviewType='static'] - Type of interview / provider to use.
   */
  constructor({
    companyName,
    jobRole,
    description,
    instructions,
    topics = [],
    difficulty = "Medium",
    experienceLevel = "Fresher",
    duration = 30,
    language = "English",
    interviewType = "gemini",
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
  }

  /**
   * Create an InterviewConfig from a Mongoose interview document.
   * This is the single place where we translate DB shape → provider shape.
   *
   * @param {Object} interviewDoc - A Mongoose interview document or plain object.
   * @returns {InterviewConfig}
   */
  static fromInterview(interviewDoc) {
    return new InterviewConfig({
      companyName: interviewDoc.title,
      jobRole: interviewDoc.jobRole,
      description: interviewDoc.description,
      instructions: interviewDoc.instructions,
      topics: interviewDoc.topics || [],
      difficulty: interviewDoc.difficulty || "Medium",
      experienceLevel: interviewDoc.experienceLevel || "Fresher",
      duration: interviewDoc.duration,
      language: interviewDoc.language || "English",
      interviewType: interviewDoc.interviewType || "gemini",
    });
  }
}
