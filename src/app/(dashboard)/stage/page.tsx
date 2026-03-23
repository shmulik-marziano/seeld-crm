"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Input } from "@/components/ui/input";
import {
  Search,
  Loader2,
  Plus,
  FileText,
  Send,
  Clock,
  CheckCircle2,
  XCircle,
  Eye,
  ChevronDown,
  ChevronUp,
  Trash2,
  Copy,
  Building2,
  User,
  Calendar,
  DollarSign,
} from "lucide-react";
import { toast } from "sonner";
import { Customer, Product, productTypeLabels } from "@/types/database";

// ===================== טיפוסים =====================

type QuoteStatus = "draft" | "sent" | "viewed" | "accepted" | "rejected" | "expired";

interface QuoteProduct {
  id: string;
  type: string;
  company: string;
  premium: number;
  coverage: string;
  notes?: string;
}

interface Quote {
  id: string;
  customer_id: string;
  customer_name: string;
  title: string;
  status: QuoteStatus;
  products: QuoteProduct[];
  total_premium: number;
  valid_until: string;
  created_at: string;
  sent_at?: string;
  viewed_at?: string;
  notes?: string;
}

// ===================== נתוני דמו =====================

const demoQuotes: Quote[] = [
  {
    id: "q1",
    customer_id: "c1",
    customer_name: "ישראל ישראלי",
    title: "הצעה מקיפה - פנסיה + בריאות",
    status: "sent",
    products: [
      { id: "p1", type: "pension", company: "הראל", premium: 1200, coverage: "פנסיה מקיפה + אובדן כושר 75%" },
      { id: "p2", type: "health", company: "מגדל", premium: 350, coverage: "שב\"ן משלים + כירורגי" },
    ],
    total_premium: 1550,
    valid_until: "2026-04-15",
    created_at: "2026-03-20",
    sent_at: "2026-03-20",
    notes: "הלקוח ביקש השוואה מול הפניקס",
  },
  {
    id: "q2",
    customer_id: "c2",
    customer_name: "שרה כהן",
    title: "ביטוח דירה + רכב",
    status: "viewed",
    products: [
      { id: "p3", type: "home", company: "כלל", premium: 180, coverage: "מבנה + תכולה + צד ג" },
      { id: "p4", type: "car", company: "הפניקס", premium: 420, coverage: "מקיף + חובה" },
    ],
    total_premium: 600,
    valid_until: "2026-04-10",
    created_at: "2026-03-18",
    sent_at: "2026-03-18",
    viewed_at: "2026-03-19",
  },
  {
    id: "q3",
    customer_id: "c3",
    customer_name: "דוד לוי",
    title: "חבילת מנהלים + חיים",
    status: "accepted",
    products: [
      { id: "p5", type: "managers", company: "מנורה", premium: 2500, coverage: "ביטוח מנהלים + אובדן כושר" },
      { id: "p6", type: "life", company: "מנורה", premium: 180, coverage: "ביטוח חיים ריסק 1,000,000 ש\"ח" },
    ],
    total_premium: 2680,
    valid_until: "2026-04-20",
    created_at: "2026-03-15",
    sent_at: "2026-03-15",
    viewed_at: "2026-03-16",
  },
  {
    id: "q4",
    customer_id: "c4",
    customer_name: "רחל אברהם",
    title: "קרן השתלמות",
    status: "draft",
    products: [
      { id: "p7", type: "study_fund", company: "הראל", premium: 800, coverage: "קרן השתלמות - מסלול כללי" },
    ],
    total_premium: 800,
    valid_until: "2026-04-25",
    created_at: "2026-03-22",
  },
  {
    id: "q5",
    customer_id: "c1",
    customer_name: "ישראל ישראלי",
    title: "ביטוח נסיעות משפחתי",
    status: "expired",
    products: [
      { id: "p8", type: "travel", company: "איילון", premium: 95, coverage: "ביטוח נסיעות שנתי - משפחה" },
    ],
    total_premium: 95,
    valid_until: "2026-03-01",
    created_at: "2026-02-15",
    sent_at: "2026-02-15",
  },
];

// ===================== עזרים =====================

const statusConfig: Record<QuoteStatus, { label: string; color: string; icon: any }> = {
  draft: { label: "טיוטה", color: "bg-gray-100 text-gray-700", icon: FileText },
  sent: { label: "נשלחה", color: "bg-blue-100 text-blue-700", icon: Send },
  viewed: { label: "נצפתה", color: "bg-purple-100 text-purple-700", icon: Eye },
  accepted: { label: "אושרה", color: "bg-green-100 text-green-700", icon: CheckCircle2 },
  rejected: { label: "נדחתה", color: "bg-red-100 text-red-700", icon: XCircle },
  expired: { label: "פג תוקף", color: "bg-orange-100 text-orange-700", icon: Clock },
};

