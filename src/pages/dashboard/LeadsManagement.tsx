import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { ArrowRight, RefreshCw } from 'lucide-react';
import LeadsTable from '@/components/leads/LeadsTable';
import LeadFilters from '@/components/leads/LeadFilters';
import EditLeadDialog from '@/components/leads/EditLeadDialog';

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

const LeadsManagement = () => {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [filteredLeads, setFilteredLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('all');
  const [serviceFilter, setServiceFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    checkAuth();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [leads, statusFilter, serviceFilter, searchQuery]);

  const checkAuth = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    
    if (!session) {
      navigate('/agent/auth');
      return;
    }

    const { data: roleData } = await supabase
      .from('user_roles')
      .select('role')
      .eq('user_id', session.user.id)
      .single();

    if (roleData?.role !== 'agent' && roleData?.role !== 'admin') {
      toast({
        title: 'שגיאה',
        description: 'אין לך הרשאה לגשת לעמוד זה',
        variant: 'destructive',
      });
      navigate('/');
      return;
    }

    loadLeads();
  };

  const loadLeads = async () => {
    setLoading(true);

    const { data, error } = await supabase
      .from('leads')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      toast({
        title: 'שגיאה',
        description: 'לא הצלחנו לטעון את הלידים',
        variant: 'destructive',
      });
      setLoading(false);
      return;
    }

    // Fetch agent profiles separately
    const leadsWithProfiles = await Promise.all(
      (data || []).map(async (lead) => {
        if (lead.assigned_agent_id) {
          const { data: profileData } = await supabase
            .from('profiles')
            .select('full_name')
            .eq('user_id', lead.assigned_agent_id)
            .single();
          
          return {
            ...lead,
            profiles: profileData,
          };
        }
        return lead;
      })
    );

    setLeads(leadsWithProfiles);
    setLoading(false);
  };

  const applyFilters = () => {
    let filtered = [...leads];

    if (statusFilter !== 'all') {
      filtered = filtered.filter((lead) => lead.status === statusFilter);
    }

    if (serviceFilter !== 'all') {
      filtered = filtered.filter((lead) => lead.service_type === serviceFilter);
    }

    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (lead) =>
          lead.full_name.toLowerCase().includes(query) ||
          lead.email.toLowerCase().includes(query) ||
          lead.phone.includes(query)
      );
    }

    setFilteredLeads(filtered);
  };

  const handleEdit = (lead: Lead) => {
    setSelectedLead(lead);
    setDialogOpen(true);
  };

  const handleSuccess = () => {
    loadLeads();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-accent/5">
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-4xl font-heading bg-gradient-to-r from-accent to-secondary bg-clip-text text-transparent mb-2">
              ניהול לידים
            </h1>
            <p className="text-muted-foreground">
              ניהול ומעקב אחר כל הפניות והלידים במערכת
            </p>
          </div>
          <div className="flex gap-3">
            <Button variant="outline" onClick={loadLeads} disabled={loading}>
              <RefreshCw className={`ml-2 h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
              רענן
            </Button>
            <Button onClick={() => navigate('/agent/dashboard')}>
              <ArrowRight className="ml-2 h-4 w-4" />
              חזור לדשבורד
            </Button>
          </div>
        </div>

        <Card className="backdrop-blur-sm bg-background/80 border-accent/20 mb-6">
          <CardHeader>
            <CardTitle>סינון וחיפוש</CardTitle>
            <CardDescription>סנן את הלידים לפי סטטוס, שירות או חפש לפי שם</CardDescription>
          </CardHeader>
          <CardContent>
            <LeadFilters
              statusFilter={statusFilter}
              serviceFilter={serviceFilter}
              searchQuery={searchQuery}
              onStatusChange={setStatusFilter}
              onServiceChange={setServiceFilter}
              onSearchChange={setSearchQuery}
            />
          </CardContent>
        </Card>

        <Card className="backdrop-blur-sm bg-background/80 border-accent/20">
          <CardHeader>
            <CardTitle>רשימת לידים ({filteredLeads.length})</CardTitle>
            <CardDescription>
              {filteredLeads.length === leads.length
                ? `סך הכל ${leads.length} לידים במערכת`
                : `מציג ${filteredLeads.length} מתוך ${leads.length} לידים`}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex items-center justify-center py-12">
                <RefreshCw className="h-8 w-8 animate-spin text-muted-foreground" />
              </div>
            ) : (
              <LeadsTable leads={filteredLeads} onEdit={handleEdit} />
            )}
          </CardContent>
        </Card>
      </div>

      <EditLeadDialog
        lead={selectedLead}
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        onSuccess={handleSuccess}
      />
    </div>
  );
};

export default LeadsManagement;
