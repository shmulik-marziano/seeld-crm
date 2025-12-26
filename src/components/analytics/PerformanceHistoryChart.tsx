import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Calendar as CalendarIcon, TrendingUp, RefreshCw } from "lucide-react";
import { format } from "date-fns";
import { he } from "date-fns/locale";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

interface PerformanceHistory {
  id: string;
  performance_score: number;
  performance_rating: string;
  premium_score: number;
  coverage_score: number;
  policy_score: number;
  created_at: string;
}

interface DateRange {
  from: Date | undefined;
  to: Date | undefined;
}

export default function PerformanceHistoryChart() {
  const [history, setHistory] = useState<PerformanceHistory[]>([]);
  const [loading, setLoading] = useState(true);
  const [dateRange, setDateRange] = useState<DateRange>({
    from: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000), // Last 90 days
    to: new Date(),
  });

  useEffect(() => {
    loadHistory();
  }, [dateRange]);

  const loadHistory = async () => {
    try {
      setLoading(true);
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      let query = supabase
        .from('performance_history')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: true });

      if (dateRange.from) {
        query = query.gte('created_at', dateRange.from.toISOString());
      }
      if (dateRange.to) {
        const endOfDay = new Date(dateRange.to);
        endOfDay.setHours(23, 59, 59, 999);
        query = query.lte('created_at', endOfDay.toISOString());
      }

      const { data, error } = await query;

      if (error) throw error;
      setHistory(data || []);
    } catch (error) {
      console.error('Error loading performance history:', error);
      toast.error('שגיאה בטעינת היסטוריית ביצועים');
    } finally {
      setLoading(false);
    }
  };

  const chartData = history.map(item => ({
    date: format(new Date(item.created_at), 'dd/MM', { locale: he }),
    fullDate: format(new Date(item.created_at), 'dd/MM/yyyy HH:mm', { locale: he }),
    'ציון כולל': item.performance_score,
    'פרמיה': item.premium_score,
    'כיסוי': item.coverage_score,
    'מאזן': item.policy_score,
    rating: item.performance_rating
  }));

  const setPreset = (days: number) => {
    setDateRange({
      from: new Date(Date.now() - days * 24 * 60 * 60 * 1000),
      to: new Date(),
    });
  };

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="glass-card p-3 border border-border">
          <p className="text-sm font-semibold text-foreground mb-2">{payload[0].payload.fullDate}</p>
          <p className="text-xs text-muted-foreground mb-2">דירוג: {payload[0].payload.rating}</p>
          {payload.map((entry: any, index: number) => (
            <p key={index} className="text-sm" style={{ color: entry.color }}>
              {entry.name}: {entry.value}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  return (
    <Card className="glass-card">
      <CardHeader>
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-primary" />
              היסטוריית ציון ביצועים
            </CardTitle>
            <CardDescription className="mt-1">
              מעקב אחר השינויים בציון הביצועים לאורך זמן
            </CardDescription>
          </div>
          
          <div className="flex items-center gap-2 flex-wrap">
            <div className="flex gap-1">
              <Button variant="outline" size="sm" onClick={() => setPreset(7)}>
                שבוע
              </Button>
              <Button variant="outline" size="sm" onClick={() => setPreset(30)}>
                חודש
              </Button>
              <Button variant="outline" size="sm" onClick={() => setPreset(90)}>
                3 חודשים
              </Button>
              <Button variant="outline" size="sm" onClick={() => setPreset(180)}>
                6 חודשים
              </Button>
            </div>

            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    "justify-start text-left font-normal",
                    !dateRange && "text-muted-foreground"
                  )}
                >
                  <CalendarIcon className="ml-2 h-4 w-4" />
                  {dateRange?.from ? (
                    dateRange.to ? (
                      <>
                        {format(dateRange.from, "dd/MM/yyyy", { locale: he })} -{" "}
                        {format(dateRange.to, "dd/MM/yyyy", { locale: he })}
                      </>
                    ) : (
                      format(dateRange.from, "dd/MM/yyyy", { locale: he })
                    )
                  ) : (
                    <span>בחר טווח תאריכים</span>
                  )}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="end">
                <Calendar
                  initialFocus
                  mode="range"
                  defaultMonth={dateRange?.from}
                  selected={{ from: dateRange?.from, to: dateRange?.to }}
                  onSelect={(range) => {
                    if (range?.from || range?.to) {
                      setDateRange({ from: range?.from, to: range?.to });
                    }
                  }}
                  numberOfMonths={2}
                  locale={he}
                  dir="rtl"
                />
              </PopoverContent>
            </Popover>

            <Button variant="outline" size="icon" onClick={loadHistory} disabled={loading}>
              <RefreshCw className={cn("h-4 w-4", loading && "animate-spin")} />
            </Button>
          </div>
        </div>
      </CardHeader>
      
      <CardContent>
        {loading ? (
          <div className="h-[400px] flex items-center justify-center">
            <RefreshCw className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : history.length === 0 ? (
          <div className="h-[400px] flex flex-col items-center justify-center text-center">
            <TrendingUp className="h-12 w-12 text-muted-foreground mb-4" />
            <p className="text-foreground font-semibold">אין נתונים היסטוריים</p>
            <p className="text-sm text-muted-foreground mt-2">
              המערכת תתחיל לאסוף נתונים אוטומטית
            </p>
          </div>
        ) : (
          <div className="space-y-6">
            <ResponsiveContainer width="100%" height={400}>
              <LineChart data={chartData}>
                <defs>
                  <linearGradient id="colorTotal" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.8}/>
                    <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0.1}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis 
                  dataKey="date" 
                  stroke="hsl(var(--muted-foreground))"
                  tick={{ fill: 'hsl(var(--foreground))' }}
                />
                <YAxis 
                  stroke="hsl(var(--muted-foreground))"
                  tick={{ fill: 'hsl(var(--foreground))' }}
                  domain={[0, 100]}
                />
                <Tooltip content={<CustomTooltip />} />
                <Legend 
                  wrapperStyle={{ color: 'hsl(var(--foreground))' }}
                />
                <Line 
                  type="monotone" 
                  dataKey="ציון כולל" 
                  stroke="hsl(var(--primary))" 
                  strokeWidth={3}
                  dot={{ fill: 'hsl(var(--primary))', r: 4 }}
                  activeDot={{ r: 6 }}
                />
                <Line 
                  type="monotone" 
                  dataKey="פרמיה" 
                  stroke="hsl(var(--secondary))" 
                  strokeWidth={2}
                  strokeDasharray="5 5"
                  dot={{ fill: 'hsl(var(--secondary))', r: 3 }}
                />
                <Line 
                  type="monotone" 
                  dataKey="כיסוי" 
                  stroke="hsl(var(--accent))" 
                  strokeWidth={2}
                  strokeDasharray="5 5"
                  dot={{ fill: 'hsl(var(--accent))', r: 3 }}
                />
                <Line 
                  type="monotone" 
                  dataKey="מאזן" 
                  stroke="hsl(var(--muted-foreground))" 
                  strokeWidth={2}
                  strokeDasharray="5 5"
                  dot={{ fill: 'hsl(var(--muted-foreground))', r: 3 }}
                />
              </LineChart>
            </ResponsiveContainer>

            {/* Summary Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-4 border-t border-border">
              <div>
                <p className="text-xs text-muted-foreground">ממוצע כולל</p>
                <p className="text-2xl font-bold text-foreground">
                  {Math.round(chartData.reduce((sum, d) => sum + d['ציון כולל'], 0) / chartData.length)}
                </p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">ציון גבוה ביותר</p>
                <p className="text-2xl font-bold text-green-500">
                  {Math.max(...chartData.map(d => d['ציון כולל']))}
                </p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">ציון נמוך ביותר</p>
                <p className="text-2xl font-bold text-destructive">
                  {Math.min(...chartData.map(d => d['ציון כולל']))}
                </p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">שינוי כולל</p>
                <p className={cn(
                  "text-2xl font-bold",
                  chartData[chartData.length - 1]?.['ציון כולל'] >= chartData[0]?.['ציון כולל']
                    ? "text-green-500"
                    : "text-destructive"
                )}>
                  {chartData.length > 1
                    ? `${chartData[chartData.length - 1]?.['ציון כולל'] - chartData[0]?.['ציון כולל'] > 0 ? '+' : ''}${
                        chartData[chartData.length - 1]?.['ציון כולל'] - chartData[0]?.['ציון כולל']
                      }`
                    : '0'}
                </p>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
