import { AlertTriangle } from "lucide-react";
import { Card, CardContent } from "../components/Card";

export default function WeaknessesCard({ weaknesses }) {
  if (!weaknesses || weaknesses.length === 0) return null;

  return (
    <Card className="shadow-lg shadow-[var(--color-warning)]/5 border-[var(--color-warning)]/20">
      <CardContent className="p-6">
        <h3 className="text-[var(--color-warning)] font-bold mb-4 uppercase tracking-wider text-sm flex items-center gap-2">
          <AlertTriangle className="w-5 h-5" />
          Areas for Improvement
        </h3>
        <ul className="space-y-3">
          {weaknesses.map((weakness, index) => (
            <li key={index} className="flex items-start gap-3">
              <div className="w-1.5 h-1.5 rounded-full bg-[var(--color-warning)] mt-2 shrink-0"></div>
              <span className="text-[var(--text-primary)] leading-relaxed text-sm">{weakness}</span>
            </li>
          ))}
        </ul>
      </CardContent>
    </Card>
  );
}
