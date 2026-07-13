import { ChevronLeft, ChevronRight, Check, Loader2 } from "lucide-react";

const Navigation = ({ 
  currentIndex, 
  totalQuestions, 
  handlePrev, 
  handleNext, 
  handleSubmit, 
  submitting,
  generating
}) => {
  return (
    <div className="flex items-center justify-between mt-8 pt-6 border-t border-dark-800">
      <button
        onClick={handlePrev}
        disabled={currentIndex === 0}
        className="px-6 py-3 rounded-xl bg-dark-800 text-dark-100 font-medium hover:bg-dark-700 transition-colors flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed border border-dark-700"
      >
        <ChevronLeft className="w-5 h-5" />
        Previous
      </button>
      
      {currentIndex === totalQuestions - 1 ? (
        <button
          onClick={handleSubmit}
          disabled={submitting}
          className="px-8 py-3 rounded-xl bg-success-600 text-white font-bold hover:bg-success-500 transition-colors shadow-lg shadow-success-500/20 flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {submitting ? <Loader2 className="w-5 h-5 animate-spin" /> : <Check className="w-5 h-5" />}
          {submitting ? "Submitting..." : "Submit Interview"}
        </button>
      ) : (
        <button
          onClick={handleNext}
          disabled={generating}
          className="px-6 py-3 rounded-xl bg-primary-600 text-white font-medium hover:bg-primary-500 transition-colors shadow-lg shadow-primary-500/20 flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {generating ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              Generating...
            </>
          ) : (
            <>
              Next
              <ChevronRight className="w-5 h-5" />
            </>
          )}
        </button>
      )}
    </div>
  );
};

export default Navigation;