const insuranceCompanies = [
  "הראל", "מגדל", "כלל", "הפניקס", "מנורה", "איילון",
  "מיטב", "מור", "ילין לפידות", "אנליסט", "אינפיניטי", "אלטשולר שחם",
];

// ===================== קומפוננטות =====================

function StatusBadge({ status }: { status: QuoteStatus }) {
  const config = statusConfig[status];
  const Icon = config.icon;
  return (
    <Badge variant="outline" className={`${config.color} border-0 gap-1`}>
      <Icon className="h-3 w-3" />
      {config.label}
    </Badge>
  );
}

function QuoteCard({
  quote,
  onSend,
  onDuplicate,
  onDelete,
}: {
  quote: Quote;
  onSend: (id: string) => void;
  onDuplicate: (id: string) => void;
  onDelete: (id: string) => void;
}) {
  const [expanded, setExpanded] = useState(false);

  return (
    <Card className="overflow-hidden">
      <div
        className="flex items-center justify-between p-4 cursor-pointer hover:bg-accent/50 transition-colors"
        onClick={() => setExpanded(!expanded)}
      >
        <div className="flex items-center gap-4 flex-1 min-w-0">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <h3 className="font-semibold text-sm truncate">{quote.title}</h3>
              <StatusBadge status={quote.status} />
            </div>
            <div className="flex items-center gap-4 text-xs text-muted-foreground">
              <span className="flex items-center gap-1">
                <User className="h-3 w-3" />
                {quote.customer_name}
              </span>
              <span className="flex items-center gap-1">
                <Calendar className="h-3 w-3" />
                {new Date(quote.created_at).toLocaleDateString("he-IL")}
              </span>
              <span className="flex items-center gap-1">
                <DollarSign className="h-3 w-3" />
                {quote.total_premium.toLocaleString()} ש&quot;ח/חודש
              </span>
            </div>
          </div>
          {expanded ? <ChevronUp className="h-5 w-5 text-muted-foreground" /> : <ChevronDown className="h-5 w-5 text-muted-foreground" />}
        </div>
      </div>

      {expanded && (
        <div className="border-t px-4 pb-4">
          <div className="mt-3 space-y-2">
            {quote.products.map((product) => (
              <div
                key={product.id}
                className="flex items-center justify-between bg-accent/30 rounded-lg p-3"
              >
                <div>
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className="text-xs">
                      {productTypeLabels[product.type as keyof typeof productTypeLabels] || product.type}
                    </Badge>
                    <span className="flex items-center gap-1 text-xs text-muted-foreground">
                      <Building2 className="h-3 w-3" />
                      {product.company}
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">{product.coverage}</p>
                </div>
                <span className="font-semibold text-sm">{product.premium.toLocaleString()} ש&quot;ח</span>
              </div>
            ))}
          </div>

          <Separator className="my-3" />

          <div className="flex items-center justify-between">
            <div className="text-xs text-muted-foreground space-y-1">
              <p>תוקף עד: {new Date(quote.valid_until).toLocaleDateString("he-IL")}</p>
              {quote.sent_at && <p>נשלחה: {new Date(quote.sent_at).toLocaleDateString("he-IL")}</p>}
              {quote.viewed_at && <p>נצפתה: {new Date(quote.viewed_at).toLocaleDateString("he-IL")}</p>}
              {quote.notes && <p className="text-foreground">{quote.notes}</p>}
            </div>
            <div className="flex items-center gap-2">
              {quote.status === "draft" && (
                <Button size="sm" onClick={() => onSend(quote.id)}>
                  <Send className="h-3 w-3 ml-1" />
                  שלח ללקוח
                </Button>
              )}
              <Button size="sm" variant="outline" onClick={() => onDuplicate(quote.id)}>
                <Copy className="h-3 w-3 ml-1" />
                שכפל
              </Button>
              <Button size="sm" variant="ghost" className="text-destructive" onClick={() => onDelete(quote.id)}>
                <Trash2 className="h-3 w-3" />
              </Button>
            </div>
          </div>
        </div>
      )}
    </Card>
  );
}

// ===================== עמוד ראשי =====================

