import { NextResponse } from "next/server";
import { supabaseAdmin } from "../../../lib/supabaseAdmin";

export async function POST(req) {
  const { masterCode } = await req.json();
  if (masterCode !== process.env.TEACHER_ACCESS_CODE) {
    return NextResponse.json({ ok: false, error: "هذه الميزة متاحة فقط للحساب الرئيسي" }, { status: 401 });
  }
  const db = supabaseAdmin();
  const { data, error } = await db.from("teachers").select("id, name, created_at").order("name");
  if (error) return NextResponse.json({ ok: false, error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true, teachers: data });
}
