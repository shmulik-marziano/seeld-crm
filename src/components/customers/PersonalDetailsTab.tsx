"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Edit, Save, X } from "lucide-react";
import { toast } from "sonner";
import {
  Customer,
  idTypeLabels,
  genderLabels,
  maritalStatusLabels,
} from "@/types/database";

interface PersonalDetailsTabProps {
  customer: Customer;
  onUpdate: (customer: Customer) => void;
}

export default function PersonalDetailsTab({
  customer,
  onUpdate,
}: PersonalDetailsTabProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState<Partial<Customer>>(customer);
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    setSaving(true);
    try {
      const response = await fetch(`/api/customers/${customer.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        const result = await response.json();
        onUpdate(result.data);
        setIsEditing(false);
        toast.success("הפרטים נשמרו בהצלחה");
      } else {
        toast.error("שגיאה בשמירת הפרטים");
      }
    } catch {
      toast.error("שגיאה בשמירת הפרטים");
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    setFormData(customer);
    setIsEditing(false);
  };

  const formatDate = (dateStr: string | null | undefined) => {
    if (!dateStr) return "";
    return new Date(dateStr).toISOString().split("T")[0];
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>פרטים אישיים</CardTitle>
        {!isEditing ? (
          <Button variant="outline" size="sm" onClick={() => setIsEditing(true)}>
            <Edit className="h-4 w-4 ml-2" />
            עריכה
          </Button>
        ) : (
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={handleCancel}>
              <X className="h-4 w-4 ml-2" />
              ביטול
            </Button>
            <Button
              size="sm"
              onClick={handleSave}
              disabled={saving}
              className="bg-brand-blue hover:bg-brand-blue/90"
            >
              <Save className="h-4 w-4 ml-2" />
              שמירה
            </Button>
          </div>
        )}
      </CardHeader>
      <CardContent className="space-y-6">
        {/* פרטי זיהוי */}
        <div>
          <h3 className="font-semibold mb-4">פרטי זיהוי</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label>שם פרטי</Label>
              {isEditing ? (
                <Input
                  value={formData.first_name || ""}
                  onChange={(e) =>
                    setFormData({ ...formData, first_name: e.target.value })
                  }
                />
              ) : (
                <p className="text-sm">{customer.first_name}</p>
              )}
            </div>
            <div className="space-y-2">
              <Label>שם משפחה</Label>
              {isEditing ? (
                <Input
                  value={formData.last_name || ""}
                  onChange={(e) =>
                    setFormData({ ...formData, last_name: e.target.value })
                  }
                />
              ) : (
                <p className="text-sm">{customer.last_name}</p>
              )}
            </div>
            <div className="space-y-2">
              <Label>סוג תעודה</Label>
              {isEditing ? (
                <Select
                  value={formData.id_type || "id_card"}
                  onValueChange={(value) =>
                    setFormData({ ...formData, id_type: value as "id_card" | "passport" })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.entries(idTypeLabels).map(([key, label]) => (
                      <SelectItem key={key} value={key}>
                        {label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              ) : (
                <p className="text-sm">
                  {idTypeLabels[customer.id_type || "id_card"]}
                </p>
              )}
            </div>
            <div className="space-y-2">
              <Label>מספר ת.ז./דרכון</Label>
              {isEditing ? (
                <Input
                  value={formData.id_number || ""}
                  onChange={(e) =>
                    setFormData({ ...formData, id_number: e.target.value })
                  }
                  dir="ltr"
                />
              ) : (
                <p className="text-sm" dir="ltr">
                  {customer.id_number}
                </p>
              )}
            </div>
            <div className="space-y-2">
              <Label>תאריך הנפקה</Label>
              {isEditing ? (
                <Input
                  type="date"
                  value={formatDate(formData.id_issue_date)}
                  onChange={(e) =>
                    setFormData({ ...formData, id_issue_date: e.target.value })
                  }
                />
              ) : (
                <p className="text-sm">
                  {customer.id_issue_date
                    ? new Date(customer.id_issue_date).toLocaleDateString("he-IL")
                    : "-"}
                </p>
              )}
            </div>
            <div className="space-y-2">
              <Label>תאריך לידה</Label>
              {isEditing ? (
                <Input
                  type="date"
                  value={formatDate(formData.birth_date)}
                  onChange={(e) =>
                    setFormData({ ...formData, birth_date: e.target.value })
                  }
                />
              ) : (
                <p className="text-sm">
                  {customer.birth_date
                    ? new Date(customer.birth_date).toLocaleDateString("he-IL")
                    : "-"}
                </p>
              )}
            </div>
            <div className="space-y-2">
              <Label>מין</Label>
              {isEditing ? (
                <Select
                  value={formData.gender || ""}
                  onValueChange={(value) =>
                    setFormData({ ...formData, gender: value })
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
              ) : (
                <p className="text-sm">
                  {customer.gender ? genderLabels[customer.gender] : "-"}
                </p>
              )}
            </div>
            <div className="space-y-2">
              <Label>מצב משפחתי</Label>
              {isEditing ? (
                <Select
                  value={formData.marital_status || ""}
                  onValueChange={(value) =>
                    setFormData({ ...formData, marital_status: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="בחר" />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.entries(maritalStatusLabels).map(([key, label]) => (
                      <SelectItem key={key} value={key}>
                        {label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              ) : (
                <p className="text-sm">
                  {customer.marital_status
                    ? maritalStatusLabels[customer.marital_status]
                    : "-"}
                </p>
              )}
            </div>
          </div>
        </div>

        <Separator />

        {/* פרטי התקשרות */}
        <div>
          <h3 className="font-semibold mb-4">פרטי התקשרות</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label>טלפון נייד</Label>
              {isEditing ? (
                <Input
                  value={formData.mobile || ""}
                  onChange={(e) =>
                    setFormData({ ...formData, mobile: e.target.value })
                  }
                  dir="ltr"
                />
              ) : (
                <p className="text-sm" dir="ltr">
                  {customer.mobile || "-"}
                </p>
              )}
            </div>
            <div className="space-y-2">
              <Label>טלפון קווי</Label>
              {isEditing ? (
                <Input
                  value={formData.phone || ""}
                  onChange={(e) =>
                    setFormData({ ...formData, phone: e.target.value })
                  }
                  dir="ltr"
                />
              ) : (
                <p className="text-sm" dir="ltr">
                  {customer.phone || "-"}
                </p>
              )}
            </div>
            <div className="space-y-2">
              <Label>דוא&quot;ל</Label>
              {isEditing ? (
                <Input
                  type="email"
                  value={formData.email || ""}
                  onChange={(e) =>
                    setFormData({ ...formData, email: e.target.value })
                  }
                  dir="ltr"
                />
              ) : (
                <p className="text-sm" dir="ltr">
                  {customer.email || "-"}
                </p>
              )}
            </div>
          </div>
        </div>

        <Separator />

        {/* כתובת */}
        <div>
          <h3 className="font-semibold mb-4">כתובת</h3>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="space-y-2">
              <Label>עיר</Label>
              {isEditing ? (
                <Input
                  value={formData.address_city || ""}
                  onChange={(e) =>
                    setFormData({ ...formData, address_city: e.target.value })
                  }
                />
              ) : (
                <p className="text-sm">{customer.address_city || "-"}</p>
              )}
            </div>
            <div className="space-y-2">
              <Label>רחוב</Label>
              {isEditing ? (
                <Input
                  value={formData.address_street || ""}
                  onChange={(e) =>
                    setFormData({ ...formData, address_street: e.target.value })
                  }
                />
              ) : (
                <p className="text-sm">{customer.address_street || "-"}</p>
              )}
            </div>
            <div className="space-y-2">
              <Label>מספר בית</Label>
              {isEditing ? (
                <Input
                  value={formData.address_number || ""}
                  onChange={(e) =>
                    setFormData({ ...formData, address_number: e.target.value })
                  }
                />
              ) : (
                <p className="text-sm">{customer.address_number || "-"}</p>
              )}
            </div>
            <div className="space-y-2">
              <Label>דירה</Label>
              {isEditing ? (
                <Input
                  value={formData.address_apartment || ""}
                  onChange={(e) =>
                    setFormData({ ...formData, address_apartment: e.target.value })
                  }
                />
              ) : (
                <p className="text-sm">{customer.address_apartment || "-"}</p>
              )}
            </div>
            <div className="space-y-2">
              <Label>מיקוד</Label>
              {isEditing ? (
                <Input
                  value={formData.postal_code || ""}
                  onChange={(e) =>
                    setFormData({ ...formData, postal_code: e.target.value })
                  }
                  dir="ltr"
                />
              ) : (
                <p className="text-sm" dir="ltr">
                  {customer.postal_code || "-"}
                </p>
              )}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
