import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { supabaseAdmin } from "../../../lib/supabaseAdmin";

// يقبل: الكود الرئيسي TEACHER_ACCESS_CODE (يبقى يعمل دائمًا كحساب رئيسي)
// أو: اسم + كلمة سر لأستاذ تمت إضافته عبر جدول teachers
export async function POST(req) {
  const { code, name, password } = await req.json();

  if (code && code === process.env.TEACHER_ACCESS_CODE) {
    return NextResponse.json({ ok: true, isMaster: true, authCode: code, name: "المدير" });
  }

  if (name && password) {
    const db = supabaseAdmin();
    const { data: teacher } = await db.from("teachers").select("*").eq("name", name.trim()).single();
    if (teacher) {
      const valid = await bcrypt.compare(String(password), teacher.password_hash);
      if (valid) {
        return NextResponse.json({ ok: true, isMaster: false, authCode: `${name}::${password}`, name: teacher.name });
      }
    }
  }

  return NextResponse.json({ ok: false, error: "بيانات الدخول غير صحيحة" }, { status: 401 });
}
