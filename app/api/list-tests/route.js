import { NextResponse } from "next/server";
import { supabaseAdmin } from "../../../lib/supabaseAdmin";
import { checkTeacherAuth } from "../../../lib/checkTeacherAuth";

export async function POST(req) {
  const { teacherCode } = await req.json();
  if (!(await checkTeacherAuth(teacherCode))) {
    return NextResponse.json({ ok: false, error: "غير مصرح" }, { status: 401 });
  }
  const db = supabaseAdmin();
  const { data: tests, error } = await db
    .from("tests")
    .select("id, code, title_fr, title_ar, duration_minutes, num_questions, created_at, levels(name)")
    .order("created_at", { ascending: false });
  if (error) return NextResponse.json({ ok: false, error: error.message }, { status: 500 });

  const { data: attempts } = await db.from("attempts").select("test_id");
  const counts = {};
  (attempts || []).forEach((a) => { counts[a.test_id] = (counts[a.test_id] || 0) + 1; });
  const withCounts = tests.map((t) => ({ ...t, levelName: t.levels?.name || "", submissions: counts[t.id] || 0 }));

  return NextResponse.json({ ok: true, tests: withCounts });
}
