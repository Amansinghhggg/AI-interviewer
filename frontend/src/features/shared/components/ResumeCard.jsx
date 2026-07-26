import React, { useState } from "react";
import { FileText, Download, Eye, RefreshCw, Trash2 } from "lucide-react";
import PDFPreviewModal from "./PDFPreviewModal";

export default function ResumeCard({ resume, onReplace, onDownload, viewUrl, readOnly = true }) {
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const formatDate = (dateStr) => {
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    }).format(new Date(dateStr));
  };

  const handleDownload = async () => {
    if (onDownload) {
      await onDownload(resume.fileName);
    }
  };

  if (!resume || !resume.url) {
    return (
      <div className="w-full bg-[var(--color-surface-container-low)] border border-[var(--color-outline-variant)]/30 rounded-3xl p-8 flex flex-col items-center justify-center text-center shadow-xl">
        <FileText className="w-12 h-12 text-[var(--color-on-surface-variant)]/50 mb-4" />
        <h3 className="text-lg font-black tracking-tight text-[var(--color-on-surface)] uppercase">Resume Required</h3>
        <p className="text-[12px] font-semibold text-[var(--color-on-surface-variant)] mt-2 mb-6">
          Upload your resume to complete your profile.
        </p>
        {!readOnly && onReplace && (
          <button 
            onClick={onReplace}
            className="px-6 py-3 bg-[var(--color-primary-md3)] text-white rounded-xl text-[11px] font-black uppercase tracking-widest hover:bg-[var(--color-primary-md3)]/90 transition-all flex items-center shadow-lg shadow-[var(--color-primary-md3)]/20"
          >
            Upload Resume
          </button>
        )}
      </div>
    );
  }

  return (
    <>
      <div className="bg-[var(--color-surface-container-lowest)] border border-dashed border-[var(--color-outline-variant)]/50 p-6 rounded-xl flex flex-col md:flex-row items-center justify-between gap-6 group hover:border-[var(--color-primary-md3)] transition-colors w-full">
        
        {/* File Info */}
        <div className="flex items-center gap-6">
          <div className="p-4 bg-[var(--color-surface-container-high)] rounded-lg border border-[var(--color-outline-variant)]/30">
            <FileText className="w-8 h-8 text-[var(--color-primary-md3)]" />
          </div>
          <div>
            <h4 className="font-bold text-sm text-[var(--color-on-surface)] truncate max-w-[200px] sm:max-w-[300px]">
              {resume.fileName || "Resume.pdf"}
            </h4>
            <div className="flex items-center gap-4 mt-2">
              <span className="bg-[var(--color-surface-container-highest)] text-[var(--color-on-surface-variant)] px-2 py-0.5 rounded text-[10px] font-bold">
                {formatFileSize(resume.fileSize)}
              </span>
              <span className="text-[var(--color-outline)] text-[10px] font-bold uppercase tracking-wider">
                UPLOADED {formatDate(resume.uploadedAt)}
              </span>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex flex-wrap gap-2 w-full md:w-auto justify-center md:justify-end">
          <button
            onClick={() => setIsPreviewOpen(true)}
            className="px-4 py-2 border border-[var(--color-outline-variant)]/50 rounded-lg text-[10px] font-bold text-[var(--color-on-surface-variant)] hover:text-[var(--color-primary-md3)] hover:border-[var(--color-primary-md3)] transition-all flex items-center gap-2"
          >
            <Eye className="w-[18px] h-[18px]" />
            VIEW
          </button>
          
          <button
            onClick={handleDownload}
            className="px-4 py-2 border border-[var(--color-outline-variant)]/50 rounded-lg text-[10px] font-bold text-[var(--color-on-surface-variant)] hover:text-[var(--color-primary-md3)] hover:border-[var(--color-primary-md3)] transition-all flex items-center gap-2"
          >
            <Download className="w-[18px] h-[18px]" />
            DOWNLOAD
          </button>

          {!readOnly && onReplace && (
            <button
              onClick={onReplace}
              className="px-4 py-2 bg-[var(--color-primary-md3)] text-white rounded-lg text-[10px] font-bold hover:brightness-110 transition-all flex items-center gap-2"
            >
              <RefreshCw className="w-[18px] h-[18px]" />
              REPLACE
            </button>
          )}
        </div>
      </div>

      <PDFPreviewModal 
        isOpen={isPreviewOpen} 
        onClose={() => setIsPreviewOpen(false)} 
        resumeUrl={viewUrl || resume.url} 
        fileName={resume.fileName}
        onDownload={handleDownload}
      />
    </>
  );
}
