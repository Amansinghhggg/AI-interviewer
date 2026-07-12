import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import api from "../services/api";
import toast from "react-hot-toast";
import {
  Plus,
  ClipboardList,
  CheckCircle2,
  Clock,
  FileText,
  Users,
  TrendingUp,
  Eye,
  Loader2,
  Calendar,
  Tag,
  Briefcase,
  Key,
  Search,
  ChevronRight,
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
      color: "from-primary-500 to-primary-400",
      bgGlow: "shadow-primary-500/10",
    },
    {
      label: "Active",
      value: interviews.filter((i) => i.status === "active").length,
      icon: TrendingUp,
      color: "from-accent-500 to-accent-400",
      bgGlow: "shadow-accent-500/10",
    },
    {
      label: "Completed",
      value: interviews.filter((i) => i.status === "completed").length,
      icon: CheckCircle2,
      color: "from-warning-500 to-warning-400",
      bgGlow: "shadow-warning-500/10",
    },
    {
      label: "Total Candidates",
      value: interviews.reduce((acc, curr) => acc + (curr.assignedCandidates?.length || 0), 0),
      icon: Users,
      color: "from-info-500 to-info-400",
      bgGlow: "shadow-info-500/10",
    },
  ];

  const getStatusBadge = (status) => {
    const styles = {
      active: "bg-accent-500/15 text-accent-400 border border-accent-500/20",
      completed: "bg-warning-500/15 text-warning-400 border border-warning-500/20",
      draft: "bg-dark-500/15 text-dark-300 border border-dark-500/20",
      archived: "bg-danger-500/15 text-danger-400 border border-danger-500/20",
    };
    return styles[status] || styles.draft;
  };

  const getDifficultyBadge = (experienceLevel) => {
    const styles = {
      "Fresher": "text-accent-400",
      "1-2 Years": "text-warning-400",
      "3-5 Years": "text-primary-400",
      "5+ Years": "text-danger-400",
    };
    return styles[experienceLevel] || styles["Fresher"];
  };

  return (
    <div className="min-h-screen bg-dark-900 pt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8 animate-fade-in-up">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-dark-50">
              Welcome back, <span className="gradient-text">{user?.name}</span>
            </h1>
            <p className="text-dark-400 mt-1">
              Manage your interviews and track candidate progress.
            </p>
          </div>
          <Link
            to="/employer/create-interview"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-primary-600 to-primary-500 text-white font-semibold hover:from-primary-500 hover:to-primary-400 transition-all duration-300 shadow-lg shadow-primary-500/20 hover:-translate-y-0.5 whitespace-nowrap"
          >
            <Plus className="w-5 h-5" />
            Create Interview
          </Link>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8 animate-fade-in-up-delay-1">
          {stats.map((stat) => (
            <div
              key={stat.label}
              className={`glass-light rounded-2xl p-5 hover:-translate-y-0.5 transition-all duration-300 shadow-lg ${stat.bgGlow}`}
            >
              <div className="flex items-center justify-between mb-3">
                <div
                  className={`w-10 h-10 rounded-xl bg-gradient-to-br ${stat.color} flex items-center justify-center`}
                >
                  <stat.icon className="w-5 h-5 text-white" />
                </div>
              </div>
              <p className="text-2xl font-bold text-dark-50">{stat.value}</p>
              <p className="text-sm text-dark-400 mt-1">{stat.label}</p>
            </div>
          ))}
        </div>

        {/* Interviews List */}
        <div className="glass-light rounded-2xl overflow-hidden animate-fade-in-up-delay-2">
          <div className="px-6 py-4 border-b border-dark-700 flex items-center justify-between">
            <h2 className="text-lg font-semibold text-dark-50 flex items-center gap-2">
              <ClipboardList className="w-5 h-5 text-primary-400" />
              Your Interviews
            </h2>
            <span className="text-sm text-dark-400">
              {interviews.length} total
            </span>
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-20">
              <Loader2 className="w-8 h-8 animate-spin text-primary-400" />
            </div>
          ) : interviews.length === 0 ? (
            <div className="text-center py-20">
              <ClipboardList className="w-12 h-12 text-dark-600 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-dark-300 mb-2">
                No interviews yet
              </h3>
              <p className="text-dark-500 mb-6">
                Create your first interview to start hiring.
              </p>
              <Link
                to="/employer/create-interview"
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-primary-600 text-white font-medium hover:bg-primary-500 transition-all"
              >
                <Plus className="w-4 h-4" />
                Create Interview
              </Link>
            </div>
          ) : (
            <div className="divide-y divide-dark-700/50">
              {interviews.map((interview) => (
                <div
                  key={interview._id}
                  className="px-6 py-4 hover:bg-dark-700/30 transition-all duration-200 group"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-3 mb-1">
                        <h3 className="text-dark-100 font-medium truncate">
                          {interview.title}
                        </h3>
                        <span
                          className={`text-xs px-2.5 py-0.5 rounded-full capitalize ${getStatusBadge(
                            interview.status
                          )}`}
                        >
                          {interview.status}
                        </span>
                        <span className="text-xs px-2.5 py-0.5 rounded-full bg-dark-700 text-dark-300 font-mono flex items-center gap-1 border border-dark-600">
                          <Key className="w-3 h-3" />
                          Code: {interview.interviewCode}
                        </span>
                      </div>
                      <div className="flex flex-wrap items-center gap-3 text-sm text-dark-400">
                        <span className="flex items-center gap-1">
                          <Briefcase className="w-3.5 h-3.5" />
                          {interview.jobRole}
                        </span>
                        <span className="flex items-center gap-1">
                          <Users className="w-3.5 h-3.5" />
                          {interview.assignedCandidates?.length || 0} Candidates
                        </span>
                        <span className="flex items-center gap-1">
                          <Clock className="w-3.5 h-3.5" />
                          {interview.duration} min
                        </span>
                        <span
                          className={`flex items-center gap-1 capitalize ${getDifficultyBadge(
                            interview.experienceLevel
                          )}`}
                        >
                          <Tag className="w-3.5 h-3.5" />
                          {interview.experienceLevel}
                        </span>
                        <span className="flex items-center gap-1">
                          <Calendar className="w-3.5 h-3.5" />
                          {new Date(interview.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 mt-4 sm:mt-0">
                      <Link 
                        to={`/employer/interviews/${interview._id}`}
                        className="px-4 py-2 rounded-lg bg-primary-600/10 text-primary-400 hover:bg-primary-600 hover:text-white transition-all flex items-center gap-2 text-sm font-medium border border-primary-500/20 hover:border-transparent"
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
