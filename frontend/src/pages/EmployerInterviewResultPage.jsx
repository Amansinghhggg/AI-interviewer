import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import api from "../services/api";
import { ArrowLeft, Loader2, AlertCircle, RefreshCw, Clock, FileQuestion } from "lucide-react";

import { CandidateWorkspace } from "../modules/candidate-workspace";

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
    <div className="min-h-screen bg-dark-900 pt-24 pb-12">
      {loading && (
        <div className="min-h-[80vh] flex flex-col items-center justify-center gap-4">
          <Loader2 className="w-10 h-10 animate-spin text-primary-400" />
          <p className="text-dark-300 font-medium animate-pulse">Loading evaluation dashboard...</p>
        </div>
      )}

      {error && !loading && (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-8">
            <Link
              to={`/employer/interviews/${interviewId}`}
              className="inline-flex items-center gap-2 text-dark-300 hover:text-white transition-colors text-sm font-medium"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to Interview
            </Link>
          </div>
          <div className="bg-dark-800 border border-dark-700 rounded-2xl p-12 flex flex-col items-center text-center shadow-lg">
            {errorStatus === 404 ? (
              <>
                <FileQuestion className="w-16 h-16 text-dark-400 mb-6" />
                <h2 className="text-2xl font-bold text-white mb-2">No Result Found</h2>
                <p className="text-dark-300 max-w-md">{error}</p>
              </>
            ) : (
              <>
                <AlertCircle className="w-16 h-16 text-red-400 mb-6" />
                <h2 className="text-2xl font-bold text-white mb-2">Error</h2>
                <p className="text-red-200 max-w-md">{error}</p>
              </>
            )}
          </div>
        </div>
      )}

      {!loading && !error && resultData && resultData.evaluation.status !== "COMPLETED" && (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-8">
            <Link
              to={`/employer/interviews/${interviewId}`}
              className="inline-flex items-center gap-2 text-dark-300 hover:text-white transition-colors text-sm font-medium"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to Interview
            </Link>
          </div>
          
          <div className="mt-8 bg-dark-800 border border-dark-700 rounded-2xl p-12 flex flex-col items-center text-center shadow-lg">
            {resultData.evaluation.status === "PENDING" && (
              <>
                <Clock className="w-16 h-16 text-dark-400 mb-6" />
                <h2 className="text-2xl font-bold text-white mb-2">Evaluation Queued</h2>
                <p className="text-dark-300 max-w-md">
                  The AI evaluation has been queued and will begin shortly. Please check back later.
                </p>
              </>
            )}
            {resultData.evaluation.status === "PROCESSING" && (
              <>
                <Loader2 className="w-16 h-16 text-primary-400 mb-6 animate-spin" />
                <h2 className="text-2xl font-bold text-white mb-2">Evaluation In Progress</h2>
                <p className="text-dark-300 max-w-md">
                  Our AI is currently analyzing the transcript and generating a detailed evaluation.
                </p>
              </>
            )}
            {resultData.evaluation.status === "RETRYING" && (
              <>
                <RefreshCw className="w-16 h-16 text-yellow-400 mb-6 animate-spin" />
                <h2 className="text-2xl font-bold text-white mb-2">Retrying Evaluation</h2>
                <p className="text-dark-300 max-w-md">
                  A previous evaluation attempt failed. We are automatically retrying it now.
                </p>
              </>
            )}
            {resultData.evaluation.status === "FAILED" && (
              <>
                <AlertCircle className="w-16 h-16 text-red-400 mb-6" />
                <h2 className="text-2xl font-bold text-white mb-2">Evaluation Failed</h2>
                <p className="text-red-200 max-w-md mb-6">
                  We encountered an error while evaluating this interview.
                </p>
                <button disabled className="px-4 py-2 bg-dark-700 text-dark-400 rounded-lg cursor-not-allowed">
                  Retry Unavailable
                </button>
              </>
            )}
          </div>
        </div>
      )}

      {!loading && !error && resultData && resultData.evaluation.status === "COMPLETED" && (
        <CandidateWorkspace resultData={resultData} />
      )}
    </div>
  );
}
