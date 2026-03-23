import { useState } from "react";
import { Building2, Users, TrendingUp, AlertCircle, Calendar, DollarSign } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

const AgentCommandCenter = () => {
  const [activeTab, setActiveTab] = useState("overview");

  // Mock data - יוחלף בנתונים אמיתיים מ-Supabase
  const stats = {
    totalClients: 45,
    activeClients: 38,
    newLeads: 12,
    pendingCommissions: 15000,
    thisMonthPolicies: 8,
    upcomingMeetings: 5
  };

  const recentAlerts = [
    { id: 1, type: "commission", message: "עמלה חדשה התקבלה - ₪5,000", time: "לפני 2 שעות" },
    { id: 2, type: "lead", message: "ליד חם חדש - דני כהן", time: "לפני 4 שעות" },
    { id: 3, type: "policy", message: "פוליסה עומדת לפוג - לקוח משה לוי", time: "אתמול" }
  ];

  const upcomingMeetings = [
    { id: 1, client: "שרה כהן", time: "היום 14:00", type: "פגישת מעקב" },
    { id: 2, client: "דוד לוי", time: "מחר 10:00", type: "פגישה ראשונית" },
    { id: 3, client: "רות מזרחי", time: "מחר 15:30", type: "חתימה על טפסים" }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary-50/20 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-heading font-bold gradient-primary bg-clip-text text-transparent">
              Command Center
            </h1>
            <p className="text-muted-foreground mt-2">
              ברוך הבא בחזרה, שמוליק 👋
            </p>
          </div>
          <Button className="bg-primary hover:bg-primary-600">
            + לקוח חדש
          </Button>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4">
          <Card className="glass-card hover-lift">
            <CardContent className="p-6">
              <div className="flex items-center gap-2 mb-2">
                <Users className="h-5 w-5 text-primary" />
                <p className="text-sm text-muted-foreground">סה"כ לקוחות</p>
              </div>
              <p className="text-3xl font-bold">{stats.totalClients}</p>
            </CardContent>
          </Card>

          <Card className="glass-card hover-lift">
            <CardContent className="p-6">
              <div className="flex items-center gap-2 mb-2">
                <TrendingUp className="h-5 w-5 text-secondary" />
                <p className="text-sm text-muted-foreground">לקוחות פעילים</p>
              </div>
              <p className="text-3xl font-bold">{stats.activeClients}</p>
            </CardContent>
          </Card>

          <Card className="glass-card hover-lift">
            <CardContent className="p-6">
              <div className="flex items-center gap-2 mb-2">
                <AlertCircle className="h-5 w-5 text-accent" />
                <p className="text-sm text-muted-foreground">לידים חדשים</p>
              </div>
              <p className="text-3xl font-bold">{stats.newLeads}</p>
            </CardContent>
          </Card>

          <Card className="glass-card hover-lift">
            <CardContent className="p-6">
              <div className="flex items-center gap-2 mb-2">
                <DollarSign className="h-5 w-5 text-secondary" />
                <p className="text-sm text-muted-foreground">עמלות ממתינות</p>
              </div>
              <p className="text-3xl font-bold">₪{stats.pendingCommissions.toLocaleString()}</p>
            </CardContent>
          </Card>

          <Card className="glass-card hover-lift">
            <CardContent className="p-6">
              <div className="flex items-center gap-2 mb-2">
                <Building2 className="h-5 w-5 text-primary" />
                <p className="text-sm text-muted-foreground">פוליסות החודש</p>
              </div>
              <p className="text-3xl font-bold">{stats.thisMonthPolicies}</p>
            </CardContent>
          </Card>

          <Card className="glass-card hover-lift">
            <CardContent className="p-6">
              <div className="flex items-center gap-2 mb-2">
                <Calendar className="h-5 w-5 text-accent" />
                <p className="text-sm text-muted-foreground">פגישות קרובות</p>
              </div>
              <p className="text-3xl font-bold">{stats.upcomingMeetings}</p>
            </CardContent>
          </Card>
        </div>

        {/* Main Content Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-4 bg-card/50 backdrop-blur">
            <TabsTrigger value="overview">סקירה</TabsTrigger>
            <TabsTrigger value="clients">לקוחות</TabsTrigger>
            <TabsTrigger value="leads">לידים</TabsTrigger>
            <TabsTrigger value="commissions">עמלות</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6 mt-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Alerts Card */}
              <Card className="glass-card">
                <CardHeader>
                  <CardTitle>התראות אחרונות</CardTitle>
                  <CardDescription>עדכונים חשובים מהמערכת</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {recentAlerts.map((alert) => (
                    <div key={alert.id} className="flex items-start gap-4 p-3 rounded-lg bg-muted/50 hover:bg-muted transition-colors">
                      <AlertCircle className="h-5 w-5 text-accent mt-0.5" />
                      <div className="flex-1">
                        <p className="font-medium">{alert.message}</p>
                        <p className="text-sm text-muted-foreground">{alert.time}</p>
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>

              {/* Upcoming Meetings Card */}
              <Card className="glass-card">
                <CardHeader>
                  <CardTitle>פגישות קרובות</CardTitle>
                  <CardDescription>לוח הזמנים שלך</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {upcomingMeetings.map((meeting) => (
                    <div key={meeting.id} className="flex items-start gap-4 p-3 rounded-lg bg-muted/50 hover:bg-muted transition-colors">
                      <Calendar className="h-5 w-5 text-primary mt-0.5" />
                      <div className="flex-1">
                        <div className="flex items-center justify-between">
                          <p className="font-medium">{meeting.client}</p>
                          <Badge variant="outline">{meeting.type}</Badge>
                        </div>
                        <p className="text-sm text-muted-foreground">{meeting.time}</p>
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="clients">
            <Card className="glass-card">
              <CardHeader>
                <CardTitle>ניהול לקוחות</CardTitle>
                <CardDescription>כל הלקוחות שלך במקום אחד</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">טבלת לקוחות תבוא כאן...</p>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="leads">
            <Card className="glass-card">
              <CardHeader>
                <CardTitle>ניהול לידים</CardTitle>
                <CardDescription>עקוב אחרי הלידים שלך</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">טבלת לידים תבוא כאן...</p>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="commissions">
            <Card className="glass-card">
              <CardHeader>
                <CardTitle>מעקב עמלות</CardTitle>
                <CardDescription>כל העמלות שלך במקום אחד</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">טבלת עמלות תבוא כאן...</p>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default AgentCommandCenter;
