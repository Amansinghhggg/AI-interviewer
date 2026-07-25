import { ChevronRight, Check, Loader2 } from "lucide-react";

const Navigation = ({ 
  currentIndex, 
  totalQuestions, 
  isInterviewFinished,
  isTimeUp,
  isAi,
  handleNext, 
  handleSubmit, 
  submitting,
  generating,
  hasAnswer
}) => {
  const isLastQuestion = currentIndex === totalQuestions - 1;
  const isCompleteButton = isLastQuestion || isInterviewFinished || isTimeUp;
  
  // Dynamic button logic
  const isDisabled = submitting || generating || (!hasAnswer && !isCompleteButton && !isTimeUp);
  
  const getButtonText = () => {
    if (submitting || generating) return isCompleteButton ? "Submitting..." : "Generating...";
    if (!hasAnswer && !isCompleteButton && !isTimeUp) return "Complete your answer";
    if (isCompleteButton) return "Submit Interview";
    return "Next Question →";
  };

  return (
    <div className="flex items-center justify-end">
      <button
        onClick={isCompleteButton ? (isAi ? handleNext : handleSubmit) : handleNext}
        disabled={isDisabled}
        className={`px-8 py-3.5 rounded-2xl font-semibold transition-all shadow-lg flex items-center gap-3
          ${isDisabled 
            ? 'bg-dark-800 text-dark-400 cursor-not-allowed border border-dark-700 shadow-none' 
            : isCompleteButton 
              ? 'bg-success-600 hover:bg-success-500 text-white shadow-success-500/20'
              : 'bg-primary-600 hover:bg-primary-500 text-white shadow-primary-500/20'
          }`}
      >
        {(submitting || generating) ? (
          <Loader2 className="w-5 h-5 animate-spin" />
        ) : isCompleteButton ? (
          <Check className="w-5 h-5" />
        ) : null}
        
        {getButtonText()}
      </button>
    </div>
  );
};

export default Navigation;
