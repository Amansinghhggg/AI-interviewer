import { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import api from "../services/api";
import toast from "react-hot-toast";
import {
  ClipboardList,
  Clock,
  FileText,
  Tag,
  Calendar,
  Loader2,
  Building2,
  ArrowRight,
  CheckCircle2,
  BookOpen,
  Sparkles,
} from "lucide-react";

const CandidateDashboard = () => {
  const { user } = useAuth();
  const [interviews, setInterviews] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchInterviews();
  }, []);

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

  const getDifficultyColor = (difficulty) => {
    const colors = {
      easy: "text-accent-400 bg-accent-500/10 border-accent-500/20",
      medium: "text-warning-400 bg-warning-500/10 border-warning-500/20",
      hard: "text-danger-400 bg-danger-500/10 border-danger-500/20",
    };
    return colors[difficulty] || colors.medium;
  };

  return (
    <div className="min-h-screen bg-dark-900 pt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8 animate-fade-in-up">
          <h1 className="text-2xl sm:text-3xl font-bold text-dark-50">
            Welcome,{" "}
            <span className="gradient-text">{user?.name}</span>
          </h1>
          <p className="text-dark-400 mt-1">
            Browse available interviews and showcase your skills.
          </p>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8 animate-fade-in-up-delay-1">
          <div className="glass-light rounded-2xl p-5">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary-500 to-primary-400 flex items-center justify-center">
                <BookOpen className="w-5 h-5 text-white" />
              </div>
              <div>
                <p className="text-2xl font-bold text-dark-50">
                  {interviews.length}
                </p>
                <p className="text-sm text-dark-400">Available Interviews</p>
              </div>
            </div>
          </div>
          <div className="glass-light rounded-2xl p-5">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-accent-500 to-accent-400 flex items-center justify-center">
                <CheckCircle2 className="w-5 h-5 text-white" />
              </div>
              <div>
                <p className="text-2xl font-bold text-dark-50">0</p>
                <p className="text-sm text-dark-400">Completed</p>
              </div>
            </div>
          </div>
          <div className="glass-light rounded-2xl p-5">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-warning-500 to-warning-400 flex items-center justify-center">
                <Sparkles className="w-5 h-5 text-white" />
              </div>
              <div>
                <p className="text-2xl font-bold text-dark-50">—</p>
                <p className="text-sm text-dark-400">Avg. Score</p>
              </div>
            </div>
          </div>
        </div>

        {/* Available Interviews */}
        <div className="animate-fade-in-up-delay-2">
          <h2 className="text-lg font-semibold text-dark-50 flex items-center gap-2 mb-5">
            <ClipboardList className="w-5 h-5 text-primary-400" />
            Available Interviews
          </h2>

          {loading ? (
            <div className="flex items-center justify-center py-20">
              <Loader2 className="w-8 h-8 animate-spin text-primary-400" />
            </div>
          ) : interviews.length === 0 ? (
            <div className="glass-light rounded-2xl text-center py-20">
              <ClipboardList className="w-12 h-12 text-dark-600 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-dark-300 mb-2">
                No interviews available
              </h3>
              <p className="text-dark-500">
                Check back later for new interview opportunities.
              </p>
            </div>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
              {interviews.map((interview) => (
                <div
                  key={interview._id}
                  className="glass-light rounded-2xl p-6 hover:-translate-y-1 transition-all duration-300 group"
                >
                  <div className="flex items-start justify-between mb-4">
                    <h3 className="text-lg font-semibold text-dark-100 group-hover:text-white transition-colors">
                      {interview.title}
                    </h3>
                    <span
                      className={`text-xs px-2.5 py-1 rounded-full capitalize border ${getDifficultyColor(interview.difficulty)}`}
                    >
                      {interview.difficulty}
                    </span>
                  </div>

                  {interview.description && (
                    <p className="text-sm text-dark-400 mb-4 line-clamp-2">
                      {interview.description}
                    </p>
                  )}

                  {/* Topics */}
                  {interview.topics?.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 mb-4">
                      {interview.topics.slice(0, 3).map((topic) => (
                        <span
                          key={topic}
                          className="text-xs px-2.5 py-1 rounded-lg bg-dark-700 text-dark-300"
                        >
                          {topic}
                        </span>
                      ))}
                      {interview.topics.length > 3 && (
                        <span className="text-xs px-2.5 py-1 rounded-lg bg-dark-700 text-dark-400">
                          +{interview.topics.length - 3} more
                        </span>
                      )}
                    </div>
                  )}

                  {/* Meta */}
                  <div className="flex items-center gap-4 text-sm text-dark-400 mb-5 border-t border-dark-700/50 pt-4">
                    <span className="flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5" />
                      {interview.duration} min
                    </span>
                    <span className="flex items-center gap-1">
                      <FileText className="w-3.5 h-3.5" />
                      {interview.numberOfQuestions} Q's
                    </span>
                    {interview.createdBy && (
                      <span className="flex items-center gap-1">
                        <Building2 className="w-3.5 h-3.5" />
                        {interview.createdBy.name}
                      </span>
                    )}
                  </div>

                  {/* Action */}
                  <button className="w-full py-2.5 rounded-xl bg-gradient-to-r from-primary-600 to-primary-500 text-white font-medium hover:from-primary-500 hover:to-primary-400 transition-all duration-300 shadow-lg shadow-primary-500/10 flex items-center justify-center gap-2 text-sm group/btn">
                    Start Interview
                    <ArrowRight className="w-4 h-4 transition-transform group-hover/btn:translate-x-0.5" />
                  </button>
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
