import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { Search, Users, Loader2, X, Phone, Mail, Calendar } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { supabase } from "@/integrations/supabase/client";

interface Customer {
  id: string;
  first_name: string;
  last_name: string;
  email?: string;
  phone?: string;
  id_number?: string;
  date_of_birth?: string;
  city?: string;
  status?: string;
  created_at: string;
}

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const statusLabels: Record<string, { label: string; color: string }> = {
  active: { label: 'פעיל', color: 'bg-green-100 text-green-800' },
  prospect: { label: 'פוטנציאלי', color: 'bg-blue-100 text-blue-800' },
  inactive: { label: 'לא פעיל', color: 'bg-gray-100 text-gray-800' },
  churned: { label: 'נטש', color: 'bg-red-100 text-red-800' },
};

const CustomersListDialog = ({ open, onOpenChange }: Props) => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [filteredCustomers, setFilteredCustomers] = useState<Customer[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(0);

  useEffect(() => {
    if (open) {
      fetchCustomers();
      setSearchQuery("");
      setSelectedIndex(0);
    }
  }, [open]);

  const fetchCustomers = async () => {
    setIsLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from('clients')
        .select('id, first_name, last_name, email, phone, id_number, date_of_birth, city, status, created_at')
        .eq('agent_id', user.id)
        .order('last_name', { ascending: true });

      if (error) throw error;
      setCustomers(data || []);
      setFilteredCustomers(data || []);
    } catch (error) {
      console.error('Error fetching customers:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (!searchQuery.trim()) {
      setFilteredCustomers(customers);
      return;
    }

    const query = searchQuery.toLowerCase();
    const filtered = customers.filter(customer => {
      const fullName = `${customer.first_name} ${customer.last_name}`.toLowerCase();
      const reverseName = `${customer.last_name} ${customer.first_name}`.toLowerCase();
      return (
        fullName.includes(query) ||
        reverseName.includes(query) ||
        customer.email?.toLowerCase().includes(query) ||
        customer.phone?.includes(query) ||
        customer.id_number?.includes(query) ||
        customer.city?.toLowerCase().includes(query)
      );
    });

    setFilteredCustomers(filtered);
    setSelectedIndex(0);
  }, [searchQuery, customers]);

  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex(prev => Math.min(prev + 1, filteredCustomers.length - 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex(prev => Math.max(prev - 1, 0));
    } else if (e.key === 'Enter' && filteredCustomers[selectedIndex]) {
      e.preventDefault();
      navigateToCustomer(filteredCustomers[selectedIndex].id);
    } else if (e.key === 'Escape') {
      onOpenChange(false);
    }
  }, [filteredCustomers, selectedIndex, onOpenChange]);

  const navigateToCustomer = (customerId: string) => {
    onOpenChange(false);
    navigate(`/agent/customer/${customerId}`);
  };

  const formatDate = (date?: string): string => {
    if (!date) return '';
    return new Date(date).toLocaleDateString('he-IL');
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

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[80vh]" dir="rtl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            חיפוש לקוחות
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Search Input */}
          <div className="relative">
            <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="חפש לפי שם, טלפון, ת.ז, אימייל או עיר..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={handleKeyDown}
              className="pr-10"
              autoFocus
            />
            {searchQuery && (
              <Button
                variant="ghost"
                size="icon"
                className="absolute left-1 top-1/2 -translate-y-1/2 h-7 w-7"
                onClick={() => setSearchQuery("")}
              >
                <X className="h-4 w-4" />
              </Button>
            )}
          </div>

          {/* Results Count */}
          <div className="text-sm text-muted-foreground">
            נמצאו {filteredCustomers.length} לקוחות
          </div>

          {/* Customer List */}
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : filteredCustomers.length === 0 ? (
            <div className="text-center py-12 bg-muted/50 rounded-lg">
              <Users className="h-12 w-12 mx-auto text-muted-foreground mb-2" />
              <p className="text-muted-foreground">
                {searchQuery ? 'לא נמצאו לקוחות תואמים' : 'אין לקוחות'}
              </p>
            </div>
          ) : (
            <ScrollArea className="h-[400px]">
              <div className="space-y-1">
                {filteredCustomers.map((customer, index) => {
                  const age = calculateAge(customer.date_of_birth);
                  return (
                    <button
                      key={customer.id}
                      onClick={() => navigateToCustomer(customer.id)}
                      className={`w-full text-right p-3 rounded-lg transition-colors ${
                        index === selectedIndex
                          ? 'bg-primary/10 border border-primary'
                          : 'hover:bg-muted/50 border border-transparent'
                      }`}
                    >
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <span className="font-medium text-base">
                              {customer.first_name} {customer.last_name}
                            </span>
                            {customer.status && statusLabels[customer.status] && (
                              <Badge className={`text-xs ${statusLabels[customer.status].color}`}>
                                {statusLabels[customer.status].label}
                              </Badge>
                            )}
                          </div>
                          <div className="flex flex-wrap gap-4 mt-1 text-sm text-muted-foreground">
                            {customer.id_number && (
                              <span>ת.ז: {customer.id_number}</span>
                            )}
                            {age !== null && (
                              <span className="flex items-center gap-1">
                                <Calendar className="h-3 w-3" />
                                גיל {age}
                              </span>
                            )}
                            {customer.city && (
                              <span>{customer.city}</span>
                            )}
                          </div>
                          <div className="flex flex-wrap gap-4 mt-1 text-sm text-muted-foreground">
                            {customer.phone && (
                              <span className="flex items-center gap-1">
                                <Phone className="h-3 w-3" />
                                {customer.phone}
                              </span>
                            )}
                            {customer.email && (
                              <span className="flex items-center gap-1">
                                <Mail className="h-3 w-3" />
                                {customer.email}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
            </ScrollArea>
          )}

          {/* Keyboard shortcuts hint */}
          <div className="text-xs text-muted-foreground text-center border-t pt-2">
            <span className="mx-2">↑↓ לניווט</span>
            <span className="mx-2">Enter לבחירה</span>
            <span className="mx-2">Esc לסגירה</span>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default CustomersListDialog;
