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
    <div className="bg-[var(--background)] min-h-screen w-full font-['Inter'] flex flex-col items-center justify-center p-4 overflow-hidden">
      <div className="w-full max-w-4xl">

        <button
          onClick={() => navigate('/candidate/dashboard')}
          className="inline-flex items-center gap-2 px-3 py-1.5 bg-[var(--color-surface-variant)]/50 hover:bg-[var(--color-surface-variant)] text-[var(--color-on-surface)] rounded-lg text-[10px] font-black uppercase tracking-widest transition-colors border border-[var(--color-outline-variant)]/30 mb-4"
        >
          <ArrowLeft className="w-3 h-3" />
          Back
        </button>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-[var(--color-surface-container-low)] border border-[var(--color-outline-variant)]/30 rounded-3xl shadow-2xl relative overflow-hidden"
        >
          {/* Subtle top accent bar */}
          <div className="absolute top-0 left-0 right-0 h-1 bg-[var(--color-primary-md3)]"></div>

          <div className="p-6 sm:p-8">

            <div className="text-center mb-6">
              <h1 className="text-2xl sm:text-3xl font-black text-[var(--color-on-surface)] mb-4 tracking-tight uppercase">
                {interview.title}
              </h1>
              <div className="flex flex-wrap items-center justify-center gap-3">
                <span className="px-3 py-1.5 text-[10px] font-black uppercase tracking-widest bg-[var(--color-surface-container-highest)]/50 border border-[var(--color-outline-variant)]/30 rounded-full flex items-center gap-2 text-[var(--color-on-surface-variant)]">
                  <Briefcase className="w-3.5 h-3.5" />
                  {interview.jobRole}
                </span>
                {interview.employer && (
                  <span className="px-3 py-1.5 text-[10px] font-black uppercase tracking-widest bg-[var(--color-surface-container-highest)]/50 border border-[var(--color-outline-variant)]/30 rounded-full flex items-center gap-2 text-[var(--color-on-surface-variant)]">
                    <Building2 className="w-3.5 h-3.5" />
                    {interview.employer.name}
                  </span>
                )}
              </div>
            </div>

            {/* Info Cards */}
            <div className="grid grid-cols-2 gap-3 mb-6">
              <div className="bg-[var(--color-surface-container-highest)]/20 rounded-2xl p-4 flex flex-col items-center justify-center text-center border border-[var(--color-outline-variant)]/30">
                <Clock className="w-5 h-5 text-[var(--color-warning)] mb-2" />
                <p className="text-[10px] font-black uppercase tracking-widest text-[var(--color-on-surface-variant)] mb-1">Duration</p>
                <p className="text-xl font-black text-[var(--color-on-surface)]">{interview.duration} Min</p>
              </div>
              <div className="bg-[var(--color-surface-container-highest)]/20 rounded-2xl p-4 flex flex-col items-center justify-center text-center border border-[var(--color-outline-variant)]/30">
                <Tag className="w-5 h-5 text-[var(--color-tertiary)] mb-2" />
                <p className="text-[10px] font-black uppercase tracking-widest text-[var(--color-on-surface-variant)] mb-1">Experience</p>
                <p className="text-xl font-black text-[var(--color-on-surface)] uppercase">{interview.experienceLevel}</p>
              </div>
            </div>

            <div className="space-y-6">

              {interview.description && (
                <div>
                  <h3 className="text-[10px] font-black text-[var(--color-on-surface)] uppercase tracking-widest mb-2">About this Interview</h3>
                  <div className="bg-[var(--color-surface-variant)]/30 rounded-2xl p-4 border-l-4 border-[var(--color-primary-md3)]">
                    <p className="text-[var(--color-on-surface-variant)] text-xs leading-relaxed font-semibold line-clamp-3">
                      {interview.description}
                    </p>
                  </div>
                </div>
              )}

              <div>
                <h3 className="text-[10px] font-black text-[var(--color-on-surface)] uppercase tracking-widest mb-2 flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 text-[var(--color-warning)]" />
                  Instructions
                </h3>
                <div className="bg-[var(--color-warning)]/5 rounded-2xl p-4 border border-[var(--color-warning)]/20">
                  <ul className="space-y-3 text-[var(--color-on-surface-variant)] text-xs font-semibold">
                    <li className="flex items-start gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-[var(--color-warning)] mt-1.5 flex-shrink-0"></span>
                      <p className="leading-relaxed">Ensure a stable internet connection, webcam, and microphone.</p>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-[var(--color-warning)] mt-1.5 flex-shrink-0"></span>
                      <p className="leading-relaxed">You cannot pause or restart the interview once it begins.</p>
                    </li>
                    {interview.instructions && (
                      <li className="flex items-start gap-2">
                        <span className="w-1.5 h-1.5 rounded-full bg-[var(--color-warning)] mt-1.5 flex-shrink-0"></span>
                        <p className="leading-relaxed text-[var(--color-on-surface)] line-clamp-2">{interview.instructions}</p>
                      </li>
                    )}
                  </ul>
                </div>
              </div>

              {/* Start Action */}
              <div className="pt-6 border-t border-[var(--color-outline-variant)]/30 flex flex-col items-center justify-center">
                {isInactive ? (
                  <div className="mb-4 px-3 py-1.5 text-[10px] font-black uppercase tracking-widest bg-[var(--color-error)]/10 text-[var(--color-error)] border border-[var(--color-error)]/20 rounded-lg">
                    This interview is no longer active.
                  </div>
                ) : hasAttempted ? (
                  <div className="mb-4 px-3 py-1.5 text-[10px] font-black uppercase tracking-widest bg-[var(--color-warning)]/10 text-[var(--color-warning)] border border-[var(--color-warning)]/20 rounded-lg">
                    You have already started or completed this interview.
                  </div>
                ) : null}

                <button
                  onClick={() => navigate(`/candidate/interviews/${id}/start`)}
                  disabled={isInactive || hasAttempted}
                  className="w-full sm:w-auto px-8 py-3 bg-[var(--color-primary-md3)] text-white rounded-xl text-xs font-black uppercase tracking-widest hover:bg-[var(--color-primary-md3)]/90 transition-all shadow-lg shadow-[var(--color-primary-md3)]/30 flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed group"
                >
                  <Play className="w-4 h-4 mr-2 fill-current group-hover:scale-110 transition-transform" />
                  Continue to System Checks
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
