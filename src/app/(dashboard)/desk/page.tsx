"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Input } from "@/components/ui/input";
import {
  Search,
  Plus,
  MessageSquare,
  Clock,
  CheckCircle2,
  AlertCircle,
  AlertTriangle,
  XCircle,
  User,
  Calendar,
  Tag,
  ChevronDown,
  ChevronUp,
  Send,
  Phone,
  Mail,
} from "lucide-react";
import { toast } from "sonner";

// ===================== טיפוסים =====================

type TicketStatus = "open" | "in_progress" | "waiting_customer" | "waiting_company" | "resolved" | "closed";
type TicketPriority = "low" | "medium" | "high" | "urgent";
type TicketCategory = "claim" | "policy_change" | "billing" | "complaint" | "info_request" | "cancellation" | "general";

interface TicketMessage {
  id: string;
  sender: string;
  text: string;
  timestamp: string;
  isAgent: boolean;
}

interface Ticket {
  id: string;
  customer_id: string;
  customer_name: string;
  subject: string;
  category: TicketCategory;
  status: TicketStatus;
  priority: TicketPriority;
  company?: string;
  policy_number?: string;
  messages: TicketMessage[];
  created_at: string;
  updated_at: string;
  resolved_at?: string;
}

// ===================== הגדרות =====================

const statusConfig: Record<TicketStatus, { label: string; color: string; icon: any }> = {
  open: { label: "פתוח", color: "bg-blue-100 text-blue-700", icon: AlertCircle },
  in_progress: { label: "בטיפול", color: "bg-yellow-100 text-yellow-700", icon: Clock },
  waiting_customer: { label: "ממתין ללקוח", color: "bg-purple-100 text-purple-700", icon: User },
  waiting_company: { label: "ממתין לחברה", color: "bg-orange-100 text-orange-700", icon: Clock },
  resolved: { label: "נפתר", color: "bg-green-100 text-green-700", icon: CheckCircle2 },
  closed: { label: "סגור", color: "bg-gray-100 text-gray-700", icon: XCircle },
};

const priorityConfig: Record<TicketPriority, { label: string; color: string; icon: any }> = {
  low: { label: "נמוך", color: "bg-gray-100 text-gray-600", icon: ChevronDown },
  medium: { label: "בינוני", color: "bg-blue-100 text-blue-600", icon: AlertCircle },
  high: { label: "גבוה", color: "bg-orange-100 text-orange-600", icon: AlertTriangle },
  urgent: { label: "דחוף", color: "bg-red-100 text-red-600", icon: AlertTriangle },
};

const categoryLabels: Record<TicketCategory, string> = {
  claim: "תביעה",
  policy_change: "שינוי פוליסה",
  billing: "חיוב / תשלום",
  complaint: "תלונה",
  info_request: "בקשת מידע",
  cancellation: "ביטול",
  general: "כללי",
};

// ===================== נתוני דמו =====================

