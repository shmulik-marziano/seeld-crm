import { useState, useEffect } from "react";
import { Target, Loader2, Save, CheckSquare, Settings, Gauge, DollarSign, FileText } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Slider } from "@/components/ui/slider";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface NeedsAssessment {
  id?: string;
  client_id: string;
  // Customer Goals
  goal_monthly_pension: boolean;
  goal_lump_sum: boolean;
  goal_check_surplus: boolean;
  goal_sick_pay: boolean;
  goal_adjust_risk: boolean;
  goal_consolidate_portfolio: boolean;
  goal_tax_issues: boolean;
  goal_treasury_check: boolean;
  goal_mortgage_check: boolean;
  goal_adjust_savings: boolean;
  goal_retirement_prep: boolean;
  goal_ongoing_support: boolean;
  goals_notes?: string;
  // Savings Goals
  savings_care_for_future: boolean;
  savings_tax_benefits: boolean;
  savings_lump_sum_at_retirement: boolean;
  savings_early_retirement: boolean;
  savings_monthly_pension_at_retirement: boolean;
  savings_combined_pension_lump_sum: boolean;
  savings_custom_definition?: string;
  // Insurance Goals
  insurance_critical_illness: boolean;
  insurance_nursing: boolean;
  insurance_health: boolean;
  insurance_widow_pension: boolean;
  insurance_disability_accident: boolean;
  insurance_orphan_pension: boolean;
  insurance_personal_accident: boolean;
  insurance_life: boolean;
  insurance_survivors_pension: boolean;
  insurance_disability: boolean;
  insurance_death_accident: boolean;
  // Financial Status
  existing_savings_type?: string;
  existing_savings_details?: string;
  financial_status_type?: string;
  income_sources_details?: string;
  obligations_details?: string;
  dependents_details?: string;
  financial_notes?: string;
  client_not_disclosing: boolean;
  // Risk Level
  risk_high_risk_belief?: number;
  risk_volatility_tolerance?: number;
  risk_investment_risk?: number;
  risk_persistence?: number;
  risk_monitoring?: number;
  risk_high_return_pursuit?: number;
  risk_level_result?: string;
  // Insurance Amounts
  requested_life_insurance?: number;
  requested_mortgage_insurance?: number;
  requested_survivors_pension?: number;
  requested_disability?: number;
  requested_critical_illness?: number;
  requested_nursing?: number;
  requested_health?: number;
  requested_personal_accident?: number;
  requested_monthly_savings?: number;
  requested_private_savings?: number;
  requested_accumulated_sum?: number;
  existing_life_insurance?: number;
  existing_mortgage_insurance?: number;
  existing_survivors_pension?: number;
  existing_disability?: number;
  existing_critical_illness?: number;
  existing_nursing?: number;
  existing_health?: number;
  existing_personal_accident?: number;
  existing_monthly_savings?: number;
  existing_private_savings?: number;
  existing_accumulated_sum?: number;
  additional_preferences?: string;
  // Additional Info
  additional_info?: string;
}

interface Props {
  clientId: string;
}

const defaultAssessment: Omit<NeedsAssessment, 'client_id'> = {
  goal_monthly_pension: false,
  goal_lump_sum: false,
  goal_check_surplus: false,
  goal_sick_pay: false,
  goal_adjust_risk: false,
  goal_consolidate_portfolio: false,
  goal_tax_issues: false,
  goal_treasury_check: false,
  goal_mortgage_check: false,
  goal_adjust_savings: false,
  goal_retirement_prep: false,
  goal_ongoing_support: false,
  savings_care_for_future: false,
  savings_tax_benefits: false,
  savings_lump_sum_at_retirement: false,
  savings_early_retirement: false,
  savings_monthly_pension_at_retirement: false,
  savings_combined_pension_lump_sum: false,
  insurance_critical_illness: false,
  insurance_nursing: false,
  insurance_health: false,
  insurance_widow_pension: false,
  insurance_disability_accident: false,
  insurance_orphan_pension: false,
  insurance_personal_accident: false,
  insurance_life: false,
  insurance_survivors_pension: false,
  insurance_disability: false,
  insurance_death_accident: false,
  client_not_disclosing: false,
};

