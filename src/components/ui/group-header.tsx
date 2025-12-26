import { useState } from "react";
import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";

type ColorVariant =
  | "blue"
  | "purple"
  | "green"
  | "yellow"
  | "red"
  | "orange"
  | "pink"
  | "teal"
  | "indigo"
  | "gray";

interface GroupHeaderProps {
  title: string;
  count?: number;
  color?: ColorVariant;
  defaultExpanded?: boolean;
  onToggle?: (expanded: boolean) => void;
  children?: React.ReactNode;
  className?: string;
}

const colorClasses: Record<ColorVariant, string> = {
  blue: "bg-group-blue",
  purple: "bg-group-purple",
  green: "bg-group-green",
  yellow: "bg-group-yellow text-crm-text-primary",
  red: "bg-group-red",
  orange: "bg-group-orange",
  pink: "bg-group-pink",
  teal: "bg-group-teal",
  indigo: "bg-group-indigo",
  gray: "bg-group-gray",
};

export const GroupHeader = ({
  title,
  count,
  color = "blue",
  defaultExpanded = true,
  onToggle,
  children,
  className,
}: GroupHeaderProps) => {
  const [isExpanded, setIsExpanded] = useState(defaultExpanded);

  const handleToggle = () => {
    const newExpanded = !isExpanded;
    setIsExpanded(newExpanded);
    onToggle?.(newExpanded);
  };

  return (
    <div className={cn("group-container", className)}>
      <div
        onClick={handleToggle}
        className={cn(
          "group-header flex items-center gap-3 px-4 py-3 rounded-lg text-white font-semibold cursor-pointer select-none",
          colorClasses[color],
          !isExpanded && "collapsed"
        )}
      >
        <ChevronDown
          className={cn(
            "h-4 w-4 transition-transform duration-200",
            !isExpanded && "-rotate-90 rtl:rotate-90"
          )}
        />
        <span className="group-header-title flex-1">{title}</span>
        {typeof count === "number" && (
          <span className="group-header-count bg-white/20 px-2 py-0.5 rounded-full text-xs">
            {count} פריטים
          </span>
        )}
      </div>
      {isExpanded && children && (
        <div className="group-content mt-1">
          {children}
        </div>
      )}
    </div>
  );
};

export default GroupHeader;