const demoTickets: Ticket[] = [
  {
    id: "T-001",
    customer_id: "c1",
    customer_name: "ישראל ישראלי",
    subject: "תביעת ביטוח בריאות - ניתוח ברך",
    category: "claim",
    status: "in_progress",
    priority: "high",
    company: "מגדל",
    policy_number: "BRI-2024-8821",
    messages: [
      { id: "m1", sender: "ישראל ישראלי", text: "שלום, אני צריך להגיש תביעה על ניתוח ברך שעברתי בשבוע שעבר. מצורפים המסמכים.", timestamp: "2026-03-20 10:30", isAgent: false },
      { id: "m2", sender: "שמוליק", text: "קיבלתי. העברתי את התביעה למגדל. מעדכן ברגע שיש תשובה.", timestamp: "2026-03-20 11:15", isAgent: true },
      { id: "m3", sender: "שמוליק", text: "עדכון: מגדל אישרו קבלת התביעה. צפוי טיפול תוך 14 ימי עסקים.", timestamp: "2026-03-21 09:00", isAgent: true },
    ],
    created_at: "2026-03-20",
    updated_at: "2026-03-21",
  },
  {
    id: "T-002",
    customer_id: "c2",
    customer_name: "שרה כהן",
    subject: "שינוי כתובת בכל הפוליסות",
    category: "policy_change",
    status: "waiting_company",
    priority: "medium",
    company: "הראל",
    messages: [
      { id: "m4", sender: "שרה כהן", text: "עברתי דירה, צריכה לעדכן כתובת בכל הפוליסות שלי.", timestamp: "2026-03-19 14:00", isAgent: false },
      { id: "m5", sender: "שמוליק", text: "בסדר, שולח בקשת עדכון לכל החברות. הכתובת החדשה: רחוב הרצל 15, תל אביב?", timestamp: "2026-03-19 14:30", isAgent: true },
      { id: "m6", sender: "שרה כהן", text: "כן, בדיוק. תודה!", timestamp: "2026-03-19 14:45", isAgent: false },
    ],
    created_at: "2026-03-19",
    updated_at: "2026-03-19",
  },
  {
    id: "T-003",
    customer_id: "c3",
    customer_name: "דוד לוי",
    subject: "חיוב כפול בפרמיה",
    category: "billing",
    status: "open",
    priority: "urgent",
    company: "כלל",
    policy_number: "PEN-2023-4412",
    messages: [
      { id: "m7", sender: "דוד לוי", text: "חויבתי פעמיים בחודש האחרון על הפנסיה! סכום של 2,400 ש\"ח במקום 1,200. צריך החזר דחוף.", timestamp: "2026-03-22 08:00", isAgent: false },
    ],
    created_at: "2026-03-22",
    updated_at: "2026-03-22",
  },
  {
    id: "T-004",
    customer_id: "c4",
    customer_name: "רחל אברהם",
    subject: "בקשת מידע על ביטוח סיעודי",
    category: "info_request",
    status: "resolved",
    priority: "low",
    messages: [
      { id: "m8", sender: "רחל אברהם", text: "מעוניינת לדעת מה האפשרויות לביטוח סיעודי. אשמח לפגישה.", timestamp: "2026-03-17 16:00", isAgent: false },
      { id: "m9", sender: "שמוליק", text: "בשמחה. קבעתי לך פגישה ליום ג׳ הקרוב ב-10:00. אכין השוואה של 3 חברות.", timestamp: "2026-03-17 16:30", isAgent: true },
      { id: "m10", sender: "שמוליק", text: "פגישה התקיימה. רחל בחרה בהצעה של הראל. מעבירים לתהליך חתימה.", timestamp: "2026-03-19 11:00", isAgent: true },
    ],
    created_at: "2026-03-17",
    updated_at: "2026-03-19",
    resolved_at: "2026-03-19",
  },
  {
    id: "T-005",
    customer_id: "c5",
    customer_name: "יוסף מזרחי",
    subject: "ביטול ביטוח נסיעות",
    category: "cancellation",
    status: "waiting_customer",
    priority: "low",
    company: "איילון",
    messages: [
      { id: "m11", sender: "יוסף מזרחי", text: "רוצה לבטל את ביטוח הנסיעות השנתי.", timestamp: "2026-03-21 12:00", isAgent: false },
      { id: "m12", sender: "שמוליק", text: "לפני שנבטל - יש לך נסיעה מתוכננת בקרוב? הפוליסה בתוקף עד אוגוסט. אם תבטל עכשיו, לא יהיה החזר.", timestamp: "2026-03-21 12:30", isAgent: true },
    ],
    created_at: "2026-03-21",
    updated_at: "2026-03-21",
  },
];

// ===================== קומפוננטות =====================

function StatusBadge({ status }: { status: TicketStatus }) {
  const config = statusConfig[status];
  const Icon = config.icon;
  return (
    <Badge variant="outline" className={`${config.color} border-0 gap-1`}>
      <Icon className="h-3 w-3" />
      {config.label}
    </Badge>
  );
}

function PriorityBadge({ priority }: { priority: TicketPriority }) {
  const config = priorityConfig[priority];
  return (
    <Badge variant="outline" className={`${config.color} border-0 text-xs`}>
      {config.label}
    </Badge>
  );
}

