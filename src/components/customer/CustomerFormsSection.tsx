import { useState, useEffect } from "react";
import { Plus, Trash2, Loader2, FileEdit, Send, Download, Eye, FileSignature } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface FormKit {
  id: string;
  kit_name: string;
  products_count: number;
  signature_type?: string;
  status: string;
  vsign_status?: string;
  signed_at?: string;
  sent_at?: string;
  created_at: string;
}

interface Props {
  clientId: string;
}

const statusLabels: Record<string, { label: string; color: string }> = {
  draft: { label: 'טיוטא', color: 'bg-gray-100 text-gray-800' },
  pending_remote: { label: 'ממתין לחתימה מרחוק', color: 'bg-amber-100 text-amber-800' },
  pending_frontal: { label: 'ממתין לחתימה פרונטלית', color: 'bg-blue-100 text-blue-800' },
  signed: { label: 'נחתם', color: 'bg-green-100 text-green-800' },
  sent: { label: 'נשלח', color: 'bg-purple-100 text-purple-800' },
  completed: { label: 'הושלם', color: 'bg-green-100 text-green-800' },
};

const signatureTypeLabels: Record<string, string> = {
  remote: 'מרחוק',
  frontal: 'פרונטלית',
  frontal_image: 'פרונטלית + תמונה',
};

const CustomerFormsSection = ({ clientId }: Props) => {
  const { toast } = useToast();
  const [formKits, setFormKits] = useState<FormKit[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState('all');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [formData, setFormData] = useState({
    kit_name: '',
    signature_type: 'remote'
  });

  useEffect(() => {
    fetchFormKits();
  }, [clientId]);

  const fetchFormKits = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from('form_kits')
        .select('*')
        .eq('client_id', clientId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setFormKits(data || []);
    } catch (error: any) {
      console.error('Error fetching form kits:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreate = async () => {
    if (!formData.kit_name) {
      toast({ title: "יש למלא שם קיט", variant: "destructive" });
      return;
    }

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('לא מחובר');

      const { error } = await supabase
        .from('form_kits')
        .insert({
          client_id: clientId,
          agent_id: user.id,
          kit_name: formData.kit_name,
          signature_type: formData.signature_type,
          status: 'draft'
        });

      if (error) throw error;

      toast({ title: "קיט נוצר בהצלחה" });
      setIsDialogOpen(false);
      setFormData({ kit_name: '', signature_type: 'remote' });
      fetchFormKits();
    } catch (error: any) {
      toast({
        title: "שגיאה ביצירת קיט",
        description: error.message,
        variant: "destructive"
      });
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('האם למחוק את הקיט?')) return;

    try {
      const { error } = await supabase
        .from('form_kits')
        .delete()
        .eq('id', id);

      if (error) throw error;

      toast({ title: "נמחק בהצלחה" });
      fetchFormKits();
    } catch (error: any) {
      toast({
        title: "שגיאה במחיקה",
        description: error.message,
        variant: "destructive"
      });
    }
  };

  const handleAction = (action: string, kit: FormKit) => {
    toast({
      title: `פעולה: ${action}`,
      description: `קיט: ${kit.kit_name}`
    });
  };

  const filteredKits = formKits.filter(kit => {
    if (activeFilter === 'all') return true;
    if (activeFilter === 'remote') return kit.signature_type === 'remote';
    if (activeFilter === 'frontal') return kit.signature_type === 'frontal' || kit.signature_type === 'frontal_image';
    if (activeFilter === 'in_progress') return kit.status === 'pending_remote' || kit.status === 'pending_frontal';
    return true;
  });

  const formatDate = (date?: string): string => {
    if (!date) return '-';
    return new Date(date).toLocaleDateString('he-IL');
  };

  if (isLoading) {
    return (
      <Card className="glass-card">
        <CardContent className="flex items-center justify-center py-8">
          <Loader2 className="h-6 w-6 animate-spin text-primary" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="glass-card">
      <CardHeader className="pb-4">
        <div className="flex justify-between items-center">
          <CardTitle className="flex items-center gap-2">
            <FileSignature className="h-5 w-5" />
            טפסי לקוח
          </CardTitle>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button size="sm">
                <Plus className="h-4 w-4 ml-2" />
                יצירת קיט חדש
              </Button>
            </DialogTrigger>
            <DialogContent dir="rtl">
              <DialogHeader>
                <DialogTitle>יצירת קיט טפסים</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label>שם הקיט</Label>
                  <Input
                    value={formData.kit_name}
                    onChange={(e) => setFormData({ ...formData, kit_name: e.target.value })}
                    placeholder="שם הקיט"
                  />
                </div>
                <div className="space-y-2">
                  <Label>סוג חתימה</Label>
                  <Select
                    value={formData.signature_type}
                    onValueChange={(value) => setFormData({ ...formData, signature_type: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="remote">חתימה מרחוק</SelectItem>
                      <SelectItem value="frontal">חתימה פרונטלית</SelectItem>
                      <SelectItem value="frontal_image">פרונטלית עם תמונה</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                  ביטול
                </Button>
                <Button onClick={handleCreate}>
                  יצירה
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </CardHeader>
      <CardContent>
        {/* Filters */}
        <Tabs value={activeFilter} onValueChange={setActiveFilter} className="mb-4">
          <TabsList className="h-8">
            <TabsTrigger value="all" className="text-xs px-2 h-7">הצג הכל</TabsTrigger>
            <TabsTrigger value="remote" className="text-xs px-2 h-7">מרחוק</TabsTrigger>
            <TabsTrigger value="frontal" className="text-xs px-2 h-7">פרונטלי</TabsTrigger>
            <TabsTrigger value="in_progress" className="text-xs px-2 h-7">בתהליך</TabsTrigger>
          </TabsList>
        </Tabs>

        {/* Form Kits Table */}
        {filteredKits.length === 0 ? (
          <div className="text-center py-8 bg-muted/50 rounded-lg">
            <FileSignature className="h-12 w-12 mx-auto text-muted-foreground mb-2" />
            <p className="text-muted-foreground">לא נמצאו קיטים</p>
          </div>
        ) : (
          <div className="border rounded-lg overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="text-right">תאריך יצירה</TableHead>
                  <TableHead className="text-right">שם הקיט</TableHead>
                  <TableHead className="text-right">מוצרים</TableHead>
                  <TableHead className="text-right">סוג חתימה</TableHead>
                  <TableHead className="text-right">סטטוס</TableHead>
                  <TableHead className="text-right">עריכה וחתימה</TableHead>
                  <TableHead className="text-right">פעולות</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredKits.map((kit) => (
                  <TableRow key={kit.id}>
                    <TableCell>{formatDate(kit.created_at)}</TableCell>
                    <TableCell className="font-medium">{kit.kit_name}</TableCell>
                    <TableCell>{kit.products_count}</TableCell>
                    <TableCell>
                      {signatureTypeLabels[kit.signature_type || ''] || '-'}
                    </TableCell>
                    <TableCell>
                      <Badge className={statusLabels[kit.status]?.color || ''}>
                        {statusLabels[kit.status]?.label || kit.status}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleAction('edit', kit)}
                          title="עריכה"
                        >
                          <FileEdit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleAction('sign', kit)}
                          title="חתימה"
                        >
                          <FileSignature className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleAction('download', kit)}
                          title="הורדה"
                        >
                          <Download className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleAction('send', kit)}
                          title="שליחה"
                        >
                          <Send className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleDelete(kit.id)}
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
      </CardContent>
    </Card>
  );
};

export default CustomerFormsSection;
