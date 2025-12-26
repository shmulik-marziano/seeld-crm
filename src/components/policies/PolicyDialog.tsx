import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { z } from 'zod';

const policySchema = z.object({
  type: z.string().min(1, 'נא לבחור סוג פוליסה'),
  policy_number: z.string().trim().min(1, 'נא להזין מספר פוליסה').max(50, 'מספר פוליסה ארוך מדי'),
  provider: z.string().trim().min(1, 'נא להזין ספק').max(100, 'שם ספק ארוך מדי'),
  premium: z.number().positive('פרמיה חייבת להיות חיובית').max(1000000, 'פרמיה גבוהה מדי'),
  coverage_amount: z.number().positive('כיסוי חייב להיות חיובי').max(100000000, 'כיסוי גבוה מדי'),
  status: z.string().min(1, 'נא לבחור סטטוס'),
  start_date: z.string().min(1, 'נא להזין תאריך התחלה'),
  end_date: z.string().optional(),
});

interface PolicyDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  policy?: any;
  onSuccess: () => void;
}

const PolicyDialog = ({ open, onOpenChange, policy, onSuccess }: PolicyDialogProps) => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    type: '',
    policy_number: '',
    provider: '',
    premium: '',
    coverage_amount: '',
    status: 'active',
    start_date: '',
    end_date: '',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (policy) {
      setFormData({
        type: policy.type,
        policy_number: policy.policy_number,
        provider: policy.provider,
        premium: policy.premium.toString(),
        coverage_amount: policy.coverage_amount.toString(),
        status: policy.status,
        start_date: policy.start_date,
        end_date: policy.end_date || '',
      });
    } else {
      setFormData({
        type: '',
        policy_number: '',
        provider: '',
        premium: '',
        coverage_amount: '',
        status: 'active',
        start_date: '',
        end_date: '',
      });
    }
    setErrors({});
  }, [policy, open]);

  const validateForm = () => {
    try {
      const dataToValidate = {
        ...formData,
        premium: parseFloat(formData.premium),
        coverage_amount: parseFloat(formData.coverage_amount),
        end_date: formData.end_date || undefined,
      };
      
      policySchema.parse(dataToValidate);
      setErrors({});
      return true;
    } catch (error) {
      if (error instanceof z.ZodError) {
        const newErrors: Record<string, string> = {};
        error.errors.forEach((err) => {
          if (err.path[0]) {
            newErrors[err.path[0].toString()] = err.message;
          }
        });
        setErrors(newErrors);
      }
      return false;
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      toast({
        title: 'שגיאה בטופס',
        description: 'נא לתקן את השגיאות בטופס',
        variant: 'destructive',
      });
      return;
    }

    setLoading(true);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        throw new Error('משתמש לא מחובר');
      }

      const policyData = {
        user_id: user.id,
        type: formData.type as 'life_insurance' | 'health_insurance' | 'pension' | 'disability_insurance' | 'property_insurance',
        policy_number: formData.policy_number,
        provider: formData.provider,
        premium: parseFloat(formData.premium),
        coverage_amount: parseFloat(formData.coverage_amount),
        status: formData.status as 'active' | 'cancelled' | 'lapsed' | 'pending',
        start_date: formData.start_date,
        end_date: formData.end_date || null,
      };

      if (policy) {
        const { error } = await supabase
          .from('policies')
          .update(policyData)
          .eq('id', policy.id);

        if (error) throw error;

        toast({
          title: 'הפוליסה עודכנה בהצלחה',
        });
      } else {
        const { error } = await supabase
          .from('policies')
          .insert([policyData]);

        if (error) throw error;

        toast({
          title: 'הפוליסה נוספה בהצלחה',
        });
      }

      onSuccess();
      onOpenChange(false);
    } catch (error: any) {
      toast({
        title: 'שגיאה',
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{policy ? 'עריכת פוליסה' : 'הוספת פוליסה חדשה'}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="type">סוג פוליסה *</Label>
              <Select
                value={formData.type}
                onValueChange={(value) => setFormData({ ...formData, type: value })}
              >
                <SelectTrigger id="type">
                  <SelectValue placeholder="בחר סוג" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="life_insurance">ביטוח חיים</SelectItem>
                  <SelectItem value="health_insurance">ביטוח בריאות</SelectItem>
                  <SelectItem value="pension">פנסיה</SelectItem>
                  <SelectItem value="disability_insurance">ביטוח אובדן כושר</SelectItem>
                  <SelectItem value="property_insurance">ביטוח רכוש</SelectItem>
                </SelectContent>
              </Select>
              {errors.type && <p className="text-sm text-destructive">{errors.type}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="policy_number">מספר פוליסה *</Label>
              <Input
                id="policy_number"
                value={formData.policy_number}
                onChange={(e) => setFormData({ ...formData, policy_number: e.target.value })}
                placeholder="הזן מספר פוליסה"
              />
              {errors.policy_number && <p className="text-sm text-destructive">{errors.policy_number}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="provider">ספק *</Label>
              <Input
                id="provider"
                value={formData.provider}
                onChange={(e) => setFormData({ ...formData, provider: e.target.value })}
                placeholder="הזן שם ספק"
              />
              {errors.provider && <p className="text-sm text-destructive">{errors.provider}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="status">סטטוס *</Label>
              <Select
                value={formData.status}
                onValueChange={(value) => setFormData({ ...formData, status: value })}
              >
                <SelectTrigger id="status">
                  <SelectValue placeholder="בחר סטטוס" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="active">פעילה</SelectItem>
                  <SelectItem value="lapsed">פג תוקף</SelectItem>
                  <SelectItem value="cancelled">מבוטלת</SelectItem>
                  <SelectItem value="pending">ממתינה</SelectItem>
                </SelectContent>
              </Select>
              {errors.status && <p className="text-sm text-destructive">{errors.status}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="premium">פרמיה חודשית (₪) *</Label>
              <Input
                id="premium"
                type="number"
                step="0.01"
                value={formData.premium}
                onChange={(e) => setFormData({ ...formData, premium: e.target.value })}
                placeholder="0.00"
              />
              {errors.premium && <p className="text-sm text-destructive">{errors.premium}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="coverage_amount">סכום כיסוי (₪) *</Label>
              <Input
                id="coverage_amount"
                type="number"
                step="0.01"
                value={formData.coverage_amount}
                onChange={(e) => setFormData({ ...formData, coverage_amount: e.target.value })}
                placeholder="0.00"
              />
              {errors.coverage_amount && <p className="text-sm text-destructive">{errors.coverage_amount}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="start_date">תאריך התחלה *</Label>
              <Input
                id="start_date"
                type="date"
                value={formData.start_date}
                onChange={(e) => setFormData({ ...formData, start_date: e.target.value })}
              />
              {errors.start_date && <p className="text-sm text-destructive">{errors.start_date}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="end_date">תאריך סיום (אופציונלי)</Label>
              <Input
                id="end_date"
                type="date"
                value={formData.end_date}
                onChange={(e) => setFormData({ ...formData, end_date: e.target.value })}
              />
            </div>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              ביטול
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? 'שומר...' : policy ? 'עדכן' : 'הוסף'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default PolicyDialog;
