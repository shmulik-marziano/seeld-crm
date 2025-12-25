"use client";

import { useState, useEffect, useCallback } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import {
  ClipboardList,
  Plus,
  Search,
  Filter,
  Loader2,
  Calendar,
  User,
  AlertCircle,
  Clock,
  CheckCircle,
  Pause,
} from "lucide-react";
import Link from "next/link";

interface Workflow {
  id: string;
  customer_id: string;
  type: string;
  status: "open" | "in_progress" | "waiting" | "completed" | "cancelled";
  priority: "low" | "medium" | "high" | "urgent";
  due_date: string | null;
  steps: Array<{ title: string; completed: boolean }>;
  created_at: string;
  customers: {
    id: string;
    first_name: string;
    last_name: string;
  };
}

interface Customer {
  id: string;
  first_name: string;
  last_name: string;
}

const workflowStatusLabels: Record<string, string> = {
  open: "פתוח",
  in_progress: "בטיפול",
  waiting: "ממתין",
  completed: "הושלם",
  cancelled: "בוטל",
};

const workflowStatusColors: Record<string, string> = {
  open: "bg-blue-500",
  in_progress: "bg-yellow-500",
  waiting: "bg-orange-500",
  completed: "bg-green-500",
  cancelled: "bg-gray-500",
};

const priorityLabels: Record<string, string> = {
  urgent: "דחוף",
  high: "גבוה",
  medium: "בינוני",
  low: "נמוך",
};

const priorityColors: Record<string, string> = {
  urgent: "bg-red-500",
  high: "bg-orange-500",
  medium: "bg-yellow-500",
  low: "bg-green-500",
};

const workflowTypes = [
  { value: "new_customer", label: "לקוח חדש" },
  { value: "pension_transfer", label: "העברת פנסיה" },
  { value: "insurance_claim", label: "תביעת ביטוח" },
  { value: "policy_renewal", label: "חידוש פוליסה" },
  { value: "document_collection", label: "איסוף מסמכים" },
  { value: "annual_review", label: "סקירה שנתית" },
  { value: "complaint", label: "טיפול בתלונה" },
  { value: "other", label: "אחר" },
];

