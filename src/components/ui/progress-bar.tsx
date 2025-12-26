import { cn } from "@/lib/utils";

type ColorVariant = "blue" | "green" | "yellow" | "red" | "purple";
type SizeVariant = "sm" | "md" | "lg";

interface ProgressBarProps {
  value: number;
  max?: number;
  label?: string;
  showValue?: boolean;
  color?: ColorVariant;
  size?: SizeVariant;
  className?: string;
}

const colorClasses: Record<ColorVariant, string> = {
  blue: "bg-crm-primary",
  green: "bg-crm-success",
  yellow: "bg-crm-warning",
  red: "bg-crm-error",
  purple: "bg-purple-600",
};

const sizeClasses: Record<SizeVariant, string> = {
  sm: "h-1",
  md: "h-2",
  lg: "h-3",
};

export const ProgressBar = ({
  value,
  max = 100,
  label,
  showValue = true,
  color = "blue",
  size = "md",
  className,
}: ProgressBarProps) => {
  const percentage = Math.min(Math.max((value / max) * 100, 0), 100);

  return (
    <div className={cn("w-full", className)}>
      {(label || showValue) && (
        <div className="flex justify-between mb-1 text-sm text-crm-text-secondary">
          {label && <span>{label}</span>}
          {showValue && <span>{percentage.toFixed(0)}%</span>}
        </div>
      )}
      <div
        className={cn(
          "w-full bg-crm-bg-hover rounded-full overflow-hidden",
          sizeClasses[size]
        )}
      >
        <div
          className={cn(
            "h-full rounded-full transition-all duration-300 ease-out",
            colorClasses[color]
          )}
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
};

export default ProgressBar;
