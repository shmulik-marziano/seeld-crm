import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowRight, TrendingUp, TrendingDown, Activity, DollarSign, Shield, Target, Sparkles } from "lucide-react";
import { LineChart, Line, BarChart, Bar, RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Area, AreaChart } from "recharts";
import { toast } from "sonner";
import FuturisticBackground from "@/components/FuturisticBackground";
import PerformanceHistoryChart from "@/components/analytics/PerformanceHistoryChart";
import SocialBenchmark from "@/components/analytics/SocialBenchmark";
import AIAdvisorChat from "@/components/analytics/AIAdvisorChat";

interface AnalyticsData {
  kpis: {
    totalPolicies: number;
    totalPremium: number;
    totalCoverage: number;
    avgPremium: number;
    premiumVsMarket: string;
    coverageVsMarket: string;
    policiesVsMarket: string;
    roi: string;
    performanceScore: number;
    performanceRating: string;
    premiumScore: number;
    coverageScore: number;
    policyScore: number;
  };
  providerStats: Record<string, {
    count: number;
    totalPremium: number;
    totalCoverage: number;
    avgPremium: number;
    avgCoverage: number;
  }>;
  marketBenchmarks: {
    avgPremiumMarket: number;
    avgCoverageMarket: number;
    avgPoliciesPerPerson: number;
    industryGrowthRate: number;
    userAge: number;
    ageGroup: string;
  };
  aiInsights: {
    predictions: number[];
    optimization: string;
    providerInsights: string;
    riskAssessment: string;
    scoreImprovementTips?: string;
  };
  trends: {
    historical: Array<{ date: string; premium: number; coverage: number }>;
    predictions: number[];
  };
}

