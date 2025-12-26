import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowRight, TrendingUp, CheckCircle2, Clock, XCircle, Target, DollarSign } from "lucide-react";
import { toast } from "sonner";
import FuturisticBackground from "@/components/FuturisticBackground";
import { Progress } from "@/components/ui/progress";
import { LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

interface TrackedRecommendation {
  id: string;
  recommendation_id: string;
  recommendation_type: string;
  recommendation_title: string;
  status: 'pending' | 'in_progress' | 'completed' | 'dismissed';
  predicted_savings: number;
  actual_savings: number | null;
  implementation_date: string | null;
  completion_date: string | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

const statusLabels = {
  pending: 'ממתין',
  in_progress: 'בתהליך',
  completed: 'הושלם',
  dismissed: 'נדחה'
};

const statusColors = {
  pending: 'secondary',
  in_progress: 'default',
  completed: 'default',
  dismissed: 'outline'
};

const statusIcons = {
  pending: Clock,
  in_progress: Target,
  completed: CheckCircle2,
  dismissed: XCircle
};

const COLORS = ['hsl(var(--primary))', 'hsl(var(--secondary))', 'hsl(var(--accent))', 'hsl(var(--muted))'];

export default function RecommendationTracking() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [trackedRecommendations, setTrackedRecommendations] = useState<TrackedRecommendation[]>([]);

  useEffect(() => {
    loadTracking();
  }, []);

  const loadTracking = async () => {
    try {
      setLoading(true);
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        navigate('/client/auth');
        return;
      }

      const { data, error } = await supabase
        .from('recommendation_tracking')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setTrackedRecommendations((data || []) as TrackedRecommendation[]);
    } catch (error) {
      console.error('Error loading tracking:', error);
      toast.error('שגיאה בטעינת נתוני המעקב');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <FuturisticBackground />
        <div className="relative z-10 flex items-center justify-center min-h-screen">
          <div className="text-center">
            <div className="w-12 h-12 mx-auto mb-4 border-4 border-primary border-t-transparent rounded-full animate-spin" />
            <p className="text-foreground text-lg">טוען נתוני מעקב...</p>
          </div>
        </div>
      </div>
    );
  }

  // Calculate statistics
  const completedRecs = trackedRecommendations.filter(r => r.status === 'completed');
  const totalPredictedSavings = trackedRecommendations.reduce((sum, r) => sum + Number(r.predicted_savings), 0);
  const totalActualSavings = completedRecs.reduce((sum, r) => sum + Number(r.actual_savings || 0), 0);
  const accuracyRate = totalPredictedSavings > 0 ? (totalActualSavings / totalPredictedSavings) * 100 : 0;
  const roi = totalActualSavings;

  // Status distribution data
  const statusDistribution = [
    { name: 'ממתין', value: trackedRecommendations.filter(r => r.status === 'pending').length },
    { name: 'בתהליך', value: trackedRecommendations.filter(r => r.status === 'in_progress').length },
    { name: 'הושלם', value: trackedRecommendations.filter(r => r.status === 'completed').length },
    { name: 'נדחה', value: trackedRecommendations.filter(r => r.status === 'dismissed').length }
  ].filter(item => item.value > 0);

  // Monthly savings trend
  const monthlySavings = completedRecs.reduce((acc, rec) => {
    if (rec.completion_date) {
      const month = new Date(rec.completion_date).toLocaleDateString('he-IL', { year: 'numeric', month: 'short' });
      if (!acc[month]) {
        acc[month] = { month, predicted: 0, actual: 0 };
      }
      acc[month].predicted += Number(rec.predicted_savings);
      acc[month].actual += Number(rec.actual_savings || 0);
    }
    return acc;
  }, {} as Record<string, any>);

  const savingsTrendData = Object.values(monthlySavings);

  // Type distribution
  const typeDistribution = trackedRecommendations.reduce((acc, rec) => {
    const type = rec.recommendation_type;
    if (!acc[type]) {
      acc[type] = { type, count: 0, savings: 0 };
    }
    acc[type].count += 1;
    if (rec.status === 'completed') {
      acc[type].savings += Number(rec.actual_savings || 0);
    }
    return acc;
  }, {} as Record<string, any>);

  const typeData = Object.values(typeDistribution);

  return (
    <div className="min-h-screen bg-background">
      <FuturisticBackground />
      
      <div className="relative z-10 container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <Button
            variant="ghost"
            onClick={() => navigate('/client/recommendations')}
            className="mb-4"
          >
            <ArrowRight className="ml-2 h-4 w-4" />
            חזרה להמלצות
          </Button>
          
          <div className="glass-card p-6">
            <div className="flex items-center gap-3">
              <TrendingUp className="h-8 w-8 text-primary" />
              <div>
                <h1 className="text-3xl font-bold text-foreground">מעקב ROI והשפעת שינויים</h1>
                <p className="text-muted-foreground">ניתוח מפורט של ביצוע המלצות וחיסכון בפועל</p>
              </div>
            </div>
          </div>
        </div>

        {/* KPI Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card className="glass-card">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">סה"כ המלצות</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-foreground">{trackedRecommendations.length}</div>
              <p className="text-xs text-muted-foreground mt-1">
                {completedRecs.length} הושלמו
              </p>
            </CardContent>
          </Card>

          <Card className="glass-card">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">חיסכון צפוי</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-primary">
                ₪{totalPredictedSavings.toLocaleString()}
              </div>
              <p className="text-xs text-muted-foreground mt-1">לשנה</p>
            </CardContent>
          </Card>

          <Card className="glass-card">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">חיסכון בפועל</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-green-500">
                ₪{totalActualSavings.toLocaleString()}
              </div>
              <p className="text-xs text-muted-foreground mt-1">מומש עד כה</p>
            </CardContent>
          </Card>

          <Card className="glass-card">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">דיוק תחזית</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="text-3xl font-bold text-foreground">
                  {accuracyRate.toFixed(0)}%
                </div>
                <Progress value={accuracyRate} className="h-2" />
                <p className="text-xs text-muted-foreground">
                  {accuracyRate >= 90 ? 'מצוין' : accuracyRate >= 70 ? 'טוב' : 'בינוני'}
                </p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Charts */}
        {trackedRecommendations.length > 0 && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
            {/* Savings Trend */}
            {savingsTrendData.length > 0 && (
              <Card className="glass-card">
                <CardHeader>
                  <CardTitle>מגמת חיסכון לאורך זמן</CardTitle>
                  <CardDescription>השוואה בין חיסכון צפוי לבפועל</CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <LineChart data={savingsTrendData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                      <XAxis dataKey="month" stroke="hsl(var(--muted-foreground))" />
                      <YAxis stroke="hsl(var(--muted-foreground))" />
                      <Tooltip 
                        contentStyle={{ 
                          backgroundColor: 'hsl(var(--popover))', 
                          border: '1px solid hsl(var(--border))',
                          borderRadius: '8px'
                        }}
                      />
                      <Legend />
                      <Line type="monotone" dataKey="predicted" stroke="hsl(var(--primary))" name="צפוי" strokeWidth={2} />
                      <Line type="monotone" dataKey="actual" stroke="hsl(var(--accent))" name="בפועל" strokeWidth={2} />
                    </LineChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            )}

            {/* Status Distribution */}
            <Card className="glass-card">
              <CardHeader>
                <CardTitle>התפלגות לפי סטטוס</CardTitle>
                <CardDescription>מצב ביצוע ההמלצות</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={statusDistribution}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                      outerRadius={80}
                      fill="hsl(var(--primary))"
                      dataKey="value"
                    >
                      {statusDistribution.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: 'hsl(var(--popover))', 
                        border: '1px solid hsl(var(--border))',
                        borderRadius: '8px'
                      }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Type Distribution */}
            {typeData.length > 0 && (
              <Card className="glass-card lg:col-span-2">
                <CardHeader>
                  <CardTitle>חיסכון לפי סוג המלצה</CardTitle>
                  <CardDescription>ביצועים לפי קטגוריה</CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={typeData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                      <XAxis dataKey="type" stroke="hsl(var(--muted-foreground))" />
                      <YAxis stroke="hsl(var(--muted-foreground))" />
                      <Tooltip 
                        contentStyle={{ 
                          backgroundColor: 'hsl(var(--popover))', 
                          border: '1px solid hsl(var(--border))',
                          borderRadius: '8px'
                        }}
                      />
                      <Legend />
                      <Bar dataKey="savings" fill="hsl(var(--primary))" name="חיסכון בפועל (₪)" />
                      <Bar dataKey="count" fill="hsl(var(--secondary))" name="מספר המלצות" />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            )}
          </div>
        )}

        {/* Recommendations List */}
        {trackedRecommendations.length === 0 ? (
          <Card className="glass-card">
            <CardContent className="flex flex-col items-center justify-center py-12">
              <Target className="h-16 w-16 text-muted-foreground mb-4" />
              <h3 className="text-xl font-semibold text-foreground mb-2">אין מעקב פעיל</h3>
              <p className="text-muted-foreground text-center mb-4">
                התחל לעקוב אחר המלצות כדי לראות ניתוח ROI מפורט
              </p>
              <Button onClick={() => navigate('/client/recommendations')}>
                עבור להמלצות
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            <h2 className="text-2xl font-bold text-foreground">היסטוריית מעקב</h2>
            {trackedRecommendations.map((rec) => {
              const StatusIcon = statusIcons[rec.status];
              const savingsDiff = rec.actual_savings ? Number(rec.actual_savings) - Number(rec.predicted_savings) : 0;
              const accuracy = rec.actual_savings && rec.predicted_savings > 0
                ? (Number(rec.actual_savings) / Number(rec.predicted_savings)) * 100
                : 0;

              return (
                <Card key={rec.id} className="glass-card">
                  <CardHeader>
                    <div className="flex items-start justify-between gap-4 flex-wrap">
                      <div className="flex items-start gap-3">
                        <div className={`p-2 rounded-lg ${
                          rec.status === 'completed' ? 'bg-green-500/10' :
                          rec.status === 'in_progress' ? 'bg-primary/10' :
                          rec.status === 'dismissed' ? 'bg-destructive/10' :
                          'bg-secondary/10'
                        }`}>
                          <StatusIcon className={`h-6 w-6 ${
                            rec.status === 'completed' ? 'text-green-500' :
                            rec.status === 'in_progress' ? 'text-primary' :
                            rec.status === 'dismissed' ? 'text-destructive' :
                            'text-secondary'
                          }`} />
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <CardTitle className="text-lg">{rec.recommendation_title}</CardTitle>
                            <Badge variant={statusColors[rec.status] as any}>
                              {statusLabels[rec.status]}
                            </Badge>
                          </div>
                          <CardDescription>
                            סוג: {rec.recommendation_type} • נוצר: {new Date(rec.created_at).toLocaleDateString('he-IL')}
                          </CardDescription>
                        </div>
                      </div>
                    </div>
                  </CardHeader>
                  
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <div className="p-3 bg-muted/30 rounded-lg">
                        <p className="text-xs text-muted-foreground mb-1">חיסכון צפוי</p>
                        <p className="text-lg font-bold text-foreground">
                          ₪{Number(rec.predicted_savings).toLocaleString()}
                        </p>
                      </div>

                      {rec.actual_savings !== null && (
                        <>
                          <div className="p-3 bg-muted/30 rounded-lg">
                            <p className="text-xs text-muted-foreground mb-1">חיסכון בפועל</p>
                            <p className="text-lg font-bold text-green-500">
                              ₪{Number(rec.actual_savings).toLocaleString()}
                            </p>
                          </div>

                          <div className="p-3 bg-muted/30 rounded-lg">
                            <p className="text-xs text-muted-foreground mb-1">הפרש</p>
                            <p className={`text-lg font-bold ${savingsDiff >= 0 ? 'text-green-500' : 'text-destructive'}`}>
                              {savingsDiff >= 0 ? '+' : ''}₪{savingsDiff.toLocaleString()}
                            </p>
                          </div>

                          <div className="p-3 bg-muted/30 rounded-lg">
                            <p className="text-xs text-muted-foreground mb-1">דיוק</p>
                            <p className="text-lg font-bold text-foreground">
                              {accuracy.toFixed(0)}%
                            </p>
                          </div>
                        </>
                      )}
                    </div>

                    {rec.notes && (
                      <div className="p-3 bg-muted/20 rounded-lg">
                        <p className="text-sm text-muted-foreground mb-1">הערות:</p>
                        <p className="text-sm text-foreground">{rec.notes}</p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