function TicketCard({
  ticket,
  onStatusChange,
}: {
  ticket: Ticket;
  onStatusChange: (id: string, status: TicketStatus) => void;
}) {
  const [expanded, setExpanded] = useState(false);
  const [replyText, setReplyText] = useState("");

  const handleReply = () => {
    if (!replyText.trim()) return;
    toast.success("תגובה נשלחה");
    setReplyText("");
  };

  return (
    <Card className={`overflow-hidden ${ticket.priority === "urgent" ? "border-red-300" : ""}`}>
      <div
        className="flex items-center justify-between p-4 cursor-pointer hover:bg-accent/50 transition-colors"
        onClick={() => setExpanded(!expanded)}
      >
        <div className="flex items-center gap-3 flex-1 min-w-0">
          <span className="text-xs font-mono text-muted-foreground">{ticket.id}</span>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <h3 className="font-semibold text-sm truncate">{ticket.subject}</h3>
            </div>
            <div className="flex items-center gap-3 text-xs text-muted-foreground">
              <span className="flex items-center gap-1"><User className="h-3 w-3" />{ticket.customer_name}</span>
              <span className="flex items-center gap-1"><Tag className="h-3 w-3" />{categoryLabels[ticket.category]}</span>
              {ticket.company && <span>{ticket.company}</span>}
              <span className="flex items-center gap-1"><Calendar className="h-3 w-3" />{new Date(ticket.updated_at).toLocaleDateString("he-IL")}</span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <PriorityBadge priority={ticket.priority} />
            <StatusBadge status={ticket.status} />
            {expanded ? <ChevronUp className="h-4 w-4 text-muted-foreground" /> : <ChevronDown className="h-4 w-4 text-muted-foreground" />}
          </div>
        </div>
      </div>

      {expanded && (
        <div className="border-t">
          {/* היסטוריית הודעות */}
          <div className="p-4 space-y-3 max-h-64 overflow-y-auto bg-accent/10">
            {ticket.messages.map((msg) => (
              <div key={msg.id} className={`flex ${msg.isAgent ? "justify-start" : "justify-end"}`}>
                <div className={`max-w-[80%] rounded-lg p-3 ${msg.isAgent ? "bg-blue-50 border border-blue-100" : "bg-white border"}`}>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-xs font-semibold">{msg.sender}</span>
                    <span className="text-xs text-muted-foreground">{msg.timestamp}</span>
                  </div>
                  <p className="text-sm">{msg.text}</p>
                </div>
              </div>
            ))}
          </div>

          {/* תגובה + פעולות */}
          <div className="p-4 border-t bg-background">
            <div className="flex items-center gap-2 mb-3">
              <Input
                placeholder="כתוב תגובה..."
                value={replyText}
                onChange={(e) => setReplyText(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleReply()}
                className="flex-1"
              />
              <Button size="sm" onClick={handleReply} disabled={!replyText.trim()}>
                <Send className="h-3 w-3 ml-1" />
                שלח
              </Button>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Button size="sm" variant="outline" className="text-xs">
                  <Phone className="h-3 w-3 ml-1" />
                  התקשר
                </Button>
                <Button size="sm" variant="outline" className="text-xs">
                  <Mail className="h-3 w-3 ml-1" />
                  שלח מייל
                </Button>
              </div>
              <div className="flex items-center gap-1">
                {ticket.status !== "resolved" && (
                  <Button
                    size="sm"
                    variant="outline"
                    className="text-xs text-green-600"
                    onClick={() => onStatusChange(ticket.id, "resolved")}
                  >
                    <CheckCircle2 className="h-3 w-3 ml-1" />
                    סמן כנפתר
                  </Button>
                )}
                {ticket.status === "open" && (
                  <Button
                    size="sm"
                    variant="outline"
                    className="text-xs"
                    onClick={() => onStatusChange(ticket.id, "in_progress")}
                  >
                    קח לטיפול
                  </Button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </Card>
  );
}

// ===================== עמוד ראשי =====================

export default function DeskPage() {
  const [tickets, setTickets] = useState<Ticket[]>(demoTickets);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterStatus, setFilterStatus] = useState<TicketStatus | "all">("all");

  const filteredTickets = tickets.filter((t) => {
    const matchesSearch =
      t.customer_name.includes(searchQuery) ||
      t.subject.includes(searchQuery) ||
      t.id.includes(searchQuery);
    const matchesStatus = filterStatus === "all" || t.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  const stats = {
    open: tickets.filter((t) => t.status === "open").length,
    inProgress: tickets.filter((t) => t.status === "in_progress" || t.status === "waiting_company" || t.status === "waiting_customer").length,
    resolved: tickets.filter((t) => t.status === "resolved" || t.status === "closed").length,
    urgent: tickets.filter((t) => t.priority === "urgent" && t.status !== "resolved" && t.status !== "closed").length,
  };

  const handleStatusChange = (id: string, newStatus: TicketStatus) => {
    setTickets((prev) =>
      prev.map((t) =>
        t.id === id
          ? { ...t, status: newStatus, updated_at: new Date().toISOString().split("T")[0], ...(newStatus === "resolved" ? { resolved_at: new Date().toISOString().split("T")[0] } : {}) }
          : t
      )
    );
    toast.success(newStatus === "resolved" ? "הפנייה סומנה כנפתרה" : "סטטוס עודכן");
  };

  return (
    <div className="p-6 space-y-6" dir="rtl">
      {/* כותרת */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <span className="text-[#06B6D4]">DESK</span>
            <span className="text-muted-foreground text-lg">|</span>
            <span>ניהול פניות שירות</span>
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            מעקב וטיפול בפניות לקוחות
          </p>
        </div>
        <Button className="bg-[#06B6D4] hover:bg-[#0891B2]">
          <Plus className="h-4 w-4 ml-1" />
          פנייה חדשה
        </Button>
      </div>

      {/* כרטיסי סטטיסטיקות */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => setFilterStatus("open")}>
          <CardContent className="p-4 text-center">
            <p className="text-2xl font-bold text-blue-600">{stats.open}</p>
            <p className="text-xs text-muted-foreground">פתוחות</p>
          </CardContent>
        </Card>
        <Card className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => setFilterStatus("in_progress")}>
          <CardContent className="p-4 text-center">
            <p className="text-2xl font-bold text-yellow-600">{stats.inProgress}</p>
            <p className="text-xs text-muted-foreground">בטיפול</p>
          </CardContent>
        </Card>
        <Card className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => setFilterStatus("resolved")}>
          <CardContent className="p-4 text-center">
            <p className="text-2xl font-bold text-green-600">{stats.resolved}</p>
            <p className="text-xs text-muted-foreground">נפתרו</p>
          </CardContent>
        </Card>
        <Card className={`${stats.urgent > 0 ? "border-red-300 bg-red-50/50" : ""}`}>
          <CardContent className="p-4 text-center">
            <p className="text-2xl font-bold text-red-600">{stats.urgent}</p>
            <p className="text-xs text-muted-foreground">דחופות</p>
          </CardContent>
        </Card>
      </div>

      {/* חיפוש וסינון */}
      <div className="flex items-center gap-3 flex-wrap">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="חפש לפי שם, נושא או מספר..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pr-9"
          />
        </div>
        <div className="flex items-center gap-1">
          {(["all", "open", "in_progress", "waiting_customer", "waiting_company", "resolved"] as const).map((status) => (
            <Button
              key={status}
              variant={filterStatus === status ? "default" : "ghost"}
              size="sm"
              className={filterStatus === status ? "bg-[#06B6D4] hover:bg-[#0891B2]" : ""}
              onClick={() => setFilterStatus(status)}
            >
              {status === "all" ? "הכל" : statusConfig[status].label}
            </Button>
          ))}
        </div>
      </div>

      {/* רשימת פניות */}
      <div className="space-y-3">
        {filteredTickets.length === 0 ? (
          <Card>
            <CardContent className="p-8 text-center text-muted-foreground">
              <MessageSquare className="h-12 w-12 mx-auto mb-3 opacity-50" />
              <p>לא נמצאו פניות</p>
            </CardContent>
          </Card>
        ) : (
          filteredTickets.map((ticket) => (
            <TicketCard
              key={ticket.id}
              ticket={ticket}
              onStatusChange={handleStatusChange}
            />
          ))
        )}
      </div>
    </div>
  );
}
