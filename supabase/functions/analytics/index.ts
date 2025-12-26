import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.81.0";

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
    const lovableApiKey = Deno.env.get('LOVABLE_API_KEY')!;

    const authHeader = req.headers.get('Authorization')!;
    const token = authHeader.replace('Bearer ', '');
    
    const supabase = createClient(supabaseUrl, supabaseKey, {
      global: { headers: { Authorization: authHeader } }
    });

    // Get user from token
    const { data: { user }, error: userError } = await supabase.auth.getUser(token);
    if (userError || !user) {
      throw new Error('Unauthorized');
    }

    // Fetch user's policies
    const { data: policies, error: policiesError } = await supabase
      .from('policies')
      .select('*')
      .eq('user_id', user.id)
      .order('start_date', { ascending: true });

    if (policiesError) throw policiesError;

    if (!policies || policies.length === 0) {
      return new Response(JSON.stringify({ 
        error: 'No policies found',
        analytics: null 
      }), {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Calculate basic analytics
    const totalPremium = policies.reduce((sum, p) => sum + Number(p.premium), 0);
    const totalCoverage = policies.reduce((sum, p) => sum + Number(p.coverage_amount), 0);
    const avgPremium = totalPremium / policies.length;
    
    // Provider comparison
    const providerStats = policies.reduce((acc, policy) => {
      if (!acc[policy.provider]) {
        acc[policy.provider] = { 
          count: 0, 
          totalPremium: 0, 
          totalCoverage: 0,
          avgPremium: 0,
          avgCoverage: 0
        };
      }
      acc[policy.provider].count += 1;
      acc[policy.provider].totalPremium += Number(policy.premium);
      acc[policy.provider].totalCoverage += Number(policy.coverage_amount);
      return acc;
    }, {} as Record<string, any>);

    // Calculate averages for providers
    Object.keys(providerStats).forEach(provider => {
      providerStats[provider].avgPremium = providerStats[provider].totalPremium / providerStats[provider].count;
      providerStats[provider].avgCoverage = providerStats[provider].totalCoverage / providerStats[provider].count;
    });

    // Fetch user profile for demographic data
    const { data: profile } = await supabase
      .from('profiles')
      .select('date_of_birth')
      .eq('user_id', user.id)
      .single();

    // Calculate age from date_of_birth
    let userAge = 35; // default
    if (profile?.date_of_birth) {
      const birthDate = new Date(profile.date_of_birth);
      const today = new Date();
      userAge = today.getFullYear() - birthDate.getFullYear();
    }

    // Market benchmarks with demographic segmentation
    const getMarketBenchmarkByAge = (age: number) => {
      if (age < 30) return { avgPremium: 800, avgCoverage: 500000, avgPolicies: 2.5 };
      if (age < 40) return { avgPremium: 1200, avgCoverage: 800000, avgPolicies: 3.5 };
      if (age < 50) return { avgPremium: 1500, avgCoverage: 1200000, avgPolicies: 4.2 };
      return { avgPremium: 1800, avgCoverage: 1500000, avgPolicies: 4.8 };
    };

    const demographicBenchmark = getMarketBenchmarkByAge(userAge);
    
    const marketBenchmarks = {
      avgPremiumMarket: demographicBenchmark.avgPremium,
      avgCoverageMarket: demographicBenchmark.avgCoverage,
      avgPoliciesPerPerson: demographicBenchmark.avgPolicies,
      industryGrowthRate: 0.08,
      userAge,
      ageGroup: userAge < 30 ? 'צעיר' : userAge < 40 ? 'בוגר' : userAge < 50 ? 'בוגר מבוסס' : 'בוגר בכיר'
    };

    // Calculate KPIs with performance score
    const premiumDiff = ((avgPremium - marketBenchmarks.avgPremiumMarket) / marketBenchmarks.avgPremiumMarket * 100);
    const coverageDiff = ((totalCoverage / policies.length - marketBenchmarks.avgCoverageMarket) / marketBenchmarks.avgCoverageMarket * 100);
    const policiesDiff = ((policies.length - marketBenchmarks.avgPoliciesPerPerson) / marketBenchmarks.avgPoliciesPerPerson * 100);
    
    // Performance score calculation (0-100)
    // Lower premium is better (up to 40 points)
    const premiumScore = Math.max(0, Math.min(40, 40 - (premiumDiff * 0.5)));
    // Higher coverage is better (up to 40 points)
    const coverageScore = Math.max(0, Math.min(40, 40 + (coverageDiff * 0.3)));
    // Optimal policies around market average (up to 20 points)
    const policyScore = Math.max(0, 20 - Math.abs(policiesDiff * 0.3));
    
    const performanceScore = Math.round(premiumScore + coverageScore + policyScore);
    
    // Performance rating
    let rating = 'משביע רצון';
    if (performanceScore >= 85) rating = 'מצוין';
    else if (performanceScore >= 70) rating = 'טוב מאוד';
    else if (performanceScore >= 55) rating = 'טוב';
    else if (performanceScore < 40) rating = 'דורש שיפור';
    
    const kpis = {
      totalPolicies: policies.length,
      totalPremium,
      totalCoverage,
      avgPremium,
      premiumVsMarket: premiumDiff.toFixed(1),
      coverageVsMarket: coverageDiff.toFixed(1),
      policiesVsMarket: policiesDiff.toFixed(1),
      roi: ((totalCoverage / totalPremium) * 100).toFixed(0),
      performanceScore,
      performanceRating: rating,
      premiumScore: Math.round(premiumScore),
      coverageScore: Math.round(coverageScore),
      policyScore: Math.round(policyScore)
    };

    // Prepare data for AI analysis
    const policySummary = policies.map(p => ({
      type: p.type,
      provider: p.provider,
      premium: p.premium,
      coverage: p.coverage_amount,
      status: p.status,
      startDate: p.start_date,
      endDate: p.end_date
    }));

    // Call Lovable AI for predictions and insights
    const aiPrompt = `נתח את תיק הביטוחים הבא וספק תחזיות ותובנות עם דגש על השוואה לבנצ'מרק שוק:

נתונים דמוגרפיים:
- גיל: ${userAge}
- קבוצת גיל: ${marketBenchmarks.ageGroup}

נתוני התיק:
- סך פרמיות: ₪${totalPremium.toLocaleString()}
- סך כיסוי: ₪${totalCoverage.toLocaleString()}
- מספר פוליסות: ${policies.length}
- ספקים: ${Object.keys(providerStats).join(', ')}
- ציון ביצועים: ${performanceScore}/100 (${rating})

פוליסות: ${JSON.stringify(policySummary, null, 2)}

בנצ'מרק שוק לקבוצת גיל ${marketBenchmarks.ageGroup}:
- פרמיה ממוצעת: ₪${marketBenchmarks.avgPremiumMarket.toLocaleString()}
- כיסוי ממוצע: ₪${marketBenchmarks.avgCoverageMarket.toLocaleString()}
- פוליסות ממוצע: ${marketBenchmarks.avgPoliciesPerPerson}
- קצב צמיחה: ${marketBenchmarks.industryGrowthRate * 100}%

ניקוד ביצועים:
- ציון פרמיה: ${kpis.premiumScore}/40
- ציון כיסוי: ${kpis.coverageScore}/40
- ציון מספר פוליסות: ${kpis.policyScore}/20

בבקשה ספק:
1. תחזית פרמיות ל-12 החודשים הבאים (מספרים בלבד, חודש אחר חודש)
2. המלצות לאופטימיזציה מבוססות בנצ'מרק (2-3 משפטים, התייחס לפערים מול השוק)
3. תובנות על השוואת ספקים (2-3 משפטים)
4. הערכת סיכונים וחוזקות בתיק (2-3 משפטים, התייחס לציון הביצועים)
5. המלצות ספציפיות לשיפור הציון (2-3 משפטים)

פורמט התשובה בJSON:
{
  "predictions": [number, number, ...], // 12 מספרים
  "optimization": "string",
  "providerInsights": "string",
  "riskAssessment": "string",
  "scoreImprovementTips": "string"
}`;

    const aiResponse = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${lovableApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash',
        messages: [
          { role: 'system', content: 'אתה יועץ פיננסי מומחה המתמחה בניתוח תיקי ביטוח. תן תשובות בעברית בפורמט JSON בלבד.' },
          { role: 'user', content: aiPrompt }
        ],
        response_format: { type: "json_object" }
      }),
    });

    if (!aiResponse.ok) {
      console.error('AI Error:', await aiResponse.text());
      throw new Error('AI analysis failed');
    }

    const aiData = await aiResponse.json();
    const aiInsights = JSON.parse(aiData.choices[0].message.content);

    // Return complete analytics
    const analytics = {
      kpis,
      providerStats,
      marketBenchmarks,
      aiInsights,
      trends: {
        historical: policies.map(p => ({
          date: p.start_date,
          premium: Number(p.premium),
          coverage: Number(p.coverage_amount)
        })),
        predictions: aiInsights.predictions || []
      }
    };

    return new Response(JSON.stringify({ analytics }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Analytics error:', error);
    return new Response(JSON.stringify({ 
      error: error instanceof Error ? error.message : 'Unknown error' 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});