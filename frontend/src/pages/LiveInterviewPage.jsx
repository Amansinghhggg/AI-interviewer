import { useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { AlertTriangle, Loader2 } from "lucide-react";
import { useInterview } from "../hooks/useInterview";

// Components
import QuestionCard from "../components/Interview/QuestionCard";
import ProgressBar from "../components/Interview/ProgressBar";
import Timer from "../components/Interview/Timer";
import Navigation from "../components/Interview/Navigation";
import AnswerBox from "../components/Interview/AnswerBox";

const LiveInterviewPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  
  const {
    loading,
    submitting,
    isGenerating,
    interview,
    currentQuestion,
    currentIndex,
    totalQuestions,
    answers,
    timeLeft,
    isInterviewFinished,
    handleNext,
    handlePrev,
    handleAnswerChange,
    handleSubmit
  } = useInterview(id, navigate, user);

  useEffect(() => {
    const handleBeforeUnload = (e) => {
      e.preventDefault();
      e.returnValue = "Are you sure you want to leave? Your progress will be saved locally, but it is recommended to complete the interview in one sitting.";
    };
    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-dark-900 flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary-400" />
      </div>
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
