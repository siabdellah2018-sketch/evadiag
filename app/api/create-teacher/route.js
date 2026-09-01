import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { supabaseAdmin } from "../../../lib/supabaseAdmin";

// فقط الحساب الرئيسي (TEACHER_ACCESS_CODE) يمكنه إضافة أساتذة آخرين
export async function POST(req) {
  const { masterCode, name, password } = await req.json();
  if (masterCode !== process.env.TEACHER_ACCESS_CODE) {
    return NextResponse.json({ ok: false, error: "هذه الميزة متاحة فقط للحساب الرئيسي" }, { status: 401 });
  }
  if (!name || !password) {
    return NextResponse.json({ ok: false, error: "بيانات ناقصة" }, { status: 400 });
  }
  const db = supabaseAdmin();
  const password_hash = await bcrypt.hash(String(password), 10);
  const { error } = await db.from("teachers").insert({ name: name.trim(), password_hash });
  if (error) return NextResponse.json({ ok: false, error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}
