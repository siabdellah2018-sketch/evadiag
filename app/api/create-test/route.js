import { NextResponse } from "next/server";
import { supabaseAdmin } from "../../../lib/supabaseAdmin";
import { genTestCode } from "../../../lib/genCode";

export async function POST(req) {
  const form = await req.formData();
  const teacherCode = form.get("teacherCode");
  if (teacherCode !== process.env.TEACHER_ACCESS_CODE) {
    return NextResponse.json({ ok: false, error: "غير مصرح" }, { status: 401 });
  }

  const titleFr = form.get("titleFr");
  const titleAr = form.get("titleAr") || "";
  const duration = Number(form.get("duration"));
  const numQuestions = Number(form.get("numQuestions"));
  const answerKey = JSON.parse(form.get("answerKey") || "{}");
  const pdfFile = form.get("pdfFile");

  if (!titleFr || !duration || !numQuestions || !pdfFile) {
    return NextResponse.json({ ok: false, error: "بيانات ناقصة" }, { status: 400 });
  }

  const db = supabaseAdmin();
  const code = genTestCode();
  const path = `${code}-${Date.now()}.pdf`;
  const bytes = new Uint8Array(await pdfFile.arrayBuffer());

  const { error: uploadError } = await db.storage
    .from("test-pdfs")
    .upload(path, bytes, { contentType: "application/pdf" });
  if (uploadError) {
    return NextResponse.json({ ok: false, error: uploadError.message }, { status: 500 });
  }

  const { data: pub } = db.storage.from("test-pdfs").getPublicUrl(path);

  const { error } = await db.from("tests").insert({
    code,
    title_fr: titleFr,
    title_ar: titleAr,
    duration_minutes: duration,
    num_questions: numQuestions,
    answer_key: answerKey,
    pdf_url: pub.publicUrl,
    show_correct_answers: false,
  });

  if (error) return NextResponse.json({ ok: false, error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true, code });
}
