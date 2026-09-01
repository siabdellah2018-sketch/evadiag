import { supabaseAdmin } from "./supabaseAdmin";

// يبحث عن مستوى بالاسم، وإن لم يجده ينشئه. كذلك بالنسبة للقسم داخل ذلك المستوى.
// يُستعمل عند إنشاء/استيراد التلاميذ بصيغة نصية (اسم المستوى واسم القسم).
export async function resolveLevelAndSection(db, levelName, sectionName) {
  let levelId = null;
  let sectionId = null;

  if (levelName) {
    const { data: existing } = await db.from("levels").select("id").ilike("name", levelName).maybeSingle();
    if (existing) {
      levelId = existing.id;
    } else {
      const { data: created, error } = await db.from("levels").insert({ name: levelName }).select("id").single();
      if (!error) levelId = created.id;
    }
  }

  if (levelId && sectionName) {
    const { data: existingS } = await db
      .from("sections").select("id").eq("level_id", levelId).ilike("name", sectionName).maybeSingle();
    if (existingS) {
      sectionId = existingS.id;
    } else {
      const { data: createdS, error } = await db
        .from("sections").insert({ level_id: levelId, name: sectionName }).select("id").single();
      if (!error) sectionId = createdS.id;
    }
  }

  return { levelId, sectionId };
}
