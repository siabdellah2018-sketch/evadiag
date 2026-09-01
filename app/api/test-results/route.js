import { NextResponse } from "next/server";
import { supabaseAdmin } from "../../../lib/supabaseAdmin";
import { checkTeacherAuth } from "../../../lib/checkTeacherAuth";

export async function POST(req) {
  const { teacherCode, testCode } = await req.json();
  if (!(await checkTeacherAuth(teacherCode))) {
    return NextResponse.json({ ok: false, error: "غير مصرح" }, { status: 401 });
  }
  const db = supabaseAdmin();

  const { data: test } = await db.from("tests").select("*, levels(name)").eq("code", testCode).single();
  if (!test) return NextResponse.json({ ok: false, error: "لم يتم العثور على الاختبار" }, { status: 404 });

  const { data: attempts, error } = await db
    .from("attempts")
    .select("score, total, submitted_at, answers, students(full_name, code_massar, levels(name), sections(name))")
    .eq("test_id", test.id)
    .order("submitted_at", { ascending: false });

  if (error) return NextResponse.json({ ok: false, error: error.message }, { status: 500 });

  const rows = (attempts || []).map((a) => ({
    fullName: a.students?.full_name,
    codeMassar: a.students?.code_massar,
    section: a.students?.sections?.name || "",
    level: a.students?.levels?.name || "",
    score: a.score,
    total: a.total,
    submittedAt: a.submitted_at,
    answers: a.answers,
  }));

  const questionStats = [];
  for (let i = 1; i <= test.num_questions; i++) {
    let wrong = 0;
    rows.forEach((r) => {
      const given = r.answers?.[i];
      if (given !== test.answer_key?.[i]) wrong++;
    });
    questionStats.push({
      question: i,
      wrongCount: wrong,
      wrongPercent: rows.length ? Math.round((wrong / rows.length) * 100) : 0,
    });
  }

  let weak = 0, average = 0, good = 0;
  rows.forEach((r) => {
    const pct = r.total ? (r.score / r.total) * 100 : 0;
    if (pct < 50) weak++;
    else if (pct < 70) average++;
    else good++;
  });

  return NextResponse.json({
    ok: true,
    test: { ...test, levelName: test.levels?.name || "" },
    results: rows,
    questionStats,
    distribution: { weak, average, good, totalStudents: rows.length },
  });
}
