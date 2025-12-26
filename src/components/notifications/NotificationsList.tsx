import { useEffect, useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import NotificationItem from './NotificationItem';
import { Loader2 } from 'lucide-react';

const NotificationsList = () => {
  const [notifications, setNotifications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('all');
  const { toast } = useToast();

  useEffect(() => {
    loadNotifications();
  }, []);

  const loadNotifications = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from('notifications')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setNotifications(data || []);
    } catch (error: any) {
      toast({
        title: 'שגיאה בטעינת התראות',
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const markAsRead = async (id: string) => {
    try {
      const { error } = await supabase
        .from('notifications')
        .update({ is_read: true })
        .eq('id', id);

      if (error) throw error;
      await loadNotifications();
    } catch (error: any) {
      toast({
        title: 'שגיאה',
        description: error.message,
        variant: 'destructive',
      });
    }
  };

  const markAllAsRead = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { error } = await supabase
        .from('notifications')
        .update({ is_read: true })
        .eq('user_id', user.id)
        .eq('is_read', false);

      if (error) throw error;
      
      toast({
        title: 'כל ההתראות סומנו כנקרא',
      });
      
      await loadNotifications();
    } catch (error: any) {
      toast({
        title: 'שגיאה',
        description: error.message,
        variant: 'destructive',
      });
    }
  };

  const filteredNotifications = notifications.filter((notif) => {
    if (activeTab === 'all') return true;
    if (activeTab === 'unread') return !notif.is_read;
    return notif.type === activeTab;
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center p-12">
        <Loader2 className="animate-spin text-primary" size={32} />
      </div>
    );
  }

  return (
    <Card className="p-6 glass-card">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold">התראות</h2>
        {notifications.some(n => !n.is_read) && (
          <Button variant="outline" onClick={markAllAsRead}>
            סמן הכל כנקרא
          </Button>
        )}
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-5 mb-6">
          <TabsTrigger value="all">הכל</TabsTrigger>
          <TabsTrigger value="unread">לא נקרא</TabsTrigger>
          <TabsTrigger value="policy_expiring">פוגות</TabsTrigger>
          <TabsTrigger value="high_premium">פרמיות</TabsTrigger>
          <TabsTrigger value="savings_opportunity">חיסכון</TabsTrigger>
        </TabsList>

        <TabsContent value={activeTab} className="space-y-2">
          {filteredNotifications.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              אין התראות להצגה
            </div>
          ) : (
            filteredNotifications.map((notification) => (
              <NotificationItem
                key={notification.id}
                notification={notification}
                onRead={markAsRead}
                onClose={() => {}}
              />
            ))
          )}
        </TabsContent>
      </Tabs>
    </Card>
  );
};

export default NotificationsList;
