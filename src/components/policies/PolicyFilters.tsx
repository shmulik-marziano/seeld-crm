import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Search } from 'lucide-react';

interface PolicyFiltersProps {
  searchTerm: string;
  onSearchChange: (value: string) => void;
  typeFilter: string;
  onTypeFilterChange: (value: string) => void;
  statusFilter: string;
  onStatusFilterChange: (value: string) => void;
}

const PolicyFilters = ({
  searchTerm,
  onSearchChange,
  typeFilter,
  onTypeFilterChange,
  statusFilter,
  onStatusFilterChange,
}: PolicyFiltersProps) => {
  return (
    <div className="glass-card p-4 space-y-4">
      <div className="relative">
        <Search className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={20} />
        <Input
          placeholder="חפש לפי מספר פוליסה או ספק..."
          value={searchTerm}
          onChange={(e) => onSearchChange(e.target.value)}
          className="pr-10"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Select value={typeFilter} onValueChange={onTypeFilterChange}>
            <SelectTrigger>
              <SelectValue placeholder="כל סוגי הפוליסות" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">כל סוגי הפוליסות</SelectItem>
              <SelectItem value="life_insurance">ביטוח חיים</SelectItem>
              <SelectItem value="health_insurance">ביטוח בריאות</SelectItem>
              <SelectItem value="pension">פנסיה</SelectItem>
              <SelectItem value="disability_insurance">ביטוח אובדן כושר</SelectItem>
              <SelectItem value="property_insurance">ביטוח רכוש</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div>
          <Select value={statusFilter} onValueChange={onStatusFilterChange}>
            <SelectTrigger>
              <SelectValue placeholder="כל הסטטוסים" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">כל הסטטוסים</SelectItem>
              <SelectItem value="active">פעילות</SelectItem>
              <SelectItem value="lapsed">פג תוקף</SelectItem>
              <SelectItem value="cancelled">מבוטלות</SelectItem>
              <SelectItem value="pending">ממתינות</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
    </div>
  );
};

export default PolicyFilters;
