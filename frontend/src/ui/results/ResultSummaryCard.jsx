import RecommendationBadge from "./RecommendationBadge";
import { Clock, Cpu, Calendar } from "lucide-react";
import { Card, CardContent } from "../components/Card";

export default function ResultSummaryCard({ summary, evaluation }) {
  const formattedDate = new Date(evaluation.evaluatedAt).toLocaleString();

  let interpretationColor = "text-[var(--primary)]";
  if (summary.interpretation.includes("Exceptional")) interpretationColor = "text-[var(--color-success)]";
  else if (summary.interpretation.includes("Good")) interpretationColor = "text-[var(--color-info)]";
  else if (summary.interpretation.includes("Average")) interpretationColor = "text-[var(--color-warning)]";
  else if (summary.interpretation.includes("Improvement")) interpretationColor = "text-[var(--color-danger)]";

  return (
    <Card className="h-full shadow-lg shadow-[var(--primary)]/5">
      <CardContent className="p-6 flex flex-col h-full">
        <h3 className="text-[var(--text-primary)] font-bold mb-6 uppercase tracking-wider text-sm">Overall Result</h3>
        
        <div className="flex-1 flex flex-col items-center justify-center text-center">
          <div className="text-7xl font-black text-[var(--text-primary)] mb-2 tracking-tight">
            {summary.overallScore} <span className="text-3xl text-[var(--text-secondary)] font-medium">/ 10</span>
          </div>
          <div className={`text-xl font-semibold mb-8 ${interpretationColor}`}>
            {summary.interpretation}
          </div>
          
          <div className="mb-6">
            <p className="text-xs text-[var(--text-secondary)] mb-2 uppercase tracking-widest font-semibold">Recommendation</p>
            <RecommendationBadge recommendation={summary.recommendation} />
          </div>
          
          <p className="text-[var(--text-secondary)] text-sm italic border-t border-[var(--border)] pt-6 mt-4 relative before:content-[''] before:absolute before:top-0 before:left-1/2 before:-translate-x-1/2 before:w-12 before:h-px before:bg-[var(--primary)]/50">
            "{summary.reasoning}"
          </p>
        </div>

        <div className="mt-8 pt-4 border-t border-[var(--border)] flex flex-col gap-3 text-sm text-[var(--text-secondary)] font-medium">
          <div className="flex items-center justify-between">
            <span className="flex items-center gap-2"><Cpu className="w-4 h-4 text-[var(--primary)]" aria-hidden="true" /> Provider</span>
            <span className="text-[var(--text-primary)]">{evaluation.provider}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="flex items-center gap-2"><Clock className="w-4 h-4 text-[var(--primary)]" aria-hidden="true" /> Duration</span>
            <span className="text-[var(--text-primary)]">{evaluation.duration}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="flex items-center gap-2"><Calendar className="w-4 h-4 text-[var(--primary)]" aria-hidden="true" /> Completed</span>
            <span className="text-[var(--text-primary)] text-xs">{formattedDate}</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