export default function Analytics() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);

  useEffect(() => {
    checkAuthAndLoadAnalytics();
  }, []);

  const checkAuthAndLoadAnalytics = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      navigate('/client/auth');
      return;
    }
    await loadAnalytics();
  };

  const loadAnalytics = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('analytics');
      
      if (error) throw error;
      
      if (data?.analytics) {
        setAnalytics(data.analytics);
      } else {
        toast.error('אין מספיק נתונים לניתוח');
      }
    } catch (error) {
      console.error('Error loading analytics:', error);
      toast.error('שגיאה בטעינת הניתוח');
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
            <Activity className="w-12 h-12 mx-auto mb-4 animate-pulse text-primary" />
            <p className="text-foreground">טוען ניתוח מתקדם...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!analytics) {
    return (
      <div className="min-h-screen bg-background">
        <FuturisticBackground />
        <div className="relative z-10 container mx-auto px-4 py-8">
          <Card className="glass-card">
            <CardHeader>
              <CardTitle>אין מספיק נתונים</CardTitle>
              <CardDescription>הוסף פוליסות כדי לראות ניתוח מתקדם</CardDescription>
            </CardHeader>
            <CardContent>
              <Button onClick={() => navigate('/client/dashboard')}>
                חזרה לדשבורד
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  const { kpis, providerStats, marketBenchmarks, aiInsights, trends } = analytics;

  // Prepare chart data
  const providerComparisonData = Object.entries(providerStats).map(([name, stats]) => ({
    name,
    פרמיה: Math.round(stats.avgPremium),
    כיסוי: Math.round(stats.avgCoverage / 1000),
    פוליסות: stats.count
  }));

  const predictionData = aiInsights.predictions.map((premium, index) => ({
    month: `חודש ${index + 1}`,
    תחזית: Math.round(premium),
    ממוצע: Math.round(kpis.avgPremium)
  }));

  const benchmarkData = [
    {
      category: 'פרמיה ממוצעת',
      'התיק שלך': kpis.avgPremium,
      'ממוצע שוק': marketBenchmarks.avgPremiumMarket
    },
    {
      category: 'כיסוי ממוצע',
      'התיק שלך': kpis.totalCoverage / kpis.totalPolicies / 1000,
      'ממוצע שוק': marketBenchmarks.avgCoverageMarket / 1000
    },
    {
      category: 'מספר פוליסות',
      'התיק שלך': kpis.totalPolicies,
      'ממוצע שוק': marketBenchmarks.avgPoliciesPerPerson
    }
  ];

  const radarData = Object.entries(providerStats).map(([name, stats]) => ({
    provider: name,
    כיסוי: (stats.avgCoverage / 1000000) * 100,
    פרמיה: (stats.avgPremium / 3000) * 100,
    פוליסות: (stats.count / kpis.totalPolicies) * 100
  }));

  return (
    <div className="min-h-screen bg-background">
      <FuturisticBackground />
      
      <div className="relative z-10 container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <Button
            variant="ghost"
            onClick={() => navigate('/client/dashboard')}
            className="mb-4"
          >
            <ArrowRight className="ml-2 h-4 w-4" />
            חזרה לדשבורד
          </Button>
          
          <div className="glass-card p-6">
            <div className="flex items-center gap-3 mb-2">
              <Sparkles className="h-8 w-8 text-primary" />
              <h1 className="text-3xl font-bold text-foreground">דשבורד אנליטיקה מתקדם</h1>
            </div>
            <p className="text-muted-foreground">ניתוח מעמיק של תיק הביטוחים שלך עם תחזיות AI</p>
          </div>
        </div>

        {/* Performance Score - Hero Card */}
        <Card className="glass-card mb-8 border-primary/20">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-2xl flex items-center gap-2">
                  <Target className="h-7 w-7 text-primary" />
                  ציון ביצועים מול שוק
                </CardTitle>
                <CardDescription className="mt-2">
                  בנצ'מרק לקבוצת גיל: {marketBenchmarks.ageGroup} ({marketBenchmarks.userAge} שנים)
                </CardDescription>
              </div>
              <div className="text-center">
                <div className="relative inline-block">
                  <div className="text-6xl font-bold bg-gradient-to-r from-primary via-secondary to-accent bg-clip-text text-transparent">
                    {kpis.performanceScore}
                  </div>
                  <div className="text-sm text-muted-foreground mt-1">מתוך 100</div>
                </div>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-lg font-semibold text-foreground">דירוג: {kpis.performanceRating}</span>
                <div className="flex gap-1">
                  {[...Array(5)].map((_, i) => (
                    <div
                      key={i}
                      className={`h-2 w-12 rounded ${
                        i < Math.round(kpis.performanceScore / 20) ? 'bg-primary' : 'bg-muted'
                      }`}
                    />
                  ))}
                </div>
              </div>
              
              <div className="grid grid-cols-3 gap-4 mt-6">
                <div>
                  <div className="text-xs text-muted-foreground mb-1">ציון פרמיה</div>
                  <div className="flex items-baseline gap-1">
                    <span className="text-2xl font-bold text-foreground">{kpis.premiumScore}</span>
                    <span className="text-sm text-muted-foreground">/40</span>
                  </div>
                  <div className="mt-1 h-1.5 bg-muted rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-primary rounded-full"
                      style={{ width: `${(kpis.premiumScore / 40) * 100}%` }}
                    />
                  </div>
                </div>
                
                <div>
                  <div className="text-xs text-muted-foreground mb-1">ציון כיסוי</div>
                  <div className="flex items-baseline gap-1">
                    <span className="text-2xl font-bold text-foreground">{kpis.coverageScore}</span>
                    <span className="text-sm text-muted-foreground">/40</span>
                  </div>
                  <div className="mt-1 h-1.5 bg-muted rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-secondary rounded-full"
                      style={{ width: `${(kpis.coverageScore / 40) * 100}%` }}
                    />
                  </div>
                </div>
                
                <div>
                  <div className="text-xs text-muted-foreground mb-1">ציון מאזן</div>
                  <div className="flex items-baseline gap-1">
                    <span className="text-2xl font-bold text-foreground">{kpis.policyScore}</span>
                    <span className="text-sm text-muted-foreground">/20</span>
                  </div>
                  <div className="mt-1 h-1.5 bg-muted rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-accent rounded-full"
                      style={{ width: `${(kpis.policyScore / 20) * 100}%` }}
                    />
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* KPI Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card className="glass-card">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">ROI תיק</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-baseline gap-2">
                <span className="text-3xl font-bold text-foreground">{kpis.roi}%</span>
                <DollarSign className="h-5 w-5 text-primary" />
              </div>
              <p className="text-xs text-muted-foreground mt-1">תמורה לכסף מצוינת</p>
            </CardContent>
          </Card>

          <Card className="glass-card">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">פרמיה לעומת שוק</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-baseline gap-2">
                <span className={`text-3xl font-bold ${Number(kpis.premiumVsMarket) > 0 ? 'text-destructive' : 'text-green-500'}`}>
                  {kpis.premiumVsMarket}%
                </span>
                {Number(kpis.premiumVsMarket) > 0 ? (
                  <TrendingUp className="h-5 w-5 text-destructive" />
                ) : (
                  <TrendingDown className="h-5 w-5 text-green-500" />
                )}
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                {Number(kpis.premiumVsMarket) > 0 ? 'מעל ממוצע' : 'מתחת לממוצע'}
              </p>
            </CardContent>
          </Card>

          <Card className="glass-card">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">כיסוי לעומת שוק</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-baseline gap-2">
                <span className={`text-3xl font-bold ${Number(kpis.coverageVsMarket) > 0 ? 'text-green-500' : 'text-destructive'}`}>
                  {kpis.coverageVsMarket}%
                </span>
                {Number(kpis.coverageVsMarket) > 0 ? (
                  <TrendingUp className="h-5 w-5 text-green-500" />
                ) : (
                  <TrendingDown className="h-5 w-5 text-destructive" />
                )}
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                {Number(kpis.coverageVsMarket) > 0 ? 'כיסוי מעולה' : 'כיסוי נמוך'}
              </p>
            </CardContent>
          </Card>

          <Card className="glass-card">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">סך כיסוי</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-baseline gap-2">
                <span className="text-3xl font-bold text-foreground">
                  ₪{(kpis.totalCoverage / 1000000).toFixed(1)}M
                </span>
                <Shield className="h-5 w-5 text-primary" />
              </div>
              <p className="text-xs text-muted-foreground mt-1">הגנה כוללת</p>
            </CardContent>
          </Card>
        </div>

        {/* AI Insights */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <Card className="glass-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-primary" />
                המלצות לאופטימיזציה מבוססות בנצ'מרק
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-foreground leading-relaxed">{aiInsights.optimization}</p>
            </CardContent>
          </Card>

          <Card className="glass-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Target className="h-5 w-5 text-primary" />
                טיפים לשיפור הציון
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-foreground leading-relaxed">
                {aiInsights.scoreImprovementTips || 'הציון שלך מצוין! המשך לעקוב אחר התיק שלך.'}
              </p>
            </CardContent>
          </Card>

          <Card className="glass-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Activity className="h-5 w-5 text-secondary" />
                תובנות ספקים
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-foreground leading-relaxed">{aiInsights.providerInsights}</p>
            </CardContent>
          </Card>

          <Card className="glass-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5 text-accent" />
                הערכת סיכונים
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-foreground leading-relaxed">{aiInsights.riskAssessment}</p>
            </CardContent>
          </Card>
        </div>

        {/* Performance History Chart */}
        <div className="mb-8">
          <PerformanceHistoryChart />
        </div>

        {/* Social Benchmark */}
        <div className="mb-8">
          <SocialBenchmark />
        </div>

        {/* AI Advisor Chat */}
        <div className="mb-8">
          <AIAdvisorChat />
        </div>

        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Predictions Chart */}
          <Card className="glass-card">
            <CardHeader>
              <CardTitle>תחזית פרמיות - 12 חודשים</CardTitle>
              <CardDescription>תחזית מבוססת AI</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <AreaChart data={predictionData}>
                  <defs>
                    <linearGradient id="colorPrediction" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.8}/>
                      <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis dataKey="month" stroke="hsl(var(--muted-foreground))" />
                  <YAxis stroke="hsl(var(--muted-foreground))" />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: 'hsl(var(--card))',
                      border: '1px solid hsl(var(--border))',
                      borderRadius: '8px'
                    }}
                  />
                  <Area type="monotone" dataKey="תחזית" stroke="hsl(var(--primary))" fillOpacity={1} fill="url(#colorPrediction)" />
                  <Line type="monotone" dataKey="ממוצע" stroke="hsl(var(--muted-foreground))" strokeDasharray="5 5" />
                </AreaChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Provider Comparison */}
          <Card className="glass-card">
            <CardHeader>
              <CardTitle>השוואת ספקים</CardTitle>
              <CardDescription>פרמיה ממוצעת וכיסוי</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={providerComparisonData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis dataKey="name" stroke="hsl(var(--muted-foreground))" />
                  <YAxis stroke="hsl(var(--muted-foreground))" />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: 'hsl(var(--card))',
                      border: '1px solid hsl(var(--border))',
                      borderRadius: '8px'
                    }}
                  />
                  <Legend />
                  <Bar dataKey="פרמיה" fill="hsl(var(--primary))" />
                  <Bar dataKey="כיסוי" fill="hsl(var(--secondary))" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>

        {/* Benchmark & Radar */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Market Benchmark */}
          <Card className="glass-card">
            <CardHeader>
              <CardTitle>Benchmark מול שוק</CardTitle>
              <CardDescription>השוואה למדדי שוק</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={benchmarkData} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis type="number" stroke="hsl(var(--muted-foreground))" />
                  <YAxis dataKey="category" type="category" stroke="hsl(var(--muted-foreground))" width={120} />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: 'hsl(var(--card))',
                      border: '1px solid hsl(var(--border))',
                      borderRadius: '8px'
                    }}
                  />
                  <Legend />
                  <Bar dataKey="התיק שלך" fill="hsl(var(--primary))" />
                  <Bar dataKey="ממוצע שוק" fill="hsl(var(--muted))" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Radar Chart */}
          <Card className="glass-card">
            <CardHeader>
              <CardTitle>ניתוח רב-ממדי של ספקים</CardTitle>
              <CardDescription>השוואה מקיפה</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <RadarChart data={radarData}>
                  <PolarGrid stroke="hsl(var(--border))" />
                  <PolarAngleAxis dataKey="provider" stroke="hsl(var(--muted-foreground))" />
                  <PolarRadiusAxis stroke="hsl(var(--muted-foreground))" />
                  <Radar name="כיסוי" dataKey="כיסוי" stroke="hsl(var(--primary))" fill="hsl(var(--primary))" fillOpacity={0.6} />
                  <Radar name="פרמיה" dataKey="פרמיה" stroke="hsl(var(--secondary))" fill="hsl(var(--secondary))" fillOpacity={0.6} />
                  <Legend />
                </RadarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}