import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  ArrowRight,
  RefreshCw,
  Download,
  Upload,
  FileSpreadsheet,
  User,
  Calendar,
  Phone,
  Mail,
  Loader2,
  PieChart,
  TrendingUp,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

// Portfolio components
import { SavingsCards } from "@/components/portfolio/SavingsCards";
import { ProductsTable, Product } from "@/components/portfolio/ProductsTable";
import { HealthTable, HealthProduct } from "@/components/portfolio/HealthTable";
import { Gauge } from "@/components/ui/gauge";
import { ProgressBar } from "@/components/ui/progress-bar";

interface Client {
  id: string;
  first_name: string;
  last_name: string;
  email?: string;
  phone?: string;
  id_number?: string;
  date_of_birth?: string;
  city?: string;
  status?: string;
}

// Mock data for demonstration
const mockSavingsData = {
  grossSavings: 1250000,
  pensionSavings: 850000,
  severance: 180000,
  deposits: 4500,
  taxExempt: 220000,
  coverage: 2500000,
};

const mockPensionProducts: Product[] = [
  {
    id: "1",
    type: "קרן פנסיה",
    company: "מגדל",
    policyNumber: "12345678",
    track: "מסלול כללי 40-50",
    accumulated: 450000,
    monthlyDeposit: 2500,
    managementFeeDeposit: 4.0,
    managementFeeAccumulated: 1.05,
    status: "active",
    source: "mislaka",
    recommendation: "keep",
  },
  {
    id: "2",
    type: "קופת גמל",
    company: "הראל",
    policyNumber: "87654321",
    track: "מסלול אג״ח",
    accumulated: 180000,
    monthlyDeposit: 1500,
    managementFeeDeposit: 3.5,
    managementFeeAccumulated: 0.95,
    status: "active",
    source: "har_habituach",
    recommendation: "replace",
  },
  {
    id: "3",
    type: "קרן השתלמות",
    company: "כלל",
    policyNumber: "11223344",
    track: "מסלול מניות",
    accumulated: 220000,
    monthlyDeposit: 1000,
    managementFeeDeposit: 2.0,
    managementFeeAccumulated: 0.75,
    status: "active",
    source: "mislaka",
  },
];

const mockHealthProducts: HealthProduct[] = [
  {
    id: "1",
    type: "health",
    company: "הפניקס",
    planName: "זהב פלוס",
    policyNumber: "H12345",
    coverageAmount: 1000000,
    monthlyPremium: 350,
    status: "active",
    startDate: "2020-01-15",
    source: "manual",
    recommendation: "keep",
  },
  {
    id: "2",
    type: "disability",
    company: "מגדל",
    planName: "אכ״ע מקיף",
    policyNumber: "D54321",
    coverageAmount: 15000,
    monthlyPremium: 280,
    status: "active",
    startDate: "2019-06-01",
    source: "har_habituach",
  },
  {
    id: "3",
    type: "critical_illness",
    company: "הראל",
    planName: "מחלות קשות פלוס",
    policyNumber: "CI98765",
    coverageAmount: 500000,
    monthlyPremium: 150,
    status: "active",
    startDate: "2021-03-10",
    source: "manual",
    recommendation: "keep",
  },
];

