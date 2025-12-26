"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
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
  employmentStatusLabels,
  healthFundLabels,
} from "@/types/database";

interface AdditionalDetailsTabProps {
  customer: Customer;
  onUpdate: (customer: Customer) => void;
}

export default function AdditionalDetailsTab({
  customer,
  onUpdate,
}: AdditionalDetailsTabProps) {
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

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>פרטים נוספים</CardTitle>
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
        {/* פרטי תעסוקה */}
        <div>
          <h3 className="font-semibold mb-4">פרטי תעסוקה</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label>מצב תעסוקה</Label>
              {isEditing ? (
                <Select
                  value={formData.employment_status || ""}
                  onValueChange={(value) =>
                    setFormData({
                      ...formData,
                      employment_status: value as Customer["employment_status"],
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
              ) : (
                <p className="text-sm">
                  {customer.employment_status
                    ? employmentStatusLabels[customer.employment_status]
                    : "-"}
                </p>
              )}
            </div>
            <div className="space-y-2">
              <Label>עיסוק</Label>
              {isEditing ? (
                <Input
                  value={formData.occupation || ""}
                  onChange={(e) =>
                    setFormData({ ...formData, occupation: e.target.value })
                  }
                />
              ) : (
                <p className="text-sm">{customer.occupation || "-"}</p>
              )}
            </div>
            <div className="space-y-2">
              <Label>הכנסה חודשית</Label>
              {isEditing ? (
                <Input
                  type="number"
                  value={formData.monthly_income || ""}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      monthly_income: e.target.value
                        ? parseFloat(e.target.value)
                        : undefined,
                    })
                  }
                  dir="ltr"
                />
              ) : (
                <p className="text-sm">
                  {customer.monthly_income
                    ? `${customer.monthly_income.toLocaleString()} ₪`
                    : "-"}
                </p>
              )}
            </div>
          </div>
        </div>

        <Separator />

        {/* פרטי בריאות */}
        <div>
          <h3 className="font-semibold mb-4">פרטי בריאות</h3>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="space-y-2">
              <Label>קופת חולים</Label>
              {isEditing ? (
                <Select
                  value={formData.health_fund || ""}
                  onValueChange={(value) =>
                    setFormData({ ...formData, health_fund: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="בחר" />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.entries(healthFundLabels).map(([key, label]) => (
                      <SelectItem key={key} value={key}>
                        {label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              ) : (
                <p className="text-sm">
                  {customer.health_fund
                    ? healthFundLabels[customer.health_fund]
                    : "-"}
                </p>
              )}
            </div>
            <div className="space-y-2">
              <Label>גובה (ס&quot;מ)</Label>
              {isEditing ? (
                <Input
                  type="number"
                  value={formData.height || ""}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      height: e.target.value ? parseInt(e.target.value) : undefined,
                    })
                  }
                  dir="ltr"
                />
              ) : (
                <p className="text-sm">
                  {customer.height ? `${customer.height} ס״מ` : "-"}
                </p>
              )}
            </div>
            <div className="space-y-2">
              <Label>משקל (ק&quot;ג)</Label>
              {isEditing ? (
                <Input
                  type="number"
                  value={formData.weight || ""}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      weight: e.target.value ? parseInt(e.target.value) : undefined,
                    })
                  }
                  dir="ltr"
                />
              ) : (
                <p className="text-sm">
                  {customer.weight ? `${customer.weight} ק״ג` : "-"}
                </p>
              )}
            </div>
            <div className="space-y-2">
              <Label>מעשן/ת</Label>
              {isEditing ? (
                <div className="flex items-center gap-2">
                  <Switch
                    checked={formData.is_smoker || false}
                    onCheckedChange={(checked) =>
                      setFormData({
                        ...formData,
                        is_smoker: checked,
                        cigarettes_per_day: checked ? formData.cigarettes_per_day : 0,
                      })
                    }
                  />
                  {formData.is_smoker && (
                    <Input
                      type="number"
                      placeholder="סיגריות ליום"
                      className="w-32"
                      value={formData.cigarettes_per_day || ""}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          cigarettes_per_day: e.target.value
                            ? parseInt(e.target.value)
                            : undefined,
                        })
                      }
                    />
                  )}
                </div>
              ) : (
                <p className="text-sm">
                  {customer.is_smoker
                    ? `כן (${customer.cigarettes_per_day || 0} ליום)`
                    : "לא"}
                </p>
              )}
            </div>
          </div>
        </div>

        <Separator />

        {/* פרטי תושבות */}
        <div>
          <h3 className="font-semibold mb-4">פרטי תושבות</h3>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="space-y-2">
              <Label>ארץ לידה</Label>
              {isEditing ? (
                <Input
                  value={formData.birth_country || ""}
                  onChange={(e) =>
                    setFormData({ ...formData, birth_country: e.target.value })
                  }
                />
              ) : (
                <p className="text-sm">{customer.birth_country || "-"}</p>
              )}
            </div>
            <div className="space-y-2">
              <Label>אזרח/ית ארה&quot;ב</Label>
              {isEditing ? (
                <Switch
                  checked={formData.is_us_citizen || false}
                  onCheckedChange={(checked) =>
                    setFormData({ ...formData, is_us_citizen: checked })
                  }
                />
              ) : (
                <p className="text-sm">{customer.is_us_citizen ? "כן" : "לא"}</p>
              )}
            </div>
            <div className="space-y-2">
              <Label>תושב/ת ארה&quot;ב</Label>
              {isEditing ? (
                <Switch
                  checked={formData.is_us_resident || false}
                  onCheckedChange={(checked) =>
                    setFormData({ ...formData, is_us_resident: checked })
                  }
                />
              ) : (
                <p className="text-sm">{customer.is_us_resident ? "כן" : "לא"}</p>
              )}
            </div>
            <div className="space-y-2">
              <Label>נולד/ה בארה&quot;ב</Label>
              {isEditing ? (
                <Switch
                  checked={formData.is_us_born || false}
                  onCheckedChange={(checked) =>
                    setFormData({ ...formData, is_us_born: checked })
                  }
                />
              ) : (
                <p className="text-sm">{customer.is_us_born ? "כן" : "לא"}</p>
              )}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
