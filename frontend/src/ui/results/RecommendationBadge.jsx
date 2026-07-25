import { recommendationConfig } from "../../utils/recommendationConfig";

export default function RecommendationBadge({ recommendation }) {
  const config = recommendationConfig[recommendation] || recommendationConfig.UNKNOWN;
  const { color, icon, label } = config;

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-sm font-medium border ${color}`}
      aria-label={`Recommendation: ${label}`}
    >
      <span aria-hidden="true">{icon}</span>
      {label}
    </span>
  );
}
