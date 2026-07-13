import { StaticQuestionProvider } from "./StaticQuestionProvider.js";

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
  switch (type) {
    case "static":
      return new StaticQuestionProvider();

    // Future providers will be added here:
    // case "gemini":
    //   return new GeminiQuestionProvider();
    // case "openai":
    //   return new OpenAIQuestionProvider();

    default:
      throw new Error(
        `Not Implemented: Question provider "${type}" is not available.`
      );
  }
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
  const provider = createQuestionProvider("static");
  return provider.getQuestions(interview);
};
