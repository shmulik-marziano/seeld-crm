import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { User } from '@supabase/supabase-js';

const AgentDashboard = () => {
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
      navigate('/agent/auth');
      return;
    }

    setUser(session.user);

    // Check role
    const { data: roleData } = await supabase
      .from('user_roles')
      .select('role')
      .eq('user_id', session.user.id)
      .single();

    if (roleData?.role !== 'agent' && roleData?.role !== 'admin') {
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
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-accent/5">
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-4xl font-heading bg-gradient-to-r from-accent to-secondary bg-clip-text text-transparent">
            פאנל ניהול - {profile?.full_name}
          </h1>
          <Button variant="outline" onClick={handleSignOut}>
            התנתק
          </Button>
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          <Card className="backdrop-blur-sm bg-background/80 border-accent/20">
            <CardHeader>
              <CardTitle>לקוחות</CardTitle>
              <CardDescription>ניהול בסיס הלקוחות</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">בקרוב...</p>
            </CardContent>
          </Card>

          <Card className="backdrop-blur-sm bg-background/80 border-accent/20">
            <CardHeader>
              <CardTitle>לידים</CardTitle>
              <CardDescription>ניהול פניות חדשות</CardDescription>
            </CardHeader>
            <CardContent>
              <Button 
                onClick={() => navigate('/agent/leads')}
                className="w-full"
                variant="outline"
              >
                פתח ניהול לידים
              </Button>
            </CardContent>
          </Card>

          <Card className="backdrop-blur-sm bg-background/80 border-accent/20">
            <CardHeader>
              <CardTitle>פוליסות</CardTitle>
              <CardDescription>ניהול פוליסות הלקוחות</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">בקרוב...</p>
            </CardContent>
          </Card>

          <Card className="backdrop-blur-sm bg-background/80 border-accent/20">
            <CardHeader>
              <CardTitle>דוחות</CardTitle>
              <CardDescription>דוחות וניתוחים</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">בקרוב...</p>
            </CardContent>
          </Card>

          <Card className="backdrop-blur-sm bg-background/80 border-accent/20">
            <CardHeader>
              <CardTitle>SeelD AI</CardTitle>
              <CardDescription>כלי AI לייצור תוכן</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">בקרוב...</p>
            </CardContent>
          </Card>

          <Card className="backdrop-blur-sm bg-background/80 border-accent/20">
            <CardHeader>
              <CardTitle>הגדרות</CardTitle>
              <CardDescription>הגדרות חשבון ומערכת</CardDescription>
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
        </div>
      </div>
    </div>
  );
};

export default AgentDashboard;
