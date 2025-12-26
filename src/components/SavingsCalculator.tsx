import { useState } from "react";
import { Calculator, RotateCcw } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";

interface SavingsCalculatorProps {
  trigger?: React.ReactNode;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}

const SavingsCalculator = ({ trigger, open, onOpenChange }: SavingsCalculatorProps) => {
  const [formData, setFormData] = useState({
    birthDate: '',
    currentAge: 30,
    endAge: 67,
    savingPeriod: 37,
    targetAmount: '',
    monthlyDeposit: '',
    lumpSumDeposit: '',
    returnRate: 4,
    depositFee: 4,
    accumulatedFee: 1.05
  });

  const [results, setResults] = useState<{
    futureValue: number;
    totalDeposits: number;
    totalProfit: number;
  } | null>(null);

  const handleAgeChange = (value: number[]) => {
    const endAge = value[0];
    setFormData(prev => ({
      ...prev,
      endAge,
      savingPeriod: endAge - prev.currentAge
    }));
  };

  const handleBirthDateChange = (date: string) => {
    if (!date) return;
    const birthYear = new Date(date).getFullYear();
    const currentYear = new Date().getFullYear();
    const age = currentYear - birthYear;
    setFormData(prev => ({
      ...prev,
      birthDate: date,
      currentAge: age,
      savingPeriod: prev.endAge - age
    }));
  };

  const calculate = () => {
    const monthlyDeposit = parseFloat(formData.monthlyDeposit) || 0;
    const lumpSum = parseFloat(formData.lumpSumDeposit) || 0;
    const years = formData.savingPeriod;
    const months = years * 12;

    // Effective rates after fees
    const monthlyReturn = (formData.returnRate - formData.accumulatedFee) / 100 / 12;
    const effectiveDeposit = monthlyDeposit * (1 - formData.depositFee / 100);

    // Future Value of monthly deposits (annuity formula)
    let futureValueMonthly = 0;
    if (monthlyReturn > 0) {
      futureValueMonthly = effectiveDeposit * ((Math.pow(1 + monthlyReturn, months) - 1) / monthlyReturn);
    } else {
      futureValueMonthly = effectiveDeposit * months;
    }

    // Future Value of lump sum
    const annualReturn = (formData.returnRate - formData.accumulatedFee) / 100;
    const effectiveLumpSum = lumpSum * (1 - formData.depositFee / 100);
    const futureValueLumpSum = effectiveLumpSum * Math.pow(1 + annualReturn, years);

    const totalFutureValue = futureValueMonthly + futureValueLumpSum;
    const totalDeposits = (monthlyDeposit * months) + lumpSum;
    const totalProfit = totalFutureValue - totalDeposits;

    setResults({
      futureValue: totalFutureValue,
      totalDeposits: totalDeposits,
      totalProfit: totalProfit
    });
  };

  const reset = () => {
    setFormData({
      birthDate: '',
      currentAge: 30,
      endAge: 67,
      savingPeriod: 37,
      targetAmount: '',
      monthlyDeposit: '',
      lumpSumDeposit: '',
      returnRate: 4,
      depositFee: 4,
      accumulatedFee: 1.05
    });
    setResults(null);
  };

  const formatCurrency = (value: number): string => {
    return new Intl.NumberFormat('he-IL', {
      style: 'currency',
      currency: 'ILS',
      maximumFractionDigits: 0
    }).format(value);
  };

  const content = (
    <div className="space-y-6" dir="rtl">
      {/* Client Info */}
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label>תאריך לידה</Label>
          <Input
            type="date"
            value={formData.birthDate}
            onChange={(e) => handleBirthDateChange(e.target.value)}
          />
        </div>
        <div className="space-y-2">
          <Label>גיל נוכחי</Label>
          <Input
            type="number"
            value={formData.currentAge}
            onChange={(e) => setFormData({
              ...formData,
              currentAge: parseInt(e.target.value) || 0,
              savingPeriod: formData.endAge - (parseInt(e.target.value) || 0)
            })}
          />
        </div>
        <div className="space-y-2">
          <Label>גיל תום חסכון: {formData.endAge}</Label>
          <Slider
            value={[formData.endAge]}
            onValueChange={handleAgeChange}
            min={50}
            max={80}
            step={1}
          />
        </div>
        <div className="space-y-2">
          <Label>תקופת חסכון (שנים)</Label>
          <Input
            type="number"
            value={formData.savingPeriod}
            readOnly
            className="bg-muted"
          />
        </div>
      </div>

      <Separator />

      {/* Deposit Info */}
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label>סכום יעד מבוקש</Label>
          <Input
            type="number"
            value={formData.targetAmount}
            onChange={(e) => setFormData({ ...formData, targetAmount: e.target.value })}
            placeholder="₪"
          />
        </div>
        <div className="space-y-2">
          <Label>הפקדה חודשית</Label>
          <Input
            type="number"
            value={formData.monthlyDeposit}
            onChange={(e) => setFormData({ ...formData, monthlyDeposit: e.target.value })}
            placeholder="₪"
          />
        </div>
        <div className="space-y-2 col-span-2">
          <Label>הפקדה חד פעמית</Label>
          <Input
            type="number"
            value={formData.lumpSumDeposit}
            onChange={(e) => setFormData({ ...formData, lumpSumDeposit: e.target.value })}
            placeholder="₪"
          />
        </div>
      </div>

      <Separator />

      {/* Return & Fees */}
      <div className="grid grid-cols-3 gap-4">
        <div className="space-y-2">
          <Label>תשואה (%)</Label>
          <Input
            type="number"
            step="0.1"
            value={formData.returnRate}
            onChange={(e) => setFormData({ ...formData, returnRate: parseFloat(e.target.value) || 0 })}
          />
        </div>
        <div className="space-y-2">
          <Label>דמ"נ מהפקדה (%)</Label>
          <Input
            type="number"
            step="0.1"
            value={formData.depositFee}
            onChange={(e) => setFormData({ ...formData, depositFee: parseFloat(e.target.value) || 0 })}
          />
        </div>
        <div className="space-y-2">
          <Label>דמ"נ מצבירה (%)</Label>
          <Input
            type="number"
            step="0.01"
            value={formData.accumulatedFee}
            onChange={(e) => setFormData({ ...formData, accumulatedFee: parseFloat(e.target.value) || 0 })}
          />
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex gap-2">
        <Button onClick={reset} variant="outline" className="flex-1">
          <RotateCcw className="h-4 w-4 ml-2" />
          נקה
        </Button>
        <Button onClick={calculate} className="flex-1">
          <Calculator className="h-4 w-4 ml-2" />
          חשב
        </Button>
      </div>

      {/* Results */}
      {results && (
        <Card className="bg-primary-50/50 border-primary-200">
          <CardContent className="pt-4">
            <div className="grid grid-cols-3 gap-4 text-center">
              <div>
                <p className="text-xs text-muted-foreground">סה"כ ערך עתידי</p>
                <p className="text-lg font-bold text-primary">
                  {formatCurrency(results.futureValue)}
                </p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">הפקדות מצטברות</p>
                <p className="text-lg font-bold">
                  {formatCurrency(results.totalDeposits)}
                </p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">רווח מצטבר</p>
                <p className={`text-lg font-bold ${results.totalProfit >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {formatCurrency(results.totalProfit)}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );

  if (trigger) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogTrigger asChild>
          {trigger}
        </DialogTrigger>
        <DialogContent className="max-w-lg" dir="rtl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Calculator className="h-5 w-5" />
              מחשבון חסכון
            </DialogTitle>
          </DialogHeader>
          {content}
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg" dir="rtl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Calculator className="h-5 w-5" />
            מחשבון חסכון
          </DialogTitle>
        </DialogHeader>
        {content}
      </DialogContent>
    </Dialog>
  );
};

export default SavingsCalculator;
