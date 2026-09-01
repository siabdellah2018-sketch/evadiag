import { NextResponse } from "next/server";
import { supabaseAdmin } from "../../../lib/supabaseAdmin";

export async function POST(req) {
  const { teacherCode, testCode } = await req.json();
  if (teacherCode !== process.env.TEACHER_ACCESS_CODE) {
    return NextResponse.json({ ok: false, error: "غير مصرح" }, { status: 401 });
  }
  const db = supabaseAdmin();

  const { data: test } = await db.from("tests").select("*").eq("code", testCode).single();
  if (!test) return NextResponse.json({ ok: false, error: "لم يتم العثور على الاختبار" }, { status: 404 });

  const { data: attempts, error } = await db
    .from("attempts")
    .select("score, total, submitted_at, students(full_name, code_massar)")
    .eq("test_id", test.id)
    .order("submitted_at", { ascending: false });

  if (error) return NextResponse.json({ ok: false, error: error.message }, { status: 500 });

  const rows = (attempts || []).map((a) => ({
    fullName: a.students?.full_name,
    codeMassar: a.students?.code_massar,
    score: a.score,
    total: a.total,
    submittedAt: a.submitted_at,
  }));

  return NextResponse.json({ ok: true, test, results: rows });
}
