import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Edit, Trash2, FileText } from 'lucide-react';
import { format } from 'date-fns';
import { he } from 'date-fns/locale';

interface PolicyCardProps {
  policy: {
    id: string;
    type: string;
    policy_number: string;
    provider: string;
    premium: number;
    coverage_amount: number;
    status: string;
    start_date: string;
    end_date: string | null;
  };
  onEdit: (policy: any) => void;
  onDelete: (id: string) => void;
}

const PolicyCard = ({ policy, onEdit, onDelete }: PolicyCardProps) => {
  const getTypeLabel = (type: string) => {
    const types: Record<string, string> = {
      life_insurance: 'ביטוח חיים',
      health_insurance: 'ביטוח בריאות',
      pension: 'פנסיה',
      disability_insurance: 'ביטוח אובדן כושר',
      property_insurance: 'ביטוח רכוש',
    };
    return types[type] || type;
  };

  const getStatusColor = (status: string) => {
    return status === 'active' ? 'bg-secondary' : status === 'cancelled' ? 'bg-destructive' : status === 'lapsed' ? 'bg-destructive' : 'bg-muted';
  };

  const getStatusLabel = (status: string) => {
    return status === 'active' ? 'פעילה' : status === 'cancelled' ? 'מבוטלת' : status === 'lapsed' ? 'פג תוקף' : 'ממתינה';
  };

  return (
    <Card className="p-6 hover-lift glass-card">
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-start gap-3">
          <div className="p-2 rounded-lg bg-primary/10">
            <FileText className="text-primary" size={24} />
          </div>
          <div>
            <h3 className="font-bold text-lg">{getTypeLabel(policy.type)}</h3>
            <p className="text-sm text-muted-foreground">מספר פוליסה: {policy.policy_number}</p>
          </div>
        </div>
        <Badge className={getStatusColor(policy.status)}>
          {getStatusLabel(policy.status)}
        </Badge>
      </div>

      <div className="space-y-3 mb-4">
        <div className="flex justify-between text-sm">
          <span className="text-muted-foreground">ספק:</span>
          <span className="font-medium">{policy.provider}</span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-muted-foreground">פרמיה חודשית:</span>
          <span className="font-medium">₪{policy.premium.toLocaleString()}</span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-muted-foreground">כיסוי:</span>
          <span className="font-medium">₪{policy.coverage_amount.toLocaleString()}</span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-muted-foreground">תאריך התחלה:</span>
          <span className="font-medium">
            {format(new Date(policy.start_date), 'dd/MM/yyyy', { locale: he })}
          </span>
        </div>
        {policy.end_date && (
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">תאריך סיום:</span>
            <span className="font-medium">
              {format(new Date(policy.end_date), 'dd/MM/yyyy', { locale: he })}
            </span>
          </div>
        )}
      </div>

      <div className="flex gap-2">
        <Button
          variant="outline"
          size="sm"
          className="flex-1"
          onClick={() => onEdit(policy)}
        >
          <Edit size={16} className="ml-2" />
          ערוך
        </Button>
        <Button
          variant="destructive"
          size="sm"
          onClick={() => onDelete(policy.id)}
        >
          <Trash2 size={16} />
        </Button>
      </div>
    </Card>
  );
};

export default PolicyCard;
