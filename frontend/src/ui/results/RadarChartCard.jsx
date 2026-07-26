import { RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, Tooltip } from "recharts";
import { Card, CardContent } from "../components/Card";

export default function RadarChartCard({ scores }) {
  const data = [
    { subject: "Technical", A: (scores.technical || 0) * 10, fullMark: 100 },
    { subject: "Communication", A: (scores.communication || 0) * 10, fullMark: 100 },
    { subject: "Problem Solving", A: (scores.problemSolving || 0) * 10, fullMark: 100 },
    { subject: "Confidence", A: (scores.confidence || 0) * 10, fullMark: 100 },
    { subject: "Topic Coverage", A: (scores.topicCoverage || 0) * 10, fullMark: 100 },
  ];

  return (
    <Card className="h-full">
      <CardContent className="p-6">
        <h3 className="text-[var(--text-secondary)] font-bold mb-4 uppercase tracking-wider text-sm">Dimension Overview</h3>
        <div className="flex justify-center items-center h-64 w-full">
          <RadarChart width={320} height={256} cx="50%" cy="50%" outerRadius="70%" data={data}>
            <PolarGrid stroke="var(--border)" />
            <PolarAngleAxis dataKey="subject" tick={{ fill: "var(--text-secondary)", fontSize: 12 }} />
            <PolarRadiusAxis angle={30} domain={[0, 100]} tick={false} axisLine={false} />
            <Tooltip
              contentStyle={{ backgroundColor: "var(--card)", border: "1px solid var(--border)", borderRadius: "8px", color: "var(--text-primary)" }}
              itemStyle={{ color: "var(--primary)" }}
              formatter={(value) => [`${value}%`, "Score"]}
            />
            <Radar
              name="Score"
              dataKey="A"
              stroke="var(--primary)"
              fill="var(--primary)"
              fillOpacity={0.3}
            />
          </RadarChart>
        </div>
      </CardContent>
    </Card>
  );
}
