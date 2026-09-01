-- شغّل هذا الملف في Supabase: Dashboard > SQL Editor > New query > الصق المحتوى > Run

create extension if not exists "pgcrypto";

create table if not exists students (
  id uuid primary key default gen_random_uuid(),
  full_name text not null,
  code_massar text unique not null,
  password_hash text not null,
  created_at timestamptz default now()
);

create table if not exists tests (
  id uuid primary key default gen_random_uuid(),
  code text unique not null,
  title_fr text not null,
  title_ar text,
  duration_minutes int not null,
  num_questions int not null,
  answer_key jsonb not null,       -- {"1":"A","2":"C", ...}
  pdf_url text not null,
  show_correct_answers boolean default false,
  created_at timestamptz default now()
);

create table if not exists attempts (
  id uuid primary key default gen_random_uuid(),
  test_id uuid references tests(id) on delete cascade,
  student_id uuid references students(id) on delete cascade,
  score int not null,
  total int not null,
  answers jsonb not null,
  submitted_at timestamptz default now()
);

create table if not exists retry_grants (
  id uuid primary key default gen_random_uuid(),
  test_id uuid references tests(id) on delete cascade,
  student_id uuid references students(id) on delete cascade,
  consumed boolean default false,
  created_at timestamptz default now()
);

alter table students enable row level security;
alter table tests enable row level security;
alter table attempts enable row level security;
alter table retry_grants enable row level security;
-- لا توجد أي policy مضافة عمدًا: كل الوصول يمر إجباريًا عبر مسارات API في الخادم
-- باستعمال SUPABASE_SERVICE_ROLE_KEY الذي يتجاوز RLS. المتصفح لا يصل مباشرة لقاعدة البيانات.

insert into storage.buckets (id, name, public)
values ('test-pdfs', 'test-pdfs', true)
on conflict (id) do nothing;
