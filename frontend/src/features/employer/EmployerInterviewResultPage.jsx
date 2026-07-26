import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import api from "../../services/api";
import { ArrowLeft, Loader2, AlertCircle, RefreshCw, Clock, FileQuestion } from "lucide-react";

import { CandidateWorkspace } from "../../modules/candidate-workspace/index";

export default function EmployerInterviewResultPage() {
  const { id: interviewId, resultId } = useParams();
  const [resultData, setResultData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [errorStatus, setErrorStatus] = useState(null);

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
           <CandidateWorkspace resultData={resultData} />
        </div>
      )}
    </div>
  );
}
