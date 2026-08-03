import InterviewSession from "../models/InterviewSession.js";
import InterviewResult from "../models/InterviewResult.js";
import Interview from "../models/interview.model.js";
import { ConversationHistory } from "./ConversationHistory.js";
import { InterviewState } from "./InterviewState.js";
import { EvaluationContext } from "../prompts/EvaluationContext.js";
import { InterviewConfig } from "./InterviewConfig.js";
import { createInterviewEngine } from "./interviewEngine.js";
import { AIConfig } from "../providers/AIProvider/config/ai.config.js";
import { voiceSessionCache } from "./voiceSessionCache.service.js";

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
      id: 1,
      askedAt: new Date(),
      answer: null,
      answeredAt: null
    };

    const updatedSession = await InterviewSession.findByIdAndUpdate(
      sessionId,
      {
        status: "ACTIVE",
        startedAt,
        expiresAt,
        currentQuestionIndex: 0,
        $push: { questions: newQuestion }
      },
      { returnDocument: 'after' }
    );

    if (updatedSession) {
      await voiceSessionCache.setSession(
        updatedSession.interviewId,
        updatedSession.candidateId,
        updatedSession.toObject ? updatedSession.toObject() : updatedSession
      );
    }

    return updatedSession;
  }

  /**
   * Retrieves the current session with sub-millisecond Redis caching.
   * 
   * @param {string} interviewId 
   * @param {string} candidateId 
   */
  async getActiveSession(interviewId, candidateId) {
    // 1. Try fetching from Redis RAM (<1ms)
    const cachedSession = await voiceSessionCache.getSession(interviewId, candidateId);
    if (cachedSession) {
      return cachedSession;
    }

    // 2. Fallback to MongoDB on cache miss
    const session = await InterviewSession.findOne({ interviewId, candidateId });
    if (session) {
      // Seed Redis cache asynchronously for subsequent fast reads
      voiceSessionCache.setSession(
        interviewId,
        candidateId,
        session.toObject ? session.toObject() : session
      );
    }
    return session;
  }

  /**
   * Checks if a session has passed its expiration time.
   * 
   * @param {Object} session 
   * @returns {boolean}
   */
  isSessionExpired(session) {
    if (!session || !session.expiresAt) return false;
    return new Date() >= session.expiresAt;
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
   * @param {import('./InterviewConfig.js').InterviewConfig} config
   * @returns {InterviewState}
   */
  buildInterviewState(session, config) {
    const coveredTopics = [...new Set(session.questions.map(q => q.topic))];
    const remainingTopics = config.topics.filter(t => !coveredTopics.includes(t));
    const currentQuestion = session.questions.length + 1;

    // Advanced Context for AI Intelligence
    const topicDistribution = {};
    config.topics.forEach(t => topicDistribution[t] = 0);
    session.questions.forEach(q => {
      if (topicDistribution[q.topic] !== undefined) {
        topicDistribution[q.topic]++;
      } else {
        topicDistribution[q.topic] = 1;
      }
    });

    const coveredConcepts = [...new Set(session.questions.map(q => q.concept).filter(Boolean))];
    const difficultyHistory = session.questions.map(q => q.difficulty);

    let remainingTime = 0;
    if (session.expiresAt) {
      remainingTime = Math.max(0, Math.floor((session.expiresAt - new Date()) / 60000));
    }

    // We assume 10 questions max unless configured differently
    const maxQuestions = config.maxQuestions || 10;

    return new InterviewState({
      currentQuestion,
      coveredTopics,
      remainingTopics,
      remainingTime,
      interviewStartedAt: session.startedAt || new Date(),
      maxQuestions,
      topicDistribution,
      coveredConcepts,
      difficultyHistory
    });
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
        id: session.questions.length + 1,
        askedAt: new Date(),
        answer: null,
        answeredAt: null
      };
      session.questions.push(newQuestion);
      session.currentQuestionIndex = currentIndex + 1;
    }

    await session.save();
    console.log("InterviewSession\n→ Question Saved\n");

    // Sync to Redis RAM asynchronously
    voiceSessionCache.setSession(
      session.interviewId,
      session.candidateId,
      session.toObject ? session.toObject() : session
    );

    return session;
  }

  /**
   * Determines if the next question should be generated.
   * 
   * @param {Object} session 
   * @param {Object} interviewConfig 
   * @returns {boolean}
   */
  shouldGenerateNextQuestion(session, interviewConfig) {
    return (
      !this.isSessionExpired(session) &&
      session.questions.length < (interviewConfig.maxQuestions || 10)
    );
  }

  /**
   * Handles the answer submission lifecycle.
   * 
   * @param {Object} params
   * @param {Object} params.session
   * @param {string} params.answer
   * @param {Object} params.interviewConfig
   * @param {Object} params.interviewEngine
   */
  async submitAnswer({ session, answer, interviewConfig, interviewEngine }) {
    const history = this.buildConversationHistory(session);
    const state = this.buildInterviewState(session, interviewConfig);

    // We add the incoming answer manually for this turn because it hasn't been saved yet
    history.addCandidateAnswer(answer);

    let nextQuestion = null;

    if (this.shouldGenerateNextQuestion(session, interviewConfig)) {
      const generated = await interviewEngine.generateNextQuestion(interviewConfig, state, history);
      nextQuestion = generated[0];
    }

    const updatedSession = await this.saveAnswerAndNextQuestion(session._id, answer, nextQuestion);

    return {
      success: true,
      isFinished: !nextQuestion,
      nextQuestion,
      session: updatedSession
    };
  }

  /**
   * Marks the session as completed and clears RAM cache.
   * @param {string} sessionId 
   */
  async completeSession(sessionId) {
    const updated = await InterviewSession.findByIdAndUpdate(
      sessionId,
      { status: "COMPLETED" },
      { returnDocument: 'after' }
    );
    if (updated) {
      await voiceSessionCache.clearSession(updated.interviewId, updated.candidateId);
    }
    return updated;
  }

  /**
   * Evaluates a completed interview and updates the result in MongoDB.
   * @param {Object} session - The completed InterviewSession document.
   * @param {Object} interviewDoc - The Interview document.
   * @returns {Promise<{ success: boolean, result?: Object, error?: string }>}
   */
  async evaluateAndSaveResult(session, interviewDoc) {
    const startTime = Date.now();
    console.log("\n[Evaluation] Starting post-interview evaluation");
    console.log(`  Interview: ${session.interviewId}`);
    console.log(`  Session: ${session._id}`);

    let interviewResult = null;

    try {
      const config = InterviewConfig.fromInterview(interviewDoc);
      const mode = config.mode || "EMPLOYER";

      // 1. Check for existing result or initialize PENDING result
      interviewResult = await InterviewResult.findOne({
        interviewId: session.interviewId,
        candidateId: session.candidateId,
        sessionId: session._id,
      });

      if (!interviewResult) {
        interviewResult = new InterviewResult({
          interviewId: session.interviewId,
          candidateId: session.candidateId,
          sessionId: session._id,
          status: "PENDING",
          mode,
          interviewSnapshot: {
            title: config.companyName || interviewDoc.title,
            jobRole: config.jobRole,
            topics: config.topics,
            experienceLevel: config.experienceLevel,
            duration: config.duration,
            instructions: config.instructions,
            mode,
          },
          scores: {},
          recommendation: "NOT_EVALUATED",
          reasoning: "Unable to generate an evaluation due to insufficient interview responses.",
          strengths: [],
          weaknesses: [],
          questionEvaluations: [],
          aiMetadata: {
            provider: interviewDoc.interviewType || process.env.QUESTION_PROVIDER || "gemini",
            model: process.env.GEMINI_MODEL || "gemini-1.5-flash",
            latencyMs: 0,
          }
        });
        await interviewResult.save();
      }

      // Link Result ID using InterviewRepository abstraction
      const candidateUser = await (await import("../../users/user.model.js")).default.findById(session.candidateId);
      if (candidateUser) {
        const InterviewRepository = (await import("../repositories/InterviewRepository.js")).default;
        await InterviewRepository.updateCandidateStatus(session.interviewId, candidateUser.email, "Completed", interviewResult._id);
      }

      // 2. Set PROCESSING state
      interviewResult.status = "PROCESSING";
      await interviewResult.save();

      // 3. Build the EvaluationContext and evaluate
      const evaluationContext = EvaluationContext.fromSessionAndConfig(config, session);

      const engine = createInterviewEngine(
        interviewDoc.interviewType || process.env.QUESTION_PROVIDER || "gemini"
      );
      const evaluationResult = await engine.evaluateInterview(evaluationContext);

      const latencyMs = Date.now() - startTime;

      // 4. Update to COMPLETED state and map question text
      interviewResult.status = "COMPLETED";
      interviewResult.scores = evaluationResult.scores || {};
      interviewResult.recommendation = evaluationResult.recommendation || "NOT_EVALUATED";
      interviewResult.reasoning = evaluationResult.reasoning || "Unable to generate an evaluation due to insufficient interview responses.";
      interviewResult.strengths = evaluationResult.strengths || [];
      interviewResult.weaknesses = evaluationResult.weaknesses || [];

      // Map question, answer, topic, and difficulty from session.questions
      interviewResult.questionEvaluations = (evaluationResult.questionEvaluations || []).map(qe => {
        const sessionQ = session.questions.find(
          q => q.id === qe.questionId || q.id === parseInt(qe.questionId, 10)
        );
        return {
          ...qe,
          question: sessionQ ? sessionQ.question : "Unknown Question",
          answer: sessionQ ? sessionQ.answer : null,
          topic: sessionQ ? sessionQ.topic : "Unknown",
          difficulty: sessionQ ? sessionQ.difficulty : "Medium"
        };
      });

      interviewResult.aiMetadata.latencyMs = latencyMs;
      interviewResult.aiMetadata.evaluatedAt = new Date();
      await interviewResult.save();

      console.log(`[Evaluation] InterviewResult completed: ${interviewResult._id}`);
      return { success: true, result: interviewResult };

    } catch (error) {
      console.error("[Evaluation] Failed — interview submission unaffected");
      console.error(`  Error: ${error.name}: ${error.message}`);

      if (interviewResult) {
        try {
          interviewResult.status = "FAILED";
          interviewResult.recommendation = "NOT_EVALUATED";
          interviewResult.reasoning = "Unable to generate an evaluation due to insufficient interview responses.";
          await interviewResult.save();
        } catch (saveError) {
          console.error("[Evaluation] Could not update to FAILED state", saveError);
        }
      }

      return {
        success: false,
        error: `${error.name}: ${error.message}`,
      };
    }
  }

  /**
   * Uploads the recording using InterviewRecordingService abstraction.
   * @param {string} sessionId 
   * @param {string} candidateId 
   * @param {Object} file - multer file object
   * @returns {Promise<Object>} Updated session
   */
  async uploadRecordingToCloudinary(sessionId, candidateId, file) {
    const session = await InterviewSession.findOne({ _id: sessionId, candidateId });
    if (!session) {
      throw new Error("not_found");
    }

    if (session.recording?.status === "READY" || session.recording?.status === "SKIPPED") {
      return session;
    }

    try {
      const InterviewRepository = (await import("../repositories/InterviewRepository.js")).default;
      const InterviewRecordingService = (await import("./InterviewRecordingService.js")).default;

      const interviewDoc = await InterviewRepository.findById(session.interviewId);
      const config = InterviewConfig.fromInterview(interviewDoc);

      const recordingResponse = await InterviewRecordingService.processRecording(file, config.mode);

      if (recordingResponse.status === "SKIPPED") {
        session.recording = {
          provider: "none",
          status: "SKIPPED",
          uploadedAt: new Date()
        };
        await session.save();
        return session;
      }

      session.recording = {
        url: recordingResponse.recording.url,
        publicId: recordingResponse.recording.publicId,
        provider: "cloudinary",
        mimeType: file?.mimetype || "video/webm",
        size: file?.size || 0,
        duration: recordingResponse.recording.duration || 0,
        status: "READY",
        originalFilename: file?.originalname || "recording.webm",
        uploadedAt: new Date()
      };

      await session.save();
      return session;
    } catch (error) {
      console.error("[UploadPipeline] Recording upload failed:", error);

      session.recording = {
        ...(session.recording || {}),
        status: "FAILED",
        uploadedAt: new Date()
      };
      await session.save();

      throw new Error(`Upload failed: ${error.message}`);
    }
  }
}

export default new InterviewSessionService();
