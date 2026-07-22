export const validateUploadSchema = (session) => {
    const errors = [];

    if (!session || typeof session !== 'object') {
        return { isValid: false, errors: ['Session must be an object'] };
    }

    if (!session.sessionId) errors.push('Missing sessionId');
    if (!session.interviewId) errors.push('Missing interviewId');
    if (!session.candidateId) errors.push('Missing candidateId');

    return {
        isValid: errors.length === 0,
        errors
    };
};
