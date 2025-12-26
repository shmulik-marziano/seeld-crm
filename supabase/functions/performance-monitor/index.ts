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
    
    const supabase = createClient(supabaseUrl, supabaseKey);

    console.log('Starting performance monitoring for all users...');

    // Get all users with policies
    const { data: usersWithPolicies, error: usersError } = await supabase
      .from('policies')
      .select('user_id')
      .neq('status', 'cancelled');

    if (usersError) throw usersError;

    // Get unique user IDs
    const uniqueUserIds = [...new Set(usersWithPolicies.map(p => p.user_id))];
    console.log(`Found ${uniqueUserIds.length} users to monitor`);

    let alertsCreated = 0;

    // Process each user
    for (const userId of uniqueUserIds) {
      try {
        // Fetch user's policies
        const { data: policies, error: policiesError } = await supabase
          .from('policies')
          .select('*')
          .eq('user_id', userId)
          .order('created_at', { ascending: false });

        if (policiesError || !policies || policies.length === 0) continue;

        // Fetch user profile for age
        const { data: profile } = await supabase
          .from('profiles')
          .select('date_of_birth')
          .eq('user_id', userId)
          .single();

        let userAge = 35;
        if (profile?.date_of_birth) {
          const birthDate = new Date(profile.date_of_birth);
          const today = new Date();
          userAge = today.getFullYear() - birthDate.getFullYear();
        }

        // Calculate performance metrics
        const totalPremium = policies.reduce((sum, p) => sum + Number(p.premium), 0);
        const totalCoverage = policies.reduce((sum, p) => sum + Number(p.coverage_amount), 0);
        const avgPremium = totalPremium / policies.length;

        // Get benchmark based on age
        const getMarketBenchmarkByAge = (age: number) => {
          if (age < 30) return { avgPremium: 800, avgCoverage: 500000, avgPolicies: 2.5 };
          if (age < 40) return { avgPremium: 1200, avgCoverage: 800000, avgPolicies: 3.5 };
          if (age < 50) return { avgPremium: 1500, avgCoverage: 1200000, avgPolicies: 4.2 };
          return { avgPremium: 1800, avgCoverage: 1500000, avgPolicies: 4.8 };
        };

        const benchmark = getMarketBenchmarkByAge(userAge);

        // Calculate scores
        const premiumDiff = ((avgPremium - benchmark.avgPremium) / benchmark.avgPremium * 100);
        const coverageDiff = ((totalCoverage / policies.length - benchmark.avgCoverage) / benchmark.avgCoverage * 100);
        const policiesDiff = ((policies.length - benchmark.avgPolicies) / benchmark.avgPolicies * 100);

        const premiumScore = Math.max(0, Math.min(40, 40 - (premiumDiff * 0.5)));
        const coverageScore = Math.max(0, Math.min(40, 40 + (coverageDiff * 0.3)));
        const policyScore = Math.max(0, 20 - Math.abs(policiesDiff * 0.3));
        
        const performanceScore = Math.round(premiumScore + coverageScore + policyScore);
        
        let rating = 'משביע רצון';
        if (performanceScore >= 85) rating = 'מצוין';
        else if (performanceScore >= 70) rating = 'טוב מאוד';
        else if (performanceScore >= 55) rating = 'טוב';
        else if (performanceScore < 40) rating = 'דורש שיפור';

        // Get previous performance score
        const { data: previousScores } = await supabase
          .from('performance_history')
          .select('*')
          .eq('user_id', userId)
          .order('created_at', { ascending: false })
          .limit(1);

        const previousScore = previousScores?.[0];

        // Save current score
        await supabase
          .from('performance_history')
          .insert({
            user_id: userId,
            performance_score: performanceScore,
            performance_rating: rating,
            premium_score: Math.round(premiumScore),
            coverage_score: Math.round(coverageScore),
            policy_score: Math.round(policyScore),
            total_premium: totalPremium,
            total_coverage: totalCoverage,
            total_policies: policies.length
          });

        // Detect significant changes and create notifications
        if (previousScore) {
          const scoreDiff = performanceScore - previousScore.performance_score;
          
          // Significant score drop (>10 points)
          if (scoreDiff <= -10) {
            await supabase.from('notifications').insert({
              user_id: userId,
              type: 'savings_opportunity',
              priority: 'high',
              title: '⚠️ ירידה משמעותית בציון הביצועים שלך',
              message: `הציון שלך ירד מ-${previousScore.performance_score} ל-${performanceScore} (${Math.abs(scoreDiff)} נקודות). מומלץ לבדוק את תיק הביטוחים שלך ולחפש הזדמנויות לשיפור.`,
              action_url: '/client/analytics'
            });
            alertsCreated++;
          }
          
          // Rating downgrade
          else if (previousScore.performance_rating !== rating && 
                   ['מצוין', 'טוב מאוד', 'טוב', 'משביע רצון', 'דורש שיפור'].indexOf(rating) >
                   ['מצוין', 'טוב מאוד', 'טוב', 'משביע רצון', 'דורש שיפור'].indexOf(previousScore.performance_rating)) {
            await supabase.from('notifications').insert({
              user_id: userId,
              type: 'savings_opportunity',
              priority: 'medium',
              title: '📉 ירידה בדירוג הביצועים',
              message: `הדירוג שלך השתנה מ-"${previousScore.performance_rating}" ל-"${rating}". בדוק את ההמלצות לשיפור בדשבורד האנליטיקה.`,
              action_url: '/client/analytics'
            });
            alertsCreated++;
          }
          
          // Significant improvement (>15 points)
          else if (scoreDiff >= 15) {
            await supabase.from('notifications').insert({
              user_id: userId,
              type: 'savings_opportunity',
              priority: 'low',
              title: '🎉 שיפור משמעותי בציון הביצועים!',
              message: `כל הכבוד! הציון שלך עלה מ-${previousScore.performance_score} ל-${performanceScore} (+${scoreDiff} נקודות). המשך כך!`,
              action_url: '/client/analytics'
            });
            alertsCreated++;
          }
        }

        // Detect savings opportunities
        if (premiumDiff > 20) {
          await supabase.from('notifications').insert({
            user_id: userId,
            type: 'savings_opportunity',
            priority: 'high',
            title: '💰 זוהתה הזדמנות לחיסכון משמעותית',
            message: `הפרמיות שלך גבוהות ב-${Math.round(premiumDiff)}% מהממוצע בשוק. בדוק את ההמלצות לאופטימיזציה.`,
            action_url: '/client/recommendations'
          });
          alertsCreated++;
        }

        // Low coverage warning
        if (coverageDiff < -30) {
          await supabase.from('notifications').insert({
            user_id: userId,
            type: 'savings_opportunity',
            priority: 'high',
            title: '🛡️ פער כיסוי משמעותי',
            message: `הכיסוי שלך נמוך ב-${Math.abs(Math.round(coverageDiff))}% מהמומלץ. שקול להגדיל את הכיסוי לשמור על הגנה מיטבית.`,
            action_url: '/client/recommendations'
          });
          alertsCreated++;
        }

      } catch (userError) {
        console.error(`Error processing user ${userId}:`, userError);
        continue;
      }
    }

    console.log(`Performance monitoring completed. Created ${alertsCreated} alerts.`);

    return new Response(JSON.stringify({ 
      success: true,
      usersProcessed: uniqueUserIds.length,
      alertsCreated
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Performance monitoring error:', error);
    return new Response(JSON.stringify({ 
      error: error instanceof Error ? error.message : 'Unknown error' 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
