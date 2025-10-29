
create table blogs (
  id uuid default gen_random_uuid() primary key,
  title text not null,
  content jsonb not null,
  tags text[],
  created_at timestamptz default now()
);
