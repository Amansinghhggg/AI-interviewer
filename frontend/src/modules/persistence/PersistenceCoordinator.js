import { UploadQueue } from './queue/UploadQueue.js';
import { UploadPipeline } from './pipeline/UploadPipeline.js';
import { UploadJob } from './models/UploadJob.js';
import { validateUploadSchema } from './utils/schema.validation.js';
import { validateUploadBusinessLogic } from './utils/business.validation.js';
import { UPLOAD_JOB_TYPES, RETRY_CONFIG } from './config/constants.js';

export class PersistenceCoordinator {
    constructor() {
        this.queue = new UploadQueue();
        this.pipeline = new UploadPipeline();
        
        this.queue.setProcessor(this.processJob.bind(this));
    }

    async processJob(job, onProgress) {
        if (job.type === UPLOAD_JOB_TYPES.INTERVIEW_SESSION) {
            let attempt = job.retries;
            let success = false;
            let lastError = null;

            while (attempt <= RETRY_CONFIG.maxRetries && !success) {
                try {
                    await this.pipeline.processInterviewSessionJob(job, onProgress);
                    success = true;
                } catch (error) {
                    lastError = error;
                    attempt++;
                    if (attempt <= RETRY_CONFIG.maxRetries) {
                        job.incrementRetries();
                        const delay = RETRY_CONFIG.retryDelayMs * Math.pow(RETRY_CONFIG.backoffMultiplier, attempt - 1);
                        await new Promise(resolve => setTimeout(resolve, delay));
                    }
                }
            }

            if (!success) {
                throw lastError || new Error("Job failed after retries");
            }
        } else {
            throw new Error(`Unsupported job type: ${job.type}`);
        }
    }

    saveSession(session, recordingBlob = null) {
        // 1. Schema Validation
        const schemaValidation = validateUploadSchema(session);
        if (!schemaValidation.isValid) {
            throw new Error(`Schema validation failed: ${schemaValidation.errors.join(', ')}`);
        }

        // 2. Business Validation
        const businessValidation = validateUploadBusinessLogic(session);
        if (!businessValidation.isValid) {
            throw new Error(`Business validation failed: ${businessValidation.errors.join(', ')}`);
        }

        const job = new UploadJob({
            type: UPLOAD_JOB_TYPES.INTERVIEW_SESSION,
            payload: { session, recordingBlob }
        });

        this.queue.enqueue(job);
        return job;
    }

    getQueue() {
        return this.queue;
    }
}

// Singleton instance
export const persistenceCoordinator = new PersistenceCoordinator();
