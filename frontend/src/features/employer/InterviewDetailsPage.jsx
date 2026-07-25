import { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import api from "../../services/api";
import toast from "react-hot-toast";
import {
  ArrowLeft,
  Loader2,
  Users,
  Briefcase,
  Clock,
  Tag,
  Key,
  CheckCircle2,
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
      <div className="min-h-screen bg-[var(--color-bg-base)] flex items-center justify-center">
        <Loader2 className="w-10 h-10 animate-spin text-[var(--color-accent-blue)]" />
      </div>
    );
  }

  if (!interview) return null;

  return (
    <div className="min-h-screen bg-[var(--color-bg-base)] pt-24 pb-12 relative overflow-hidden">
      {/* Background Glows */}
      <div className="absolute inset-0 noise pointer-events-none z-0"></div>
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-[var(--color-accent-violet)] rounded-full blur-[150px] opacity-20 -z-10 animate-pulse-glow"></div>
      <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-[var(--color-accent-blue)] rounded-full blur-[150px] opacity-20 -z-10 animate-pulse-glow" style={{ animationDelay: '1.5s' }}></div>
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 animate-fade-in-up">
        <button
          onClick={() => navigate(-1)}
          className="inline-flex items-center gap-2 text-[var(--color-text-secondary)] hover:text-[var(--color-on-surface)] hover:-translate-x-1 transition-all duration-300 mb-8 font-medium"
        >
          <ArrowLeft className="w-4 h-4" />
          Back
        </button>

        <div className="space-y-8">
          {/* Details Section */}
          <div className="space-y-6">
            <div className="surface-elevated p-8 sm:p-10">
              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-6 mb-8">
                <div>
                  <h1 className="text-3xl sm:text-4xl font-black text-[var(--color-on-surface)] tracking-tight">
                    {interview.title}
                  </h1>
                  <p className="text-[var(--color-text-secondary)] mt-3 flex items-center gap-2 font-medium text-lg">
                    <Briefcase className="w-5 h-5 text-[var(--color-accent-blue)]" />
                    {interview.jobRole}
                  </p>
                </div>
                <div className="flex flex-wrap gap-3">
                  <span className="badge badge-muted flex items-center gap-2 h-10 px-4 text-sm font-mono">
                    <Key className="w-4 h-4 text-[var(--color-accent-blue)]" />
                    {interview.interviewCode}
                  </span>
                  <Link 
                    to={`/employer/interviews/${interview._id}/edit`}
                    className="btn-secondary h-10 px-4 flex items-center gap-2"
                  >
                    <Edit className="w-4 h-4" />
                    Edit
                  </Link>
                  <button 
                    onClick={deleteInterview}
                    className="btn-danger h-10 px-4 flex items-center gap-2"
                  >
                    <Trash2 className="w-4 h-4" />
                    Delete
                  </button>
                </div>
              </div>

              <div className="flex flex-wrap gap-4 mb-10">
                <span className="flex items-center gap-2 px-4 py-2 rounded-xl bg-[rgba(245,158,11,0.1)] text-[var(--color-accent-amber)] text-sm font-medium border border-[rgba(245,158,11,0.2)]">
                  <Clock className="w-4 h-4" />
                  {interview.duration} Minutes
                </span>
                <span className="flex items-center gap-2 px-4 py-2 rounded-xl bg-[rgba(45,212,191,0.1)] text-[var(--color-accent-teal)] text-sm font-medium capitalize border border-[rgba(45,212,191,0.2)]">
                  <Tag className="w-4 h-4" />
                  {interview.experienceLevel}
                </span>
                <span className="flex items-center gap-2 px-4 py-2 rounded-xl bg-[rgba(79,142,247,0.1)] text-[var(--color-accent-blue)] text-sm font-medium border border-[rgba(79,142,247,0.2)]">
                  <Calendar className="w-4 h-4" />
                  {new Date(interview.createdAt).toLocaleDateString()}
                </span>
              </div>

              <div className="space-y-8 text-base">
                <div>
                  <h3 className="text-lg text-[var(--color-on-surface)] font-bold mb-3 flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-[var(--color-bg-elevated)] flex items-center justify-center border border-[var(--color-border-default)]">
                      <Briefcase className="w-5 h-5 text-[var(--color-accent-blue)]" />
                    </div>
                    Description
                  </h3>
                  <p className="text-[var(--color-text-secondary)] leading-relaxed ml-14">
                    {interview.description || "No description provided."}
                  </p>
                </div>
                
                {interview.topics && interview.topics.length > 0 && (
                  <div>
                    <h3 className="text-lg text-[var(--color-on-surface)] font-bold mb-3 flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-[var(--color-bg-elevated)] flex items-center justify-center border border-[var(--color-border-default)]">
                        <Tag className="w-5 h-5 text-[var(--color-accent-teal)]" />
                      </div>
                      Topics
                    </h3>
                    <div className="flex flex-wrap gap-2 ml-14">
                      {interview.topics.map(t => (
                        <span key={t} className="px-3 py-1.5 rounded-lg bg-[var(--color-bg-surface)] text-[var(--color-text-secondary)] border border-[var(--color-border-subtle)] font-medium text-sm">
                          {t}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                <div>
                  <h3 className="text-lg text-[var(--color-on-surface)] font-bold mb-3 flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-[var(--color-bg-elevated)] flex items-center justify-center border border-[var(--color-border-default)]">
                      <CheckCircle2 className="w-5 h-5 text-[var(--color-accent-teal)]" />
                    </div>
                    Instructions
                  </h3>
                  <p className="text-[var(--color-text-secondary)] leading-relaxed ml-14">
                    {interview.instructions || "No specific instructions provided."}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Candidates Section */}
          <div className="animate-fade-in-up-delay-1">
            <div className="surface-elevated overflow-hidden flex flex-col p-0">
              <div className="px-8 py-6 border-b border-[var(--color-border-subtle)] bg-[var(--color-bg-overlay)] flex flex-col sm:flex-row sm:items-center justify-between gap-6 backdrop-blur-md">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl bg-[rgba(79,142,247,0.15)] flex items-center justify-center border border-[rgba(79,142,247,0.3)] shadow-[var(--color-accent-blue-glow)] shadow-lg">
                    <Users className="w-6 h-6 text-[var(--color-accent-blue)]" />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-[var(--color-on-surface)] tracking-tight">Assigned Candidates</h2>
                    <p className="text-sm text-[var(--color-text-muted)] mt-1 font-medium">
                      {interview.assignedCandidates?.length || 0} candidate(s) total
                    </p>
                  </div>
                </div>
                <div className="relative w-full sm:w-72 group">
                  <Search className="w-5 h-5 text-[var(--color-text-muted)] absolute left-3.5 top-1/2 -translate-y-1/2 group-focus-within:text-[var(--color-accent-blue)] transition-colors" />
                  <input
                    type="text"
                    placeholder="Search candidate by email..."
                    value={searchCandidate}
                    onChange={(e) => setSearchCandidate(e.target.value)}
                    className="input-field w-full pl-11 py-2.5 text-sm"
                  />
                </div>
              </div>
              
              <div className="flex-1 overflow-auto custom-scrollbar">
                {interview.assignedCandidates?.length === 0 ? (
                  <div className="text-center py-16 text-[var(--color-text-muted)]">
                    <Users className="w-12 h-12 mx-auto mb-4 opacity-50 text-[var(--color-text-muted)]" />
                    <p className="font-medium text-lg text-[var(--color-text-secondary)]">No candidates assigned yet.</p>
                  </div>
                ) : (
                  <div className="min-w-[800px]">
                    <table className="w-full text-left border-collapse">
                      <thead className="bg-[var(--color-bg-overlay)] sticky top-0 z-10 backdrop-blur-sm border-b border-[var(--color-border-subtle)]">
                        <tr>
                          <th className="px-6 py-4 text-xs font-bold text-[var(--color-text-muted)] uppercase tracking-wider">Candidate Email</th>
                          <th className="px-6 py-4 text-xs font-bold text-[var(--color-text-muted)] uppercase tracking-wider">Status</th>
                          <th className="px-6 py-4 text-xs font-bold text-[var(--color-text-muted)] uppercase tracking-wider">Joined At</th>
                          <th className="px-6 py-4 text-xs font-bold text-[var(--color-text-muted)] uppercase tracking-wider">Submitted At</th>
                          <th className="px-6 py-4 text-xs font-bold text-[var(--color-text-muted)] uppercase tracking-wider">View Result</th>
                          <th className="px-6 py-4 text-xs font-bold text-[var(--color-text-muted)] uppercase tracking-wider text-right">Delete</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-[var(--color-border-subtle)]">
                        {interview.assignedCandidates
                          ?.filter((c) => c.email.toLowerCase().includes(searchCandidate.toLowerCase()))
                          .map((candidate, idx) => (
                            <tr key={idx} className="hover:bg-[var(--color-bg-overlay)] transition-colors group">
                              <td className="px-6 py-5 whitespace-nowrap">
                                <div className="text-sm font-bold text-[var(--color-on-surface)]" title={candidate.email}>
                                  {candidate.email}
                                </div>
                              </td>
                              <td className="px-6 py-5 whitespace-nowrap">
                                <span className="text-xs font-bold uppercase tracking-wider flex items-center gap-2 text-[var(--color-text-secondary)]">
                                  {candidate.status === "Pending" && <span className="w-2.5 h-2.5 rounded-full bg-[var(--color-text-muted)]" />}
                                  {candidate.status === "In Progress" && <span className="w-2.5 h-2.5 rounded-full bg-[var(--color-accent-amber)]" />}
                                  {candidate.status === "Completed" && <span className="w-2.5 h-2.5 rounded-full bg-[var(--color-accent-teal)] shadow-[var(--color-accent-teal-glow)] shadow-md" />}
                                  {candidate.status}
                                </span>
                              </td>
                              <td className="px-6 py-5 whitespace-nowrap text-sm text-[var(--color-text-secondary)] font-medium">
                                {candidate.joinedAt ? new Date(candidate.joinedAt).toLocaleString() : "-"}
                              </td>
                              <td className="px-6 py-5 whitespace-nowrap text-sm text-[var(--color-text-secondary)] font-medium">
                                {candidate.submittedAt ? new Date(candidate.submittedAt).toLocaleString() : "-"}
                              </td>
                              <td className="px-6 py-5 whitespace-nowrap text-sm">
                                {candidate.status === "Completed" ? (
                                  <Link 
                                    to={`/employer/interviews/${id}/results/${candidate.resultId}`}
                                    className="text-[var(--color-accent-blue)] hover:text-[var(--color-on-surface)] font-bold transition-colors underline underline-offset-4 decoration-[var(--color-accent-blue-glow)] hover:decoration-[var(--color-accent-blue)]"
                                  >
                                    View Result
                                  </Link>
                                ) : (
                                  <span className="text-[var(--color-text-muted)]">-</span>
                                )}
                              </td>
                              <td className="px-6 py-5 whitespace-nowrap text-right">
                                <button
                                  onClick={() => removeCandidate(candidate.email)}
                                  className="p-2 rounded-lg text-[var(--color-text-muted)] hover:text-[var(--color-accent-red)] hover:bg-[rgba(244,63,94,0.1)] transition-colors inline-block"
                                  title="Delete Candidate"
                                >
                                  <Trash2 className="w-5 h-5" />
                                </button>
                              </td>
                            </tr>
                          ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
              
              <div className="p-6 border-t border-[var(--color-border-subtle)] bg-[var(--color-bg-overlay)] flex justify-end">
                <button
                  onClick={() => setIsAddModalOpen(true)}
                  className="btn-primary flex items-center gap-2"
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
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
          <div className="surface-elevated rounded-2xl w-full max-w-md overflow-hidden shadow-2xl">
            <div className="p-6 border-b border-[var(--color-border-subtle)] flex items-center justify-between bg-[var(--color-bg-overlay)]">
              <h3 className="text-xl font-bold text-[var(--color-on-surface)]">Add Candidate</h3>
              <button 
                onClick={() => setIsAddModalOpen(false)}
                className="p-2 rounded-lg text-[var(--color-text-muted)] hover:text-[var(--color-on-surface)] hover:bg-[var(--color-bg-elevated)] transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={addCandidate} className="p-6 space-y-6">
              <div>
                <label className="block text-sm font-medium text-[var(--color-text-secondary)] mb-2">
                  Candidate Email
                </label>
                <input
                  type="email"
                  required
                  value={newCandidateEmail}
                  onChange={(e) => setNewCandidateEmail(e.target.value)}
                  placeholder="Enter candidate's email address"
                  className="input-field w-full px-4 py-3"
                />
              </div>
              <div className="flex justify-end gap-3 pt-4 border-t border-[var(--color-border-subtle)] mt-6">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="btn-secondary py-2.5 px-5"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={addingCandidate || !newCandidateEmail}
                  className="btn-primary py-2.5 px-6 flex items-center gap-2"
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
