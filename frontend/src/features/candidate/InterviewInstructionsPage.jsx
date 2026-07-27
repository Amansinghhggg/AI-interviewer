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
  AlertCircle,
  BookOpen
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
    <div className="bg-[var(--background)] h-screen w-full font-['Inter'] flex flex-col items-center justify-center p-2 sm:p-4 overflow-hidden">
      <div className="w-full max-w-4xl max-h-full flex flex-col justify-center">

        <button
          onClick={() => navigate('/candidate/dashboard')}
          className="inline-flex items-center gap-2 px-3 py-1 bg-[var(--color-surface-variant)]/50 hover:bg-[var(--color-surface-variant)] text-[var(--color-on-surface)] rounded-lg text-[9px] font-black uppercase tracking-widest transition-colors border border-[var(--color-outline-variant)]/30 mb-2 self-start"
        >
          <ArrowLeft className="w-3 h-3" />
          Back
        </button>

        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-[var(--color-surface-container-low)] border border-[var(--color-outline-variant)]/30 rounded-3xl relative overflow-hidden shadow-2xl"
        >
          <div className="p-4 sm:p-6">

            <div className="text-center mb-4">
              <h1 className="text-2xl sm:text-3xl font-black text-[var(--color-on-surface)] mb-2 tracking-tight uppercase">
                {interview.employer?.name || interview.title}
              </h1>
              <div className="flex flex-wrap items-center justify-center gap-2">
                <span className="px-3 py-1 text-[9px] font-black uppercase tracking-widest bg-[var(--color-surface-container-highest)]/30 border border-[var(--color-outline-variant)]/30 rounded-full flex items-center gap-1.5 text-[var(--color-on-surface)]">
                  <Briefcase className="w-3 h-3" />
                  {interview.jobRole}
                </span>
                <button className="w-6 h-6 flex items-center justify-center rounded-full bg-[var(--color-surface-container-highest)]/30 border border-[var(--color-outline-variant)]/30 text-[var(--color-on-surface-variant)] hover:text-[var(--color-on-surface)] transition-colors">
                  <BookOpen className="w-3 h-3" />
                </button>
              </div>
            </div>

            {/* Info Cards */}
            <div className="grid grid-cols-2 gap-3 mb-4">
              <div className="bg-[var(--color-surface-container-highest)]/20 rounded-2xl p-3 flex flex-col items-center justify-center text-center border-l-2 border-l-[var(--color-warning)] border-t border-b border-r border-[var(--color-outline-variant)]/20 shadow-sm relative overflow-hidden">
                <Clock className="w-4 h-4 text-[var(--color-warning)] mb-1" />
                <p className="text-[9px] font-black uppercase tracking-widest text-[var(--color-on-surface-variant)] mb-0.5">Duration</p>
                <p className="text-base font-black text-[var(--color-on-surface)]">{interview.duration} Min</p>
              </div>
              <div className="bg-[var(--color-surface-container-highest)]/20 rounded-2xl p-3 flex flex-col items-center justify-center text-center border-l-2 border-l-[var(--color-success)] border-t border-b border-r border-[var(--color-outline-variant)]/20 shadow-sm relative overflow-hidden">
                <Tag className="w-4 h-4 text-[var(--color-success)] mb-1" />
                <p className="text-[9px] font-black uppercase tracking-widest text-[var(--color-on-surface-variant)] mb-0.5">Experience</p>
                <p className="text-base font-black text-[var(--color-on-surface)] uppercase">{interview.experienceLevel}</p>
              </div>
            </div>

            <div className="space-y-4">

              {interview.description && (
                <div>
                  <h3 className="text-[9px] font-black text-[var(--color-on-surface-variant)] uppercase tracking-widest mb-2">About this Interview</h3>
                  <div className="bg-[var(--color-surface-container-highest)]/10 rounded-xl p-3 sm:p-4 border border-[var(--color-outline-variant)]/10">
                    <p className="text-[var(--color-on-surface-variant)] text-[10px] sm:text-xs leading-relaxed font-semibold line-clamp-3">
                      {interview.description}
                    </p>
                  </div>
                </div>
              )}

              {interview.topics && interview.topics.length > 0 && (
                <div>
                  <h3 className="text-[9px] font-black text-[var(--color-on-surface-variant)] uppercase tracking-widest mb-2">
                    Topics Covered
                  </h3>
                  <div className="flex flex-wrap gap-1.5">
                    {interview.topics.map((t, index) => (
                      <span key={index} className="px-2.5 py-1 bg-[var(--color-surface-container-highest)]/30 text-[var(--color-on-surface)] rounded-full text-[8px] sm:text-[9px] font-black uppercase tracking-widest border border-[var(--color-outline-variant)]/20 shadow-sm">
                        {t}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              <div>
                <h3 className="text-[9px] font-black text-[var(--color-on-surface-variant)] uppercase tracking-widest mb-2 flex items-center gap-1.5">
                  <AlertCircle className="w-3 h-3 text-[var(--color-warning)]" />
                  Instructions
                </h3>
                <div className="bg-[var(--color-surface-container-highest)]/10 rounded-xl p-3 sm:p-4 border border-[var(--color-outline-variant)]/10">
                  <ul className="space-y-2.5 text-[var(--color-on-surface-variant)] text-[10px] sm:text-xs font-semibold">
                    <li className="flex items-start gap-2">
                      <span className="w-1 h-1 rounded-full bg-[var(--color-warning)] mt-1.5 flex-shrink-0"></span>
                      <p className="leading-snug">Ensure a stable internet connection, webcam, and microphone.</p>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="w-1 h-1 rounded-full bg-[var(--color-warning)] mt-1.5 flex-shrink-0"></span>
                      <p className="leading-snug">You cannot pause or restart the interview once it begins.</p>
                    </li>
                    {interview.instructions && (
                      <li className="flex items-start gap-2">
                        <span className="w-1 h-1 rounded-full bg-[var(--color-warning)] mt-1.5 flex-shrink-0"></span>
                        <p className="leading-snug text-[var(--color-on-surface)] line-clamp-2">{interview.instructions}</p>
                      </li>
                    )}
                  </ul>
                </div>
              </div>

              {/* Start Action */}
              <div className="pt-2 flex flex-col items-center justify-center">
                {isInactive ? (
                  <div className="mb-2 px-3 py-1.5 text-[9px] font-black uppercase tracking-widest bg-[var(--color-error)]/10 text-[var(--color-error)] border border-[var(--color-error)]/20 rounded-lg">
                    This interview is no longer active.
                  </div>
                ) : hasAttempted ? (
                  <div className="mb-2 px-3 py-1.5 text-[9px] font-black uppercase tracking-widest bg-[var(--color-warning)]/10 text-[var(--color-warning)] border border-[var(--color-warning)]/20 rounded-lg">
                    You have already started or completed this interview.
                  </div>
                ) : null}

                <button
                  onClick={() => navigate(`/candidate/interviews/${id}/start`)}
                  disabled={isInactive || hasAttempted}
                  className="w-full py-3 sm:py-3.5 bg-[var(--color-primary-md3)] text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-[var(--color-primary-md3)]/90 transition-all shadow-lg shadow-[var(--color-primary-md3)]/20 flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed group"
                >
                  <Play className="w-3.5 h-3.5 mr-2 fill-current group-hover:scale-110 transition-transform" />
                  CONTINUE TO SYSTEM CHECKS
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
