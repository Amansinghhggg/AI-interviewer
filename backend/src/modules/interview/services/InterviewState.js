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
   */
  constructor({
    currentQuestion = 1,
    coveredTopics = [],
    remainingTopics = [],
    remainingTime = 0,
    interviewStartedAt = new Date(),
  } = {}) {
    this.currentQuestion = currentQuestion;
    this.coveredTopics = coveredTopics;
    this.remainingTopics = remainingTopics;
    this.remainingTime = remainingTime;
    this.interviewStartedAt = interviewStartedAt;
  }
}
