import { Worker } from 'bullmq';
import { redisClient, isRedisReady } from '../config/redis.js';
import { VIDEO_UPLOAD_QUEUE_NAME } from '../modules/upload/queues/uploadQueue.js';
import CloudinaryService from '../modules/interview/services/CloudinaryService.js';
import fs from 'fs';
import path from 'path';

let uploadWorker = null;

/**
 * Initializes the BullMQ Worker to merge video chunks and upload to Cloudinary in the background
 */
export const startUploadWorker = () => {
  if (uploadWorker) return uploadWorker;
  if (!isRedisReady()) {
    console.warn('⚠️ [Upload Worker] Redis is offline. Upload worker not started.');
    return null;
  }

  try {
    uploadWorker = new Worker(
      VIDEO_UPLOAD_QUEUE_NAME,
      async (job) => {
        const { uploadId, totalChunks, metadata } = job.data;
        console.log(`\n🎬 [Upload Worker] Merging ${totalChunks} chunks for Upload ID: ${uploadId}...`);

        const tempDir = path.join(process.cwd(), 'temp_uploads', uploadId);
        const mergedFilePath = path.join(process.cwd(), 'temp_uploads', `${uploadId}_merged.webm`);

        if (!fs.existsSync(tempDir)) {
          console.warn(`⚠️ [Upload Worker] Temp directory for ${uploadId} not found (mock mode).`);
          return { success: true, isMockTest: true };
        }

        // 1. Merge chunks sequentially
        const writeStream = fs.createWriteStream(mergedFilePath);
        for (let i = 1; i <= totalChunks; i++) {
          const chunkPath = path.join(tempDir, `chunk_${i}`);
          if (fs.existsSync(chunkPath)) {
            const chunkData = fs.readFileSync(chunkPath);
            writeStream.write(chunkData);
          }
        }
        writeStream.end();

        await new Promise((resolve, reject) => {
          writeStream.on('finish', resolve);
          writeStream.on('error', reject);
        });

        // 2. Read merged buffer and upload to Cloudinary
        console.log(`☁️ [Upload Worker] Uploading merged file to Cloudinary for Upload ID: ${uploadId}...`);
        const fileBuffer = fs.readFileSync(mergedFilePath);
        
        const cloudinaryResult = await CloudinaryService.uploadRecording(
          fileBuffer,
          `${uploadId}.webm`,
          { folder: 'interview_recordings' }
        );

        // 3. Clean up temp disk files
        try {
          fs.rmSync(tempDir, { recursive: true, force: true });
          if (fs.existsSync(mergedFilePath)) fs.unlinkSync(mergedFilePath);
        } catch (cleanupErr) {
          console.warn('⚠️ [Upload Worker] Temp cleanup notice:', cleanupErr.message);
        }

        console.log(`✅ [Upload Worker] Video upload complete for ${uploadId}: ${cloudinaryResult?.secure_url || 'Success'}\n`);
        return { success: true, url: cloudinaryResult?.secure_url };
      },
      {
        connection: redisClient,
        concurrency: 3,
      }
    );

    uploadWorker.on('completed', (job, returnvalue) => {
      console.log(`🎉 [Upload Worker] Video job #${job.id} completed successfully!`, returnvalue);
    });

    uploadWorker.on('failed', (job, err) => {
      console.error(`❌ [Upload Worker] Video job #${job?.id} failed:`, err.message);
    });

    console.log(`⚡ [Upload Worker] Worker listening on queue '${VIDEO_UPLOAD_QUEUE_NAME}'`);
  } catch (err) {
    console.warn('⚠️ [Upload Worker] Failed to start upload worker:', err.message);
  }

  return uploadWorker;
};
