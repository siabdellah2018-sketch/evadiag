import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import * as XLSX from "xlsx";
import { supabaseAdmin } from "../../../lib/supabaseAdmin";
import { checkTeacherAuth } from "../../../lib/checkTeacherAuth";
import { resolveLevelAndSection } from "../../../lib/resolveLevelSection";

// يتوقع ملف Excel بأعمدة (بأي ترتيب، أسماء الأعمدة بالعربية أو الفرنسية):
// الاسم الكامل / Nom complet | رمز Massar / Code Massar | كلمة السر / Mot de passe | القسم / Section | المستوى / Niveau
export async function POST(req) {
  const form = await req.formData();
  const teacherCode = form.get("teacherCode");
  if (!(await checkTeacherAuth(teacherCode))) {
    return NextResponse.json({ ok: false, error: "غير مصرح" }, { status: 401 });
  }
  const file = form.get("file");
  if (!file) return NextResponse.json({ ok: false, error: "لم يتم إرفاق ملف" }, { status: 400 });

  const buf = new Uint8Array(await file.arrayBuffer());
  const wb = XLSX.read(buf, { type: "array" });
  const sheet = wb.Sheets[wb.SheetNames[0]];
  const rows = XLSX.utils.sheet_to_json(sheet, { defval: "" });

  const pick = (row, keys) => {
    for (const k of Object.keys(row)) {
      if (keys.some((x) => k.trim().toLowerCase() === x)) return String(row[k]).trim();
    }
    return "";
  };

  const students = [];
  for (const row of rows) {
    const fullName = pick(row, ["الاسم الكامل", "nom complet", "name", "fullname"]);
    const codeMassar = pick(row, ["رمز massar", "code massar", "massar", "codemassar"]);
    const password = pick(row, ["كلمة السر", "mot de passe", "password"]);
    const section = pick(row, ["القسم", "section"]);
    const level = pick(row, ["المستوى", "niveau", "level"]);
    if (fullName && codeMassar && password) {
      students.push({ fullName, codeMassar, password, section, level });
    }
  }
  if (students.length === 0) {
    return NextResponse.json({ ok: false, error: "لم يتم العثور على أي سطر صالح في الملف" }, { status: 400 });
  }

  const db = supabaseAdmin();
  const toInsert = [];
  for (const s of students) {
    const password_hash = await bcrypt.hash(s.password, 10);
    const { levelId, sectionId } = await resolveLevelAndSection(db, s.level, s.section);
    toInsert.push({
      full_name: s.fullName,
      code_massar: s.codeMassar,
      password_hash,
      level_id: levelId,
      section_id: sectionId,
    });
  }
  const { data, error } = await db.from("students").upsert(toInsert, { onConflict: "code_massar" }).select();
  if (error) return NextResponse.json({ ok: false, error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true, created: data.length });
}
