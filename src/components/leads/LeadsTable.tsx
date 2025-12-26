import { useState } from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Edit, Mail, Phone } from 'lucide-react';
import { format } from 'date-fns';
import { he } from 'date-fns/locale';

interface Lead {
  id: string;
  full_name: string;
  email: string;
  phone: string;
  service_type: string;
  message: string | null;
  status: string;
  created_at: string;
  assigned_agent_id: string | null;
  profiles?: {
    full_name: string;
  };
}

interface LeadsTableProps {
  leads: Lead[];
  onEdit: (lead: Lead) => void;
}

const statusColors: Record<string, string> = {
  new: 'bg-blue-500/10 text-blue-600 border-blue-500/20',
  contacted: 'bg-yellow-500/10 text-yellow-600 border-yellow-500/20',
  qualified: 'bg-purple-500/10 text-purple-600 border-purple-500/20',
  converted: 'bg-green-500/10 text-green-600 border-green-500/20',
  lost: 'bg-red-500/10 text-red-600 border-red-500/20',
};

const statusLabels: Record<string, string> = {
  new: 'חדש',
  contacted: 'יצרנו קשר',
  qualified: 'מוסמך',
  converted: 'הומר',
  lost: 'אבוד',
};

const LeadsTable = ({ leads, onEdit }: LeadsTableProps) => {
  return (
    <div className="border rounded-lg overflow-hidden bg-background">
      <Table>
        <TableHeader>
          <TableRow className="bg-muted/50">
            <TableHead className="text-right">שם</TableHead>
            <TableHead className="text-right">פרטי קשר</TableHead>
            <TableHead className="text-right">סוג שירות</TableHead>
            <TableHead className="text-right">סטטוס</TableHead>
            <TableHead className="text-right">סוכן מוקצה</TableHead>
            <TableHead className="text-right">תאריך יצירה</TableHead>
            <TableHead className="text-right">פעולות</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {leads.length === 0 ? (
            <TableRow>
              <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                לא נמצאו לידים
              </TableCell>
            </TableRow>
          ) : (
            leads.map((lead) => (
              <TableRow key={lead.id} className="hover:bg-muted/30">
                <TableCell className="font-medium">{lead.full_name}</TableCell>
                <TableCell>
                  <div className="flex flex-col gap-1 text-sm">
                    <a href={`mailto:${lead.email}`} className="flex items-center gap-1 text-primary hover:underline">
                      <Mail size={14} />
                      {lead.email}
                    </a>
                    <a href={`tel:${lead.phone}`} className="flex items-center gap-1 text-muted-foreground hover:text-foreground">
                      <Phone size={14} />
                      {lead.phone}
                    </a>
                  </div>
                </TableCell>
                <TableCell>{lead.service_type}</TableCell>
                <TableCell>
                  <Badge className={statusColors[lead.status] || 'bg-gray-500/10'}>
                    {statusLabels[lead.status] || lead.status}
                  </Badge>
                </TableCell>
                <TableCell>
                  {lead.profiles?.full_name || (
                    <span className="text-muted-foreground text-sm">לא הוקצה</span>
                  )}
                </TableCell>
                <TableCell className="text-sm text-muted-foreground">
                  {format(new Date(lead.created_at), 'dd/MM/yyyy HH:mm', { locale: he })}
                </TableCell>
                <TableCell>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onEdit(lead)}
                    className="hover:bg-primary/10"
                  >
                    <Edit size={16} />
                  </Button>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  );
};

export default LeadsTable;
