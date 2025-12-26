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
  Calendar,
  Clock,
  Plus,
  Search,
  Phone,
  Video,
  Users,
  MapPin,
  Filter,
  Loader2,
  CheckCircle,
  XCircle,
  AlertCircle,
} from "lucide-react";
import Link from "next/link";

interface Meeting {
  id: string;
  customer_id: string;
  type: "phone" | "in_person" | "video";
  scheduled_at: string;
  duration_minutes: number;
  location: string | null;
  summary: string | null;
  next_steps: string | null;
  status: "scheduled" | "completed" | "cancelled" | "no_show";
  customers: {
    id: string;
    first_name: string;
    last_name: string;
    mobile: string | null;
  };
}

interface Customer {
  id: string;
  first_name: string;
  last_name: string;
}

const meetingTypeLabels: Record<string, string> = {
  phone: "טלפוני",
  in_person: "פרונטלי",
  video: "וידאו",
};

const meetingTypeIcons: Record<string, React.ElementType> = {
  phone: Phone,
  in_person: Users,
  video: Video,
};

const meetingStatusLabels: Record<string, string> = {
  scheduled: "מתוכנן",
  completed: "הושלם",
  cancelled: "בוטל",
  no_show: "לא הגיע",
};

const meetingStatusColors: Record<string, string> = {
  scheduled: "bg-blue-500",
  completed: "bg-green-500",
  cancelled: "bg-gray-500",
  no_show: "bg-red-500",
};

