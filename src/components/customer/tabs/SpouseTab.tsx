import { useState, useEffect } from "react";
import { Save, Loader2, ExternalLink, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";

interface Spouse {
  id: string;
  first_name: string;
  last_name?: string;
  id_type?: string;
  id_number?: string;
  date_of_birth?: string;
  gender?: string;
  marital_status?: string;
  is_smoker?: boolean;
  employment_status?: string;
  monthly_income?: number;
  phone?: string;
  email?: string;
  city?: string;
  street?: string;
  house_number?: string;
  postal_code?: string;
  health_fund?: string;
  height?: number;
  weight?: number;
  cigarettes_per_day?: number;
  is_us_citizen?: boolean;
  is_us_resident?: boolean;
  birth_country?: string;
  linked_client_id?: string;
}

interface Props {
  clientId: string;
}

const SpouseTab = ({ clientId }: Props) => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const [spouse, setSpouse] = useState<Spouse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [formData, setFormData] = useState<Partial<Spouse>>({});

  useEffect(() => {
    fetchSpouse();
  }, [clientId]);

  const fetchSpouse = async () => {
    try {
      const { data, error } = await supabase
        .from('family_members')
        .select('*')
        .eq('client_id', clientId)
        .eq('is_spouse', true)
        .single();

      if (error && error.code !== 'PGRST116') throw error;

      if (data) {
        setSpouse(data);
        setFormData(data);
      }
    } catch (error: any) {
      console.error('Error fetching spouse:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const calculateAge = (birthDate?: string): number | null => {
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

  const calculateBMI = (): string => {
    const height = formData.height;
    const weight = formData.weight;
    if (!height || !weight) return '-';
    const heightInMeters = height / 100;
    const bmi = weight / (heightInMeters * heightInMeters);
    return bmi.toFixed(1);
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      if (spouse) {
        const { error } = await supabase
          .from('family_members')
          .update(formData)
          .eq('id', spouse.id);
        if (error) throw error;
      } else {
        const { data, error } = await supabase
          .from('family_members')
          .insert({
            ...formData,
            client_id: clientId,
            is_spouse: true,
            relationship: 'spouse'
          })
          .select()
          .single();
        if (error) throw error;
        setSpouse(data);
      }

      toast({
        title: "נשמר בהצלחה",
        description: "פרטי בן/בת הזוג עודכנו"
      });
    } catch (error: any) {
      toast({
        title: "שגיאה בשמירה",
        description: error.message,
        variant: "destructive"
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleNavigateToClient = () => {
    if (formData.linked_client_id) {
      navigate(`/agent/customer/${formData.linked_client_id}`);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <Loader2 className="h-6 w-6 animate-spin text-primary" />
      </div>
    );
  }

  const age = calculateAge(formData.date_of_birth);

  return (
    <div className="space-y-6">
      {!spouse && (
        <div className="text-center py-4 bg-muted/50 rounded-lg">
          <p className="text-muted-foreground mb-2">לא הוזנו פרטי בן/בת זוג</p>
          <p className="text-sm text-muted-foreground">מלא את הפרטים למטה כדי להוסיף</p>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Basic Info */}
        <div className="space-y-2">
          <Label htmlFor="first_name">שם פרטי</Label>
          <Input
            id="first_name"
            value={formData.first_name || ''}
            onChange={(e) => setFormData({ ...formData, first_name: e.target.value })}
            placeholder="שם פרטי"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="last_name">שם משפחה</Label>
          <Input
            id="last_name"
            value={formData.last_name || ''}
            onChange={(e) => setFormData({ ...formData, last_name: e.target.value })}
            placeholder="שם משפחה"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="id_type">סוג מזהה</Label>
          <Select
            value={formData.id_type || ''}
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

        <div className="space-y-2">
          <Label htmlFor="id_number">מספר מזהה</Label>
          <Input
            id="id_number"
            value={formData.id_number || ''}
            onChange={(e) => setFormData({ ...formData, id_number: e.target.value })}
            placeholder="מספר ת.ז / דרכון"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="date_of_birth">תאריך לידה</Label>
          <Input
            id="date_of_birth"
            type="date"
            value={formData.date_of_birth || ''}
            onChange={(e) => setFormData({ ...formData, date_of_birth: e.target.value })}
          />
        </div>

        <div className="space-y-2">
          <Label>גיל</Label>
          <div className="h-10 px-3 py-2 border rounded-md bg-muted text-muted-foreground">
            {age !== null ? age : '-'}
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="gender">מין</Label>
          <Select
            value={formData.gender || ''}
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

        <div className="space-y-2">
          <Label htmlFor="employment_status">מעמד</Label>
          <Select
            value={formData.employment_status || ''}
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

        <div className="space-y-2">
          <Label htmlFor="monthly_income">שכר/הכנסה חודשית</Label>
          <Input
            id="monthly_income"
            type="number"
            value={formData.monthly_income || ''}
            onChange={(e) => setFormData({ ...formData, monthly_income: parseFloat(e.target.value) || undefined })}
            placeholder="הכנסה בש״ח"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="is_smoker">מעשן</Label>
          <div className="flex items-center gap-2 h-10">
            <Switch
              id="is_smoker"
              checked={formData.is_smoker || false}
              onCheckedChange={(checked) => setFormData({ ...formData, is_smoker: checked })}
            />
            <span className="text-sm text-muted-foreground">
              {formData.is_smoker ? 'כן' : 'לא'}
            </span>
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="phone">טלפון</Label>
          <Input
            id="phone"
            type="tel"
            value={formData.phone || ''}
            onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
            placeholder="050-0000000"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="email">דוא״ל</Label>
          <Input
            id="email"
            type="email"
            value={formData.email || ''}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            placeholder="email@example.com"
          />
        </div>

        {/* Medical */}
        <div className="space-y-2">
          <Label htmlFor="health_fund">קופת חולים</Label>
          <Select
            value={formData.health_fund || ''}
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
          <Label htmlFor="height">גובה (ס״מ)</Label>
          <Input
            id="height"
            type="number"
            value={formData.height || ''}
            onChange={(e) => setFormData({ ...formData, height: parseInt(e.target.value) || undefined })}
            placeholder="גובה"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="weight">משקל (ק״ג)</Label>
          <Input
            id="weight"
            type="number"
            value={formData.weight || ''}
            onChange={(e) => setFormData({ ...formData, weight: parseInt(e.target.value) || undefined })}
            placeholder="משקל"
          />
        </div>

        <div className="space-y-2">
          <Label>BMI</Label>
          <div className="h-10 px-3 py-2 border rounded-md bg-muted text-muted-foreground">
            {calculateBMI()}
          </div>
        </div>
      </div>

      <div className="flex justify-between items-center pt-4">
        {formData.linked_client_id ? (
          <Button variant="outline" onClick={handleNavigateToClient}>
            <ExternalLink className="h-4 w-4 ml-2" />
            מעבר ללקוח
          </Button>
        ) : (
          <div></div>
        )}

        <Button onClick={handleSave} disabled={isSaving}>
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
    </div>
  );
};

export default SpouseTab;
