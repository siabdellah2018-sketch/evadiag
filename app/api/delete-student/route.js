import { NextResponse } from "next/server";
import { supabaseAdmin } from "../../../lib/supabaseAdmin";
import { checkTeacherAuth } from "../../../lib/checkTeacherAuth";

export async function POST(req) {
  const { teacherCode, codeMassar } = await req.json();
  if (!(await checkTeacherAuth(teacherCode))) {
    return NextResponse.json({ ok: false, error: "غير مصرح" }, { status: 401 });
  }
  if (!codeMassar) return NextResponse.json({ ok: false, error: "بيانات ناقصة" }, { status: 400 });
  const db = supabaseAdmin();
  const { error } = await db.from("students").delete().eq("code_massar", codeMassar);
  if (error) return NextResponse.json({ ok: false, error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}