export default function StagePage() {
  const [quotes, setQuotes] = useState<Quote[]>(demoQuotes);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterStatus, setFilterStatus] = useState<QuoteStatus | "all">("all");

  const filteredQuotes = quotes.filter((q) => {
    const matchesSearch =
      q.customer_name.includes(searchQuery) || q.title.includes(searchQuery);
    const matchesStatus = filterStatus === "all" || q.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  // סטטיסטיקות
  const stats = {
    total: quotes.length,
    draft: quotes.filter((q) => q.status === "draft").length,
    sent: quotes.filter((q) => q.status === "sent").length,
    viewed: quotes.filter((q) => q.status === "viewed").length,
    accepted: quotes.filter((q) => q.status === "accepted").length,
    totalPremium: quotes
      .filter((q) => q.status === "accepted")
      .reduce((sum, q) => sum + q.total_premium, 0),
  };

  const handleSend = (id: string) => {
    setQuotes((prev) =>
      prev.map((q) =>
        q.id === id ? { ...q, status: "sent" as QuoteStatus, sent_at: new Date().toISOString().split("T")[0] } : q
      )
    );
    toast.success("ההצעה נשלחה ללקוח");
  };

  const handleDuplicate = (id: string) => {
    const original = quotes.find((q) => q.id === id);
    if (!original) return;
    const newQuote: Quote = {
      ...original,
      id: `q${Date.now()}`,
      status: "draft",
      title: `${original.title} (עותק)`,
      created_at: new Date().toISOString().split("T")[0],
      sent_at: undefined,
      viewed_at: undefined,
    };
    setQuotes((prev) => [newQuote, ...prev]);
    toast.success("ההצעה שוכפלה");
  };

  const handleDelete = (id: string) => {
    setQuotes((prev) => prev.filter((q) => q.id !== id));
    toast.success("ההצעה נמחקה");
  };

  return (
    <div className="p-6 space-y-6" dir="rtl">
      {/* כותרת */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <span className="text-[#8B5CF6]">STAGE</span>
            <span className="text-muted-foreground text-lg">|</span>
            <span>ניהול הצעות מחיר</span>
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            צור, שלח ועקוב אחרי הצעות מחיר ללקוחות
          </p>
        </div>
        <Button className="bg-[#8B5CF6] hover:bg-[#7C3AED]">
          <Plus className="h-4 w-4 ml-1" />
          הצעה חדשה
        </Button>
      </div>

      {/* כרטיסי סטטיסטיקות */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <Card className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => setFilterStatus("all")}>
          <CardContent className="p-4 text-center">
            <p className="text-2xl font-bold">{stats.total}</p>
            <p className="text-xs text-muted-foreground">סה&quot;כ הצעות</p>
          </CardContent>
        </Card>
        <Card className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => setFilterStatus("draft")}>
          <CardContent className="p-4 text-center">
            <p className="text-2xl font-bold text-gray-600">{stats.draft}</p>
            <p className="text-xs text-muted-foreground">טיוטות</p>
          </CardContent>
        </Card>
        <Card className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => setFilterStatus("sent")}>
          <CardContent className="p-4 text-center">
            <p className="text-2xl font-bold text-blue-600">{stats.sent}</p>
            <p className="text-xs text-muted-foreground">נשלחו</p>
          </CardContent>
        </Card>
        <Card className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => setFilterStatus("accepted")}>
          <CardContent className="p-4 text-center">
            <p className="text-2xl font-bold text-green-600">{stats.accepted}</p>
            <p className="text-xs text-muted-foreground">אושרו</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <p className="text-2xl font-bold text-[#8B5CF6]">{stats.totalPremium.toLocaleString()}</p>
            <p className="text-xs text-muted-foreground">פרמיה שאושרה (ש&quot;ח/חודש)</p>
          </CardContent>
        </Card>
      </div>

      {/* חיפוש וסינון */}
      <div className="flex items-center gap-3">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="חפש לפי שם לקוח או כותרת..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pr-9"
          />
        </div>
        <div className="flex items-center gap-1">
          {(["all", "draft", "sent", "viewed", "accepted", "rejected", "expired"] as const).map((status) => (
            <Button
              key={status}
              variant={filterStatus === status ? "default" : "ghost"}
              size="sm"
              className={filterStatus === status ? "bg-[#8B5CF6] hover:bg-[#7C3AED]" : ""}
              onClick={() => setFilterStatus(status)}
            >
              {status === "all" ? "הכל" : statusConfig[status].label}
            </Button>
          ))}
        </div>
      </div>

      {/* רשימת הצעות */}
      <div className="space-y-3">
        {filteredQuotes.length === 0 ? (
          <Card>
            <CardContent className="p-8 text-center text-muted-foreground">
              <FileText className="h-12 w-12 mx-auto mb-3 opacity-50" />
              <p>לא נמצאו הצעות</p>
            </CardContent>
          </Card>
        ) : (
          filteredQuotes.map((quote) => (
            <QuoteCard
              key={quote.id}
              quote={quote}
              onSend={handleSend}
              onDuplicate={handleDuplicate}
              onDelete={handleDelete}
            />
          ))
        )}
      </div>
    </div>
  );
}
