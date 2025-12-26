"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Plus, Edit, Trash2, Building2, Phone, Mail, MapPin } from "lucide-react";
import { toast } from "sonner";
import { Employer } from "@/types/database";

interface EmployersTabProps {
  customerId: string;
  employers: Employer[];
  onUpdate: (employers: Employer[]) => void;
}

const emptyEmployer: Partial<Employer> = {
  company_name: "",
  company_number: "",
  position: "",
  is_current: true,
  start_date: "",
  end_date: "",
  address_city: "",
  address_street: "",
  address_number: "",
  postal_code: "",
  phone: "",
  email: "",
};

export default function EmployersTab({
  customerId,
  employers,
  onUpdate,
}: EmployersTabProps) {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingEmployer, setEditingEmployer] = useState<Partial<Employer> | null>(null);
  const [saving, setSaving] = useState(false);

  const currentEmployer = employers.find((e) => e.is_current);
  const previousEmployers = employers.filter((e) => !e.is_current);

  const handleSave = async () => {
    if (!editingEmployer?.company_name) {
      toast.error("יש להזין שם חברה");
      return;
    }

    setSaving(true);
    try {
      const response = await fetch(`/api/customers/${customerId}/employers`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(editingEmployer),
      });

      if (response.ok) {
        const result = await response.json();
        const isNew = !editingEmployer.id;
        if (isNew) {
          onUpdate([...employers, result.data]);
        } else {
          onUpdate(
            employers.map((e) =>
              e.id === editingEmployer.id ? result.data : e
            )
          );
        }
        setDialogOpen(false);
        setEditingEmployer(null);
        toast.success("מעסיק נשמר בהצלחה");
      } else {
        toast.error("שגיאה בשמירת מעסיק");
      }
    } catch {
      toast.error("שגיאה בשמירת מעסיק");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("האם למחוק את המעסיק?")) return;

    try {
      const response = await fetch(`/api/customers/${customerId}/employers`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id }),
      });

      if (response.ok) {
        onUpdate(employers.filter((e) => e.id !== id));
        toast.success("מעסיק נמחק");
      }
    } catch {
      toast.error("שגיאה במחיקה");
    }
  };

  const openDialog = (employer?: Employer | Partial<Employer>) => {
    setEditingEmployer(employer || { ...emptyEmployer });
    setDialogOpen(true);
  };

  const formatDate = (dateStr: string | null | undefined) => {
    if (!dateStr) return "-";
    return new Date(dateStr).toLocaleDateString("he-IL");
  };

  const EmployerCard = ({ employer }: { employer: Employer }) => (
    <Card>
      <CardContent className="pt-6">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-brand-blue/10">
              <Building2 className="h-6 w-6 text-brand-blue" />
            </div>
            <div>
              <h3 className="font-semibold text-lg">{employer.company_name}</h3>
              {employer.position && (
                <p className="text-sm text-muted-foreground">{employer.position}</p>
              )}
            </div>
          </div>
          <div className="flex items-center gap-2">
            {employer.is_current && (
              <Badge className="bg-brand-green">מעסיק נוכחי</Badge>
            )}
            <Button variant="ghost" size="icon" onClick={() => openDialog(employer)}>
              <Edit className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="text-red-600"
              onClick={() => handleDelete(employer.id)}
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
          {employer.company_number && (
            <div>
              <p className="text-muted-foreground">ח.פ./ע.מ.</p>
              <p dir="ltr">{employer.company_number}</p>
            </div>
          )}
          <div>
            <p className="text-muted-foreground">תקופת העסקה</p>
            <p>
              {formatDate(employer.start_date)} -{" "}
              {employer.is_current ? "עד היום" : formatDate(employer.end_date)}
            </p>
          </div>
          {(employer.address_city || employer.address_street) && (
            <div className="flex items-start gap-2">
              <MapPin className="h-4 w-4 text-muted-foreground mt-0.5" />
              <div>
                <p>
                  {employer.address_street} {employer.address_number}
                  {employer.address_city ? `, ${employer.address_city}` : ""}
                </p>
                {employer.postal_code && (
                  <p className="text-muted-foreground" dir="ltr">
                    {employer.postal_code}
                  </p>
                )}
              </div>
            </div>
          )}
          <div className="space-y-1">
            {employer.phone && (
              <div className="flex items-center gap-2">
                <Phone className="h-4 w-4 text-muted-foreground" />
                <p dir="ltr">{employer.phone}</p>
              </div>
            )}
            {employer.email && (
              <div className="flex items-center gap-2">
                <Mail className="h-4 w-4 text-muted-foreground" />
                <p dir="ltr">{employer.email}</p>
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );

  return (
    <div className="space-y-6">
      {/* Current Employer */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Building2 className="h-5 w-5" />
            מעסיק נוכחי
          </CardTitle>
          {!currentEmployer && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => openDialog({ ...emptyEmployer, is_current: true })}
            >
              <Plus className="h-4 w-4 ml-2" />
              הוסף מעסיק
            </Button>
          )}
        </CardHeader>
        <CardContent>
          {currentEmployer ? (
            <EmployerCard employer={currentEmployer} />
          ) : (
            <p className="text-muted-foreground text-center py-4">
              לא הוזן מעסיק נוכחי
            </p>
          )}
        </CardContent>
      </Card>

      {/* Previous Employers */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>מעסיקים קודמים</CardTitle>
          <Button
            variant="outline"
            size="sm"
            onClick={() => openDialog({ ...emptyEmployer, is_current: false })}
          >
            <Plus className="h-4 w-4 ml-2" />
            הוסף מעסיק קודם
          </Button>
        </CardHeader>
        <CardContent>
          {previousEmployers.length === 0 ? (
            <p className="text-muted-foreground text-center py-4">
              לא הוזנו מעסיקים קודמים
            </p>
          ) : (
            <div className="space-y-4">
              {previousEmployers.map((employer) => (
                <EmployerCard key={employer.id} employer={employer} />
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Edit Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>
              {editingEmployer?.id ? "עריכת מעסיק" : "הוספת מעסיק"}
            </DialogTitle>
            <DialogDescription>מלא את פרטי המעסיק</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 max-h-[60vh] overflow-y-auto">
            <div className="flex items-center gap-2">
              <Switch
                checked={editingEmployer?.is_current || false}
                onCheckedChange={(checked) =>
                  setEditingEmployer({
                    ...editingEmployer,
                    is_current: checked,
                    end_date: checked ? "" : editingEmployer?.end_date,
                  })
                }
              />
              <Label>מעסיק נוכחי</Label>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>שם חברה *</Label>
                <Input
                  value={editingEmployer?.company_name || ""}
                  onChange={(e) =>
                    setEditingEmployer({
                      ...editingEmployer,
                      company_name: e.target.value,
                    })
                  }
                />
              </div>
              <div className="space-y-2">
                <Label>ח.פ./ע.מ.</Label>
                <Input
                  value={editingEmployer?.company_number || ""}
                  onChange={(e) =>
                    setEditingEmployer({
                      ...editingEmployer,
                      company_number: e.target.value,
                    })
                  }
                  dir="ltr"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label>תפקיד</Label>
              <Input
                value={editingEmployer?.position || ""}
                onChange={(e) =>
                  setEditingEmployer({
                    ...editingEmployer,
                    position: e.target.value,
                  })
                }
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>תאריך התחלה</Label>
                <Input
                  type="date"
                  value={editingEmployer?.start_date || ""}
                  onChange={(e) =>
                    setEditingEmployer({
                      ...editingEmployer,
                      start_date: e.target.value,
                    })
                  }
                />
              </div>
              {!editingEmployer?.is_current && (
                <div className="space-y-2">
                  <Label>תאריך סיום</Label>
                  <Input
                    type="date"
                    value={editingEmployer?.end_date || ""}
                    onChange={(e) =>
                      setEditingEmployer({
                        ...editingEmployer,
                        end_date: e.target.value,
                      })
                    }
                  />
                </div>
              )}
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label>עיר</Label>
                <Input
                  value={editingEmployer?.address_city || ""}
                  onChange={(e) =>
                    setEditingEmployer({
                      ...editingEmployer,
                      address_city: e.target.value,
                    })
                  }
                />
              </div>
              <div className="space-y-2">
                <Label>רחוב</Label>
                <Input
                  value={editingEmployer?.address_street || ""}
                  onChange={(e) =>
                    setEditingEmployer({
                      ...editingEmployer,
                      address_street: e.target.value,
                    })
                  }
                />
              </div>
              <div className="space-y-2">
                <Label>מספר</Label>
                <Input
                  value={editingEmployer?.address_number || ""}
                  onChange={(e) =>
                    setEditingEmployer({
                      ...editingEmployer,
                      address_number: e.target.value,
                    })
                  }
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>טלפון</Label>
                <Input
                  value={editingEmployer?.phone || ""}
                  onChange={(e) =>
                    setEditingEmployer({
                      ...editingEmployer,
                      phone: e.target.value,
                    })
                  }
                  dir="ltr"
                />
              </div>
              <div className="space-y-2">
                <Label>דוא&quot;ל</Label>
                <Input
                  type="email"
                  value={editingEmployer?.email || ""}
                  onChange={(e) =>
                    setEditingEmployer({
                      ...editingEmployer,
                      email: e.target.value,
                    })
                  }
                  dir="ltr"
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-4">
              <Button variant="outline" onClick={() => setDialogOpen(false)}>
                ביטול
              </Button>
              <Button
                onClick={handleSave}
                disabled={saving}
                className="bg-brand-blue hover:bg-brand-blue/90"
              >
                שמירה
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
