import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Send, Loader2 } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

const ClientOnboarding = () => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    fullName: "",
    phone: "",
    email: ""
  });

  const handleSendLink = async () => {
    if (!formData.fullName || !formData.phone) {
      toast({
        title: "שגיאה",
        description: "יש למלא לפחות שם וטלפון",
        variant: "destructive"
      });
      return;
    }

    setIsLoading(true);

    try {
      // Get current user
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        throw new Error("משתמש לא מחובר");
      }

      // Create client in database
      const { data: client, error } = await supabase
        .from('clients')
        .insert({
          agent_id: user.id,
          full_name: formData.fullName,
          phone: formData.phone,
          email: formData.email || null,
          status: 'new'
        })
        .select()
        .single();

      if (error) throw error;

      // Generate unique onboarding link
      const onboardingLink = `${window.location.origin}/client/onboarding/${client.id}`;

      toast({
        title: "✅ הלינק נשלח בהצלחה!",
        description: `הלינק נשלח ל-${formData.fullName} בהודעת WhatsApp`
      });

      // In production: Send WhatsApp message via WhatsApp Business API
      console.log("Onboarding link:", onboardingLink);

      // Reset form
      setFormData({ fullName: "", phone: "", email: "" });

      // Navigate to clients list
      setTimeout(() => {
        navigate('/agent/dashboard');
      }, 1500);

    } catch (error) {
      console.error('Error:', error);
      toast({
        title: "שגיאה",
        description: error.message,
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary-50/20 p-6">
      <div className="max-w-2xl mx-auto">
        <div className="mb-8">
          <h1 className="text-4xl font-heading font-bold gradient-primary bg-clip-text text-transparent">
            Touch Point 1
          </h1>
          <p className="text-muted-foreground mt-2">
            שלח לינק ללקוח והמערכת תדאג לשאר
          </p>
        </div>

        <Card className="glass-card">
          <CardHeader>
            <CardTitle>פרטי הלקוח</CardTitle>
            <CardDescription>
              מלא את הפרטים ושלח את הלינק - זה יקח 10 שניות 🚀
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="fullName">שם מלא *</Label>
              <Input
                id="fullName"
                placeholder="יוסי כהן"
                value={formData.fullName}
                onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="phone">טלפון *</Label>
              <Input
                id="phone"
                type="tel"
                placeholder="050-1234567"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">אימייל (אופציונלי)</Label>
              <Input
                id="email"
                type="email"
                placeholder="yossi@example.com"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              />
            </div>

            <Button 
              onClick={handleSendLink}
              disabled={isLoading}
              className="w-full bg-primary hover:bg-primary-600 text-lg py-6"
            >
              {isLoading ? (
                <>
                  <Loader2 className="ml-2 h-5 w-5 animate-spin" />
                  שולח לינק...
                </>
              ) : (
                <>
                  <Send className="ml-2 h-5 w-5" />
                  שלח לינק ב-WhatsApp
                </>
              )}
            </Button>

            <div className="mt-6 p-4 rounded-lg bg-primary-50/50 border border-primary-200">
              <p className="text-sm font-medium text-primary-700">
                💡 מה קורה אחרי שאתה שולח את הלינק?
              </p>
              <ul className="mt-2 space-y-1 text-sm text-primary-600">
                <li>✓ הלקוח מקבל הודעת WhatsApp עם הלינק</li>
                <li>✓ הלקוח ממלא את הפרטים והמסמכים</li>
                <li>✓ המערכת מושכת נתונים מהר ביטוח ומסלקה</li>
                <li>✓ AI מריץ ניתוח אוטומטי</li>
                <li>✓ אתה מקבל דוח ויזואלי מוכן לפגישה</li>
                <li>✓ Ra'am מעדכן את הלקוח בהתקדמות</li>
              </ul>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ClientOnboarding;
