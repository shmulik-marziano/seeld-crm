"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { Input } from "@/components/ui/input";
import {
  Search,
  Loader2,
  AlertTriangle,
  CheckCircle2,
  ArrowLeft,
  Zap,
  Target,
  TrendingUp,
  ChevronDown,
  ChevronUp,
  Building2,
  Clock,
  DollarSign,
  ListChecks,
  ArrowUpRight,
  Shield,
} from "lucide-react";
import { toast } from "sonner";
import { Customer } from "@/types/database";
import type { WiseReport, WiseRecommendation, RecommendationPriority } from "@/lib/analysis/wise-engine";

interface CustomerWithCount extends Customer {
  products?: { count: number }[];
}

export default function WisePageWrapper() {
  return (
    <Suspense fallback={<div className="flex items-center justify-center py-12"><Loader2 className="h-8 w-8 animate-spin" /></div>}>
      <WisePage />
    </Suspense>
  );
}

function WisePage() {
  const searchParams = useSearchParams();
  const preselectedCustomerId = searchParams?.get("customerId") ?? null;

  const [customers, setCustomers] = useState<CustomerWithCount[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCustomer, setSelectedCustomer] = useState<CustomerWithCount | null>(null);
  const [isSearching, setIsSearching] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [report, setReport] = useState<WiseReport | null>(null);
  const [expandedRecs, setExpandedRecs] = useState<Set<string>>(new Set());

  // אם הגיע עם לקוח מ-X-RAY
  useEffect(() => {
    if (preselectedCustomerId) {
      loadCustomerAndGenerate(preselectedCustomerId);
    }
  }, [preselectedCustomerId]);

  // חיפוש לקוחות
  useEffect(() => {
    const timer = setTimeout(() => {
      if (searchQuery.length >= 2) {
        searchCustomers(searchQuery);
      } else {
        setCustomers([]);
      }
    }, 300);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  async function loadCustomerAndGenerate(customerId: string) {
    try {
      const res = await fetch(`/api/customers/${customerId}`);
      const json = await res.json();
      if (json.data) {
        setSelectedCustomer(json.data);
        generateWise(json.data);
      }
    } catch {
      toast.error("שגיאה בטעינת הלקוח");
    }
  }

  async function searchCustomers(query: string) {
    setIsSearching(true);
    try {
      const res = await fetch(`/api/customers?search=${encodeURIComponent(query)}&limit=20`);
      const json = await res.json();
      if (json.data) {
        setCustomers(json.data);
      }
    } catch {
      toast.error("שגיאה בחיפוש לקוחות");
    } finally {
      setIsSearching(false);
    }
  }

  async function generateWise(customer: CustomerWithCount) {
    setSelectedCustomer(customer);
    setIsGenerating(true);
    setReport(null);
    setSearchQuery("");
    setCustomers([]);

    try {
      const res = await fetch(`/api/analysis/wise?customerId=${customer.id}`);
      const json = await res.json();

      if (json.error) {
        toast.error(json.error);
        return;
      }

      setReport(json.data);
      toast.success("ההמלצות מוכנות");
    } catch {
      toast.error("שגיאה ביצירת ההמלצות");
    } finally {
      setIsGenerating(false);
    }
  }

  function toggleExpand(id: string) {
    setExpandedRecs((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  }

  function resetAnalysis() {
    setSelectedCustomer(null);
    setReport(null);
    setSearchQuery("");
    setExpandedRecs(new Set());
  }

  return (
    <div className="space-y-6">
      {/* כותרת */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold" style={{ color: "#F59E0B" }}>
            WISE - המלצות חכמות
          </h1>
          <p className="text-muted-foreground mt-1">
            תוכנית פעולה מפורטת עם סדרי עדיפויות, צעדים וחיסכון משוער
          </p>
        </div>
        {selectedCustomer && (
          <Button variant="outline" onClick={resetAnalysis}>
            <ArrowLeft className="h-4 w-4 ml-2" />
            לקוח אחר
          </Button>
        )}
      </div>

      {/* בחירת לקוח */}
      {!selectedCustomer && (
        <Card>
          <CardHeader>
            <CardTitle>בחירת לקוח</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="relative">
              <Search className="absolute right-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="חפש לפי שם, ת.ז., טלפון או אימייל..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pr-9"
              />
              {isSearching && (
                <Loader2 className="absolute left-3 top-3 h-4 w-4 animate-spin text-muted-foreground" />
              )}
            </div>

            {customers.length > 0 && (
              <div className="mt-3 border rounded-lg divide-y max-h-80 overflow-auto">
                {customers.map((customer) => (
                  <button
                    key={customer.id}
                    onClick={() => generateWise(customer)}
                    className="w-full flex items-center justify-between p-3 hover:bg-accent text-right transition-colors"
                  >
                    <div>
                      <div className="font-medium">
                        {customer.first_name} {customer.last_name}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        ת.ז. {customer.id_number}
                        {customer.phone && ` | ${customer.phone}`}
                      </div>
                    </div>
                    <Badge variant="outline">
                      {customer.products?.[0]?.count || 0} מוצרים
                    </Badge>
                  </button>
                ))}
              </div>
            )}

            {searchQuery.length >= 2 && !isSearching && customers.length === 0 && (
              <p className="text-center text-muted-foreground mt-4">לא נמצאו לקוחות</p>
            )}
          </CardContent>
        </Card>
      )}

      {/* טעינה */}
      {isGenerating && (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Loader2 className="h-12 w-12 animate-spin mb-4" style={{ color: "#F59E0B" }} />
            <p className="text-lg font-medium">מייצר המלצות עבור {selectedCustomer?.first_name} {selectedCustomer?.last_name}...</p>
            <p className="text-muted-foreground mt-1">מנתח ממצאים ובונה תוכנית פעולה</p>
          </CardContent>
        </Card>
      )}

      {/* תוצאות */}
      {report && selectedCustomer && (
        <>
          {/* סיכום */}
          <div className="grid gap-4 md:grid-cols-4">
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-lg flex items-center justify-center" style={{ backgroundColor: "#fef3c7" }}>
                    <Target className="h-5 w-5" style={{ color: "#F59E0B" }} />
                  </div>
                  <div>
                    <p className="text-2xl font-bold">{report.summary.totalRecommendations}</p>
                    <p className="text-sm text-muted-foreground">המלצות</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-lg bg-red-100 flex items-center justify-center">
                    <AlertTriangle className="h-5 w-5 text-red-600" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold">{report.summary.mandatoryCount}</p>
                    <p className="text-sm text-muted-foreground">חובה לטיפול</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-lg bg-green-100 flex items-center justify-center">
                    <DollarSign className="h-5 w-5 text-green-600" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold">{report.summary.estimatedTotalSavings.toLocaleString()} ₪</p>
                    <p className="text-sm text-muted-foreground">חיסכון שנתי אפשרי</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-lg bg-blue-100 flex items-center justify-center">
                    <TrendingUp className="h-5 w-5 text-blue-600" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">ציון נוכחי → צפוי</p>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-xl font-bold" style={{ color: getScoreColor(report.xrayScore) }}>
                        {report.xrayScore}
                      </span>
                      <ArrowUpRight className="h-4 w-4 text-green-500" />
                      <span className="text-xl font-bold text-green-600">
                        {report.projectedScore}
                      </span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* עדיפות עליונה */}
          {report.summary.topPriority && (
            <div
              className="rounded-lg p-4 flex items-center gap-3"
              style={{ backgroundColor: "#fef2f2", borderRight: "4px solid #ef4444" }}
            >
              <Shield className="h-6 w-6 text-red-600 flex-shrink-0" />
              <p className="font-medium text-red-800">{report.summary.topPriority}</p>
            </div>
          )}

          {/* רשימת המלצות */}
          <div className="space-y-4">
            {report.recommendations.map((rec, index) => (
              <RecommendationCard
                key={rec.id}
                rec={rec}
                index={index + 1}
                isExpanded={expandedRecs.has(rec.id)}
                onToggle={() => toggleExpand(rec.id)}
              />
            ))}
          </div>

          {report.recommendations.length === 0 && (
            <Card>
              <CardContent className="text-center py-12">
                <CheckCircle2 className="h-12 w-12 text-green-500 mx-auto mb-3" />
                <p className="text-lg font-medium">אין המלצות</p>
                <p className="text-muted-foreground">התיק במצב מצוין - אין צורך בפעולות</p>
              </CardContent>
            </Card>
          )}
        </>
      )}
    </div>
  );
}

// === קומפוננטות עזר ===

function RecommendationCard({
  rec,
  index,
  isExpanded,
  onToggle,
}: {
  rec: WiseRecommendation;
  index: number;
  isExpanded: boolean;
  onToggle: () => void;
}) {
  const priorityConfig = getPriorityConfig(rec.priority);

  return (
    <Card className="overflow-hidden">
      <div
        className="h-1"
        style={{ backgroundColor: priorityConfig.color }}
      />
      <CardContent className="pt-4">
        <button
          onClick={onToggle}
          className="w-full text-right"
        >
          <div className="flex items-start gap-3">
            <div
              className="h-8 w-8 rounded-full flex items-center justify-center text-white font-bold text-sm flex-shrink-0"
              style={{ backgroundColor: priorityConfig.color }}
            >
              {index}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="font-bold">{rec.title}</span>
                <Badge
                  className="text-xs text-white"
                  style={{ backgroundColor: priorityConfig.color }}
                >
                  {priorityConfig.label}
                </Badge>
                <Badge variant="outline" className="text-xs">
                  {getActionLabel(rec.action)}
                </Badge>
              </div>
              <p className="text-sm text-muted-foreground mt-1">{rec.description}</p>
            </div>
            <div className="flex items-center gap-3 flex-shrink-0">
              {rec.estimatedSavings && (
                <div className="text-left">
                  <p className="text-sm font-bold text-green-600">
                    {rec.estimatedSavings.toLocaleString()} ₪
                  </p>
                  <p className="text-xs text-muted-foreground">חיסכון</p>
                </div>
              )}
              {rec.estimatedCost && (
                <div className="text-left">
                  <p className="text-sm font-bold text-blue-600">
                    {rec.estimatedCost.toLocaleString()} ₪
                  </p>
                  <p className="text-xs text-muted-foreground">עלות</p>
                </div>
              )}
              {isExpanded ? (
                <ChevronUp className="h-5 w-5 text-muted-foreground" />
              ) : (
                <ChevronDown className="h-5 w-5 text-muted-foreground" />
              )}
            </div>
          </div>
        </button>

        {isExpanded && (
          <div className="mt-4 pt-4 border-t space-y-4">
            {/* סיבה */}
            <div>
              <p className="text-sm font-medium mb-1 flex items-center gap-1">
                <Zap className="h-4 w-4" style={{ color: "#F59E0B" }} />
                למה זה חשוב
              </p>
              <p className="text-sm text-muted-foreground">{rec.reasoning}</p>
            </div>

            {/* צעדים */}
            <div>
              <p className="text-sm font-medium mb-2 flex items-center gap-1">
                <ListChecks className="h-4 w-4 text-blue-600" />
                צעדים לביצוע
              </p>
              <ol className="space-y-1.5">
                {rec.steps.map((step, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm">
                    <span className="h-5 w-5 rounded-full bg-muted flex items-center justify-center text-xs font-medium flex-shrink-0">
                      {i + 1}
                    </span>
                    <span className="text-muted-foreground">{step}</span>
                  </li>
                ))}
              </ol>
            </div>

            {/* פרטים נוספים */}
            <div className="flex flex-wrap gap-4">
              {rec.suggestedCompanies && rec.suggestedCompanies.length > 0 && (
                <div>
                  <p className="text-sm font-medium mb-1 flex items-center gap-1">
                    <Building2 className="h-4 w-4 text-purple-600" />
                    חברות מומלצות
                  </p>
                  <div className="flex flex-wrap gap-1">
                    {rec.suggestedCompanies.map((company) => (
                      <Badge key={company} variant="outline" className="text-xs">
                        {company}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
              <div>
                <p className="text-sm font-medium mb-1 flex items-center gap-1">
                  <Clock className="h-4 w-4 text-orange-600" />
                  לוח זמנים
                </p>
                <p className="text-sm text-muted-foreground">{rec.timeframe}</p>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function getPriorityConfig(priority: RecommendationPriority): { label: string; color: string } {
  switch (priority) {
    case "mandatory": return { label: "חובה", color: "#ef4444" };
    case "high": return { label: "גבוה", color: "#f97316" };
    case "medium": return { label: "בינוני", color: "#f59e0b" };
    case "service": return { label: "שירות", color: "#6b7280" };
  }
}

function getActionLabel(action: string): string {
  const labels: Record<string, string> = {
    open_new: "פתיחת מוצר",
    close: "סגירה",
    transfer: "העברה/ריכוז",
    upgrade: "שדרוג",
    reduce_fee: "הורדת דמי ניהול",
    increase_coverage: "הגדלת כיסוי",
    review: "סקירה",
  };
  return labels[action] || action;
}

function getScoreColor(score: number): string {
  if (score >= 80) return "#22c55e";
  if (score >= 60) return "#f59e0b";
  if (score >= 40) return "#f97316";
  return "#ef4444";
}
