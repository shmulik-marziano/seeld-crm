"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import {
  Search,
  Plus,
  FileText,
  Send,
  Clock,
  CheckCircle2,
  XCircle,
  Eye,
  PenTool,
  User,
  Calendar,
  Download,
  RefreshCw,
  AlertTriangle,
  FileCheck,
  Shield,
} from "lucide-react";
import { toast } from "sonner";

// ===================== טיפוסים =====================

type SignatureStatus = "draft" | "sent" | "viewed" | "signed" | "declined" | "expired";

interface SignatureField {
  id: string;
  type: "signature" | "initials" | "date" | "text";
  label: string;
  required: boolean;
  signed: boolean;
}

interface SignDocument {
  id: string;
  customer_id: string;
  customer_name: string;
  title: string;
  document_type: string;
  status: SignatureStatus;
  fields: SignatureField[];
  sent_via: "email" | "whatsapp" | "sms";
  created_at: string;
  sent_at?: string;
  viewed_at?: string;
  signed_at?: string;
  expires_at: string;
  file_url?: string;
}

// ===================== הגדרות =====================

const statusConfig: Record<SignatureStatus, { label: string; color: string; icon: any }> = {
  draft: { label: "טיוטה", color: "bg-gray-100 text-gray-700", icon: FileText },
  sent: { label: "נשלח", color: "bg-blue-100 text-blue-700", icon: Send },
  viewed: { label: "נצפה", color: "bg-purple-100 text-purple-700", icon: Eye },
  signed: { label: "נחתם", color: "bg-green-100 text-green-700", icon: CheckCircle2 },
  declined: { label: "סורב", color: "bg-red-100 text-red-700", icon: XCircle },
  expired: { label: "פג תוקף", color: "bg-orange-100 text-orange-700", icon: Clock },
};

const documentTypes = [
  "ייפוי כוח",
  "נספח א - הצהרת בריאות",
  "נספח ב - הצהרת מוטבים",
  "נספח ה - ניוד",
  "הצעת ביטוח",
  "טופס הצטרפות",
  "טופס ביטול",
  "אישור עסקה",
];

const sentViaLabels: Record<string, string> = {
  email: "אימייל",
  whatsapp: "וואטסאפ",
  sms: "SMS",
};

// ===================== נתוני דמו =====================

const demoDocuments: SignDocument[] = [
  {
    id: "S-001",
    customer_id: "c1",
    customer_name: "ישראל ישראלי",
    title: "ייפוי כוח - העברת ניהול פנסיה",
    document_type: "ייפוי כוח",
    status: "signed",
    fields: [
      { id: "f1", type: "signature", label: "חתימת הלקוח", required: true, signed: true },
      { id: "f2", type: "date", label: "תאריך", required: true, signed: true },
      { id: "f3", type: "initials", label: "ראשי תיבות", required: true, signed: true },
    ],
    sent_via: "whatsapp",
    created_at: "2026-03-18",
    sent_at: "2026-03-18",
    viewed_at: "2026-03-18",
    signed_at: "2026-03-19",
    expires_at: "2026-04-18",
  },
  {
    id: "S-002",
    customer_id: "c2",
    customer_name: "שרה כהן",
    title: "נספח א - הצהרת בריאות לביטוח חיים",
    document_type: "נספח א - הצהרת בריאות",
    status: "viewed",
    fields: [
      { id: "f4", type: "signature", label: "חתימת המבוטח", required: true, signed: false },
      { id: "f5", type: "text", label: "שם מלא", required: true, signed: true },
      { id: "f6", type: "date", label: "תאריך", required: true, signed: false },
      { id: "f7", type: "initials", label: "ראשי תיבות ליד כל סעיף", required: true, signed: false },
    ],
    sent_via: "email",
    created_at: "2026-03-20",
    sent_at: "2026-03-20",
    viewed_at: "2026-03-21",
    expires_at: "2026-04-20",
  },
  {
    id: "S-003",
    customer_id: "c3",
    customer_name: "דוד לוי",
    title: "הצעת ביטוח מנהלים - מנורה",
    document_type: "הצעת ביטוח",
    status: "sent",
    fields: [
      { id: "f8", type: "signature", label: "חתימת המעסיק", required: true, signed: false },
      { id: "f9", type: "signature", label: "חתימת העובד", required: true, signed: false },
      { id: "f10", type: "date", label: "תאריך", required: true, signed: false },
    ],
    sent_via: "email",
    created_at: "2026-03-21",
    sent_at: "2026-03-21",
    expires_at: "2026-04-21",
  },
  {
    id: "S-004",
    customer_id: "c4",
    customer_name: "רחל אברהם",
    title: "טופס הצטרפות - ביטוח סיעודי הראל",
    document_type: "טופס הצטרפות",
    status: "draft",
    fields: [
      { id: "f11", type: "signature", label: "חתימה", required: true, signed: false },
      { id: "f12", type: "text", label: "שם מלא", required: true, signed: false },
      { id: "f13", type: "date", label: "תאריך", required: true, signed: false },
    ],
    sent_via: "whatsapp",
    created_at: "2026-03-22",
    expires_at: "2026-04-22",
  },
  {
    id: "S-005",
    customer_id: "c5",
    customer_name: "יוסף מזרחי",
    title: "טופס ביטול - ביטוח נסיעות איילון",
    document_type: "טופס ביטול",
    status: "declined",
    fields: [
      { id: "f14", type: "signature", label: "חתימה", required: true, signed: false },
    ],
    sent_via: "sms",
    created_at: "2026-03-20",
    sent_at: "2026-03-20",
    viewed_at: "2026-03-20",
    expires_at: "2026-04-20",
  },
];

