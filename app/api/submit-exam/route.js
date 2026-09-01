import { NextResponse } from "next/server";
import { supabaseAdmin } from "../../../lib/supabaseAdmin";

export async function POST(req) {
  const { testId, studentId, answers } = await req.json();
  if (!testId || !studentId) {
    return NextResponse.json({ ok: false, error: "بيانات ناقصة" }, { status: 400 });
  }
  const db = supabaseAdmin();

  const { data: test } = await db.from("tests").select("*").eq("id", testId).single();
  if (!test) return NextResponse.json({ ok: false, error: "الاختبار غير موجود" }, { status: 404 });

  // إعادة التحقق من عدم التكرار في الخادم (حماية إضافية)
  const { count } = await db
    .from("attempts")
    .select("id", { count: "exact", head: true })
    .eq("test_id", testId)
    .eq("student_id", studentId);

  let grantId = null;
  if (count && count > 0) {
    const { data: grant } = await db
      .from("retry_grants")
      .select("id")
      .eq("test_id", testId)
      .eq("student_id", studentId)
      .eq("consumed", false)
      .limit(1)
      .maybeSingle();
    if (!grant) {
      return NextResponse.json({ ok: false, error: "لقد قمت بتسليم هذا الاختبار من قبل" }, { status: 403 });
    }
    grantId = grant.id;
  }

  let score = 0;
  const key = test.answer_key || {};
  for (let i = 1; i <= test.num_questions; i++) {
    if (answers?.[i] && answers[i] === key[i]) score++;
  }

  const { error } = await db.from("attempts").insert({
    test_id: testId,
    student_id: studentId,
    score,
    total: test.num_questions,
    answers: answers || {},
  });
  if (error) return NextResponse.json({ ok: false, error: error.message }, { status: 500 });

  if (grantId) {
    await db.from("retry_grants").update({ consumed: true }).eq("id", grantId);
  }

  return NextResponse.json({ ok: true, score, total: test.num_questions });
}
