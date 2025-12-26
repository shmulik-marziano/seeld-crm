import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Loader2 } from 'lucide-react';

interface Lead {
  id: string;
  full_name: string;
  email: string;
  phone: string;
  service_type: string;
  message: string | null;
  status: string;
  assigned_agent_id: string | null;
}

interface Agent {
  user_id: string;
  full_name: string;
}

interface EditLeadDialogProps {
  lead: Lead | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}

const EditLeadDialog = ({ lead, open, onOpenChange, onSuccess }: EditLeadDialogProps) => {
  const [status, setStatus] = useState<'new' | 'contacted' | 'qualified' | 'converted' | 'lost'>('new');
  const [assignedAgent, setAssignedAgent] = useState<string>('');
  const [notes, setNotes] = useState('');
  const [agents, setAgents] = useState<Agent[]>([]);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    if (lead) {
      setStatus(lead.status as 'new' | 'contacted' | 'qualified' | 'converted' | 'lost');
      setAssignedAgent(lead.assigned_agent_id || '');
      setNotes(lead.message || '');
    }
  }, [lead]);

  useEffect(() => {
    loadAgents();
  }, []);

  const loadAgents = async () => {
    const { data, error } = await supabase
      .from('user_roles')
      .select(`
        user_id,
        profiles!inner(full_name)
      `)
      .in('role', ['agent', 'admin']);

    if (error) {
      console.error('Error loading agents:', error);
      return;
    }

    const agentsList = data.map((item: any) => ({
      user_id: item.user_id,
      full_name: item.profiles.full_name,
    }));

    setAgents(agentsList);
  };

  const handleSave = async () => {
    if (!lead) return;

    setLoading(true);

    const { error } = await supabase
      .from('leads')
      .update({
        status,
        assigned_agent_id: assignedAgent || null,
        message: notes,
      })
      .eq('id', lead.id);

    setLoading(false);

    if (error) {
      toast({
        title: 'שגיאה',
        description: 'לא הצלחנו לעדכן את הליד',
        variant: 'destructive',
      });
      return;
    }

    toast({
      title: 'הצלחה',
      description: 'הליד עודכן בהצלחה',
    });

    onSuccess();
    onOpenChange(false);
  };

  if (!lead) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>עריכת ליד - {lead.full_name}</DialogTitle>
          <DialogDescription>
            עדכן את הסטטוס, הקצה סוכן והוסף הערות
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label>סטטוס</Label>
            <Select value={status} onValueChange={(value) => setStatus(value as 'new' | 'contacted' | 'qualified' | 'converted' | 'lost')}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="new">חדש</SelectItem>
                <SelectItem value="contacted">יצרנו קשר</SelectItem>
                <SelectItem value="qualified">מוסמך</SelectItem>
                <SelectItem value="converted">הומר</SelectItem>
                <SelectItem value="lost">אבוד</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>הקצה לסוכן</Label>
            <Select value={assignedAgent} onValueChange={setAssignedAgent}>
              <SelectTrigger>
                <SelectValue placeholder="בחר סוכן..." />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">ללא הקצאה</SelectItem>
                {agents.map((agent) => (
                  <SelectItem key={agent.user_id} value={agent.user_id}>
                    {agent.full_name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>הודעה / הערות</Label>
            <Textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="הוסף הערות או עדכונים..."
              rows={4}
              maxLength={1000}
            />
          </div>

          <div className="bg-muted/50 p-3 rounded-lg space-y-1 text-sm">
            <p><span className="font-medium">אימייל:</span> {lead.email}</p>
            <p><span className="font-medium">טלפון:</span> {lead.phone}</p>
            <p><span className="font-medium">סוג שירות:</span> {lead.service_type}</p>
          </div>
        </div>

        <div className="flex gap-2 justify-end">
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={loading}>
            ביטול
          </Button>
          <Button onClick={handleSave} disabled={loading}>
            {loading ? (
              <>
                <Loader2 className="ml-2 h-4 w-4 animate-spin" />
                שומר...
              </>
            ) : (
              'שמור שינויים'
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default EditLeadDialog;
