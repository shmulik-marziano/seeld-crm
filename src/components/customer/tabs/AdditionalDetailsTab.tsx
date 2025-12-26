import { useState } from "react";
import { Save, Loader2, Upload } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";

interface Client {
  id: string;
  city?: string;
  street?: string;
  house_number?: string;
  apartment?: string;
  postal_code?: string;
  po_box?: string;
  phone?: string;
  fax?: string;
  email?: string;
  health_fund?: string;
  supplementary_insurance?: string;
  height?: number;
  weight?: number;
  cigarettes_per_day?: number;
  is_us_citizen?: boolean;
  is_us_resident?: boolean;
  born_in_us?: boolean;
  birth_country?: string;
  id_issue_date?: string;
  id_document_url?: string;
  pdf_accessibility?: boolean;
  dangerous_hobbies?: boolean;
}

interface Props {
  client: Client;
  onSave: (updates: Partial<Client>) => Promise<void>;
  isSaving: boolean;
}

const AdditionalDetailsTab = ({ client, onSave, isSaving }: Props) => {
  const [formData, setFormData] = useState({
    city: client.city || '',
    street: client.street || '',
    house_number: client.house_number || '',
    apartment: client.apartment || '',
    postal_code: client.postal_code || '',
    po_box: client.po_box || '',
    fax: client.fax || '',
    health_fund: client.health_fund || '',
    supplementary_insurance: client.supplementary_insurance || '',
    height: client.height?.toString() || '',
    weight: client.weight?.toString() || '',
    cigarettes_per_day: client.cigarettes_per_day?.toString() || '0',
    is_us_citizen: client.is_us_citizen || false,
    is_us_resident: client.is_us_resident || false,
    born_in_us: client.born_in_us || false,
    birth_country: client.birth_country || '',
    id_issue_date: client.id_issue_date || '',
    pdf_accessibility: client.pdf_accessibility || false,
    dangerous_hobbies: client.dangerous_hobbies || false,
  });

  const calculateBMI = (): string => {
    const height = parseFloat(formData.height);
    const weight = parseFloat(formData.weight);
    if (!height || !weight) return '-';
    const heightInMeters = height / 100;
    const bmi = weight / (heightInMeters * heightInMeters);
    return bmi.toFixed(1);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const updates = {
      ...formData,
      height: formData.height ? parseInt(formData.height) : null,
      weight: formData.weight ? parseInt(formData.weight) : null,
      cigarettes_per_day: formData.cigarettes_per_day ? parseInt(formData.cigarettes_per_day) : 0,
    };
    await onSave(updates);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Address Section */}
      <div>
        <h3 className="text-lg font-semibold mb-4">כתובת</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="space-y-2">
            <Label htmlFor="city">ישוב</Label>
            <Input
              id="city"
              value={formData.city}
              onChange={(e) => setFormData({ ...formData, city: e.target.value })}
              placeholder="עיר/ישוב"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="street">רחוב</Label>
            <Input
              id="street"
              value={formData.street}
              onChange={(e) => setFormData({ ...formData, street: e.target.value })}
              placeholder="שם רחוב"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="house_number">מספר בית</Label>
            <Input
              id="house_number"
              value={formData.house_number}
              onChange={(e) => setFormData({ ...formData, house_number: e.target.value })}
              placeholder="מספר"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="apartment">דירה</Label>
            <Input
              id="apartment"
              value={formData.apartment}
              onChange={(e) => setFormData({ ...formData, apartment: e.target.value })}
              placeholder="מספר דירה"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="postal_code">מיקוד</Label>
            <Input
              id="postal_code"
              value={formData.postal_code}
              onChange={(e) => setFormData({ ...formData, postal_code: e.target.value })}
              placeholder="מיקוד"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="po_box">תא דואר</Label>
            <Input
              id="po_box"
              value={formData.po_box}
              onChange={(e) => setFormData({ ...formData, po_box: e.target.value })}
              placeholder="ת.ד."
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="fax">פקס</Label>
            <Input
              id="fax"
              value={formData.fax}
              onChange={(e) => setFormData({ ...formData, fax: e.target.value })}
              placeholder="מספר פקס"
            />
          </div>
        </div>
      </div>

      {/* Medical Section */}
      <div>
        <h3 className="text-lg font-semibold mb-4">מידע רפואי</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="space-y-2">
            <Label htmlFor="health_fund">קופת חולים</Label>
            <Select
              value={formData.health_fund}
              onValueChange={(value) => setFormData({ ...formData, health_fund: value })}
            >
              <SelectTrigger>
                <SelectValue placeholder="בחר קופה" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="clalit">כללית</SelectItem>
                <SelectItem value="maccabi">מכבי</SelectItem>
                <SelectItem value="meuhedet">מאוחדת</SelectItem>
                <SelectItem value="leumit">לאומית</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="supplementary_insurance">שב״ן</Label>
            <Input
              id="supplementary_insurance"
              value={formData.supplementary_insurance}
              onChange={(e) => setFormData({ ...formData, supplementary_insurance: e.target.value })}
              placeholder="ביטוח משלים"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="height">גובה (ס״מ)</Label>
            <Input
              id="height"
              type="number"
              value={formData.height}
              onChange={(e) => setFormData({ ...formData, height: e.target.value })}
              placeholder="גובה בס״מ"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="weight">משקל (ק״ג)</Label>
            <Input
              id="weight"
              type="number"
              value={formData.weight}
              onChange={(e) => setFormData({ ...formData, weight: e.target.value })}
              placeholder="משקל בק״ג"
            />
          </div>
          <div className="space-y-2">
            <Label>BMI</Label>
            <div className="h-10 px-3 py-2 border rounded-md bg-muted text-muted-foreground">
              {calculateBMI()}
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="cigarettes_per_day">סיגריות ליום</Label>
            <Input
              id="cigarettes_per_day"
              type="number"
              min="0"
              value={formData.cigarettes_per_day}
              onChange={(e) => setFormData({ ...formData, cigarettes_per_day: e.target.value })}
              placeholder="0"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="dangerous_hobbies">תחביבים מסוכנים</Label>
            <div className="flex items-center gap-2 h-10">
              <Switch
                id="dangerous_hobbies"
                checked={formData.dangerous_hobbies}
                onCheckedChange={(checked) => setFormData({ ...formData, dangerous_hobbies: checked })}
              />
              <span className="text-sm text-muted-foreground">
                {formData.dangerous_hobbies ? 'כן' : 'לא'}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* US Citizenship Section */}
      <div>
        <h3 className="text-lg font-semibold mb-4">אזרחות</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="space-y-2">
            <Label htmlFor="is_us_citizen">אזרח אמריקאי</Label>
            <div className="flex items-center gap-2 h-10">
              <Switch
                id="is_us_citizen"
                checked={formData.is_us_citizen}
                onCheckedChange={(checked) => setFormData({ ...formData, is_us_citizen: checked })}
              />
              <span className="text-sm text-muted-foreground">
                {formData.is_us_citizen ? 'כן' : 'לא'}
              </span>
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="is_us_resident">תושב אמריקאי</Label>
            <div className="flex items-center gap-2 h-10">
              <Switch
                id="is_us_resident"
                checked={formData.is_us_resident}
                onCheckedChange={(checked) => setFormData({ ...formData, is_us_resident: checked })}
              />
              <span className="text-sm text-muted-foreground">
                {formData.is_us_resident ? 'כן' : 'לא'}
              </span>
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="born_in_us">יליד ארה״ב</Label>
            <div className="flex items-center gap-2 h-10">
              <Switch
                id="born_in_us"
                checked={formData.born_in_us}
                onCheckedChange={(checked) => setFormData({ ...formData, born_in_us: checked })}
              />
              <span className="text-sm text-muted-foreground">
                {formData.born_in_us ? 'כן' : 'לא'}
              </span>
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="birth_country">ארץ לידה</Label>
            <Input
              id="birth_country"
              value={formData.birth_country}
              onChange={(e) => setFormData({ ...formData, birth_country: e.target.value })}
              placeholder="ארץ לידה"
            />
          </div>
        </div>
      </div>

      {/* Documents Section */}
      <div>
        <h3 className="text-lg font-semibold mb-4">מסמכים</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="space-y-2">
            <Label htmlFor="id_issue_date">תאריך הנפקת ת.ז</Label>
            <Input
              id="id_issue_date"
              type="date"
              value={formData.id_issue_date}
              onChange={(e) => setFormData({ ...formData, id_issue_date: e.target.value })}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="pdf_accessibility">הנגשה למסמכי PDF</Label>
            <div className="flex items-center gap-2 h-10">
              <Switch
                id="pdf_accessibility"
                checked={formData.pdf_accessibility}
                onCheckedChange={(checked) => setFormData({ ...formData, pdf_accessibility: checked })}
              />
              <span className="text-sm text-muted-foreground">
                {formData.pdf_accessibility ? 'כן' : 'לא'}
              </span>
            </div>
          </div>
          <div className="space-y-2">
            <Label>העלאת צילום ת.ז</Label>
            <Button type="button" variant="outline" className="w-full">
              <Upload className="h-4 w-4 ml-2" />
              העלאה מהירה
            </Button>
          </div>
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

export default AdditionalDetailsTab;
