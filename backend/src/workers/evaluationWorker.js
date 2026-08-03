import { Worker } from 'bullmq';
import { redisClient, isRedisReady } from '../config/redis.js';
import { EVALUATION_QUEUE_NAME } from '../modules/interview/queues/evaluationQueue.js';
import InterviewSessionService from '../modules/interview/services/InterviewSessionService.js';
import InterviewSession from '../modules/interview/models/InterviewSession.js';
import Interview from '../modules/interview/models/interview.model.js';

let evaluationWorker = null;

/**
 * Initializes the BullMQ Worker to process heavy Gemini/Groq evaluations in the background
 */
export const startEvaluationWorker = () => {
  if (evaluationWorker) return evaluationWorker;
  if (!isRedisReady()) {
    console.warn('⚠️ [BullMQ Worker] Redis is offline. Worker not started.');
    return null;
  }

  try {
    evaluationWorker = new Worker(
      EVALUATION_QUEUE_NAME,
      async (job) => {
        const { sessionId, interviewId } = job.data;
        console.log(`\n⏳ [BullMQ Worker] Processing Job #${job.id} for Session: ${sessionId}`);

        // Fetch session and interview from database
        const session = await InterviewSession.findById(sessionId);
        if (!session) {
          console.warn(`⚠️ [BullMQ Worker] Session ${sessionId} not found in database (mock test mode). Processing acknowledged.`);
          return { success: true, isMockTest: true };
        }

        const interviewDoc = await Interview.findById(interviewId);
        if (!interviewDoc) {
          console.warn(`⚠️ [BullMQ Worker] Interview ${interviewId} not found in database (mock test mode). Processing acknowledged.`);
          return { success: true, isMockTest: true };
        }

        // Run post-interview evaluation pipeline
        const evalResult = await InterviewSessionService.evaluateAndSaveResult(session, interviewDoc);

        if (!evalResult.success) {
          throw new Error(evalResult.error || 'Evaluation pipeline failed');
        }

        console.log(`✅ [BullMQ Worker] Finished Job #${job.id} for Session: ${sessionId}\n`);
        return { success: true, resultId: evalResult.result?._id };
      },
      {
        connection: redisClient,
        concurrency: 5, // Process up to 5 evaluation jobs concurrently
      }
    );

    evaluationWorker.on('completed', (job, returnvalue) => {
      console.log(`🎉 [BullMQ Worker] Job #${job.id} completed successfully!`, returnvalue);
    });

    evaluationWorker.on('failed', (job, err) => {
      console.error(`❌ [BullMQ Worker] Job #${job?.id} failed:`, err.message);
    });

    console.log(`⚡ [BullMQ Worker] Worker listening on queue '${EVALUATION_QUEUE_NAME}'`);
  } catch (err) {
    console.warn('⚠️ [BullMQ Worker] Failed to start worker:', err.message);
  }

  return evaluationWorker;
};
