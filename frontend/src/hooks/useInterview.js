import { useState, useEffect, useCallback } from "react";
import api from "../services/api";
import toast from "react-hot-toast";
import { saveInterview, restoreInterview, clearInterview } from "../utils/localStorage.js";

export const useInterview = (id, navigate, user) => {
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [questions, setQuestions] = useState([]);
  const [interview, setInterview] = useState(null);
  
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState({});
  const [timeLeft, setTimeLeft] = useState(0);

  const fetchInterviewData = useCallback(async () => {
    try {
      // 1. Fetch Interview Details (for duration and status check)
      const { data: detailData } = await api.get(`/interviews/${id}`);
      
      // 2. Validate Restoration
      const candidateStatus = detailData.interview.assignedCandidates?.find(
        (c) => c.email === user?.email
      )?.status;

      if (candidateStatus === "Completed") {
        clearInterview(id);
        toast.error("This interview has already been completed.");
        navigate("/candidate/dashboard");
        return;
      }

      // 3. Fetch Questions
      const { data: qData } = await api.get(`/interviews/${id}/questions`);
      
      if (detailData.success && qData.success) {
        setInterview(detailData.interview);
        setQuestions(qData.questions);
        
        // Restore state
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
        if (prev <= 1) {
          clearInterval(timer);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [loading]);

  // LocalStorage Sync
  useEffect(() => {
    if (loading) return;
    saveInterview(id, {
      currentIndex,
      answers,
      timeLeft
    });
  }, [id, currentIndex, answers, timeLeft, loading]);

  // Navigation handlers
  const handleNext = () => {
    if (currentIndex < questions.length - 1) {
      setCurrentIndex(prev => prev + 1);
    }
  };

  const handlePrev = () => {
    if (currentIndex > 0) {
      setCurrentIndex(prev => prev - 1);
    }
  };

  const handleAnswerChange = (questionId, value) => {
    setAnswers(prev => ({ ...prev, [questionId]: value }));
  };

  const handleSubmit = async () => {
    if (!window.confirm("Are you sure you want to submit your interview? You cannot undo this action.")) return;
    
    setSubmitting(true);
    try {
      const { data } = await api.post(`/interviews/${id}/submit`);
      if (data.success) {
        toast.success("Interview submitted successfully!");
        clearInterview(id);
        
        if (document.fullscreenElement) {
          document.exitFullscreen().catch(err => console.warn(err));
        }

        navigate("/candidate/dashboard");
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to submit interview");
      setSubmitting(false);
    }
  };

  return {
    loading,
    submitting,
    interview,
    questions,
    currentQuestion: questions[currentIndex],
    currentIndex,
    totalQuestions: questions.length,
    answers,
    timeLeft,
    handleNext,
    handlePrev,
    handleAnswerChange,
    handleSubmit
  };
};
