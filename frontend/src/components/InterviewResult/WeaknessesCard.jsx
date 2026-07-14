import { AlertTriangle } from "lucide-react";

export default function WeaknessesCard({ weaknesses }) {
  if (!weaknesses || weaknesses.length === 0) return null;

  return (
    <div className="bg-dark-800 rounded-2xl p-6 border border-dark-700 shadow-lg shadow-black/20">
      <h3 className="text-amber-500 font-medium mb-4 uppercase tracking-wider text-sm flex items-center gap-2">
        <AlertTriangle className="w-5 h-5" />
        Areas for Improvement
      </h3>
      <ul className="space-y-3">
        {weaknesses.map((weakness, index) => (
          <li key={index} className="flex items-start gap-3">
            <div className="w-1.5 h-1.5 rounded-full bg-amber-500 mt-2 shrink-0"></div>
            <span className="text-dark-200 leading-relaxed text-sm">{weakness}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
