import { createClient } from "@/lib/supabase/server";
import { NextRequest, NextResponse } from "next/server";
import { analyzePortfolio } from "@/lib/analysis/xray-engine";

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { searchParams } = new URL(request.url);
    const customerId = searchParams.get("customerId");

    if (!customerId) {
      return NextResponse.json({ error: "חסר מזהה לקוח" }, { status: 400 });
    }

    // שליפת נתוני הלקוח
    const { data: customer, error: customerError } = await supabase
      .from("customers")
      .select("*")
      .eq("id", customerId)
      .single();

    if (customerError || !customer) {
      return NextResponse.json({ error: "לקוח לא נמצא" }, { status: 404 });
    }

    // שליפת מוצרים
    const { data: products, error: productsError } = await supabase
      .from("products")
      .select("*")
      .eq("customer_id", customerId);

    if (productsError) {
      return NextResponse.json({ error: "שגיאה בשליפת מוצרים" }, { status: 500 });
    }

    // שליפת בני משפחה
    const { data: familyMembers } = await supabase
      .from("family_members")
      .select("*")
      .eq("customer_id", customerId);

    // שליפת הערכת צרכים
    const { data: needsAssessment } = await supabase
      .from("needs_assessments")
      .select("*")
      .eq("customer_id", customerId)
      .order("created_at", { ascending: false })
      .limit(1)
      .single();

    // הרצת הניתוח
    const report = analyzePortfolio(
      customer,
      products || [],
      familyMembers || [],
      needsAssessment || null
    );

    return NextResponse.json({ data: report });
  } catch (err) {
    console.error("X-RAY analysis error:", err);
    return NextResponse.json(
      { error: "שגיאה פנימית בשרת" },
      { status: 500 }
    );
  }
}
