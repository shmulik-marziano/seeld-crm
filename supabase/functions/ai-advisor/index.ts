import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.81.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      throw new Error('No authorization header');
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: userError } = await supabase.auth.getUser(token);
    
    if (userError || !user) {
      console.error('Auth error:', userError);
      throw new Error('Unauthorized');
    }

    const { question, conversationHistory } = await req.json();
    console.log('Processing question for user:', user.id);

    // Fetch user's policies
    const { data: policies, error: policiesError } = await supabase
      .from('policies')
      .select('*')
      .eq('user_id', user.id);

    if (policiesError) {
      console.error('Error fetching policies:', policiesError);
      throw policiesError;
    }

    // Fetch performance history
    const { data: performanceHistory, error: historyError } = await supabase
      .from('performance_history')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .limit(10);

    if (historyError) {
      console.error('Error fetching performance history:', historyError);
    }

    // Fetch recommendations tracking
    const { data: recommendations, error: recsError } = await supabase
      .from('recommendation_tracking')
      .select('*')
      .eq('user_id', user.id)
      .order('implemented_at', { ascending: false });

    if (recsError) {
      console.error('Error fetching recommendations:', recsError);
    }

    // Build context for AI
    const policyContext = policies?.length ? `
פוליסות הביטוח של המשתמש:
${policies.map(p => `
- ${p.policy_type}: ${p.provider}, כיסוי: ₪${p.coverage_amount?.toLocaleString()}, פרמיה: ₪${p.premium_amount}/חודש, סטטוס: ${p.status}
  ${p.expire_at ? `תאריך תפוגה: ${new Date(p.expire_at).toLocaleDateString('he-IL')}` : ''}
`).join('\n')}
סה"כ פוליסות: ${policies.length}
סה"כ פרמיות חודשיות: ₪${policies.reduce((sum, p) => sum + (p.premium_amount || 0), 0).toLocaleString()}
` : 'אין פוליסות רשומות כרגע.';

    const historyContext = performanceHistory?.length ? `
היסטוריית ביצועים (10 הרשומות האחרונות):
${performanceHistory.map(h => `
- תאריך: ${new Date(h.created_at).toLocaleDateString('he-IL')}
  ציון כולל: ${h.performance_score}/100
  ציון פרמיות: ${h.premium_score}/100
  ציון כיסוי: ${h.coverage_score}/100
  ציון מאזן פוליסות: ${h.policy_score}/100
`).join('\n')}
` : 'אין היסטוריית ביצועים זמינה.';

    const recommendationsContext = recommendations?.length ? `
המלצות שבוצעו:
${recommendations.map(r => `
- סוג: ${r.recommendation_type}, עדיפות: ${r.priority}
  כותרת: ${r.title}
  חיסכון חזוי: ₪${r.predicted_savings?.toLocaleString()}
  חיסכון בפועל: ₪${r.actual_savings?.toLocaleString()}
  סטטוס: ${r.status}
  ${r.notes ? `הערות: ${r.notes}` : ''}
`).join('\n')}
` : 'אין המלצות שבוצעו.';

    const systemPrompt = `אתה יועץ פיננסי וירטואלי חכם של פלטפורמת SeeLD. תפקידך לענות על שאלות של לקוחים בנוגע לפוליסות הביטוח שלהם, היסטוריית הביצועים, וההמלצות שקיבלו.

**הקונטקסט הפיננסי של הלקוח:**

${policyContext}

${historyContext}

${recommendationsContext}

**ההנחיות שלך:**
1. ענה בעברית בצורה ברורה ומקצועית
2. התבסס על הנתונים האמיתיים של הלקוח שמופיעים למעלה
3. אם נשאלת שאלה על סימולציה של שינוי (למשל "מה יקרה אם אבטל פוליסה X"), חשב את ההשפעה על:
   - סך הפרמיות החודשיות
   - רמת הכיסוי הכוללת
   - הציון הכולל (performance score)
4. אם נשאלת שאלה על טרנד - התבסס על היסטוריית הביצועים
5. הסבר בפשטות מדוע ציון השתנה או מדוע ניתנה המלצה מסוימת
6. אם הלקוח שואל על פוליסה ספציפית - התייחס לפרטים שלה
7. אם אין מספיק נתונים - ציין זאת בכנות
8. השתמש במספרים מדויקים מהנתונים
9. היה תמיד חיובי ותומך, אך ריאליסטי

**חשוב:** תמיד התחל את התשובה בקשר ישיר לשאלה. היה תמציתי אך מקיף.`;

    // Build conversation messages
    const messages = [
      { role: 'system', content: systemPrompt },
      ...(conversationHistory || []),
      { role: 'user', content: question }
    ];

    // Call Lovable AI
    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    if (!LOVABLE_API_KEY) {
      throw new Error('LOVABLE_API_KEY not configured');
    }

    console.log('Calling Lovable AI...');
    const aiResponse = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${LOVABLE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash',
        messages: messages,
        temperature: 0.7,
        max_tokens: 1500,
      }),
    });

    if (!aiResponse.ok) {
      const errorText = await aiResponse.text();
      console.error('AI API error:', aiResponse.status, errorText);
      throw new Error(`AI API error: ${aiResponse.status}`);
    }

    const aiData = await aiResponse.json();
    const answer = aiData.choices[0].message.content;

    console.log('AI response generated successfully');

    return new Response(
      JSON.stringify({ answer }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in ai-advisor function:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
});
