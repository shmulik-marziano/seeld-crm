import { useState } from "react";
import { Check, X, AlertTriangle, ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";

interface Column {
  key: string;
  label: string;
  type?: "text" | "number" | "date" | "currency";
}

interface DataRow {
  id: string;
  data: Record<string, any>;
  status?: "valid" | "warning" | "error";
  errors?: string[];
}

interface DataPreviewTableProps {
  columns: Column[];
  data: DataRow[];
  title?: string;
  pageSize?: number;
  selectable?: boolean;
  onSelectionChange?: (selectedIds: string[]) => void;
  onRowClick?: (row: DataRow) => void;
  className?: string;
}

const formatValue = (value: any, type?: string): string => {
  if (value === null || value === undefined) return "-";

  switch (type) {
    case "currency":
      return new Intl.NumberFormat("he-IL", {
        style: "currency",
        currency: "ILS",
        maximumFractionDigits: 0,
      }).format(Number(value));
    case "date":
      return new Date(value).toLocaleDateString("he-IL");
    case "number":
      return new Intl.NumberFormat("he-IL").format(Number(value));
    default:
      return String(value);
  }
};

export const DataPreviewTable = ({
  columns,
  data,
  title = "תצוגה מקדימה",
  pageSize = 10,
  selectable = true,
  onSelectionChange,
  onRowClick,
  className,
}: DataPreviewTableProps) => {
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

  const totalPages = Math.ceil(data.length / pageSize);
  const startIndex = (currentPage - 1) * pageSize;
  const endIndex = startIndex + pageSize;
  const currentData = data.slice(startIndex, endIndex);

  const validCount = data.filter((r) => r.status === "valid" || !r.status).length;
  const warningCount = data.filter((r) => r.status === "warning").length;
  const errorCount = data.filter((r) => r.status === "error").length;

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      const allIds = new Set(data.map((row) => row.id));
      setSelectedIds(allIds);
      onSelectionChange?.(Array.from(allIds));
    } else {
      setSelectedIds(new Set());
      onSelectionChange?.([]);
    }
  };

  const handleSelectRow = (rowId: string, checked: boolean) => {
    const newSelected = new Set(selectedIds);
    if (checked) {
      newSelected.add(rowId);
    } else {
      newSelected.delete(rowId);
    }
    setSelectedIds(newSelected);
    onSelectionChange?.(Array.from(newSelected));
  };

  const isAllSelected = data.length > 0 && selectedIds.size === data.length;
  const isPartialSelected = selectedIds.size > 0 && selectedIds.size < data.length;

  const getRowStatusIcon = (status?: DataRow["status"]) => {
    switch (status) {
      case "valid":
        return <Check className="h-4 w-4 text-crm-success" />;
      case "warning":
        return <AlertTriangle className="h-4 w-4 text-crm-warning" />;
      case "error":
        return <X className="h-4 w-4 text-crm-error" />;
      default:
        return null;
    }
  };

  return (
    <div className={cn("rounded-xl border border-crm-border-light overflow-hidden", className)}>
      {/* Header */}
      <div className="flex items-center justify-between p-4 bg-crm-bg-secondary border-b border-crm-border-light">
        <div className="flex items-center gap-4">
          <h3 className="font-semibold text-crm-text-primary">{title}</h3>
          <div className="flex gap-2">
            <Badge className="bg-crm-success-light text-crm-success-dark">
              {validCount} תקינים
            </Badge>
            {warningCount > 0 && (
              <Badge className="bg-crm-warning-light text-crm-warning-dark">
                {warningCount} אזהרות
              </Badge>
            )}
            {errorCount > 0 && (
              <Badge className="bg-crm-error-light text-crm-error-dark">
                {errorCount} שגיאות
              </Badge>
            )}
          </div>
        </div>
        <div className="text-sm text-crm-text-secondary">
          {data.length} שורות | {selectedIds.size} נבחרו
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="bg-crm-bg-secondary border-b border-crm-border-light">
              {selectable && (
                <th className="px-4 py-3 text-right w-12">
                  <Checkbox
                    checked={isAllSelected}
                    // @ts-ignore
                    indeterminate={isPartialSelected}
                    onCheckedChange={handleSelectAll}
                  />
                </th>
              )}
              <th className="px-4 py-3 text-right w-12 text-sm font-semibold text-crm-text-secondary">
                סטטוס
              </th>
              {columns.map((col) => (
                <th
                  key={col.key}
                  className="px-4 py-3 text-right text-sm font-semibold text-crm-text-secondary"
                >
                  {col.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {currentData.map((row) => (
              <tr
                key={row.id}
                onClick={() => onRowClick?.(row)}
                className={cn(
                  "border-b border-crm-border-light transition-colors",
                  row.status === "error" && "bg-crm-error-light/30",
                  row.status === "warning" && "bg-crm-warning-light/30",
                  selectedIds.has(row.id) && "bg-crm-bg-selected",
                  onRowClick && "cursor-pointer hover:bg-crm-bg-hover"
                )}
              >
                {selectable && (
                  <td className="px-4 py-3">
                    <Checkbox
                      checked={selectedIds.has(row.id)}
                      onCheckedChange={(checked) =>
                        handleSelectRow(row.id, checked as boolean)
                      }
                      onClick={(e) => e.stopPropagation()}
                    />
                  </td>
                )}
                <td className="px-4 py-3">
                  {getRowStatusIcon(row.status)}
                </td>
                {columns.map((col) => (
                  <td key={col.key} className="px-4 py-3 text-sm">
                    {formatValue(row.data[col.key], col.type)}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between p-4 bg-crm-bg-secondary border-t border-crm-border-light">
          <div className="text-sm text-crm-text-secondary">
            מציג {startIndex + 1}-{Math.min(endIndex, data.length)} מתוך {data.length}
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="icon"
              className="h-8 w-8"
              disabled={currentPage === 1}
              onClick={() => setCurrentPage((p) => p - 1)}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
            <span className="text-sm text-crm-text-secondary px-2">
              עמוד {currentPage} מתוך {totalPages}
            </span>
            <Button
              variant="outline"
              size="icon"
              className="h-8 w-8"
              disabled={currentPage === totalPages}
              onClick={() => setCurrentPage((p) => p + 1)}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};

export default DataPreviewTable;
