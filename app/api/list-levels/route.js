import { NextResponse } from "next/server";
import { supabaseAdmin } from "../../../lib/supabaseAdmin";
import { checkTeacherAuth } from "../../../lib/checkTeacherAuth";

export async function POST(req) {
  const { teacherCode } = await req.json();
  if (!(await checkTeacherAuth(teacherCode))) {
    return NextResponse.json({ ok: false, error: "غير مصرح" }, { status: 401 });
  }
  const db = supabaseAdmin();
  const { data: levels, error } = await db.from("levels").select("id, name").order("name");
  if (error) return NextResponse.json({ ok: false, error: error.message }, { status: 500 });
  const { data: sections } = await db.from("sections").select("id, level_id, name").order("name");
  const withSections = levels.map((l) => ({
    ...l,
    sections: (sections || []).filter((s) => s.level_id === l.id),
  }));
  return NextResponse.json({ ok: true, levels: withSections });
}
