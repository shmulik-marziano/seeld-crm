import { useState, useEffect } from "react";
import { Plus, Trash2, Loader2, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface FamilyMember {
  id: string;
  relationship: string;
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
  linked_client_id?: string;
}

interface Props {
  clientId: string;
}

const FamilyMembersTab = ({ clientId }: Props) => {
  const { toast } = useToast();
  const [members, setMembers] = useState<FamilyMember[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingMember, setEditingMember] = useState<FamilyMember | null>(null);
  const [formData, setFormData] = useState<Partial<FamilyMember>>({
    relationship: 'child'
  });

  useEffect(() => {
    fetchMembers();
  }, [clientId]);

  const fetchMembers = async () => {
    try {
      const { data, error } = await supabase
        .from('family_members')
        .select('*')
        .eq('client_id', clientId)
        .eq('is_spouse', false)
        .order('created_at', { ascending: true });

      if (error) throw error;
      setMembers(data || []);
    } catch (error: any) {
      console.error('Error fetching family members:', error);
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

  const handleSave = async () => {
    try {
      if (editingMember) {
        const { error } = await supabase
          .from('family_members')
          .update(formData)
          .eq('id', editingMember.id);
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('family_members')
          .insert({
            ...formData,
            client_id: clientId,
            is_spouse: false
          });
        if (error) throw error;
      }

      toast({
        title: "נשמר בהצלחה",
        description: editingMember ? "בן המשפחה עודכן" : "בן משפחה נוסף"
      });

      setIsDialogOpen(false);
      setEditingMember(null);
      setFormData({ relationship: 'child' });
      fetchMembers();
    } catch (error: any) {
      toast({
        title: "שגיאה בשמירה",
        description: error.message,
        variant: "destructive"
      });
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('האם למחוק את בן המשפחה?')) return;

    try {
      const { error } = await supabase
        .from('family_members')
        .delete()
        .eq('id', id);

      if (error) throw error;

      toast({
        title: "נמחק בהצלחה"
      });

      fetchMembers();
    } catch (error: any) {
      toast({
        title: "שגיאה במחיקה",
        description: error.message,
        variant: "destructive"
      });
    }
  };

  const openEditDialog = (member: FamilyMember) => {
    setEditingMember(member);
    setFormData(member);
    setIsDialogOpen(true);
  };

  const openAddDialog = () => {
    setEditingMember(null);
    setFormData({ relationship: 'child' });
    setIsDialogOpen(true);
  };

  const getRelationshipLabel = (relationship: string) => {
    const labels: Record<string, string> = {
      child: 'ילד/ה',
      parent: 'הורה',
      sibling: 'אח/אחות',
      other: 'אחר'
    };
    return labels[relationship] || relationship;
  };

  const getGenderLabel = (gender?: string) => {
    if (!gender) return '-';
    return gender === 'male' ? 'זכר' : 'נקבה';
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
          סה״כ: {members.length} בני משפחה
        </p>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={openAddDialog}>
              <Plus className="h-4 w-4 ml-2" />
              הוסף בן משפחה
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl" dir="rtl">
            <DialogHeader>
              <DialogTitle>
                {editingMember ? 'עריכת בן משפחה' : 'הוספת בן משפחה'}
              </DialogTitle>
            </DialogHeader>
            <div className="grid grid-cols-2 gap-4 py-4">
              <div className="space-y-2">
                <Label>קירבה</Label>
                <Select
                  value={formData.relationship || 'child'}
                  onValueChange={(value) => setFormData({ ...formData, relationship: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="child">ילד/ה</SelectItem>
                    <SelectItem value="parent">הורה</SelectItem>
                    <SelectItem value="sibling">אח/אחות</SelectItem>
                    <SelectItem value="other">אחר</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>שם פרטי</Label>
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

              <div className="space-y-2">
                <Label>מעשן</Label>
                <div className="flex items-center gap-2 h-10">
                  <Switch
                    checked={formData.is_smoker || false}
                    onCheckedChange={(checked) => setFormData({ ...formData, is_smoker: checked })}
                  />
                  <span className="text-sm text-muted-foreground">
                    {formData.is_smoker ? 'כן' : 'לא'}
                  </span>
                </div>
              </div>

              <div className="space-y-2">
                <Label>מעמד</Label>
                <Select
                  value={formData.employment_status || ''}
                  onValueChange={(value) => setFormData({ ...formData, employment_status: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="בחר" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="employee">שכיר</SelectItem>
                    <SelectItem value="self_employed">עצמאי</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>הכנסה חודשית</Label>
                <Input
                  type="number"
                  value={formData.monthly_income || ''}
                  onChange={(e) => setFormData({ ...formData, monthly_income: parseFloat(e.target.value) || undefined })}
                  placeholder="בש״ח"
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

      {members.length === 0 ? (
        <div className="text-center py-8 bg-muted/50 rounded-lg">
          <p className="text-muted-foreground">לא נמצאו בני משפחה</p>
        </div>
      ) : (
        <div className="border rounded-lg overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="text-right">קירבה</TableHead>
                <TableHead className="text-right">שם</TableHead>
                <TableHead className="text-right">ת.ז</TableHead>
                <TableHead className="text-right">תאריך לידה</TableHead>
                <TableHead className="text-right">גיל</TableHead>
                <TableHead className="text-right">מין</TableHead>
                <TableHead className="text-right">פעולות</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {members.map((member) => (
                <TableRow key={member.id} className="cursor-pointer hover:bg-muted/50" onClick={() => openEditDialog(member)}>
                  <TableCell>{getRelationshipLabel(member.relationship)}</TableCell>
                  <TableCell>{member.first_name} {member.last_name}</TableCell>
                  <TableCell>{member.id_number || '-'}</TableCell>
                  <TableCell>{member.date_of_birth || '-'}</TableCell>
                  <TableCell>{calculateAge(member.date_of_birth) ?? '-'}</TableCell>
                  <TableCell>{getGenderLabel(member.gender)}</TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      {member.linked_client_id && (
                        <Button variant="ghost" size="icon" title="מעבר ללקוח">
                          <ExternalLink className="h-4 w-4" />
                        </Button>
                      )}
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDelete(member.id);
                        }}
                      >
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </div>
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

export default FamilyMembersTab;
