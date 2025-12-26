import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.81.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface Policy {
  id: string;
  user_id: string;
  policy_number: string;
  type: string;
  provider: string;
  end_date: string;
}

interface RecommendationTracking {
  id: string;
  user_id: string;
  recommendation_title: string;
  status: string;
  created_at: string;
}

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    console.log('Starting scheduled reminders check...');

    const now = new Date();
    const thirtyDaysFromNow = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);
    const fourteenDaysFromNow = new Date(now.getTime() + 14 * 24 * 60 * 60 * 1000);
    const sevenDaysFromNow = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);

    // Check for expiring policies
    const { data: policies, error: policiesError } = await supabase
      .from('policies')
      .select('*')
      .eq('status', 'active')
      .not('end_date', 'is', null)
      .lte('end_date', thirtyDaysFromNow.toISOString().split('T')[0])
      .gte('end_date', now.toISOString().split('T')[0]);

    if (policiesError) {
      console.error('Error fetching policies:', policiesError);
      throw policiesError;
    }

    console.log(`Found ${policies?.length || 0} expiring policies`);

    // Create reminders for expiring policies
    const notifications = [];
    
    for (const policy of policies || []) {
      const endDate = new Date(policy.end_date);
      const daysUntilExpiry = Math.ceil((endDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));

      // Check if we should send a reminder (30, 14, or 7 days)
      if (daysUntilExpiry === 30 || daysUntilExpiry === 14 || daysUntilExpiry === 7) {
        // Check if we already sent this reminder today
        const { data: existingNotifications } = await supabase
          .from('notifications')
          .select('id')
          .eq('user_id', policy.user_id)
          .eq('policy_id', policy.id)
          .eq('type', 'policy_expiring')
          .gte('created_at', now.toISOString().split('T')[0]);

        if (!existingNotifications || existingNotifications.length === 0) {
          let priority: 'low' | 'medium' | 'high' | 'urgent' = 'medium';
          if (daysUntilExpiry <= 7) priority = 'urgent';
          else if (daysUntilExpiry <= 14) priority = 'high';

          notifications.push({
            user_id: policy.user_id,
            policy_id: policy.id,
            type: 'policy_expiring',
            priority,
            title: `פוליסה תפוג בעוד ${daysUntilExpiry} ימים`,
            message: `הפוליסה ${policy.policy_number} (${policy.type}) אצל ${policy.provider} תפוג ב-${new Date(policy.end_date).toLocaleDateString('he-IL')}. מומלץ לחדש או להחליף אותה בהקדם.`,
            action_url: '/client/policies',
            metadata: {
              days_until_expiry: daysUntilExpiry,
              policy_type: policy.type,
              provider: policy.provider
            }
          });

          console.log(`Created expiry reminder for policy ${policy.policy_number}, ${daysUntilExpiry} days until expiry`);
        }
      }
    }

    // Check for pending recommendations (not implemented after 7 days)
    const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    
    const { data: pendingRecommendations, error: recsError } = await supabase
      .from('recommendation_tracking')
      .select('*')
      .eq('status', 'pending')
      .lte('created_at', sevenDaysAgo.toISOString());

    if (recsError) {
      console.error('Error fetching recommendations:', recsError);
    } else {
      console.log(`Found ${pendingRecommendations?.length || 0} pending recommendations`);

      for (const rec of pendingRecommendations || []) {
        // Check if we already sent this reminder today
        const { data: existingNotifications } = await supabase
          .from('notifications')
          .select('id')
          .eq('user_id', rec.user_id)
          .eq('type', 'recommendation_reminder')
          .gte('created_at', now.toISOString().split('T')[0])
          .contains('metadata', { recommendation_id: rec.recommendation_id });

        if (!existingNotifications || existingNotifications.length === 0) {
          const daysWaiting = Math.floor((now.getTime() - new Date(rec.created_at).getTime()) / (1000 * 60 * 60 * 24));
          
          notifications.push({
            user_id: rec.user_id,
            type: 'recommendation_reminder',
            priority: daysWaiting > 14 ? 'high' : 'medium',
            title: 'תזכורת ליישום המלצה',
            message: `ההמלצה "${rec.recommendation_title}" ממתינה ליישום כבר ${daysWaiting} ימים. חיסכון צפוי: ₪${rec.predicted_savings}. האם תרצה ליישם אותה?`,
            action_url: '/client/recommendations',
            metadata: {
              recommendation_id: rec.recommendation_id,
              days_waiting: daysWaiting,
              predicted_savings: rec.predicted_savings
            }
          });

          console.log(`Created reminder for pending recommendation: ${rec.recommendation_title}`);
        }
      }
    }

    // Insert all notifications
    if (notifications.length > 0) {
      const { error: insertError } = await supabase
        .from('notifications')
        .insert(notifications);

      if (insertError) {
        console.error('Error inserting notifications:', insertError);
        throw insertError;
      }

      console.log(`Successfully created ${notifications.length} scheduled reminders`);
    } else {
      console.log('No new reminders needed');
    }

    return new Response(
      JSON.stringify({
        success: true,
        reminders_created: notifications.length,
        message: `Created ${notifications.length} scheduled reminders`
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    );

  } catch (error) {
    console.error('Error in scheduled-reminders function:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return new Response(
      JSON.stringify({ error: errorMessage }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      }
    );
  }
});
