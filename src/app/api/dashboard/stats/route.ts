import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const supabase = await createClient();

    // Get customers count
    const { count: customersCount } = await supabase
      .from("customers")
      .select("*", { count: "exact", head: true });

    // Get active products count
    const { count: activeProductsCount } = await supabase
      .from("products")
      .select("*", { count: "exact", head: true })
      .eq("status", "active");

    // Get total products count
    const { count: totalProductsCount } = await supabase
      .from("products")
      .select("*", { count: "exact", head: true });

    // Get today's meetings
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const { data: todayMeetings, count: todayMeetingsCount } = await supabase
      .from("meetings")
      .select("*", { count: "exact" })
      .gte("scheduled_at", today.toISOString())
      .lt("scheduled_at", tomorrow.toISOString());

    const completedMeetingsToday = todayMeetings?.filter(
      (m) => m.status === "completed"
    ).length || 0;

    // Get open workflows count
    const { count: openWorkflowsCount } = await supabase
      .from("workflows")
      .select("*", { count: "exact", head: true })
      .in("status", ["open", "in_progress", "waiting"]);

    // Get urgent workflows count
    const { count: urgentWorkflowsCount } = await supabase
      .from("workflows")
      .select("*", { count: "exact", head: true })
      .eq("priority", "urgent")
      .in("status", ["open", "in_progress", "waiting"]);

    // Get new customers this month
    const firstDayOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
    const { count: newCustomersThisMonth } = await supabase
      .from("customers")
      .select("*", { count: "exact", head: true })
      .gte("created_at", firstDayOfMonth.toISOString());

    return NextResponse.json({
      data: {
        customers: {
          total: customersCount || 0,
          newThisMonth: newCustomersThisMonth || 0,
        },
        products: {
          active: activeProductsCount || 0,
          total: totalProductsCount || 0,
          percentage: totalProductsCount
            ? Math.round(((activeProductsCount || 0) / totalProductsCount) * 100)
            : 0,
        },
        meetings: {
          today: todayMeetingsCount || 0,
          completedToday: completedMeetingsToday,
        },
        workflows: {
          open: openWorkflowsCount || 0,
          urgent: urgentWorkflowsCount || 0,
        },
      },
    });
  } catch {
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
