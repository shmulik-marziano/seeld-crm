import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { User, X, ChevronRight, ChevronLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { supabase } from "@/integrations/supabase/client";

interface RecentCustomer {
  id: string;
  full_name: string;
  id_number?: string;
}

const RecentCustomers = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [customers, setCustomers] = useState<RecentCustomer[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchRecentCustomers();
  }, [location.pathname]); // Refresh when route changes

  const fetchRecentCustomers = async () => {
    const stored = localStorage.getItem('recentCustomers');
    if (!stored) {
      setIsLoading(false);
      return;
    }

    const recentIds: string[] = JSON.parse(stored);
    if (recentIds.length === 0) {
      setIsLoading(false);
      return;
    }

    try {
      const { data, error } = await supabase
        .from('clients')
        .select('id, full_name, id_number')
        .in('id', recentIds);

      if (error) throw error;

      // Sort by the order in localStorage
      const sorted = recentIds
        .map(id => data?.find(c => c.id === id))
        .filter(Boolean) as RecentCustomer[];

      setCustomers(sorted);
    } catch (error) {
      console.error('Error fetching recent customers:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const removeFromRecent = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const stored = localStorage.getItem('recentCustomers');
    if (!stored) return;

    const recentIds: string[] = JSON.parse(stored);
    const updated = recentIds.filter(cid => cid !== id);
    localStorage.setItem('recentCustomers', JSON.stringify(updated));

    setCustomers(customers.filter(c => c.id !== id));
  };

  const handleCustomerClick = (id: string) => {
    navigate(`/agent/customer/${id}`);
  };

  const isOnCustomerPage = location.pathname.includes('/agent/customer/');

  // Only show on agent pages
  if (!location.pathname.startsWith('/agent/')) {
    return null;
  }

  if (isLoading || customers.length === 0) {
    return null;
  }

  return (
    <div className="bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b" dir="rtl">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex items-center gap-2 py-2">
          <span className="text-xs text-muted-foreground whitespace-nowrap">
            לקוחות אחרונים:
          </span>
          <ScrollArea className="flex-1 whitespace-nowrap">
            <div className="flex gap-1">
              {customers.map((customer) => {
                const isActive = location.pathname === `/agent/customer/${customer.id}`;
                return (
                  <Button
                    key={customer.id}
                    variant={isActive ? "default" : "ghost"}
                    size="sm"
                    className={`h-7 px-2 text-xs group relative ${
                      isActive ? 'bg-primary text-primary-foreground' : ''
                    }`}
                    onClick={() => handleCustomerClick(customer.id)}
                  >
                    <User className="h-3 w-3 ml-1" />
                    <span className="max-w-[120px] truncate">
                      {customer.full_name}
                    </span>
                    {customer.id_number && (
                      <span className="text-muted-foreground mr-1 text-[10px]">
                        ({customer.id_number.slice(-4)})
                      </span>
                    )}
                    <button
                      onClick={(e) => removeFromRecent(customer.id, e)}
                      className="absolute -top-1 -left-1 bg-destructive text-destructive-foreground rounded-full p-0.5 opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <X className="h-2.5 w-2.5" />
                    </button>
                  </Button>
                );
              })}
            </div>
            <ScrollBar orientation="horizontal" />
          </ScrollArea>
        </div>
      </div>
    </div>
  );
};

export default RecentCustomers;
