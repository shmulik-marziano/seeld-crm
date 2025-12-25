"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Plus, Edit, Trash2, Users } from "lucide-react";
import { toast } from "sonner";
import {
  FamilyMember,
  RelationshipType,
  relationshipTypeLabels,
  genderLabels,
  employmentStatusLabels,
} from "@/types/database";

interface FamilyMembersTabProps {
  customerId: string;
  familyMembers: FamilyMember[];
  onUpdate: (members: FamilyMember[]) => void;
}

const emptyMember: Partial<FamilyMember> = {
  relationship: "spouse",
  first_name: "",
  last_name: "",
  id_number: "",
  birth_date: "",
  gender: "",
  phone: "",
  email: "",
};

export default function FamilyMembersTab({
  customerId,
  familyMembers,
  onUpdate,
}: FamilyMembersTabProps) {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingMember, setEditingMember] = useState<Partial<FamilyMember> | null>(null);
  const [saving, setSaving] = useState(false);

  const spouseMember = familyMembers.find((m) => m.relationship === "spouse");
  const otherMembers = familyMembers.filter((m) => m.relationship !== "spouse");

  const handleSave = async () => {
    if (!editingMember?.first_name) {
      toast.error("יש להזין שם פרטי");
      return;
    }

    setSaving(true);
    try {
      const isNew = !editingMember.id;
      const url = isNew
        ? `/api/customers/${customerId}/family-members`
        : `/api/customers/${customerId}/family-members`;

      const response = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(editingMember),
      });

      if (response.ok) {
        const result = await response.json();
        if (isNew) {
          onUpdate([...familyMembers, result.data]);
        } else {
          onUpdate(
            familyMembers.map((m) =>
              m.id === editingMember.id ? result.data : m
            )
          );
        }
        setDialogOpen(false);
        setEditingMember(null);
        toast.success("בן משפחה נשמר בהצלחה");
      } else {
        toast.error("שגיאה בשמירת בן משפחה");
      }
    } catch {
      toast.error("שגיאה בשמירת בן משפחה");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("האם למחוק את בן המשפחה?")) return;

    try {
      const response = await fetch(`/api/customers/${customerId}/family-members`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id }),
      });

      if (response.ok) {
        onUpdate(familyMembers.filter((m) => m.id !== id));
        toast.success("בן משפחה נמחק");
      }
    } catch {
      toast.error("שגיאה במחיקה");
    }
  };

  const openDialog = (member?: FamilyMember | Partial<FamilyMember>) => {
    setEditingMember(member || { ...emptyMember });
    setDialogOpen(true);
  };

  const formatDate = (dateStr: string | null | undefined) => {
    if (!dateStr) return "-";
    return new Date(dateStr).toLocaleDateString("he-IL");
  };

  return (
    <div className="space-y-6">
      {/* Spouse Section */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            בן/בת זוג
          </CardTitle>
          {!spouseMember && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => openDialog({ ...emptyMember, relationship: "spouse" })}
            >
              <Plus className="h-4 w-4 ml-2" />
              הוסף בן/בת זוג
            </Button>
          )}
        </CardHeader>
        <CardContent>
          {spouseMember ? (
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">שם מלא</p>
                  <p className="font-medium">
                    {spouseMember.first_name} {spouseMember.last_name || ""}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">ת.ז.</p>
                  <p className="font-medium" dir="ltr">
                    {spouseMember.id_number || "-"}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">תאריך לידה</p>
                  <p className="font-medium">{formatDate(spouseMember.birth_date)}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">טלפון</p>
                  <p className="font-medium" dir="ltr">
                    {spouseMember.phone || "-"}
                  </p>
                </div>
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => openDialog(spouseMember)}
                >
                  <Edit className="h-4 w-4 ml-2" />
                  עריכה
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="text-red-600"
                  onClick={() => handleDelete(spouseMember.id)}
                >
                  <Trash2 className="h-4 w-4 ml-2" />
                  מחיקה
                </Button>
              </div>
            </div>
          ) : (
            <p className="text-muted-foreground text-center py-4">
              לא הוזן בן/בת זוג
            </p>
          )}
        </CardContent>
      </Card>

      {/* Other Family Members */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>בני משפחה נוספים</CardTitle>
          <Button variant="outline" size="sm" onClick={() => openDialog()}>
            <Plus className="h-4 w-4 ml-2" />
            הוסף בן משפחה
          </Button>
        </CardHeader>
        <CardContent>
          {otherMembers.length === 0 ? (
            <p className="text-muted-foreground text-center py-4">
              לא הוזנו בני משפחה נוספים
            </p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>קרבה</TableHead>
                  <TableHead>שם</TableHead>
                  <TableHead>ת.ז.</TableHead>
                  <TableHead>תאריך לידה</TableHead>
                  <TableHead>טלפון</TableHead>
                  <TableHead></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {otherMembers.map((member) => (
                  <TableRow key={member.id}>
                    <TableCell>
                      <Badge variant="outline">
                        {relationshipTypeLabels[member.relationship]}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {member.first_name} {member.last_name || ""}
                    </TableCell>
                    <TableCell dir="ltr">{member.id_number || "-"}</TableCell>
                    <TableCell>{formatDate(member.birth_date)}</TableCell>
                    <TableCell dir="ltr">{member.phone || "-"}</TableCell>
                    <TableCell>
                      <div className="flex gap-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => openDialog(member)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="text-red-600"
                          onClick={() => handleDelete(member.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Edit Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>
              {editingMember?.id ? "עריכת בן משפחה" : "הוספת בן משפחה"}
            </DialogTitle>
            <DialogDescription>מלא את פרטי בן המשפחה</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>קרבה</Label>
                <Select
                  value={editingMember?.relationship || "spouse"}
                  onValueChange={(value) =>
                    setEditingMember({
                      ...editingMember,
                      relationship: value as RelationshipType,
                    })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.entries(relationshipTypeLabels).map(([key, label]) => (
                      <SelectItem key={key} value={key}>
                        {label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>מין</Label>
                <Select
                  value={editingMember?.gender || ""}
                  onValueChange={(value) =>
                    setEditingMember({ ...editingMember, gender: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="בחר" />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.entries(genderLabels).map(([key, label]) => (
                      <SelectItem key={key} value={key}>
                        {label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>שם פרטי *</Label>
                <Input
                  value={editingMember?.first_name || ""}
                  onChange={(e) =>
                    setEditingMember({
                      ...editingMember,
                      first_name: e.target.value,
                    })
                  }
                />
              </div>
              <div className="space-y-2">
                <Label>שם משפחה</Label>
                <Input
                  value={editingMember?.last_name || ""}
                  onChange={(e) =>
                    setEditingMember({
                      ...editingMember,
                      last_name: e.target.value,
                    })
                  }
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>ת.ז.</Label>
                <Input
                  value={editingMember?.id_number || ""}
                  onChange={(e) =>
                    setEditingMember({
                      ...editingMember,
                      id_number: e.target.value,
                    })
                  }
                  dir="ltr"
                />
              </div>
              <div className="space-y-2">
                <Label>תאריך לידה</Label>
                <Input
                  type="date"
                  value={editingMember?.birth_date || ""}
                  onChange={(e) =>
                    setEditingMember({
                      ...editingMember,
                      birth_date: e.target.value,
                    })
                  }
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>טלפון</Label>
                <Input
                  value={editingMember?.phone || ""}
                  onChange={(e) =>
                    setEditingMember({
                      ...editingMember,
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
                  value={editingMember?.email || ""}
                  onChange={(e) =>
                    setEditingMember({
                      ...editingMember,
                      email: e.target.value,
                    })
                  }
                  dir="ltr"
                />
              </div>
            </div>
            {editingMember?.relationship !== "spouse" && (
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>מצב תעסוקה</Label>
                  <Select
                    value={editingMember?.employment_status || ""}
                    onValueChange={(value) =>
                      setEditingMember({
                        ...editingMember,
                        employment_status: value as FamilyMember["employment_status"],
                      })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="בחר" />
                    </SelectTrigger>
                    <SelectContent>
                      {Object.entries(employmentStatusLabels).map(([key, label]) => (
                        <SelectItem key={key} value={key}>
                          {label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>הכנסה חודשית</Label>
                  <Input
                    type="number"
                    value={editingMember?.monthly_income || ""}
                    onChange={(e) =>
                      setEditingMember({
                        ...editingMember,
                        monthly_income: e.target.value
                          ? parseFloat(e.target.value)
                          : undefined,
                      })
                    }
                    dir="ltr"
                  />
                </div>
              </div>
            )}
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
