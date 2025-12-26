import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    console.log('Checking for missing commissions...');

    // Get all agents
    const { data: agents, error: agentsError } = await supabase
      .from('user_roles')
      .select('user_id')
      .eq('role', 'agent');

    if (agentsError) throw agentsError;

    let totalAlerts = 0;

    for (const agent of agents || []) {
      // Get pending commissions that are overdue (expected_date passed + 7 days grace period)
      const sevenDaysAgo = new Date();
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

      const { data: overdueCommissions, error: commError } = await supabase
        .from('commissions')
        .select(`
          *,
          clients (full_name),
          policies (policy_number, provider)
        `)
        .eq('agent_id', agent.user_id)
        .eq('status', 'pending')
        .lt('expected_date', sevenDaysAgo.toISOString().split('T')[0]);

      if (commError) {
        console.error(`Error checking commissions for agent ${agent.user_id}:`, commError);
        continue;
      }

      if (overdueCommissions && overdueCommissions.length > 0) {
        console.log(`Found ${overdueCommissions.length} overdue commissions for agent ${agent.user_id}`);

        for (const commission of overdueCommissions) {
          // Check if alert already exists for this commission
          const { data: existingAlert } = await supabase
            .from('alerts')
            .select('id')
            .eq('agent_id', agent.user_id)
            .eq('type', 'commission')
            .contains('message', commission.id)
            .single();

          if (!existingAlert) {
            const clientName = commission.clients?.full_name || 'לקוח לא ידוע';
            const provider = commission.policies?.provider || 'חברת ביטוח לא ידועה';
            const daysOverdue = Math.floor((new Date().getTime() - new Date(commission.expected_date).getTime()) / (1000 * 60 * 60 * 24));

            await supabase
              .from('alerts')
              .insert({
                agent_id: agent.user_id,
                type: 'commission',
                title: '⚠️ עמלה חסרה',
                message: `עמלה בסך ₪${commission.amount} מ${provider} עבור ${clientName} באיחור של ${daysOverdue} ימים (מזהה: ${commission.id})`,
                action_url: `/agent/commissions?highlight=${commission.id}`
              });

            totalAlerts++;
          }
        }
      }
    }

    console.log(`Created ${totalAlerts} alerts for missing commissions`);

    return new Response(JSON.stringify({
      success: true,
      alerts_created: totalAlerts
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });

  } catch (error) {
    console.error('Error checking missing commissions:', error);
    return new Response(JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
});
