// عميل Supabase بصلاحيات كاملة — يُستعمل فقط داخل مسارات API على الخادم
// لا تستورد هذا الملف أبدًا في أي مكون يعمل في المتصفح (client component)
import { createClient } from "@supabase/supabase-js";

export function supabaseAdmin() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY,
    { auth: { persistSession: false } }
  );
}
