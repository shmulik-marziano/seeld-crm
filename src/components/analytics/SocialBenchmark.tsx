import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell, ReferenceLine } from 'recharts';
import { Users, TrendingUp, Award, Target, RefreshCw, Sparkles } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

interface BenchmarkData {
  userScore: number;
  percentile: number;
  distribution: Array<{
    range: string;
    min: number;
    max: number;
    count: number;
  }>;
  statistics: {
    average: number;
    median: number;
    max: number;
    min: number;
    totalUsers: number;
  };
  aiTips: string;
  comparison: {
    vsAverage: number;
    vsMedian: number;
  };
}

export default function SocialBenchmark() {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<BenchmarkData | null>(null);

  useEffect(() => {
    loadBenchmark();
  }, []);

  const loadBenchmark = async () => {
    try {
      setLoading(true);
      const { data: result, error } = await supabase.functions.invoke('social-benchmark');
      
      if (error) throw error;
      setData(result);
    } catch (error) {
      console.error('Error loading social benchmark:', error);
      toast.error('שגיאה בטעינת השוואה חברתית');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Card className="glass-card">
        <CardContent className="pt-6">
          <div className="flex items-center justify-center h-64">
            <RefreshCw className="h-8 w-8 animate-spin text-primary" />
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!data) {
    return (
      <Card className="glass-card">
        <CardContent className="pt-6">
          <div className="text-center py-8">
            <Users className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <p className="text-foreground">אין מספיק נתונים להשוואה</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  const { userScore, percentile, distribution, statistics, aiTips, comparison } = data;

  // Find which bin the user is in
  const userBin = distribution.find(bin => userScore >= bin.min && userScore <= bin.max);

  const chartData = distribution.map(bin => ({
    range: bin.range,
    משתמשים: bin.count,
    isUserBin: bin.range === userBin?.range
  }));

  const getPercentileMessage = () => {
    if (percentile >= 90) return "מעולה! אתה בטופ 10%";
    if (percentile >= 75) return "טוב מאוד! אתה בטופ 25%";
    if (percentile >= 50) return "מעל הממוצע";
    if (percentile >= 25) return "מתחת לממוצע";
    return "יש מקום לשיפור";
  };

  const getPercentileColor = () => {
    if (percentile >= 75) return "text-green-500";
    if (percentile >= 50) return "text-primary";
    if (percentile >= 25) return "text-secondary";
    return "text-muted-foreground";
  };

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const isUserBin = payload[0].payload.isUserBin;
      return (
        <div className="glass-card p-3 border border-border">
          <p className="text-sm font-semibold text-foreground">
            טווח: {payload[0].payload.range}
          </p>
          <p className="text-sm text-foreground">
            משתמשים: {payload[0].value}
          </p>
          {isUserBin && (
            <p className="text-xs text-primary font-bold mt-1">← אתה כאן</p>
          )}
        </div>
      );
    }
    return null;
  };

  return (
    <Card className="glass-card border-primary/20">
      <CardHeader>
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div>
            <CardTitle className="flex items-center gap-2 text-2xl">
              <Users className="h-7 w-7 text-primary" />
              השוואה חברתית - קבוצת גיל
            </CardTitle>
            <CardDescription className="mt-2">
              איך אתה מדורג לעומת {statistics.totalUsers} משתמשים בגיל דומה (אנונימי)
            </CardDescription>
          </div>
          <Button variant="outline" size="icon" onClick={loadBenchmark} disabled={loading}>
            <RefreshCw className={cn("h-4 w-4", loading && "animate-spin")} />
          </Button>
        </div>
      </CardHeader>

      <CardContent className="space-y-8">
        {/* Percentile Hero */}
        <div className="relative overflow-hidden rounded-xl p-6 bg-gradient-to-br from-primary/10 via-secondary/10 to-accent/10 border border-primary/20">
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <Award className="h-8 w-8 text-primary" />
                <div>
                  <p className="text-sm text-muted-foreground">האחוזון שלך</p>
                  <p className={cn("text-5xl font-bold", getPercentileColor())}>
                    {percentile}%
                  </p>
                </div>
              </div>
              <p className="text-foreground font-semibold mt-2">{getPercentileMessage()}</p>
            </div>
            
            <div className="text-center">
              <p className="text-sm text-muted-foreground mb-1">הציון שלך</p>
              <div className="text-4xl font-bold bg-gradient-to-r from-primary via-secondary to-accent bg-clip-text text-transparent">
                {userScore}
              </div>
            </div>
          </div>

          {/* Percentile bar */}
          <div className="mt-6 relative">
            <div className="h-3 bg-muted rounded-full overflow-hidden">
              <div 
                className="h-full bg-gradient-to-r from-primary via-secondary to-accent rounded-full transition-all duration-1000"
                style={{ width: `${percentile}%` }}
              />
            </div>
            <div className="flex justify-between text-xs text-muted-foreground mt-1">
              <span>0%</span>
              <span>25%</span>
              <span>50%</span>
              <span>75%</span>
              <span>100%</span>
            </div>
          </div>
        </div>

        {/* Statistics Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="glass-card p-4 rounded-lg">
            <p className="text-xs text-muted-foreground mb-1">ממוצע קבוצה</p>
            <p className="text-2xl font-bold text-foreground">{statistics.average}</p>
            <p className={cn(
              "text-sm mt-1",
              comparison.vsAverage > 0 ? "text-green-500" : "text-destructive"
            )}>
              {comparison.vsAverage > 0 ? '+' : ''}{comparison.vsAverage.toFixed(0)} ממך
            </p>
          </div>

          <div className="glass-card p-4 rounded-lg">
            <p className="text-xs text-muted-foreground mb-1">חציון</p>
            <p className="text-2xl font-bold text-foreground">{statistics.median}</p>
            <p className={cn(
              "text-sm mt-1",
              comparison.vsMedian > 0 ? "text-green-500" : "text-destructive"
            )}>
              {comparison.vsMedian > 0 ? '+' : ''}{comparison.vsMedian.toFixed(0)} ממך
            </p>
          </div>

          <div className="glass-card p-4 rounded-lg">
            <p className="text-xs text-muted-foreground mb-1">ציון מקסימלי</p>
            <p className="text-2xl font-bold text-green-500">{statistics.max}</p>
            <p className="text-xs text-muted-foreground mt-1">בקבוצה</p>
          </div>

          <div className="glass-card p-4 rounded-lg">
            <p className="text-xs text-muted-foreground mb-1">ציון מינימלי</p>
            <p className="text-2xl font-bold text-muted-foreground">{statistics.min}</p>
            <p className="text-xs text-muted-foreground mt-1">בקבוצה</p>
          </div>
        </div>

        {/* Distribution Chart */}
        <div>
          <div className="flex items-center gap-2 mb-4">
            <TrendingUp className="h-5 w-5 text-primary" />
            <h3 className="text-lg font-semibold text-foreground">גרף התפלגות</h3>
          </div>
          
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis 
                dataKey="range" 
                stroke="hsl(var(--muted-foreground))"
                tick={{ fill: 'hsl(var(--foreground))' }}
              />
              <YAxis 
                stroke="hsl(var(--muted-foreground))"
                tick={{ fill: 'hsl(var(--foreground))' }}
                label={{ value: 'מספר משתמשים', angle: -90, position: 'insideLeft', fill: 'hsl(var(--foreground))' }}
              />
              <Tooltip content={<CustomTooltip />} />
              <Bar dataKey="משתמשים" radius={[8, 8, 0, 0]}>
                {chartData.map((entry, index) => (
                  <Cell 
                    key={`cell-${index}`} 
                    fill={entry.isUserBin ? 'hsl(var(--primary))' : 'hsl(var(--muted))'} 
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* AI Tips */}
        <Card className="glass-card border-accent/30">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-accent" />
              טיפים מותאמים אישית לשיפור דירוג
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-foreground leading-relaxed whitespace-pre-wrap">
              {aiTips}
            </p>
          </CardContent>
        </Card>

        {/* Rank Badge */}
        <div className="text-center p-6 glass-card rounded-lg border-2 border-primary/20">
          <Target className="h-10 w-10 mx-auto text-primary mb-3" />
          <p className="text-foreground font-semibold mb-1">
            {percentile >= 75 ? '🏆 מדליית זהב' :
             percentile >= 50 ? '🥈 מדליית כסף' :
             percentile >= 25 ? '🥉 מדליית ארד' :
             '💪 המשך לשפר!'}
          </p>
          <p className="text-sm text-muted-foreground">
            {percentile >= 75 ? 'אתה מהטובים ביותר בקבוצת הגיל שלך!' :
             percentile >= 50 ? 'אתה מעל הממוצע, כל הכבוד!' :
             percentile >= 25 ? 'בדרך הנכונה, תמשיך לשפר' :
             'יש פוטנציאל לצמיחה משמעותית'}
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
