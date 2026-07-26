import { CheckCircle2 } from "lucide-react";
import { Card, CardContent } from "../components/Card";

export default function StrengthsCard({ strengths }) {
  if (!strengths || strengths.length === 0) return null;

  return (
    <Card className="shadow-lg shadow-[var(--color-success)]/5 border-[var(--color-success)]/20">
      <CardContent className="p-6">
        <h3 className="text-[var(--color-success)] font-bold mb-4 uppercase tracking-wider text-sm flex items-center gap-2">
          <CheckCircle2 className="w-5 h-5" />
          Key Strengths
        </h3>
        <ul className="space-y-3">
          {strengths.map((strength, index) => (
            <li key={index} className="flex items-start gap-3">
              <div className="w-1.5 h-1.5 rounded-full bg-[var(--color-success)] mt-2 shrink-0"></div>
              <span className="text-[var(--text-primary)] leading-relaxed text-sm">{strength}</span>
            </li>
          ))}
        </ul>
      </CardContent>
    </Card>
  );
}
