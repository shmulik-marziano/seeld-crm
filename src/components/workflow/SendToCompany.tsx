import { useState } from "react";
import { cn } from "@/lib/utils";
import {
  Building2,
  Send,
  Check,
  Clock,
  AlertCircle,
  FileText,
  Mail,
  Upload,
  ExternalLink,
  RefreshCw,
  Eye,
  ChevronDown,
  ChevronUp,
  Loader2,
  CheckCircle,
  XCircle,
  MessageSquare,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { DocumentStatus, DocumentStatusType } from "./DocumentStatus";

// Insurance companies list
const insuranceCompanies = [
  { id: "migdal", name: "מגדל", logo: "🏛️" },
  { id: "harel", name: "הראל", logo: "🔷" },
  { id: "clal", name: "כלל", logo: "🔶" },
  { id: "phoenix", name: "הפניקס", logo: "🔥" },
  { id: "menora", name: "מנורה", logo: "💡" },
  { id: "ayalon", name: "איילון", logo: "🦌" },
  { id: "altshuler", name: "אלטשולר שחם", logo: "📈" },
  { id: "more", name: "מור", logo: "🌿" },
  { id: "psagot", name: "פסגות", logo: "⛰️" },
  { id: "analyst", name: "אנליסט", logo: "📊" },
];

export interface CompanySubmission {
  id: string;
  documentName: string;
  documentType: string;
  companyId: string;
  companyName: string;
  status: DocumentStatusType;
  submittedAt?: Date;
  processedAt?: Date;
  referenceNumber?: string;
  notes?: string;
  method: "email" | "portal" | "api";
}

interface SendToCompanyCardProps {
  submission: CompanySubmission;
  onRetry?: () => void;
  onViewDetails?: () => void;
  onViewDocument?: () => void;
  className?: string;
}

export const SendToCompanyCard = ({
  submission,
  onRetry,
  onViewDetails,
  onViewDocument,
  className,
}: SendToCompanyCardProps) => {
  const [expanded, setExpanded] = useState(false);
  const company = insuranceCompanies.find((c) => c.id === submission.companyId);

  const getMethodLabel = (method: string) => {
    switch (method) {
      case "email":
        return "אימייל";
      case "portal":
        return "פורטל חברה";
      case "api":
        return "API ישיר";
      default:
        return method;
    }
  };

  return (
    <Card className={cn("hover:shadow-card-hover transition-shadow", className)}>
      <CardContent className="p-4">
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-start gap-3 flex-1">
            {/* Company Logo */}
            <div className="w-10 h-10 rounded-lg bg-crm-bg-secondary flex items-center justify-center text-xl">
              {company?.logo || "🏢"}
            </div>

            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <h4 className="font-semibold text-crm-text-primary">
                  {submission.documentName}
                </h4>
                <Badge variant="outline" className="text-xs">
                  {submission.documentType}
                </Badge>
              </div>

              <div className="flex items-center gap-3 text-sm text-crm-text-secondary">
                <div className="flex items-center gap-1">
                  <Building2 className="h-4 w-4" />
                  <span>{company?.name || submission.companyName}</span>
                </div>
                <div className="flex items-center gap-1">
                  {submission.method === "email" && <Mail className="h-4 w-4" />}
                  {submission.method === "portal" && <ExternalLink className="h-4 w-4" />}
                  {submission.method === "api" && <Upload className="h-4 w-4" />}
                  <span>{getMethodLabel(submission.method)}</span>
                </div>
              </div>

              {/* Dates */}
              <div className="flex items-center gap-4 mt-2 text-xs text-crm-text-muted">
                {submission.submittedAt && (
                  <span>נשלח: {submission.submittedAt.toLocaleDateString("he-IL")}</span>
                )}
                {submission.processedAt && (
                  <span className="text-crm-success-dark">
                    טופל: {submission.processedAt.toLocaleDateString("he-IL")}
                  </span>
                )}
                {submission.referenceNumber && (
                  <span>מס׳ אסמכתא: {submission.referenceNumber}</span>
                )}
              </div>
            </div>
          </div>

          <div className="flex flex-col items-end gap-2">
            <DocumentStatus status={submission.status} size="sm" />
            <div className="flex gap-1">
              {onViewDocument && (
                <Button variant="ghost" size="icon" className="h-8 w-8" onClick={onViewDocument}>
                  <Eye className="h-4 w-4" />
                </Button>
              )}
              {submission.status === "rejected" && onRetry && (
                <Button variant="ghost" size="icon" className="h-8 w-8" onClick={onRetry}>
                  <RefreshCw className="h-4 w-4" />
                </Button>
              )}
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8"
                onClick={() => setExpanded(!expanded)}
              >
                {expanded ? (
                  <ChevronUp className="h-4 w-4" />
                ) : (
                  <ChevronDown className="h-4 w-4" />
                )}
              </Button>
            </div>
          </div>
        </div>

        {/* Expanded Details */}
        {expanded && submission.notes && (
          <div className="mt-4 pt-4 border-t border-crm-border-light">
            <p className="text-sm text-crm-text-secondary">{submission.notes}</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

// New Send to Company Dialog
interface NewSendToCompanyProps {
  documentId?: string;
  documentName?: string;
  suggestedCompany?: string;
  onSubmit?: (data: {
    companyId: string;
    method: "email" | "portal" | "api";
    notes?: string;
    documents?: string[];
  }) => void;
  trigger?: React.ReactNode;
}

export const NewSendToCompany = ({
  documentId,
  documentName,
  suggestedCompany,
  onSubmit,
  trigger,
}: NewSendToCompanyProps) => {
  const [open, setOpen] = useState(false);
  const [companyId, setCompanyId] = useState(suggestedCompany || "");
  const [method, setMethod] = useState<"email" | "portal" | "api">("email");
  const [notes, setNotes] = useState("");
  const [includeRelated, setIncludeRelated] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const selectedCompany = insuranceCompanies.find((c) => c.id === companyId);

  const handleSubmit = async () => {
    setIsSubmitting(true);
    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1500));

    onSubmit?.({
      companyId,
      method,
      notes,
      documents: includeRelated ? [documentId!, "related-doc-1"] : [documentId!],
    });

    setIsSubmitting(false);
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button className="gap-2">
            <Send className="h-4 w-4" />
            שלח לחברה
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="max-w-md" dir="rtl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Building2 className="h-5 w-5 text-crm-primary" />
            שליחה לחברת ביטוח
          </DialogTitle>
          <DialogDescription>
            {documentName && <span>מסמך: {documentName}</span>}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Company Selection */}
          <div className="space-y-2">
            <Label>חברת ביטוח</Label>
            <Select value={companyId} onValueChange={setCompanyId}>
              <SelectTrigger>
                <SelectValue placeholder="בחר חברה" />
              </SelectTrigger>
              <SelectContent>
                {insuranceCompanies.map((company) => (
                  <SelectItem key={company.id} value={company.id}>
                    <span className="flex items-center gap-2">
                      <span>{company.logo}</span>
                      <span>{company.name}</span>
                    </span>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Method Selection */}
          <div className="space-y-2">
            <Label>שיטת שליחה</Label>
            <div className="grid grid-cols-3 gap-2">
              <Button
                type="button"
                variant={method === "email" ? "default" : "outline"}
                className="gap-2 text-sm"
                onClick={() => setMethod("email")}
              >
                <Mail className="h-4 w-4" />
                אימייל
              </Button>
              <Button
                type="button"
                variant={method === "portal" ? "default" : "outline"}
                className="gap-2 text-sm"
                onClick={() => setMethod("portal")}
              >
                <ExternalLink className="h-4 w-4" />
                פורטל
              </Button>
              <Button
                type="button"
                variant={method === "api" ? "default" : "outline"}
                className="gap-2 text-sm"
                onClick={() => setMethod("api")}
              >
                <Upload className="h-4 w-4" />
                API
              </Button>
            </div>
          </div>

          {/* Method Description */}
          <div className="p-3 rounded-lg bg-crm-bg-secondary text-sm">
            {method === "email" && (
              <p className="text-crm-text-secondary">
                המסמך יישלח לכתובת האימייל הרשמית של {selectedCompany?.name || "החברה"}
              </p>
            )}
            {method === "portal" && (
              <p className="text-crm-text-secondary">
                תועבר לפורטל {selectedCompany?.name || "החברה"} להעלאת המסמך
              </p>
            )}
            {method === "api" && (
              <p className="text-crm-text-secondary">
                המסמך יועלה ישירות למערכת {selectedCompany?.name || "החברה"} דרך ממשק API
              </p>
            )}
          </div>

          {/* Include Related Documents */}
          <div className="flex items-center gap-2">
            <Checkbox
              id="include-related"
              checked={includeRelated}
              onCheckedChange={(checked) => setIncludeRelated(checked as boolean)}
            />
            <Label htmlFor="include-related" className="text-sm cursor-pointer">
              כלול מסמכים קשורים (נספחים, אישורים)
            </Label>
          </div>

          {/* Notes */}
          <div className="space-y-2">
            <Label htmlFor="notes">הערות (אופציונלי)</Label>
            <Textarea
              id="notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="הוסף הערות או הנחיות מיוחדות..."
              rows={3}
            />
          </div>
        </div>

        <DialogFooter className="gap-2">
          <Button variant="outline" onClick={() => setOpen(false)}>
            ביטול
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={!companyId || isSubmitting}
            className="gap-2"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                שולח...
              </>
            ) : (
              <>
                <Send className="h-4 w-4" />
                שלח לחברה
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

// Company Submission Status Summary
interface CompanySubmissionSummaryProps {
  submissions: CompanySubmission[];
  className?: string;
}

export const CompanySubmissionSummary = ({
  submissions,
  className,
}: CompanySubmissionSummaryProps) => {
  const pending = submissions.filter(
    (s) => s.status === "sent" || s.status === "processing"
  ).length;
  const approved = submissions.filter((s) => s.status === "approved").length;
  const rejected = submissions.filter((s) => s.status === "rejected").length;

  return (
    <div className={cn("grid grid-cols-3 gap-4", className)}>
      <Card className="bg-crm-info-light border-crm-info">
        <CardContent className="p-4 text-center">
          <div className="flex items-center justify-center gap-2 mb-1">
            <Clock className="h-5 w-5 text-crm-info-dark" />
            <span className="text-2xl font-bold text-crm-info-dark">{pending}</span>
          </div>
          <p className="text-sm text-crm-info-dark">בטיפול</p>
        </CardContent>
      </Card>

      <Card className="bg-crm-success-light border-crm-success">
        <CardContent className="p-4 text-center">
          <div className="flex items-center justify-center gap-2 mb-1">
            <CheckCircle className="h-5 w-5 text-crm-success-dark" />
            <span className="text-2xl font-bold text-crm-success-dark">{approved}</span>
          </div>
          <p className="text-sm text-crm-success-dark">אושרו</p>
        </CardContent>
      </Card>

      <Card className="bg-crm-error-light border-crm-error">
        <CardContent className="p-4 text-center">
          <div className="flex items-center justify-center gap-2 mb-1">
            <XCircle className="h-5 w-5 text-crm-error-dark" />
            <span className="text-2xl font-bold text-crm-error-dark">{rejected}</span>
          </div>
          <p className="text-sm text-crm-error-dark">נדחו</p>
        </CardContent>
      </Card>
    </div>
  );
};

// Company Quick Actions
interface CompanyQuickActionsProps {
  companyId: string;
  onSendDocument?: () => void;
  onOpenPortal?: () => void;
  onViewHistory?: () => void;
  className?: string;
}

export const CompanyQuickActions = ({
  companyId,
  onSendDocument,
  onOpenPortal,
  onViewHistory,
  className,
}: CompanyQuickActionsProps) => {
  const company = insuranceCompanies.find((c) => c.id === companyId);

  if (!company) return null;

  return (
    <Card className={className}>
      <CardContent className="p-4">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-lg bg-crm-bg-secondary flex items-center justify-center text-2xl">
            {company.logo}
          </div>
          <div className="flex-1">
            <h4 className="font-semibold text-crm-text-primary">{company.name}</h4>
            <p className="text-sm text-crm-text-secondary">פעולות מהירות</p>
          </div>
          <div className="flex gap-2">
            {onSendDocument && (
              <Button variant="outline" size="sm" className="gap-1" onClick={onSendDocument}>
                <Send className="h-4 w-4" />
                שלח מסמך
              </Button>
            )}
            {onOpenPortal && (
              <Button variant="outline" size="sm" className="gap-1" onClick={onOpenPortal}>
                <ExternalLink className="h-4 w-4" />
                פורטל
              </Button>
            )}
            {onViewHistory && (
              <Button variant="ghost" size="sm" className="gap-1" onClick={onViewHistory}>
                <MessageSquare className="h-4 w-4" />
                היסטוריה
              </Button>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default SendToCompanyCard;
