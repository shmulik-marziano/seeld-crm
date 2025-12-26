import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { DollarSign, TrendingUp, AlertCircle, CheckCircle, Clock, RefreshCw, Download } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const CommissionsDashboard = () => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);
  const [commissions, setCommissions] = useState<any[]>([]);
  const [stats, setStats] = useState({
    totalReceived: 0,
    totalPending: 0,
    totalDisputed: 0,
    thisMonthReceived: 0,
    matchRate: 0
  });

  useEffect(() => {
    loadCommissions();
  }, []);

  const loadCommissions = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        navigate('/agent/auth');
        return;
      }

      // Load commissions
      const { data: commissionsData, error } = await supabase
        .from('commissions')
        .select(`
          *,
          clients (full_name),
          policies (policy_number, provider, type)
        `)
        .eq('agent_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;

      setCommissions(commissionsData || []);

      // Calculate stats
      const received = commissionsData?.filter(c => c.status === 'received') || [];
      const pending = commissionsData?.filter(c => c.status === 'pending') || [];
      const disputed = commissionsData?.filter(c => c.status === 'disputed') || [];
      
      const thisMonth = new Date();
      thisMonth.setDate(1);
      const thisMonthReceived = received.filter(c => 
        new Date(c.received_date || c.created_at) >= thisMonth
      );

      const matchedAuto = received.filter(c => c.matched_automatically).length;
      const matchRate = received.length > 0 ? (matchedAuto / received.length) * 100 : 0;

      setStats({
        totalReceived: received.reduce((sum, c) => sum + Number(c.amount), 0),
        totalPending: pending.reduce((sum, c) => sum + Number(c.amount), 0),
        totalDisputed: disputed.reduce((sum, c) => sum + Number(c.amount), 0),
        thisMonthReceived: thisMonthReceived.reduce((sum, c) => sum + Number(c.amount), 0),
        matchRate: Math.round(matchRate)
      });

    } catch (error) {
      console.error('Error loading commissions:', error);
      toast({
        title: "שגיאה",
        description: "לא הצלחנו לטעון את העמלות",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const syncBankTransactions = async () => {
    setSyncing(true);
    try {
      const { data, error } = await supabase.functions.invoke('sync-bank-transactions');
      
      if (error) throw error;

      toast({
        title: "✅ סנכרון הושלם",
        description: `סונכנו ${data.synced} עסקאות, ${data.matched} עמלות תואמו אוטומטית`
      });

      await loadCommissions();
    } catch (error) {
      console.error('Error syncing:', error);
      toast({
        title: "שגיאה",
        description: "הסנכרון נכשל",
        variant: "destructive"
      });
    } finally {
      setSyncing(false);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'received':
        return <Badge className="bg-secondary"><CheckCircle className="h-3 w-3 ml-1" />התקבלה</Badge>;
      case 'pending':
        return <Badge variant="outline"><Clock className="h-3 w-3 ml-1" />ממתינה</Badge>;
      case 'disputed':
        return <Badge variant="destructive"><AlertCircle className="h-3 w-3 ml-1" />במחלוקת</Badge>;
      default:
        return <Badge>{status}</Badge>;
    }
  };

  // Prepare chart data
  const chartData = commissions
    .filter(c => c.received_date)
    .reduce((acc: any[], commission) => {
      const month = new Date(commission.received_date).toLocaleDateString('he-IL', { year: 'numeric', month: 'short' });
      const existing = acc.find(item => item.month === month);
      if (existing) {
        existing.amount += Number(commission.amount);
      } else {
        acc.push({ month, amount: Number(commission.amount) });
      }
      return acc;
    }, [])
    .slice(-6); // Last 6 months

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary-50/20 flex items-center justify-center">
        <RefreshCw className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary-50/20 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-heading font-bold gradient-primary bg-clip-text text-transparent">
              מעקב עמלות
            </h1>
            <p className="text-muted-foreground mt-2">
              From Money Backwards - העמלה היא האמת 💰
            </p>
          </div>
          <div className="flex gap-3">
            <Button 
              onClick={syncBankTransactions}
              disabled={syncing}
              className="bg-primary hover:bg-primary-600"
            >
              {syncing ? (
                <>
                  <RefreshCw className="ml-2 h-4 w-4 animate-spin" />
                  מסנכרן...
                </>
              ) : (
                <>
                  <RefreshCw className="ml-2 h-4 w-4" />
                  סנכרן בנק
                </>
              )}
            </Button>
            <Button variant="outline">
              <Download className="ml-2 h-4 w-4" />
              ייצא לאקסל
            </Button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          <Card className="glass-card hover-lift">
            <CardContent className="p-6">
              <div className="flex items-center gap-2 mb-2">
                <CheckCircle className="h-5 w-5 text-secondary" />
                <p className="text-sm text-muted-foreground">התקבלו</p>
              </div>
              <p className="text-3xl font-bold">₪{stats.totalReceived.toLocaleString()}</p>
            </CardContent>
          </Card>

          <Card className="glass-card hover-lift">
            <CardContent className="p-6">
              <div className="flex items-center gap-2 mb-2">
                <Clock className="h-5 w-5 text-accent" />
                <p className="text-sm text-muted-foreground">ממתינות</p>
              </div>
              <p className="text-3xl font-bold">₪{stats.totalPending.toLocaleString()}</p>
            </CardContent>
          </Card>

          <Card className="glass-card hover-lift">
            <CardContent className="p-6">
              <div className="flex items-center gap-2 mb-2">
                <TrendingUp className="h-5 w-5 text-primary" />
                <p className="text-sm text-muted-foreground">החודש</p>
              </div>
              <p className="text-3xl font-bold">₪{stats.thisMonthReceived.toLocaleString()}</p>
            </CardContent>
          </Card>

          <Card className="glass-card hover-lift">
            <CardContent className="p-6">
              <div className="flex items-center gap-2 mb-2">
                <AlertCircle className="h-5 w-5 text-destructive" />
                <p className="text-sm text-muted-foreground">במחלוקת</p>
              </div>
              <p className="text-3xl font-bold">₪{stats.totalDisputed.toLocaleString()}</p>
            </CardContent>
          </Card>

          <Card className="glass-card hover-lift">
            <CardContent className="p-6">
              <div className="flex items-center gap-2 mb-2">
                <DollarSign className="h-5 w-5 text-secondary" />
                <p className="text-sm text-muted-foreground">תואם אוטומטית</p>
              </div>
              <p className="text-3xl font-bold">{stats.matchRate}%</p>
            </CardContent>
          </Card>
        </div>

        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card className="glass-card">
            <CardHeader>
              <CardTitle>עמלות לאורך זמן</CardTitle>
              <CardDescription>6 חודשים אחרונים</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Line type="monotone" dataKey="amount" stroke="hsl(var(--primary))" name="סכום" />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <Card className="glass-card">
            <CardHeader>
              <CardTitle>התפלגות עמלות</CardTitle>
              <CardDescription>לפי חברת ביטוח</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="amount" fill="hsl(var(--secondary))" name="סכום" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>

        {/* Commissions Table */}
        <Card className="glass-card">
          <CardHeader>
            <CardTitle>כל העמלות</CardTitle>
            <CardDescription>{commissions.length} עמלות</CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>תאריך</TableHead>
                  <TableHead>לקוח</TableHead>
                  <TableHead>חברה</TableHead>
                  <TableHead>סוג</TableHead>
                  <TableHead>סכום</TableHead>
                  <TableHead>סטטוס</TableHead>
                  <TableHead>תואם אוטומטית</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {commissions.map((commission) => (
                  <TableRow key={commission.id} className="hover:bg-muted/50">
                    <TableCell>
                      {new Date(commission.expected_date || commission.created_at).toLocaleDateString('he-IL')}
                    </TableCell>
                    <TableCell className="font-medium">
                      {commission.clients?.full_name || 'לא ידוע'}
                    </TableCell>
                    <TableCell>{commission.policies?.provider || 'לא ידוע'}</TableCell>
                    <TableCell>{commission.policies?.type || 'לא ידוע'}</TableCell>
                    <TableCell className="font-bold">₪{Number(commission.amount).toLocaleString()}</TableCell>
                    <TableCell>{getStatusBadge(commission.status)}</TableCell>
                    <TableCell>
                      {commission.matched_automatically ? (
                        <Badge className="bg-secondary/20 text-secondary">✓ AI</Badge>
                      ) : (
                        <span className="text-muted-foreground text-sm">ידני</span>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default CommissionsDashboard;
