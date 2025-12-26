import { useState, useEffect } from "react";
import { Plus, Trash2, Loader2, Building2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface Employer {
  id: string;
  company_name: string;
  company_number?: string;
  start_date?: string;
  end_date?: string;
  is_current: boolean;
  city?: string;
  street?: string;
  house_number?: string;
  postal_code?: string;
  phone?: string;
  email?: string;
}

interface Props {
  clientId: string;
}

const EmployersTab = ({ clientId }: Props) => {
  const { toast } = useToast();
  const [employers, setEmployers] = useState<Employer[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingEmployer, setEditingEmployer] = useState<Employer | null>(null);
  const [formData, setFormData] = useState<Partial<Employer>>({
    is_current: true
  });

  useEffect(() => {
    fetchEmployers();
  }, [clientId]);

  const fetchEmployers = async () => {
    try {
      const { data, error } = await supabase
        .from('employers')
        .select('*')
        .eq('client_id', clientId)
        .order('is_current', { ascending: false })
        .order('start_date', { ascending: false });

      if (error) throw error;
      setEmployers(data || []);
    } catch (error: any) {
      console.error('Error fetching employers:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSave = async () => {
    if (!formData.company_name) {
      toast({
        title: "שגיאה",
        description: "יש למלא את שם המעסיק",
        variant: "destructive"
      });
      return;
    }

    try {
      if (editingEmployer) {
        const { error } = await supabase
          .from('employers')
          .update(formData)
          .eq('id', editingEmployer.id);
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('employers')
          .insert({
            ...formData,
            client_id: clientId
          });
        if (error) throw error;
      }

      toast({
        title: "נשמר בהצלחה",
        description: editingEmployer ? "המעסיק עודכן" : "מעסיק נוסף"
      });

      setIsDialogOpen(false);
      setEditingEmployer(null);
      setFormData({ is_current: true });
      fetchEmployers();
    } catch (error: any) {
      toast({
        title: "שגיאה בשמירה",
        description: error.message,
        variant: "destructive"
      });
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('האם למחוק את המעסיק?')) return;

    try {
      const { error } = await supabase
        .from('employers')
        .delete()
        .eq('id', id);

      if (error) throw error;

      toast({
        title: "נמחק בהצלחה"
      });

      fetchEmployers();
    } catch (error: any) {
      toast({
        title: "שגיאה במחיקה",
        description: error.message,
        variant: "destructive"
      });
    }
  };

  const openEditDialog = (employer: Employer) => {
    setEditingEmployer(employer);
    setFormData(employer);
    setIsDialogOpen(true);
  };

  const openAddDialog = () => {
    setEditingEmployer(null);
    setFormData({ is_current: true });
    setIsDialogOpen(true);
  };

  const formatAddress = (employer: Employer): string => {
    const parts = [employer.street, employer.house_number, employer.city].filter(Boolean);
    return parts.length > 0 ? parts.join(' ') : '-';
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <Loader2 className="h-6 w-6 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <p className="text-sm text-muted-foreground">
          סה״כ: {employers.length} מעסיקים
        </p>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={openAddDialog}>
              <Plus className="h-4 w-4 ml-2" />
              הוסף מעסיק
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl" dir="rtl">
            <DialogHeader>
              <DialogTitle>
                {editingEmployer ? 'עריכת מעסיק' : 'הוספת מעסיק'}
              </DialogTitle>
            </DialogHeader>
            <div className="grid grid-cols-2 gap-4 py-4">
              <div className="space-y-2">
                <Label>שם המעסיק *</Label>
                <Input
                  value={formData.company_name || ''}
                  onChange={(e) => setFormData({ ...formData, company_name: e.target.value })}
                  placeholder="שם החברה"
                />
              </div>

              <div className="space-y-2">
                <Label>ח.פ / מ.ע</Label>
                <Input
                  value={formData.company_number || ''}
                  onChange={(e) => setFormData({ ...formData, company_number: e.target.value })}
                  placeholder="מספר חברה"
                />
              </div>

              <div className="space-y-2">
                <Label>תאריך התחלה</Label>
                <Input
                  type="date"
                  value={formData.start_date || ''}
                  onChange={(e) => setFormData({ ...formData, start_date: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <Label>מעסיק נוכחי</Label>
                <div className="flex items-center gap-2 h-10">
                  <Switch
                    checked={formData.is_current ?? true}
                    onCheckedChange={(checked) => setFormData({ ...formData, is_current: checked })}
                  />
                  <span className="text-sm text-muted-foreground">
                    {formData.is_current ? 'כן' : 'לא'}
                  </span>
                </div>
              </div>

              {!formData.is_current && (
                <div className="space-y-2">
                  <Label>תאריך סיום</Label>
                  <Input
                    type="date"
                    value={formData.end_date || ''}
                    onChange={(e) => setFormData({ ...formData, end_date: e.target.value })}
                  />
                </div>
              )}

              <div className="col-span-2">
                <h4 className="font-medium mb-2">כתובת</h4>
              </div>

              <div className="space-y-2">
                <Label>ישוב</Label>
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

              <div className="col-span-2">
                <h4 className="font-medium mb-2">יצירת קשר</h4>
              </div>

              <div className="space-y-2">
                <Label>טלפון</Label>
                <Input
                  type="tel"
                  value={formData.phone || ''}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  placeholder="מספר טלפון"
                />
              </div>

              <div className="space-y-2">
                <Label>דוא״ל</Label>
                <Input
                  type="email"
                  value={formData.email || ''}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder="email@company.com"
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

      {employers.length === 0 ? (
        <div className="text-center py-8 bg-muted/50 rounded-lg">
          <Building2 className="h-12 w-12 mx-auto text-muted-foreground mb-2" />
          <p className="text-muted-foreground">לא נמצאו מעסיקים</p>
        </div>
      ) : (
        <div className="border rounded-lg overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="text-right">שם המעסיק</TableHead>
                <TableHead className="text-right">ח.פ</TableHead>
                <TableHead className="text-right">כתובת</TableHead>
                <TableHead className="text-right">טלפון</TableHead>
                <TableHead className="text-right">תאריך התחלה</TableHead>
                <TableHead className="text-right">סטטוס</TableHead>
                <TableHead className="text-right">פעולות</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {employers.map((employer) => (
                <TableRow key={employer.id} className="cursor-pointer hover:bg-muted/50" onClick={() => openEditDialog(employer)}>
                  <TableCell className="font-medium">{employer.company_name}</TableCell>
                  <TableCell>{employer.company_number || '-'}</TableCell>
                  <TableCell>{formatAddress(employer)}</TableCell>
                  <TableCell>{employer.phone || '-'}</TableCell>
                  <TableCell>{employer.start_date || '-'}</TableCell>
                  <TableCell>
                    {employer.is_current ? (
                      <Badge variant="default" className="bg-green-100 text-green-800">נוכחי</Badge>
                    ) : (
                      <Badge variant="secondary">קודם</Badge>
                    )}
                  </TableCell>
                  <TableCell>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDelete(employer.id);
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

export default EmployersTab;
