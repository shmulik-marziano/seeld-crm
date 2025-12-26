import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ArrowRight, RefreshCw } from 'lucide-react';
import NotificationsList from '@/components/notifications/NotificationsList';
import FuturisticBackground from '@/components/FuturisticBackground';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useState } from 'react';
import { PushNotificationSetup } from '@/components/notifications/PushNotificationSetup';

const Notifications = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isGenerating, setIsGenerating] = useState(false);

  const generateNotifications = async () => {
    setIsGenerating(true);
    try {
      const { data, error } = await supabase.functions.invoke('generate-notifications');

      if (error) throw error;

      toast({
        title: 'התראות עודכנו',
        description: `נוצרו ${data.notifications_created} התראות חדשות`,
      });

      // Reload the page to show new notifications
      window.location.reload();
    } catch (error: any) {
      toast({
        title: 'שגיאה',
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="min-h-screen relative">
      <FuturisticBackground />
      <div className="container mx-auto px-4 py-8 relative z-10">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-4xl font-heading bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent mb-2">
              מרכז ההתראות
            </h1>
            <p className="text-muted-foreground">כל ההתראות וההמלצות החכמות שלך במקום אחד</p>
          </div>
          <div className="flex gap-2">
            <Button 
              variant="outline" 
              onClick={generateNotifications}
              disabled={isGenerating}
            >
              {isGenerating ? (
                <>
                  <RefreshCw className="ml-2 animate-spin" size={20} />
                  מעדכן...
                </>
              ) : (
                <>
                  <RefreshCw className="ml-2" size={20} />
                  עדכן התראות
                </>
              )}
            </Button>
            <Button variant="outline" onClick={() => navigate('/client/dashboard')}>
              <ArrowRight className="ml-2" size={20} />
              חזרה לדשבורד
            </Button>
          </div>
        </div>

        <div className="mb-6">
          <PushNotificationSetup />
        </div>

        <NotificationsList />
      </div>
    </div>
  );
};

export default Notifications;
