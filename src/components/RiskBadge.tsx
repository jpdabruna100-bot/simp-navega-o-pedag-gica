import { RiskLevel, getRiskEmoji, getRiskLabel } from "@/data/mockData";

export function RiskBadge({ level }: { level: RiskLevel }) {
  return (
    <span className={`risk-badge risk-${level}`}>
      {getRiskEmoji(level)} {getRiskLabel(level)}
    </span>
  );
}
