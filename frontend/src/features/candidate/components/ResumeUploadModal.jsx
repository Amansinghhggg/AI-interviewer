import { useState } from "react";
import { useAuth } from "../../../context/AuthContext";
import profileService from "../../../services/profile.service";
import toast from "react-hot-toast";
import {
  FileText,
  Upload,
  Loader2,
  AlertCircle,
  CheckCircle2,
  X,
  FileCheck
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import UploadProgress from "../../shared/components/UploadProgress";

const ResumeUploadModal = ({ isOpen, onSuccess, onClose }) => {
  const { checkAuth } = useAuth();
  const [file, setFile] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(null);

  if (!isOpen) return null;

  const handleFileChange = (e) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      if (selectedFile.type !== "application/pdf") {
        toast.error("Only PDF files are supported");
        e.target.value = "";
        return;
      }
      if (selectedFile.size > 5 * 1024 * 1024) {
        toast.error("Resume size must be less than 5 MB");
        e.target.value = "";
        return;
      }
      setFile(selectedFile);
    }
  };

  const handleUpload = async () => {
    if (!file) {
      return toast.error("Please select a PDF resume file to upload.");
    }

    setIsUploading(true);
    setUploadProgress(0);

    const progressInterval = setInterval(() => {
      setUploadProgress((prev) => {
        if (prev >= 90) {
          clearInterval(progressInterval);
          return 90;
        }
        return prev + 10;
      });
    }, 300);

    try {
      const response = await profileService.uploadResume(file);
      clearInterval(progressInterval);
      setUploadProgress(100);

      if (response.success) {
        toast.success("Resume uploaded successfully!");
        // Refresh global user state so user.resume is updated in AuthContext
        await checkAuth();
        
        setTimeout(() => {
          setUploadProgress(null);
          setIsUploading(false);
          if (onSuccess) {
            onSuccess();
          }
        }, 400);
      }
    } catch (error) {
      clearInterval(progressInterval);
      toast.error(error.response?.data?.message || "Failed to upload resume. Please try again.");
      setUploadProgress(null);
      setIsUploading(false);
    }
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          className="w-full max-w-[540px] bg-[var(--color-surface-container-low,#14141c)] border border-[var(--color-outline-variant)]/40 rounded-3xl p-6 sm:p-8 shadow-2xl relative overflow-hidden text-[var(--color-on-surface,#dae2fd)]"
        >
          {/* Decorative background glow */}
          <div className="absolute -top-24 -right-24 w-48 h-48 bg-[var(--color-primary-md3)]/15 rounded-full blur-[60px] pointer-events-none" />

          {/* Close button if optional */}
          {onClose && (
            <button
              onClick={onClose}
              disabled={isUploading}
              className="absolute top-5 right-5 p-2 rounded-full hover:bg-[var(--color-surface-variant)]/40 text-[var(--color-on-surface-variant)] hover:text-white transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          )}

          {/* Modal Header */}
          <div className="space-y-3 mb-6 text-center">
            <div className="w-14 h-14 rounded-2xl bg-[var(--color-primary-md3)]/15 border border-[var(--color-primary-md3)]/30 text-[var(--color-primary-md3)] flex items-center justify-center mx-auto shadow-lg shadow-[var(--color-primary-md3)]/20">
              <FileText className="w-7 h-7" />
            </div>

            <h3 className="text-xl sm:text-2xl font-black tracking-tight text-white">
              Resume Upload Required
            </h3>
            <p className="text-xs text-[var(--color-on-surface-variant)] font-medium leading-relaxed max-w-md mx-auto">
              To start your personalized AI interview, please upload your PDF resume. Our AI engine uses your resume to evaluate skills and tailor questions.
            </p>
          </div>

          {/* Upload Drop Zone */}
          <div className="space-y-4">
            <div className="p-6 border-2 border-dashed border-[var(--color-outline-variant)]/40 rounded-2xl bg-[var(--color-surface-container-highest)]/20 text-center space-y-3 relative hover:border-[var(--color-primary-md3)]/50 transition-colors group">
              <input
                type="file"
                accept=".pdf"
                onChange={handleFileChange}
                disabled={isUploading}
                className="absolute inset-0 opacity-0 cursor-pointer w-full h-full disabled:cursor-not-allowed z-10"
              />
              
              <div className="w-12 h-12 rounded-full bg-[var(--color-primary-md3)]/10 border border-[var(--color-primary-md3)]/25 text-[var(--color-primary-md3)] flex items-center justify-center mx-auto group-hover:scale-105 transition-transform">
                <Upload className="w-6 h-6" />
              </div>

              <div>
                <h4 className="text-xs font-black uppercase tracking-wider text-white">
                  {file ? file.name : "Drop your PDF resume here or click to browse"}
                </h4>
                <p className="text-[11px] text-[var(--color-on-surface-variant)] mt-1 font-medium">
                  {file ? `${(file.size / (1024 * 1024)).toFixed(2)} MB PDF Selected` : "PDF format, maximum file size 5MB"}
                </p>
              </div>

              {file && (
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 text-xs font-bold">
                  <FileCheck className="w-3.5 h-3.5" /> Ready for upload
                </div>
              )}
            </div>

            {/* Progress Bar */}
            {uploadProgress !== null && (
              <UploadProgress progress={uploadProgress} fileName={file?.name} />
            )}

            {/* Action Buttons */}
            <div className="flex items-center justify-end gap-3 pt-4">
              {onClose && (
                <button
                  type="button"
                  onClick={onClose}
                  disabled={isUploading}
                  className="px-5 py-3 rounded-xl border border-[var(--color-outline-variant)]/30 text-xs font-black uppercase tracking-wider text-[var(--color-on-surface-variant)] hover:text-white transition-colors"
                >
                  Cancel
                </button>
              )}
              <button
                type="button"
                onClick={handleUpload}
                disabled={!file || isUploading}
                className="w-full py-3.5 bg-[var(--color-primary-md3)] hover:bg-[var(--color-primary-md3)]/90 disabled:opacity-50 text-white rounded-xl text-xs font-black uppercase tracking-widest transition-all shadow-lg shadow-[var(--color-primary-md3)]/30 flex items-center justify-center gap-2"
              >
                {isUploading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Uploading Resume...
                  </>
                ) : (
                  <>
                    <Upload className="w-4 h-4" />
                    Upload & Continue to Interview
                  </>
                )}
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default ResumeUploadModal;
