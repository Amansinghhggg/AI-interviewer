import { Card, CardContent } from "../components/Card";

export default function ProgressScoreCard({ scores }) {
  const scoreItems = [
    { label: "Technical Ability", value: (scores.technical || 0) * 10 },
    { label: "Communication", value: (scores.communication || 0) * 10 },
    { label: "Problem Solving", value: (scores.problemSolving || 0) * 10 },
    { label: "Confidence", value: (scores.confidence || 0) * 10 },
    { label: "Topic Coverage", value: (scores.topicCoverage || 0) * 10 },
  ];

  const getColor = (value) => {
    if (value >= 80) return "bg-[var(--color-success)]";
    if (value >= 60) return "bg-[var(--color-warning)]";
    return "bg-[var(--color-danger)]";
  };

  return (
    <Card className="h-full flex flex-col justify-center">
      <CardContent className="p-6">
        <h3 className="text-[var(--text-secondary)] font-bold mb-6 uppercase tracking-wider text-sm">Detailed Breakdown</h3>
        <div className="space-y-5">
          {scoreItems.map((item, index) => (
            <div key={index}>
              <div className="flex justify-between items-center mb-1.5">
                <span className="text-sm font-medium text-[var(--text-primary)]">{item.label}</span>
                <span className="text-sm font-bold text-[var(--primary)]">{item.value.toFixed(0)}%</span>
              </div>
              <div className="h-2 w-full bg-[var(--background-secondary)] rounded-full overflow-hidden" role="progressbar" aria-valuenow={item.value} aria-valuemin="0" aria-valuemax="100">
                <div
                  className={`h-full rounded-full transition-all duration-1000 ease-out ${getColor(item.value)}`}
                  style={{ width: `${item.value}%` }}
                ></div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
