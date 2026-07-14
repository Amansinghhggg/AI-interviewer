export default function ProgressScoreCard({ scores }) {
  const scoreItems = [
    { label: "Technical Ability", value: (scores.technical || 0) * 10 },
    { label: "Communication", value: (scores.communication || 0) * 10 },
    { label: "Problem Solving", value: (scores.problemSolving || 0) * 10 },
    { label: "Confidence", value: (scores.confidence || 0) * 10 },
    { label: "Topic Coverage", value: (scores.topicCoverage || 0) * 10 },
  ];

  const getColor = (value) => {
    if (value >= 80) return "bg-primary-500";
    if (value >= 60) return "bg-yellow-500";
    return "bg-red-500";
  };

  return (
    <div className="bg-dark-800 rounded-2xl p-6 border border-dark-700 h-full shadow-lg shadow-black/20 flex flex-col justify-center">
      <h3 className="text-dark-300 font-medium mb-6 uppercase tracking-wider text-sm">Detailed Breakdown</h3>
      <div className="space-y-5">
        {scoreItems.map((item, index) => (
          <div key={index}>
            <div className="flex justify-between items-center mb-1.5">
              <span className="text-sm font-medium text-dark-200">{item.label}</span>
              <span className="text-sm font-bold text-white">{item.value.toFixed(0)}%</span>
            </div>
            <div className="h-2 w-full bg-dark-700 rounded-full overflow-hidden" role="progressbar" aria-valuenow={item.value} aria-valuemin="0" aria-valuemax="100">
              <div
                className={`h-full rounded-full transition-all duration-1000 ease-out ${getColor(item.value)}`}
                style={{ width: `${item.value}%` }}
              ></div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
