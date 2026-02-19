import { RiskLevel } from "@/data/mockData";

interface RiskFilterButtonsProps {
  value: RiskLevel | "all";
  onChange: (value: RiskLevel | "all") => void;
}

export function RiskFilterButtons({ value, onChange }: RiskFilterButtonsProps) {
  const options: { key: RiskLevel | "all"; label: string }[] = [
    { key: "all", label: "Todos" },
    { key: "high", label: "🔴" },
    { key: "medium", label: "🟡" },
    { key: "low", label: "🟢" },
  ];

  return (
    <div className="flex gap-2">
      {options.map((o) => (
        <button
          key={o.key}
          onClick={() => onChange(o.key)}
          className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
            value === o.key
              ? "bg-primary text-primary-foreground"
              : "bg-secondary text-secondary-foreground hover:bg-secondary/80"
          }`}
        >
          {o.label}
        </button>
      ))}
    </div>
  );
}
