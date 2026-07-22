import { useContext } from 'react';
import { InterviewRuntimeContext } from './InterviewRuntimeContext';

export const useInterviewRuntime = () => {
  const context = useContext(InterviewRuntimeContext);
  if (!context) {
    throw new Error('useInterviewRuntime must be used within an InterviewRuntimeProvider');
  }
  return context;
};
