import { useState, useEffect } from "react";
import { Save, Loader2, Calendar } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";

interface Client {
  id: string;
  full_name: string;
  first_name?: string;
  last_name?: string;
  phone: string;
  email?: string;
  id_number?: string;
  id_type?: string;
  date_of_birth?: string;
  gender?: string;
  marital_status?: string;
  is_smoker?: boolean;
  employment_status?: string;
  monthly_income?: number;
  meeting_date?: string;
  occupation?: string;
}

interface Props {
  client: Client;
  onSave: (updates: Partial<Client>) => Promise<void>;
  isSaving: boolean;
}

const PersonalDetailsTab = ({ client, onSave, isSaving }: Props) => {
  const [formData, setFormData] = useState({
    first_name: client.first_name || '',
    last_name: client.last_name || '',
    id_type: client.id_type || 'id_card',
    id_number: client.id_number || '',
    date_of_birth: client.date_of_birth || '',
    gender: client.gender || '',
    marital_status: client.marital_status || '',
    is_smoker: client.is_smoker || false,
    employment_status: client.employment_status || '',
    monthly_income: client.monthly_income?.toString() || '',
    phone: client.phone || '',
    email: client.email || '',
    meeting_date: client.meeting_date || '',
    occupation: client.occupation || '',
  });

  const calculateAge = (birthDate: string): number | null => {
    if (!birthDate) return null;
    const today = new Date();
    const birth = new Date(birthDate);
    let age = today.getFullYear() - birth.getFullYear();
    const monthDiff = today.getMonth() - birth.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
      age--;
    }
    return age;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const updates = {
      ...formData,
      full_name: `${formData.first_name} ${formData.last_name}`.trim(),
      monthly_income: formData.monthly_income ? parseFloat(formData.monthly_income) : null,
    };
    await onSave(updates);
  };

  const age = calculateAge(formData.date_of_birth);

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Meeting Date */}
        <div className="space-y-2">
          <Label htmlFor="meeting_date">תאריך פגישה</Label>
          <Input
            id="meeting_date"
            type="date"
            value={formData.meeting_date}
            onChange={(e) => setFormData({ ...formData, meeting_date: e.target.value })}
          />
        </div>

        <div></div>

        {/* First Name */}
        <div className="space-y-2">
          <Label htmlFor="first_name">שם פרטי</Label>
          <Input
            id="first_name"
            value={formData.first_name}
            onChange={(e) => setFormData({ ...formData, first_name: e.target.value })}
            placeholder="שם פרטי"
          />
        </div>

        {/* Last Name */}
        <div className="space-y-2">
          <Label htmlFor="last_name">שם משפחה</Label>
          <Input
            id="last_name"
            value={formData.last_name}
            onChange={(e) => setFormData({ ...formData, last_name: e.target.value })}
            placeholder="שם משפחה"
          />
        </div>

        {/* ID Type */}
        <div className="space-y-2">
          <Label htmlFor="id_type">סוג מזהה</Label>
          <Select
            value={formData.id_type}
            onValueChange={(value) => setFormData({ ...formData, id_type: value })}
          >
            <SelectTrigger>
              <SelectValue placeholder="בחר סוג" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="id_card">תעודת זהות</SelectItem>
              <SelectItem value="passport">דרכון</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* ID Number */}
        <div className="space-y-2">
          <Label htmlFor="id_number">מספר מזהה</Label>
          <Input
            id="id_number"
            value={formData.id_number}
            onChange={(e) => setFormData({ ...formData, id_number: e.target.value })}
            placeholder="מספר ת.ז / דרכון"
          />
        </div>

        {/* Date of Birth */}
        <div className="space-y-2">
          <Label htmlFor="date_of_birth">תאריך לידה</Label>
          <Input
            id="date_of_birth"
            type="date"
            value={formData.date_of_birth}
            onChange={(e) => setFormData({ ...formData, date_of_birth: e.target.value })}
          />
        </div>

        {/* Age (calculated) */}
        <div className="space-y-2">
          <Label>גיל</Label>
          <div className="h-10 px-3 py-2 border rounded-md bg-muted text-muted-foreground">
            {age !== null ? age : '-'}
          </div>
        </div>

        {/* Gender */}
        <div className="space-y-2">
          <Label htmlFor="gender">מין</Label>
          <Select
            value={formData.gender}
            onValueChange={(value) => setFormData({ ...formData, gender: value })}
          >
            <SelectTrigger>
              <SelectValue placeholder="בחר מין" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="male">זכר</SelectItem>
              <SelectItem value="female">נקבה</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Marital Status */}
        <div className="space-y-2">
          <Label htmlFor="marital_status">מצב משפחתי</Label>
          <Select
            value={formData.marital_status}
            onValueChange={(value) => setFormData({ ...formData, marital_status: value })}
          >
            <SelectTrigger>
              <SelectValue placeholder="בחר מצב" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="single">רווק/ה</SelectItem>
              <SelectItem value="married">נשוי/אה</SelectItem>
              <SelectItem value="divorced">גרוש/ה</SelectItem>
              <SelectItem value="widowed">אלמן/ה</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Smoker */}
        <div className="space-y-2">
          <Label htmlFor="is_smoker">מעשן</Label>
          <div className="flex items-center gap-2 h-10">
            <Switch
              id="is_smoker"
              checked={formData.is_smoker}
              onCheckedChange={(checked) => setFormData({ ...formData, is_smoker: checked })}
            />
            <span className="text-sm text-muted-foreground">
              {formData.is_smoker ? 'כן' : 'לא'}
            </span>
          </div>
        </div>

        {/* Employment Status */}
        <div className="space-y-2">
          <Label htmlFor="employment_status">מעמד</Label>
          <Select
            value={formData.employment_status}
            onValueChange={(value) => setFormData({ ...formData, employment_status: value })}
          >
            <SelectTrigger>
              <SelectValue placeholder="בחר מעמד" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="employee">שכיר</SelectItem>
              <SelectItem value="self_employed">עצמאי</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Monthly Income */}
        <div className="space-y-2">
          <Label htmlFor="monthly_income">שכר/הכנסה חודשית</Label>
          <Input
            id="monthly_income"
            type="number"
            value={formData.monthly_income}
            onChange={(e) => setFormData({ ...formData, monthly_income: e.target.value })}
            placeholder="הכנסה בש״ח"
          />
        </div>

        {/* Phone */}
        <div className="space-y-2">
          <Label htmlFor="phone">טלפון נייד</Label>
          <Input
            id="phone"
            type="tel"
            value={formData.phone}
            onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
            placeholder="050-0000000"
          />
        </div>

        {/* Email */}
        <div className="space-y-2">
          <Label htmlFor="email">דוא״ל</Label>
          <Input
            id="email"
            type="email"
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            placeholder="email@example.com"
          />
        </div>

        {/* Occupation */}
        <div className="space-y-2 md:col-span-2">
          <Label htmlFor="occupation">עיסוקים</Label>
          <Input
            id="occupation"
            value={formData.occupation}
            onChange={(e) => setFormData({ ...formData, occupation: e.target.value })}
            placeholder="תיאור עיסוק"
          />
        </div>
      </div>

      <div className="flex justify-end">
        <Button type="submit" disabled={isSaving}>
          {isSaving ? (
            <>
              <Loader2 className="h-4 w-4 ml-2 animate-spin" />
              שומר...
            </>
          ) : (
            <>
              <Save className="h-4 w-4 ml-2" />
              שמור
            </>
          )}
        </Button>
      </div>
    </form>
  );
};

export default PersonalDetailsTab;
