"use client";

import { useState, useEffect } from "react";
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
  AlertCircle,
  Info,
  CheckCircle2,
  XCircle,
  MinusCircle,
  Zap,
  TrendingDown,
  Copy as CopyIcon,
  Shield,
  Heart,
  Home,
  Car,
  Wallet,
  ArrowLeft,
} from "lucide-react";
import { toast } from "sonner";
import { Customer, productTypeLabels } from "@/types/database";
import type { XRayReport, XRayFinding, FindingSeverity } from "@/lib/analysis/xray-engine";

interface CustomerWithCount extends Customer {
  products?: { count: number }[];
}

export default function XRayPage() {
  const [customers, setCustomers] = useState<CustomerWithCount[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCustomer, setSelectedCustomer] = useState<CustomerWithCount | null>(null);
  const [isSearching, setIsSearching] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [report, setReport] = useState<XRayReport | null>(null);

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

  async function runAnalysis(customer: CustomerWithCount) {
    setSelectedCustomer(customer);
    setIsAnalyzing(true);
    setReport(null);
    setSearchQuery("");
    setCustomers([]);

    try {
      const res = await fetch(`/api/analysis/x-ray?customerId=${customer.id}`);
      const json = await res.json();

      if (json.error) {
        toast.error(json.error);
        return;
      }

      setReport(json.data);
      toast.success("הניתוח הושלם בהצלחה");
    } catch {
      toast.error("שגיאה בביצוע הניתוח");
    } finally {
      setIsAnalyzing(false);
    }
  }

  function resetAnalysis() {
    setSelectedCustomer(null);
    setReport(null);
    setSearchQuery("");
  }

  return (
    <div className="space-y-6">
      {/* כותרת */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold" style={{ color: "#DC2626" }}>
            X-RAY - ניתוח תיק ביטוחי
          </h1>
          <p className="text-muted-foreground mt-1">
            סריקה מעמיקה של תיק הלקוח לאיתור פערים, כפילויות ודמי ניהול גבוהים
          </p>
        </div>
        {selectedCustomer && (
          <Button variant="outline" onClick={resetAnalysis}>
            <ArrowLeft className="h-4 w-4 ml-2" />
            ניתוח לקוח אחר
          </Button>
        )}
      </div>

      {/* בחירת לקוח */}
      {!selectedCustomer && (
        <Card>
          <CardHeader>
            <CardTitle>בחירת לקוח לניתוח</CardTitle>
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

            {/* תוצאות חיפוש */}
            {customers.length > 0 && (
              <div className="mt-3 border rounded-lg divide-y max-h-80 overflow-auto">
                {customers.map((customer) => (
                  <button
                    key={customer.id}
                    onClick={() => runAnalysis(customer)}
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

      {/* מצב טעינה */}
      {isAnalyzing && (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Loader2 className="h-12 w-12 animate-spin mb-4" style={{ color: "#DC2626" }} />
            <p className="text-lg font-medium">מנתח את התיק של {selectedCustomer?.first_name} {selectedCustomer?.last_name}...</p>
            <p className="text-muted-foreground mt-1">בודק פערים, כפילויות ודמי ניהול</p>
          </CardContent>
        </Card>
      )}

      {/* תוצאות הניתוח */}
      {report && selectedCustomer && (
        <>
          {/* שורת סיכום עליונה */}
          <div className="grid gap-4 md:grid-cols-4">
            {/* ציון בריאות */}
            <Card className="md:col-span-1">
              <CardContent className="pt-6">
                <div className="text-center">
                  <div
                    className="inline-flex items-center justify-center w-24 h-24 rounded-full border-4 mb-3"
                    style={{
                      borderColor: getScoreColor(report.score),
                      color: getScoreColor(report.score),
                    }}
                  >
                    <span className="text-3xl font-bold">{report.score}</span>
                  </div>
                  <p className="font-medium text-lg">ציון בריאות התיק</p>
                  <p className="text-sm text-muted-foreground mt-1">
                    {getScoreLabel(report.score)}
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* סטטיסטיקות */}
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center gap-3 mb-2">
                  <div className="h-10 w-10 rounded-lg bg-blue-100 flex items-center justify-center">
                    <Wallet className="h-5 w-5 text-blue-600" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold">{report.summary.activeProducts}</p>
                    <p className="text-sm text-muted-foreground">מוצרים פעילים</p>
                  </div>
                </div>
                <Separator className="my-3" />
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">פרמיה חודשית</span>
                  <span className="font-medium">{report.summary.totalPremium.toLocaleString()} ₪</span>
                </div>
                <div className="flex justify-between text-sm mt-1">
                  <span className="text-muted-foreground">יתרות צבורות</span>
                  <span className="font-medium">{report.summary.totalBalance.toLocaleString()} ₪</span>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center gap-3 mb-2">
                  <div className="h-10 w-10 rounded-lg bg-red-100 flex items-center justify-center">
                    <AlertTriangle className="h-5 w-5 text-red-600" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold">{report.findings.length}</p>
                    <p className="text-sm text-muted-foreground">ממצאים</p>
                  </div>
                </div>
                <Separator className="my-3" />
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">פערים</span>
                  <span className="font-medium">{report.summary.gapsCount}</span>
                </div>
                <div className="flex justify-between text-sm mt-1">
                  <span className="text-muted-foreground">כפילויות</span>
                  <span className="font-medium">{report.summary.duplicatesCount}</span>
                </div>
                <div className="flex justify-between text-sm mt-1">
                  <span className="text-muted-foreground">דמי ניהול גבוהים</span>
                  <span className="font-medium">{report.summary.highFeesCount}</span>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center gap-3 mb-2">
                  <div className="h-10 w-10 rounded-lg bg-green-100 flex items-center justify-center">
                    <TrendingDown className="h-5 w-5 text-green-600" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold">{report.summary.estimatedSavings.toLocaleString()} ₪</p>
                    <p className="text-sm text-muted-foreground">חיסכון שנתי אפשרי</p>
                  </div>
                </div>
                <Separator className="my-3" />
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">ממוצע דמי ניהול</span>
                  <span className="font-medium">{report.summary.avgManagementFee}%</span>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* סטטוס קטגוריות */}
          <Card>
            <CardHeader>
              <CardTitle>סטטוס קטגוריות</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-3 md:grid-cols-5">
                {Object.entries(report.categories).map(([key, cat]) => {
                  const icon = getCategoryIcon(key);
                  return (
                    <div
                      key={key}
                      className="flex items-center gap-3 p-3 rounded-lg border"
                    >
                      <div
                        className="h-10 w-10 rounded-lg flex items-center justify-center"
                        style={{ backgroundColor: getCategoryBg(cat.status) }}
                      >
                        {icon}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-sm truncate">{cat.name}</p>
                        <div className="flex items-center gap-1 mt-0.5">
                          {getStatusIcon(cat.status)}
                          <span className="text-xs text-muted-foreground">
                            {cat.status === "complete" ? "תקין" : cat.status === "partial" ? "חלקי" : "חסר"}
                          </span>
                        </div>
                        {cat.products.length > 0 && (
                          <p className="text-xs text-muted-foreground mt-0.5">
                            {cat.products.length} מוצרים
                          </p>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>

          {/* ממצאים */}
          <Card>
            <CardHeader>
              <CardTitle>ממצאים ({report.findings.length})</CardTitle>
            </CardHeader>
            <CardContent>
              {report.findings.length === 0 ? (
                <div className="text-center py-8">
                  <CheckCircle2 className="h-12 w-12 text-green-500 mx-auto mb-3" />
                  <p className="text-lg font-medium">התיק תקין</p>
                  <p className="text-muted-foreground">לא נמצאו ממצאים</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {report.findings.map((finding) => (
                    <FindingCard key={finding.id} finding={finding} />
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* כפתור מעבר ל-WISE */}
          {report.findings.length > 0 && (
            <Card className="border-2" style={{ borderColor: "#F59E0B" }}>
              <CardContent className="flex items-center justify-between py-4">
                <div>
                  <p className="font-bold text-lg" style={{ color: "#F59E0B" }}>
                    רוצה לקבל המלצות פעולה?
                  </p>
                  <p className="text-muted-foreground text-sm">
                    WISE ייצר תוכנית פעולה מפורטת עם סדרי עדיפויות וצעדים
                  </p>
                </div>
                <Button
                  style={{ backgroundColor: "#F59E0B" }}
                  className="text-white hover:opacity-90"
                  onClick={() => {
                    window.location.href = `/wise?customerId=${selectedCustomer.id}`;
                  }}
                >
                  <Zap className="h-4 w-4 ml-2" />
                  עבור ל-WISE
                </Button>
              </CardContent>
            </Card>
          )}
        </>
      )}
    </div>
  );
}

// === קומפוננטות עזר ===

function FindingCard({ finding }: { finding: XRayFinding }) {
  return (
    <div className="flex gap-3 p-4 rounded-lg border">
      <div className="mt-0.5">{getSeverityIcon(finding.severity)}</div>
      <div className="flex-1">
        <div className="flex items-center gap-2 mb-1">
          <span className="font-medium">{finding.title}</span>
          <SeverityBadge severity={finding.severity} />
          <Badge variant="outline" className="text-xs">
            {finding.category}
          </Badge>
        </div>
        <p className="text-sm text-muted-foreground">{finding.description}</p>
        {finding.estimatedImpact && (
          <p className="text-sm text-green-600 mt-1 font-medium">
            חיסכון שנתי משוער: {finding.estimatedImpact.toLocaleString()} ₪
          </p>
        )}
        {finding.recommendation && (
          <p className="text-sm text-blue-600 mt-1">{finding.recommendation}</p>
        )}
      </div>
    </div>
  );
}

function SeverityBadge({ severity }: { severity: FindingSeverity }) {
  const config: Record<FindingSeverity, { label: string; variant: "destructive" | "default" | "secondary" | "outline" }> = {
    critical: { label: "קריטי", variant: "destructive" },
    high: { label: "גבוה", variant: "default" },
    medium: { label: "בינוני", variant: "secondary" },
    low: { label: "נמוך", variant: "outline" },
  };
  const c = config[severity];
  return <Badge variant={c.variant} className="text-xs">{c.label}</Badge>;
}

function getSeverityIcon(severity: FindingSeverity) {
  switch (severity) {
    case "critical": return <XCircle className="h-5 w-5 text-red-600" />;
    case "high": return <AlertTriangle className="h-5 w-5 text-orange-500" />;
    case "medium": return <AlertCircle className="h-5 w-5 text-yellow-500" />;
    case "low": return <Info className="h-5 w-5 text-blue-400" />;
  }
}

function getStatusIcon(status: string) {
  switch (status) {
    case "complete": return <CheckCircle2 className="h-3.5 w-3.5 text-green-500" />;
    case "partial": return <MinusCircle className="h-3.5 w-3.5 text-yellow-500" />;
    case "missing": return <XCircle className="h-3.5 w-3.5 text-red-500" />;
    default: return null;
  }
}

function getCategoryIcon(key: string) {
  switch (key) {
    case "pension": return <Wallet className="h-5 w-5 text-blue-600" />;
    case "savings": return <TrendingDown className="h-5 w-5 text-green-600" />;
    case "lifeInsurance": return <Shield className="h-5 w-5 text-purple-600" />;
    case "healthInsurance": return <Heart className="h-5 w-5 text-red-600" />;
    case "propertyInsurance": return <Home className="h-5 w-5 text-amber-600" />;
    default: return <Info className="h-5 w-5" />;
  }
}

function getCategoryBg(status: string): string {
  switch (status) {
    case "complete": return "#dcfce7";
    case "partial": return "#fef9c3";
    case "missing": return "#fee2e2";
    default: return "#f3f4f6";
  }
}

function getScoreColor(score: number): string {
  if (score >= 80) return "#22c55e";
  if (score >= 60) return "#f59e0b";
  if (score >= 40) return "#f97316";
  return "#ef4444";
}

function getScoreLabel(score: number): string {
  if (score >= 80) return "תיק תקין";
  if (score >= 60) return "דורש שיפור";
  if (score >= 40) return "דורש טיפול";
  return "מצב קריטי";
}
