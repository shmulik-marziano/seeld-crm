import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowRight, Save, Loader2, User, Users, Briefcase, Heart, Target, FileText } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

// Tab Components
import PersonalDetailsTab from "@/components/customer/tabs/PersonalDetailsTab";
import AdditionalDetailsTab from "@/components/customer/tabs/AdditionalDetailsTab";
import SpouseTab from "@/components/customer/tabs/SpouseTab";
import FamilyMembersTab from "@/components/customer/tabs/FamilyMembersTab";
import EmployersTab from "@/components/customer/tabs/EmployersTab";
import BeneficiariesTab from "@/components/customer/tabs/BeneficiariesTab";
import NeedsAssessmentSection from "@/components/customer/NeedsAssessmentSection";
import CoveragesSummaryDialog from "@/components/customer/CoveragesSummaryDialog";
import CustomerPortfolioSection from "@/components/customer/CustomerPortfolioSection";
import CustomerFormsSection from "@/components/customer/CustomerFormsSection";

interface Client {
  id: string;
  full_name: string;
  first_name?: string;
  last_name?: string;
  phone: string;
  email?: string;
  id_number?: string;
  id_type?: string;
  date_of_birth?: string;
  gender?: string;
  marital_status?: string;
  is_smoker?: boolean;
  employment_status?: string;
  monthly_income?: number;
  meeting_date?: string;
  city?: string;
  street?: string;
  house_number?: string;
  apartment?: string;
  postal_code?: string;
  po_box?: string;
  fax?: string;
  health_fund?: string;
  supplementary_insurance?: string;
  height?: number;
  weight?: number;
  cigarettes_per_day?: number;
  is_us_citizen?: boolean;
  is_us_resident?: boolean;
  born_in_us?: boolean;
  birth_country?: string;
  id_issue_date?: string;
  id_document_url?: string;
  pdf_accessibility?: boolean;
  occupation?: string;
  dangerous_hobbies?: boolean;
  address?: string;
  agent_id: string;
  status?: string;
}

const CustomerCard = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();

  const [client, setClient] = useState<Client | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [activeTab, setActiveTab] = useState("personal");
  const [showCoverages, setShowCoverages] = useState(false);

  useEffect(() => {
    if (id) {
      fetchClient();
      addToRecentCustomers(id);
    }
  }, [id]);

  const fetchClient = async () => {
    try {
      const { data, error } = await supabase
        .from('clients')
        .select('*')
        .eq('id', id)
        .single();

      if (error) throw error;
      setClient(data);
    } catch (error: any) {
      toast({
        title: "שגיאה בטעינת לקוח",
        description: error.message,
        variant: "destructive"
      });
      navigate('/agent/dashboard');
    } finally {
      setIsLoading(false);
    }
  };

  const addToRecentCustomers = (clientId: string) => {
    const stored = localStorage.getItem('recentCustomers');
    let recent: string[] = stored ? JSON.parse(stored) : [];
    recent = recent.filter(id => id !== clientId);
    recent.unshift(clientId);
    recent = recent.slice(0, 10);
    localStorage.setItem('recentCustomers', JSON.stringify(recent));
  };

  const handleSave = async (updates: Partial<Client>) => {
    if (!client) return;

    setIsSaving(true);
    try {
      const { error } = await supabase
        .from('clients')
        .update(updates)
        .eq('id', client.id);

      if (error) throw error;

      setClient({ ...client, ...updates });
      toast({
        title: "נשמר בהצלחה",
        description: "הפרטים עודכנו"
      });
    } catch (error: any) {
      toast({
        title: "שגיאה בשמירה",
        description: error.message,
        variant: "destructive"
      });
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary-50/20 p-6 flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!client) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary-50/20 p-6">
        <p className="text-center text-muted-foreground">לקוח לא נמצא</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary-50/20 p-6" dir="rtl">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <Button variant="ghost" onClick={() => navigate(-1)}>
              <ArrowRight className="h-4 w-4" />
            </Button>
            <div>
              <h1 className="text-3xl font-heading font-bold gradient-primary bg-clip-text text-transparent">
                {client.full_name}
              </h1>
              <p className="text-muted-foreground">
                {client.id_number && `ת.ז: ${client.id_number}`}
              </p>
            </div>
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              className="bg-green-50 hover:bg-green-100 text-green-700 border-green-200"
              onClick={() => setShowCoverages(true)}
            >
              <FileText className="h-4 w-4 ml-2" />
              כיסויים וצבירות
            </Button>
          </div>
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Customer Data Section */}
          <div className="lg:col-span-2">
            <Card className="glass-card">
              <CardHeader className="pb-4">
                <CardTitle className="flex items-center gap-2">
                  <User className="h-5 w-5" />
                  נתוני לקוח
                </CardTitle>
              </CardHeader>
              <CardContent>
                <Tabs value={activeTab} onValueChange={setActiveTab} dir="rtl">
                  <TabsList className="grid grid-cols-6 w-full mb-6">
                    <TabsTrigger value="personal" className="text-xs sm:text-sm">
                      פרטים
                    </TabsTrigger>
                    <TabsTrigger value="additional" className="text-xs sm:text-sm">
                      פרטים נוספים
                    </TabsTrigger>
                    <TabsTrigger value="spouse" className="text-xs sm:text-sm">
                      בן/בת זוג
                    </TabsTrigger>
                    <TabsTrigger value="family" className="text-xs sm:text-sm">
                      בני משפחה
                    </TabsTrigger>
                    <TabsTrigger value="employer" className="text-xs sm:text-sm">
                      מעסיק
                    </TabsTrigger>
                    <TabsTrigger value="beneficiaries" className="text-xs sm:text-sm">
                      מוטבים
                    </TabsTrigger>
                  </TabsList>

                  <TabsContent value="personal">
                    <PersonalDetailsTab
                      client={client}
                      onSave={handleSave}
                      isSaving={isSaving}
                    />
                  </TabsContent>

                  <TabsContent value="additional">
                    <AdditionalDetailsTab
                      client={client}
                      onSave={handleSave}
                      isSaving={isSaving}
                    />
                  </TabsContent>

                  <TabsContent value="spouse">
                    <SpouseTab clientId={client.id} />
                  </TabsContent>

                  <TabsContent value="family">
                    <FamilyMembersTab clientId={client.id} />
                  </TabsContent>

                  <TabsContent value="employer">
                    <EmployersTab clientId={client.id} />
                  </TabsContent>

                  <TabsContent value="beneficiaries">
                    <BeneficiariesTab clientId={client.id} />
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>
          </div>

          {/* Needs Assessment Section */}
          <div className="lg:col-span-1">
            <NeedsAssessmentSection clientId={client.id} />
          </div>
        </div>

        {/* Customer Portfolio Section */}
        <div className="mt-6">
          <CustomerPortfolioSection clientId={client.id} />
        </div>

        {/* Customer Forms Section */}
        <div className="mt-6">
          <CustomerFormsSection clientId={client.id} />
        </div>
      </div>

      {/* Coverages Dialog */}
      <CoveragesSummaryDialog
        open={showCoverages}
        onOpenChange={setShowCoverages}
        clientId={client.id}
      />
    </div>
  );
};

export default CustomerCard;
