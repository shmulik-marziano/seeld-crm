import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { Plus, ArrowRight } from 'lucide-react';
import { DateRange } from 'react-day-picker';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import PolicyCard from '@/components/policies/PolicyCard';
import PolicyDialog from '@/components/policies/PolicyDialog';
import PolicyFilters from '@/components/policies/PolicyFilters';
import PolicyStats from '@/components/policies/PolicyStats';
import PolicyCharts from '@/components/policies/PolicyCharts';
import ChartFilters, { ViewMode } from '@/components/policies/ChartFilters';
import FuturisticBackground from '@/components/FuturisticBackground';

const PoliciesManagement = () => {
  const [policies, setPolicies] = useState<any[]>([]);
  const [filteredPolicies, setFilteredPolicies] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedPolicy, setSelectedPolicy] = useState<any>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [policyToDelete, setPolicyToDelete] = useState<string | null>(null);
  
  // Filters for policies table
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');

  // Filters for charts
  const [chartDateRange, setChartDateRange] = useState<DateRange | undefined>(undefined);
  const [chartProvider, setChartProvider] = useState('all');
  const [chartViewMode, setChartViewMode] = useState<ViewMode>('monthly');

  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    checkAuthAndLoadPolicies();
  }, []);

  useEffect(() => {
    filterPolicies();
  }, [policies, searchTerm, typeFilter, statusFilter]);

  const checkAuthAndLoadPolicies = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    
    if (!session) {
      navigate('/client/auth');
      return;
    }

    // Check role
    const { data: roleData } = await supabase
      .from('user_roles')
      .select('role')
      .eq('user_id', session.user.id)
      .maybeSingle();

    if (roleData?.role !== 'client') {
      toast({
        title: 'שגיאה',
        description: 'אין לך הרשאה לגשת לעמוד זה',
        variant: 'destructive',
      });
      navigate('/');
      return;
    }

    await loadPolicies();
  };

  const loadPolicies = async () => {
    try {
      const { data, error } = await supabase
        .from('policies')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;

      setPolicies(data || []);
    } catch (error: any) {
      toast({
        title: 'שגיאה בטעינת פוליסות',
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const filterPolicies = () => {
    let filtered = [...policies];

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(
        (policy) =>
          policy.policy_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
          policy.provider.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Type filter
    if (typeFilter !== 'all') {
      filtered = filtered.filter((policy) => policy.type === typeFilter);
    }

    // Status filter
    if (statusFilter !== 'all') {
      filtered = filtered.filter((policy) => policy.status === statusFilter);
    }

    setFilteredPolicies(filtered);
  };

  // Get unique providers for chart filter
  const getUniqueProviders = () => {
    const providers = new Set<string>();
    policies.forEach((policy) => providers.add(policy.provider));
    return Array.from(providers).sort();
  };

  const handleEdit = (policy: any) => {
    setSelectedPolicy(policy);
    setDialogOpen(true);
  };

  const handleDelete = (id: string) => {
    setPolicyToDelete(id);
    setDeleteDialogOpen(true);
  };

  const confirmDelete = async () => {
    if (!policyToDelete) return;

    try {
      const { error } = await supabase
        .from('policies')
        .delete()
        .eq('id', policyToDelete);

      if (error) throw error;

      toast({
        title: 'הפוליסה נמחקה בהצלחה',
      });

      await loadPolicies();
    } catch (error: any) {
      toast({
        title: 'שגיאה במחיקת פוליסה',
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setDeleteDialogOpen(false);
      setPolicyToDelete(null);
    }
  };

  const handleDialogSuccess = async () => {
    await loadPolicies();
    setSelectedPolicy(null);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">טוען...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen relative">
      <FuturisticBackground />
      <div className="container mx-auto px-4 py-8 relative z-10">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-4xl font-heading bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent mb-2">
              ניהול פוליסות
            </h1>
            <p className="text-muted-foreground">נהל את כל הפוליסות שלך במקום אחד</p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => navigate('/client/dashboard')}>
              <ArrowRight className="ml-2" size={20} />
              חזרה לדשבורד
            </Button>
            <Button
              onClick={() => {
                setSelectedPolicy(null);
                setDialogOpen(true);
              }}
              className="shadow-primary"
            >
              <Plus className="ml-2" size={20} />
              הוסף פוליסה
            </Button>
          </div>
        </div>

        {/* Stats */}
        <PolicyStats policies={policies} />

        {/* Charts */}
        {policies.length > 0 && (
          <div className="mt-6 space-y-4">
            <ChartFilters
              dateRange={chartDateRange}
              onDateRangeChange={setChartDateRange}
              provider={chartProvider}
              onProviderChange={setChartProvider}
              viewMode={chartViewMode}
              onViewModeChange={setChartViewMode}
              providers={getUniqueProviders()}
            />
            <PolicyCharts 
              policies={policies}
              dateRange={chartDateRange}
              provider={chartProvider}
              viewMode={chartViewMode}
            />
          </div>
        )}

        {/* Filters */}
        <div className="mt-6">
          <PolicyFilters
            searchTerm={searchTerm}
            onSearchChange={setSearchTerm}
            typeFilter={typeFilter}
            onTypeFilterChange={setTypeFilter}
            statusFilter={statusFilter}
            onStatusFilterChange={setStatusFilter}
          />
        </div>

        {/* Policies Grid */}
        <div className="mt-6">
          {filteredPolicies.length === 0 ? (
            <div className="text-center py-12 glass-card">
              <p className="text-muted-foreground text-lg">
                {policies.length === 0
                  ? 'אין פוליסות עדיין. התחל על ידי הוספת פוליסה חדשה.'
                  : 'לא נמצאו פוליסות התואמות לסינון.'}
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredPolicies.map((policy) => (
                <PolicyCard
                  key={policy.id}
                  policy={policy}
                  onEdit={handleEdit}
                  onDelete={handleDelete}
                />
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Policy Dialog */}
      <PolicyDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        policy={selectedPolicy}
        onSuccess={handleDialogSuccess}
      />

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>האם אתה בטוח?</AlertDialogTitle>
            <AlertDialogDescription>
              פעולה זו תמחק את הפוליסה לצמיתות. לא ניתן לבטל פעולה זו.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>ביטול</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDelete} className="bg-destructive">
              מחק
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default PoliciesManagement;
