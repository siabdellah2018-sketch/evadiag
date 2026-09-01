import { NextResponse } from "next/server";
import { supabaseAdmin } from "../../../lib/supabaseAdmin";

// فقط الحساب الرئيسي يمكنه حذف حسابات الأساتذة
export async function POST(req) {
  const { masterCode, id } = await req.json();
  if (masterCode !== process.env.TEACHER_ACCESS_CODE) {
    return NextResponse.json({ ok: false, error: "هذه الميزة متاحة فقط للحساب الرئيسي" }, { status: 401 });
  }
  if (!id) return NextResponse.json({ ok: false, error: "بيانات ناقصة" }, { status: 400 });
  const db = supabaseAdmin();
  const { error } = await db.from("teachers").delete().eq("id", id);
  if (error) return NextResponse.json({ ok: false, error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}
