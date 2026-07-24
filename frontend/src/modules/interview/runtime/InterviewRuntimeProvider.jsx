import { useEffect } from 'react';
import { useInterviewRuntimeManager } from './InterviewRuntimeManager';
import { InterviewRuntimeContext } from './InterviewRuntimeContext';
import { useDeviceHealth } from '../../device-health';
import { useFaceDetection } from '../../face-detection';
import { useBrowserMonitoring } from '../../browser-monitoring';
import { useViolationEngine } from '../../violation-engine';
import { useInterviewSession } from '../../interview-session';

export const InterviewRuntimeProvider = ({ children, sessionId, candidateId }) => {
  const {
    cameraRuntime,
    recordingRuntime,
    runtimeState,
    runtimeError,
    actions
  } = useInterviewRuntimeManager();

  const deviceRuntime = useDeviceHealth(cameraRuntime);
  const faceRuntime = useFaceDetection(cameraRuntime.stream);
  const browserRuntime = useBrowserMonitoring();
  const violationRuntime = useViolationEngine(deviceRuntime, faceRuntime, browserRuntime);
  const sessionBuilder = useInterviewSession();

  // Initialize session once
  useEffect(() => {
    sessionBuilder.initialize({
      interviewId: sessionId || 'inter_' + Math.random().toString(36).substr(2, 9),
      candidateId: candidateId || 'cand_' + Math.random().toString(36).substr(2, 9),
      metadata: {
        userAgent: navigator.userAgent
      }
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Provide a specialized action to attach monitoring facts and finalize
  const finalizeInterviewSession = (conversation, finalizedRecordingSession, backendSession) => {
    sessionBuilder.attachRecording(finalizedRecordingSession || recordingRuntime.session);

    // Prefer the backend session's questions (which carry real askedAt/answeredAt timestamps)
    // over the frontend-only questions array. Fall back to frontend conversation if unavailable.
    const questionsWithTimestamps = backendSession?.questions?.length
      ? backendSession.questions.map((q) => ({
          question: q.question,
          answer: q.answer || null,
          startedAt: q.askedAt || null,
          endedAt: q.answeredAt || null,
          topic: q.topic,
          difficulty: q.difficulty,
          type: q.type,
        }))
      : conversation.questions || [];

    sessionBuilder.attachConversation({
      questions: questionsWithTimestamps,
      answers: conversation.answers || [],
    });
    sessionBuilder.attachViolations({
      active: violationRuntime.active,
      history: violationRuntime.history,
      timeline: violationRuntime.timeline,
      statistics: violationRuntime.statistics
    });
    sessionBuilder.attachMonitoring({
      device: deviceRuntime.history,
      browser: browserRuntime.history,
      face: faceRuntime.history
    });
    
    return sessionBuilder.finalizeAndBuild();
  };

  // Grouped context shape exposing runtime modules safely
  const contextValue = {
    camera: cameraRuntime,
    recording: recordingRuntime,
    device: deviceRuntime,
    face: faceRuntime,
    browser: browserRuntime,
    violations: violationRuntime,
    session: sessionBuilder.session,
    runtime: {
      state: runtimeState,
      error: runtimeError,
      session: recordingRuntime.session
    },
    actions: {
      ...actions,
      finalizeInterviewSession
    },
    
    // Reserved for future extensions to avoid refactoring
    voice: {},
    monitoring: {},
    network: {},
    health: {},
    capabilities: {},
    devices: {},
    status: {},
    headPose: {},
    eyeTracking: {},
    lighting: {},
    pose: {},
    clipboard: {},
    developerTools: {},
    screenShare: {},
    permissions: {}
  };

  return (
    <InterviewRuntimeContext.Provider value={contextValue}>
      {children}
    </InterviewRuntimeContext.Provider>
  );
};

