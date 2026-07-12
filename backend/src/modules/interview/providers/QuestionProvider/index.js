import { getQuestions as getStaticQuestions } from "./StaticQuestionProvider.js";

// A factory or abstraction layer for fetching questions.
// In the future, based on interview type or settings, this could route to AI providers.
export const getQuestionsForInterview = async (interview) => {
  // For now, always return static questions
  return getStaticQuestions();
};
