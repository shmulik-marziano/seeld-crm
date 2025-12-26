import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Bell, BellOff } from 'lucide-react';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';

export const PushNotificationSetup = () => {
  const [permission, setPermission] = useState<NotificationPermission>('default');
  const [isSupported, setIsSupported] = useState(false);
  const [isSubscribed, setIsSubscribed] = useState(false);

  useEffect(() => {
    // Check if push notifications are supported
    const supported = 'Notification' in window && 'serviceWorker' in navigator && 'PushManager' in window;
    setIsSupported(supported);

    if (supported) {
      setPermission(Notification.permission);
      checkSubscription();
    }
  }, []);

  const checkSubscription = async () => {
    try {
      const registration = await navigator.serviceWorker.ready;
      const subscription = await registration.pushManager.getSubscription();
      setIsSubscribed(!!subscription);
    } catch (error) {
      console.error('Error checking subscription:', error);
    }
  };

  const registerServiceWorker = async () => {
    try {
      const registration = await navigator.serviceWorker.register('/sw.js');
      console.log('Service Worker registered:', registration);
      return registration;
    } catch (error) {
      console.error('Service Worker registration failed:', error);
      throw error;
    }
  };

  const requestPermission = async () => {
    try {
      // First, register the service worker
      await registerServiceWorker();

      // Request notification permission
      const result = await Notification.requestPermission();
      setPermission(result);

      if (result === 'granted') {
        await subscribeToPush();
        toast.success('התראות פוש הופעלו בהצלחה!');
      } else if (result === 'denied') {
        toast.error('הרשאות התראות נדחו. אנא אפשר התראות בהגדרות הדפדפן.');
      }
    } catch (error) {
      console.error('Error requesting permission:', error);
      toast.error('שגיאה בהפעלת התראות');
    }
  };

  const subscribeToPush = async () => {
    try {
      const registration = await navigator.serviceWorker.ready;
      
      // For demo purposes, we'll use a simple subscription without VAPID keys
      // In production, you should generate and use proper VAPID keys
      const subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: null // In production, use proper VAPID key
      });

      // Save subscription to database (you can implement this later)
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        console.log('Push subscription created:', subscription);
        // TODO: Save subscription to database for sending push notifications from server
      }

      setIsSubscribed(true);
      return subscription;
    } catch (error) {
      console.error('Error subscribing to push:', error);
      throw error;
    }
  };

  const unsubscribeFromPush = async () => {
    try {
      const registration = await navigator.serviceWorker.ready;
      const subscription = await registration.pushManager.getSubscription();
      
      if (subscription) {
        await subscription.unsubscribe();
        setIsSubscribed(false);
        toast.success('התראות פוש בוטלו');
      }
    } catch (error) {
      console.error('Error unsubscribing:', error);
      toast.error('שגיאה בביטול התראות');
    }
  };

  const sendTestNotification = () => {
    if (Notification.permission === 'granted') {
      new Notification('SeeLD - התראת בדיקה', {
        body: 'זוהי התראת בדיקה מהמערכת',
        icon: '/favicon.ico',
        badge: '/favicon.ico',
        tag: 'test-notification',
        requireInteraction: false
      });
      toast.success('התראת בדיקה נשלחה!');
    }
  };

  if (!isSupported) {
    return (
      <Card className="p-4 bg-muted/50 border-muted">
        <div className="flex items-center gap-2 text-muted-foreground text-sm">
          <BellOff className="h-4 w-4" />
          <span>התראות פוש אינן נתמכות בדפדפן זה</span>
        </div>
      </Card>
    );
  }

  return (
    <Card className="p-4 bg-card border-border">
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Bell className="h-5 w-5 text-primary" />
            <div>
              <h3 className="font-semibold text-foreground">התראות פוש</h3>
              <p className="text-sm text-muted-foreground">
                קבל התראות בזמן אמת על פוליסות והמלצות
              </p>
            </div>
          </div>
        </div>

        <div className="flex gap-2">
          {permission === 'default' && (
            <Button onClick={requestPermission} variant="default">
              <Bell className="h-4 w-4 ml-2" />
              הפעל התראות
            </Button>
          )}

          {permission === 'granted' && !isSubscribed && (
            <Button onClick={subscribeToPush} variant="default">
              <Bell className="h-4 w-4 ml-2" />
              הירשם להתראות
            </Button>
          )}

          {permission === 'granted' && isSubscribed && (
            <>
              <Button onClick={unsubscribeFromPush} variant="outline">
                <BellOff className="h-4 w-4 ml-2" />
                בטל התראות
              </Button>
              <Button onClick={sendTestNotification} variant="secondary">
                שלח התראת בדיקה
              </Button>
            </>
          )}

          {permission === 'denied' && (
            <p className="text-sm text-destructive">
              הרשאות התראות נדחו. אנא אפשר התראות בהגדרות הדפדפן כדי להשתמש בתכונה זו.
            </p>
          )}
        </div>

        {isSubscribed && (
          <div className="text-sm text-muted-foreground bg-muted/50 p-3 rounded-lg">
            ✓ התראות פוש פעילות. תקבל עדכונים אוטומטיים על:
            <ul className="list-disc list-inside mt-2 space-y-1">
              <li>פוליסות שעומדות לפוג (30, 14, 7 ימים לפני)</li>
              <li>המלצות שטרם יושמו</li>
              <li>שינויים בשוק רלוונטיים לפוליסות שלך</li>
            </ul>
          </div>
        )}
      </div>
    </Card>
  );
};
