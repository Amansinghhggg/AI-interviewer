import { StaticQuestionProvider } from "./StaticQuestionProvider.js";
import { GeminiQuestionProvider } from "./GeminiQuestionProvider.js";
import { PresetQuestionProvider } from "./PresetQuestionProvider.js";

/**
 * Provider Registry
 * Maps configuration string to the QuestionProvider class.
 * Ensures the InterviewEngine never needs to branch logic for new providers.
 */
const providerRegistry = {
  static: StaticQuestionProvider,
  gemini: GeminiQuestionProvider,
  groq: GeminiQuestionProvider
};

/**
 * QuestionProvider Factory
 *
 * Creates the appropriate question provider based on the given type and config.
 *
 * @param {string} [type='gemini'] - The question provider type.
 * @param {Object} [config={}] - InterviewConfig options
 * @returns {import('./BaseQuestionProvider.js').BaseQuestionProvider}
 */
export const createQuestionProvider = (type = process.env.QUESTION_PROVIDER || "gemini", config = {}) => {
  // Check if employer has chosen EMPLOYER_PRESET or HYBRID mode
  if (config.questionMode === "EMPLOYER_PRESET" || config.questionMode === "HYBRID") {
    return new PresetQuestionProvider();
  }

  const ProviderClass = providerRegistry[type.toLowerCase()] || GeminiQuestionProvider;
  return new ProviderClass();
};

/**
 * Legacy compatibility wrapper.
 * Preserves the original function signature so that any code still importing
 * this function continues to work without changes during the transition.
 *
 * @param {Object} interview - A Mongoose interview document.
 * @returns {Promise<Array<Object>>} An array of question objects.
 */
export const getQuestionsForInterview = async (interview) => {
  // Determine if it should use 'gemini' or default to 'static'
  const type = process.env.QUESTION_PROVIDER || interview.interviewType || "gemini";
  const provider = createQuestionProvider(type);
  return provider.generateFirstQuestion(interview);
};
