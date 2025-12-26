import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";

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
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      {
        global: {
          headers: { Authorization: req.headers.get('Authorization')! },
        },
      }
    );

    const { data: { user } } = await supabaseClient.auth.getUser();
    if (!user) {
      throw new Error('Unauthorized');
    }

    // Get user's profile to determine age
    const { data: profile } = await supabaseClient
      .from('profiles')
      .select('date_of_birth')
      .eq('user_id', user.id)
      .single();

    let userAge = 35; // Default
    if (profile?.date_of_birth) {
      const birthDate = new Date(profile.date_of_birth);
      const today = new Date();
      userAge = today.getFullYear() - birthDate.getFullYear();
    }

    // Determine age group (±5 years)
    const minAge = userAge - 5;
    const maxAge = userAge + 5;

    // Get all users in similar age group with their latest performance scores
    const { data: profiles } = await supabaseClient
      .from('profiles')
      .select('user_id, date_of_birth')
      .not('date_of_birth', 'is', null);

    const similarAgeUsers = (profiles || []).filter(p => {
      if (!p.date_of_birth) return false;
      const birthDate = new Date(p.date_of_birth);
      const age = new Date().getFullYear() - birthDate.getFullYear();
      return age >= minAge && age <= maxAge;
    }).map(p => p.user_id);

    if (similarAgeUsers.length < 5) {
      // Not enough data, use all users
      const { data: allPerf } = await supabaseClient
        .from('performance_history')
        .select('user_id, performance_score, created_at')
        .order('created_at', { ascending: false });

      const latestScores = new Map<string, number>();
      (allPerf || []).forEach(record => {
        if (!latestScores.has(record.user_id)) {
          latestScores.set(record.user_id, record.performance_score);
        }
      });

      const scores = Array.from(latestScores.values());
      return generateBenchmarkResponse(user.id, scores, supabaseClient);
    }

    // Get latest performance scores for similar age users
    const { data: perfHistory } = await supabaseClient
      .from('performance_history')
      .select('user_id, performance_score, created_at')
      .in('user_id', similarAgeUsers)
      .order('created_at', { ascending: false });

    // Get latest score per user
    const latestScores = new Map<string, number>();
    (perfHistory || []).forEach(record => {
      if (!latestScores.has(record.user_id)) {
        latestScores.set(record.user_id, record.performance_score);
      }
    });

    const scores = Array.from(latestScores.values());
    return generateBenchmarkResponse(user.id, scores, supabaseClient);

  } catch (error) {
    console.error('Error in social-benchmark function:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});

async function generateBenchmarkResponse(userId: string, scores: number[], supabaseClient: any) {
  const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  };

  // Get user's latest score
  const { data: userHistory } = await supabaseClient
    .from('performance_history')
    .select('performance_score')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .limit(1)
    .single();

  const userScore = userHistory?.performance_score || 50;

  // Calculate distribution (histogram bins)
  const bins = [
    { range: '0-20', min: 0, max: 20, count: 0 },
    { range: '21-40', min: 21, max: 40, count: 0 },
    { range: '41-60', min: 41, max: 60, count: 0 },
    { range: '61-80', min: 61, max: 80, count: 0 },
    { range: '81-100', min: 81, max: 100, count: 0 },
  ];

  scores.forEach(score => {
    const bin = bins.find(b => score >= b.min && score <= b.max);
    if (bin) bin.count++;
  });

  // Calculate percentile
  const sortedScores = [...scores].sort((a, b) => a - b);
  const userRank = sortedScores.filter(s => s < userScore).length;
  const percentile = Math.round((userRank / sortedScores.length) * 100);

  // Calculate statistics
  const avgScore = scores.reduce((sum, s) => sum + s, 0) / scores.length;
  const medianScore = sortedScores[Math.floor(sortedScores.length / 2)];
  const maxScore = Math.max(...scores);
  const minScore = Math.min(...scores);

  // Generate AI tips using Lovable AI
  const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
  
  let aiTips = 'המשך לעקוב אחר התיק שלך ולבצע את ההמלצות.';
  
  if (LOVABLE_API_KEY) {
    try {
      const aiPrompt = `אתה יועץ פיננסי מומחה. משתמש בציון ${userScore} מול קבוצת גיל דומה שממוצעה ${avgScore.toFixed(1)}. הוא באחוזון ${percentile}.
      
ספק 3-4 טיפים קונקרטיים ומעשיים בעברית לשיפור הדירוג (לא יותר מ-150 מילים). התמקד בפעולות ספציפיות, לא buzzwords.`;

      const aiResponse = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${LOVABLE_API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'google/gemini-2.5-flash',
          messages: [
            { role: 'system', content: 'אתה יועץ פיננסי ישראלי מומחה. תן טיפים קצרים וישירים בעברית.' },
            { role: 'user', content: aiPrompt }
          ],
        }),
      });

      if (aiResponse.ok) {
        const aiData = await aiResponse.json();
        aiTips = aiData.choices[0]?.message?.content || aiTips;
      }
    } catch (aiError) {
      console.error('AI tips generation failed:', aiError);
    }
  }

  return new Response(
    JSON.stringify({
      userScore,
      percentile,
      distribution: bins,
      statistics: {
        average: Math.round(avgScore),
        median: Math.round(medianScore),
        max: maxScore,
        min: minScore,
        totalUsers: scores.length,
      },
      aiTips,
      comparison: {
        vsAverage: userScore - avgScore,
        vsMedian: userScore - medianScore,
      }
    }),
    { 
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200 
    }
  );
}
