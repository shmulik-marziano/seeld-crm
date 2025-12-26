import { useState } from "react";
import { cn } from "@/lib/utils";
import {
  PenTool,
  Send,
  Mail,
  MessageSquare,
  Link2,
  Copy,
  Check,
  Clock,
  AlertCircle,
  FileText,
  Eye,
  RefreshCw,
  X,
  User,
  Phone,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
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
import { Checkbox } from "@/components/ui/checkbox";
import { DocumentStatus, DocumentStatusType } from "./DocumentStatus";

export interface SignatureRequestData {
  id: string;
  documentName: string;
  documentType: string;
  recipientName: string;
  recipientEmail?: string;
  recipientPhone?: string;
  status: DocumentStatusType;
  createdAt: Date;
  sentAt?: Date;
  signedAt?: Date;
  expiresAt?: Date;
  signatureMethod?: "email" | "sms" | "link";
  remindersSent?: number;
}

interface SignatureRequestCardProps {
  request: SignatureRequestData;
  onResend?: () => void;
  onCancel?: () => void;
  onViewDocument?: () => void;
  className?: string;
}

export const SignatureRequestCard = ({
  request,
  onResend,
  onCancel,
  onViewDocument,
  className,
}: SignatureRequestCardProps) => {
  const isExpired = request.expiresAt && new Date() > request.expiresAt;
  const canResend = ["pending_signature", "expired"].includes(request.status);

  return (
    <Card className={cn("hover:shadow-card-hover transition-shadow", className)}>
      <CardContent className="p-4">
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <FileText className="h-5 w-5 text-crm-primary" />
              <h4 className="font-semibold text-crm-text-primary">
                {request.documentName}
              </h4>
              <Badge variant="outline" className="text-xs">
                {request.documentType}
              </Badge>
            </div>

            <div className="flex items-center gap-4 text-sm text-crm-text-secondary">
              <div className="flex items-center gap-1">
                <User className="h-4 w-4" />
                <span>{request.recipientName}</span>
              </div>
              {request.recipientEmail && (
                <div className="flex items-center gap-1">
                  <Mail className="h-4 w-4" />
                  <span>{request.recipientEmail}</span>
                </div>
              )}
              {request.recipientPhone && (
                <div className="flex items-center gap-1">
                  <Phone className="h-4 w-4" />
                  <span>{request.recipientPhone}</span>
                </div>
              )}
            </div>

            <div className="flex items-center gap-4 mt-3 text-xs text-crm-text-muted">
              <span>נוצר: {request.createdAt.toLocaleDateString("he-IL")}</span>
              {request.sentAt && (
                <span>נשלח: {request.sentAt.toLocaleDateString("he-IL")}</span>
              )}
              {request.signedAt && (
                <span className="text-crm-success-dark">
                  נחתם: {request.signedAt.toLocaleDateString("he-IL")}
                </span>
              )}
              {request.expiresAt && !request.signedAt && (
                <span className={isExpired ? "text-crm-error" : ""}>
                  תפוגה: {request.expiresAt.toLocaleDateString("he-IL")}
                </span>
              )}
            </div>
          </div>

          <div className="flex flex-col items-end gap-2">
            <DocumentStatus
              status={isExpired && request.status === "pending_signature" ? "expired" : request.status}
              size="sm"
            />
            <div className="flex gap-1">
              {onViewDocument && (
                <Button variant="ghost" size="icon" className="h-8 w-8" onClick={onViewDocument}>
                  <Eye className="h-4 w-4" />
                </Button>
              )}
              {canResend && onResend && (
                <Button variant="ghost" size="icon" className="h-8 w-8" onClick={onResend}>
                  <RefreshCw className="h-4 w-4" />
                </Button>
              )}
              {request.status === "pending_signature" && onCancel && (
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 text-crm-error hover:text-crm-error-dark"
                  onClick={onCancel}
                >
                  <X className="h-4 w-4" />
                </Button>
              )}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

// New Signature Request Dialog
interface NewSignatureRequestProps {
  documentId?: string;
  documentName?: string;
  clientName?: string;
  clientEmail?: string;
  clientPhone?: string;
  onSubmit?: (data: {
    method: "email" | "sms" | "link";
    email?: string;
    phone?: string;
    message?: string;
    expiryDays?: number;
  }) => void;
  trigger?: React.ReactNode;
}

export const NewSignatureRequest = ({
  documentId,
  documentName,
  clientName,
  clientEmail,
  clientPhone,
  onSubmit,
  trigger,
}: NewSignatureRequestProps) => {
  const [open, setOpen] = useState(false);
  const [method, setMethod] = useState<"email" | "sms" | "link">("email");
  const [email, setEmail] = useState(clientEmail || "");
  const [phone, setPhone] = useState(clientPhone || "");
  const [message, setMessage] = useState("");
  const [expiryDays, setExpiryDays] = useState("7");
  const [sendReminders, setSendReminders] = useState(true);
  const [linkCopied, setLinkCopied] = useState(false);

  const handleSubmit = () => {
    onSubmit?.({
      method,
      email: method === "email" ? email : undefined,
      phone: method === "sms" ? phone : undefined,
      message,
      expiryDays: parseInt(expiryDays),
    });
    setOpen(false);
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(`https://seeld.app/sign/${documentId}`);
    setLinkCopied(true);
    setTimeout(() => setLinkCopied(false), 2000);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button className="gap-2">
            <PenTool className="h-4 w-4" />
            בקש חתימה
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="max-w-md" dir="rtl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <PenTool className="h-5 w-5 text-crm-primary" />
            בקשת חתימה דיגיטלית
          </DialogTitle>
          <DialogDescription>
            {documentName && <span>מסמך: {documentName}</span>}
            {clientName && <span className="block">לקוח: {clientName}</span>}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Method Selection */}
          <div className="space-y-2">
            <Label>שיטת שליחה</Label>
            <div className="grid grid-cols-3 gap-2">
              <Button
                type="button"
                variant={method === "email" ? "default" : "outline"}
                className="gap-2"
                onClick={() => setMethod("email")}
              >
                <Mail className="h-4 w-4" />
                אימייל
              </Button>
              <Button
                type="button"
                variant={method === "sms" ? "default" : "outline"}
                className="gap-2"
                onClick={() => setMethod("sms")}
              >
                <MessageSquare className="h-4 w-4" />
                SMS
              </Button>
              <Button
                type="button"
                variant={method === "link" ? "default" : "outline"}
                className="gap-2"
                onClick={() => setMethod("link")}
              >
                <Link2 className="h-4 w-4" />
                קישור
              </Button>
            </div>
          </div>

          {/* Email Input */}
          {method === "email" && (
            <div className="space-y-2">
              <Label htmlFor="email">כתובת אימייל</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="email@example.com"
                dir="ltr"
              />
            </div>
          )}

          {/* Phone Input */}
          {method === "sms" && (
            <div className="space-y-2">
              <Label htmlFor="phone">מספר טלפון</Label>
              <Input
                id="phone"
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="050-1234567"
                dir="ltr"
              />
            </div>
          )}

          {/* Link Display */}
          {method === "link" && (
            <div className="space-y-2">
              <Label>קישור לחתימה</Label>
              <div className="flex gap-2">
                <Input
                  value={`https://seeld.app/sign/${documentId || "..."}`}
                  readOnly
                  dir="ltr"
                  className="text-sm"
                />
                <Button
                  type="button"
                  variant="outline"
                  size="icon"
                  onClick={handleCopyLink}
                >
                  {linkCopied ? (
                    <Check className="h-4 w-4 text-crm-success" />
                  ) : (
                    <Copy className="h-4 w-4" />
                  )}
                </Button>
              </div>
            </div>
          )}

          {/* Message */}
          {method !== "link" && (
            <div className="space-y-2">
              <Label htmlFor="message">הודעה אישית (אופציונלי)</Label>
              <Textarea
                id="message"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="הוסף הודעה אישית לבקשת החתימה..."
                rows={3}
              />
            </div>
          )}

          {/* Expiry */}
          <div className="space-y-2">
            <Label>תוקף הבקשה</Label>
            <Select value={expiryDays} onValueChange={setExpiryDays}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="3">3 ימים</SelectItem>
                <SelectItem value="7">שבוע</SelectItem>
                <SelectItem value="14">שבועיים</SelectItem>
                <SelectItem value="30">חודש</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Reminders */}
          {method !== "link" && (
            <div className="flex items-center gap-2">
              <Checkbox
                id="reminders"
                checked={sendReminders}
                onCheckedChange={(checked) => setSendReminders(checked as boolean)}
              />
              <Label htmlFor="reminders" className="text-sm cursor-pointer">
                שלח תזכורות אוטומטיות
              </Label>
            </div>
          )}
        </div>

        <DialogFooter className="gap-2">
          <Button variant="outline" onClick={() => setOpen(false)}>
            ביטול
          </Button>
          <Button onClick={handleSubmit} className="gap-2">
            <Send className="h-4 w-4" />
            {method === "link" ? "צור קישור" : "שלח בקשה"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

// Signature Status Summary
interface SignatureStatusSummaryProps {
  requests: SignatureRequestData[];
  className?: string;
}

export const SignatureStatusSummary = ({
  requests,
  className,
}: SignatureStatusSummaryProps) => {
  const pending = requests.filter((r) => r.status === "pending_signature").length;
  const signed = requests.filter((r) => r.status === "signed" || r.status === "approved").length;
  const expired = requests.filter(
    (r) => r.status === "expired" || (r.expiresAt && new Date() > r.expiresAt && r.status === "pending_signature")
  ).length;

  return (
    <div className={cn("grid grid-cols-3 gap-4", className)}>
      <Card className="bg-crm-warning-light border-crm-warning">
        <CardContent className="p-4 text-center">
          <div className="flex items-center justify-center gap-2 mb-1">
            <Clock className="h-5 w-5 text-crm-warning-dark" />
            <span className="text-2xl font-bold text-crm-warning-dark">{pending}</span>
          </div>
          <p className="text-sm text-crm-warning-dark">ממתינים לחתימה</p>
        </CardContent>
      </Card>

      <Card className="bg-crm-success-light border-crm-success">
        <CardContent className="p-4 text-center">
          <div className="flex items-center justify-center gap-2 mb-1">
            <Check className="h-5 w-5 text-crm-success-dark" />
            <span className="text-2xl font-bold text-crm-success-dark">{signed}</span>
          </div>
          <p className="text-sm text-crm-success-dark">נחתמו</p>
        </CardContent>
      </Card>

      <Card className="bg-crm-error-light border-crm-error">
        <CardContent className="p-4 text-center">
          <div className="flex items-center justify-center gap-2 mb-1">
            <AlertCircle className="h-5 w-5 text-crm-error-dark" />
            <span className="text-2xl font-bold text-crm-error-dark">{expired}</span>
          </div>
          <p className="text-sm text-crm-error-dark">פג תוקפם</p>
        </CardContent>
      </Card>
    </div>
  );
};

export default SignatureRequestCard;
