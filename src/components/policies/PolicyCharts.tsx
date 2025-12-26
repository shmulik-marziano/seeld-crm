import { Card } from '@/components/ui/card';
import {
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import { DateRange } from 'react-day-picker';
import { ViewMode } from './ChartFilters';
import { format, startOfWeek, endOfWeek, startOfMonth, endOfMonth, startOfYear, endOfYear, eachWeekOfInterval, eachMonthOfInterval, eachYearOfInterval, isWithinInterval } from 'date-fns';
import { he } from 'date-fns/locale';

interface PolicyChartsProps {
  policies: any[];
  dateRange?: DateRange;
  provider: string;
  viewMode: ViewMode;
}

const PolicyCharts = ({ policies, dateRange, provider, viewMode }: PolicyChartsProps) => {
  // Colors from design system
  const COLORS = [
    'hsl(187, 100%, 42%)', // primary
    'hsl(122, 39%, 49%)',  // secondary
    'hsl(291, 64%, 42%)',  // accent
    'hsl(187, 80%, 56%)',  // primary-400
    'hsl(122, 37%, 58%)',  // secondary-400
  ];

  // Filter policies based on date range and provider
  const getFilteredPolicies = () => {
    let filtered = [...policies];

    // Filter by date range
    if (dateRange?.from) {
      filtered = filtered.filter((policy) => {
        const policyDate = new Date(policy.start_date);
        if (dateRange.to) {
          return isWithinInterval(policyDate, { start: dateRange.from!, end: dateRange.to });
        }
        return policyDate >= dateRange.from!;
      });
    }

    // Filter by provider
    if (provider !== 'all') {
      filtered = filtered.filter((policy) => policy.provider === provider);
    }

    return filtered;
  };

  const filteredPolicies = getFilteredPolicies();

  // Process data for pie chart - distribution by type
  const getTypeDistribution = () => {
    const typeCounts: Record<string, number> = {};
    
    filteredPolicies.forEach((policy) => {
      typeCounts[policy.type] = (typeCounts[policy.type] || 0) + 1;
    });

    const typeLabels: Record<string, string> = {
      life_insurance: 'ביטוח חיים',
      health_insurance: 'ביטוח בריאות',
      pension: 'פנסיה',
      disability_insurance: 'אובדן כושר',
      property_insurance: 'ביטוח רכוש',
    };

    return Object.entries(typeCounts).map(([type, count]) => ({
      name: typeLabels[type] || type,
      value: count,
      percentage: ((count / filteredPolicies.length) * 100).toFixed(1),
    }));
  };

  // Process data for line chart - premiums over time with dynamic grouping
  const getPremiumsOverTime = () => {
    const activePolicies = filteredPolicies.filter(p => p.status === 'active');
    
    if (activePolicies.length === 0) {
      return [{ period: 'אין נתונים', total: 0 }];
    }

    // Find date range
    const dates = activePolicies.map(p => new Date(p.start_date));
    const minDate = dateRange?.from || new Date(Math.min(...dates.map(d => d.getTime())));
    const maxDate = dateRange?.to || new Date();

    let intervals: Date[] = [];
    let formatPattern: string;

    switch (viewMode) {
      case 'weekly':
        intervals = eachWeekOfInterval({ start: minDate, end: maxDate }, { weekStartsOn: 0 });
        formatPattern = "dd/MM";
        break;
      case 'yearly':
        intervals = eachYearOfInterval({ start: minDate, end: maxDate });
        formatPattern = "yyyy";
        break;
      case 'monthly':
      default:
        intervals = eachMonthOfInterval({ start: minDate, end: maxDate });
        formatPattern = "MMM yy";
        break;
    }

    // Limit to last 12 intervals for better visualization
    const limitedIntervals = intervals.slice(-12);

    const data = limitedIntervals.map((intervalStart) => {
      let intervalEnd: Date;
      
      switch (viewMode) {
        case 'weekly':
          intervalEnd = endOfWeek(intervalStart, { weekStartsOn: 0 });
          break;
        case 'yearly':
          intervalEnd = endOfYear(intervalStart);
          break;
        case 'monthly':
        default:
          intervalEnd = endOfMonth(intervalStart);
          break;
      }

      const periodPolicies = activePolicies.filter((policy) => {
        const policyDate = new Date(policy.start_date);
        return isWithinInterval(policyDate, { start: intervalStart, end: intervalEnd });
      });

      const total = periodPolicies.reduce((sum, p) => sum + Number(p.premium), 0);

      return {
        period: format(intervalStart, formatPattern, { locale: he }),
        total: Math.round(total),
      };
    });

    return data.length > 0 ? data : [{ period: 'אין נתונים', total: 0 }];
  };

  // Process data for bar chart - coverage by category
  const getCoverageByCategory = () => {
    const coverageByType: Record<string, number> = {};
    
    filteredPolicies
      .filter(p => p.status === 'active')
      .forEach((policy) => {
        coverageByType[policy.type] = (coverageByType[policy.type] || 0) + Number(policy.coverage_amount);
      });

    const typeLabels: Record<string, string> = {
      life_insurance: 'ביטוח חיים',
      health_insurance: 'ביטוח בריאות',
      pension: 'פנסיה',
      disability_insurance: 'אובדן כושר',
      property_insurance: 'ביטוח רכוש',
    };

    return Object.entries(coverageByType).map(([type, total]) => ({
      name: typeLabels[type] || type,
      coverage: Math.round(total / 1000000), // Convert to millions
    }));
  };

  const typeDistribution = getTypeDistribution();
  const premiumsOverTime = getPremiumsOverTime();
  const coverageByCategory = getCoverageByCategory();

  if (filteredPolicies.length === 0) {
    return (
      <Card className="p-8 glass-card text-center">
        <p className="text-muted-foreground">
          {policies.length === 0 
            ? 'אין מספיק נתונים להצגת גרפים. הוסף פוליסות כדי לראות ניתוח מפורט.'
            : 'לא נמצאו פוליסות התואמות לפילטרים שנבחרו. נסה לשנות את הפילטרים.'}
        </p>
      </Card>
    );
  }

  const viewModeLabel = viewMode === 'weekly' ? 'שבועי' : viewMode === 'monthly' ? 'חודשי' : 'שנתי';

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Pie Chart - Type Distribution */}
        <Card className="p-6 glass-card">
          <h3 className="text-xl font-bold mb-4">התפלגות לפי סוג פוליסה</h3>
          <div className="text-sm text-muted-foreground mb-2">
            {filteredPolicies.length} פוליסות מתוך {policies.length}
          </div>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={typeDistribution}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, value, percent }: any) => `${name} (${(percent * 100).toFixed(0)}%)`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {typeDistribution.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip 
                contentStyle={{ 
                  background: 'hsl(var(--background))', 
                  border: '1px solid hsl(var(--border))',
                  borderRadius: '8px',
                  direction: 'rtl'
                }}
              />
            </PieChart>
          </ResponsiveContainer>
        </Card>

        {/* Bar Chart - Coverage by Category */}
        <Card className="p-6 glass-card">
          <h3 className="text-xl font-bold mb-4">כיסוי לפי קטגוריה (מיליון ₪)</h3>
          <div className="text-sm text-muted-foreground mb-2">
            פוליסות פעילות בלבד
          </div>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={coverageByCategory}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis 
                dataKey="name" 
                stroke="hsl(var(--foreground))"
                tick={{ fill: 'hsl(var(--foreground))' }}
              />
              <YAxis 
                stroke="hsl(var(--foreground))"
                tick={{ fill: 'hsl(var(--foreground))' }}
              />
              <Tooltip 
                contentStyle={{ 
                  background: 'hsl(var(--background))', 
                  border: '1px solid hsl(var(--border))',
                  borderRadius: '8px',
                  direction: 'rtl'
                }}
                formatter={(value: any) => [`${value}M ₪`, 'כיסוי']}
              />
              <Bar dataKey="coverage" fill="hsl(187, 100%, 42%)" radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </Card>
      </div>

      {/* Line Chart - Premiums Over Time */}
      <Card className="p-6 glass-card">
        <h3 className="text-xl font-bold mb-4">פרמיות לאורך זמן - תצוגה {viewModeLabel} (₪)</h3>
        <div className="text-sm text-muted-foreground mb-2">
          מעקב אחר פרמיות פוליסות פעילות
        </div>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={premiumsOverTime}>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
            <XAxis 
              dataKey="period" 
              stroke="hsl(var(--foreground))"
              tick={{ fill: 'hsl(var(--foreground))' }}
            />
            <YAxis 
              stroke="hsl(var(--foreground))"
              tick={{ fill: 'hsl(var(--foreground))' }}
            />
            <Tooltip 
              contentStyle={{ 
                background: 'hsl(var(--background))', 
                border: '1px solid hsl(var(--border))',
                borderRadius: '8px',
                direction: 'rtl'
              }}
              formatter={(value: any) => [`₪${value.toLocaleString()}`, 'סה"כ פרמיות']}
            />
            <Legend 
              wrapperStyle={{ direction: 'rtl' }}
              formatter={() => 'סה"כ פרמיות'}
            />
            <Line 
              type="monotone" 
              dataKey="total" 
              stroke="hsl(122, 39%, 49%)" 
              strokeWidth={3}
              dot={{ fill: 'hsl(122, 39%, 49%)', r: 5 }}
              activeDot={{ r: 8 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </Card>
    </div>
  );
};

export default PolicyCharts;
