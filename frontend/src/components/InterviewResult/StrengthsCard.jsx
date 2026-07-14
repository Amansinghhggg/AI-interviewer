import { CheckCircle2 } from "lucide-react";

export default function StrengthsCard({ strengths }) {
  if (!strengths || strengths.length === 0) return null;

  return (
    <div className="bg-dark-800 rounded-2xl p-6 border border-dark-700 shadow-lg shadow-black/20">
      <h3 className="text-emerald-400 font-medium mb-4 uppercase tracking-wider text-sm flex items-center gap-2">
        <CheckCircle2 className="w-5 h-5" />
        Key Strengths
      </h3>
      <ul className="space-y-3">
        {strengths.map((strength, index) => (
          <li key={index} className="flex items-start gap-3">
            <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 mt-2 shrink-0"></div>
            <span className="text-dark-200 leading-relaxed text-sm">{strength}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
