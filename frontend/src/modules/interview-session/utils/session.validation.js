export const validateInterviewSession = (data) => {
  const errors = [];

  if (!data.sessionId) errors.push('Missing sessionId');
  if (!data.interviewId) errors.push('Missing interviewId');
  if (!data.candidateId) errors.push('Missing candidateId');
  if (!data.startedAt) errors.push('Missing startedAt');
  if (!data.endedAt) errors.push('Missing endedAt');
  
  if (!data.conversation || !data.conversation.questions) {
    errors.push('Missing conversation data');
  }

  return {
    isValid: errors.length === 0,
    errors
  };
};
