-- شغّل هذا الملف الإضافي في Supabase: SQL Editor > New query > الصق > Run
-- إضافي فقط، لا يمسح أي بيانات موجودة

create table if not exists levels (
  id uuid primary key default gen_random_uuid(),
  name text unique not null,
  created_at timestamptz default now()
);

create table if not exists sections (
  id uuid primary key default gen_random_uuid(),
  level_id uuid references levels(id) on delete cascade,
  name text not null,
  created_at timestamptz default now(),
  unique (level_id, name)
);

insert into levels (name) values
  ('Tronc Commun Scientifique'),
  ('1BAC - Sciences Expérimentales'),
  ('1BAC - Sciences Mathématiques'),
  ('2BAC - Sciences Expérimentales PC/SVT'),
  ('2BAC - Sciences Mathématiques')
on conflict (name) do nothing;

alter table students add column if not exists level_id uuid references levels(id);
alter table students add column if not exists section_id uuid references sections(id);

alter table tests add column if not exists level_id uuid references levels(id);

alter table levels enable row level security;
alter table sections enable row level security;
