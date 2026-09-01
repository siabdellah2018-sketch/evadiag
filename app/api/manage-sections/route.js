import { NextResponse } from "next/server";
import { supabaseAdmin } from "../../../lib/supabaseAdmin";
import { checkTeacherAuth } from "../../../lib/checkTeacherAuth";

export async function POST(req) {
  const { teacherCode, action, id, levelId, name } = await req.json();
  if (!(await checkTeacherAuth(teacherCode))) {
    return NextResponse.json({ ok: false, error: "غير مصرح" }, { status: 401 });
  }
  const db = supabaseAdmin();

  if (action === "create") {
    if (!levelId || !name?.trim()) return NextResponse.json({ ok: false, error: "بيانات ناقصة" }, { status: 400 });
    const { error } = await db.from("sections").insert({ level_id: levelId, name: name.trim() });
    if (error) return NextResponse.json({ ok: false, error: error.message }, { status: 500 });
    return NextResponse.json({ ok: true });
  }
  if (action === "update") {
    if (!id || !name?.trim()) return NextResponse.json({ ok: false, error: "بيانات ناقصة" }, { status: 400 });
    const { error } = await db.from("sections").update({ name: name.trim() }).eq("id", id);
    if (error) return NextResponse.json({ ok: false, error: error.message }, { status: 500 });
    return NextResponse.json({ ok: true });
  }
  if (action === "delete") {
    if (!id) return NextResponse.json({ ok: false, error: "بيانات ناقصة" }, { status: 400 });
    const { error } = await db.from("sections").delete().eq("id", id);
    if (error) return NextResponse.json({ ok: false, error: error.message }, { status: 500 });
    return NextResponse.json({ ok: true });
  }
  return NextResponse.json({ ok: false, error: "إجراء غير معروف" }, { status: 400 });
}
