import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { User } from '@supabase/supabase-js';
import { TrendingUp, Lightbulb } from 'lucide-react';

const ClientDashboard = () => {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    
    if (!session) {
      navigate('/client/auth');
      return;
    }

    setUser(session.user);

    // Check role
    const { data: roleData } = await supabase
      .from('user_roles')
      .select('role')
      .eq('user_id', session.user.id)
      .single();

    if (roleData?.role !== 'client') {
      toast({
        title: 'שגיאה',
        description: 'אין לך הרשאה לגשת לעמוד זה',
        variant: 'destructive',
      });
      navigate('/');
      return;
    }

    // Fetch profile
    const { data: profileData } = await supabase
      .from('profiles')
      .select('*')
      .eq('user_id', session.user.id)
      .single();

    setProfile(profileData);
    setLoading(false);
  };

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    navigate('/');
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">טוען...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5">
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-4xl font-heading bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
            שלום, {profile?.full_name}
          </h1>
          <Button variant="outline" onClick={handleSignOut}>
            התנתק
          </Button>
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          <Card className="backdrop-blur-sm bg-background/80 border-primary/20 hover-lift cursor-pointer" onClick={() => navigate('/client/policies')}>
            <CardHeader>
              <CardTitle>הפוליסות שלי</CardTitle>
              <CardDescription>ניהול הפוליסות הפעילות שלך</CardDescription>
            </CardHeader>
            <CardContent>
              <Button className="w-full">
                כניסה לניהול פוליסות
              </Button>
            </CardContent>
          </Card>

          <Card className="backdrop-blur-sm bg-background/80 border-primary/20">
            <CardHeader>
              <CardTitle>פרופיל אישי</CardTitle>
              <CardDescription>עדכון פרטים אישיים</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <p className="text-sm">
                  <span className="font-medium">אימייל:</span> {user?.email}
                </p>
                <p className="text-sm">
                  <span className="font-medium">טלפון:</span> {profile?.phone || 'לא הוזן'}
                </p>
                <Button 
                  onClick={() => navigate('/profile/edit')}
                  className="w-full mt-4"
                  variant="outline"
                >
                  ערוך פרופיל
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card className="backdrop-blur-sm bg-background/80 border-primary/20 hover-lift cursor-pointer" onClick={() => navigate('/client/notifications')}>
            <CardHeader>
              <CardTitle>מרכז התראות</CardTitle>
              <CardDescription>התראות חכמות והמלצות מותאמות אישית</CardDescription>
            </CardHeader>
            <CardContent>
              <Button className="w-full">
                כניסה למרכז התראות
              </Button>
            </CardContent>
          </Card>

          <Card className="backdrop-blur-sm bg-background/80 border-primary/20 hover-lift cursor-pointer" onClick={() => navigate('/client/analytics')}>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5" />
                אנליטיקה מתקדמת
              </CardTitle>
              <CardDescription>תחזיות AI, מדדי ביצועים, ו-Benchmark מול שוק</CardDescription>
            </CardHeader>
            <CardContent>
              <Button className="w-full">
                כניסה לדשבורד אנליטיקה
              </Button>
            </CardContent>
          </Card>

          <Card className="backdrop-blur-sm bg-background/80 border-primary/20 hover-lift cursor-pointer" onClick={() => navigate('/client/recommendations')}>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Lightbulb className="h-5 w-5" />
                המלצות חכמות
              </CardTitle>
              <CardDescription>זיהוי כפילויות, איחוד פוליסות וחיסכון</CardDescription>
            </CardHeader>
            <CardContent>
              <Button className="w-full">
                כניסה למערכת המלצות
              </Button>
            </CardContent>
          </Card>

          <Card className="backdrop-blur-sm bg-background/80 border-primary/20">
            <CardHeader>
              <CardTitle>מסמכים</CardTitle>
              <CardDescription>המסמכים והדוחות שלך</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">בקרוב...</p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default ClientDashboard;
