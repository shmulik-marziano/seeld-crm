import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowRight, Lightbulb, AlertTriangle, TrendingDown, Shield, CheckCircle2, RefreshCw, Sparkles, TrendingUp } from "lucide-react";
import { toast } from "sonner";
import FuturisticBackground from "@/components/FuturisticBackground";
import { Progress } from "@/components/ui/progress";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

interface PolicyDetail {
  id: string;
  type: string;
  provider: string;
  policyNumber: string;
  premium: number;
}

interface Recommendation {
  id: string;
  type: 'duplicate' | 'consolidation' | 'savings' | 'coverage_gap' | 'optimization';
  priority: 'high' | 'medium' | 'low';
  title: string;
  description: string;
  policies: string[];
  policyDetails?: PolicyDetail[];
  potentialSavings?: number;
  actionItems: string[];
  reasoning: string;
}

interface Summary {
  totalSavingsPotential: number;
  criticalIssues: number;
  optimizationOpportunities: number;
  overallScore: number;
}

const typeLabels: Record<string, string> = {
  duplicate: 'כפילות',
  consolidation: 'איחוד',
  savings: 'חיסכון',
  coverage_gap: 'חוסר כיסוי',
  optimization: 'אופטימיזציה'
};

const typeIcons: Record<string, any> = {
  duplicate: AlertTriangle,
  consolidation: Shield,
  savings: TrendingDown,
  coverage_gap: Shield,
  optimization: Lightbulb
};

const priorityColors: Record<string, string> = {
  high: 'destructive',
  medium: 'default',
  low: 'secondary'
};

const priorityLabels: Record<string, string> = {
  high: 'דחוף',
  medium: 'בינוני',
  low: 'נמוך'
};

const policyTypeLabels: Record<string, string> = {
  life_insurance: 'ביטוח חיים',
  health_insurance: 'ביטוח בריאות',
  pension: 'פנסיה',
  disability_insurance: 'ביטוח אובדן כושר',
  property_insurance: 'ביטוח רכוש'
};

