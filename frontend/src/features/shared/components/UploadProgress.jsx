import React from "react";
import { Loader2 } from "lucide-react";

export default function UploadProgress({ progress, fileName }) {
  if (progress === null || progress === undefined) return null;

  return (
    <div className="w-full bg-[var(--color-surface-container-low)] border border-[var(--color-outline-variant)]/30 rounded-xl p-4 my-4 shadow-sm">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <Loader2 className="w-4 h-4 text-[var(--color-primary-md3)] animate-spin" />
          <span className="text-xs font-bold text-[var(--color-on-surface)] truncate max-w-[200px]">
            Uploading {fileName || "Resume"}...
          </span>
        </div>
        <span className="text-xs font-black text-[var(--color-primary-md3)]">{progress}%</span>
      </div>
      <div className="w-full bg-[var(--color-surface-variant)] rounded-full h-2 overflow-hidden">
        <div
          className="bg-[var(--color-primary-md3)] h-2 rounded-full transition-all duration-300 ease-out"
          style={{ width: `${progress}%` }}
        />
      </div>
      <p className="text-[10px] text-[var(--color-on-surface-variant)] mt-2 font-semibold">
        Please wait while your resume is being uploaded.
      </p>
    </div>
  );
}
