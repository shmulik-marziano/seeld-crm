import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Search } from 'lucide-react';

interface LeadFiltersProps {
  statusFilter: string;
  serviceFilter: string;
  searchQuery: string;
  onStatusChange: (value: string) => void;
  onServiceChange: (value: string) => void;
  onSearchChange: (value: string) => void;
}

const LeadFilters = ({
  statusFilter,
  serviceFilter,
  searchQuery,
  onStatusChange,
  onServiceChange,
  onSearchChange,
}: LeadFiltersProps) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 bg-muted/30 rounded-lg border">
      <div className="space-y-2">
        <Label>חיפוש</Label>
        <div className="relative">
          <Search className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={18} />
          <Input
            placeholder="חפש לפי שם, אימייל או טלפון..."
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            className="pr-10"
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label>סטטוס</Label>
        <Select value={statusFilter} onValueChange={onStatusChange}>
          <SelectTrigger>
            <SelectValue placeholder="כל הסטטוסים" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">כל הסטטוסים</SelectItem>
            <SelectItem value="new">חדש</SelectItem>
            <SelectItem value="contacted">יצרנו קשר</SelectItem>
            <SelectItem value="qualified">מוסמך</SelectItem>
            <SelectItem value="converted">הומר</SelectItem>
            <SelectItem value="lost">אבוד</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label>סוג שירות</Label>
        <Select value={serviceFilter} onValueChange={onServiceChange}>
          <SelectTrigger>
            <SelectValue placeholder="כל השירותים" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">כל השירותים</SelectItem>
            <SelectItem value="ייעוץ לפרטיים">ייעוץ לפרטיים</SelectItem>
            <SelectItem value="שירותי סוכנים">שירותי סוכנים</SelectItem>
            <SelectItem value="SeelD AI">SeelD AI</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>
  );
};

export default LeadFilters;
