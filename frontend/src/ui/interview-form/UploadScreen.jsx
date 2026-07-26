import React, { useEffect } from "react";
import { Loader2, CheckCircle2, AlertTriangle, CloudOff } from "lucide-react";
import { UPLOAD_STATES } from "../../modules/persistence/config/constants.js";

const UploadScreen = ({ uploadState, retries, error, onRetry, onContinue }) => {
  // Prevent accidental navigation
  useEffect(() => {
    const isUploading =
      uploadState === UPLOAD_STATES.QUEUED ||
      uploadState === UPLOAD_STATES.UPLOADING ||
      uploadState === UPLOAD_STATES.RETRYING ||
      uploadState === "PROCESSING"; // Map to any internal processing state

    const handleBeforeUnload = (e) => {
      if (isUploading) {
        e.preventDefault();
        e.returnValue =
          "Your interview recording is still uploading. Closing this tab will result in data loss. Are you sure you want to leave?";
      }
    };

    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload);
    };
  }, [uploadState]);

  useEffect(() => {
    if (uploadState === UPLOAD_STATES.COMPLETED) {
      const timer = setTimeout(() => {
        onContinue();
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [uploadState, onContinue]);

  const renderContent = () => {
    switch (uploadState) {
      case UPLOAD_STATES.QUEUED:
        return (
          <>
            <Loader2 className="w-12 h-12 text-[var(--primary)] animate-spin mb-6" />
            <h2 className="text-2xl font-bold text-[var(--text-primary)] mb-3">
              Preparing upload...
            </h2>
            <p className="text-[var(--text-secondary)] text-center max-w-md">
              Please keep this tab open while we prepare your recording.
            </p>
          </>
        );

      case UPLOAD_STATES.UPLOADING:
        return (
          <>
            <Loader2 className="w-12 h-12 text-[var(--primary)] animate-spin mb-6" />
            <h2 className="text-2xl font-bold text-[var(--text-primary)] mb-3">
              Uploading interview recording...
            </h2>
            <p className="text-[var(--text-secondary)] text-center max-w-md">
              We are securely uploading your interview recording.
              <br />
              <span className="font-semibold text-[var(--color-warning)] mt-2 block">
                Please do not close or refresh this tab.
              </span>
              This usually takes less than a minute.
            </p>
          </>
        );

      case UPLOAD_STATES.RETRYING:
        return (
          <>
            <CloudOff className="w-12 h-12 text-[var(--color-warning)] animate-bounce mb-6" />
            <h2 className="text-2xl font-bold text-[var(--text-primary)] mb-3">
              Connection Interrupted
            </h2>
            <p className="text-[var(--text-secondary)] text-center max-w-md mb-2">
              Retrying upload...
            </p>
            <p className="text-[var(--color-warning)] font-medium">
              Attempt {retries} of 3
            </p>
            <p className="text-[var(--text-secondary)] text-sm mt-4">
              Please keep this tab open. We're automatically trying to reconnect.
            </p>
          </>
        );

      case UPLOAD_STATES.COMPLETED:
        return (
          <>
            <CheckCircle2 className="w-16 h-16 text-[var(--color-success)] mb-6" />
            <h2 className="text-2xl font-bold text-[var(--text-primary)] mb-3">
              ✅ Interview Submitted Successfully
            </h2>
            <p className="text-[var(--text-secondary)] text-center max-w-md mb-8">
              Your interview recording has been uploaded securely.<br/>
              Thank you for completing your interview.
            </p>
            <button
              onClick={onContinue}
              className="px-8 py-3 bg-[var(--primary)] hover:bg-[var(--primary)]/90 text-[var(--background)] font-medium rounded-lg transition-colors shadow-lg shadow-[var(--primary)]/20"
            >
              Continue
            </button>
          </>
        );

      case UPLOAD_STATES.FAILED:
        return (
          <>
            <AlertTriangle className="w-16 h-16 text-[var(--color-danger)] mb-6" />
            <h2 className="text-2xl font-bold text-[var(--text-primary)] mb-3">
              Recording Upload Failed
            </h2>
            <p className="text-[var(--text-secondary)] text-center max-w-md mb-6">
              Your interview answers were submitted successfully, but your recording could not be uploaded.
            </p>
            {error && (
              <div className="bg-[var(--background)] rounded-lg p-3 mb-8 w-full max-w-md border border-[var(--border)]">
                <p className="text-[var(--color-danger)] text-sm break-words">{error}</p>
              </div>
            )}
            <button
              onClick={onRetry}
              className="px-8 py-3 bg-[var(--background)] hover:bg-[var(--background-secondary)] border border-[var(--border)] text-[var(--text-primary)] font-medium rounded-lg transition-colors"
            >
              Retry Upload
            </button>
          </>
        );

      case "PROCESSING":
      default:
        return (
          <>
            <Loader2 className="w-12 h-12 text-[var(--primary)] animate-spin mb-6" />
            <h2 className="text-2xl font-bold text-[var(--text-primary)] mb-3">
              Finalizing interview...
            </h2>
            <p className="text-[var(--text-secondary)] text-center max-w-md mb-8">
              Please wait while we complete the final steps.
            </p>
          </>
        );
    }
  };

  return (
    <div className="min-h-screen bg-[var(--background)] flex flex-col items-center justify-center p-6 fixed inset-0 z-[100]">
      <div className="absolute inset-0 noise pointer-events-none z-0 opacity-50"></div>
      <div className="relative z-10 w-full max-w-2xl bg-[var(--card)]/90 backdrop-blur-xl border border-[var(--border)] rounded-2xl p-10 flex flex-col items-center shadow-2xl">
        {renderContent()}
      </div>
    </div>
  );
};

export default UploadScreen;
