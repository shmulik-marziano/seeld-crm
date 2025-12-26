import { useState } from "react";
import { MoreHorizontal, FileText, Edit, Trash2, ShieldCheck } from "lucide-react";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { GroupHeader } from "@/components/ui/group-header";

export interface HealthProduct {
  id: string;
  type: "health" | "disability" | "critical_illness" | "nursing";
  company: string;
  policyNumber?: string;
  planName?: string;
  coverageAmount?: number;
  monthlyPremium: number;
  status: "active" | "inactive" | "cancelled";
  startDate?: string;
  endDate?: string;
  source: "mislaka" | "har_habituach" | "manual";
  recommendation?: "keep" | "replace" | "cancel";
}

interface HealthTableProps {
  products: HealthProduct[];
  title?: string;
  color?: "blue" | "green" | "purple" | "red";
  onEdit?: (product: HealthProduct) => void;
  onDelete?: (product: HealthProduct) => void;
  onView?: (product: HealthProduct) => void;
  className?: string;
}

const typeLabels: Record<string, { label: string; color: string }> = {
  health: { label: "ביטוח בריאות", color: "bg-green-100 text-green-700" },
  disability: { label: "אובדן כושר עבודה", color: "bg-blue-100 text-blue-700" },
  critical_illness: { label: "מחלות קשות", color: "bg-purple-100 text-purple-700" },
  nursing: { label: "סיעודי", color: "bg-orange-100 text-orange-700" },
};

const statusLabels: Record<string, { label: string; variant: string }> = {
  active: { label: "פעיל", variant: "bg-crm-success-light text-crm-success-dark" },
  inactive: { label: "לא פעיל", variant: "bg-gray-100 text-gray-600" },
  cancelled: { label: "מבוטל", variant: "bg-crm-error-light text-crm-error-dark" },
};

const sourceLabels: Record<string, string> = {
  mislaka: "מסלקה",
  har_habituach: "הר הביטוח",
  manual: "ידני",
};

const recommendationLabels: Record<string, { label: string; variant: string }> = {
  keep: { label: "לשמור", variant: "bg-crm-success-light text-crm-success-dark" },
  replace: { label: "להחליף", variant: "bg-crm-warning-light text-crm-warning-dark" },
  cancel: { label: "לבטל", variant: "bg-crm-error-light text-crm-error-dark" },
};

const formatCurrency = (value: number): string => {
  return new Intl.NumberFormat("he-IL", {
    style: "currency",
    currency: "ILS",
    maximumFractionDigits: 0,
  }).format(value);
};

const formatDate = (date?: string): string => {
  if (!date) return "-";
  return new Date(date).toLocaleDateString("he-IL");
};

export const HealthTable = ({
  products,
  title = "ביטוחי בריאות וסיכונים",
  color = "red",
  onEdit,
  onDelete,
  onView,
  className,
}: HealthTableProps) => {
  const totalPremium = products.reduce((sum, p) => sum + p.monthlyPremium, 0);
  const totalCoverage = products.reduce((sum, p) => sum + (p.coverageAmount || 0), 0);

  return (
    <div className={cn("rounded-xl border border-crm-border-light overflow-hidden", className)}>
      <GroupHeader
        title={title}
        count={products.length}
        color={color}
        defaultExpanded={true}
      >
        <div className="overflow-x-auto">
          <table className="data-table w-full">
            <thead>
              <tr>
                <th className="text-right px-4 py-3 bg-crm-bg-secondary text-sm font-semibold text-crm-text-secondary">
                  סוג ביטוח
                </th>
                <th className="text-right px-4 py-3 bg-crm-bg-secondary text-sm font-semibold text-crm-text-secondary">
                  חברה
                </th>
                <th className="text-right px-4 py-3 bg-crm-bg-secondary text-sm font-semibold text-crm-text-secondary">
                  תוכנית
                </th>
                <th className="text-right px-4 py-3 bg-crm-bg-secondary text-sm font-semibold text-crm-text-secondary">
                  מספר פוליסה
                </th>
                <th className="text-right px-4 py-3 bg-crm-bg-secondary text-sm font-semibold text-crm-text-secondary">
                  סכום כיסוי
                </th>
                <th className="text-right px-4 py-3 bg-crm-bg-secondary text-sm font-semibold text-crm-text-secondary">
                  פרמיה חודשית
                </th>
                <th className="text-right px-4 py-3 bg-crm-bg-secondary text-sm font-semibold text-crm-text-secondary">
                  תאריך התחלה
                </th>
                <th className="text-right px-4 py-3 bg-crm-bg-secondary text-sm font-semibold text-crm-text-secondary">
                  סטטוס
                </th>
                <th className="text-right px-4 py-3 bg-crm-bg-secondary text-sm font-semibold text-crm-text-secondary">
                  מקור
                </th>
                <th className="text-right px-4 py-3 bg-crm-bg-secondary text-sm font-semibold text-crm-text-secondary">
                  המלצה
                </th>
                <th className="text-right px-4 py-3 bg-crm-bg-secondary text-sm font-semibold text-crm-text-secondary">
                  פעולות
                </th>
              </tr>
            </thead>
            <tbody>
              {products.map((product) => (
                <tr
                  key={product.id}
                  className="border-b border-crm-border-light hover:bg-crm-bg-hover transition-colors"
                >
                  <td className="px-4 py-3">
                    <Badge className={cn("text-xs", typeLabels[product.type]?.color)}>
                      {typeLabels[product.type]?.label}
                    </Badge>
                  </td>
                  <td className="px-4 py-3 font-medium">{product.company}</td>
                  <td className="px-4 py-3 text-sm">{product.planName || "-"}</td>
                  <td className="px-4 py-3 text-sm">{product.policyNumber || "-"}</td>
                  <td className="px-4 py-3 font-semibold">
                    {product.coverageAmount ? formatCurrency(product.coverageAmount) : "-"}
                  </td>
                  <td className="px-4 py-3">{formatCurrency(product.monthlyPremium)}</td>
                  <td className="px-4 py-3 text-sm">{formatDate(product.startDate)}</td>
                  <td className="px-4 py-3">
                    <Badge className={cn("text-xs", statusLabels[product.status]?.variant)}>
                      {statusLabels[product.status]?.label}
                    </Badge>
                  </td>
                  <td className="px-4 py-3 text-sm text-crm-text-secondary">
                    {sourceLabels[product.source]}
                  </td>
                  <td className="px-4 py-3">
                    {product.recommendation && recommendationLabels[product.recommendation] && (
                      <Badge
                        className={cn(
                          "text-xs",
                          recommendationLabels[product.recommendation].variant
                        )}
                      >
                        {recommendationLabels[product.recommendation].label}
                      </Badge>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => onView?.(product)}>
                          <FileText className="h-4 w-4 ml-2" />
                          צפייה בפרטים
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => onEdit?.(product)}>
                          <Edit className="h-4 w-4 ml-2" />
                          עריכה
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => onDelete?.(product)}
                          className="text-crm-error"
                        >
                          <Trash2 className="h-4 w-4 ml-2" />
                          מחיקה
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </td>
                </tr>
              ))}
              {/* Summary row */}
              <tr className="bg-crm-bg-secondary font-semibold">
                <td className="px-4 py-3" colSpan={4}>
                  סה״כ
                </td>
                <td className="px-4 py-3">{formatCurrency(totalCoverage)}</td>
                <td className="px-4 py-3">{formatCurrency(totalPremium)}</td>
                <td colSpan={5}></td>
              </tr>
            </tbody>
          </table>
        </div>
      </GroupHeader>
    </div>
  );
};

export default HealthTable;
