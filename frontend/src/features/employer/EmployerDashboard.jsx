import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import api from "../../services/api";
import toast from "react-hot-toast";
import {
  Plus,
  ClipboardList,
  CheckCircle2,
  Clock,
  Users,
  TrendingUp,
  Eye,
  Loader2,
  Calendar,
  Tag,
  Briefcase,
  Key,
} from "lucide-react";

const EmployerDashboard = () => {
  const { user } = useAuth();
  const [interviews, setInterviews] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchInterviews = async () => {
    try {
      const { data } = await api.get("/interviews");
      if (data.success) {
        setInterviews(data.interviews);
      }
    } catch (error) {
      toast.error("Failed to load interviews");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInterviews();
  }, []);

  const stats = [
    {
      label: "Total Interviews",
      value: interviews.length,
      icon: ClipboardList,
      color: "text-[var(--color-accent-blue)]",
      bgGlow: "shadow-[var(--color-accent-blue-glow)]",
      bgClass: "bg-[rgba(79,142,247,0.1)]"
    },
    {
      label: "Active",
      value: interviews.filter((i) => i.status === "active").length,
      icon: TrendingUp,
      color: "text-[var(--color-accent-teal)]",
      bgGlow: "shadow-[rgba(45,212,191,0.2)]",
      bgClass: "bg-[rgba(45,212,191,0.1)]"
    },
    {
      label: "Completed",
      value: interviews.filter((i) => i.status === "completed").length,
      icon: CheckCircle2,
      color: "text-[var(--color-accent-violet)]",
      bgGlow: "shadow-[var(--color-accent-violet-glow)]",
      bgClass: "bg-[rgba(139,92,246,0.1)]"
    },
    {
      label: "Total Candidates",
      value: interviews.reduce((acc, curr) => acc + (curr.assignedCandidates?.length || 0), 0),
      icon: Users,
      color: "text-[var(--color-accent-amber)]",
      bgGlow: "shadow-[rgba(245,158,11,0.2)]",
      bgClass: "bg-[rgba(245,158,11,0.1)]"
    },
  ];

  const getStatusBadge = (status) => {
    const styles = {
      active: "badge badge-success",
      completed: "badge badge-warning",
      draft: "badge badge-muted",
      archived: "badge badge-error",
    };
    return styles[status] || styles.draft;
  };

  const getDifficultyBadge = (experienceLevel) => {
    const styles = {
      "Fresher": "text-[var(--color-accent-teal)]",
      "1-2 Years": "text-[var(--color-accent-blue)]",
      "3-5 Years": "text-[var(--color-accent-violet)]",
      "5+ Years": "text-[var(--color-accent-red)]",
    };
    return styles[experienceLevel] || styles["Fresher"];
  };

  return (
    <div className="min-h-screen bg-[var(--color-bg-base)] pt-24 pb-12 relative overflow-hidden">
      <div className="absolute inset-0 noise pointer-events-none z-0"></div>
      
      {/* Decorative top blur */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-3xl h-[200px] bg-[var(--color-accent-blue)] rounded-full blur-[150px] opacity-10 pointer-events-none"></div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-10 animate-fade-in-up">
          <div>
            <h1 className="text-3xl font-bold text-[var(--color-on-surface)] tracking-tight">
              Welcome back, <span className="gradient-text">{user?.name}</span>
            </h1>
            <p className="text-[var(--color-text-secondary)] mt-2 text-lg">
              Manage your interviews and track candidate progress.
            </p>
          </div>
          <Link
            to="/employer/create-interview"
            className="btn-primary flex items-center gap-2 whitespace-nowrap"
          >
            <Plus className="w-5 h-5" />
            Create Interview
          </Link>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 mb-10 animate-fade-in-up-delay-1">
          {stats.map((stat) => (
            <div
              key={stat.label}
              className={`surface p-6 hover:-translate-y-1 transition-transform duration-300 shadow-lg ${stat.bgGlow}`}
            >
              <div className="flex items-center justify-between mb-4">
                <div
                  className={`w-12 h-12 rounded-xl ${stat.bgClass} flex items-center justify-center border border-[var(--color-border-subtle)]`}
                >
                  <stat.icon className={`w-6 h-6 ${stat.color}`} />
                </div>
              </div>
              <p className="text-3xl font-bold text-[var(--color-on-surface)] tracking-tight">{stat.value}</p>
              <p className="text-sm text-[var(--color-text-secondary)] mt-1 font-medium">{stat.label}</p>
            </div>
          ))}
        </div>

        {/* Interviews List */}
        <div className="surface-elevated overflow-hidden animate-fade-in-up-delay-2">
          <div className="px-6 py-5 border-b border-[var(--color-border-subtle)] flex items-center justify-between bg-[var(--color-bg-overlay)]">
            <h2 className="text-lg font-bold text-[var(--color-on-surface)] flex items-center gap-2">
              <ClipboardList className="w-5 h-5 text-[var(--color-accent-violet)]" />
              Your Interviews
            </h2>
            <span className="badge badge-muted">
              {interviews.length} total
            </span>
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-24">
              <Loader2 className="w-10 h-10 animate-spin text-[var(--color-accent-blue)]" />
            </div>
          ) : interviews.length === 0 ? (
            <div className="text-center py-24 px-4">
              <div className="w-20 h-20 rounded-full bg-[var(--color-bg-elevated)] border border-[var(--color-border-default)] flex items-center justify-center mx-auto mb-6 shadow-lg">
                <ClipboardList className="w-10 h-10 text-[var(--color-text-muted)]" />
              </div>
              <h3 className="text-xl font-bold text-[var(--color-on-surface)] mb-2">
                No interviews yet
              </h3>
              <p className="text-[var(--color-text-secondary)] mb-8 max-w-sm mx-auto">
                Create your first AI-driven interview to start evaluating candidates smarter and faster.
              </p>
              <Link
                to="/employer/create-interview"
                className="btn-primary inline-flex items-center gap-2"
              >
                <Plus className="w-5 h-5" />
                Create First Interview
              </Link>
            </div>
          ) : (
            <div className="divide-y divide-[var(--color-border-subtle)]">
              {interviews.map((interview) => (
                <div
                  key={interview._id}
                  className="px-6 py-5 hover:bg-[var(--color-bg-overlay)] transition-colors duration-200 group"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-[var(--color-on-surface)] font-bold text-lg truncate">
                          {interview.title}
                        </h3>
                        <span className={getStatusBadge(interview.status)}>
                          {interview.status}
                        </span>
                        <span className="badge badge-muted font-mono flex items-center gap-1">
                          <Key className="w-3 h-3" />
                          {interview.interviewCode}
                        </span>
                      </div>
                      
                      <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-sm text-[var(--color-text-secondary)] mt-3">
                        <span className="flex items-center gap-1.5 font-medium">
                          <Briefcase className="w-4 h-4 text-[var(--color-text-muted)]" />
                          {interview.jobRole}
                        </span>
                        <span className="flex items-center gap-1.5 font-medium">
                          <Users className="w-4 h-4 text-[var(--color-text-muted)]" />
                          {interview.assignedCandidates?.length || 0} Candidates
                        </span>
                        <span className="flex items-center gap-1.5 font-medium">
                          <Clock className="w-4 h-4 text-[var(--color-text-muted)]" />
                          {interview.duration} min
                        </span>
                        <span
                          className={`flex items-center gap-1.5 font-medium ${getDifficultyBadge(
                            interview.experienceLevel
                          )}`}
                        >
                          <Tag className="w-4 h-4" />
                          {interview.experienceLevel}
                        </span>
                        <span className="flex items-center gap-1.5 font-medium">
                          <Calendar className="w-4 h-4 text-[var(--color-text-muted)]" />
                          {new Date(interview.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-3 mt-4 sm:mt-0">
                      <Link 
                        to={`/employer/interviews/${interview._id}`}
                        className="btn-secondary flex items-center gap-2 group-hover:border-[var(--color-accent-blue)] group-hover:text-[var(--color-accent-blue)]"
                      >
                        <Eye className="w-4 h-4" />
                        View Details
                      </Link>
                    </div>
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

export default EmployerDashboard;
