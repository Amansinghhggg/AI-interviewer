import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import api from "../../services/api";
import { toast } from "react-hot-toast";
import {
  FileText,
  Clock,
  Loader2,
  Building2,
  ArrowRight,
  Briefcase,
  CheckCircle2,
  AlertCircle
} from "lucide-react";
import { motion } from "framer-motion";

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

        const inProgress = data.interviews.filter(interview => {
          return interview.candidateStatus?.toLowerCase() === "in progress" || interview.candidateStatus?.toLowerCase() === "in-progress";
        });

        if (inProgress.length > 0) {
          navigate(`/candidate/interviews/${inProgress[0]._id}/live`);
        }
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

  const getExperienceLevelStyle = (experienceLevel) => {
    const styles = {
      "Fresher": "bg-[var(--color-tertiary)]/10 text-[var(--color-tertiary)] border-[var(--color-tertiary)]/20",
      "1-2 Years": "bg-[var(--color-secondary)]/10 text-[var(--color-secondary)] border-[var(--color-secondary)]/20",
      "3-5 Years": "bg-[var(--color-warning)]/10 text-[var(--color-warning)] border-[var(--color-warning)]/20",
      "5+ Years": "bg-[var(--color-error)]/10 text-[var(--color-error)] border-[var(--color-error)]/20",
    };
    return styles[experienceLevel] || "bg-[var(--color-surface-variant)] text-[var(--color-on-surface-variant)] border-[var(--color-outline-variant)]/30";
  };

  const getStatusStyle = (status) => {
    const s = status?.toLowerCase();
    if (s === 'completed') return "bg-[var(--color-success)]/10 text-[var(--color-success)] border-[var(--color-success)]/20";
    if (s === 'in-progress' || s === 'in progress') return "bg-[var(--color-warning)]/10 text-[var(--color-warning)] border-[var(--color-warning)]/20";
    return "bg-[var(--color-surface-variant)] text-[var(--color-on-surface-variant)] border-[var(--color-outline-variant)]/30";
  };

  const assignedInterviews = interviews.filter(interview => {
    return interview.candidateStatus === "Pending" && interview.status !== "completed";
  });

  const inProgressInterviews = interviews.filter(interview => {
    const status = interview.candidateStatus?.toLowerCase();
    return (status === "in progress" || status === "in-progress") && interview.status !== "completed";
  });

  const completedInterviews = interviews.filter(interview => {
    const status = interview.candidateStatus?.toLowerCase();
    return status === "completed";
  });

  const missedInterviews = interviews.filter(interview => {
    const status = interview.candidateStatus?.toLowerCase();
    return interview.status === "completed" && status !== "completed";
  });

  const handleStartInterview = (interviewId) => {
    if (inProgressInterviews.length > 0) {
      toast.error("You must complete your in-progress interview before starting a new one.");
      return;
    }
    navigate(`/candidate/interviews/${interviewId}`);
  };

  return (
    <div className="min-h-screen bg-[var(--background)] w-full font-['Inter'] pb-12">
      <div className="w-full max-w-[1440px] mx-auto p-4 md:p-8 space-y-8">

        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col sm:flex-row sm:items-end justify-between gap-6 mb-8"
        >
          <div>
            <h1 className="text-4xl font-black tracking-tight text-[var(--color-on-surface)] mb-2 uppercase">
              Dashboard
            </h1>
            <p className="text-sm text-[var(--color-on-surface-variant)] uppercase tracking-widest font-bold">
              Welcome back, {user?.name}. Here are your interview updates.
            </p>
          </div>
        </motion.div>

        {loading ? (
          <div className="flex justify-center p-12">
            <Loader2 className="w-8 h-8 animate-spin text-[var(--color-primary-md3)]" />
          </div>
        ) : (
          <div className="space-y-12">

            {/* In-Progress Interviews */}
            {inProgressInterviews.length > 0 && (
              <motion.section initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h2 className="text-xl font-black tracking-tight text-[var(--color-warning)] uppercase flex items-center gap-2">
                      <AlertCircle className="w-6 h-6 animate-pulse" />
                      Action Required
                    </h2>
                    <p className="text-xs text-[var(--color-on-surface-variant)] mt-1 font-bold tracking-wider">You have an interview in progress.</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 gap-6">
                  {inProgressInterviews.map((interview) => (
                    <div key={interview._id} className="bg-[var(--color-surface-container-low)] border border-[var(--color-warning)]/50 rounded-2xl p-6 shadow-xl relative overflow-hidden group">
                      <div className="absolute top-0 right-0 w-48 h-48 bg-[var(--color-warning)]/10 rounded-full blur-[60px] pointer-events-none transition-all group-hover:bg-[var(--color-warning)]/20"></div>
                      <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                        <div className="flex-1">
                          <h3 className="text-2xl font-black text-[var(--color-on-surface)] mb-2 uppercase">{interview.title}</h3>
                          <div className="flex flex-wrap items-center gap-4 text-xs font-bold tracking-wider text-[var(--color-on-surface-variant)] uppercase mb-4">
                            <span className="flex items-center gap-1.5">
                              <Briefcase className="w-4 h-4" />
                              {interview.jobRole}
                            </span>
                            {interview.employer && (
                              <span className="flex items-center gap-1.5">
                                <Building2 className="w-4 h-4" />
                                {interview.employer.name}
                              </span>
                            )}
                          </div>
                        </div>
                        <button
                          onClick={() => navigate(`/candidate/interviews/${interview._id}/live`)}
                          className="px-6 py-4 bg-[var(--color-warning)] text-black rounded-xl text-sm font-black uppercase tracking-widest hover:bg-[var(--color-warning)]/90 transition-colors shadow-lg shadow-[var(--color-warning)]/30 flex items-center whitespace-nowrap w-full md:w-auto justify-center"
                        >
                          Resume Interview <ArrowRight className="w-5 h-5 ml-2" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </motion.section>
            )}

            {/* Assigned Interviews */}
            <motion.section initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
              <div className="bg-[var(--color-surface-container-low)] border border-[var(--color-surface-variant)] rounded-2xl shadow-xl overflow-hidden">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between p-6 border-b border-[var(--color-outline-variant)]/30 bg-[var(--color-surface-container-highest)]/20">
                  <div>
                    <h2 className="text-xl font-black tracking-tight text-[var(--color-on-surface)] uppercase">Assigned Interviews</h2>
                    <p className="text-xs text-[var(--color-on-surface-variant)] mt-1 font-bold tracking-wider">Interviews awaiting your attention.</p>
                  </div>
                </div>

                {assignedInterviews.length === 0 ? (
                  <div className="text-center py-24 px-4">
                    <div className="w-16 h-16 rounded-2xl bg-[var(--color-surface-variant)] flex items-center justify-center mx-auto mb-6">
                      <FileText className="w-8 h-8 text-[var(--color-on-surface-variant)]" />
                    </div>
                    <h3 className="text-lg font-black text-[var(--color-on-surface)] uppercase tracking-wider mb-2">No assigned interviews</h3>
                    <p className="text-[var(--color-on-surface-variant)] mb-8 max-w-md mx-auto text-sm">You are all caught up! Wait for your employer to assign new interviews.</p>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                      <thead>
                        <tr className="border-b border-[var(--color-outline-variant)]/30 bg-[var(--color-surface-container-highest)]/10">
                          <th className="py-4 px-6 text-[10px] font-black uppercase tracking-[0.2em] text-[var(--color-on-surface-variant)]">Organization</th>
                          <th className="py-4 px-6 text-[10px] font-black uppercase tracking-[0.2em] text-[var(--color-on-surface-variant)]">Role</th>
                          <th className="py-4 px-6 text-[10px] font-black uppercase tracking-[0.2em] text-[var(--color-on-surface-variant)]">Experience</th>
                          <th className="py-4 px-6 text-[10px] font-black uppercase tracking-[0.2em] text-[var(--color-on-surface-variant)]">Duration</th>
                          <th className="py-4 px-6 text-[10px] font-black uppercase tracking-[0.2em] text-[var(--color-on-surface-variant)] text-right">Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {assignedInterviews.map((interview) => (
                          <tr key={interview._id} className="border-b border-[var(--color-outline-variant)]/20 hover:bg-[var(--color-surface-container-highest)]/10 transition-colors group">
                            <td className="py-4 px-6">
                              <div className="font-bold text-sm text-[var(--color-on-surface)] mb-1">{interview.title}</div>
                              {interview.employer && (
                                <div className="text-[10px] font-black tracking-widest text-[var(--color-on-surface-variant)] ">Shared By:{interview.employer.name}</div>
                              )}
                            </td>
                            <td className="py-4 px-6">
                              <span className="flex items-center gap-2 text-sm text-[var(--color-on-surface-variant)] font-semibold">
                                <Briefcase className="w-4 h-4" />
                                {interview.jobRole}
                              </span>
                            </td>
                            <td className="py-4 px-6">
                              <span className={`px-2.5 py-1 rounded text-[9px] font-black uppercase tracking-widest border ${getExperienceLevelStyle(interview.experienceLevel)}`}>
                                {interview.experienceLevel}
                              </span>
                            </td>
                            <td className="py-4 px-6">
                              <span className="flex items-center gap-2 text-sm text-[var(--color-on-surface-variant)] font-semibold">
                                <Clock className="w-4 h-4" />
                                {interview.duration} mins
                              </span>
                            </td>
                            <td className="py-4 px-6 text-right">
                              <button
                                onClick={() => handleStartInterview(interview._id)}
                                className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl text-[11px] font-black uppercase tracking-widest transition-colors ${inProgressInterviews.length > 0 ? 'bg-[var(--color-surface-variant)] text-[var(--color-on-surface-variant)] opacity-50 cursor-not-allowed' : 'bg-[var(--color-primary-md3)]/10 text-[var(--color-primary-md3)] hover:bg-[var(--color-primary-md3)] hover:text-white border border-[var(--color-primary-md3)]/20'}`}
                              >
                                Start Interview
                                <ArrowRight className="w-4 h-4" />
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </motion.section>

            {/* Completed Interviews */}
            <motion.section initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
              <div className="bg-[var(--color-surface-container-low)] border border-[var(--color-surface-variant)] rounded-2xl shadow-xl overflow-hidden">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between p-6 border-b border-[var(--color-outline-variant)]/30 bg-[var(--color-surface-container-highest)]/20">
                  <div>
                    <h2 className="text-xl font-black tracking-tight text-[var(--color-on-surface)] uppercase flex items-center gap-2">
                      <CheckCircle2 className="w-6 h-6 text-[var(--color-success)]" /> Completed
                    </h2>
                    <p className="text-xs text-[var(--color-on-surface-variant)] mt-1 font-bold tracking-wider">Your past performance history.</p>
                  </div>
                </div>

                {completedInterviews.length === 0 ? (
                  <div className="text-center py-16 px-4">
                    <p className="text-[var(--color-on-surface-variant)] text-sm">No completed interviews yet.</p>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                      <thead>
                        <tr className="border-b border-[var(--color-outline-variant)]/30 bg-[var(--color-surface-container-highest)]/10">
                          <th className="py-4 px-6 text-[10px] font-black uppercase tracking-[0.2em] text-[var(--color-on-surface-variant)]">Organization</th>
                          <th className="py-4 px-6 text-[10px] font-black uppercase tracking-[0.2em] text-[var(--color-on-surface-variant)]">Role</th>
                          <th className="py-4 px-6 text-[10px] font-black uppercase tracking-[0.2em] text-[var(--color-on-surface-variant)]">Status</th>
                          <th className="py-4 px-6 text-[10px] font-black uppercase tracking-[0.2em] text-[var(--color-on-surface-variant)] text-right">Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {completedInterviews.map((interview) => (
                          <tr key={interview._id} className="border-b border-[var(--color-outline-variant)]/20 hover:bg-[var(--color-surface-container-highest)]/10 transition-colors">
                            <td className="py-4 px-6">
                              <div className="font-bold text-sm text-[var(--color-on-surface)] mb-1">{interview.title}</div>
                              {interview.employer && (
                                <div className="text-[10px] font-black tracking-widest text-[var(--color-on-surface-variant)] uppercase">{interview.employer.name}</div>
                              )}
                            </td>
                            <td className="py-4 px-6">
                              <span className="flex items-center gap-2 text-sm text-[var(--color-on-surface-variant)] font-semibold">
                                <Briefcase className="w-4 h-4" />
                                {interview.jobRole}
                              </span>
                            </td>
                            <td className="py-4 px-6">
                              <span className={`px-2.5 py-1 rounded text-[9px] font-black uppercase tracking-widest border ${getStatusStyle(interview.candidateStatus)}`}>
                                {interview.candidateStatus}
                              </span>
                            </td>
                            <td className="py-4 px-6 text-right">
                              <span className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-[11px] font-black uppercase tracking-widest bg-[var(--color-surface-variant)] text-[var(--color-on-surface-variant)] opacity-70">
                                Completed
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </motion.section>

          </div>
        )}

        {/* Missed Interviews */}
        {!loading && missedInterviews.length > 0 && (
          <motion.section initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}>
            <div className="bg-[var(--color-surface-container-low)] border border-[var(--color-surface-variant)] rounded-2xl shadow-xl overflow-hidden mt-12">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between p-6 border-b border-[var(--color-outline-variant)]/30 bg-[var(--color-surface-container-highest)]/20">
                <div>
                  <h2 className="text-xl font-black tracking-tight text-[var(--color-error)] uppercase flex items-center gap-2">
                    <AlertCircle className="w-6 h-6 text-[var(--color-error)]" /> Missed
                  </h2>
                  <p className="text-xs text-[var(--color-on-surface-variant)] mt-1 font-bold tracking-wider">You Missed These Interviews </p>
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-[var(--color-outline-variant)]/30 bg-[var(--color-surface-container-highest)]/10">
                      <th className="py-4 px-6 text-[10px] font-black uppercase tracking-[0.2em] text-[var(--color-on-surface-variant)]">Organization</th>
                      <th className="py-4 px-6 text-[10px] font-black uppercase tracking-[0.2em] text-[var(--color-on-surface-variant)]">Role</th>
                      <th className="py-4 px-6 text-[10px] font-black uppercase tracking-[0.2em] text-[var(--color-on-surface-variant)] text-right">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {missedInterviews.map((interview) => (
                      <tr key={interview._id} className="border-b border-[var(--color-outline-variant)]/20 hover:bg-[var(--color-surface-container-highest)]/10 transition-colors">
                        <td className="py-4 px-6">
                          <div className="font-bold text-sm text-[var(--color-on-surface)] mb-1">{interview.title}</div>
                          {interview.employer && (
                            <div className="text-[10px] font-black tracking-widest text-[var(--color-on-surface-variant)] uppercase">{interview.employer.name}</div>
                          )}
                        </td>
                        <td className="py-4 px-6">
                          <span className="flex items-center gap-2 text-sm text-[var(--color-on-surface-variant)] font-semibold">
                            <Briefcase className="w-4 h-4" />
                            {interview.jobRole}
                          </span>
                        </td>
                        <td className="py-4 px-6 text-right">
                          <span className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-[11px] font-black uppercase tracking-widest bg-[var(--color-error)]/10 text-[var(--color-error)] border border-[var(--color-error)]/20">
                            Missed
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </motion.section>
        )}

      </div>
    </div>
  );
};

export default CandidateDashboard;
