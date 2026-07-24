import { useEffect, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { AlertTriangle, Loader2 } from "lucide-react";
import { useInterview } from "../hooks/useInterview";
import { useQuestionVoice } from "../hooks/useQuestionVoice";
import { questionVoiceService } from "../services/questionVoice.service";

// Existing Interview Components (used for static/legacy interviews)
import QuestionCard from "../components/Interview/QuestionCard";
import ProgressBar from "../components/Interview/ProgressBar";
import Timer from "../components/Interview/Timer";
import Navigation from "../components/Interview/Navigation";
import AnswerBox from "../components/Interview/AnswerBox";

// Conversational Interview (used for AI interviews)
import { ConversationController } from "../components/InterviewConversation";
import { InterviewRuntimeProvider, useInterviewRuntime, INTERVIEW_RUNTIME_STATES } from "../modules/interview/runtime";
import { usePersistence } from "../modules/persistence/hooks/usePersistence";
import UploadScreen from "../components/Interview/UploadScreen";

const LiveInterviewAIContent = ({
  interview,
  questions = [],
  currentQuestion,
  answers,
  isGenerating,
  submitting,
  isInterviewFinished,
  voiceProps,
  handleAnswerChange,
  timeLeft,
  currentIndex,
  totalQuestions,
  handleNext,
  handleSubmit,
  handlePrev,
  session,  // backend session — needed for real question timestamps
}) => {
  const { runtime, actions } = useInterviewRuntime();
  const { save, retry, state: uploadState, retries, error } = usePersistence();
  const navigate = useNavigate();

  // Start recording automatically when runtime is ready
  useEffect(() => {
    if (runtime.state === INTERVIEW_RUNTIME_STATES.RECORDING_READY) {
      actions.start();
    }
  }, [runtime.state, actions]);

  // Stop recording and finalize session when interview finishes
  useEffect(() => {
    if (isInterviewFinished && runtime.state === INTERVIEW_RUNTIME_STATES.ACTIVE) {
      actions.stop().then(recordingSession => {
        // Assemble all pieces into the canonical InterviewSession.
        // Pass the backend `session` as the third argument so real question
        // timestamps (askedAt / answeredAt from MongoDB) are used instead of
        // the frontend-only questions array.
        const interviewSession = actions.finalizeInterviewSession(
          { questions, answers },
          recordingSession,
          session  // backend session with real timestamps
        );
        console.log("[LiveInterviewPage] Finalized Interview Session:", interviewSession);
        
        // Trigger the background upload pipeline immediately
        save(interviewSession, recordingSession?.blob);
      });
    }
  }, [isInterviewFinished, runtime.state, actions, questions, answers, session, save]);

  // If there's an active upload state, take over the screen
  if (uploadState) {
    return (
      <UploadScreen
        uploadState={uploadState}
        retries={retries}
        error={error}
        onRetry={retry}
        onContinue={() => navigate("/interviews")}
      />
    );
  }

  return (
    <div className="min-h-screen bg-dark-900 flex flex-col relative overflow-hidden font-sans pt-16">
      {/* Top Bar */}
      <div className="fixed top-0 left-0 right-0 h-16 bg-dark-800/80 backdrop-blur-md border-b border-dark-700 flex items-center justify-between px-6 z-50">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-primary-500/20 flex items-center justify-center">
            <AlertTriangle className="w-4 h-4 text-primary-400" />
          </div>
          <span className="font-semibold text-dark-50">{interview?.title}</span>
        </div>
        
        <div className="flex items-center">
          <Timer timeLeft={timeLeft} />
        </div>
      </div>

      {/* Time Warning */}
      {timeLeft === 0 && (
        <div className="max-w-[1600px] w-full mx-auto px-4 sm:px-6 lg:px-12 mt-4">
          <div className="p-4 rounded-xl bg-warning-500/10 border border-warning-500/20 text-warning-400 flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 flex-shrink-0 mt-0.5" />
            <p className="text-sm font-medium">
              Interview time has ended. You may finish answering the current question. No additional questions will be generated.
            </p>
          </div>
        </div>
      )}

      {/* Main Conversation Area — orchestrated by ConversationController */}
      <div className="flex-1 max-w-[1600px] w-full mx-auto px-4 sm:px-6 lg:px-12 pb-8 flex flex-col min-h-0 mt-6">
        <div className="flex-1 min-h-[500px]">
          <ConversationController
            currentQuestion={currentQuestion}
            answers={answers}
            isGenerating={isGenerating}
            submitting={submitting}
            isInterviewFinished={isInterviewFinished}
            voiceProps={voiceProps}
            handleAnswerChange={handleAnswerChange}
          />
        </div>

        {/* Navigation */}
        <div className="mt-8 flex justify-end">
          <Navigation
            currentIndex={currentIndex}
            totalQuestions={totalQuestions}
            isInterviewFinished={isInterviewFinished}
            isTimeUp={timeLeft === 0}
            isAi={true}
            handlePrev={handlePrev}
            handleNext={handleNext}
            handleSubmit={handleSubmit}
            submitting={submitting}
            generating={isGenerating}
            hasAnswer={!!(currentQuestion && answers[currentQuestion.id])}
          />
        </div>
      </div>
    </div>
  );
};

const LiveInterviewPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  
  const {
    loading,
    submitting,
    isGenerating,
    interview,
    questions,
    currentQuestion,
    currentIndex,
    totalQuestions,
    answers,
    timeLeft,
    isInterviewFinished,
    isAi,
    session,
    handleNext,
    handlePrev,
    handleAnswerChange,
    handleSubmit
  } = useInterview(id, navigate, user);

  const handlePlaybackComplete = useCallback(() => {
    // For legacy mode, focus the textarea.
    // For AI conversational mode, playback complete is handled by ConversationController.
    if (!isAi) {
      const textarea = document.getElementById('interview-answer-box');
      if (textarea) {
        textarea.focus();
      }
    }
  }, [isAi]);

  const sessionId = interview?.id || interview?._id;
  
  // Stop audio and prevent generation if the interview is finished or currently generating the next question
  const isVoiceDisabled = isInterviewFinished || isGenerating;
  const voiceProps = useQuestionVoice(currentQuestion, sessionId, handlePlaybackComplete, isVoiceDisabled);

  useEffect(() => {
    const handleBeforeUnload = (e) => {
      if (!isInterviewFinished) {
        e.preventDefault();
        e.returnValue = "Are you sure you want to leave? Your progress will be saved locally, but it is recommended to complete the interview in one sitting.";
      }
    };
    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload);
      questionVoiceService.clearCache();
    };
  }, [isInterviewFinished]);

  // Also clear cache if interview completes
  useEffect(() => {
    if (isInterviewFinished) {
      questionVoiceService.clearCache();
    }
  }, [isInterviewFinished]);

  if (loading) {
    return (
      <div className="min-h-screen bg-dark-900 flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary-400" />
      </div>
    );
  }

  // ═══════════════════════════════════════════════
  // AI CONVERSATIONAL LAYOUT
  // ═══════════════════════════════════════════════
  if (isAi) {
    return (
      <InterviewRuntimeProvider sessionId={session?._id} candidateId={user?.email}>
        <LiveInterviewAIContent
          interview={interview}
          questions={questions}
          currentQuestion={currentQuestion}
          answers={answers}
          isGenerating={isGenerating}
          submitting={submitting}
          isInterviewFinished={isInterviewFinished}
          voiceProps={voiceProps}
          handleAnswerChange={handleAnswerChange}
          timeLeft={timeLeft}
          currentIndex={currentIndex}
          totalQuestions={totalQuestions}
          handleNext={handleNext}
          handlePrev={handlePrev}
          handleSubmit={handleSubmit}
          session={session}
        />
      </InterviewRuntimeProvider>
    );
  }

  // ═══════════════════════════════════════════════
  // LEGACY STATIC INTERVIEW LAYOUT (unchanged)
  // ═══════════════════════════════════════════════
  return (
    <div className="min-h-screen bg-dark-900 flex flex-col relative overflow-hidden font-sans pt-16">
      {/* Top Bar */}
      <div className="fixed top-0 left-0 right-0 h-16 bg-dark-800/80 backdrop-blur-md border-b border-dark-700 flex items-center justify-between px-6 z-50">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-primary-500/20 flex items-center justify-center">
            <AlertTriangle className="w-4 h-4 text-primary-400" />
          </div>
          <span className="font-semibold text-dark-50">{interview?.title}</span>
        </div>
        
        <Timer timeLeft={timeLeft} />
      </div>

      {/* Main Content */}
      <div className="flex-1 max-w-4xl w-full mx-auto p-4 sm:p-6 lg:p-8 flex flex-col mt-4">
        {timeLeft === 0 && (
          <div className="mb-6 p-4 rounded-xl bg-warning-500/10 border border-warning-500/20 text-warning-400 flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 flex-shrink-0 mt-0.5" />
            <p className="text-sm font-medium">
              Interview time has ended. You may finish answering the current question. No additional questions will be generated.
            </p>
          </div>
        )}

        <ProgressBar current={currentIndex} total={totalQuestions} />

        <div className="flex-1 flex flex-col gap-2">
          <QuestionCard 
            question={currentQuestion} 
            index={currentIndex} 
            total={totalQuestions} 
            voiceProps={voiceProps}
          />

          <AnswerBox 
            question={currentQuestion} 
            value={answers[currentQuestion?.id] || ""} 
            onChange={handleAnswerChange} 
          />
        </div>

        <Navigation 
          currentIndex={currentIndex}
          totalQuestions={totalQuestions}
          isInterviewFinished={isInterviewFinished}
          isTimeUp={timeLeft === 0}
          isAi={isAi}
          handlePrev={handlePrev}
          handleNext={handleNext}
          handleSubmit={handleSubmit}
          submitting={submitting}
          generating={isGenerating}
        />
      </div>
    </div>
  );
};

export default LiveInterviewPage;
