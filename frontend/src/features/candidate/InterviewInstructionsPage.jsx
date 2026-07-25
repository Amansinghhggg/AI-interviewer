import { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
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
      <div className="min-h-screen bg-[var(--color-bg-base)] flex items-center justify-center">
        <Loader2 className="w-10 h-10 animate-spin text-[var(--color-accent-blue)]" />
      </div>
    );
  }

  if (!interview) return null;

  return (
    <div className="min-h-screen bg-[var(--color-bg-base)] pt-24 pb-12 relative overflow-hidden">
      {/* Background Noise & Glows */}
      <div className="absolute inset-0 noise pointer-events-none z-0"></div>
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-[var(--color-accent-violet-glow)] rounded-full blur-[150px] opacity-20 pointer-events-none z-0"></div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <button
          onClick={() => navigate(-1)}
          className="inline-flex items-center gap-2 text-[var(--color-text-secondary)] hover:text-white transition-colors mb-6 font-medium group"
        >
          <ArrowLeft className="w-4 h-4 transition-transform group-hover:-translate-x-1" />
          Back
        </button>

        <div className="surface-elevated rounded-3xl p-8 sm:p-12 shadow-2xl relative overflow-hidden">
          {/* Subtle top border glow */}
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-[var(--color-accent-violet)] to-[var(--color-accent-blue)]"></div>

          <div className="text-center mb-12">
            <h1 className="text-4xl sm:text-5xl font-black text-white mb-6 tracking-tight">
              {interview.title}
            </h1>
            <div className="flex flex-wrap items-center justify-center gap-4 text-[var(--color-text-secondary)] font-medium">
              <span className="flex items-center gap-2 bg-[var(--color-bg-surface)] px-4 py-2 rounded-lg border border-[var(--color-border-subtle)]">
                <Briefcase className="w-4 h-4 text-[var(--color-accent-blue)]" />
                {interview.jobRole}
              </span>
              <span className="flex items-center gap-2 bg-[var(--color-bg-surface)] px-4 py-2 rounded-lg border border-[var(--color-border-subtle)]">
                <Building2 className="w-4 h-4 text-[var(--color-accent-teal)]" />
                {interview.employer?.name || "Employer"}
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-12">
            <div className="surface p-6 flex flex-col items-center justify-center text-center shadow-lg group hover:-translate-y-1 transition-transform">
              <Clock className="w-8 h-8 text-[var(--color-accent-amber)] mb-3 group-hover:scale-110 transition-transform" />
              <p className="text-[var(--color-text-secondary)] text-sm mb-1 font-medium uppercase tracking-wider">Duration</p>
              <p className="text-2xl font-bold text-white">{interview.duration} Minutes</p>
            </div>
            <div className="surface p-6 flex flex-col items-center justify-center text-center shadow-lg group hover:-translate-y-1 transition-transform">
              <Tag className="w-8 h-8 text-[var(--color-accent-blue)] mb-3 group-hover:scale-110 transition-transform" />
              <p className="text-[var(--color-text-secondary)] text-sm mb-1 font-medium uppercase tracking-wider">Experience Level</p>
              <p className="text-2xl font-bold text-white capitalize">{interview.experienceLevel}</p>
            </div>
          </div>

          <div className="space-y-10">
            {interview.description && (
              <div>
                <h3 className="text-xl font-bold text-white mb-4">About this Interview</h3>
                <div className="surface p-6 border-l-4 border-[var(--color-accent-blue)]">
                  <p className="text-[var(--color-text-secondary)] leading-relaxed">
                    {interview.description}
                  </p>
                </div>
              </div>
            )}

            <div>
              <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-3">
                <AlertCircle className="w-6 h-6 text-[var(--color-accent-amber)]" />
                Instructions
              </h3>
              <div className="surface p-6 border border-[rgba(245,158,11,0.2)] bg-[rgba(245,158,11,0.05)]">
                <ul className="space-y-4 text-[var(--color-text-secondary)]">
                  <li className="flex items-start gap-3">
                    <span className="w-2 h-2 rounded-full bg-[var(--color-accent-amber)] mt-2 flex-shrink-0 shadow-[var(--color-accent-amber-glow)] shadow-md"></span>
                    <p className="leading-relaxed">Ensure you have a stable internet connection, working webcam, and microphone before starting.</p>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="w-2 h-2 rounded-full bg-[var(--color-accent-amber)] mt-2 flex-shrink-0 shadow-[var(--color-accent-amber-glow)] shadow-md"></span>
                    <p className="leading-relaxed">Find a quiet environment with good lighting.</p>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="w-2 h-2 rounded-full bg-[var(--color-accent-amber)] mt-2 flex-shrink-0 shadow-[var(--color-accent-amber-glow)] shadow-md"></span>
                    <p className="leading-relaxed">You cannot pause or restart the interview once it begins.</p>
                  </li>
                  {interview.instructions && (
                    <li className="flex items-start gap-3">
                      <span className="w-2 h-2 rounded-full bg-[var(--color-accent-amber)] mt-2 flex-shrink-0 shadow-[var(--color-accent-amber-glow)] shadow-md"></span>
                      <p className="leading-relaxed font-medium text-white">{interview.instructions}</p>
                    </li>
                  )}
                </ul>
              </div>
            </div>

            <div className="pt-10 border-t border-[var(--color-border-subtle)] flex flex-col items-center justify-center">
              {interview.status !== "active" ? (
                <div className="badge badge-error mb-4 px-4 py-2 text-sm">This interview is no longer active.</div>
              ) : interview.assignedCandidates?.find(c => c.email === user?.email)?.status !== "Pending" ? (
                <div className="badge badge-warning mb-4 px-4 py-2 text-sm">You have already started or completed this interview.</div>
              ) : null}
              
              <button
                onClick={() => navigate(`/candidate/interviews/${id}/start`)}
                disabled={interview.status !== "active" || interview.assignedCandidates?.find(c => c.email === user?.email)?.status !== "Pending"}
                className="btn-primary w-full sm:w-auto px-12 py-5 text-lg group shadow-2xl shadow-[var(--color-accent-blue-glow)] flex items-center justify-center gap-3"
              >
                <Play className="w-6 h-6 fill-white" />
                Start Interview Now
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default InterviewInstructionsPage;
