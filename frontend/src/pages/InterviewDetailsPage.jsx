import { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import api from "../services/api";
import toast from "react-hot-toast";
import {
  ArrowLeft,
  Loader2,
  Users,
  Briefcase,
  Clock,
  Tag,
  Hash,
  Key,
  CheckCircle2,
  MoreVertical,
  Calendar,
  Plus,
  Edit,
  Trash2,
  X,
  Search
} from "lucide-react";

const InterviewDetailsPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [interview, setInterview] = useState(null);
  const [loading, setLoading] = useState(true);
  const [searchCandidate, setSearchCandidate] = useState("");
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [newCandidateEmail, setNewCandidateEmail] = useState("");
  const [addingCandidate, setAddingCandidate] = useState(false);

  const fetchInterview = async () => {
    try {
      const { data } = await api.get(`/interviews/${id}`);
      if (data.success) {
        setInterview(data.interview);
      }
    } catch (error) {
      toast.error("Failed to load interview details");
      navigate("/employer/dashboard");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInterview();
  }, [id]);

  const deleteInterview = async () => {
    if (!window.confirm("Are you sure you want to delete this interview?")) return;
    try {
      const { data } = await api.delete(`/interviews/${id}`);
      if (data.success) {
        toast.success("Interview deleted");
        navigate("/employer/dashboard");
      }
    } catch (error) {
      toast.error("Failed to delete interview");
    }
  };

  const removeCandidate = async (email) => {
    if (!window.confirm(`Are you sure you want to remove ${email}?`)) return;
    try {
      const { data } = await api.patch(`/interviews/${id}`, { removeCandidateEmail: email });
      if (data.success) {
        toast.success("Candidate removed");
        setInterview(data.interview);
      }
    } catch (error) {
      toast.error("Failed to remove candidate");
    }
  };

  const addCandidate = async (e) => {
    e.preventDefault();
    if (!newCandidateEmail) return;
    
    setAddingCandidate(true);
    try {
      const { data } = await api.patch(`/interviews/${id}`, { addCandidateEmail: newCandidateEmail });
      if (data.success) {
        toast.success("Candidate added successfully");
        setInterview(data.interview);
        setNewCandidateEmail("");
        setIsAddModalOpen(false);
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to add candidate");
    } finally {
      setAddingCandidate(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-dark-900 flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary-400" />
      </div>
    );
  }

  if (!interview) return null;

  return (
    <div className="min-h-screen bg-dark-900 pt-20 relative overflow-hidden">
      {/* Background Glows */}
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-primary-500/10 rounded-full blur-3xl -z-10 animate-pulse-slow"></div>
      <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-accent-500/10 rounded-full blur-3xl -z-10 animate-pulse-slow" style={{ animationDelay: '1s' }}></div>
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 relative z-10 animate-fade-in-up">
        <button
          onClick={() => navigate("/employer/dashboard")}
          className="inline-flex items-center gap-2 text-dark-400 hover:text-dark-100 hover:-translate-x-1 transition-all duration-300 mb-6 font-medium"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Dashboard
        </button>

        <div className="space-y-8">
          {/* Details Section */}
          <div className="space-y-6">
            <div className="glass-light rounded-3xl p-6 sm:p-10 border border-dark-700/50 shadow-2xl shadow-black/20 hover:border-dark-600/50 transition-all duration-300">
              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-6 mb-8">
                <div>
                  <h1 className="text-3xl sm:text-4xl font-extrabold bg-gradient-to-r from-white via-primary-100 to-dark-200 bg-clip-text text-transparent tracking-tight">
                    {interview.title}
                  </h1>
                  <p className="text-dark-400 mt-3 flex items-center gap-2 font-medium text-lg">
                    <Briefcase className="w-5 h-5 text-dark-300" />
                    {interview.jobRole}
                  </p>
                </div>
                <div className="flex flex-wrap gap-2">
                  <span className="px-3 py-2 bg-dark-700 border border-dark-600 rounded-lg flex items-center gap-2 text-sm text-dark-200 font-mono h-10">
                    <Key className="w-3.5 h-3.5 text-primary-400" />
                    {interview.interviewCode}
                  </span>
                  <Link 
                    to={`/employer/interviews/${interview._id}/edit`}
                    className="px-4 py-2 rounded-xl bg-dark-700/50 text-dark-200 hover:text-white hover:bg-primary-600 transition-all duration-300 flex items-center gap-2 text-sm font-medium h-10 border border-dark-600/50 hover:border-primary-500 hover:shadow-lg hover:shadow-primary-500/20 hover:-translate-y-0.5"
                  >
                    <Edit className="w-4 h-4" />
                    Edit
                  </Link>
                  <button 
                    onClick={deleteInterview}
                    className="px-4 py-2 rounded-xl bg-dark-700/50 text-dark-200 hover:text-danger-50 hover:bg-danger-600 transition-all duration-300 flex items-center gap-2 text-sm font-medium h-10 border border-dark-600/50 hover:border-danger-500 hover:shadow-lg hover:shadow-danger-500/20 hover:-translate-y-0.5"
                  >
                    <Trash2 className="w-4 h-4" />
                    Delete
                  </button>
                </div>
              </div>

              <div className="flex flex-wrap gap-4 mb-10">
                <span className="flex items-center gap-2 px-4 py-2 rounded-xl bg-warning-500/10 text-warning-400 text-sm font-medium border border-warning-500/20">
                  <Clock className="w-4 h-4" />
                  {interview.duration} Minutes
                </span>
                <span className="flex items-center gap-2 px-4 py-2 rounded-xl bg-accent-500/10 text-accent-400 text-sm font-medium capitalize border border-accent-500/20">
                  <Tag className="w-4 h-4" />
                  {interview.experienceLevel}
                </span>
                <span className="flex items-center gap-2 px-4 py-2 rounded-xl bg-info-500/10 text-info-400 text-sm font-medium border border-info-500/20">
                  <Calendar className="w-4 h-4" />
                  {new Date(interview.createdAt).toLocaleDateString()}
                </span>
              </div>

              <div className="space-y-8 text-base">
                <div>
                  <h3 className="text-lg text-dark-100 font-semibold mb-3 flex items-center gap-2">
                    <div className="w-8 h-8 rounded-lg bg-dark-700/50 flex items-center justify-center border border-dark-600/50">
                      <Briefcase className="w-4 h-4 text-primary-400" />
                    </div>
                    Description
                  </h3>
                  <p className="text-dark-400 leading-relaxed ml-10">
                    {interview.description || "No description provided."}
                  </p>
                </div>
                
                {interview.topics && interview.topics.length > 0 && (
                  <div>
                    <h3 className="text-lg text-dark-100 font-semibold mb-3 flex items-center gap-2">
                      <div className="w-8 h-8 rounded-lg bg-dark-700/50 flex items-center justify-center border border-dark-600/50">
                        <Tag className="w-4 h-4 text-accent-400" />
                      </div>
                      Topics
                    </h3>
                    <div className="flex flex-wrap gap-2 ml-10">
                      {interview.topics.map(t => (
                        <span key={t} className="px-3 py-1.5 rounded-lg bg-dark-800/80 text-dark-200 border border-dark-600/50 hover:bg-dark-700 transition-colors shadow-sm">
                          {t}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                <div>
                  <h3 className="text-lg text-dark-100 font-semibold mb-3 flex items-center gap-2">
                    <div className="w-8 h-8 rounded-lg bg-dark-700/50 flex items-center justify-center border border-dark-600/50">
                      <CheckCircle2 className="w-4 h-4 text-success-400" />
                    </div>
                    Instructions
                  </h3>
                  <p className="text-dark-400 leading-relaxed ml-10">
                    {interview.instructions || "No specific instructions provided."}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Candidates Section */}
          <div className="animate-fade-in-up-delay-1">
            <div className="glass-light rounded-3xl overflow-hidden flex flex-col border border-dark-700/50 shadow-2xl shadow-black/20">
              <div className="px-8 py-6 border-b border-dark-700/50 bg-dark-800/30 flex flex-col sm:flex-row sm:items-center justify-between gap-6 backdrop-blur-md">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-xl bg-info-500/10 flex items-center justify-center border border-info-500/20">
                    <Users className="w-5 h-5 text-info-400" />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-dark-50">Assigned Candidates</h2>
                    <p className="text-sm text-dark-400 mt-0.5">
                      {interview.assignedCandidates?.length || 0} candidate(s) total
                    </p>
                  </div>
                </div>
                <div className="relative w-full sm:w-72">
                  <Search className="w-4 h-4 text-dark-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    placeholder="Search candidate by email..."
                    value={searchCandidate}
                    onChange={(e) => setSearchCandidate(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 bg-dark-900/50 border border-dark-600/50 rounded-xl text-sm text-dark-50 focus:outline-none focus:border-primary-500 focus:ring-1 focus:ring-primary-500/50 transition-all shadow-inner"
                  />
                </div>
              </div>
              <div className="flex-1 overflow-auto custom-scrollbar">
                {interview.assignedCandidates?.length === 0 ? (
                  <div className="text-center py-10 text-dark-400">
                    <Users className="w-10 h-10 mx-auto mb-3 opacity-50" />
                    <p>No candidates assigned yet.</p>
                  </div>
                ) : (
                  <div className="min-w-[800px]">
                    <table className="w-full text-left border-collapse">
                      <thead className="bg-dark-800/80 sticky top-0 z-10 backdrop-blur-sm border-b border-dark-700">
                        <tr>
                          <th className="px-6 py-3 text-xs font-medium text-dark-300 uppercase tracking-wider">Candidate Email</th>
                          <th className="px-6 py-3 text-xs font-medium text-dark-300 uppercase tracking-wider">Status</th>
                          <th className="px-6 py-3 text-xs font-medium text-dark-300 uppercase tracking-wider">Joined At</th>
                          <th className="px-6 py-3 text-xs font-medium text-dark-300 uppercase tracking-wider">Submitted At</th>
                          <th className="px-6 py-3 text-xs font-medium text-dark-300 uppercase tracking-wider">View Result</th>
                          <th className="px-6 py-3 text-xs font-medium text-dark-300 uppercase tracking-wider text-right">Delete</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-dark-700/50">
                        {interview.assignedCandidates
                          ?.filter((c) => c.email.toLowerCase().includes(searchCandidate.toLowerCase()))
                          .map((candidate, idx) => (
                            <tr key={idx} className="hover:bg-dark-700/30 transition-colors group">
                              <td className="px-6 py-4 whitespace-nowrap">
                                <div className="text-sm font-medium text-dark-100" title={candidate.email}>
                                  {candidate.email}
                                </div>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <span className="text-xs flex items-center gap-1.5 text-dark-200">
                                  {candidate.status === "Pending" && <span className="w-2 h-2 rounded-full bg-dark-400" />}
                                  {candidate.status === "In Progress" && <span className="w-2 h-2 rounded-full bg-warning-400" />}
                                  {candidate.status === "Completed" && <span className="w-2 h-2 rounded-full bg-success-400" />}
                                  {candidate.status}
                                </span>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-dark-400">
                                {candidate.joinedAt ? new Date(candidate.joinedAt).toLocaleString() : "-"}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-dark-400">
                                {candidate.submittedAt ? new Date(candidate.submittedAt).toLocaleString() : "-"}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm">
                                {candidate.status === "Completed" ? (
                                  <button className="text-primary-400 hover:text-primary-300 font-medium transition-colors">
                                    View Result
                                  </button>
                                ) : (
                                  <span className="text-dark-500">-</span>
                                )}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-right">
                                <button
                                  onClick={() => removeCandidate(candidate.email)}
                                  className="p-1.5 rounded-lg text-dark-400 hover:text-danger-400 hover:bg-dark-700 transition-colors inline-block"
                                  title="Delete Candidate"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              </td>
                            </tr>
                          ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
              <div className="p-6 border-t border-dark-700/50 bg-dark-800/30 flex justify-end">
                <button
                  onClick={() => setIsAddModalOpen(true)}
                  className="px-6 py-2.5 rounded-xl bg-primary-600 text-white hover:bg-primary-500 transition-all duration-300 flex items-center justify-center gap-2 font-medium shadow-lg shadow-primary-500/20 hover:shadow-primary-500/40 hover:-translate-y-0.5"
                >
                  <Plus className="w-5 h-5" />
                  Add Candidate
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Add Candidate Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-dark-900/80 backdrop-blur-sm animate-fade-in">
          <div className="bg-dark-800 border border-dark-700 rounded-2xl w-full max-w-md overflow-hidden shadow-2xl shadow-black/50">
            <div className="p-6 border-b border-dark-700 flex items-center justify-between">
              <h3 className="text-xl font-bold text-dark-50">Add Candidate</h3>
              <button 
                onClick={() => setIsAddModalOpen(false)}
                className="p-2 rounded-lg text-dark-400 hover:text-dark-100 hover:bg-dark-700 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={addCandidate} className="p-6 space-y-6">
              <div>
                <label className="block text-sm font-medium text-dark-200 mb-2">
                  Candidate Email
                </label>
                <input
                  type="email"
                  required
                  value={newCandidateEmail}
                  onChange={(e) => setNewCandidateEmail(e.target.value)}
                  placeholder="Enter candidate's email address"
                  className="w-full px-4 py-3 bg-dark-900 border border-dark-600 rounded-xl text-dark-50 placeholder-dark-500 focus:outline-none focus:border-primary-500 focus:ring-1 focus:ring-primary-500/50 transition-all"
                />
              </div>
              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-5 py-2.5 rounded-xl text-dark-300 hover:text-dark-100 font-medium transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={addingCandidate || !newCandidateEmail}
                  className="px-6 py-2.5 rounded-xl bg-primary-600 text-white font-medium hover:bg-primary-500 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                >
                  {addingCandidate ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Adding...
                    </>
                  ) : (
                    "Add Candidate"
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default InterviewDetailsPage;
