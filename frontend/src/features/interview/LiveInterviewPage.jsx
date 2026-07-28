import { useEffect, useCallback, useState, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { toast } from "react-hot-toast";
import { AlertTriangle, Loader2 } from "lucide-react";
import { useInterview } from "../../hooks/useInterview";
import { useQuestionVoice } from "../../hooks/useQuestionVoice";
import { questionVoiceService } from "../../services/questionVoice.service";

// Existing Interview Components (used for static/legacy interviews)
import QuestionCard from "../../ui/interview-form/QuestionCard";
import ProgressBar from "../../ui/interview-form/ProgressBar";
import Timer from "../../ui/interview-form/Timer";
import Navigation from "../../ui/interview-form/Navigation";
import AnswerBox from "../../ui/interview-form/AnswerBox";

// Conversational Interview (used for AI interviews)
import { ConversationController } from "../../ui/interview-room/index";
import { InterviewRuntimeProvider, useInterviewRuntime, INTERVIEW_RUNTIME_STATES } from "../../modules/interview/runtime/index";
import { usePersistence } from "../../modules/persistence/hooks/usePersistence";
import UploadScreen from "../../ui/interview-form/UploadScreen";

import { Button } from "../../ui/components/Button";
// Inlining the format function to avoid external dependency
const formatDisplayTime = (seconds) => {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
};

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
  handleEndInterview,
  handlePrev,
  session,  // backend session — needed for real question timestamps
}) => {
  const { runtime, actions } = useInterviewRuntime();
  const { save, retry, state: uploadState, retries, error } = usePersistence();
  const navigate = useNavigate();

  // Mode flag for automatic vs manual orchestration
  const isAutomaticMode = true;

  // Start recording automatically when runtime is ready
  useEffect(() => {
    if (runtime.state === INTERVIEW_RUNTIME_STATES.RECORDING_READY) {
      actions.start();
    }
  }, [runtime.state]);

  const hasFinalizedRef = useRef(false);
  const hasNavigatedRef = useRef(false);
  const isMockMode = interview?.mode === "MOCK" || session?.mode === "MOCK" || interview?.description?.includes("practice interview") || interview?.title?.startsWith("Mock Interview");

  // Stop recording and finalize session when interview finishes
  useEffect(() => {
    if (isInterviewFinished) {
      if (isMockMode && !hasNavigatedRef.current) {
        hasNavigatedRef.current = true;
        toast.success("Mock Interview Completed! Opening reports...");
        window.location.href = "/candidate/mock-interview?tab=history";
        return;
      }

      if (runtime.state !== INTERVIEW_RUNTIME_STATES.FINALIZED && !hasFinalizedRef.current) {
        hasFinalizedRef.current = true;
        actions.stop().then((recordingSession) => {
          const interviewSession = actions.finalizeInterviewSession(
            { questions, answers },
            recordingSession,
            session
          );
          save(interviewSession, recordingSession?.blob);
        }).catch(err => {
          console.error("[LiveInterviewPage] Finalization failed:", err);
        });
      }
    }
  }, [isInterviewFinished, isMockMode, navigate]);

  if (isInterviewFinished && isMockMode) {
    return (
      <div className="h-screen w-full bg-[#0b1326] flex flex-col items-center justify-center space-y-4 text-white font-['Inter']">
        <Loader2 className="w-10 h-10 animate-spin text-[var(--color-primary-md3,#8b5cf6)]" />
        <h2 className="text-xl font-black uppercase tracking-wider">Redirecting...</h2>
      </div>
    );
  }

  // If there's an active upload state (for employer interviews), take over the screen
  if (uploadState && !isMockMode) {
    return (
      <UploadScreen
        uploadState={uploadState}
        retries={retries}
        error={error}
        onRetry={retry}
        onContinue={() => navigate("/candidate/dashboard")}
      />
    );
  }

  return (
    <div className="h-screen bg-[#0a0a0b] flex flex-col relative overflow-hidden font-sans">
      <div className="absolute inset-0 noise pointer-events-none z-0 opacity-20"></div>

      {/* Top Bar */}
      <div className="fixed top-0 left-0 right-0 h-16 bg-[#0a0a0b] flex items-center justify-between px-6 z-50 shadow-sm border-b border-[var(--border)]">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 text-xs font-bold text-[var(--color-danger)] tracking-[0.1em] uppercase">
            <span className="w-2 h-2 rounded-full bg-[var(--color-danger)] animate-pulse shadow-[0_0_8px_rgba(239,68,68,0.6)]" />
            REC
          </div>
          <span className="text-sm font-semibold text-[var(--text-secondary)]">
            {interview?.jobRole} • {session?.candidateId || "Candidate"}
          </span>
        </div>
        
        <div className="flex items-center gap-6">
          <div className={`font-bold text-lg tabular-nums ${timeLeft <= 0 ? 'text-[var(--color-danger)] animate-pulse' : 'text-[var(--color-warning)]'}`}>
             {timeLeft <= 0 ? `GRACE: 00:${(60 - Math.abs(timeLeft)).toString().padStart(2, '0')}` : formatDisplayTime(timeLeft)}
          </div>
          {timeLeft > 0 && (
            <Button variant="outline" className="border-[var(--border)] text-[var(--text-primary)] hover:bg-[var(--background-secondary)] transition-colors h-9 px-4" onClick={handleEndInterview}>
              End interview
            </Button>
          )}
        </div>
      </div>

      {/* Time Warning */}
      {timeLeft === 0 && (
        <div className="max-w-[1600px] w-full mx-auto px-4 sm:px-6 lg:px-12 mt-4 relative z-10">
          <div className="p-4 rounded-xl bg-[var(--color-danger)]/10 border border-[var(--color-danger)]/20 text-[var(--color-danger)] flex items-start gap-3 shadow-lg">
            <AlertTriangle className="w-5 h-5 flex-shrink-0 mt-0.5" />
            <p className="text-sm font-medium">
              Interview time has ended. You may finish answering the current question. No additional questions will be generated.
            </p>
          </div>
        </div>
      )}

      {/* Main Conversation Area — orchestrated by ConversationController */}
      <div className="flex-1 w-full mx-auto flex flex-col min-h-0 pt-16 relative z-10">
        <div className="flex-1 h-full overflow-hidden">
          <ConversationController
            currentQuestion={currentQuestion}
            currentIndex={currentIndex}
            totalQuestions={totalQuestions}
            answers={answers}
            isGenerating={isGenerating}
            submitting={submitting}
            isInterviewFinished={isInterviewFinished}
            voiceProps={voiceProps}
            handleAnswerChange={handleAnswerChange}
            isAutomaticMode={isAutomaticMode}
            onAnswerReady={handleNext}
          />
        </div>

        {/* Navigation - Hidden in AI Mode because progression is automatic */}
        {!isAutomaticMode && (
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
        )}
      </div>
    </div>
  );
};

const LiveInterviewPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [isFullscreenAlertOpen, setIsFullscreenAlertOpen] = useState(false);
  
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

  const isEndingRef = useRef(false);

  const handleEndInterview = useCallback(async () => {
    isEndingRef.current = true;
    const submitted = await handleSubmit(false);
    if (!submitted) {
      isEndingRef.current = false;
    }
  }, [handleSubmit]);

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

  // Also clear cache if interview completes and ensure fullscreen alert is closed
  useEffect(() => {
    if (isInterviewFinished) {
      isEndingRef.current = true;
      questionVoiceService.clearCache();
      setIsFullscreenAlertOpen(prev => (prev ? false : prev));
    }
  }, [isInterviewFinished]);

  useEffect(() => {
    const handleFullscreenChange = () => {
      if (!document.fullscreenElement && !isInterviewFinished && !isEndingRef.current) {
        setIsFullscreenAlertOpen(true);
      }
    };
    
    document.addEventListener("fullscreenchange", handleFullscreenChange);
    return () => {
      document.removeEventListener("fullscreenchange", handleFullscreenChange);
    };
  }, [isInterviewFinished]);

  const handleReturnToFullscreen = () => {
    setIsFullscreenAlertOpen(false);
    if (document.documentElement.requestFullscreen) {
      document.documentElement.requestFullscreen().catch(err => console.warn(err));
    }
  };

  const renderFullscreenAlert = () => {
    if (!isFullscreenAlertOpen) return null;
    return (
      <div className="fixed inset-0 z-[9999] bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
        <div className="bg-[var(--color-surface-container-low,#1e1e24)] border border-[var(--color-outline-variant,#333)] rounded-3xl max-w-md w-full p-8 shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 left-0 right-0 h-1 bg-[var(--color-warning)]"></div>
          <div className="w-16 h-16 rounded-2xl bg-[var(--color-warning)]/10 flex items-center justify-center mb-6 border border-[var(--color-warning)]/20 shadow-lg shadow-[var(--color-warning)]/10">
            <AlertTriangle className="w-8 h-8 text-[var(--color-warning)]" />
          </div>
          <h2 className="text-2xl font-black text-[var(--color-on-surface,#fff)] mb-3 uppercase tracking-tight">
            Full Screen Required
          </h2>
          <p className="text-sm text-[var(--color-on-surface-variant,#aaa)] mb-8 font-semibold leading-relaxed">
            This interview must strictly be taken in full screen. Exiting full screen is not permitted. Do you want to end the interview now or return to full screen?
          </p>
          <div className="flex flex-col gap-4">
            <Button onClick={handleReturnToFullscreen} className="w-full bg-[var(--color-primary-md3,var(--primary))] text-white py-6 font-black text-sm uppercase tracking-widest shadow-lg shadow-[var(--color-primary-md3)]/30 hover:bg-[var(--color-primary-md3)]/90">
              Return to Full Screen
            </Button>
            <Button variant="outline" onClick={handleEndInterview} className="w-full py-6 font-black text-sm uppercase tracking-widest border-[var(--color-error)] text-[var(--color-error)] hover:bg-[var(--color-error)]/10">
              End Interview
            </Button>
          </div>
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[var(--background)] flex items-center justify-center">
        <Loader2 className="w-10 h-10 animate-spin text-[var(--primary)]" />
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
          handleEndInterview={handleEndInterview}
          session={session}
        />
        {renderFullscreenAlert()}
      </InterviewRuntimeProvider>
    );
  }

  // ═══════════════════════════════════════════════
  // LEGACY STATIC INTERVIEW LAYOUT (unchanged functionally)
  // ═══════════════════════════════════════════════
  return (
    <div className="min-h-screen bg-[var(--background)] flex flex-col relative overflow-hidden font-sans pt-16">
      <div className="absolute inset-0 noise pointer-events-none z-0"></div>

      {/* Top Bar */}
      <div className="fixed top-0 left-0 right-0 h-16 bg-[var(--background-secondary)]/80 backdrop-blur-md border-b border-[var(--border)] flex items-center justify-between px-6 z-50">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-[var(--primary)]/10 border border-[var(--primary)]/20 flex items-center justify-center">
            <AlertTriangle className="w-4 h-4 text-[var(--primary)]" />
          </div>
          <span className="font-bold text-[var(--text-primary)]">{interview?.title}</span>
        </div>
        
        <Timer timeLeft={timeLeft} />
      </div>

      {/* Main Content */}
      <div className="flex-1 max-w-4xl w-full mx-auto p-4 sm:p-6 lg:p-8 flex flex-col mt-4 relative z-10">
        {timeLeft === 0 && (
          <div className="mb-6 p-4 rounded-xl bg-[var(--color-danger)]/10 border border-[var(--color-danger)]/20 text-[var(--color-danger)] flex items-start gap-3">
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
      {renderFullscreenAlert()}
    </div>
  );
};

export default LiveInterviewPage;
