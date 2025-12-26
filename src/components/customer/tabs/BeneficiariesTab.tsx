import { useState, useEffect } from "react";
import { Plus, Trash2, Loader2, Users, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Progress } from "@/components/ui/progress";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface Beneficiary {
  id: string;
  first_name: string;
  last_name?: string;
  id_number?: string;
  relationship?: string;
  percentage: number;
  phone?: string;
  email?: string;
  city?: string;
  street?: string;
  house_number?: string;
  postal_code?: string;
  date_of_birth?: string;
  gender?: string;
  linked_client_id?: string;
}

interface Props {
  clientId: string;
}

const BeneficiariesTab = ({ clientId }: Props) => {
  const { toast } = useToast();
  const [beneficiaries, setBeneficiaries] = useState<Beneficiary[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingBeneficiary, setEditingBeneficiary] = useState<Beneficiary | null>(null);
  const [formData, setFormData] = useState<Partial<Beneficiary>>({
    percentage: 0
  });

  useEffect(() => {
    fetchBeneficiaries();
  }, [clientId]);

  const fetchBeneficiaries = async () => {
    try {
      const { data, error } = await supabase
        .from('beneficiaries')
        .select('*')
        .eq('client_id', clientId)
        .order('percentage', { ascending: false });

      if (error) throw error;
      setBeneficiaries(data || []);
    } catch (error: any) {
      console.error('Error fetching beneficiaries:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const getTotalPercentage = (): number => {
    return beneficiaries.reduce((sum, b) => sum + (b.percentage || 0), 0);
  };

  const handleSave = async () => {
    if (!formData.first_name) {
      toast({
        title: "שגיאה",
        description: "יש למלא את שם המוטב",
        variant: "destructive"
      });
      return;
    }

    if (!formData.percentage || formData.percentage <= 0 || formData.percentage > 100) {
      toast({
        title: "שגיאה",
        description: "יש למלא אחוז תקין (1-100)",
        variant: "destructive"
      });
      return;
    }

    // Check total percentage doesn't exceed 100%
    const currentTotal = getTotalPercentage();
    const previousPercentage = editingBeneficiary?.percentage || 0;
    const newTotal = currentTotal - previousPercentage + formData.percentage;

    if (newTotal > 100) {
      toast({
        title: "שגיאה",
        description: `סה״כ האחוזים יעלה על 100% (${newTotal}%)`,
        variant: "destructive"
      });
      return;
    }

    try {
      if (editingBeneficiary) {
        const { error } = await supabase
          .from('beneficiaries')
          .update(formData)
          .eq('id', editingBeneficiary.id);
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('beneficiaries')
          .insert({
            ...formData,
            client_id: clientId
          });
        if (error) throw error;
      }

      toast({
        title: "נשמר בהצלחה",
        description: editingBeneficiary ? "המוטב עודכן" : "מוטב נוסף"
      });

      setIsDialogOpen(false);
      setEditingBeneficiary(null);
      setFormData({ percentage: 0 });
      fetchBeneficiaries();
    } catch (error: any) {
      toast({
        title: "שגיאה בשמירה",
        description: error.message,
        variant: "destructive"
      });
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('האם למחוק את המוטב?')) return;

    try {
      const { error } = await supabase
        .from('beneficiaries')
        .delete()
        .eq('id', id);

      if (error) throw error;

      toast({
        title: "נמחק בהצלחה"
      });

      fetchBeneficiaries();
    } catch (error: any) {
      toast({
        title: "שגיאה במחיקה",
        description: error.message,
        variant: "destructive"
      });
    }
  };

  const openEditDialog = (beneficiary: Beneficiary) => {
    setEditingBeneficiary(beneficiary);
    setFormData(beneficiary);
    setIsDialogOpen(true);
  };

  const openAddDialog = () => {
    setEditingBeneficiary(null);
    const remainingPercentage = 100 - getTotalPercentage();
    setFormData({ percentage: remainingPercentage > 0 ? remainingPercentage : 0 });
    setIsDialogOpen(true);
  };

  const getRelationshipLabel = (relationship?: string) => {
    if (!relationship) return '-';
    const labels: Record<string, string> = {
      spouse: 'בן/בת זוג',
      child: 'ילד/ה',
      parent: 'הורה',
      sibling: 'אח/אחות',
      other: 'אחר'
    };
    return labels[relationship] || relationship;
  };

  const formatAddress = (beneficiary: Beneficiary): string => {
    const parts = [beneficiary.street, beneficiary.house_number, beneficiary.city].filter(Boolean);
    return parts.length > 0 ? parts.join(' ') : '-';
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <Loader2 className="h-6 w-6 animate-spin text-primary" />
      </div>
    );
  }

  const totalPercentage = getTotalPercentage();

  return (
    <div className="space-y-4">
      {/* Total Percentage Summary */}
      <div className="p-4 bg-muted/50 rounded-lg">
        <div className="flex justify-between items-center mb-2">
          <span className="font-medium">סה״כ חלוקה:</span>
          <span className={`font-bold ${totalPercentage === 100 ? 'text-green-600' : totalPercentage > 100 ? 'text-red-600' : 'text-amber-600'}`}>
            {totalPercentage}%
          </span>
        </div>
        <Progress value={totalPercentage} className="h-2" />
        {totalPercentage !== 100 && (
          <Alert variant="destructive" className="mt-2">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              {totalPercentage < 100
                ? `חסרים ${100 - totalPercentage}% להשלמה ל-100%`
                : `יש ${totalPercentage - 100}% עודף מעל 100%`
              }
            </AlertDescription>
          </Alert>
        )}
      </div>

      <div className="flex justify-between items-center">
        <p className="text-sm text-muted-foreground">
          סה״כ: {beneficiaries.length} מוטבים
        </p>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={openAddDialog} disabled={totalPercentage >= 100}>
              <Plus className="h-4 w-4 ml-2" />
              הוסף מוטב
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl" dir="rtl">
            <DialogHeader>
              <DialogTitle>
                {editingBeneficiary ? 'עריכת מוטב' : 'הוספת מוטב'}
              </DialogTitle>
            </DialogHeader>
            <div className="grid grid-cols-2 gap-4 py-4">
              <div className="space-y-2">
                <Label>שם פרטי *</Label>
                <Input
                  value={formData.first_name || ''}
                  onChange={(e) => setFormData({ ...formData, first_name: e.target.value })}
                  placeholder="שם פרטי"
                />
              </div>

              <div className="space-y-2">
                <Label>שם משפחה</Label>
                <Input
                  value={formData.last_name || ''}
                  onChange={(e) => setFormData({ ...formData, last_name: e.target.value })}
                  placeholder="שם משפחה"
                />
              </div>

              <div className="space-y-2">
                <Label>מספר מזהה</Label>
                <Input
                  value={formData.id_number || ''}
                  onChange={(e) => setFormData({ ...formData, id_number: e.target.value })}
                  placeholder="ת.ז"
                />
              </div>

              <div className="space-y-2">
                <Label>קירבה</Label>
                <Select
                  value={formData.relationship || ''}
                  onValueChange={(value) => setFormData({ ...formData, relationship: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="בחר קירבה" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="spouse">בן/בת זוג</SelectItem>
                    <SelectItem value="child">ילד/ה</SelectItem>
                    <SelectItem value="parent">הורה</SelectItem>
                    <SelectItem value="sibling">אח/אחות</SelectItem>
                    <SelectItem value="other">אחר</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>אחוז חלוקה *</Label>
                <Input
                  type="number"
                  min="0"
                  max="100"
                  value={formData.percentage || ''}
                  onChange={(e) => setFormData({ ...formData, percentage: parseFloat(e.target.value) || 0 })}
                  placeholder="אחוז"
                />
              </div>

              <div className="space-y-2">
                <Label>טלפון</Label>
                <Input
                  type="tel"
                  value={formData.phone || ''}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  placeholder="050-0000000"
                />
              </div>

              <div className="space-y-2">
                <Label>דוא״ל</Label>
                <Input
                  type="email"
                  value={formData.email || ''}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder="email@example.com"
                />
              </div>

              <div className="space-y-2">
                <Label>תאריך לידה</Label>
                <Input
                  type="date"
                  value={formData.date_of_birth || ''}
                  onChange={(e) => setFormData({ ...formData, date_of_birth: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <Label>מין</Label>
                <Select
                  value={formData.gender || ''}
                  onValueChange={(value) => setFormData({ ...formData, gender: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="בחר" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="male">זכר</SelectItem>
                    <SelectItem value="female">נקבה</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="col-span-2">
                <h4 className="font-medium mb-2">כתובת</h4>
              </div>

              <div className="space-y-2">
                <Label>עיר</Label>
                <Input
                  value={formData.city || ''}
                  onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                  placeholder="עיר"
                />
              </div>

              <div className="space-y-2">
                <Label>רחוב</Label>
                <Input
                  value={formData.street || ''}
                  onChange={(e) => setFormData({ ...formData, street: e.target.value })}
                  placeholder="שם רחוב"
                />
              </div>

              <div className="space-y-2">
                <Label>מספר בית</Label>
                <Input
                  value={formData.house_number || ''}
                  onChange={(e) => setFormData({ ...formData, house_number: e.target.value })}
                  placeholder="מספר"
                />
              </div>

              <div className="space-y-2">
                <Label>מיקוד</Label>
                <Input
                  value={formData.postal_code || ''}
                  onChange={(e) => setFormData({ ...formData, postal_code: e.target.value })}
                  placeholder="מיקוד"
                />
              </div>
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                ביטול
              </Button>
              <Button onClick={handleSave}>
                שמור
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {beneficiaries.length === 0 ? (
        <div className="text-center py-8 bg-muted/50 rounded-lg">
          <Users className="h-12 w-12 mx-auto text-muted-foreground mb-2" />
          <p className="text-muted-foreground">לא נמצאו מוטבים</p>
        </div>
      ) : (
        <div className="border rounded-lg overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="text-right">שם</TableHead>
                <TableHead className="text-right">ת.ז</TableHead>
                <TableHead className="text-right">קירבה</TableHead>
                <TableHead className="text-right">טלפון</TableHead>
                <TableHead className="text-right">אימייל</TableHead>
                <TableHead className="text-right">כתובת</TableHead>
                <TableHead className="text-right">אחוז</TableHead>
                <TableHead className="text-right">פעולות</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {beneficiaries.map((beneficiary) => (
                <TableRow key={beneficiary.id} className="cursor-pointer hover:bg-muted/50" onClick={() => openEditDialog(beneficiary)}>
                  <TableCell className="font-medium">
                    {beneficiary.first_name} {beneficiary.last_name}
                  </TableCell>
                  <TableCell>{beneficiary.id_number || '-'}</TableCell>
                  <TableCell>{getRelationshipLabel(beneficiary.relationship)}</TableCell>
                  <TableCell>{beneficiary.phone || '-'}</TableCell>
                  <TableCell>{beneficiary.email || '-'}</TableCell>
                  <TableCell>{formatAddress(beneficiary)}</TableCell>
                  <TableCell>
                    <span className="font-bold text-primary">{beneficiary.percentage}%</span>
                  </TableCell>
                  <TableCell>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDelete(beneficiary.id);
                      }}
                    >
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
};

export default BeneficiariesTab;
