import { useState, useEffect, useCallback, useRef } from "react";
import api from "../services/api";
import toast from "react-hot-toast";
import { saveInterview, restoreInterview, clearInterview } from "../utils/localStorage.js";
import { withRetry } from "../utils/retryUtility";
import { runtimeDiagnostics } from "../utils/diagnostics";

export const useInterview = (id, navigate, user) => {
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false); // Used when waiting for Gemini

  const [questions, setQuestions] = useState([]);
  const [interview, setInterview] = useState(null);

  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState({});
  const [timeLeft, setTimeLeft] = useState(0);
  const [isAi, setIsAi] = useState(false);
  const [session, setSession] = useState(null); // Backend session for AI interviews
  const [isInterviewFinished, setIsInterviewFinished] = useState(false);

  const fetchInterviewData = useCallback(async () => {
    try {
      // 1. Fetch Interview Details
      const { data: detailData } = await api.get(`/interviews/${id}`);

      const candidateStatus = detailData.interview.assignedCandidates?.find(
        (c) => c.email === user?.email
      )?.status;

      if (candidateStatus === "Completed") {
        clearInterview(id);
        toast.error("This interview has already been completed.");
        navigate("/candidate/dashboard");
        return;
      }

      setInterview(detailData.interview);

      // Determine if it's AI driven
      // Check the global backend process env or the specific interview type
      const aiType = detailData.interview.interviewType === "gemini" || detailData.interview.interviewType === "ai";
      // To be safe we assume AI if type is gemini/ai, or we can just try to fetch the session.
      // We will try fetching the session first.

      let aiSessionData = null;
      try {
        const { data } = await api.get(`/interviews/${id}/session`);
        if (data.success) {
          aiSessionData = data;
        }
      } catch (err) {
        // If 404, it might mean the session doesn't exist yet, or it's a static interview.
      }

      if (aiSessionData || aiType) {
        setIsAi(true);
        // It's an AI interview
        let activeSession = aiSessionData?.session;

        // If no active session, start one
        if (!activeSession) {
          const { data: startData } = await api.post(`/interviews/${id}/start`);
          if (startData.success) {
            activeSession = startData.session;
          }
        }

        if (activeSession) {
          setSession(activeSession);
          setQuestions(activeSession.questions);
          setCurrentIndex(activeSession.currentQuestionIndex);

          // Reconstruct answers map for the UI
          const currentAnswers = {};
          activeSession.questions.forEach(q => {
            if (q.answer) {
              currentAnswers[q.id] = q.answer;
            }
          });

          // Merge with any local draft they might have been typing
          const restored = restoreInterview(id);
          // Only restore if it matches the current session ID to prevent cross-session state bleed
          if (restored && restored.answers && (restored.sessionId === activeSession._id)) {
            setAnswers({ ...currentAnswers, ...restored.answers });
          } else {
            setAnswers(currentAnswers);
          }

          // Compute remaining time accurately from backend expiresAt
          if (activeSession.expiresAt) {
            const remainingMs = new Date(activeSession.expiresAt).getTime() - Date.now();
            setTimeLeft(Math.max(0, Math.floor(remainingMs / 1000)));
          } else {
            setTimeLeft(detailData.interview.duration * 60);
          }
        }

      } else {
        // Legacy Static Flow
        const { data: qData } = await api.get(`/interviews/${id}/questions`);
        setQuestions(qData.questions);

        const restored = restoreInterview(id);
        if (restored) {
          setCurrentIndex(restored.currentIndex || 0);
          setAnswers(restored.answers || {});
          setTimeLeft(restored.timeLeft || detailData.interview.duration * 60);
        } else {
          setTimeLeft(detailData.interview.duration * 60);
        }
      }
    } catch (error) {
      toast.error("Failed to load interview data");
      navigate("/candidate/dashboard");
    } finally {
      setLoading(false);
    }
  }, [id, navigate, user?.email]);

  useEffect(() => {
    fetchInterviewData();
  }, [fetchInterviewData]);

  // Timer
  useEffect(() => {
    if (loading) return;

    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= -60) {
          clearInterval(timer);
          return -60;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [loading]);

  // Grace Period and Auto-Submit
  useEffect(() => {
    if (loading || isInterviewFinished) return;

    if (timeLeft === 0) {
      toast.error("Interview time is over! You have 1 minute to finish your final answer, or it will auto-submit.", { duration: 6000 });
    } else if (timeLeft === -60) {
      toast.error("Time is up! Auto-submitting interview...");
      handleSubmit(true);
    }
  }, [timeLeft, loading, isInterviewFinished]);

  // LocalStorage Sync (only for draft UI states now, backend is truth for AI)
  useEffect(() => {
    if (loading || isInterviewFinished) return;
    saveInterview(id, {
      sessionId: session?._id,
      currentIndex,
      answers, // stores draft text if they refresh before hitting next
      timeLeft
    });
  }, [id, currentIndex, answers, timeLeft, loading, isInterviewFinished, session]);

  const isSubmittingRef = useRef(false);

  const handleNext = async (overrideAnswer) => {
    const currentQ = questions[currentIndex];

    if (isAi && currentIndex === questions.length - 1) {
      // It's an AI interview and we are on the latest question.

      // Prevent duplicate submissions via synchronous ref lock
      if (isSubmittingRef.current || isGenerating) {
        runtimeDiagnostics("RecoveryStarted", { context: "DUPLICATE_SUBMISSION_PREVENTED" });
        return;
      }

      // We must submit the answer to get the next question.
      const answerText = overrideAnswer !== undefined ? overrideAnswer : (answers[currentQ.id] || "");
      if (!answerText.trim() && timeLeft > 0) {
        toast.error("Please provide an answer before moving forward.");
        return;
      }

      isSubmittingRef.current = true;
      setIsGenerating(true);
      let submissionToastId = null;

      try {
        const { data } = await withRetry({
          operation: () => api.post(`/interviews/${id}/answer`, { answer: answerText }),
          maxRetries: 3,
          retryDelay: 1500,
          shouldRetry: (error) => {
            // Only retry 5xx or network errors. Don't retry 400 Bad Request
            if (error.response && error.response.status < 500) return false;
            return true;
          },
          onRetry: (error, attempt) => {
            runtimeDiagnostics("RecoveryStarted", { context: "SUBMISSION_RETRY", attempt, error });
            if (!submissionToastId) {
              submissionToastId = toast.loading(`Network unstable. Saving answer (${attempt}/3)...`);
            } else {
              toast.loading(`Network unstable. Saving answer (${attempt}/3)...`, { id: submissionToastId });
            }
          },
          onSuccess: (result, attempt) => {
            if (attempt > 0) {
              runtimeDiagnostics("RecoverySucceeded", { context: "SUBMISSION_RETRY", attempt });
            }
          },
          onFailure: (error, attempt) => {
            runtimeDiagnostics("RecoveryFailed", { context: "SUBMISSION_FAILED_FINAL", attempt, error });
          }
        });

        if (submissionToastId) toast.dismiss(submissionToastId);

        if (data.success) {
          setSession(data.session);
          setQuestions(data.session.questions);
          setCurrentIndex(data.session.currentQuestionIndex);

          if (data.isFinished) {
            setIsInterviewFinished(true);
            toast.success("All questions completed. Submitting interview...");
            handleSubmit(true);
          }
        }
      } catch (error) {
        if (submissionToastId) toast.dismiss(submissionToastId);
        toast.error(error.response?.data?.message || "Failed to generate next question after multiple attempts.");
      } finally {
        isSubmittingRef.current = false;
        setIsGenerating(false);
      }
    } else {
      // Normal UI navigation
      if (currentIndex < questions.length - 1) {
        setCurrentIndex(prev => prev + 1);
      }
    }
  };

  const handlePrev = () => {
    if (currentIndex > 0) {
      setCurrentIndex(prev => prev - 1);
    }
  };

  const handleAnswerChange = useCallback((questionId, value) => {
    setAnswers(prev => ({ ...prev, [questionId]: value }));
  }, []);

  const handleSubmit = useCallback(async (force = false) => {
    if (!force && !window.confirm("Are you sure you want to submit your interview? You cannot undo this action.")) return false;

    setSubmitting(true);
    try {
      const { data } = await api.post(`/interviews/${id}/submit`);
      if (data.success) {
        toast.success("Interview submitted successfully!");
        clearInterview(id);

        if (document.fullscreenElement) {
          document.exitFullscreen().catch(err => console.warn(err));
        }

        // Set finished so the view layer can take over, process video, and show upload screen
        setIsInterviewFinished(true);
        return true;
      }
      return false;
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to submit interview");
      setSubmitting(false);
      return false;
    }
  }, [id]);

  return {
    loading,
    submitting,
    isGenerating,
    interview,
    questions,
    currentQuestion: questions[currentIndex],
    currentIndex,
    totalQuestions: isAi ? 10 : questions.length,
    answers,
    timeLeft,
    isInterviewFinished,
    isAi,
    session,
    handleNext,
    handlePrev,
    handleAnswerChange,
    handleSubmit
  };
};
