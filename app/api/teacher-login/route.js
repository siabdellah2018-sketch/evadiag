import { NextResponse } from "next/server";

export async function POST(req) {
  const { code } = await req.json();
  if (code && code === process.env.TEACHER_ACCESS_CODE) {
    return NextResponse.json({ ok: true });
  }
  return NextResponse.json({ ok: false, error: "كلمة السر غير صحيحة" }, { status: 401 });
}
