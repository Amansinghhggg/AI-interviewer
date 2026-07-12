import { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import api from "../services/api";
import toast from "react-hot-toast";
import {
  ArrowLeft,
  Loader2,
  Clock,
  Tag,
  Hash,
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
      // The backend should allow candidates to get assigned interview by id.
      // Wait, Candidate getInterviewById wasn't explicitly added to Candidate routes? 
      // Actually, GET /api/interviews/:id allows candidates because controller checks assignments.
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
      <div className="min-h-screen bg-dark-900 flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary-400" />
      </div>
    );
  }

  if (!interview) return null;

  return (
    <div className="min-h-screen bg-dark-900 pt-20">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <button
          onClick={() => navigate("/candidate/dashboard")}
          className="inline-flex items-center gap-2 text-dark-400 hover:text-dark-200 transition-colors mb-6"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Dashboard
        </button>

        <div className="glass-light rounded-3xl p-6 sm:p-10">
          <div className="text-center mb-10">
            <h1 className="text-3xl sm:text-4xl font-bold text-dark-50 mb-4">
              {interview.title}
            </h1>
            <div className="flex flex-wrap items-center justify-center gap-4 text-dark-300">
              <span className="flex items-center gap-2">
                <Briefcase className="w-4 h-4 text-primary-400" />
                {interview.jobRole}
              </span>
              <span className="w-1.5 h-1.5 rounded-full bg-dark-600"></span>
              <span className="flex items-center gap-2">
                <Building2 className="w-4 h-4 text-info-400" />
                {interview.employer?.name || "Employer"}
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-10">
            <div className="bg-dark-800/50 rounded-2xl p-5 border border-dark-700 flex flex-col items-center justify-center text-center">
              <Clock className="w-6 h-6 text-warning-400 mb-2" />
              <p className="text-dark-400 text-sm mb-1">Duration</p>
              <p className="text-lg font-semibold text-dark-50">{interview.duration} Minutes</p>
            </div>
            <div className="bg-dark-800/50 rounded-2xl p-5 border border-dark-700 flex flex-col items-center justify-center text-center">
              <Tag className="w-6 h-6 text-accent-400 mb-2" />
              <p className="text-dark-400 text-sm mb-1">Experience Level</p>
              <p className="text-lg font-semibold text-dark-50 capitalize">{interview.experienceLevel}</p>
            </div>
          </div>

          <div className="space-y-8">
            {interview.description && (
              <div>
                <h3 className="text-xl font-semibold text-dark-100 mb-3">About this Interview</h3>
                <p className="text-dark-300 leading-relaxed bg-dark-800/30 p-5 rounded-2xl border border-dark-700/50">
                  {interview.description}
                </p>
              </div>
            )}

            <div>
              <h3 className="text-xl font-semibold text-dark-100 mb-3 flex items-center gap-2">
                <AlertCircle className="w-5 h-5 text-warning-400" />
                Instructions
              </h3>
              <div className="bg-warning-500/10 border border-warning-500/20 p-5 rounded-2xl">
                <ul className="space-y-3 text-dark-200">
                  <li className="flex items-start gap-3">
                    <span className="w-1.5 h-1.5 rounded-full bg-warning-400 mt-2 flex-shrink-0"></span>
                    <p>Ensure you have a stable internet connection before starting.</p>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="w-1.5 h-1.5 rounded-full bg-warning-400 mt-2 flex-shrink-0"></span>
                    <p>You cannot pause or restart the interview once it begins.</p>
                  </li>
                  {interview.instructions && (
                    <li className="flex items-start gap-3">
                      <span className="w-1.5 h-1.5 rounded-full bg-warning-400 mt-2 flex-shrink-0"></span>
                      <p>{interview.instructions}</p>
                    </li>
                  )}
                </ul>
              </div>
            </div>

            <div className="pt-6 border-t border-dark-700 flex flex-col items-center justify-center">
              {interview.status !== "active" ? (
                <div className="text-danger-400 font-medium mb-2">This interview is no longer active.</div>
              ) : interview.assignedCandidates?.find(c => c.email === user?.email)?.status !== "Pending" ? (
                <div className="text-warning-400 font-medium mb-2">You have already started or completed this interview.</div>
              ) : null}
              
              <button
                onClick={() => navigate(`/candidate/interviews/${id}/start`)}
                disabled={interview.status !== "active" || interview.assignedCandidates?.find(c => c.email === user?.email)?.status !== "Pending"}
                className="px-8 py-4 rounded-xl bg-gradient-to-r from-primary-600 to-primary-500 text-white font-bold text-lg hover:from-primary-500 hover:to-primary-400 transition-all duration-300 shadow-lg shadow-primary-500/20 hover:-translate-y-1 flex items-center gap-3 group disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:translate-y-0 disabled:shadow-none"
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