export default function Recommendations() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [analyzing, setAnalyzing] = useState(false);
  const [recommendations, setRecommendations] = useState<Recommendation[]>([]);
  const [summary, setSummary] = useState<Summary | null>(null);
  const [totalPolicies, setTotalPolicies] = useState(0);
  const [trackingDialog, setTrackingDialog] = useState(false);
  const [selectedRec, setSelectedRec] = useState<Recommendation | null>(null);
  const [actualSavings, setActualSavings] = useState("");
  const [notes, setNotes] = useState("");

  useEffect(() => {
    checkAuthAndLoadRecommendations();
  }, []);

  const checkAuthAndLoadRecommendations = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      navigate('/client/auth');
      return;
    }
    await loadRecommendations();
  };

  const loadRecommendations = async () => {
    setLoading(true);
    setAnalyzing(true);
    try {
      const { data, error } = await supabase.functions.invoke('recommendations');
      
      if (error) throw error;
      
      setRecommendations(data.recommendations || []);
      setSummary(data.summary || null);
      setTotalPolicies(data.totalPolicies || 0);
      
      if (data.recommendations?.length === 0) {
        toast.success('לא נמצאו המלצות - התיק שלך מאוזן!');
      } else {
        toast.success(`נמצאו ${data.recommendations.length} המלצות`);
      }
    } catch (error) {
      console.error('Error loading recommendations:', error);
      toast.error('שגיאה בטעינת ההמלצות');
    } finally {
      setLoading(false);
      setAnalyzing(false);
    }
  };

  const handleMarkAsImplemented = (rec: Recommendation) => {
    setSelectedRec(rec);
    setActualSavings(rec.potentialSavings?.toString() || "0");
    setNotes("");
    setTrackingDialog(true);
  };

  const handleSaveTracking = async () => {
    if (!selectedRec) return;

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      const { error } = await supabase.from('recommendation_tracking').insert({
        user_id: user.id,
        recommendation_id: selectedRec.id,
        recommendation_type: selectedRec.type,
        recommendation_title: selectedRec.title,
        status: 'completed',
        predicted_savings: selectedRec.potentialSavings || 0,
        actual_savings: parseFloat(actualSavings) || 0,
        completion_date: new Date().toISOString(),
        notes: notes || null
      });

      if (error) throw error;

      toast.success('ההמלצה סומנה כבוצעה בהצלחה!');
      setTrackingDialog(false);
      setSelectedRec(null);
      setActualSavings("");
      setNotes("");
    } catch (error) {
      console.error('Error saving tracking:', error);
      toast.error('שגיאה בשמירת המעקב');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <FuturisticBackground />
        <div className="relative z-10 flex items-center justify-center min-h-screen">
          <div className="text-center">
            <RefreshCw className="w-12 h-12 mx-auto mb-4 animate-spin text-primary" />
            <p className="text-foreground text-lg mb-2">מנתח את התיק שלך...</p>
            <p className="text-muted-foreground text-sm">זיהוי כפילויות והזדמנויות לחיסכון</p>
          </div>
        </div>
      </div>
    );
  }

  const scoreLabelColor = summary && summary.overallScore >= 80 ? 'text-green-500' : 
                          summary && summary.overallScore >= 60 ? 'text-yellow-500' : 
                          'text-destructive';

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
            <div className="flex items-center justify-between flex-wrap gap-4">
              <div className="flex items-center gap-3">
                <Sparkles className="h-8 w-8 text-primary" />
                <div>
                  <h1 className="text-3xl font-bold text-foreground">המלצות חכמות</h1>
                  <p className="text-muted-foreground">ניתוח מבוסס AI לאופטימיזציה של התיק</p>
                </div>
              </div>
              <div className="flex gap-2">
                <Button 
                  onClick={() => navigate('/client/recommendation-tracking')}
                  variant="outline"
                  className="gap-2"
                >
                  <TrendingUp className="h-4 w-4" />
                  מעקב ROI
                </Button>
                <Button 
                  onClick={loadRecommendations} 
                  disabled={analyzing}
                  className="gap-2"
                >
                  {analyzing ? (
                    <>
                      <RefreshCw className="h-4 w-4 animate-spin" />
                      מנתח...
                    </>
                  ) : (
                    <>
                      <RefreshCw className="h-4 w-4" />
                      נתח מחדש
                    </>
                  )}
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Summary Cards */}
        {summary && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <Card className="glass-card">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">ציון כללי</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex items-baseline gap-2">
                    <span className={`text-3xl font-bold ${scoreLabelColor}`}>
                      {summary.overallScore}
                    </span>
                    <span className="text-muted-foreground">/100</span>
                  </div>
                  <Progress value={summary.overallScore} className="h-2" />
                  <p className="text-xs text-muted-foreground">
                    {summary.overallScore >= 80 ? 'תיק מצוין' : 
                     summary.overallScore >= 60 ? 'תיק טוב עם מקום לשיפור' : 
                     'יש מקום משמעותי לשיפור'}
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card className="glass-card">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">חיסכון פוטנציאלי</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-baseline gap-2">
                  <span className="text-3xl font-bold text-green-500">
                    ₪{summary.totalSavingsPotential.toLocaleString()}
                  </span>
                  <TrendingDown className="h-5 w-5 text-green-500" />
                </div>
                <p className="text-xs text-muted-foreground mt-1">לשנה</p>
              </CardContent>
            </Card>

            <Card className="glass-card">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">בעיות קריטיות</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-baseline gap-2">
                  <span className="text-3xl font-bold text-destructive">
                    {summary.criticalIssues}
                  </span>
                  <AlertTriangle className="h-5 w-5 text-destructive" />
                </div>
                <p className="text-xs text-muted-foreground mt-1">דורשות טיפול מיידי</p>
              </CardContent>
            </Card>

            <Card className="glass-card">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">הזדמנויות</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-baseline gap-2">
                  <span className="text-3xl font-bold text-primary">
                    {summary.optimizationOpportunities}
                  </span>
                  <Lightbulb className="h-5 w-5 text-primary" />
                </div>
                <p className="text-xs text-muted-foreground mt-1">לשיפור ואופטימיזציה</p>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Recommendations List */}
        {recommendations.length === 0 ? (
          <Card className="glass-card">
            <CardContent className="flex flex-col items-center justify-center py-12">
              <CheckCircle2 className="h-16 w-16 text-green-500 mb-4" />
              <h3 className="text-xl font-semibold text-foreground mb-2">תיק מאוזן!</h3>
              <p className="text-muted-foreground text-center">
                לא נמצאו המלצות לשיפור. התיק שלך מנוהל היטב.
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-6">
            {recommendations.map((rec) => {
              const Icon = typeIcons[rec.type];
              return (
                <Card key={rec.id} className="glass-card">
                  <CardHeader>
                    <div className="flex items-start justify-between gap-4 flex-wrap">
                      <div className="flex items-start gap-3">
                        <div className={`p-2 rounded-lg ${
                          rec.priority === 'high' ? 'bg-destructive/10' :
                          rec.priority === 'medium' ? 'bg-primary/10' :
                          'bg-secondary/10'
                        }`}>
                          <Icon className={`h-6 w-6 ${
                            rec.priority === 'high' ? 'text-destructive' :
                            rec.priority === 'medium' ? 'text-primary' :
                            'text-secondary'
                          }`} />
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <CardTitle className="text-xl">{rec.title}</CardTitle>
                            <Badge variant={priorityColors[rec.priority] as any}>
                              {priorityLabels[rec.priority]}
                            </Badge>
                            <Badge variant="outline">
                              {typeLabels[rec.type]}
                            </Badge>
                          </div>
                          <CardDescription>{rec.description}</CardDescription>
                        </div>
                      </div>
                      {rec.potentialSavings && rec.potentialSavings > 0 && (
                        <div className="text-left">
                          <p className="text-sm text-muted-foreground">חיסכון פוטנציאלי</p>
                          <p className="text-2xl font-bold text-green-500">
                            ₪{rec.potentialSavings.toLocaleString()}
                          </p>
                          <p className="text-xs text-muted-foreground">לשנה</p>
                        </div>
                      )}
                    </div>
                  </CardHeader>
                  
                  <CardContent className="space-y-4">
                    {/* Related Policies */}
                    {rec.policyDetails && rec.policyDetails.length > 0 && (
                      <div>
                        <h4 className="text-sm font-semibold text-foreground mb-2">פוליסות רלוונטיות:</h4>
                        <div className="space-y-2">
                          {rec.policyDetails.map((policy) => (
                            <div key={policy.id} className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
                              <div>
                                <p className="text-sm font-medium text-foreground">
                                  {policyTypeLabels[policy.type] || policy.type}
                                </p>
                                <p className="text-xs text-muted-foreground">
                                  {policy.provider} • {policy.policyNumber}
                                </p>
                              </div>
                              <p className="text-sm font-semibold text-foreground">
                                ₪{policy.premium.toLocaleString()}/חודש
                              </p>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Reasoning */}
                    <div className="p-4 bg-muted/20 rounded-lg">
                      <h4 className="text-sm font-semibold text-foreground mb-2">נימוק:</h4>
                      <p className="text-sm text-foreground leading-relaxed">{rec.reasoning}</p>
                    </div>

                    {/* Action Items */}
                    <div>
                      <h4 className="text-sm font-semibold text-foreground mb-2">פעולות מומלצות:</h4>
                      <ul className="space-y-2">
                        {rec.actionItems.map((action, idx) => (
                          <li key={idx} className="flex items-start gap-2 text-sm text-foreground">
                            <CheckCircle2 className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                            <span>{action}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    {/* Mark as Implemented Button */}
                    <div className="pt-4 border-t border-border">
                      <Button 
                        onClick={() => handleMarkAsImplemented(rec)}
                        className="w-full gap-2"
                      >
                        <CheckCircle2 className="h-4 w-4" />
                        סמן כבוצע ועקוב אחר ROI
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}

        {/* Info Footer */}
        <Card className="glass-card mt-8">
          <CardContent className="pt-6">
            <div className="flex items-start gap-3">
              <Lightbulb className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
              <div>
                <p className="text-sm text-foreground font-medium mb-1">טיפ:</p>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  ההמלצות מבוססות על ניתוח AI מתקדם של התיק שלך. מומלץ להתייעץ עם יועץ פיננסי לפני ביצוע שינויים משמעותיים.
                  החיסכון הפוטנציאלי מבוסס על נתונים סטטיסטיים ועשוי להשתנות בפועל.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Tracking Dialog */}
        <Dialog open={trackingDialog} onOpenChange={setTrackingDialog}>
          <DialogContent className="glass-card sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle>סמן המלצה כבוצעה</DialogTitle>
              <DialogDescription>
                עדכן את החיסכון בפועל והוסף הערות למעקב
              </DialogDescription>
            </DialogHeader>
            
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="predicted">חיסכון צפוי (לשנה)</Label>
                <Input
                  id="predicted"
                  value={`₪${selectedRec?.potentialSavings?.toLocaleString() || 0}`}
                  disabled
                  className="bg-muted"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="actual">חיסכון בפועל (לשנה) *</Label>
                <Input
                  id="actual"
                  type="number"
                  value={actualSavings}
                  onChange={(e) => setActualSavings(e.target.value)}
                  placeholder="0"
                  className="text-left"
                  dir="ltr"
                />
                <p className="text-xs text-muted-foreground">
                  הזן את החיסכון שמומש בפועל לאחר ביצוע ההמלצה
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="notes">הערות (אופציונלי)</Label>
                <Textarea
                  id="notes"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="הוסף הערות על תהליך הביצוע, אתגרים, או תובנות..."
                  rows={3}
                />
              </div>
            </div>

            <DialogFooter>
              <Button variant="outline" onClick={() => setTrackingDialog(false)}>
                ביטול
              </Button>
              <Button onClick={handleSaveTracking}>
                שמור ועקוב
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}