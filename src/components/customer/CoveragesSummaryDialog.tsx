import { useState, useEffect } from "react";
import { Loader2 } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { supabase } from "@/integrations/supabase/client";

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  clientId: string;
}

interface CoverageSummary {
  type: string;
  label: string;
  existing: number;
  requested: number;
  difference: number;
}

interface AccumulationSummary {
  type: string;
  label: string;
  accumulated: number;
  deposits: number;
}

const CoveragesSummaryDialog = ({ open, onOpenChange, clientId }: Props) => {
  const [isLoading, setIsLoading] = useState(true);
  const [coverages, setCoverages] = useState<CoverageSummary[]>([]);
  const [accumulations, setAccumulations] = useState<AccumulationSummary[]>([]);

  useEffect(() => {
    if (open) {
      fetchData();
    }
  }, [open, clientId]);

  const fetchData = async () => {
    setIsLoading(true);
    try {
      // Fetch needs assessment for insurance amounts
      const { data: assessment } = await supabase
        .from('needs_assessment')
        .select('*')
        .eq('client_id', clientId)
        .single();

      // Build coverages from assessment
      const coverageTypes = [
        { key: 'disability', label: 'אובדן כושר עבודה' },
        { key: 'life_insurance', label: 'ביטוח חיים' },
        { key: 'survivors_pension', label: 'פנסיית שאירים' },
        { key: 'critical_illness', label: 'מחלות קשות' },
        { key: 'nursing', label: 'סיעודי' },
        { key: 'health', label: 'ביטוח בריאות' },
        { key: 'personal_accident', label: 'תאונות אישיות' },
      ];

      const coverageData: CoverageSummary[] = coverageTypes.map(({ key, label }) => {
        const existing = assessment?.[`existing_${key}` as keyof typeof assessment] as number || 0;
        const requested = assessment?.[`requested_${key}` as keyof typeof assessment] as number || 0;
        return {
          type: key,
          label,
          existing,
          requested,
          difference: requested - existing
        };
      });

      setCoverages(coverageData);

      // Mock accumulation data (would typically come from policies)
      const accumulationData: AccumulationSummary[] = [
        { type: 'gemel', label: 'קופות גמל', accumulated: 0, deposits: 0 },
        { type: 'hishtalmut', label: 'קרנות השתלמות', accumulated: 0, deposits: 0 },
        { type: 'pension_policies', label: 'פוליסות פנסיוניות', accumulated: 0, deposits: 0 },
        { type: 'pension', label: 'פנסיה', accumulated: 150724, deposits: 3653 },
        { type: 'private', label: 'פרט', accumulated: 715, deposits: 4368 },
      ];

      setAccumulations(accumulationData);

    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const formatCurrency = (value: number): string => {
    if (!value) return '-';
    return new Intl.NumberFormat('he-IL', {
      style: 'currency',
      currency: 'ILS',
      maximumFractionDigits: 0
    }).format(value);
  };

  const getDifferenceColor = (diff: number): string => {
    if (diff > 0) return 'text-red-600';
    if (diff < 0) return 'text-green-600';
    return '';
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl" dir="rtl">
        <DialogHeader>
          <DialogTitle className="text-xl">כיסויים ביטוחיים וצבירות</DialogTitle>
        </DialogHeader>

        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : (
          <div className="space-y-6">
            {/* Coverages Table */}
            <div>
              <h3 className="font-semibold mb-3">כיסויים ביטוחיים</h3>
              <div className="border rounded-lg overflow-hidden">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-primary text-primary-foreground">
                      <TableHead className="text-right text-white">סוג ביטוח</TableHead>
                      <TableHead className="text-right text-white">מצוי</TableHead>
                      <TableHead className="text-right text-white">רצוי</TableHead>
                      <TableHead className="text-right text-white">חיסור/עודף</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {coverages.map((coverage) => (
                      <TableRow key={coverage.type}>
                        <TableCell className="font-medium">{coverage.label}</TableCell>
                        <TableCell>{formatCurrency(coverage.existing)}</TableCell>
                        <TableCell>{formatCurrency(coverage.requested)}</TableCell>
                        <TableCell className={getDifferenceColor(coverage.difference)}>
                          {coverage.difference !== 0 ? (
                            <>
                              {coverage.difference > 0 ? '+' : ''}
                              {formatCurrency(Math.abs(coverage.difference))}
                            </>
                          ) : '-'}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </div>

            {/* Accumulations Table */}
            <div>
              <h3 className="font-semibold mb-3">צבירות והפקדות</h3>
              <div className="border rounded-lg overflow-hidden">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-primary text-primary-foreground">
                      <TableHead className="text-right text-white">סוג</TableHead>
                      <TableHead className="text-right text-white">צבירה</TableHead>
                      <TableHead className="text-right text-white">הפקדה</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {accumulations.map((acc) => (
                      <TableRow key={acc.type}>
                        <TableCell className="font-medium">{acc.label}</TableCell>
                        <TableCell>{formatCurrency(acc.accumulated)}</TableCell>
                        <TableCell>{formatCurrency(acc.deposits)}</TableCell>
                      </TableRow>
                    ))}
                    <TableRow className="bg-muted font-semibold">
                      <TableCell>סה״כ</TableCell>
                      <TableCell>
                        {formatCurrency(accumulations.reduce((sum, a) => sum + a.accumulated, 0))}
                      </TableCell>
                      <TableCell>
                        {formatCurrency(accumulations.reduce((sum, a) => sum + a.deposits, 0))}
                      </TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              </div>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default CoveragesSummaryDialog;