const NeedsAssessmentSection = ({ clientId }: Props) => {
  const { toast } = useToast();
  const [assessment, setAssessment] = useState<NeedsAssessment>({ ...defaultAssessment, client_id: clientId });
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [activeTab, setActiveTab] = useState("goals");

  useEffect(() => {
    fetchAssessment();
  }, [clientId]);

  const fetchAssessment = async () => {
    try {
      const { data, error } = await supabase
        .from('needs_assessment')
        .select('*')
        .eq('client_id', clientId)
        .single();

      if (error && error.code !== 'PGRST116') throw error;

      if (data) {
        setAssessment(data);
      }
    } catch (error: any) {
      console.error('Error fetching assessment:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      if (assessment.id) {
        const { error } = await supabase
          .from('needs_assessment')
          .update(assessment)
          .eq('id', assessment.id);
        if (error) throw error;
      } else {
        const { data, error } = await supabase
          .from('needs_assessment')
          .insert(assessment)
          .select()
          .single();
        if (error) throw error;
        setAssessment(data);
      }

      toast({
        title: "נשמר בהצלחה",
        description: "בירור הצרכים עודכן"
      });
    } catch (error: any) {
      toast({
        title: "שגיאה בשמירה",
        description: error.message,
        variant: "destructive"
      });
    } finally {
      setIsSaving(false);
    }
  };

  const calculateRiskLevel = (): string => {
    const scores = [
      assessment.risk_high_risk_belief,
      assessment.risk_volatility_tolerance,
      assessment.risk_investment_risk,
      assessment.risk_persistence,
      assessment.risk_monitoring,
      assessment.risk_high_return_pursuit
    ].filter(s => s !== undefined) as number[];

    if (scores.length === 0) return '';

    const avg = scores.reduce((a, b) => a + b, 0) / scores.length;
    if (avg >= 4) return 'high';
    if (avg >= 2.5) return 'medium';
    return 'low';
  };

  if (isLoading) {
    return (
      <Card className="glass-card">
        <CardContent className="flex items-center justify-center py-8">
          <Loader2 className="h-6 w-6 animate-spin text-primary" />
        </CardContent>
      </Card>
    );
  }

  const riskLabels = ['כלל לא מסכים', 'מסכים במידה מועטה', 'מסכים', 'מסכים במידה גבוהה', 'מסכים לחלוטין'];

  return (
    <Card className="glass-card">
      <CardHeader className="pb-4">
        <div className="flex justify-between items-center">
          <CardTitle className="flex items-center gap-2">
            <Target className="h-5 w-5" />
            בירור צרכים
          </CardTitle>
          <Button onClick={handleSave} disabled={isSaving} size="sm">
            {isSaving ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Save className="h-4 w-4" />
            )}
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <Tabs value={activeTab} onValueChange={setActiveTab} dir="rtl">
          <TabsList className="grid grid-cols-5 w-full mb-4">
            <TabsTrigger value="goals" className="text-xs px-1">
              <CheckSquare className="h-3 w-3 sm:ml-1" />
              <span className="hidden sm:inline">מטרות</span>
            </TabsTrigger>
            <TabsTrigger value="characteristics" className="text-xs px-1">
              <Settings className="h-3 w-3 sm:ml-1" />
              <span className="hidden sm:inline">מאפיינים</span>
            </TabsTrigger>
            <TabsTrigger value="risk" className="text-xs px-1">
              <Gauge className="h-3 w-3 sm:ml-1" />
              <span className="hidden sm:inline">סיכון</span>
            </TabsTrigger>
            <TabsTrigger value="amounts" className="text-xs px-1">
              <DollarSign className="h-3 w-3 sm:ml-1" />
              <span className="hidden sm:inline">סכומים</span>
            </TabsTrigger>
            <TabsTrigger value="info" className="text-xs px-1">
              <FileText className="h-3 w-3 sm:ml-1" />
              <span className="hidden sm:inline">נוסף</span>
            </TabsTrigger>
          </TabsList>

          {/* Goals Tab */}
          <TabsContent value="goals" className="space-y-3">
            <div className="space-y-2">
              {[
                { key: 'goal_monthly_pension', label: 'לקיצבה מדי חודש' },
                { key: 'goal_lump_sum', label: 'להון זכויות' },
                { key: 'goal_check_surplus', label: 'בדיקת עודף/חוסר' },
                { key: 'goal_sick_pay', label: 'דמי מחלה' },
                { key: 'goal_adjust_risk', label: 'התאמת רמת סיכון' },
                { key: 'goal_consolidate_portfolio', label: 'ריכוז תיק' },
                { key: 'goal_tax_issues', label: 'סוגיות מיסוי' },
                { key: 'goal_treasury_check', label: 'בדיקה מול האוצר' },
                { key: 'goal_mortgage_check', label: 'בדיקת משכנתה' },
                { key: 'goal_adjust_savings', label: 'התאמת חסכונות' },
                { key: 'goal_retirement_prep', label: 'הכנה לפרישה' },
                { key: 'goal_ongoing_support', label: 'ליווי מתמשך' },
              ].map(({ key, label }) => (
                <div key={key} className="flex items-center gap-2">
                  <Checkbox
                    id={key}
                    checked={assessment[key as keyof NeedsAssessment] as boolean}
                    onCheckedChange={(checked) =>
                      setAssessment({ ...assessment, [key]: checked })
                    }
                  />
                  <Label htmlFor={key} className="text-sm cursor-pointer">{label}</Label>
                </div>
              ))}
            </div>
            <div className="pt-2">
              <Label htmlFor="goals_notes" className="text-sm">הערות</Label>
              <Textarea
                id="goals_notes"
                value={assessment.goals_notes || ''}
                onChange={(e) => setAssessment({ ...assessment, goals_notes: e.target.value })}
                placeholder="הערות נוספות..."
                className="mt-1 h-20"
                maxLength={250}
              />
            </div>
          </TabsContent>

          {/* Characteristics Tab */}
          <TabsContent value="characteristics" className="space-y-4">
            <div>
              <h4 className="font-medium text-sm mb-2">מטרות חיסכון</h4>
              <div className="space-y-2">
                {[
                  { key: 'savings_care_for_future', label: 'דאגה לעתיד' },
                  { key: 'savings_tax_benefits', label: 'ניצול הטבות מס' },
                  { key: 'savings_lump_sum_at_retirement', label: 'סכום הוני בפרישה' },
                  { key: 'savings_early_retirement', label: 'פרישה מוקדמת' },
                  { key: 'savings_monthly_pension_at_retirement', label: 'קצבה חודשית בפרישה' },
                  { key: 'savings_combined_pension_lump_sum', label: 'שילוב קצבה והון' },
                ].map(({ key, label }) => (
                  <div key={key} className="flex items-center gap-2">
                    <Checkbox
                      id={key}
                      checked={assessment[key as keyof NeedsAssessment] as boolean}
                      onCheckedChange={(checked) =>
                        setAssessment({ ...assessment, [key]: checked })
                      }
                    />
                    <Label htmlFor={key} className="text-sm cursor-pointer">{label}</Label>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <h4 className="font-medium text-sm mb-2">מטרות ביטוח</h4>
              <div className="grid grid-cols-2 gap-2">
                {[
                  { key: 'insurance_life', label: 'ביטוח חיים' },
                  { key: 'insurance_disability', label: 'אובדן כושר' },
                  { key: 'insurance_critical_illness', label: 'מחלות קשות' },
                  { key: 'insurance_nursing', label: 'סיעודי' },
                  { key: 'insurance_health', label: 'ביטוח בריאות' },
                  { key: 'insurance_survivors_pension', label: 'פנסיית שאירים' },
                  { key: 'insurance_personal_accident', label: 'תאונות אישיות' },
                  { key: 'insurance_death_accident', label: 'מוות מתאונה' },
                ].map(({ key, label }) => (
                  <div key={key} className="flex items-center gap-2">
                    <Checkbox
                      id={key}
                      checked={assessment[key as keyof NeedsAssessment] as boolean}
                      onCheckedChange={(checked) =>
                        setAssessment({ ...assessment, [key]: checked })
                      }
                    />
                    <Label htmlFor={key} className="text-xs cursor-pointer">{label}</Label>
                  </div>
                ))}
              </div>
            </div>
          </TabsContent>

          {/* Risk Tab */}
          <TabsContent value="risk" className="space-y-4">
            {[
              { key: 'risk_high_risk_belief', label: 'השקעה ברמת סיכון גבוהה' },
              { key: 'risk_volatility_tolerance', label: 'סיבולת לתנודות' },
              { key: 'risk_investment_risk', label: 'נכונות לסיכון בהשקעות' },
              { key: 'risk_persistence', label: 'התמדה גם בירידות' },
              { key: 'risk_monitoring', label: 'מעקב אחר השקעות' },
              { key: 'risk_high_return_pursuit', label: 'רדיפה אחר תשואה גבוהה' },
            ].map(({ key, label }) => (
              <div key={key} className="space-y-2">
                <Label className="text-sm">{label}</Label>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-muted-foreground w-6">
                    {assessment[key as keyof NeedsAssessment] || 1}
                  </span>
                  <Slider
                    value={[assessment[key as keyof NeedsAssessment] as number || 1]}
                    onValueChange={([value]) =>
                      setAssessment({ ...assessment, [key]: value })
                    }
                    min={1}
                    max={5}
                    step={1}
                    className="flex-1"
                  />
                </div>
              </div>
            ))}
            <div className="pt-2 p-3 bg-muted/50 rounded-lg">
              <p className="text-sm font-medium">
                רמת סיכון:{' '}
                <span className={`${
                  calculateRiskLevel() === 'high' ? 'text-red-600' :
                  calculateRiskLevel() === 'medium' ? 'text-amber-600' :
                  calculateRiskLevel() === 'low' ? 'text-green-600' : ''
                }`}>
                  {calculateRiskLevel() === 'high' ? 'גבוהה' :
                   calculateRiskLevel() === 'medium' ? 'בינונית' :
                   calculateRiskLevel() === 'low' ? 'נמוכה' : 'לא נקבע'}
                </span>
              </p>
            </div>
          </TabsContent>

          {/* Amounts Tab */}
          <TabsContent value="amounts" className="space-y-3">
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="font-medium">סוג ביטוח</div>
              <div className="font-medium">רצוי</div>
              {[
                { key: 'life_insurance', label: 'ביטוח חיים' },
                { key: 'mortgage_insurance', label: 'משכנתה' },
                { key: 'survivors_pension', label: 'פנסיית שאירים' },
                { key: 'disability', label: 'אובדן כושר' },
                { key: 'critical_illness', label: 'מחלות קשות' },
                { key: 'nursing', label: 'סיעודי' },
                { key: 'health', label: 'בריאות' },
                { key: 'personal_accident', label: 'תאונות אישיות' },
              ].map(({ key, label }) => (
                <>
                  <div key={`label-${key}`} className="text-sm py-1">{label}</div>
                  <div key={`input-${key}`}>
                    <Input
                      type="number"
                      className="h-8 text-sm"
                      value={assessment[`requested_${key}` as keyof NeedsAssessment] || ''}
                      onChange={(e) =>
                        setAssessment({
                          ...assessment,
                          [`requested_${key}`]: parseFloat(e.target.value) || undefined
                        })
                      }
                      placeholder="₪"
                    />
                  </div>
                </>
              ))}
            </div>
            <div className="pt-2">
              <Label htmlFor="additional_preferences" className="text-sm">העדפות נוספות</Label>
              <Textarea
                id="additional_preferences"
                value={assessment.additional_preferences || ''}
                onChange={(e) => setAssessment({ ...assessment, additional_preferences: e.target.value })}
                placeholder="העדפות נוספות..."
                className="mt-1 h-16"
              />
            </div>
          </TabsContent>

          {/* Additional Info Tab */}
          <TabsContent value="info" className="space-y-3">
            <div>
              <Label htmlFor="additional_info" className="text-sm">מידע נוסף</Label>
              <Textarea
                id="additional_info"
                value={assessment.additional_info || ''}
                onChange={(e) => setAssessment({ ...assessment, additional_info: e.target.value })}
                placeholder="באזור זה ניתן להזין טקסט חופשי..."
                className="mt-1 h-40"
              />
            </div>
            <div className="flex items-center gap-2">
              <Checkbox
                id="client_not_disclosing"
                checked={assessment.client_not_disclosing}
                onCheckedChange={(checked) =>
                  setAssessment({ ...assessment, client_not_disclosing: checked as boolean })
                }
              />
              <Label htmlFor="client_not_disclosing" className="text-sm cursor-pointer">
                הלקוח לא מוסר מידע
              </Label>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};

export default NeedsAssessmentSection;
