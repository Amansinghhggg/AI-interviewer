import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import api from "../services/api";
import toast from "react-hot-toast";
import { ArrowLeft, Key, Loader2, ArrowRight } from "lucide-react";

const JoinInterviewPage = () => {
  const navigate = useNavigate();
  const [code, setCode] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleJoin = async (e) => {
    e.preventDefault();
    if (!code.trim()) {
      toast.error("Please enter an interview code");
      return;
    }

    setIsLoading(true);
    try {
      const { data } = await api.post("/interviews/join", {
        interviewCode: code.trim(),
      });
      if (data.success) {
        toast.success("Successfully joined the interview!");
        navigate(`/candidate/interviews/${data.interview._id}`);
      }
    } catch (error) {
      toast.error(
        error.response?.data?.message || "Failed to join interview. Please check your code."
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-dark-900 pt-20 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <Link
          to="/candidate/dashboard"
          className="inline-flex items-center gap-2 text-dark-400 hover:text-dark-200 transition-colors mb-6"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Dashboard
        </Link>

        <div className="glass-light rounded-2xl p-8 text-center animate-fade-in-up">
          <div className="w-16 h-16 rounded-2xl bg-accent-500/10 flex items-center justify-center mx-auto mb-6">
            <Key className="w-8 h-8 text-accent-400" />
          </div>
          <h1 className="text-2xl font-bold text-dark-50 mb-2">Join an Interview</h1>
          <p className="text-dark-400 mb-8">
            Enter the unique interview code provided by your employer.
          </p>

          <form onSubmit={handleJoin} className="space-y-4">
            <div>
              <input
                type="text"
                value={code}
                onChange={(e) => setCode(e.target.value.toUpperCase())}
                placeholder="Enter Interview Code"
                className="w-full px-4 py-4 rounded-xl bg-dark-800/80 border border-dark-600 text-dark-50 placeholder-dark-500 focus:outline-none focus:border-accent-500 focus:ring-1 focus:ring-accent-500/50 transition-all text-center text-xl font-mono tracking-widest uppercase"
                autoComplete="off"
              />
            </div>
            
            <button
              type="submit"
              disabled={isLoading || !code.trim()}
              className="w-full py-4 rounded-xl bg-gradient-to-r from-accent-600 to-accent-500 text-white font-semibold hover:from-accent-500 hover:to-accent-400 transition-all duration-300 shadow-lg shadow-accent-500/20 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 group/btn"
            >
              {isLoading ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <>
                  Join Interview
                  <ArrowRight className="w-5 h-5 transition-transform group-hover/btn:translate-x-0.5" />
                </>
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default JoinInterviewPage;
