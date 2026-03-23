"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import {
  TrendingUp,
  TrendingDown,
  Users,
  DollarSign,
  Target,
  Calendar,
  Phone,
  FileText,
  Award,
  Clock,
  ArrowUpRight,
  BarChart3,
  Percent,
} from "lucide-react";

// ===================== נתוני דמו =====================

const monthlyData = {
  currentMonth: "מרץ 2026",
  previousMonth: "פברואר 2026",
};

const kpiCards = [
  {
    title: "לקוחות חדשים",
    value: 12,
    target: 15,
    previousValue: 9,
    icon: Users,
    color: "#3B82F6",
    suffix: "",
  },
  {
    title: "פרמיה חדשה",
    value: 18500,
    target: 25000,
    previousValue: 14200,
    icon: DollarSign,
    color: "#10B981",
    suffix: " ש\"ח",
  },
  {
    title: "עמלות",
    value: 8750,
    target: 12000,
    previousValue: 6900,
    icon: Award,
    color: "#F59E0B",
    suffix: " ש\"ח",
  },
  {
    title: "פגישות",
    value: 22,
    target: 20,
    previousValue: 18,
    icon: Calendar,
    color: "#8B5CF6",
    suffix: "",
  },
];

const conversionFunnel = [
  { stage: "פניות נכנסות", count: 45, color: "#93C5FD" },
  { stage: "פגישות שנקבעו", count: 28, color: "#60A5FA" },
  { stage: "פגישות שבוצעו", count: 22, color: "#3B82F6" },
  { stage: "הצעות שנשלחו", count: 16, color: "#2563EB" },
  { stage: "עסקאות שנסגרו", count: 12, color: "#1D4ED8" },
];

const topProducts = [
  { type: "פנסיה", count: 8, premium: 9600, percentage: 35 },
  { type: "ביטוח בריאות", count: 6, premium: 2100, percentage: 25 },
  { type: "ביטוח חיים", count: 4, premium: 3200, percentage: 18 },
  { type: "קרן השתלמות", count: 3, premium: 2400, percentage: 12 },
  { type: "ביטוח רכב", count: 2, premium: 1200, percentage: 10 },
];

const topCompanies = [
  { name: "הראל", policies: 7, premium: 8200 },
  { name: "מגדל", policies: 5, premium: 4800 },
  { name: "מנורה", policies: 4, premium: 3100 },
  { name: "כלל", policies: 3, premium: 1800 },
  { name: "הפניקס", policies: 2, premium: 600 },
];

const recentActivities = [
  { type: "עסקה", text: "פנסיה חדשה - ישראל ישראלי", time: "לפני שעה", icon: DollarSign, color: "text-green-600" },
  { type: "פגישה", text: "פגישת סיכום - שרה כהן", time: "לפני 3 שעות", icon: Calendar, color: "text-blue-600" },
  { type: "שיחה", text: "שיחת מעקב - דוד לוי", time: "לפני 5 שעות", icon: Phone, color: "text-purple-600" },
  { type: "הצעה", text: "הצעת ביטוח דירה - רחל אברהם", time: "אתמול", icon: FileText, color: "text-orange-600" },
  { type: "עסקה", text: "ביטוח בריאות - משה פרץ", time: "אתמול", icon: DollarSign, color: "text-green-600" },
];

const weeklyGoals = [
  { goal: "שיחות יוצאות", done: 35, target: 40, unit: "שיחות" },
  { goal: "פגישות חדשות", done: 4, target: 5, unit: "פגישות" },
  { goal: "הצעות מחיר", done: 3, target: 4, unit: "הצעות" },
  { goal: "סגירות", done: 2, target: 3, unit: "עסקאות" },
];

// ===================== קומפוננטות =====================

