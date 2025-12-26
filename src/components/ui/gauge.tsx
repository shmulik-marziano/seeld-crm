import { cn } from "@/lib/utils";

type ColorVariant = "blue" | "green" | "yellow" | "red";
type SizeVariant = "sm" | "md" | "lg";

interface GaugeProps {
  value: number;
  max?: number;
  label?: string;
  color?: ColorVariant;
  size?: SizeVariant;
  showValue?: boolean;
  className?: string;
}

const colorClasses: Record<ColorVariant, string> = {
  blue: "stroke-crm-primary",
  green: "stroke-crm-success",
  yellow: "stroke-crm-warning",
  red: "stroke-crm-error",
};

const sizeConfig: Record<SizeVariant, { size: number; strokeWidth: number; fontSize: string }> = {
  sm: { size: 60, strokeWidth: 6, fontSize: "text-sm" },
  md: { size: 100, strokeWidth: 8, fontSize: "text-xl" },
  lg: { size: 140, strokeWidth: 10, fontSize: "text-2xl" },
};

export const Gauge = ({
  value,
  max = 100,
  label,
  color = "blue",
  size = "md",
  showValue = true,
  className,
}: GaugeProps) => {
  const percentage = Math.min(Math.max((value / max) * 100, 0), 100);
  const config = sizeConfig[size];
  const radius = (config.size - config.strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (percentage / 100) * circumference;

  return (
    <div className={cn("gauge relative inline-flex items-center justify-center", className)}>
      <svg
        className="gauge-circle -rotate-90"
        width={config.size}
        height={config.size}
      >
        {/* Background circle */}
        <circle
          className="gauge-bg fill-none stroke-crm-bg-hover"
          cx={config.size / 2}
          cy={config.size / 2}
          r={radius}
          strokeWidth={config.strokeWidth}
        />
        {/* Value circle */}
        <circle
          className={cn(
            "gauge-value fill-none transition-all duration-500 ease-out",
            colorClasses[color]
          )}
          cx={config.size / 2}
          cy={config.size / 2}
          r={radius}
          strokeWidth={config.strokeWidth}
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          strokeLinecap="round"
        />
      </svg>
      <div className="gauge-content absolute flex flex-col items-center justify-center">
        {showValue && (
          <span className={cn("gauge-number font-bold text-crm-text-primary", config.fontSize)}>
            {percentage.toFixed(0)}%
          </span>
        )}
        {label && (
          <span className="gauge-label text-xs text-crm-text-muted">{label}</span>
        )}
      </div>
    </div>
  );
};

export default Gauge;
