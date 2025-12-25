"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Users,
  FileCheck,
  Calendar,
  ClipboardList,
  ArrowLeft,
  Phone,
  Clock,
  AlertCircle,
  Loader2,
} from "lucide-react";
import Link from "next/link";

interface DashboardStats {
  customers: { total: number; newThisMonth: number };
  products: { active: number; total: number; percentage: number };
  meetings: { today: number; completedToday: number };
  workflows: { open: number; urgent: number };
}

interface RecentData {
  recentCustomers: Array<{
    id: string;
    first_name: string;
    last_name: string;
    mobile: string;
    products_count: number;
    created_at: string;
  }>;
  upcomingMeetings: Array<{
    id: string;
    type: string;
    scheduled_at: string;
    duration_minutes: number;
    customers: { first_name: string; last_name: string };
  }>;
  urgentTasks: Array<{
    id: string;
    type: string;
    priority: string;
    due_date: string;
    customers: { first_name: string; last_name: string };
  }>;
}

const priorityColors: Record<string, string> = {
  urgent: "bg-red-500",
  high: "bg-orange-500",
  medium: "bg-yellow-500",
  low: "bg-green-500",
};

const priorityLabels: Record<string, string> = {
  urgent: "דחוף",
  high: "גבוה",
  medium: "בינוני",
  low: "נמוך",
};

function formatTimeAgo(dateStr: string) {
  const date = new Date(dateStr);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
  const diffDays = Math.floor(diffHours / 24);

  if (diffHours < 1) return "עכשיו";
  if (diffHours < 24) return `לפני ${diffHours} שעות`;
  if (diffDays === 1) return "אתמול";
  return `לפני ${diffDays} ימים`;
}

function formatTime(dateStr: string) {
  return new Date(dateStr).toLocaleTimeString("he-IL", {
    hour: "2-digit",
    minute: "2-digit",
  });
}