function KpiCard({ data }: { data: typeof kpiCards[0] }) {
  const Icon = data.icon;
  const progress = Math.min(100, Math.round((data.value / data.target) * 100));
  const change = data.previousValue > 0
    ? Math.round(((data.value - data.previousValue) / data.previousValue) * 100)
    : 0;
  const isUp = change >= 0;

  return (
    <Card>
      <CardContent className="p-4">
        <div className="flex items-start justify-between mb-3">
          <div className="p-2 rounded-lg" style={{ backgroundColor: `${data.color}15` }}>
            <Icon className="h-5 w-5" style={{ color: data.color }} />
          </div>
          <div className={`flex items-center gap-1 text-xs font-medium ${isUp ? "text-green-600" : "text-red-600"}`}>
            {isUp ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
            {Math.abs(change)}%
          </div>
        </div>
        <p className="text-2xl font-bold">
          {data.value.toLocaleString()}{data.suffix}
        </p>
        <p className="text-xs text-muted-foreground mt-1">{data.title}</p>
        <div className="mt-3">
          <div className="flex items-center justify-between text-xs text-muted-foreground mb-1">
            <span>יעד: {data.target.toLocaleString()}{data.suffix}</span>
            <span>{progress}%</span>
          </div>
          <Progress value={progress} className="h-2" />
        </div>
      </CardContent>
    </Card>
  );
}

function FunnelBar({ data, maxCount }: { data: typeof conversionFunnel[0]; maxCount: number }) {
  const width = Math.max(20, Math.round((data.count / maxCount) * 100));
  return (
    <div className="flex items-center gap-3">
      <span className="text-xs text-muted-foreground w-28 text-left">{data.stage}</span>
      <div className="flex-1">
        <div
          className="h-7 rounded flex items-center justify-center text-white text-xs font-medium transition-all"
          style={{ width: `${width}%`, backgroundColor: data.color }}
        >
          {data.count}
        </div>
      </div>
    </div>
  );
}

// ===================== עמוד ראשי =====================

export default function PulsePage() {
  const [period, setPeriod] = useState<"week" | "month" | "quarter">("month");

  const maxFunnel = Math.max(...conversionFunnel.map((f) => f.count));

  return (
    <div className="p-6 space-y-6" dir="rtl">
      {/* כותרת */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <span className="text-[#EF4444]">PULSE</span>
            <span className="text-muted-foreground text-lg">|</span>
            <span>דשבורד ביצועים</span>
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            {monthlyData.currentMonth} - סקירת ביצועים ויעדים
          </p>
        </div>
        <div className="flex items-center gap-1 bg-accent rounded-lg p-1">
          {(["week", "month", "quarter"] as const).map((p) => (
            <Button
              key={p}
              variant={period === p ? "default" : "ghost"}
              size="sm"
              className={period === p ? "bg-[#EF4444] hover:bg-[#DC2626]" : ""}
              onClick={() => setPeriod(p)}
            >
              {p === "week" ? "שבוע" : p === "month" ? "חודש" : "רבעון"}
            </Button>
          ))}
        </div>
      </div>

      {/* כרטיסי KPI */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {kpiCards.map((kpi) => (
          <KpiCard key={kpi.title} data={kpi} />
        ))}
      </div>

      {/* שורה שנייה - משפך + יעדים שבועיים */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* משפך המרה */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <BarChart3 className="h-4 w-4 text-[#EF4444]" />
              משפך המרה
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {conversionFunnel.map((item) => (
              <FunnelBar key={item.stage} data={item} maxCount={maxFunnel} />
            ))}
            <Separator className="my-2" />
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">אחוז המרה כולל</span>
              <span className="font-bold flex items-center gap-1">
                <Percent className="h-3 w-3" />
                {Math.round((conversionFunnel[conversionFunnel.length - 1].count / conversionFunnel[0].count) * 100)}%
              </span>
            </div>
          </CardContent>
        </Card>

        {/* יעדים שבועיים */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <Target className="h-4 w-4 text-[#EF4444]" />
              יעדים שבועיים
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {weeklyGoals.map((goal) => {
              const progress = Math.min(100, Math.round((goal.done / goal.target) * 100));
              const isComplete = goal.done >= goal.target;
              return (
                <div key={goal.goal}>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm">{goal.goal}</span>
                    <span className={`text-sm font-medium ${isComplete ? "text-green-600" : ""}`}>
                      {goal.done}/{goal.target} {goal.unit}
                    </span>
                  </div>
                  <Progress value={progress} className="h-2" />
                </div>
              );
            })}
          </CardContent>
        </Card>
      </div>

      {/* שורה שלישית - מוצרים + חברות + פעילות */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* מוצרים מובילים */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">מוצרים מובילים</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {topProducts.map((product, i) => (
              <div key={product.type} className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-muted-foreground w-4">{i + 1}</span>
                  <span className="text-sm">{product.type}</span>
                  <Badge variant="outline" className="text-xs">{product.count}</Badge>
                </div>
                <span className="text-sm font-medium">{product.premium.toLocaleString()} ש&quot;ח</span>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* חברות מובילות */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">חברות מובילות</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {topCompanies.map((company, i) => (
              <div key={company.name} className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-muted-foreground w-4">{i + 1}</span>
                  <span className="text-sm">{company.name}</span>
                  <Badge variant="outline" className="text-xs">{company.policies} פוליסות</Badge>
                </div>
                <span className="text-sm font-medium">{company.premium.toLocaleString()} ש&quot;ח</span>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* פעילות אחרונה */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">פעילות אחרונה</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {recentActivities.map((activity, i) => {
              const Icon = activity.icon;
              return (
                <div key={i} className="flex items-start gap-3">
                  <Icon className={`h-4 w-4 mt-0.5 ${activity.color}`} />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm truncate">{activity.text}</p>
                    <p className="text-xs text-muted-foreground">{activity.time}</p>
                  </div>
                </div>
              );
            })}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