function formatDate(dateStr: string) {
  const date = new Date(dateStr);
  return date.toLocaleDateString("he-IL", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

function formatTime(dateStr: string) {
  return new Date(dateStr).toLocaleTimeString("he-IL", {
    hour: "2-digit",
    minute: "2-digit",
  });
}

function isToday(dateStr: string) {
  const date = new Date(dateStr);
  const today = new Date();
  return date.toDateString() === today.toDateString();
}

export default function MeetingsPage() {
  const [meetings, setMeetings] = useState<Meeting[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [typeFilter, setTypeFilter] = useState<string>("all");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [saving, setSaving] = useState(false);

  // New meeting form state
  const [newMeeting, setNewMeeting] = useState({
    customer_id: "",
    type: "phone" as "phone" | "in_person" | "video",
    scheduled_at: "",
    duration_minutes: 30,
    location: "",
  });

  const fetchMeetings = useCallback(async () => {
    try {
      const params = new URLSearchParams();
      if (statusFilter && statusFilter !== "all") {
        params.append("status", statusFilter);
      }
      if (typeFilter && typeFilter !== "all") {
        params.append("type", typeFilter);
      }

      const response = await fetch(`/api/meetings?${params}`);
      const result = await response.json();
      if (result.data) {
        setMeetings(result.data);
      }
    } catch (error) {
      console.error("Error fetching meetings:", error);
    } finally {
      setLoading(false);
    }
  }, [statusFilter, typeFilter]);

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
    fetchMeetings();
    fetchCustomers();
  }, [fetchMeetings, fetchCustomers]);

  const handleCreateMeeting = async () => {
    if (!newMeeting.customer_id || !newMeeting.scheduled_at) {
      return;
    }

    setSaving(true);
    try {
      const response = await fetch(`/api/customers/${newMeeting.customer_id}/meetings`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: newMeeting.type,
          scheduled_at: newMeeting.scheduled_at,
          duration_minutes: newMeeting.duration_minutes,
          location: newMeeting.location || null,
        }),
      });

      if (response.ok) {
        setDialogOpen(false);
        setNewMeeting({
          customer_id: "",
          type: "phone",
          scheduled_at: "",
          duration_minutes: 30,
          location: "",
        });
        fetchMeetings();
      }
    } catch (error) {
      console.error("Error creating meeting:", error);
    } finally {
      setSaving(false);
    }
  };

  const handleUpdateStatus = async (meetingId: string, newStatus: string) => {
    try {
      const response = await fetch(`/api/meetings/${meetingId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });

      if (response.ok) {
        fetchMeetings();
      }
    } catch (error) {
      console.error("Error updating meeting:", error);
    }
  };

  // Filter meetings based on search
  const filteredMeetings = meetings.filter((meeting) => {
    const customerName = `${meeting.customers?.first_name} ${meeting.customers?.last_name}`.toLowerCase();
    return customerName.includes(search.toLowerCase());
  });

  // Group meetings by date
  const groupedMeetings: Record<string, Meeting[]> = {};
  filteredMeetings.forEach((meeting) => {
    const dateKey = new Date(meeting.scheduled_at).toDateString();
    if (!groupedMeetings[dateKey]) {
      groupedMeetings[dateKey] = [];
    }
    groupedMeetings[dateKey].push(meeting);
  });

  // Sort dates
  const sortedDates = Object.keys(groupedMeetings).sort((a, b) =>
    new Date(a).getTime() - new Date(b).getTime()
  );

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
          <h1 className="text-3xl font-bold">פגישות</h1>
          <p className="text-muted-foreground">ניהול פגישות ותיאומים</p>
        </div>

        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button className="gap-2">
              <Plus className="h-4 w-4" />
              פגישה חדשה
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>יצירת פגישה חדשה</DialogTitle>
              <DialogDescription>
                הזן את פרטי הפגישה
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="customer">לקוח</Label>
                <Select
                  value={newMeeting.customer_id}
                  onValueChange={(value) =>
                    setNewMeeting({ ...newMeeting, customer_id: value })
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
                <Label htmlFor="type">סוג פגישה</Label>
                <Select
                  value={newMeeting.type}
                  onValueChange={(value: "phone" | "in_person" | "video") =>
                    setNewMeeting({ ...newMeeting, type: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="phone">טלפוני</SelectItem>
                    <SelectItem value="in_person">פרונטלי</SelectItem>
                    <SelectItem value="video">וידאו</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="grid gap-2">
                <Label htmlFor="datetime">תאריך ושעה</Label>
                <Input
                  id="datetime"
                  type="datetime-local"
                  value={newMeeting.scheduled_at}
                  onChange={(e) =>
                    setNewMeeting({ ...newMeeting, scheduled_at: e.target.value })
                  }
                />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="duration">משך (דקות)</Label>
                <Select
                  value={newMeeting.duration_minutes.toString()}
                  onValueChange={(value) =>
                    setNewMeeting({ ...newMeeting, duration_minutes: parseInt(value) })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="15">15 דקות</SelectItem>
                    <SelectItem value="30">30 דקות</SelectItem>
                    <SelectItem value="45">45 דקות</SelectItem>
                    <SelectItem value="60">שעה</SelectItem>
                    <SelectItem value="90">שעה וחצי</SelectItem>
                    <SelectItem value="120">שעתיים</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {newMeeting.type === "in_person" && (
                <div className="grid gap-2">
                  <Label htmlFor="location">מיקום</Label>
                  <Input
                    id="location"
                    value={newMeeting.location}
                    onChange={(e) =>
                      setNewMeeting({ ...newMeeting, location: e.target.value })
                    }
                    placeholder="כתובת או שם המקום"
                  />
                </div>
              )}
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setDialogOpen(false)}>
                ביטול
              </Button>
              <Button onClick={handleCreateMeeting} disabled={saving}>
                {saving ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  "צור פגישה"
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
            placeholder="חיפוש לפי שם לקוח..."
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
            <SelectItem value="scheduled">מתוכנן</SelectItem>
            <SelectItem value="completed">הושלם</SelectItem>
            <SelectItem value="cancelled">בוטל</SelectItem>
            <SelectItem value="no_show">לא הגיע</SelectItem>
          </SelectContent>
        </Select>

        <Select value={typeFilter} onValueChange={setTypeFilter}>
          <SelectTrigger className="w-[150px]">
            <Filter className="h-4 w-4 ml-2" />
            <SelectValue placeholder="סוג" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">כל הסוגים</SelectItem>
            <SelectItem value="phone">טלפוני</SelectItem>
            <SelectItem value="in_person">פרונטלי</SelectItem>
            <SelectItem value="video">וידאו</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Meetings List */}
      {sortedDates.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Calendar className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium">אין פגישות</h3>
            <p className="text-muted-foreground">לא נמצאו פגישות התואמות לחיפוש</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-6">
          {sortedDates.map((dateKey) => {
            const dateMeetings = groupedMeetings[dateKey];
            const dateLabel = isToday(dateKey) ? "היום" : formatDate(dateKey);

            return (
              <div key={dateKey}>
                <h2 className="text-lg font-semibold mb-3 flex items-center gap-2">
                  <Calendar className="h-5 w-5" />
                  {dateLabel}
                  <Badge variant="secondary">{dateMeetings.length} פגישות</Badge>
                </h2>

                <div className="space-y-3">
                  {dateMeetings
                    .sort((a, b) => new Date(a.scheduled_at).getTime() - new Date(b.scheduled_at).getTime())
                    .map((meeting) => {
                      const TypeIcon = meetingTypeIcons[meeting.type] || Phone;

                      return (
                        <Card key={meeting.id} className="hover:shadow-md transition-shadow">
                          <CardContent className="p-4">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-4">
                                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-brand-blue/10">
                                  <TypeIcon className="h-6 w-6 text-brand-blue" />
                                </div>

                                <div>
                                  <Link
                                    href={`/customers/${meeting.customer_id}`}
                                    className="font-medium hover:text-brand-blue transition-colors"
                                  >
                                    {meeting.customers?.first_name} {meeting.customers?.last_name}
                                  </Link>
                                  <div className="flex items-center gap-3 text-sm text-muted-foreground">
                                    <span className="flex items-center gap-1">
                                      <Clock className="h-3 w-3" />
                                      {formatTime(meeting.scheduled_at)}
                                    </span>
                                    <span>•</span>
                                    <span>{meeting.duration_minutes} דקות</span>
                                    <span>•</span>
                                    <span>{meetingTypeLabels[meeting.type]}</span>
                                    {meeting.location && (
                                      <>
                                        <span>•</span>
                                        <span className="flex items-center gap-1">
                                          <MapPin className="h-3 w-3" />
                                          {meeting.location}
                                        </span>
                                      </>
                                    )}
                                  </div>
                                </div>
                              </div>

                              <div className="flex items-center gap-2">
                                <Badge
                                  variant="secondary"
                                  className={`${meetingStatusColors[meeting.status]} text-white`}
                                >
                                  {meetingStatusLabels[meeting.status]}
                                </Badge>

                                {meeting.status === "scheduled" && (
                                  <div className="flex gap-1">
                                    <Button
                                      variant="ghost"
                                      size="icon"
                                      className="h-8 w-8 text-green-600 hover:text-green-700 hover:bg-green-50"
                                      onClick={() => handleUpdateStatus(meeting.id, "completed")}
                                      title="סמן כהושלם"
                                    >
                                      <CheckCircle className="h-4 w-4" />
                                    </Button>
                                    <Button
                                      variant="ghost"
                                      size="icon"
                                      className="h-8 w-8 text-red-600 hover:text-red-700 hover:bg-red-50"
                                      onClick={() => handleUpdateStatus(meeting.id, "no_show")}
                                      title="לא הגיע"
                                    >
                                      <AlertCircle className="h-4 w-4" />
                                    </Button>
                                    <Button
                                      variant="ghost"
                                      size="icon"
                                      className="h-8 w-8 text-gray-600 hover:text-gray-700 hover:bg-gray-50"
                                      onClick={() => handleUpdateStatus(meeting.id, "cancelled")}
                                      title="בטל פגישה"
                                    >
                                      <XCircle className="h-4 w-4" />
                                    </Button>
                                  </div>
                                )}
                              </div>
                            </div>

                            {meeting.summary && (
                              <div className="mt-3 pt-3 border-t">
                                <p className="text-sm text-muted-foreground">{meeting.summary}</p>
                              </div>
                            )}
                          </CardContent>
                        </Card>
                      );
                    })}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
