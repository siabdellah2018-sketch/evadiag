import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { supabaseAdmin } from "../../../lib/supabaseAdmin";

export async function POST(req) {
  const { fullName, codeMassar, password, testCode } = await req.json();
  if (!fullName || !codeMassar || !password || !testCode) {
    return NextResponse.json({ ok: false, error: "الرجاء تعبئة جميع الحقول" }, { status: 400 });
  }

  const db = supabaseAdmin();

  const { data: student } = await db
    .from("students")
    .select("*")
    .eq("code_massar", codeMassar.trim())
    .single();

  if (!student) {
    return NextResponse.json({ ok: false, error: "بيانات الدخول غير صحيحة" }, { status: 401 });
  }
  const validPassword = await bcrypt.compare(String(password), student.password_hash);
  if (!validPassword) {
    return NextResponse.json({ ok: false, error: "بيانات الدخول غير صحيحة" }, { status: 401 });
  }

  const { data: test } = await db
    .from("tests")
    .select("id, code, title_fr, title_ar, duration_minutes, num_questions, pdf_url")
    .eq("code", testCode.trim().toUpperCase())
    .single();

  if (!test) {
    return NextResponse.json({ ok: false, error: "لم يتم العثور على اختبار بهذا الكود" }, { status: 404 });
  }

  const { count } = await db
    .from("attempts")
    .select("id", { count: "exact", head: true })
    .eq("test_id", test.id)
    .eq("student_id", student.id);

  if (count && count > 0) {
    const { data: grant } = await db
      .from("retry_grants")
      .select("id")
      .eq("test_id", test.id)
      .eq("student_id", student.id)
      .eq("consumed", false)
      .limit(1)
      .maybeSingle();

    if (!grant) {
      return NextResponse.json(
        { ok: false, error: "لقد اجتزت هذا الاختبار من قبل. اطلب من أستاذك منحك محاولة إضافية إن لزم الأمر." },
        { status: 403 }
      );
    }
  }

  return NextResponse.json({
    ok: true,
    studentId: student.id,
    studentName: student.full_name,
    test,
  });
}
