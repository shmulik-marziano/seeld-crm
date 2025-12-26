import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { CalendarIcon, X } from 'lucide-react';
import { format } from 'date-fns';
import { he } from 'date-fns/locale';
import { cn } from '@/lib/utils';
import { DateRange } from 'react-day-picker';

export type ViewMode = 'weekly' | 'monthly' | 'yearly';

interface ChartFiltersProps {
  dateRange: DateRange | undefined;
  onDateRangeChange: (range: DateRange | undefined) => void;
  provider: string;
  onProviderChange: (provider: string) => void;
  viewMode: ViewMode;
  onViewModeChange: (mode: ViewMode) => void;
  providers: string[];
}

const ChartFilters = ({
  dateRange,
  onDateRangeChange,
  provider,
  onProviderChange,
  viewMode,
  onViewModeChange,
  providers,
}: ChartFiltersProps) => {
  return (
    <Card className="glass-card p-4">
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-bold">פילטרים מתקדמים לגרפים</h3>
          {(dateRange?.from || provider !== 'all') && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                onDateRangeChange(undefined);
                onProviderChange('all');
              }}
            >
              <X size={16} className="ml-2" />
              נקה הכל
            </Button>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Date Range Picker */}
          <div className="space-y-2">
            <label className="text-sm font-medium">טווח תאריכים</label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    'w-full justify-start text-right font-normal',
                    !dateRange && 'text-muted-foreground'
                  )}
                >
                  <CalendarIcon className="ml-2" size={16} />
                  {dateRange?.from ? (
                    dateRange.to ? (
                      <>
                        {format(dateRange.from, 'dd/MM/yy', { locale: he })} -{' '}
                        {format(dateRange.to, 'dd/MM/yy', { locale: he })}
                      </>
                    ) : (
                      format(dateRange.from, 'dd/MM/yy', { locale: he })
                    )
                  ) : (
                    <span>בחר טווח תאריכים</span>
                  )}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="range"
                  defaultMonth={dateRange?.from}
                  selected={dateRange}
                  onSelect={onDateRangeChange}
                  numberOfMonths={2}
                  locale={he}
                  className={cn('p-3 pointer-events-auto')}
                />
              </PopoverContent>
            </Popover>
          </div>

          {/* Provider Filter */}
          <div className="space-y-2">
            <label className="text-sm font-medium">סינון לפי ספק</label>
            <Select value={provider} onValueChange={onProviderChange}>
              <SelectTrigger>
                <SelectValue placeholder="כל הספקים" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">כל הספקים</SelectItem>
                {providers.map((p) => (
                  <SelectItem key={p} value={p}>
                    {p}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* View Mode Tabs */}
          <div className="space-y-2">
            <label className="text-sm font-medium">תצוגה</label>
            <Tabs value={viewMode} onValueChange={(value) => onViewModeChange(value as ViewMode)}>
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="weekly">שבועי</TabsTrigger>
                <TabsTrigger value="monthly">חודשי</TabsTrigger>
                <TabsTrigger value="yearly">שנתי</TabsTrigger>
              </TabsList>
            </Tabs>
          </div>
        </div>
      </div>
    </Card>
  );
};

export default ChartFilters;
