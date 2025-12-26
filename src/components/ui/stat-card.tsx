import { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

type ColorVariant = "blue" | "green" | "orange" | "red" | "purple" | "teal";

interface StatCardProps {
  label: string;
  value: string | number;
  icon?: LucideIcon;
  color?: ColorVariant;
  trend?: {
    value: number;
    direction: "up" | "down";
  };
  className?: string;
}

const colorClasses: Record<ColorVariant, string> = {
  blue: "bg-crm-primary-light text-crm-primary",
  green: "bg-crm-success-light text-crm-success",
  orange: "bg-crm-warning-light text-crm-warning",
  red: "bg-crm-error-light text-crm-error",
  purple: "bg-purple-100 text-purple-600",
  teal: "bg-teal-100 text-teal-600",
};

export const StatCard = ({
  label,
  value,
  icon: Icon,
  color = "blue",
  trend,
  className,
}: StatCardProps) => {
  return (
    <div
      className={cn(
        "bg-white rounded-xl p-5 shadow-card border border-crm-border-light transition-all duration-200 hover:shadow-card-hover hover:-translate-y-0.5",
        className
      )}
    >
      {Icon && (
        <div
          className={cn(
            "w-12 h-12 rounded-lg flex items-center justify-center mb-3",
            colorClasses[color]
          )}
        >
          <Icon className="h-6 w-6" />
        </div>
      )}
      <p className="text-sm text-crm-text-secondary mb-1">{label}</p>
      <p className="text-2xl font-bold text-crm-text-primary">{value}</p>
      {trend && (
        <div
          className={cn(
            "flex items-center gap-1 text-sm mt-2",
            trend.direction === "up" ? "text-crm-success" : "text-crm-error"
          )}
        >
          <span>{trend.direction === "up" ? "↑" : "↓"}</span>
          <span>{Math.abs(trend.value)}%</span>
        </div>
      )}
    </div>
  );
};

export default StatCard;
