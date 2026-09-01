import bcrypt from "bcryptjs";
import { supabaseAdmin } from "./supabaseAdmin";

// يتحقق من صلاحية "authCode" القادم من الواجهة، سواء كان الكود الرئيسي
// أو بصيغة "اسم::كلمة السر" لأستاذ عادي مضاف عبر جدول teachers
export async function checkTeacherAuth(authCode) {
  if (!authCode) return false;
  if (authCode === process.env.TEACHER_ACCESS_CODE) return true;

  if (authCode.includes("::")) {
    const [name, password] = authCode.split("::");
    const db = supabaseAdmin();
    const { data: teacher } = await db.from("teachers").select("*").eq("name", name.trim()).single();
    if (teacher) {
      return await bcrypt.compare(String(password), teacher.password_hash);
    }
  }
  return false;
}
