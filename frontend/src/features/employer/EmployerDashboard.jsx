import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import api from "../../services/api";
import { toast } from "react-hot-toast";
import {
  FileText,
  Users,
  Eye,
  Loader2,
  Briefcase,
  Filter,
  Activity,
  Plus
} from "lucide-react";
import { motion } from "framer-motion";

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
      toast.error("Failed to load campaigns");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInterviews();
  }, []);

  const totalCampaigns = interviews.length;
  const activeCampaigns = interviews.filter(i => i.status === 'active').length;
  const totalCandidates = interviews.reduce((acc, curr) => acc + (curr.assignedCandidates?.length || 0), 0);
  const activeCandidates = interviews.filter(i => i.status === 'active').reduce((acc, curr) => acc + (curr.assignedCandidates?.length || 0), 0);

  const getStatusStyle = (status) => {
    const styles = {
      active: "bg-[var(--color-success)]/10 text-[var(--color-success)] border-[var(--color-success)]/20",
      completed: "bg-[var(--color-primary-md3)]/10 text-[var(--color-primary-md3)] border-[var(--color-primary-md3)]/20",
      draft: "bg-[var(--color-surface-variant)] text-[var(--color-on-surface-variant)] border-[var(--color-outline-variant)]/30",
      archived: "bg-[var(--color-error)]/10 text-[var(--color-error)] border-[var(--color-error)]/20",
    };
    return styles[status] || styles.draft;
  };

  const getDifficultyStyle = (experienceLevel) => {
    const styles = {
      "Fresher": "bg-[var(--color-tertiary)]/10 text-[var(--color-tertiary)] border-[var(--color-tertiary)]/20",
      "1-2 Years": "bg-[var(--color-secondary)]/10 text-[var(--color-secondary)] border-[var(--color-secondary)]/20",
      "3-5 Years": "bg-[var(--color-warning)]/10 text-[var(--color-warning)] border-[var(--color-warning)]/20",
      "5+ Years": "bg-[var(--color-error)]/10 text-[var(--color-error)] border-[var(--color-error)]/20",
    };
    return styles[experienceLevel] || "bg-[var(--color-surface-variant)] text-[var(--color-on-surface-variant)] border-[var(--color-outline-variant)]/30";
  };

  return (
    <div className="bg-[var(--color-background-md3,var(--background))] min-h-screen text-[var(--color-on-background)] font-['Inter']">
      
      {/* Main Content Area */}
      <div className="flex-1 w-full max-w-[1440px] mx-auto p-4 md:p-8 space-y-8">
        
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
              Welcome back, {user?.name}. Here is what's happening.
            </p>
          </div>
        </motion.div>

        {/* Core Metrics */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
            {/* Metric 1 */}
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="bg-[var(--color-surface-container-low)] border border-[var(--color-outline-variant)]/30 rounded-2xl p-6 shadow-xl relative overflow-hidden group">
                <div className="absolute top-0 right-0 w-32 h-32 bg-[var(--color-primary-md3)]/10 rounded-full blur-[40px] pointer-events-none transition-all group-hover:bg-[var(--color-primary-md3)]/20"></div>
                <div className="relative z-10 flex justify-between items-start mb-4">
                    <div className="w-10 h-10 rounded-full bg-[var(--color-primary-md3)]/10 flex items-center justify-center">
                        <FileText className="w-5 h-5 text-[var(--color-primary-md3)]" />
                    </div>
                </div>
                <p className="text-[11px] font-black text-[var(--color-on-surface-variant)] uppercase tracking-widest mb-1">Total Campaigns</p>
                <h3 className="text-4xl font-black text-[var(--color-on-surface)]">{totalCampaigns}</h3>
            </motion.div>

            {/* Metric 2 */}
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="bg-[var(--color-surface-container-low)] border border-[var(--color-outline-variant)]/30 rounded-2xl p-6 shadow-xl relative overflow-hidden group">
                <div className="absolute top-0 right-0 w-32 h-32 bg-[var(--color-success)]/10 rounded-full blur-[40px] pointer-events-none transition-all group-hover:bg-[var(--color-success)]/20"></div>
                <div className="relative z-10 flex justify-between items-start mb-4">
                    <div className="w-10 h-10 rounded-full bg-[var(--color-success)]/10 flex items-center justify-center">
                        <Activity className="w-5 h-5 text-[var(--color-success)]" />
                    </div>
                </div>
                <p className="text-[11px] font-black text-[var(--color-on-surface-variant)] uppercase tracking-widest mb-1">Active Campaigns</p>
                <h3 className="text-4xl font-black text-[var(--color-on-surface)]">{activeCampaigns}</h3>
            </motion.div>

            {/* Metric 3 */}
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="bg-[var(--color-surface-container-low)] border border-[var(--color-outline-variant)]/30 rounded-2xl p-6 shadow-xl relative overflow-hidden group">
                <div className="absolute top-0 right-0 w-32 h-32 bg-[var(--color-tertiary)]/10 rounded-full blur-[40px] pointer-events-none transition-all group-hover:bg-[var(--color-tertiary)]/20"></div>
                <div className="relative z-10 flex justify-between items-start mb-4">
                    <div className="w-10 h-10 rounded-full bg-[var(--color-tertiary)]/10 flex items-center justify-center">
                        <Users className="w-5 h-5 text-[var(--color-tertiary)]" />
                    </div>
                </div>
                <p className="text-[11px] font-black text-[var(--color-on-surface-variant)] uppercase tracking-widest mb-1">Total Candidates</p>
                <h3 className="text-4xl font-black text-[var(--color-on-surface)]">{totalCandidates}</h3>
            </motion.div>

            {/* Metric 4 */}
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }} className="bg-[var(--color-surface-container-low)] border border-[var(--color-outline-variant)]/30 rounded-2xl p-6 shadow-xl relative overflow-hidden group">
                <div className="absolute top-0 right-0 w-32 h-32 bg-[var(--color-warning)]/10 rounded-full blur-[40px] pointer-events-none transition-all group-hover:bg-[var(--color-warning)]/20"></div>
                <div className="relative z-10 flex justify-between items-start mb-4">
                    <div className="w-10 h-10 rounded-full bg-[var(--color-warning)]/10 flex items-center justify-center">
                        <Eye className="w-5 h-5 text-[var(--color-warning)]" />
                    </div>
                </div>
                <p className="text-[11px] font-black text-[var(--color-on-surface-variant)] uppercase tracking-widest mb-1">Active Candidates</p>
                <h3 className="text-4xl font-black text-[var(--color-on-surface)]">{activeCandidates}</h3>
            </motion.div>
        </div>

        {/* Campaigns List */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }}>
          <div className="bg-[var(--color-surface-container-low)] border border-[var(--color-surface-variant)] rounded-2xl shadow-xl overflow-hidden">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between p-6 border-b border-[var(--color-outline-variant)]/30 bg-[var(--color-surface-container-highest)]/20">
              <div>
                <h2 className="text-xl font-black tracking-tight text-[var(--color-on-surface)] uppercase">Recent Campaigns</h2>
                <p className="text-xs text-[var(--color-on-surface-variant)] mt-1 font-bold tracking-wider">Manage your active and past interview campaigns.</p>
              </div>
              <div className="mt-4 sm:mt-0 flex gap-3">
                <button className="px-4 py-2 bg-[var(--color-surface-variant)]/50 hover:bg-[var(--color-surface-variant)] text-[var(--color-on-surface)] rounded-xl text-xs font-black uppercase tracking-widest transition-colors flex items-center border border-[var(--color-outline-variant)]/30">
                  <Filter className="w-4 h-4 mr-2" />
                  Filter
                </button>
              </div>
            </div>

            {loading ? (
              <div className="flex items-center justify-center py-24">
                <Loader2 className="w-8 h-8 animate-spin text-[var(--color-primary-md3)]" />
              </div>
            ) : interviews.length === 0 ? (
              <div className="text-center py-24 px-4">
                <div className="w-16 h-16 rounded-2xl bg-[var(--color-surface-variant)] flex items-center justify-center mx-auto mb-6">
                    <FileText className="w-8 h-8 text-[var(--color-on-surface-variant)]" />
                </div>
                <h3 className="text-lg font-black text-[var(--color-on-surface)] uppercase tracking-wider mb-2">No campaigns yet</h3>
                <p className="text-[var(--color-on-surface-variant)] mb-8 max-w-md mx-auto text-sm">Create your first AI-driven interview campaign to start evaluating candidates smartly.</p>
                <Link to="/employer/create-interview">
                  <button className="px-6 py-3 bg-[var(--color-primary-md3)] text-white rounded-xl text-sm font-black uppercase tracking-widest hover:bg-[var(--color-primary-md3)]/90 transition-colors shadow-lg shadow-[var(--color-primary-md3)]/30 flex items-center mx-auto">
                    <Plus className="w-5 h-5 mr-2" /> Create First Campaign
                  </button>
                </Link>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-[var(--color-outline-variant)]/30 bg-[var(--color-surface-container-highest)]/10">
                      <th className="py-4 px-6 text-[10px] font-black uppercase tracking-[0.2em] text-[var(--color-on-surface-variant)]">Campaign Title</th>
                      <th className="py-4 px-6 text-[10px] font-black uppercase tracking-[0.2em] text-[var(--color-on-surface-variant)]">Role</th>
                      <th className="py-4 px-6 text-[10px] font-black uppercase tracking-[0.2em] text-[var(--color-on-surface-variant)]">Experience</th>
                      <th className="py-4 px-6 text-[10px] font-black uppercase tracking-[0.2em] text-[var(--color-on-surface-variant)]">Status</th>
                      <th className="py-4 px-6 text-[10px] font-black uppercase tracking-[0.2em] text-[var(--color-on-surface-variant)] text-center">Candidates</th>
                      <th className="py-4 px-6 text-[10px] font-black uppercase tracking-[0.2em] text-[var(--color-on-surface-variant)] text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {interviews.map((interview) => (
                      <tr key={interview._id} className="border-b border-[var(--color-outline-variant)]/20 hover:bg-[var(--color-surface-container-highest)]/10 transition-colors group">
                        <td className="py-4 px-6">
                          <div className="font-bold text-sm text-[var(--color-on-surface)] mb-1">{interview.title}</div>
                          <div className="text-[10px] font-black tracking-widest text-[var(--color-on-surface-variant)] uppercase">Code: {interview.interviewCode}</div>
                        </td>
                        <td className="py-4 px-6">
                          <span className="flex items-center gap-2 text-sm text-[var(--color-on-surface-variant)] font-semibold">
                            <Briefcase className="w-4 h-4" />
                            {interview.jobRole}
                          </span>
                        </td>
                        <td className="py-4 px-6">
                          <span className={`px-2.5 py-1 rounded text-[9px] font-black uppercase tracking-widest border ${getDifficultyStyle(interview.experienceLevel)}`}>
                            {interview.experienceLevel}
                          </span>
                        </td>
                        <td className="py-4 px-6">
                          <span className={`px-2.5 py-1 rounded text-[9px] font-black uppercase tracking-widest border ${getStatusStyle(interview.status)}`}>
                            {interview.status}
                          </span>
                        </td>
                        <td className="py-4 px-6 text-center">
                          <span className="inline-flex items-center justify-center gap-2 px-3 py-1 bg-[var(--color-surface-variant)]/50 rounded-full text-xs font-bold text-[var(--color-on-surface)]">
                            <Users className="w-3.5 h-3.5 text-[var(--color-on-surface-variant)]" />
                            {interview.assignedCandidates?.length || 0}
                          </span>
                        </td>
                        <td className="py-4 px-6 text-right">
                          <Link to={`/employer/interviews/${interview._id}`}>
                            <button className="inline-flex items-center gap-2 px-4 py-2 bg-transparent hover:bg-[var(--color-primary-md3)]/10 text-[var(--color-primary-md3)] rounded-xl text-[11px] font-black uppercase tracking-widest transition-colors opacity-0 group-hover:opacity-100 focus:opacity-100">
                              View Details
                              <Eye className="w-4 h-4" />
                            </button>
                          </Link>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </motion.div>

      </div>
    </div>
  );
};

export default EmployerDashboard;
