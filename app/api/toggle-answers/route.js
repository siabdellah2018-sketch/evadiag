import { NextResponse } from "next/server";
import { supabaseAdmin } from "../../../lib/supabaseAdmin";

export async function POST(req) {
  const { teacherCode, testCode, show } = await req.json();
  if (teacherCode !== process.env.TEACHER_ACCESS_CODE) {
    return NextResponse.json({ ok: false, error: "غير مصرح" }, { status: 401 });
  }
  const db = supabaseAdmin();
  const { error } = await db
    .from("tests")
    .update({ show_correct_answers: !!show })
    .eq("code", testCode);
  if (error) return NextResponse.json({ ok: false, error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}
