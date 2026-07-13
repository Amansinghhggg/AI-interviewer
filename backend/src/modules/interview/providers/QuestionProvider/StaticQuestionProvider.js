import { BaseQuestionProvider } from "./BaseQuestionProvider.js";

/**
 * StaticQuestionProvider
 *
 * Returns a fixed set of hardcoded questions. Used during development
 * and as the default provider when no AI integration is configured.
 *
 * Extends BaseQuestionProvider to conform to the provider contract.
 */
export class StaticQuestionProvider extends BaseQuestionProvider {
  /**
   * Returns a static list of interview questions.
   * The config parameter is accepted to satisfy the interface contract
   * but is not used by this provider since questions are hardcoded.
   *
   * @param {import('../../services/InterviewConfig.js').InterviewConfig} config
   * @returns {Promise<Array<Object>>} An array of static question objects.
   */
  async getQuestions(config) {
    return [
      {
        id: 1,
        version: 1,
        order: 1,
        type: "text",
        topic: "React",
        difficulty: "Easy",
        expectedDuration: 120,
        question: "Explain React Virtual DOM and how it improves performance compared to manipulating the real DOM directly."
      },
      {
        id: 2,
        version: 1,
        order: 2,
        type: "text",
        topic: "React",
        difficulty: "Medium",
        expectedDuration: 180,
        question: "What is the difference between useEffect and useMemo? When would you use each?"
      },
      {
        id: 3,
        version: 1,
        order: 3,
        type: "text",
        topic: "JavaScript",
        difficulty: "Medium",
        expectedDuration: 180,
        question: "Explain Closures in JavaScript with a practical example."
      },
      {
        id: 4,
        version: 1,
        order: 4,
        type: "text",
        topic: "System Design",
        difficulty: "Hard",
        expectedDuration: 300,
        question: "How would you design a rate limiter? What algorithms could you use?"
      },
      {
        id: 5,
        version: 1,
        order: 5,
        type: "text",
        topic: "Web Performance",
        difficulty: "Medium",
        expectedDuration: 180,
        question: "What are some common techniques for optimizing the loading time of a web application?"
      }
    ];
  }
}
