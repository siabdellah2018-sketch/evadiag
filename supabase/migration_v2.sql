-- شغّل هذا الملف الإضافي في Supabase: SQL Editor > New query > الصق > Run
-- هذا لا يمسح أي بيانات موجودة، فقط يضيف أعمدة/جداول جديدة

alter table students add column if not exists section text;
alter table students add column if not exists level text;

create table if not exists teachers (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  password_hash text not null,
  created_at timestamptz default now()
);
alter table teachers enable row level security;