const CustomerPortfolio = () => {
  const { clientId } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();

  const [client, setClient] = useState<Client | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("overview");

  useEffect(() => {
    if (clientId) {
      fetchClient();
    }
  }, [clientId]);

  const fetchClient = async () => {
    try {
      const { data, error } = await supabase
        .from("clients")
        .select("*")
        .eq("id", clientId)
        .single();

      if (error) throw error;
      setClient(data);
    } catch (error: any) {
      console.error("Error fetching client:", error);
      toast({
        title: "שגיאה בטעינת נתוני לקוח",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleRefresh = () => {
    toast({ title: "מרענן נתונים..." });
    fetchClient();
  };

  const handleExport = () => {
    toast({ title: "מייצא דוח לקוח..." });
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

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-crm-primary" />
      </div>
    );
  }

  if (!client) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] gap-4">
        <p className="text-crm-text-secondary">לקוח לא נמצא</p>
        <Button onClick={() => navigate("/agent/command-center")}>
          <ArrowRight className="h-4 w-4 ml-2" />
          חזרה
        </Button>
      </div>
    );
  }

  const age = calculateAge(client.date_of_birth);

  return (
    <div className="min-h-screen bg-crm-bg-secondary p-6" dir="rtl">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-4">
          <Button
            variant="ghost"
            onClick={() => navigate(`/agent/customer/${clientId}`)}
            className="gap-2"
          >
            <ArrowRight className="h-4 w-4" />
            חזרה לכרטיס לקוח
          </Button>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={handleRefresh}>
              <RefreshCw className="h-4 w-4 ml-2" />
              רענון
            </Button>
            <Button variant="outline" size="sm" onClick={handleExport}>
              <Download className="h-4 w-4 ml-2" />
              ייצוא
            </Button>
            <Button
              size="sm"
              onClick={() => navigate("/agent/data-import")}
            >
              <Upload className="h-4 w-4 ml-2" />
              ייבוא נתונים
            </Button>
          </div>
        </div>

        {/* Client Info Bar */}
        <Card className="border-crm-border-light">
          <CardContent className="py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-6">
                <div className="w-12 h-12 rounded-full bg-crm-primary-light flex items-center justify-center">
                  <User className="h-6 w-6 text-crm-primary" />
                </div>
                <div>
                  <h1 className="text-xl font-bold text-crm-text-primary">
                    {client.first_name} {client.last_name}
                  </h1>
                  <div className="flex items-center gap-4 text-sm text-crm-text-secondary mt-1">
                    {client.id_number && <span>ת.ז: {client.id_number}</span>}
                    {age && (
                      <span className="flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        גיל {age}
                      </span>
                    )}
                    {client.city && <span>{client.city}</span>}
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-4 text-sm">
                {client.phone && (
                  <span className="flex items-center gap-1 text-crm-text-secondary">
                    <Phone className="h-4 w-4" />
                    {client.phone}
                  </span>
                )}
                {client.email && (
                  <span className="flex items-center gap-1 text-crm-text-secondary">
                    <Mail className="h-4 w-4" />
                    {client.email}
                  </span>
                )}
                {client.status && (
                  <Badge
                    className={
                      client.status === "active"
                        ? "bg-crm-success-light text-crm-success-dark"
                        : "bg-gray-100 text-gray-600"
                    }
                  >
                    {client.status === "active" ? "פעיל" : client.status}
                  </Badge>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Savings Summary Cards */}
      <div className="mb-6">
        <h2 className="text-lg font-semibold text-crm-text-primary mb-4">
          סיכום תיק לקוח
        </h2>
        <SavingsCards data={mockSavingsData} />
      </div>

      {/* Content Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="mb-4">
          <TabsTrigger value="overview">סקירה כללית</TabsTrigger>
          <TabsTrigger value="pension">חיסכון פנסיוני</TabsTrigger>
          <TabsTrigger value="health">ביטוחי בריאות</TabsTrigger>
          <TabsTrigger value="analysis">ניתוח וסטטיסטיקות</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          {/* Overview with charts */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <Card className="lg:col-span-2">
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <PieChart className="h-5 w-5" />
                  התפלגות חיסכון
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-4">
                    <ProgressBar
                      value={68}
                      label="קרנות פנסיה"
                      color="blue"
                      size="md"
                    />
                    <ProgressBar
                      value={22}
                      label="קופות גמל"
                      color="green"
                      size="md"
                    />
                    <ProgressBar
                      value={10}
                      label="קרנות השתלמות"
                      color="purple"
                      size="md"
                    />
                  </div>
                  <div className="flex items-center justify-center">
                    <Gauge value={75} label="בריאות התיק" color="green" size="lg" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <TrendingUp className="h-5 w-5" />
                  נקודות לטיפול
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-3">
                  <li className="flex items-start gap-2">
                    <span className="w-2 h-2 rounded-full bg-crm-warning mt-2" />
                    <span className="text-sm">
                      קופת גמל בהראל - דמי ניהול גבוהים, מומלץ לבדוק ניוד
                    </span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="w-2 h-2 rounded-full bg-crm-success mt-2" />
                    <span className="text-sm">
                      ביטוח בריאות - כיסוי מלא, אין צורך בשינוי
                    </span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="w-2 h-2 rounded-full bg-crm-info mt-2" />
                    <span className="text-sm">
                      אין ביטוח סיעודי - מומלץ לבחון הצטרפות
                    </span>
                  </li>
                </ul>
              </CardContent>
            </Card>
          </div>

          {/* Quick tables */}
          <ProductsTable
            products={mockPensionProducts}
            title="מוצרים פנסיוניים"
            color="blue"
          />
          <HealthTable
            products={mockHealthProducts}
            title="ביטוחי בריאות וסיכונים"
            color="red"
          />
        </TabsContent>

        <TabsContent value="pension" className="space-y-6">
          <ProductsTable
            products={mockPensionProducts}
            title="קרנות פנסיה"
            color="blue"
          />
          <ProductsTable
            products={mockPensionProducts.filter((p) => p.type === "קופת גמל")}
            title="קופות גמל"
            color="green"
          />
          <ProductsTable
            products={mockPensionProducts.filter((p) => p.type === "קרן השתלמות")}
            title="קרנות השתלמות"
            color="purple"
          />
        </TabsContent>

        <TabsContent value="health" className="space-y-6">
          <HealthTable
            products={mockHealthProducts.filter((p) => p.type === "health")}
            title="ביטוחי בריאות"
            color="green"
          />
          <HealthTable
            products={mockHealthProducts.filter((p) => p.type === "disability")}
            title="ביטוחי אובדן כושר עבודה"
            color="blue"
          />
          <HealthTable
            products={mockHealthProducts.filter(
              (p) => p.type === "critical_illness" || p.type === "nursing"
            )}
            title="ביטוחי מחלות קשות וסיעודי"
            color="purple"
          />
        </TabsContent>

        <TabsContent value="analysis" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card>
              <CardContent className="pt-6">
                <div className="text-center">
                  <Gauge value={85} label="ציון תיק" color="green" size="md" />
                  <p className="mt-4 text-sm text-crm-text-secondary">
                    התיק במצב טוב - יש מקום לשיפור קל
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="text-center">
                  <Gauge value={70} label="גיוון" color="blue" size="md" />
                  <p className="mt-4 text-sm text-crm-text-secondary">
                    פיזור סביר בין מסלולים
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="text-center">
                  <Gauge value={90} label="כיסויים" color="green" size="md" />
                  <p className="mt-4 text-sm text-crm-text-secondary">
                    כיסויי ביטוח מקיפים
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="text-center">
                  <Gauge value={65} label="דמי ניהול" color="yellow" size="md" />
                  <p className="mt-4 text-sm text-crm-text-secondary">
                    יש מקום להורדת עלויות
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>המלצות לפעולה</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="p-4 bg-crm-warning-light rounded-lg">
                  <h4 className="font-semibold text-crm-warning-dark mb-2">
                    עדיפות גבוהה
                  </h4>
                  <ul className="list-disc list-inside space-y-1 text-sm">
                    <li>לנייד קופת גמל מהראל לחברה עם דמי ניהול נמוכים יותר</li>
                    <li>לבחון תוספת ביטוח סיעודי</li>
                  </ul>
                </div>

                <div className="p-4 bg-crm-info-light rounded-lg">
                  <h4 className="font-semibold text-crm-info-dark mb-2">
                    עדיפות בינונית
                  </h4>
                  <ul className="list-disc list-inside space-y-1 text-sm">
                    <li>לבחון שינוי מסלול השקעה בקרן השתלמות</li>
                    <li>לעדכן מוטבים בכל המוצרים</li>
                  </ul>
                </div>

                <div className="p-4 bg-crm-success-light rounded-lg">
                  <h4 className="font-semibold text-crm-success-dark mb-2">
                    לתשומת לב
                  </h4>
                  <ul className="list-disc list-inside space-y-1 text-sm">
                    <li>קרן הפנסיה במצב טוב - לשמור</li>
                    <li>ביטוח בריאות מקיף - לשמור</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default CustomerPortfolio;
