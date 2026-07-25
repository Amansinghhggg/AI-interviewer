import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import api from "../../services/api";
import toast from "react-hot-toast";
import {
  ClipboardList,
  Clock,
  Loader2,
  Building2,
  ArrowRight,
  CheckCircle2,
  BookOpen,
  Sparkles,
  Briefcase,
  Key
} from "lucide-react";

const CandidateDashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [interviews, setInterviews] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchInterviews = async () => {
    try {
      const { data } = await api.get("/interviews/candidate/assigned");
      if (data.success) {
        setInterviews(data.interviews);
      }
    } catch (error) {
      toast.error("Failed to load assigned interviews");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInterviews();
  }, []);

  const getExperienceLevelColor = (experienceLevel) => {
    const colors = {
      "Fresher": "text-[var(--color-accent-teal)] bg-[rgba(45,212,191,0.1)] border-[rgba(45,212,191,0.2)]",
      "1-2 Years": "text-[var(--color-accent-amber)] bg-[rgba(245,158,11,0.1)] border-[rgba(245,158,11,0.2)]",
      "3-5 Years": "text-[var(--color-accent-blue)] bg-[rgba(79,142,247,0.1)] border-[rgba(79,142,247,0.2)]",
      "5+ Years": "text-[var(--color-accent-red)] bg-[rgba(244,63,94,0.1)] border-[rgba(244,63,94,0.2)]",
    };
    return colors[experienceLevel] || colors["Fresher"];
  };

  return (
    <div className="min-h-screen bg-[var(--color-bg-base)] pt-24 pb-12 relative overflow-hidden">
      <div className="absolute inset-0 noise pointer-events-none z-0"></div>
      
      {/* Decorative top blur */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-3xl h-[200px] bg-[var(--color-accent-violet)] rounded-full blur-[150px] opacity-10 pointer-events-none"></div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-10 animate-fade-in-up">
          <div>
            <h1 className="text-3xl font-bold text-white tracking-tight">
              Welcome, <span className="gradient-text">{user?.name}</span>
            </h1>
            <p className="text-[var(--color-text-secondary)] mt-2 text-lg">
              Browse your assigned interviews and showcase your skills.
            </p>
          </div>
          <Link
            to="/candidate/join"
            className="btn-primary flex items-center gap-2 whitespace-nowrap bg-gradient-to-r from-[var(--color-accent-teal)] to-[var(--color-accent-blue)]"
          >
            <Key className="w-5 h-5" />
            Join via Code
          </Link>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-10 animate-fade-in-up-delay-1">
          <div className="surface p-6 hover:-translate-y-1 transition-transform shadow-[rgba(79,142,247,0.1)] shadow-lg">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-[rgba(79,142,247,0.15)] flex items-center justify-center border border-[rgba(79,142,247,0.3)]">
                <BookOpen className="w-6 h-6 text-[var(--color-accent-blue)]" />
              </div>
              <div>
                <p className="text-3xl font-bold text-white tracking-tight">{interviews.length}</p>
                <p className="text-sm font-medium text-[var(--color-text-secondary)] mt-1">Assigned Interviews</p>
              </div>
            </div>
          </div>
          <div className="surface p-6 hover:-translate-y-1 transition-transform shadow-[rgba(45,212,191,0.1)] shadow-lg">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-[rgba(45,212,191,0.15)] flex items-center justify-center border border-[rgba(45,212,191,0.3)]">
                <CheckCircle2 className="w-6 h-6 text-[var(--color-accent-teal)]" />
              </div>
              <div>
                <p className="text-3xl font-bold text-white tracking-tight">0</p>
                <p className="text-sm font-medium text-[var(--color-text-secondary)] mt-1">Completed</p>
              </div>
            </div>
          </div>
          <div className="surface p-6 hover:-translate-y-1 transition-transform shadow-[rgba(139,92,246,0.1)] shadow-lg">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-[rgba(139,92,246,0.15)] flex items-center justify-center border border-[rgba(139,92,246,0.3)]">
                <Sparkles className="w-6 h-6 text-[var(--color-accent-violet)]" />
              </div>
              <div>
                <p className="text-3xl font-bold text-white tracking-tight">—</p>
                <p className="text-sm font-medium text-[var(--color-text-secondary)] mt-1">Avg. Score</p>
              </div>
            </div>
          </div>
        </div>

        {/* Assigned Interviews */}
        <div className="animate-fade-in-up-delay-2">
          <h2 className="section-label mb-6 flex items-center gap-2 text-white">
            <ClipboardList className="w-5 h-5 text-[var(--color-accent-blue)]" />
            Assigned Interviews
          </h2>

          {loading ? (
            <div className="flex items-center justify-center py-24">
              <Loader2 className="w-10 h-10 animate-spin text-[var(--color-accent-blue)]" />
            </div>
          ) : interviews.length === 0 ? (
            <div className="surface text-center py-24 px-4">
              <div className="w-20 h-20 rounded-full bg-[var(--color-bg-elevated)] border border-[var(--color-border-default)] flex items-center justify-center mx-auto mb-6 shadow-lg">
                <ClipboardList className="w-10 h-10 text-[var(--color-text-muted)]" />
              </div>
              <h3 className="text-xl font-bold text-white mb-2">No assigned interviews</h3>
              <p className="text-[var(--color-text-secondary)] mb-8 max-w-sm mx-auto">
                You haven't been assigned to any active interviews yet.
              </p>
              <Link
                to="/candidate/join"
                className="btn-primary inline-flex items-center gap-2"
              >
                <Key className="w-5 h-5" />
                Have an invite code?
              </Link>
            </div>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {interviews.map((interview) => (
                <div
                  key={interview._id}
                  className="surface p-6 hover:-translate-y-1 hover:border-[var(--color-border-active)] transition-all duration-300 flex flex-col group relative overflow-hidden"
                >
                  <div className="absolute top-0 right-0 w-32 h-32 bg-[var(--color-accent-blue-glow)] rounded-full blur-[60px] -mr-10 -mt-10 opacity-0 group-hover:opacity-40 transition-opacity"></div>
                  
                  <div className="flex items-start justify-between mb-4 relative z-10">
                    <h3 className="text-xl font-bold text-white tracking-tight group-hover:text-[var(--color-accent-blue)] transition-colors pr-2">
                      {interview.title}
                    </h3>
                    <span className={`text-xs font-bold uppercase tracking-wider px-2.5 py-1 rounded-full border ${getExperienceLevelColor(interview.experienceLevel)}`}>
                      {interview.experienceLevel}
                    </span>
                  </div>
                  
                  <div className="flex items-center gap-2 mb-5 relative z-10">
                    <Briefcase className="w-4 h-4 text-[var(--color-text-muted)]" />
                    <span className="text-sm font-medium text-[var(--color-text-secondary)]">{interview.jobRole}</span>
                  </div>

                  {/* Topics */}
                  {interview.topics?.length > 0 && (
                    <div className="flex flex-wrap gap-2 mb-6 relative z-10">
                      {interview.topics.slice(0, 3).map((topic) => (
                        <span key={topic} className="text-xs font-medium px-2.5 py-1 rounded-lg bg-[var(--color-bg-elevated)] border border-[var(--color-border-subtle)] text-[var(--color-text-secondary)]">
                          {topic}
                        </span>
                      ))}
                      {interview.topics.length > 3 && (
                        <span className="text-xs font-medium px-2.5 py-1 rounded-lg bg-[var(--color-bg-elevated)] border border-[var(--color-border-subtle)] text-[var(--color-text-secondary)]">
                          +{interview.topics.length - 3} more
                        </span>
                      )}
                    </div>
                  )}

                  <div className="mt-auto relative z-10 border-t border-[var(--color-border-subtle)] pt-5">
                    {/* Meta */}
                    <div className="flex items-center justify-between text-sm text-[var(--color-text-muted)] mb-5">
                      <span className="flex items-center gap-1.5 font-medium">
                        <Clock className="w-4 h-4" />
                        {interview.duration} min
                      </span>
                      {interview.employer && (
                        <span className="flex items-center gap-1.5 truncate max-w-[50%]" title={interview.employer.name}>
                          <Building2 className="w-4 h-4 flex-shrink-0" />
                          <span className="truncate font-medium">{interview.employer.name}</span>
                        </span>
                      )}
                    </div>

                    {/* Action */}
                    <button 
                      onClick={() => navigate(`/candidate/interviews/${interview._id}`)}
                      className="btn-primary w-full py-3 flex items-center justify-center gap-2 group/btn"
                    >
                      View Instructions
                      <ArrowRight className="w-4 h-4 transition-transform group-hover/btn:translate-x-1" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CandidateDashboard;
