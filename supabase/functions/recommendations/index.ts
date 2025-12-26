import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.81.0";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface Recommendation {
  id: string;
  type: 'duplicate' | 'consolidation' | 'savings' | 'coverage_gap' | 'optimization';
  priority: 'high' | 'medium' | 'low';
  title: string;
  description: string;
  policies: string[];
  potentialSavings?: number;
  actionItems: string[];
  reasoning: string;
}

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

    // Fetch all user's policies
    const { data: policies, error: policiesError } = await supabase
      .from('policies')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });

    if (policiesError) throw policiesError;

    if (!policies || policies.length === 0) {
      return new Response(JSON.stringify({ 
        recommendations: [],
        message: 'אין פוליסות לניתוח'
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Calculate basic stats for context
    const totalPremium = policies.reduce((sum, p) => sum + Number(p.premium), 0);
    const totalCoverage = policies.reduce((sum, p) => sum + Number(p.coverage_amount), 0);
    
    // Group by type and provider
    const byType = policies.reduce((acc, p) => {
      acc[p.type] = acc[p.type] || [];
      acc[p.type].push(p);
      return acc;
    }, {} as Record<string, any[]>);

    const byProvider = policies.reduce((acc, p) => {
      acc[p.provider] = acc[p.provider] || [];
      acc[p.provider].push(p);
      return acc;
    }, {} as Record<string, any[]>);

    // Prepare detailed policy summary for AI
    const policyDetails = policies.map(p => ({
      id: p.id,
      type: p.type,
      provider: p.provider,
      policyNumber: p.policy_number,
      premium: Number(p.premium),
      coverage: Number(p.coverage_amount),
      status: p.status,
      startDate: p.start_date,
      endDate: p.end_date
    }));

    // Call Lovable AI for intelligent analysis
    const aiPrompt = `אתה יועץ פיננסי מומחה המתמחה בניתוח תיקי ביטוח וזיהוי הזדמנויות לחיסכון ואופטימיזציה.

נתח את תיק הביטוחים הבא וזהה:
1. כפילויות בכיסוי (פוליסות דומות או חופפות)
2. הזדמנויות לאיחוד פוליסות עם אותו ספק
3. פוליסות יקרות מדי יחסית לכיסוי
4. חוסרי כיסוי משמעותיים
5. הזדמנויות לאופטימיזציה

**סטטיסטיקות כלליות:**
- סך פרמיות: ₪${totalPremium.toLocaleString()}
- סך כיסוי: ₪${totalCoverage.toLocaleString()}
- מספר פוליסות: ${policies.length}

**פוליסות לפי סוג:**
${Object.entries(byType).map(([type, pols]) => 
  `- ${type}: ${(pols as any[]).length} פוליסות, סך פרמיה: ₪${(pols as any[]).reduce((s: number, p: any) => s + Number(p.premium), 0).toLocaleString()}`
).join('\n')}

**פוליסות לפי ספק:**
${Object.entries(byProvider).map(([provider, pols]) => 
  `- ${provider}: ${(pols as any[]).length} פוליסות, סך פרמיה: ₪${(pols as any[]).reduce((s: number, p: any) => s + Number(p.premium), 0).toLocaleString()}`
).join('\n')}

**פרטי כל פוליסה:**
${JSON.stringify(policyDetails, null, 2)}

**ממוצעי שוק (להשוואה):**
- ביטוח חיים: ₪400-800/חודש
- ביטוח בריאות: ₪300-600/חודש
- פנסיה: ₪800-1500/חודש
- ביטוח אובדן כושר: ₪200-400/חודש
- ביטוח דירה: ₪100-300/חודש

בצע ניתוח מעמיק והחזר JSON עם המלצות מפורטות:

{
  "recommendations": [
    {
      "id": "unique_id",
      "type": "duplicate|consolidation|savings|coverage_gap|optimization",
      "priority": "high|medium|low",
      "title": "כותרת קצרה",
      "description": "תיאור מפורט של הבעיה או ההזדמנות",
      "policies": ["policy_id1", "policy_id2"],
      "potentialSavings": 0,
      "actionItems": ["פעולה 1", "פעולה 2"],
      "reasoning": "הסבר מדוע זו המלצה חשובה"
    }
  ],
  "summary": {
    "totalSavingsPotential": 0,
    "criticalIssues": 0,
    "optimizationOpportunities": 0,
    "overallScore": 0-100
  }
}

**חשוב:** 
- חשב חיסכון פוטנציאלי רק אם אתה בטוח במספרים
- תן עדיפות גבוהה רק לבעיות קריטיות או חיסכון משמעותי
- היה ספציפי ומעשי בפעולות המומלצות
- כל המחירים בשקלים
- זהה בעיות ממשיות, לא המלצות גנריות`;

    console.log('Calling Lovable AI for recommendations...');

    const aiResponse = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${lovableApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash',
        messages: [
          { 
            role: 'system', 
            content: 'אתה יועץ פיננסי מומחה. תן תשובות בעברית בפורמט JSON בלבד, עם ניתוח מעמיק ומספרים מדויקים.' 
          },
          { role: 'user', content: aiPrompt }
        ],
        response_format: { type: "json_object" }
      }),
    });

    if (!aiResponse.ok) {
      const errorText = await aiResponse.text();
      console.error('AI Error:', aiResponse.status, errorText);
      throw new Error(`AI analysis failed: ${errorText}`);
    }

    const aiData = await aiResponse.json();
    console.log('AI Response received');

    const analysis = JSON.parse(aiData.choices[0].message.content);

    // Add policy numbers to recommendations for easier identification
    const enrichedRecommendations = analysis.recommendations.map((rec: Recommendation) => {
      const policyInfo = rec.policies.map(policyId => {
        const policy = policies.find(p => p.id === policyId);
        return policy ? {
          id: policy.id,
          type: policy.type,
          provider: policy.provider,
          policyNumber: policy.policy_number,
          premium: Number(policy.premium)
        } : null;
      }).filter(Boolean);

      return {
        ...rec,
        policyDetails: policyInfo
      };
    });

    return new Response(JSON.stringify({ 
      recommendations: enrichedRecommendations,
      summary: analysis.summary,
      totalPolicies: policies.length,
      analyzedAt: new Date().toISOString()
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Recommendations error:', error);
    return new Response(JSON.stringify({ 
      error: error instanceof Error ? error.message : 'Unknown error',
      recommendations: []
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});