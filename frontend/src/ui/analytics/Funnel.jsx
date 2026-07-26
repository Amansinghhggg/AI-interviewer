import React from "react";
import { cn } from "../../utils/cn";
import { ArrowRight } from "lucide-react";

export default function Funnel({ stages, className }) {
  // stages = [{ name: 'Sourced', value: 1200 }, { name: 'Applied', value: 400 }, ...]
  if (!stages || stages.length === 0) return null;

  const maxVal = stages[0].value;

  return (
    <div className={cn("space-y-4", className)}>
      {stages.map((stage, index) => {
        const percentage = Math.round((stage.value / maxVal) * 100);
        const nextStage = stages[index + 1];
        const conversionRate = nextStage 
          ? Math.round((nextStage.value / stage.value) * 100) 
          : null;

        return (
          <div key={stage.name} className="relative">
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-sm font-medium text-[var(--text-primary)]">
                {stage.name}
              </span>
              <span className="text-sm font-semibold text-[var(--text-primary)]">
                {stage.value.toLocaleString()}
              </span>
            </div>
            <div className="flex items-center gap-4">
              <div className="flex-1 h-3 bg-[var(--background-secondary)] rounded-full overflow-hidden">
                <div 
                  className="h-full bg-[var(--primary)] rounded-full transition-all duration-500" 
                  style={{ width: `${percentage}%` }} 
                />
              </div>
            </div>
            {/* Conversion indicator to next stage */}
            {nextStage && (
              <div className="absolute -bottom-5 right-0 flex items-center text-xs text-[var(--text-muted)] font-medium">
                <ArrowRight className="w-3 h-3 mr-1" />
                {conversionRate}% conversion
              </div>
            )}
            {nextStage && <div className="h-6" />} {/* Spacer for conversion indicator */}
          </div>
        );
      })}
    </div>
  );
}