function formatDate(dateStr: string | null) {
  if (!dateStr) return "-";
  return new Date(dateStr).toLocaleDateString("he-IL", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

function formatDueDate(dateStr: string | null) {
  if (!dateStr) return null;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);
  const dueDate = new Date(dateStr);
  dueDate.setHours(0, 0, 0, 0);

  if (dueDate.getTime() < today.getTime()) return { text: "באיחור", color: "text-red-600" };
  if (dueDate.getTime() === today.getTime()) return { text: "היום", color: "text-orange-600" };
  if (dueDate.getTime() === tomorrow.getTime()) return { text: "מחר", color: "text-yellow-600" };

  const diffDays = Math.floor((dueDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
  return { text: `בעוד ${diffDays} ימים`, color: "text-muted-foreground" };
}

function getWorkflowTypeLabel(type: string) {
  const found = workflowTypes.find((t) => t.value === type);
  return found?.label || type;
}

export default function WorkflowsPage() {
  const [workflows, setWorkflows] = useState<Workflow[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [priorityFilter, setPriorityFilter] = useState<string>("all");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [saving, setSaving] = useState(false);

  // New workflow form state
  const [newWorkflow, setNewWorkflow] = useState({
    customer_id: "",
    type: "",
    priority: "medium" as "low" | "medium" | "high" | "urgent",
    due_date: "",
  });

  const fetchWorkflows = useCallback(async () => {
    try {
      const params = new URLSearchParams();
      if (statusFilter && statusFilter !== "all") {
        params.append("status", statusFilter);
      }
      if (priorityFilter && priorityFilter !== "all") {
        params.append("priority", priorityFilter);
      }

      const response = await fetch(`/api/workflows?${params}`);
      const result = await response.json();
      if (result.data) {
        setWorkflows(result.data);
      }
    } catch (error) {
      console.error("Error fetching workflows:", error);
    } finally {
      setLoading(false);
    }
  }, [statusFilter, priorityFilter]);

  const fetchCustomers = useCallback(async () => {
    try {
      const response = await fetch("/api/customers?limit=100");
      const result = await response.json();
      if (result.data) {
        setCustomers(result.data);
      }
    } catch (error) {
      console.error("Error fetching customers:", error);
    }
  }, []);

  useEffect(() => {
    fetchWorkflows();
    fetchCustomers();
  }, [fetchWorkflows, fetchCustomers]);

  const handleCreateWorkflow = async () => {
    if (!newWorkflow.customer_id || !newWorkflow.type) {
      return;
    }

    setSaving(true);
    try {
      const response = await fetch(`/api/customers/${newWorkflow.customer_id}/workflows`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: newWorkflow.type,
          priority: newWorkflow.priority,
          due_date: newWorkflow.due_date || null,
        }),
      });

      if (response.ok) {
        setDialogOpen(false);
        setNewWorkflow({
          customer_id: "",
          type: "",
          priority: "medium",
          due_date: "",
        });
        fetchWorkflows();
      }
    } catch (error) {
      console.error("Error creating workflow:", error);
    } finally {
      setSaving(false);
    }
  };

  const handleUpdateStatus = async (workflowId: string, newStatus: string) => {
    try {
      const response = await fetch(`/api/workflows/${workflowId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });

      if (response.ok) {
        fetchWorkflows();
      }
    } catch (error) {
      console.error("Error updating workflow:", error);
    }
  };

  // Filter workflows based on search
  const filteredWorkflows = workflows.filter((workflow) => {
    const customerName = `${workflow.customers?.first_name} ${workflow.customers?.last_name}`.toLowerCase();
    const typeLabel = getWorkflowTypeLabel(workflow.type).toLowerCase();
    return customerName.includes(search.toLowerCase()) || typeLabel.includes(search.toLowerCase());
  });

  // Group by status for kanban-like view
  const openWorkflows = filteredWorkflows.filter((w) => w.status === "open");
  const inProgressWorkflows = filteredWorkflows.filter((w) => w.status === "in_progress");
  const waitingWorkflows = filteredWorkflows.filter((w) => w.status === "waiting");
  const completedWorkflows = filteredWorkflows.filter((w) => w.status === "completed");

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader2 className="h-8 w-8 animate-spin text-brand-blue" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">משימות</h1>
          <p className="text-muted-foreground">ניהול תהליכי עבודה ומשימות</p>
        </div>

        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button className="gap-2">
              <Plus className="h-4 w-4" />
              משימה חדשה
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>יצירת משימה חדשה</DialogTitle>
              <DialogDescription>
                הזן את פרטי המשימה
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="customer">לקוח</Label>
                <Select
                  value={newWorkflow.customer_id}
                  onValueChange={(value) =>
                    setNewWorkflow({ ...newWorkflow, customer_id: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="בחר לקוח" />
                  </SelectTrigger>
                  <SelectContent>
                    {customers.map((customer) => (
                      <SelectItem key={customer.id} value={customer.id}>
                        {customer.first_name} {customer.last_name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="grid gap-2">
                <Label htmlFor="type">סוג משימה</Label>
                <Select
                  value={newWorkflow.type}
                  onValueChange={(value) =>
                    setNewWorkflow({ ...newWorkflow, type: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="בחר סוג" />
                  </SelectTrigger>
                  <SelectContent>
                    {workflowTypes.map((type) => (
                      <SelectItem key={type.value} value={type.value}>
                        {type.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="grid gap-2">
                <Label htmlFor="priority">עדיפות</Label>
                <Select
                  value={newWorkflow.priority}
                  onValueChange={(value: "low" | "medium" | "high" | "urgent") =>
                    setNewWorkflow({ ...newWorkflow, priority: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="low">נמוך</SelectItem>
                    <SelectItem value="medium">בינוני</SelectItem>
                    <SelectItem value="high">גבוה</SelectItem>
                    <SelectItem value="urgent">דחוף</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="grid gap-2">
                <Label htmlFor="due_date">תאריך יעד</Label>
                <Input
                  id="due_date"
                  type="date"
                  value={newWorkflow.due_date}
                  onChange={(e) =>
                    setNewWorkflow({ ...newWorkflow, due_date: e.target.value })
                  }
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setDialogOpen(false)}>
                ביטול
              </Button>
              <Button onClick={handleCreateWorkflow} disabled={saving}>
                {saving ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  "צור משימה"
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-4">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="חיפוש לפי לקוח או סוג משימה..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pr-10"
          />
        </div>

        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-[150px]">
            <Filter className="h-4 w-4 ml-2" />
            <SelectValue placeholder="סטטוס" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">כל הסטטוסים</SelectItem>
            <SelectItem value="open">פתוח</SelectItem>
            <SelectItem value="in_progress">בטיפול</SelectItem>
            <SelectItem value="waiting">ממתין</SelectItem>
            <SelectItem value="completed">הושלם</SelectItem>
            <SelectItem value="cancelled">בוטל</SelectItem>
          </SelectContent>
        </Select>

        <Select value={priorityFilter} onValueChange={setPriorityFilter}>
          <SelectTrigger className="w-[150px]">
            <Filter className="h-4 w-4 ml-2" />
            <SelectValue placeholder="עדיפות" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">כל העדיפויות</SelectItem>
            <SelectItem value="urgent">דחוף</SelectItem>
            <SelectItem value="high">גבוה</SelectItem>
            <SelectItem value="medium">בינוני</SelectItem>
            <SelectItem value="low">נמוך</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Stats Overview */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">פתוחות</p>
                <p className="text-2xl font-bold">{openWorkflows.length}</p>
              </div>
              <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
                <AlertCircle className="h-5 w-5 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">בטיפול</p>
                <p className="text-2xl font-bold">{inProgressWorkflows.length}</p>
              </div>
              <div className="h-10 w-10 rounded-full bg-yellow-100 flex items-center justify-center">
                <Clock className="h-5 w-5 text-yellow-600" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">ממתינות</p>
                <p className="text-2xl font-bold">{waitingWorkflows.length}</p>
              </div>
              <div className="h-10 w-10 rounded-full bg-orange-100 flex items-center justify-center">
                <Pause className="h-5 w-5 text-orange-600" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">הושלמו</p>
                <p className="text-2xl font-bold">{completedWorkflows.length}</p>
              </div>
              <div className="h-10 w-10 rounded-full bg-green-100 flex items-center justify-center">
                <CheckCircle className="h-5 w-5 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Workflows List */}
      {filteredWorkflows.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <ClipboardList className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium">אין משימות</h3>
            <p className="text-muted-foreground">לא נמצאו משימות התואמות לחיפוש</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {filteredWorkflows
            .sort((a, b) => {
              // Sort by priority first, then by due date
              const priorityOrder = { urgent: 0, high: 1, medium: 2, low: 3 };
              const aPriority = priorityOrder[a.priority] ?? 4;
              const bPriority = priorityOrder[b.priority] ?? 4;
              if (aPriority !== bPriority) return aPriority - bPriority;

              if (a.due_date && b.due_date) {
                return new Date(a.due_date).getTime() - new Date(b.due_date).getTime();
              }
              return a.due_date ? -1 : 1;
            })
            .map((workflow) => {
              const dueInfo = formatDueDate(workflow.due_date);

              return (
                <Card key={workflow.id} className="hover:shadow-md transition-shadow">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div
                          className={`h-2 w-2 rounded-full ${priorityColors[workflow.priority]}`}
                        />

                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-medium">{getWorkflowTypeLabel(workflow.type)}</span>
                            <Badge
                              variant="secondary"
                              className={`${workflowStatusColors[workflow.status]} text-white`}
                            >
                              {workflowStatusLabels[workflow.status]}
                            </Badge>
                            <Badge
                              variant="outline"
                              className={`${priorityColors[workflow.priority]} text-white border-0`}
                            >
                              {priorityLabels[workflow.priority]}
                            </Badge>
                          </div>
                          <div className="flex items-center gap-3 text-sm text-muted-foreground mt-1">
                            <Link
                              href={`/customers/${workflow.customer_id}`}
                              className="flex items-center gap-1 hover:text-brand-blue transition-colors"
                            >
                              <User className="h-3 w-3" />
                              {workflow.customers?.first_name} {workflow.customers?.last_name}
                            </Link>
                            {dueInfo && (
                              <>
                                <span>•</span>
                                <span className={`flex items-center gap-1 ${dueInfo.color}`}>
                                  <Calendar className="h-3 w-3" />
                                  {dueInfo.text}
                                </span>
                              </>
                            )}
                            <span>•</span>
                            <span>נוצר {formatDate(workflow.created_at)}</span>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        {workflow.status !== "completed" && workflow.status !== "cancelled" && (
                          <Select
                            value={workflow.status}
                            onValueChange={(value) => handleUpdateStatus(workflow.id, value)}
                          >
                            <SelectTrigger className="w-[130px] h-8">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="open">פתוח</SelectItem>
                              <SelectItem value="in_progress">בטיפול</SelectItem>
                              <SelectItem value="waiting">ממתין</SelectItem>
                              <SelectItem value="completed">הושלם</SelectItem>
                              <SelectItem value="cancelled">בוטל</SelectItem>
                            </SelectContent>
                          </Select>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
        </div>
      )}
    </div>
  );
}
