import { Queue } from 'bullmq';
import { redisClient, isRedisReady } from '../../../config/redis.js';

export const EVALUATION_QUEUE_NAME = 'heavy-ai-evaluation';

let evaluationQueue = null;

/**
 * Initializes and returns the BullMQ Queue instance
 */
export const getEvaluationQueue = () => {
  if (!evaluationQueue && isRedisReady()) {
    try {
      evaluationQueue = new Queue(EVALUATION_QUEUE_NAME, {
        connection: redisClient,
        defaultJobOptions: {
          attempts: 3, // Retry up to 3 times if LLM provider rate limits occur
          backoff: {
            type: 'exponential',
            delay: 2000, // 2s, 4s, 8s backoff
          },
          removeOnComplete: 100, // Keep last 100 finished jobs for logging
          removeOnFail: 200, // Keep last 200 failed jobs for debugging
        },
      });
      console.log(`⚡ [BullMQ Queue] Queue '${EVALUATION_QUEUE_NAME}' initialized`);
    } catch (err) {
      console.warn('⚠️ [BullMQ Queue] Failed to initialize queue:', err.message);
      evaluationQueue = null;
    }
  }
  return evaluationQueue;
};

/**
 * Enqueues a heavy AI evaluation task into Redis BullMQ (< 5ms)
 * 
 * @param {Object} session - The completed InterviewSession
 * @param {Object} interviewDoc - The Interview document
 * @returns {Promise<{ enqueued: boolean, jobId?: string }>}
 */
export const enqueueEvaluation = async (session, interviewDoc) => {
  const queue = getEvaluationQueue();

  if (!queue || !isRedisReady()) {
    return { enqueued: false, reason: 'redis_offline' };
  }

  try {
    const jobData = {
      sessionId: String(session._id || session.id),
      interviewId: String(session.interviewId),
      candidateId: String(session.candidateId),
      interviewTitle: interviewDoc?.title || 'Mock Interview',
      enqueuedAt: Date.now(),
    };

    const job = await queue.add(`eval-${session._id}`, jobData);
    console.log(`🚀 [BullMQ Queue] Enqueued evaluation Job ID: ${job.id} for Session: ${session._id}`);

    return { enqueued: true, jobId: String(job.id) };
  } catch (err) {
    console.warn('⚠️ [BullMQ Queue] Failed to enqueue job:', err.message);
    return { enqueued: false, reason: err.message };
  }
};
