import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import api from "../../services/api";
import toast from "react-hot-toast";
import {
  ArrowLeft,
  Loader2,
  Clock,
  Tag,
  Play,
  Briefcase,
  Building2,
  AlertCircle
} from "lucide-react";
import { motion } from "framer-motion";

const InterviewInstructionsPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [interview, setInterview] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchInterview = async () => {
    try {
      const { data } = await api.get(`/interviews/${id}`);
      if (data.success) {
        setInterview(data.interview);
      }
    } catch (error) {
      toast.error("Failed to load interview details");
      navigate("/candidate/dashboard");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInterview();
  }, [id]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-32">
        <Loader2 className="w-8 h-8 animate-spin text-[var(--color-primary-md3)]" />
      </div>
    );
  }

  if (!interview) return null;

  const isInactive = interview.status !== "active";
  const hasAttempted = interview.assignedCandidates?.find(c => c.email === user?.email)?.status !== "Pending";

  return (
    <div className="bg-transparent w-full font-['Inter'] flex items-center justify-center p-4 py-12">
      <div className="w-full max-w-4xl">
        
        <button
          onClick={() => navigate(-1)}
          className="inline-flex items-center gap-2 px-4 py-2 bg-[var(--color-surface-variant)]/50 hover:bg-[var(--color-surface-variant)] text-[var(--color-on-surface)] rounded-xl text-xs font-black uppercase tracking-widest transition-colors border border-[var(--color-outline-variant)]/30 mb-8"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Dashboard
        </button>

        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-[var(--color-surface-container-low)] border border-[var(--color-outline-variant)]/30 rounded-3xl shadow-2xl relative overflow-hidden"
        >
          {/* Subtle top accent bar */}
          <div className="absolute top-0 left-0 right-0 h-1 bg-[var(--color-primary-md3)]"></div>

          <div className="p-8 sm:p-12">
            
            <div className="text-center mb-12">
              <h1 className="text-3xl sm:text-4xl font-black text-[var(--color-on-surface)] mb-6 tracking-tight uppercase">
                {interview.title}
              </h1>
              <div className="flex flex-wrap items-center justify-center gap-4">
                <span className="px-4 py-2 text-[10px] font-black uppercase tracking-widest bg-[var(--color-surface-container-highest)]/50 border border-[var(--color-outline-variant)]/30 rounded-full flex items-center gap-2 text-[var(--color-on-surface-variant)]">
                  <Briefcase className="w-3.5 h-3.5" />
                  {interview.jobRole}
                </span>
                {interview.employer && (
                  <span className="px-4 py-2 text-[10px] font-black uppercase tracking-widest bg-[var(--color-surface-container-highest)]/50 border border-[var(--color-outline-variant)]/30 rounded-full flex items-center gap-2 text-[var(--color-on-surface-variant)]">
                    <Building2 className="w-3.5 h-3.5" />
                    {interview.employer.name}
                  </span>
                )}
              </div>
            </div>

            {/* Info Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-12">
              <div className="bg-[var(--color-surface-container-highest)]/20 rounded-2xl p-6 flex flex-col items-center justify-center text-center border border-[var(--color-outline-variant)]/30">
                <Clock className="w-8 h-8 text-[var(--color-warning)] mb-3" />
                <p className="text-[10px] font-black uppercase tracking-widest text-[var(--color-on-surface-variant)] mb-1">Duration</p>
                <p className="text-2xl font-black text-[var(--color-on-surface)]">{interview.duration} Minutes</p>
              </div>
              <div className="bg-[var(--color-surface-container-highest)]/20 rounded-2xl p-6 flex flex-col items-center justify-center text-center border border-[var(--color-outline-variant)]/30">
                <Tag className="w-8 h-8 text-[var(--color-tertiary)] mb-3" />
                <p className="text-[10px] font-black uppercase tracking-widest text-[var(--color-on-surface-variant)] mb-1">Experience Level</p>
                <p className="text-2xl font-black text-[var(--color-on-surface)] uppercase">{interview.experienceLevel}</p>
              </div>
            </div>

            <div className="space-y-10">
              
              {interview.description && (
                <div>
                  <h3 className="text-sm font-black text-[var(--color-on-surface)] uppercase tracking-widest mb-4">About this Interview</h3>
                  <div className="bg-[var(--color-surface-variant)]/30 rounded-2xl p-6 border-l-4 border-[var(--color-primary-md3)]">
                    <p className="text-[var(--color-on-surface-variant)] text-sm leading-relaxed font-semibold">
                      {interview.description}
                    </p>
                  </div>
                </div>
              )}

              <div>
                <h3 className="text-sm font-black text-[var(--color-on-surface)] uppercase tracking-widest mb-4 flex items-center gap-3">
                  <AlertCircle className="w-5 h-5 text-[var(--color-warning)]" />
                  Instructions
                </h3>
                <div className="bg-[var(--color-warning)]/5 rounded-2xl p-6 border border-[var(--color-warning)]/20">
                  <ul className="space-y-4 text-[var(--color-on-surface-variant)] text-sm font-semibold">
                    <li className="flex items-start gap-3">
                      <span className="w-2 h-2 rounded-full bg-[var(--color-warning)] mt-1.5 flex-shrink-0"></span>
                      <p className="leading-relaxed">Ensure you have a stable internet connection, working webcam, and microphone before starting.</p>
                    </li>
                    <li className="flex items-start gap-3">
                      <span className="w-2 h-2 rounded-full bg-[var(--color-warning)] mt-1.5 flex-shrink-0"></span>
                      <p className="leading-relaxed">Find a quiet environment with good lighting.</p>
                    </li>
                    <li className="flex items-start gap-3">
                      <span className="w-2 h-2 rounded-full bg-[var(--color-warning)] mt-1.5 flex-shrink-0"></span>
                      <p className="leading-relaxed">You cannot pause or restart the interview once it begins.</p>
                    </li>
                    {interview.instructions && (
                      <li className="flex items-start gap-3">
                        <span className="w-2 h-2 rounded-full bg-[var(--color-warning)] mt-1.5 flex-shrink-0"></span>
                        <p className="leading-relaxed text-[var(--color-on-surface)]">{interview.instructions}</p>
                      </li>
                    )}
                  </ul>
                </div>
              </div>

              {/* Start Action */}
              <div className="pt-10 border-t border-[var(--color-outline-variant)]/30 flex flex-col items-center justify-center">
                {isInactive ? (
                  <div className="mb-6 px-4 py-2 text-xs font-black uppercase tracking-widest bg-[var(--color-error)]/10 text-[var(--color-error)] border border-[var(--color-error)]/20 rounded-lg">
                    This interview is no longer active.
                  </div>
                ) : hasAttempted ? (
                  <div className="mb-6 px-4 py-2 text-xs font-black uppercase tracking-widest bg-[var(--color-warning)]/10 text-[var(--color-warning)] border border-[var(--color-warning)]/20 rounded-lg">
                    You have already started or completed this interview.
                  </div>
                ) : null}
                
                <button
                  onClick={() => navigate(`/candidate/interviews/${id}/start`)}
                  disabled={isInactive || hasAttempted}
                  className="w-full sm:w-auto px-12 py-5 bg-[var(--color-primary-md3)] text-white rounded-xl text-sm font-black uppercase tracking-widest hover:bg-[var(--color-primary-md3)]/90 transition-all shadow-lg shadow-[var(--color-primary-md3)]/30 flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed group"
                >
                  <Play className="w-5 h-5 mr-3 fill-current group-hover:scale-110 transition-transform" />
                  Start Interview Now
                </button>
              </div>

            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default InterviewInstructionsPage;
