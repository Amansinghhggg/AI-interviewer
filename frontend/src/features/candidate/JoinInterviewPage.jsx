import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import api from "../../services/api";
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
    <div className="min-h-screen bg-[var(--color-bg-base)] pt-24 pb-12 flex items-center justify-center p-4 relative overflow-hidden">
      {/* Background Noise & Glows */}
      <div className="absolute inset-0 noise pointer-events-none z-0"></div>
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-[var(--color-accent-teal-glow)] rounded-full blur-[150px] opacity-20 pointer-events-none z-0 animate-pulse-glow"></div>

      <div className="w-full max-w-md relative z-10">
        <button
          onClick={() => navigate(-1)}
          className="inline-flex items-center gap-2 text-[var(--color-text-secondary)] hover:text-white transition-colors mb-6 font-medium"
        >
          <ArrowLeft className="w-4 h-4" />
          Back
        </button>

        <div className="surface-elevated p-10 text-center animate-fade-in-up shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-[var(--color-accent-teal)] to-[var(--color-accent-blue)]"></div>
          
          <div className="w-16 h-16 rounded-2xl bg-[rgba(45,212,191,0.15)] flex items-center justify-center mx-auto mb-6 border border-[rgba(45,212,191,0.3)] shadow-[var(--color-accent-teal-glow)] shadow-lg">
            <Key className="w-8 h-8 text-[var(--color-accent-teal)]" />
          </div>
          
          <h1 className="text-3xl font-bold text-white mb-3 tracking-tight">Join an Interview</h1>
          <p className="text-[var(--color-text-secondary)] mb-8">
            Enter the unique interview code provided by your employer.
          </p>

          <form onSubmit={handleJoin} className="space-y-6">
            <div>
              <input
                type="text"
                value={code}
                onChange={(e) => setCode(e.target.value.toUpperCase())}
                placeholder="Enter Interview Code"
                className="input-field w-full px-4 py-4 text-center text-xl font-mono tracking-widest uppercase focus:border-[var(--color-accent-teal)] focus:shadow-[0_0_0_1px_var(--color-accent-teal)]"
                autoComplete="off"
              />
            </div>
            
            <button
              type="submit"
              disabled={isLoading || !code.trim()}
              className="btn-primary w-full py-4 text-lg flex items-center justify-center gap-2 group/btn shadow-[var(--color-accent-teal-glow)] shadow-xl bg-gradient-to-r from-[var(--color-accent-teal)] to-[var(--color-accent-blue)]"
            >
              {isLoading ? (
                <Loader2 className="w-6 h-6 animate-spin" />
              ) : (
                <>
                  Join Interview
                  <ArrowRight className="w-5 h-5 transition-transform group-hover/btn:translate-x-1" />
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
