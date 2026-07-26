import { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import api from "../../services/api";
import { ArrowLeft, Loader2, AlertCircle, RefreshCw, Clock, FileQuestion } from "lucide-react";

import { CandidateWorkspace } from "../../modules/candidate-workspace/index";

export default function EmployerInterviewResultPage() {
  const { id: interviewId, resultId } = useParams();
  const navigate = useNavigate();
  const [resultData, setResultData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [errorStatus, setErrorStatus] = useState(null);
  
  const [showReEnrollModal, setShowReEnrollModal] = useState(false);
  const [isReEnrolling, setIsReEnrolling] = useState(false);

  useEffect(() => {
    fetchResult();
  }, [interviewId, resultId]);

  const fetchResult = async () => {
    setLoading(true);
    setError(null);
    setErrorStatus(null);
    try {
      const { data } = await api.get(
        `/interviews/${interviewId}/results/${resultId}`
      );
      setResultData(data.result);
    } catch (err) {
      const status = err.response?.status;
      setErrorStatus(status);
      if (status === 404) {
        setError("Evaluation not available yet.");
      } else {
        setError("Unable to load evaluation. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleReEnrollConfirm = async () => {
    setIsReEnrolling(true);
    try {
      const candidateId = resultData?.candidate?.id;
      if (!candidateId) throw new Error("Candidate ID not found");
      
      await api.post(`/interviews/${interviewId}/candidates/${candidateId}/re-enroll`);
      toast.success("Candidate re-enrolled successfully");
      setShowReEnrollModal(false);
      navigate(`/employer/interviews/${interviewId}`);
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to re-enroll candidate");
    } finally {
      setIsReEnrolling(false);
    }
  };

  return (
    <div className="bg-[var(--background)] relative">
      {/* Background Noise */}
      <div className="absolute inset-0 noise pointer-events-none z-0"></div>

      {loading && (
        <div className="min-h-[80vh] flex flex-col items-center justify-center gap-4 relative z-10">
          <Loader2 className="w-10 h-10 animate-spin text-[var(--primary)]" />
          <p className="text-[var(--text-secondary)] font-medium animate-pulse">Loading evaluation dashboard...</p>
        </div>
      )}

      {error && !loading && (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 animate-fade-in-up">
          <div className="mb-8">
            <Link
              to={`/employer/interviews/${interviewId}`}
              className="inline-flex items-center gap-2 text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors text-sm font-medium"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to Interview
            </Link>
          </div>
          <div className="bg-[var(--card)] border border-[var(--border)] rounded-2xl p-12 flex flex-col items-center text-center shadow-lg">
            {errorStatus === 404 ? (
              <>
                <FileQuestion className="w-16 h-16 text-[var(--text-secondary)] opacity-50 mb-6" />
                <h2 className="text-2xl font-bold text-[var(--text-primary)] mb-2 tracking-tight">No Result Found</h2>
                <p className="text-[var(--text-secondary)] max-w-md">{error}</p>
              </>
            ) : (
              <>
                <AlertCircle className="w-16 h-16 text-[var(--color-danger)] mb-6" />
                <h2 className="text-2xl font-bold text-[var(--text-primary)] mb-2 tracking-tight">Error</h2>
                <p className="text-[var(--color-danger)] max-w-md opacity-80">{error}</p>
              </>
            )}
          </div>
        </div>
      )}

      {!loading && !error && resultData && resultData.evaluation.status !== "COMPLETED" && (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 animate-fade-in-up">
          <div className="mb-8">
            <Link
              to={`/employer/interviews/${interviewId}`}
              className="inline-flex items-center gap-2 text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors text-sm font-medium"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to Interview
            </Link>
          </div>
          
          <div className="bg-[var(--card)] border border-[var(--border)] rounded-2xl p-12 flex flex-col items-center text-center shadow-lg relative overflow-hidden">
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-[var(--primary)]/10 rounded-full blur-[100px] opacity-30"></div>
            
            <div className="relative z-10 flex flex-col items-center">
              {resultData.evaluation.status === "PENDING" && (
                <>
                  <Clock className="w-16 h-16 text-[var(--text-secondary)] opacity-50 mb-6" />
                  <h2 className="text-2xl font-bold text-[var(--text-primary)] mb-2 tracking-tight">Evaluation Queued</h2>
                  <p className="text-[var(--text-secondary)] max-w-md">
                    The AI evaluation has been queued and will begin shortly. Please check back later.
                  </p>
                </>
              )}
              {resultData.evaluation.status === "PROCESSING" && (
                <>
                  <Loader2 className="w-16 h-16 text-[var(--primary)] mb-6 animate-spin" />
                  <h2 className="text-2xl font-bold text-[var(--text-primary)] mb-2 tracking-tight">Evaluation In Progress</h2>
                  <p className="text-[var(--text-secondary)] max-w-md">
                    Our AI is currently analyzing the transcript and generating a detailed evaluation.
                  </p>
                </>
              )}
              {resultData.evaluation.status === "RETRYING" && (
                <>
                  <RefreshCw className="w-16 h-16 text-[var(--color-warning)] mb-6 animate-spin" />
                  <h2 className="text-2xl font-bold text-[var(--text-primary)] mb-2 tracking-tight">Retrying Evaluation</h2>
                  <p className="text-[var(--text-secondary)] max-w-md">
                    A previous evaluation attempt failed. We are automatically retrying it now.
                  </p>
                </>
              )}
              {resultData.evaluation.status === "FAILED" && (
                <>
                  <AlertCircle className="w-16 h-16 text-[var(--color-danger)] mb-6" />
                  <h2 className="text-2xl font-bold text-[var(--text-primary)] mb-2 tracking-tight">Evaluation Failed</h2>
                  <p className="text-[var(--color-danger)] opacity-80 max-w-md mb-6">
                    We encountered an error while evaluating this interview.
                  </p>
                </>
              )}
            </div>
          </div>
        </div>
      )}

      {!loading && !error && resultData && resultData.evaluation.status === "COMPLETED" && (
        <div className="relative z-10">
           <CandidateWorkspace resultData={resultData} onReEnroll={() => setShowReEnrollModal(true)} />
        </div>
      )}

      {/* Re-Enroll Confirmation Modal */}
      {showReEnrollModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-[var(--surface)] border border-[var(--border)] rounded-2xl p-6 w-full max-w-md shadow-2xl relative overflow-hidden animate-fade-in-up">
            <div className="flex items-center gap-4 mb-4">
              <div className="w-12 h-12 rounded-full bg-[var(--color-danger)]/10 flex items-center justify-center shrink-0">
                <AlertCircle className="w-6 h-6 text-[var(--color-danger)]" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-[var(--text-primary)]">Re-enroll Candidate?</h3>
                <p className="text-sm text-[var(--color-danger)]">This action is irreversible.</p>
              </div>
            </div>
            
            <p className="text-sm text-[var(--text-secondary)] mb-6 leading-relaxed">
              Are you sure you want to re-enroll this candidate? This will result in permanent deletion of the current evaluation results and video recording. The candidate's status will be reset to Pending.
            </p>
            
            <div className="flex gap-3 justify-end">
              <button
                onClick={() => setShowReEnrollModal(false)}
                disabled={isReEnrolling}
                className="px-4 py-2 text-sm font-bold text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--surface-variant)] rounded-xl transition-all"
              >
                Cancel
              </button>
              <button
                onClick={handleReEnrollConfirm}
                disabled={isReEnrolling}
                className="flex items-center gap-2 px-5 py-2 text-sm font-bold text-white bg-[var(--color-danger)] hover:bg-[var(--color-danger)]/90 rounded-xl transition-all shadow-lg shadow-[var(--color-danger)]/20 disabled:opacity-70 disabled:cursor-not-allowed"
              >
                {isReEnrolling ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Processing...
                  </>
                ) : (
                  "Confirm Re-Enroll"
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
