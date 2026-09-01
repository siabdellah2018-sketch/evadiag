import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { supabaseAdmin } from "../../../lib/supabaseAdmin";
import { checkTeacherAuth } from "../../../lib/checkTeacherAuth";
import { resolveLevelAndSection } from "../../../lib/resolveLevelSection";

export async function POST(req) {
  const { teacherCode, students } = await req.json();
  if (!(await checkTeacherAuth(teacherCode))) {
    return NextResponse.json({ ok: false, error: "غير مصرح" }, { status: 401 });
  }
  if (!Array.isArray(students) || students.length === 0) {
    return NextResponse.json({ ok: false, error: "لائحة التلاميذ فارغة" }, { status: 400 });
  }

  const db = supabaseAdmin();
  const rows = [];
  for (const s of students) {
    if (!s.fullName || !s.codeMassar || !s.password) continue;
    const password_hash = await bcrypt.hash(String(s.password), 10);
    const { levelId, sectionId } = await resolveLevelAndSection(db, s.level, s.section);
    rows.push({
      full_name: s.fullName.trim(),
      code_massar: s.codeMassar.trim(),
      password_hash,
      level_id: levelId,
      section_id: sectionId,
    });
  }
  if (rows.length === 0) {
    return NextResponse.json({ ok: false, error: "لا توجد بيانات صالحة" }, { status: 400 });
  }

  const { data, error } = await db
    .from("students")
    .upsert(rows, { onConflict: "code_massar" })
    .select();

  if (error) return NextResponse.json({ ok: false, error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true, created: data.length });
}
