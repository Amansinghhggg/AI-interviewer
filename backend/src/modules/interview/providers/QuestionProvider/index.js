import { StaticQuestionProvider } from "./StaticQuestionProvider.js";
import { GeminiQuestionProvider } from "./GeminiQuestionProvider.js";

/**
 * Provider Registry
 * Maps configuration string to the QuestionProvider class.
 * Ensures the InterviewEngine never needs to branch logic for new providers.
 */
const providerRegistry = {
  static: StaticQuestionProvider,
  gemini: GeminiQuestionProvider
};

/**
 * QuestionProvider Factory
 *
 * Creates the appropriate question provider based on the given type.
 * This is the single entry point for obtaining a question provider instance.
 *
 * @param {string} [type='static'] - The question provider type.
 * @returns {import('./BaseQuestionProvider.js').BaseQuestionProvider}
 * @throws {Error} If the requested provider type is not supported.
 */
export const createQuestionProvider = (type = "static") => {
  // We lowercase the type just to be safe with future dynamic strings
  const ProviderClass = providerRegistry[type.toLowerCase()];
  
  if (!ProviderClass) {
    throw new Error(`Not Implemented: Question provider "${type}" is not available.`);
  }

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
  const type = process.env.QUESTION_PROVIDER || interview.interviewType || "static";
  const provider = createQuestionProvider(type);
  return provider.getQuestions(interview);
};
