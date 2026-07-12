import { useNavigate } from "react-router-dom";
import { Sparkles, ArrowLeft } from "lucide-react";

const StartInterviewPlaceholder = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-dark-900 pt-20 flex flex-col items-center justify-center p-4 text-center">
      <div className="glass-light rounded-3xl p-10 max-w-lg w-full animate-fade-in-up">
        <div className="w-20 h-20 rounded-full bg-primary-500/10 flex items-center justify-center mx-auto mb-6">
          <Sparkles className="w-10 h-10 text-primary-400" />
        </div>
        <h1 className="text-3xl font-bold text-dark-50 mb-4">Phase 2 Completed!</h1>
        <p className="text-dark-300 text-lg mb-8 leading-relaxed">
          The interview management module is complete. In Phase 3, this page will host the actual AI interview experience.
        </p>
        <button
          onClick={() => navigate("/candidate/dashboard")}
          className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-dark-800 text-dark-100 hover:text-white hover:bg-dark-700 transition-all font-medium border border-dark-600"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Dashboard
        </button>
      </div>
    </div>
  );
};

export default StartInterviewPlaceholder;
