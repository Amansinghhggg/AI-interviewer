import RecommendationBadge from "./RecommendationBadge";
import { Clock, Cpu, Calendar } from "lucide-react";

export default function ResultSummaryCard({ summary, evaluation }) {
  const formattedDate = new Date(evaluation.evaluatedAt).toLocaleString();

  // Determine color based on interpretation
  let interpretationColor = "text-primary-400";
  if (summary.interpretation.includes("Exceptional")) interpretationColor = "text-emerald-400";
  else if (summary.interpretation.includes("Good")) interpretationColor = "text-blue-400";
  else if (summary.interpretation.includes("Average")) interpretationColor = "text-yellow-400";
  else if (summary.interpretation.includes("Improvement")) interpretationColor = "text-red-400";

  return (
    <div className="bg-dark-800 rounded-2xl p-6 border border-dark-700 flex flex-col h-full shadow-lg shadow-black/20">
      <h3 className="text-dark-300 font-medium mb-6 uppercase tracking-wider text-sm">Overall Result</h3>
      
      <div className="flex-1 flex flex-col items-center justify-center text-center">
        <div className="text-7xl font-black text-white mb-2 tracking-tight drop-shadow-md">
          {summary.overallScore} <span className="text-3xl text-dark-400 font-medium">/ 10</span>
        </div>
        <div className={`text-xl font-semibold mb-8 ${interpretationColor}`}>
          {summary.interpretation}
        </div>
        
        <div className="mb-6">
          <p className="text-xs text-dark-400 mb-2 uppercase tracking-widest font-semibold">Recommendation</p>
          <RecommendationBadge recommendation={summary.recommendation} />
        </div>
        
        <p className="text-dark-300 text-base italic border-t border-dark-700/50 pt-6 mt-4 relative before:content-[''] before:absolute before:top-0 before:left-1/2 before:-translate-x-1/2 before:w-12 before:h-px before:bg-primary-500/50">
          "{summary.reasoning}"
        </p>
      </div>

      <div className="mt-8 pt-4 border-t border-dark-700 flex flex-col gap-3 text-sm text-dark-400 font-medium">
        <div className="flex items-center justify-between">
          <span className="flex items-center gap-2"><Cpu className="w-4 h-4 text-primary-400" aria-hidden="true" /> Provider</span>
          <span className="text-dark-200">{evaluation.provider}</span>
        </div>
        <div className="flex items-center justify-between">
          <span className="flex items-center gap-2"><Clock className="w-4 h-4 text-primary-400" aria-hidden="true" /> Duration</span>
          <span className="text-dark-200">{evaluation.duration}</span>
        </div>
        <div className="flex items-center justify-between">
          <span className="flex items-center gap-2"><Calendar className="w-4 h-4 text-primary-400" aria-hidden="true" /> Completed</span>
          <span className="text-dark-200 text-xs">{formattedDate}</span>
        </div>
      </div>
    </div>
  );
}
