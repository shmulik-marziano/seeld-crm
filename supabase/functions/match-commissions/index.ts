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

    // Get authenticated user from JWT
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(JSON.stringify({ error: 'Authentication required' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);

    if (authError || !user) {
      return new Response(JSON.stringify({ error: 'Invalid authentication' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    const agent_id = user.id;

    console.log('Matching commissions for agent:', agent_id);

    // Get unmatched bank transactions
    const { data: transactions, error: txError } = await supabase
      .from('bank_transactions')
      .select('*')
      .eq('agent_id', agent_id)
      .eq('matched', false);

    if (txError) throw txError;

    // Get pending commissions
    const { data: commissions, error: commError } = await supabase
      .from('commissions')
      .select('*')
      .eq('agent_id', agent_id)
      .eq('status', 'pending');

    if (commError) throw commError;

    console.log(`Found ${transactions?.length || 0} unmatched transactions and ${commissions?.length || 0} pending commissions`);

    let matchedCount = 0;

    // Smart matching algorithm
    if (transactions && commissions) {
      for (const transaction of transactions) {
        for (const commission of commissions) {
          // Match by amount and date proximity (within 7 days)
          const amountMatch = Math.abs(transaction.amount - commission.amount) < 10;
          const dateMatch = isDateClose(transaction.transaction_date, commission.expected_date, 7);

          if (amountMatch && dateMatch) {
            // Update commission
            await supabase
              .from('commissions')
              .update({
                status: 'received',
                received_date: transaction.transaction_date,
                bank_transaction_id: transaction.transaction_id,
                matched_automatically: true
              })
              .eq('id', commission.id);

            // Mark transaction as matched
            await supabase
              .from('bank_transactions')
              .update({ matched: true })
              .eq('id', transaction.id);

            matchedCount++;

            // Create alert
            await supabase
              .from('alerts')
              .insert({
                agent_id,
                type: 'commission',
                title: 'עמלה התקבלה ותואמה',
                message: `עמלה בסך ₪${commission.amount} תואמה אוטומטית`,
                action_url: '/agent/commissions'
              });

            console.log(`Matched commission ${commission.id} with transaction ${transaction.transaction_id}`);
            break;
          }
        }
      }
    }

    return new Response(JSON.stringify({
      success: true,
      matched: matchedCount
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });

  } catch (error) {
    console.error('Error matching commissions:', error);
    return new Response(JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
});

function isDateClose(date1: string, date2: string, days: number): boolean {
  const d1 = new Date(date1);
  const d2 = new Date(date2);
  const diffTime = Math.abs(d2.getTime() - d1.getTime());
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return diffDays <= days;
}