function formatDueDate(dateStr: string | null) {
  if (!dateStr) return "-";
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);
  const dueDate = new Date(dateStr);
  dueDate.setHours(0, 0, 0, 0);

  if (dueDate.getTime() < today.getTime()) return "באיחור";
  if (dueDate.getTime() === today.getTime()) return "היום";
  if (dueDate.getTime() === tomorrow.getTime()) return "מחר";

  const diffDays = Math.floor((dueDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
  return `בעוד ${diffDays} ימים`;
}

export default function DashboardPage() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [recentData, setRecentData] = useState<RecentData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      try {
        const [statsRes, recentRes] = await Promise.all([
          fetch("/api/dashboard/stats"),
          fetch("/api/dashboard/recent"),
        ]);

        const statsData = await statsRes.json();
        const recentDataRes = await recentRes.json();

        if (statsData.data) setStats(statsData.data);
        if (recentDataRes.data) setRecentData(recentDataRes.data);
      } catch (error) {
        console.error("Error fetching dashboard data:", error);
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader2 className="h-8 w-8 animate-spin text-brand-blue" />
      </div>
    );
  }

  const statsCards = [
    {
      title: "לקוחות",
      value: stats?.customers.total.toLocaleString() || "0",
      description: `+${stats?.customers.newThisMonth || 0} החודש`,
      icon: Users,
      color: "text-brand-blue",
      bgColor: "bg-brand-blue/10",
    },
    {
      title: "מוצרים פעילים",
      value: stats?.products.active.toLocaleString() || "0",
      description: `${stats?.products.percentage || 0}% מהמוצרים`,
      icon: FileCheck,
      color: "text-brand-green",
      bgColor: "bg-brand-green/10",
    },
    {
      title: "פגישות היום",
      value: stats?.meetings.today.toString() || "0",
      description: `${stats?.meetings.completedToday || 0} הושלמו`,
      icon: Calendar,
      color: "text-orange-500",
      bgColor: "bg-orange-500/10",
    },
    {
      title: "משימות פתוחות",
      value: stats?.workflows.open.toString() || "0",
      description: `${stats?.workflows.urgent || 0} דחופות`,
      icon: ClipboardList,
      color: "text-purple-500",
      bgColor: "bg-purple-500/10",
    },
  ];

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-3xl font-bold">דשבורד</h1>
        <p className="text-muted-foreground">ברוכים הבאים למערכת SEELD CRM</p>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {statsCards.map((stat) => (
          <Card key={stat.title}>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                {stat.title}
              </CardTitle>
              <div className={`rounded-lg p-2 ${stat.bgColor}`}>
                <stat.icon className={`h-5 w-5 ${stat.color}`} />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.value}</div>
              <p className="text-xs text-muted-foreground">{stat.description}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Main Content Grid */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Urgent Tasks */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <AlertCircle className="h-5 w-5 text-red-500" />
                משימות דחופות
              </CardTitle>
              <CardDescription>משימות שדורשות טיפול מיידי</CardDescription>
            </div>
            <Link href="/workflows">
              <Button variant="ghost" size="sm" className="gap-1">
                הצג הכל
                <ArrowLeft className="h-4 w-4" />
              </Button>
            </Link>
          </CardHeader>
          <CardContent>
            {!recentData?.urgentTasks?.length ? (
              <p className="text-center text-muted-foreground py-4">אין משימות דחופות</p>
            ) : (
              <div className="space-y-4">
                {recentData.urgentTasks.map((task) => (
                  <div
                    key={task.id}
                    className="flex items-center justify-between rounded-lg border p-3 hover:bg-accent/50 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <div className={`h-2 w-2 rounded-full ${priorityColors[task.priority] || "bg-gray-500"}`} />
                      <div>
                        <p className="font-medium">{task.type}</p>
                        <p className="text-sm text-muted-foreground">
                          {task.customers?.first_name} {task.customers?.last_name}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant="secondary" className={`${priorityColors[task.priority] || ""} text-white`}>
                        {priorityLabels[task.priority] || task.priority}
                      </Badge>
                      <span className="text-sm text-muted-foreground">
                        {formatDueDate(task.due_date)}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Upcoming Meetings */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5 text-brand-blue" />
                פגישות היום
              </CardTitle>
              <CardDescription>הפגישות הקרובות שלך</CardDescription>
            </div>
            <Link href="/meetings">
              <Button variant="ghost" size="sm" className="gap-1">
                הצג הכל
                <ArrowLeft className="h-4 w-4" />
              </Button>
            </Link>
          </CardHeader>
          <CardContent>
            {!recentData?.upcomingMeetings?.length ? (
              <p className="text-center text-muted-foreground py-4">אין פגישות מתוכננות להיום</p>
            ) : (
              <div className="space-y-4">
                {recentData.upcomingMeetings.map((meeting) => (
                  <div
                    key={meeting.id}
                    className="flex items-center justify-between rounded-lg border p-3 hover:bg-accent/50 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-brand-blue/10">
                        <Clock className="h-5 w-5 text-brand-blue" />
                      </div>
                      <div>
                        <p className="font-medium">
                          {meeting.customers?.first_name} {meeting.customers?.last_name}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {meeting.duration_minutes} דקות
                        </p>
                      </div>
                    </div>
                    <div className="text-left">
                      <p className="font-medium">{formatTime(meeting.scheduled_at)}</p>
                      <p className="text-sm text-muted-foreground">
                        {meeting.type === "phone" ? "טלפוני" : meeting.type === "in_person" ? "פרונטלי" : "וידאו"}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Recent Customers */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5 text-brand-green" />
                לקוחות אחרונים
              </CardTitle>
              <CardDescription>לקוחות שנוספו לאחרונה</CardDescription>
            </div>
            <Link href="/customers">
              <Button variant="ghost" size="sm" className="gap-1">
                הצג הכל
                <ArrowLeft className="h-4 w-4" />
              </Button>
            </Link>
          </CardHeader>
          <CardContent>
            {!recentData?.recentCustomers?.length ? (
              <p className="text-center text-muted-foreground py-4">אין לקוחות חדשים</p>
            ) : (
              <div className="space-y-4">
                {recentData.recentCustomers.map((customer) => (
                  <Link href={`/customers/${customer.id}`} key={customer.id}>
                    <div className="flex items-center justify-between rounded-lg border p-3 hover:bg-accent/50 transition-colors">
                      <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-brand-green/10 font-medium text-brand-green">
                          {customer.first_name?.charAt(0)}
                        </div>
                        <div>
                          <p className="font-medium">{customer.first_name} {customer.last_name}</p>
                          <div className="flex items-center gap-1 text-sm text-muted-foreground">
                            <Phone className="h-3 w-3" />
                            {customer.mobile || "-"}
                          </div>
                        </div>
                      </div>
                      <div className="text-left">
                        <Badge variant="secondary">
                          {customer.products_count} מוצרים
                        </Badge>
                        <p className="text-xs text-muted-foreground mt-1">
                          {formatTimeAgo(customer.created_at)}
                        </p>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <Card>
          <CardHeader>
            <CardTitle>פעולות מהירות</CardTitle>
            <CardDescription>גישה מהירה לפעולות נפוצות</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-3">
              <Link href="/customers/new">
                <Button variant="outline" className="w-full h-auto py-4 flex-col gap-2">
                  <Users className="h-6 w-6 text-brand-blue" />
                  <span>לקוח חדש</span>
                </Button>
              </Link>
              <Link href="/meetings">
                <Button variant="outline" className="w-full h-auto py-4 flex-col gap-2">
                  <Calendar className="h-6 w-6 text-brand-green" />
                  <span>פגישות</span>
                </Button>
              </Link>
              <Link href="/workflows">
                <Button variant="outline" className="w-full h-auto py-4 flex-col gap-2">
                  <ClipboardList className="h-6 w-6 text-purple-500" />
                  <span>משימות</span>
                </Button>
              </Link>
              <Link href="/customers">
                <Button variant="outline" className="w-full h-auto py-4 flex-col gap-2">
                  <FileCheck className="h-6 w-6 text-orange-500" />
                  <span>לקוחות</span>
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
