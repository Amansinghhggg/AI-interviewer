export const UPLOAD_STATES = {
    QUEUED: 'QUEUED',
    UPLOADING: 'UPLOADING',
    RETRYING: 'RETRYING',
    COMPLETED: 'COMPLETED',
    FAILED: 'FAILED'
};

export const UPLOAD_STAGES = {
    RECORDING_UPLOAD: 'RECORDING_UPLOAD',
    SESSION_UPLOAD: 'SESSION_UPLOAD',
    FINALIZE: 'FINALIZE'
};

export const RETRY_CONFIG = {
    maxRetries: 3,
    retryDelayMs: 2000,
    backoffMultiplier: 2
};

export const UPLOAD_JOB_TYPES = {
    INTERVIEW_SESSION: 'INTERVIEW_SESSION'
};
