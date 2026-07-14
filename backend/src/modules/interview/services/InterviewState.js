/**
 * InterviewState
 *
 * Tracks the ongoing progress of an interview.
 * Does NOT contain conversation history (questions/answers).
 * This object is used to provide contextual progress to AI prompt builders.
 */
export class InterviewState {
  /**
   * @param {Object} params
   * @param {number} [params.currentQuestion=1] - The current question number being asked.
   * @param {string[]} [params.coveredTopics=[]] - Topics that have already been covered.
   * @param {string[]} [params.remainingTopics=[]] - Topics that still need to be covered.
   * @param {number} [params.remainingTime=0] - Remaining interview time in minutes.
   * @param {Date} [params.interviewStartedAt=new Date()] - When the interview began.
   * @param {number} [params.maxQuestions=10] - The total number of questions for the interview.
   * @param {Object} [params.topicDistribution={}] - Mapping of topics to the number of times they were asked.
   * @param {string[]} [params.coveredConcepts=[]] - Array of specific concepts already covered.
   * @param {string[]} [params.difficultyHistory=[]] - Array of difficulty levels of previously asked questions.
   */
  constructor({
    currentQuestion = 1,
    coveredTopics = [],
    remainingTopics = [],
    remainingTime = 0,
    interviewStartedAt = new Date(),
    maxQuestions = 10,
    topicDistribution = {},
    coveredConcepts = [],
    difficultyHistory = []
  } = {}) {
    this.currentQuestion = currentQuestion;
    this.coveredTopics = coveredTopics;
    this.remainingTopics = remainingTopics;
    this.remainingTime = remainingTime;
    this.interviewStartedAt = interviewStartedAt;
    this.maxQuestions = maxQuestions;
    this.topicDistribution = topicDistribution;
    this.coveredConcepts = coveredConcepts;
    this.difficultyHistory = difficultyHistory;
  }
}
