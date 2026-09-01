import { NextResponse } from "next/server";
import { supabaseAdmin } from "../../../lib/supabaseAdmin";

export async function POST(req) {
  const { teacherCode, testCode, codeMassar } = await req.json();
  if (teacherCode !== process.env.TEACHER_ACCESS_CODE) {
    return NextResponse.json({ ok: false, error: "غير مصرح" }, { status: 401 });
  }
  const db = supabaseAdmin();

  const { data: test } = await db.from("tests").select("id").eq("code", testCode).single();
  const { data: student } = await db.from("students").select("id").eq("code_massar", codeMassar).single();
  if (!test || !student) {
    return NextResponse.json({ ok: false, error: "لم يتم العثور على الاختبار أو التلميذ" }, { status: 404 });
  }

  const { error } = await db.from("retry_grants").insert({
    test_id: test.id,
    student_id: student.id,
    consumed: false,
  });
  if (error) return NextResponse.json({ ok: false, error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}
