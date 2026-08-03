import { Queue } from 'bullmq';
import { redisClient, isRedisReady } from '../../../config/redis.js';

export const VIDEO_UPLOAD_QUEUE_NAME = 'video-upload-queue';

let uploadQueue = null;

/**
 * Returns the BullMQ Queue instance for video chunk merging and Cloudinary sync
 */
export const getUploadQueue = () => {
  if (!uploadQueue && isRedisReady()) {
    try {
      uploadQueue = new Queue(VIDEO_UPLOAD_QUEUE_NAME, {
        connection: redisClient,
        defaultJobOptions: {
          attempts: 3,
          backoff: { type: 'exponential', delay: 3000 },
          removeOnComplete: 100,
          removeOnFail: 200,
        },
      });
      console.log(`⚡ [Upload Queue] Queue '${VIDEO_UPLOAD_QUEUE_NAME}' initialized`);
    } catch (err) {
      console.warn('⚠️ [Upload Queue] Failed to initialize queue:', err.message);
      uploadQueue = null;
    }
  }
  return uploadQueue;
};

/**
 * Enqueues a merged chunk upload task to Cloudinary (< 5ms)
 * 
 * @param {string} uploadId 
 * @param {number} totalChunks 
 * @param {Object} metadata 
 * @returns {Promise<{ enqueued: boolean, jobId?: string }>}
 */
export const enqueueVideoUploadJob = async (uploadId, totalChunks, metadata = {}) => {
  const queue = getUploadQueue();

  if (!queue || !isRedisReady()) {
    return { enqueued: false, reason: 'redis_offline' };
  }

  try {
    const jobData = {
      uploadId: String(uploadId),
      totalChunks: Number(totalChunks),
      metadata,
      enqueuedAt: Date.now(),
    };

    const job = await queue.add(`video-sync-${uploadId}`, jobData);
    console.log(`🚀 [Upload Queue] Enqueued Cloudinary video sync Job ID: ${job.id} for Upload ID: ${uploadId}`);

    return { enqueued: true, jobId: String(job.id) };
  } catch (err) {
    console.warn('⚠️ [Upload Queue] Failed to enqueue video job:', err.message);
    return { enqueued: false, reason: err.message };
  }
};
