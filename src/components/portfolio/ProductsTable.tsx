import { useState } from "react";
import {
  ChevronDown,
  ExternalLink,
  MoreHorizontal,
  FileText,
  Edit,
  Trash2,
} from "lucide-react";
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

export interface Product {
  id: string;
  type: string;
  company: string;
  policyNumber?: string;
  track?: string;
  accumulated: number;
  monthlyDeposit: number;
  managementFeeDeposit?: number;
  managementFeeAccumulated?: number;
  status: "active" | "inactive" | "frozen" | "cancelled";
  source: "mislaka" | "har_habituach" | "manual";
  recommendation?: "keep" | "replace" | "cancel";
  lastUpdate?: string;
}

interface ProductsTableProps {
  products: Product[];
  title?: string;
  color?: "blue" | "green" | "purple" | "orange";
  onEdit?: (product: Product) => void;
  onDelete?: (product: Product) => void;
  onView?: (product: Product) => void;
  className?: string;
}

const statusLabels: Record<string, { label: string; variant: string }> = {
  active: { label: "פעיל", variant: "bg-crm-success-light text-crm-success-dark" },
  inactive: { label: "לא פעיל", variant: "bg-gray-100 text-gray-600" },
  frozen: { label: "מוקפא", variant: "bg-blue-100 text-blue-600" },
  cancelled: { label: "מסולק", variant: "bg-crm-error-light text-crm-error-dark" },
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

const formatPercent = (value?: number): string => {
  if (value === undefined) return "-";
  return `${value.toFixed(2)}%`;
};

export const ProductsTable = ({
  products,
  title = "מוצרים פנסיוניים",
  color = "blue",
  onEdit,
  onDelete,
  onView,
  className,
}: ProductsTableProps) => {
  const totalAccumulated = products.reduce((sum, p) => sum + p.accumulated, 0);
  const totalMonthly = products.reduce((sum, p) => sum + p.monthlyDeposit, 0);

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
                  חברה
                </th>
                <th className="text-right px-4 py-3 bg-crm-bg-secondary text-sm font-semibold text-crm-text-secondary">
                  מוצר / מסלול
                </th>
                <th className="text-right px-4 py-3 bg-crm-bg-secondary text-sm font-semibold text-crm-text-secondary">
                  מספר פוליסה
                </th>
                <th className="text-right px-4 py-3 bg-crm-bg-secondary text-sm font-semibold text-crm-text-secondary">
                  צבירה
                </th>
                <th className="text-right px-4 py-3 bg-crm-bg-secondary text-sm font-semibold text-crm-text-secondary">
                  הפקדה חודשית
                </th>
                <th className="text-right px-4 py-3 bg-crm-bg-secondary text-sm font-semibold text-crm-text-secondary">
                  דמ״נ הפקדה
                </th>
                <th className="text-right px-4 py-3 bg-crm-bg-secondary text-sm font-semibold text-crm-text-secondary">
                  דמ״נ צבירה
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
                  <td className="px-4 py-3 font-medium">{product.company}</td>
                  <td className="px-4 py-3">
                    <div>
                      <span className="font-medium">{product.type}</span>
                      {product.track && (
                        <p className="text-xs text-crm-text-muted">{product.track}</p>
                      )}
                    </div>
                  </td>
                  <td className="px-4 py-3 text-sm">{product.policyNumber || "-"}</td>
                  <td className="px-4 py-3 font-semibold">
                    {formatCurrency(product.accumulated)}
                  </td>
                  <td className="px-4 py-3">{formatCurrency(product.monthlyDeposit)}</td>
                  <td className="px-4 py-3 text-sm">
                    {formatPercent(product.managementFeeDeposit)}
                  </td>
                  <td className="px-4 py-3 text-sm">
                    {formatPercent(product.managementFeeAccumulated)}
                  </td>
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
                <td className="px-4 py-3" colSpan={3}>
                  סה״כ
                </td>
                <td className="px-4 py-3">{formatCurrency(totalAccumulated)}</td>
                <td className="px-4 py-3">{formatCurrency(totalMonthly)}</td>
                <td colSpan={6}></td>
              </tr>
            </tbody>
          </table>
        </div>
      </GroupHeader>
    </div>
  );
};

export default ProductsTable;
