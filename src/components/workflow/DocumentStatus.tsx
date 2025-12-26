import { cn } from "@/lib/utils";
import {
  FileText,
  Clock,
  PenTool,
  Send,
  CheckCircle,
  XCircle,
  AlertCircle,
  Loader2,
  Eye,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";

export type DocumentStatusType =
  | "draft"
  | "pending_signature"
  | "signed"
  | "pending_send"
  | "sent"
  | "processing"
  | "approved"
  | "rejected"
  | "expired";

interface DocumentStatusProps {
  status: DocumentStatusType;
  className?: string;
  showLabel?: boolean;
  showIcon?: boolean;
  size?: "sm" | "md" | "lg";
  updatedAt?: Date;
  tooltip?: string;
}

const statusConfig: Record<
  DocumentStatusType,
  {
    label: string;
    icon: React.ElementType;
    color: string;
    bgColor: string;
    borderColor: string;
  }
> = {
  draft: {
    label: "טיוטה",
    icon: FileText,
    color: "text-crm-text-secondary",
    bgColor: "bg-neutral-100",
    borderColor: "border-neutral-200",
  },
  pending_signature: {
    label: "ממתין לחתימה",
    icon: PenTool,
    color: "text-crm-warning-dark",
    bgColor: "bg-crm-warning-light",
    borderColor: "border-crm-warning",
  },
  signed: {
    label: "נחתם",
    icon: CheckCircle,
    color: "text-crm-success-dark",
    bgColor: "bg-crm-success-light",
    borderColor: "border-crm-success",
  },
  pending_send: {
    label: "ממתין לשליחה",
    icon: Send,
    color: "text-crm-info-dark",
    bgColor: "bg-crm-info-light",
    borderColor: "border-crm-info",
  },
  sent: {
    label: "נשלח לחברה",
    icon: Send,
    color: "text-crm-primary-dark",
    bgColor: "bg-crm-primary-light",
    borderColor: "border-crm-primary",
  },
  processing: {
    label: "בטיפול",
    icon: Loader2,
    color: "text-crm-info-dark",
    bgColor: "bg-crm-info-light",
    borderColor: "border-crm-info",
  },
  approved: {
    label: "אושר",
    icon: CheckCircle,
    color: "text-crm-success-dark",
    bgColor: "bg-crm-success-light",
    borderColor: "border-crm-success",
  },
  rejected: {
    label: "נדחה",
    icon: XCircle,
    color: "text-crm-error-dark",
    bgColor: "bg-crm-error-light",
    borderColor: "border-crm-error",
  },
  expired: {
    label: "פג תוקף",
    icon: AlertCircle,
    color: "text-crm-text-muted",
    bgColor: "bg-neutral-100",
    borderColor: "border-neutral-300",
  },
};

const sizeClasses = {
  sm: {
    container: "px-2 py-0.5 text-xs gap-1",
    icon: "h-3 w-3",
  },
  md: {
    container: "px-3 py-1 text-sm gap-1.5",
    icon: "h-4 w-4",
  },
  lg: {
    container: "px-4 py-1.5 text-base gap-2",
    icon: "h-5 w-5",
  },
};

export const DocumentStatus = ({
  status,
  className,
  showLabel = true,
  showIcon = true,
  size = "md",
  updatedAt,
  tooltip,
}: DocumentStatusProps) => {
  const config = statusConfig[status];
  const Icon = config.icon;
  const sizeClass = sizeClasses[size];

  const content = (
    <div
      className={cn(
        "inline-flex items-center rounded-full font-medium border",
        config.bgColor,
        config.borderColor,
        config.color,
        sizeClass.container,
        className
      )}
    >
      {showIcon && (
        <Icon
          className={cn(
            sizeClass.icon,
            status === "processing" && "animate-spin"
          )}
        />
      )}
      {showLabel && <span>{config.label}</span>}
    </div>
  );

  if (tooltip || updatedAt) {
    return (
      <Tooltip>
        <TooltipTrigger asChild>{content}</TooltipTrigger>
        <TooltipContent>
          <div className="text-center">
            {tooltip && <p>{tooltip}</p>}
            {updatedAt && (
              <p className="text-xs text-muted-foreground">
                עודכן: {updatedAt.toLocaleDateString("he-IL")}
              </p>
            )}
          </div>
        </TooltipContent>
      </Tooltip>
    );
  }

  return content;
};

// Timeline component for showing document workflow progress
interface WorkflowTimelineProps {
  steps: {
    status: DocumentStatusType;
    label: string;
    date?: Date;
    description?: string;
    isActive?: boolean;
    isCompleted?: boolean;
  }[];
  className?: string;
}

export const WorkflowTimeline = ({ steps, className }: WorkflowTimelineProps) => {
  return (
    <div className={cn("relative", className)}>
      {steps.map((step, index) => {
        const config = statusConfig[step.status];
        const Icon = config.icon;
        const isLast = index === steps.length - 1;

        return (
          <div key={index} className="flex gap-4">
            {/* Timeline connector */}
            <div className="flex flex-col items-center">
              <div
                className={cn(
                  "w-10 h-10 rounded-full flex items-center justify-center border-2",
                  step.isCompleted
                    ? "bg-crm-success border-crm-success text-white"
                    : step.isActive
                    ? cn(config.bgColor, config.borderColor, config.color)
                    : "bg-neutral-100 border-neutral-300 text-crm-text-muted"
                )}
              >
                {step.isCompleted ? (
                  <CheckCircle className="h-5 w-5" />
                ) : (
                  <Icon
                    className={cn(
                      "h-5 w-5",
                      step.isActive && step.status === "processing" && "animate-spin"
                    )}
                  />
                )}
              </div>
              {!isLast && (
                <div
                  className={cn(
                    "w-0.5 h-16 my-1",
                    step.isCompleted ? "bg-crm-success" : "bg-neutral-200"
                  )}
                />
              )}
            </div>

            {/* Content */}
            <div className="flex-1 pb-8">
              <div className="flex items-center justify-between">
                <h4
                  className={cn(
                    "font-semibold",
                    step.isActive
                      ? "text-crm-text-primary"
                      : step.isCompleted
                      ? "text-crm-success-dark"
                      : "text-crm-text-muted"
                  )}
                >
                  {step.label}
                </h4>
                {step.date && (
                  <span className="text-xs text-crm-text-muted">
                    {step.date.toLocaleDateString("he-IL")}
                  </span>
                )}
              </div>
              {step.description && (
                <p className="text-sm text-crm-text-secondary mt-1">
                  {step.description}
                </p>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default DocumentStatus;
