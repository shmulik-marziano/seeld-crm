import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    if (!LOVABLE_API_KEY) {
      throw new Error('LOVABLE_API_KEY not configured');
    }

    // Fetch all active policies with user information
    const { data: policies, error: policiesError } = await supabaseClient
      .from('policies')
      .select('*, profiles!inner(user_id, full_name)')
      .eq('status', 'active');

    if (policiesError) throw policiesError;

    console.log(`Processing ${policies?.length || 0} policies for notifications`);

    const notifications: any[] = [];
    const today = new Date();

    for (const policy of policies || []) {
      const userId = policy.profiles.user_id;
      const policyEndDate = policy.end_date ? new Date(policy.end_date) : null;
      
      // Check for expiring policies (within 30 days)
      if (policyEndDate) {
        const daysUntilExpiry = Math.floor((policyEndDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
        
        if (daysUntilExpiry > 0 && daysUntilExpiry <= 30) {
          // Check if notification already exists
          const { data: existingNotif } = await supabaseClient
            .from('notifications')
            .select('id')
            .eq('user_id', userId)
            .eq('policy_id', policy.id)
            .eq('type', 'policy_expiring')
            .gte('created_at', new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString())
            .maybeSingle();

          if (!existingNotif) {
            notifications.push({
              user_id: userId,
              policy_id: policy.id,
              type: 'policy_expiring',
              priority: daysUntilExpiry <= 7 ? 'urgent' : daysUntilExpiry <= 14 ? 'high' : 'medium',
              title: `פוליסה ${policy.policy_number} עומדת לפוג`,
              message: `הפוליסה של ${policy.provider} תפוג בעוד ${daysUntilExpiry} ימים. מומלץ לחדש אותה בהקדם.`,
              action_url: '/client/policies',
              metadata: { days_until_expiry: daysUntilExpiry }
            });
          }
        }
      }

      // Check for high premiums (above 2000 NIS monthly)
      if (policy.premium > 2000) {
        const { data: existingNotif } = await supabaseClient
          .from('notifications')
          .select('id')
          .eq('user_id', userId)
          .eq('policy_id', policy.id)
          .eq('type', 'high_premium')
          .gte('created_at', new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString())
          .maybeSingle();

        if (!existingNotif) {
          // Use AI to analyze and suggest savings
          const aiAnalysis = await analyzeWithAI(policy);
          
          notifications.push({
            user_id: userId,
            policy_id: policy.id,
            type: 'high_premium',
            priority: 'medium',
            title: 'פרמיה גבוהה זוהתה',
            message: `הפוליסה ${policy.policy_number} בעלת פרמיה גבוהה (₪${policy.premium.toLocaleString()}). ${aiAnalysis}`,
            action_url: '/client/policies',
            metadata: { premium: policy.premium, ai_suggestion: aiAnalysis }
          });
        }
      }
    }

    // Get user-specific savings opportunities using AI
    const userGroups = policies?.reduce((acc: any, policy) => {
      const userId = policy.profiles.user_id;
      if (!acc[userId]) acc[userId] = [];
      acc[userId].push(policy);
      return acc;
    }, {});

    for (const [userId, userPolicies] of Object.entries(userGroups || {})) {
      // Check if user has savings opportunity notification in last 30 days
      const { data: existingNotif } = await supabaseClient
        .from('notifications')
        .select('id')
        .eq('user_id', userId)
        .eq('type', 'savings_opportunity')
        .gte('created_at', new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString())
        .maybeSingle();

      if (!existingNotif && Array.isArray(userPolicies) && userPolicies.length > 2) {
        const savingsSuggestion = await generateSavingsSuggestion(userPolicies as any[]);
        
        notifications.push({
          user_id: userId,
          type: 'savings_opportunity',
          priority: 'low',
          title: 'הזדמנות לחיסכון',
          message: savingsSuggestion,
          action_url: '/client/policies',
          metadata: { total_policies: userPolicies.length }
        });
      }
    }

    // Insert all notifications
    if (notifications.length > 0) {
      const { error: insertError } = await supabaseClient
        .from('notifications')
        .insert(notifications);

      if (insertError) throw insertError;
    }

    console.log(`Created ${notifications.length} notifications`);

    return new Response(
      JSON.stringify({ 
        success: true, 
        notifications_created: notifications.length,
        policies_processed: policies?.length || 0
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200 
      }
    );
  } catch (error: any) {
    console.error('Error generating notifications:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500 
      }
    );
  }
});

async function analyzeWithAI(policy: any): Promise<string> {
  const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
  
  try {
    const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${LOVABLE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash',
        messages: [
          {
            role: 'system',
            content: 'אתה יועץ פיננסי מקצועי. ספק המלצות קצרות ומדויקות לחיסכון בפוליסות ביטוח בעברית.'
          },
          {
            role: 'user',
            content: `נתח פוליסה זו והציע דרך אחת לחיסכון (עד 30 מילים): ספק ${policy.provider}, סוג ${policy.type}, פרמיה חודשית ₪${policy.premium}, כיסוי ₪${policy.coverage_amount}`
          }
        ],
        max_tokens: 100
      }),
    });

    if (!response.ok) {
      console.error('AI analysis failed:', response.status);
      return 'מומלץ להשוות מחירים עם ספקים נוספים.';
    }

    const data = await response.json();
    return data.choices?.[0]?.message?.content || 'מומלץ להשוות מחירים עם ספקים נוספים.';
  } catch (error) {
    console.error('AI analysis error:', error);
    return 'מומלץ להשוות מחירים עם ספקים נוספים.';
  }
}

async function generateSavingsSuggestion(policies: any[]): Promise<string> {
  const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
  const totalPremium = policies.reduce((sum, p) => sum + Number(p.premium), 0);
  
  try {
    const policySummary = policies.map(p => 
      `${p.type} - ${p.provider} (₪${p.premium})`
    ).join(', ');

    const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${LOVABLE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash',
        messages: [
          {
            role: 'system',
            content: 'אתה יועץ פיננסי מומחה. ספק המלצת חיסכון ספציפית ומעשית לתיק פוליסות בעברית.'
          },
          {
            role: 'user',
            content: `נתח תיק פוליסות זה והציע הזדמנות חיסכון אחת ספציפית (עד 40 מילים): ${policySummary}. סה"כ פרמיה חודשית: ₪${totalPremium.toLocaleString()}`
          }
        ],
        max_tokens: 120
      }),
    });

    if (!response.ok) {
      return `עם ${policies.length} פוליסות בסה"כ ₪${totalPremium.toLocaleString()}, מומלץ לבדוק אפשרויות לאיחוד פוליסות וקבלת הנחות.`;
    }

    const data = await response.json();
    return data.choices?.[0]?.message?.content || 
      `עם ${policies.length} פוליסות בסה"כ ₪${totalPremium.toLocaleString()}, מומלץ לבדוק אפשרויות לאיחוד פוליסות וקבלת הנחות.`;
  } catch (error) {
    console.error('Savings suggestion error:', error);
    return `עם ${policies.length} פוליסות בסה"כ ₪${totalPremium.toLocaleString()}, מומלץ לבדוק אפשרויות לאיחוד פוליסות וקבלת הנחות.`;
  }
}
