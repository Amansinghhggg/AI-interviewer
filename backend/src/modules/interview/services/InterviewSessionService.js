import InterviewSession from "../models/InterviewSession.js";
import { ConversationHistory } from "./ConversationHistory.js";
import { InterviewState } from "./InterviewState.js";

/**
 * InterviewSessionService
 * 
 * Responsible exclusively for the database lifecycle of an InterviewSession.
 * This separates persistence from the AI orchestration in the InterviewEngine.
 */
class InterviewSessionService {
  /**
   * Retrieves an existing session or creates a new one if it doesn't exist.
   * 
   * @param {string} interviewId 
   * @param {string} candidateId 
   * @returns {Promise<Object>} The Mongoose document
   */
  async getOrCreateSession(interviewId, candidateId) {
    let session = await InterviewSession.findOne({ interviewId, candidateId });
    
    if (!session) {
      session = new InterviewSession({
        interviewId,
        candidateId,
        status: "WAITING",
        startedAt: null,
      });
      await session.save();
    }
    
    return session;
  }

  /**
   * Marks a session as ACTIVE, setting the timer and pushing the first question.
   * 
   * @param {string} sessionId 
   * @param {Object} firstQuestion 
   * @param {number} durationMinutes 
   */
  async startSession(sessionId, firstQuestion, durationMinutes) {
    const startedAt = new Date();
    const expiresAt = new Date(startedAt.getTime() + durationMinutes * 60000);
    
    // Format the question to match the schema
    const newQuestion = {
      ...firstQuestion,
      askedAt: new Date(),
      answer: null,
      answeredAt: null
    };

    return await InterviewSession.findByIdAndUpdate(
      sessionId,
      {
        status: "ACTIVE",
        startedAt,
        expiresAt,
        currentQuestionIndex: 0,
        $push: { questions: newQuestion }
      },
      { new: true }
    );
  }

  /**
   * Retrieves the current session.
   * Checks if it's expired and updates the status if necessary.
   * 
   * @param {string} interviewId 
   * @param {string} candidateId 
   */
  async getActiveSession(interviewId, candidateId) {
    const session = await InterviewSession.findOne({ interviewId, candidateId });
    
    if (session && session.status === "ACTIVE" && session.expiresAt < new Date()) {
      session.status = "EXPIRED";
      await session.save();
    }
    
    return session;
  }

  /**
   * Reconstructs the ConversationHistory object dynamically from the questions array.
   * 
   * @param {Object} session 
   * @returns {ConversationHistory}
   */
  buildConversationHistory(session) {
    const history = new ConversationHistory();
    for (const q of session.questions) {
      history.addAIQuestion(q.question);
      if (q.answer) {
        history.addCandidateAnswer(q.answer);
      }
    }
    return history;
  }

  /**
   * Reconstructs the InterviewState dynamically.
   * 
   * @param {Object} session 
   * @returns {InterviewState}
   */
  buildInterviewState(session) {
    return new InterviewState(session.interviewState);
  }

  /**
   * Saves a candidate's answer for the current question and pushes the newly generated next question.
   * 
   * @param {string} sessionId 
   * @param {string} answerText 
   * @param {Object} nextQuestion 
   */
  async saveAnswerAndNextQuestion(sessionId, answerText, nextQuestion) {
    const session = await InterviewSession.findById(sessionId);
    if (!session) throw new Error("Session not found");
    if (session.status !== "ACTIVE") throw new Error("Session is not active");

    const currentIndex = session.currentQuestionIndex;
    
    // 1. Save the answer on the current question
    if (session.questions[currentIndex]) {
      session.questions[currentIndex].answer = answerText;
      session.questions[currentIndex].answeredAt = new Date();
    }
    
    // 2. Append the next question
    if (nextQuestion) {
      const newQuestion = {
        ...nextQuestion,
        askedAt: new Date(),
        answer: null,
        answeredAt: null
      };
      session.questions.push(newQuestion);
      session.currentQuestionIndex = currentIndex + 1;
    }
    
    // Update state tracking
    session.interviewState.questionNumber = session.currentQuestionIndex + 1;
    if (nextQuestion && !session.interviewState.coveredTopics.includes(nextQuestion.topic)) {
      session.interviewState.coveredTopics.push(nextQuestion.topic);
    }
    
    return await session.save();
  }

  /**
   * Marks the session as completed.
   * 
   * @param {string} sessionId 
   */
  async completeSession(sessionId) {
    return await InterviewSession.findByIdAndUpdate(
      sessionId,
      { status: "COMPLETED" },
      { new: true }
    );
  }
}

export default new InterviewSessionService();
