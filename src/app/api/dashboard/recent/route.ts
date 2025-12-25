import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const supabase = await createClient();

    // Get recent customers
    const { data: recentCustomers } = await supabase
      .from("customers")
      .select("id, first_name, last_name, mobile, created_at")
      .order("created_at", { ascending: false })
      .limit(5);

    // Get products count for each customer
    const customersWithProducts = await Promise.all(
      (recentCustomers || []).map(async (customer) => {
        const { count } = await supabase
          .from("products")
          .select("*", { count: "exact", head: true })
          .eq("customer_id", customer.id)
          .eq("status", "active");
        return { ...customer, products_count: count || 0 };
      })
    );

    // Get upcoming meetings
    const now = new Date();
    const endOfDay = new Date(now);
    endOfDay.setHours(23, 59, 59, 999);

    const { data: upcomingMeetings } = await supabase
      .from("meetings")
      .select("id, customer_id, type, scheduled_at, duration_minutes, customers(first_name, last_name)")
      .gte("scheduled_at", now.toISOString())
      .lte("scheduled_at", endOfDay.toISOString())
      .eq("status", "scheduled")
      .order("scheduled_at", { ascending: true })
      .limit(5);

    // Get urgent tasks
    const { data: urgentTasks } = await supabase
      .from("workflows")
      .select("id, type, priority, due_date, customer_id, customers(first_name, last_name)")
      .in("status", ["open", "in_progress", "waiting"])
      .in("priority", ["urgent", "high"])
      .order("due_date", { ascending: true })
      .limit(5);

    return NextResponse.json({
      data: {
        recentCustomers: customersWithProducts,
        upcomingMeetings: upcomingMeetings || [],
        urgentTasks: urgentTasks || [],
      },
    });
  } catch {
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
