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

    // Get authenticated user
    const authHeader = req.headers.get('Authorization')!;
    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: userError } = await supabase.auth.getUser(token);

    if (userError || !user) {
      throw new Error('Unauthorized');
    }

    console.log('Syncing bank transactions for agent:', user.id);

    // In production: Call Open Banking API
    // For now, simulate bank transactions
    const mockTransactions = generateMockTransactions();

    // Save transactions to database (for tracking)
    const { data: transactions, error: txError } = await supabase
      .from('bank_transactions')
      .upsert(
        mockTransactions.map(tx => ({
          agent_id: user.id,
          transaction_id: tx.id,
          amount: tx.amount,
          description: tx.description,
          transaction_date: tx.date,
          matched: false
        })),
        { onConflict: 'transaction_id' }
      )
      .select();

    if (txError) throw txError;

    console.log(`Synced ${transactions?.length || 0} transactions`);

    // Trigger automatic matching
    const matchResponse = await fetch(`${supabaseUrl}/functions/v1/match-commissions`, {
      method: 'POST',
      headers: {
        'Authorization': authHeader,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ agent_id: user.id })
    });

    const matchResult = await matchResponse.json();

    return new Response(JSON.stringify({
      success: true,
      synced: transactions?.length || 0,
      matched: matchResult.matched || 0
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });

  } catch (error) {
    console.error('Error syncing transactions:', error);
    return new Response(JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
});

function generateMockTransactions() {
  const companies = ['מגדל', 'הפניקס', 'כלל', 'מנורה', 'הראל'];
  const transactions = [];
  const now = new Date();

  for (let i = 0; i < 10; i++) {
    const date = new Date(now);
    date.setDate(date.getDate() - Math.floor(Math.random() * 30));
    
    transactions.push({
      id: `TRX-${Date.now()}-${i}`,
      amount: Math.floor(Math.random() * 5000) + 500,
      description: `העברה מ${companies[Math.floor(Math.random() * companies.length)]} ביטוח`,
      date: date.toISOString()
    });
  }

  return transactions;
}
