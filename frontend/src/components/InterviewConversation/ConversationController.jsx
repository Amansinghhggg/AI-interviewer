import { useCallback } from 'react';
import {
  useConversationState,
  createConversationTurn,
} from '../../modules/interview/conversation';
import { useInterviewRuntime, INTERVIEW_RUNTIME_STATES } from '../../modules/interview/runtime';
import { mergeTranscript } from '../../utils/mergeTranscript';
import InterviewAI from './InterviewAI';
import InterviewCandidate from './InterviewCandidate';

// Import modular styles
import './InterviewConversation.css';

/**
 * ConversationController
 *
 * Lightweight orchestration component responsible for coordinating:
 * - ConversationState (derived from interview + voice hooks)
 * - ConversationTurn (current turn model)
 * - AI section (InterviewAI)
 * - Candidate section (InterviewCandidate)
 *
 * Consumes the InterviewRuntime context for browser APIs (camera, recording)
 * rather than managing them directly.
 *
 * @param {object} props
 * @param {object} props.currentQuestion - Current question from useInterview
 * @param {object} props.answers - Answers map from useInterview
 * @param {boolean} props.isGenerating - From useInterview
 * @param {boolean} props.submitting - From useInterview
 * @param {boolean} props.isInterviewFinished - From useInterview
 * @param {object} props.voiceProps - From useQuestionVoice
 * @param {function} props.handleAnswerChange - From useInterview
 */
const ConversationController = ({
  currentQuestion,
  answers,
  isGenerating,
  submitting,
  isInterviewFinished,
  voiceProps,
  handleAnswerChange,
}) => {
  // ─── Consume Interview Runtime ────────────────────
  const { camera, runtime, device, face, browser, violations } = useInterviewRuntime();
  const { stream: cameraStream, state: cameraState, error: cameraError } = camera;
  const isRuntimeActive = runtime.state === INTERVIEW_RUNTIME_STATES.ACTIVE || runtime.state === INTERVIEW_RUNTIME_STATES.FINISHING;

  // ─── Derive Conversation State ────────────────────
  const { conversationState, statusMessage, transcriptState } = useConversationState({
    isGenerating,
    voiceState: voiceProps.voiceState,
    isInterviewFinished,
    submitting,
  });

  // ─── Current Conversation Turn ────────────────────
  const currentTurn = createConversationTurn({
    question: currentQuestion,
    candidateAnswer: answers[currentQuestion?.id] || '',
    conversationState,
    transcriptState,
  });

  // Halt AI question until recording is fully active
  const aiTranscript = isRuntimeActive ? currentTurn.aiTranscript : 'Initializing interview...';


  // ─── Voice Transcript Handler ─────────────────────
  const handleVoiceTranscript = useCallback((transcript) => {
    if (!currentQuestion) return;
    const currentAnswer = answers[currentQuestion.id] || '';
    const newText = mergeTranscript(currentAnswer, transcript);
    handleAnswerChange(currentQuestion.id, newText);
  }, [currentQuestion, answers, handleAnswerChange]);

  const handleClearAnswer = useCallback(() => {
    if (!currentQuestion) return;
    handleAnswerChange(currentQuestion.id, '');
  }, [currentQuestion, handleAnswerChange]);

  // ─── Render ───────────────────────────────────────
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 lg:gap-6 h-full">
      {/* AI Interviewer Section */}
      <section
        className="glass-light rounded-3xl p-6 sm:p-10 border border-dark-700/50 flex flex-col justify-center"
        aria-label="AI Interviewer"
      >
        <InterviewAI
          conversationState={conversationState}
          statusMessage={statusMessage}
          aiTranscript={aiTranscript}
        />
      </section>

      {/* Candidate Section */}
      <section
        className="glass-light rounded-3xl p-6 sm:p-8 border border-dark-700/50 flex flex-col"
        aria-label="Candidate"
      >
        <InterviewCandidate
          conversationState={conversationState}
          candidateTranscript={currentTurn.candidateTranscript}
          transcriptState={transcriptState}
          cameraStream={cameraStream}
          cameraState={cameraState}
          cameraWarnings={camera.warnings}
          cameraError={cameraError}
          deviceSnapshot={device?.snapshot}
          faceSnapshot={face?.snapshot}
          browserStatus={browser?.status}
          activeViolations={violations?.active}
          setVideoElement={face?.setVideoElement}
          onTranscript={handleVoiceTranscript}
          onClearAnswer={handleClearAnswer}
        />
      </section>
    </div>
  );
};

export default ConversationController;
