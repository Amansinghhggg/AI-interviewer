export const validateUploadBusinessLogic = (session) => {
    const errors = [];

    // The runtime must be completed before entering the persistence layer
    if (!session.endedAt) {
        errors.push('Session is not completed (missing endedAt)');
    }

    if (!session.conversation || !session.conversation.questions || session.conversation.questions.length === 0) {
        errors.push('Session contains no conversation data');
    }

    return {
        isValid: errors.length === 0,
        errors
    };
};