// ===================== קומפוננטות =====================

function StatusBadge({ status }: { status: SignatureStatus }) {
  const config = statusConfig[status];
  const Icon = config.icon;
  return (
    <Badge variant="outline" className={`${config.color} border-0 gap-1`}>
      <Icon className="h-3 w-3" />
      {config.label}
    </Badge>
  );
}

function DocumentCard({
  doc,
  onSend,
  onResend,
}: {
  doc: SignDocument;
  onSend: (id: string) => void;
  onResend: (id: string) => void;
}) {
  const signedCount = doc.fields.filter((f) => f.signed).length;
  const totalRequired = doc.fields.filter((f) => f.required).length;
  const progress = totalRequired > 0 ? Math.round((signedCount / totalRequired) * 100) : 0;

  return (
    <Card className={`overflow-hidden ${doc.status === "declined" ? "border-red-200" : doc.status === "signed" ? "border-green-200" : ""}`}>
      <CardContent className="p-4">
        <div className="flex items-start justify-between mb-3">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <h3 className="font-semibold text-sm truncate">{doc.title}</h3>
              <StatusBadge status={doc.status} />
            </div>
            <div className="flex items-center gap-4 text-xs text-muted-foreground">
              <span className="flex items-center gap-1"><User className="h-3 w-3" />{doc.customer_name}</span>
              <span className="flex items-center gap-1"><FileText className="h-3 w-3" />{doc.document_type}</span>
              <span className="flex items-center gap-1"><Calendar className="h-3 w-3" />{new Date(doc.created_at).toLocaleDateString("he-IL")}</span>
              <Badge variant="outline" className="text-xs">{sentViaLabels[doc.sent_via]}</Badge>
            </div>
          </div>
        </div>

        {/* שדות חתימה */}
        <div className="mb-3">
          <div className="flex items-center justify-between text-xs mb-1">
            <span className="text-muted-foreground">
              שדות שהושלמו: {signedCount}/{totalRequired}
            </span>
            <span className="font-medium">{progress}%</span>
          </div>
          <Progress value={progress} className="h-2" />
          <div className="flex items-center gap-2 mt-2 flex-wrap">
            {doc.fields.map((field) => (
              <Badge
                key={field.id}
                variant="outline"
                className={`text-xs gap-1 ${field.signed ? "bg-green-50 text-green-700 border-green-200" : "bg-gray-50 text-gray-500"}`}
              >
                {field.signed ? <CheckCircle2 className="h-3 w-3" /> : <Clock className="h-3 w-3" />}
                {field.label}
              </Badge>
            ))}
          </div>
        </div>

        {/* ציר זמן */}
        <div className="flex items-center gap-4 text-xs text-muted-foreground mb-3">
          {doc.sent_at && <span>נשלח: {new Date(doc.sent_at).toLocaleDateString("he-IL")}</span>}
          {doc.viewed_at && <span>נצפה: {new Date(doc.viewed_at).toLocaleDateString("he-IL")}</span>}
          {doc.signed_at && <span className="text-green-600 font-medium">נחתם: {new Date(doc.signed_at).toLocaleDateString("he-IL")}</span>}
          <span>תוקף עד: {new Date(doc.expires_at).toLocaleDateString("he-IL")}</span>
        </div>

        <Separator className="mb-3" />

        {/* פעולות */}
        <div className="flex items-center gap-2">
          {doc.status === "draft" && (
            <Button size="sm" onClick={() => onSend(doc.id)}>
              <Send className="h-3 w-3 ml-1" />
              שלח לחתימה
            </Button>
          )}
          {(doc.status === "sent" || doc.status === "viewed") && (
            <Button size="sm" variant="outline" onClick={() => onResend(doc.id)}>
              <RefreshCw className="h-3 w-3 ml-1" />
              שלח תזכורת
            </Button>
          )}
          {doc.status === "signed" && (
            <Button size="sm" variant="outline">
              <Download className="h-3 w-3 ml-1" />
              הורד מסמך חתום
            </Button>
          )}
          {doc.status === "declined" && (
            <Button size="sm" variant="outline" onClick={() => onResend(doc.id)}>
              <RefreshCw className="h-3 w-3 ml-1" />
              שלח מחדש
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

// ===================== עמוד ראשי =====================

export default function SignPage() {
  const [documents, setDocuments] = useState<SignDocument[]>(demoDocuments);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterStatus, setFilterStatus] = useState<SignatureStatus | "all">("all");

  const filteredDocs = documents.filter((d) => {
    const matchesSearch =
      d.customer_name.includes(searchQuery) ||
      d.title.includes(searchQuery) ||
      d.id.includes(searchQuery);
    const matchesStatus = filterStatus === "all" || d.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  const stats = {
    total: documents.length,
    pending: documents.filter((d) => d.status === "sent" || d.status === "viewed").length,
    signed: documents.filter((d) => d.status === "signed").length,
    signRate: documents.length > 0
      ? Math.round((documents.filter((d) => d.status === "signed").length / documents.filter((d) => d.status !== "draft").length) * 100) || 0
      : 0,
  };

  const handleSend = (id: string) => {
    setDocuments((prev) =>
      prev.map((d) =>
        d.id === id ? { ...d, status: "sent" as SignatureStatus, sent_at: new Date().toISOString().split("T")[0] } : d
      )
    );
    toast.success("המסמך נשלח לחתימה");
  };

  const handleResend = (id: string) => {
    toast.success("תזכורת נשלחה ללקוח");
  };

  return (
    <div className="p-6 space-y-6" dir="rtl">
      {/* כותרת */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <span className="text-[#059669]">SIGN</span>
            <span className="text-muted-foreground text-lg">|</span>
            <span>חתימה דיגיטלית</span>
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            שלח מסמכים לחתימה דיגיטלית ועקוב אחרי הסטטוס
          </p>
        </div>
        <Button className="bg-[#059669] hover:bg-[#047857]">
          <Plus className="h-4 w-4 ml-1" />
          מסמך חדש
        </Button>
      </div>

      {/* כרטיסי סטטיסטיקות */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => setFilterStatus("all")}>
          <CardContent className="p-4 text-center">
            <p className="text-2xl font-bold">{stats.total}</p>
            <p className="text-xs text-muted-foreground">סה&quot;כ מסמכים</p>
          </CardContent>
        </Card>
        <Card className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => setFilterStatus("sent")}>
          <CardContent className="p-4 text-center">
            <p className="text-2xl font-bold text-blue-600">{stats.pending}</p>
            <p className="text-xs text-muted-foreground">ממתינים לחתימה</p>
          </CardContent>
        </Card>
        <Card className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => setFilterStatus("signed")}>
          <CardContent className="p-4 text-center">
            <p className="text-2xl font-bold text-green-600">{stats.signed}</p>
            <p className="text-xs text-muted-foreground">נחתמו</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <p className="text-2xl font-bold text-[#059669]">{stats.signRate}%</p>
            <p className="text-xs text-muted-foreground">אחוז חתימה</p>
          </CardContent>
        </Card>
      </div>

      {/* חיפוש וסינון */}
      <div className="flex items-center gap-3 flex-wrap">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="חפש לפי שם, מסמך או מספר..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pr-9"
          />
        </div>
        <div className="flex items-center gap-1">
          {(["all", "draft", "sent", "viewed", "signed", "declined", "expired"] as const).map((status) => (
            <Button
              key={status}
              variant={filterStatus === status ? "default" : "ghost"}
              size="sm"
              className={filterStatus === status ? "bg-[#059669] hover:bg-[#047857]" : ""}
              onClick={() => setFilterStatus(status)}
            >
              {status === "all" ? "הכל" : statusConfig[status].label}
            </Button>
          ))}
        </div>
      </div>

      {/* רשימת מסמכים */}
      <div className="space-y-3">
        {filteredDocs.length === 0 ? (
          <Card>
            <CardContent className="p-8 text-center text-muted-foreground">
              <PenTool className="h-12 w-12 mx-auto mb-3 opacity-50" />
              <p>לא נמצאו מסמכים</p>
            </CardContent>
          </Card>
        ) : (
          filteredDocs.map((doc) => (
            <DocumentCard
              key={doc.id}
              doc={doc}
              onSend={handleSend}
              onResend={handleResend}
            />
          ))
        )}
      </div>
    </div>
  );
}
