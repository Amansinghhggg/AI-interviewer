import React, { useEffect, useRef } from "react";
import { X, Download, FileText } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function PDFPreviewModal({ isOpen, onClose, resumeUrl, fileName, onDownload }) {
  const modalRef = useRef(null);

  // Focus trapping and Esc key listener
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "Escape") onClose();
    };
    if (isOpen) {
      document.addEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "hidden"; // Prevent background scrolling
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "unset";
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleDownload = async () => {
    if (onDownload) {
      await onDownload();
    }
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 md:p-8 font-['Inter']">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        />

        {/* Modal */}
        <motion.div
          ref={modalRef}
          role="dialog"
          aria-modal="true"
          aria-labelledby="pdf-modal-title"
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          className="relative w-full max-w-5xl h-full max-h-[90vh] bg-[var(--color-surface-container-low)] rounded-2xl md:rounded-3xl shadow-2xl flex flex-col overflow-hidden border border-[var(--color-outline-variant)]/30"
        >
          {/* Header */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-[var(--color-outline-variant)]/30 bg-[var(--color-surface-container-lowest)]">
            <div className="flex items-center gap-3 overflow-hidden">
              <div className="w-10 h-10 rounded-full bg-[var(--color-primary-md3)]/10 flex items-center justify-center shrink-0">
                <FileText className="w-5 h-5 text-[var(--color-primary-md3)]" />
              </div>
              <h2 id="pdf-modal-title" className="text-lg font-black text-[var(--color-on-surface)] truncate">
                {fileName || "Resume"}
              </h2>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={onClose}
                className="p-2 text-[var(--color-on-surface-variant)] hover:bg-[var(--color-surface-variant)] hover:text-[var(--color-on-surface)] rounded-xl transition-all"
                title="Close"
                aria-label="Close modal"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* PDF Viewer Body */}
          <div className="flex-1 bg-black/5 relative overflow-hidden flex flex-col items-center justify-center">
            {resumeUrl ? (
              <object
                data={resumeUrl}
                type="application/pdf"
                className="w-full h-full"
                aria-label="PDF Preview"
              >
                {/* Fallback if browser doesn't support PDF viewing natively */}
                <div className="flex flex-col items-center justify-center p-8 text-center space-y-4">
                  <FileText className="w-16 h-16 text-[var(--color-on-surface-variant)]/50" />
                  <p className="text-sm font-bold text-[var(--color-on-surface)]">
                    This browser cannot preview PDF files.
                  </p>
                  <button
                    onClick={handleDownload}
                    className="px-6 py-3 bg-[var(--color-primary-md3)] text-white rounded-xl text-[11px] font-black uppercase tracking-widest hover:bg-[var(--color-primary-md3)]/90 transition-all shadow-lg shadow-[var(--color-primary-md3)]/20"
                  >
                    Download PDF
                  </button>
                </div>
              </object>
            ) : (
              <div className="text-[var(--color-error)] text-sm font-bold">Failed to load resume URL.</div>
            )}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
