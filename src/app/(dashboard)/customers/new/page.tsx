"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";
import { ArrowRight, Loader2, Star } from "lucide-react";
import Link from "next/link";

export default function NewCustomerPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [qualityScore, setQualityScore] = useState(3);
  const [gender, setGender] = useState("");
  const [maritalStatus, setMaritalStatus] = useState("");

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);

    const formData = new FormData(e.currentTarget);

    const customerData = {
      first_name: formData.get("first_name") as string,
      last_name: formData.get("last_name") as string,
      id_number: formData.get("id_number") as string,
      birth_date: formData.get("birth_date") || null,
      gender: gender || null,
      marital_status: maritalStatus || null,
      mobile: formData.get("mobile") as string,
      phone: formData.get("phone") || null,
      email: formData.get("email") || null,
      address_city: formData.get("address_city") || null,
      address_street: formData.get("address_street") || null,
      address_number: formData.get("address_number") || null,
      quality_score: qualityScore,
      is_confidential: formData.get("is_confidential") === "on",
    };

    try {
      const response = await fetch("/api/customers", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(customerData),
      });

      const result = await response.json();

      if (!response.ok) {
        toast.error("שגיאה בהוספת לקוח", {
          description: result.error || "אנא נסה שוב",
        });
        return;
      }

      toast.success("הלקוח נוסף בהצלחה!");
      router.push(`/customers/${result.data.id}`);
    } catch {
      toast.error("שגיאה בהוספת לקוח");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center gap-4">
        <Link href="/customers">
          <Button variant="ghost" size="icon">
            <ArrowRight className="h-5 w-5" />
          </Button>
        </Link>
        <div>
          <h1 className="text-3xl font-bold">לקוח חדש</h1>
          <p className="text-muted-foreground">הוספת לקוח חדש למערכת</p>
        </div>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="grid gap-6 lg:grid-cols-2">
          {/* Personal Details */}
          <Card>
            <CardHeader>
              <CardTitle>פרטים אישיים</CardTitle>
              <CardDescription>מידע בסיסי על הלקוח</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="first_name">שם פרטי *</Label>
                  <Input id="first_name" name="first_name" required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="last_name">שם משפחה *</Label>
                  <Input id="last_name" name="last_name" required />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="id_number">תעודת זהות *</Label>
                <Input
                  id="id_number"
                  name="id_number"
                  required
                  maxLength={9}
                  dir="ltr"
                  className="text-left"
                />
                <p className="text-xs text-muted-foreground">
                  תעודת הזהות משמשת גם כסיסמה למסמכים
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="birth_date">תאריך לידה</Label>
                <Input id="birth_date" name="birth_date" type="date" dir="ltr" />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="gender">מין</Label>
                  <Select value={gender} onValueChange={setGender}>
                    <SelectTrigger>
                      <SelectValue placeholder="בחר..." />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="male">זכר</SelectItem>
                      <SelectItem value="female">נקבה</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="marital_status">מצב משפחתי</Label>
                  <Select value={maritalStatus} onValueChange={setMaritalStatus}>
                    <SelectTrigger>
                      <SelectValue placeholder="בחר..." />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="single">רווק/ה</SelectItem>
                      <SelectItem value="married">נשוי/אה</SelectItem>
                      <SelectItem value="divorced">גרוש/ה</SelectItem>
                      <SelectItem value="widowed">אלמן/ה</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Contact Details */}
          <Card>
            <CardHeader>
              <CardTitle>פרטי התקשרות</CardTitle>
              <CardDescription>דרכי יצירת קשר עם הלקוח</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="mobile">טלפון נייד *</Label>
                <Input
                  id="mobile"
                  name="mobile"
                  type="tel"
                  required
                  dir="ltr"
                  className="text-left"
                  placeholder="050-0000000"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="phone">טלפון נוסף</Label>
                <Input
                  id="phone"
                  name="phone"
                  type="tel"
                  dir="ltr"
                  className="text-left"
                  placeholder="03-0000000"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">אימייל</Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  dir="ltr"
                  className="text-left"
                  placeholder="example@email.com"
                />
              </div>

              <Separator />

              <div className="space-y-2">
                <Label htmlFor="address_city">עיר</Label>
                <Input id="address_city" name="address_city" />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="address_street">רחוב</Label>
                  <Input id="address_street" name="address_street" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="address_number">מספר</Label>
                  <Input id="address_number" name="address_number" />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Additional Info */}
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle>מידע נוסף</CardTitle>
              <CardDescription>הגדרות ודירוג הלקוח</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-8">
                <div className="space-y-2">
                  <Label>ציון איכות לקוח</Label>
                  <div className="flex gap-1">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        type="button"
                        onClick={() => setQualityScore(star)}
                        className="focus:outline-none"
                      >
                        <Star
                          className={`h-8 w-8 transition-colors ${
                            star <= qualityScore
                              ? "fill-yellow-400 text-yellow-400"
                              : "text-gray-300 hover:text-yellow-200"
                          }`}
                        />
                      </button>
                    ))}
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="is_confidential"
                    name="is_confidential"
                    className="h-4 w-4 rounded border-gray-300"
                  />
                  <Label htmlFor="is_confidential" className="cursor-pointer">
                    לקוח חסוי (הסתרת פרטים)
                  </Label>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Submit Button */}
        <div className="flex justify-end gap-4 mt-6">
          <Link href="/customers">
            <Button type="button" variant="outline">
              ביטול
            </Button>
          </Link>
          <Button
            type="submit"
            className="bg-brand-blue hover:bg-brand-blue/90"
            disabled={loading}
          >
            {loading ? (
              <>
                <Loader2 className="ml-2 h-4 w-4 animate-spin" />
                שומר...
              </>
            ) : (
              "שמור לקוח"
            )}
          </Button>
        </div>
      </form>
    </div>
  );
}
