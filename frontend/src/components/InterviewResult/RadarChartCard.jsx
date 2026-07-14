import { ResponsiveContainer, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, Tooltip } from "recharts";

export default function RadarChartCard({ scores }) {
  const data = [
    { subject: "Technical", A: (scores.technical || 0) * 10, fullMark: 100 },
    { subject: "Communication", A: (scores.communication || 0) * 10, fullMark: 100 },
    { subject: "Problem Solving", A: (scores.problemSolving || 0) * 10, fullMark: 100 },
    { subject: "Confidence", A: (scores.confidence || 0) * 10, fullMark: 100 },
    { subject: "Topic Coverage", A: (scores.topicCoverage || 0) * 10, fullMark: 100 },
  ];

  return (
    <div className="bg-dark-800 rounded-2xl p-6 border border-dark-700 h-full shadow-lg shadow-black/20">
      <h3 className="text-dark-300 font-medium mb-4 uppercase tracking-wider text-sm">Dimension Overview</h3>
      <div className="h-64 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <RadarChart cx="50%" cy="50%" outerRadius="75%" data={data}>
            <PolarGrid stroke="#374151" />
            <PolarAngleAxis dataKey="subject" tick={{ fill: "#9CA3AF", fontSize: 12 }} />
            <PolarRadiusAxis angle={30} domain={[0, 100]} tick={false} axisLine={false} />
            <Tooltip
              contentStyle={{ backgroundColor: "#1F2937", border: "1px solid #374151", borderRadius: "8px", color: "#F3F4F6" }}
              itemStyle={{ color: "#38BDF8" }}
              formatter={(value) => [`${value}%`, "Score"]}
            />
            <Radar
              name="Score"
              dataKey="A"
              stroke="#38BDF8"
              fill="#38BDF8"
              fillOpacity={0.3}
            />
          </RadarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
