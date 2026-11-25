-- ============================================================
-- Mahmoud Fissal Portfolio — Supabase schema
-- Run once in the Supabase SQL Editor (Dashboard -> SQL -> New query)
-- ============================================================

create extension if not exists pgcrypto;

-- 1. Editable site content (key/value JSON, bilingual)
create table if not exists public.site_content (
  key text primary key,
  value jsonb not null,
  updated_at timestamptz not null default now()
);

-- 2. Portfolio items
create table if not exists public.portfolio_items (
  id uuid primary key default gen_random_uuid(),
  title_ar text not null default '',
  title_en text not null default '',
  category text not null default 'branding',
  category_ar text not null default '',
  category_en text not null default '',
  image_url text not null default '',
  img_opacity integer not null default 100,
  sort_order integer not null default 0,
  visible boolean not null default true,
  created_at timestamptz not null default now()
);

-- 2b. Design projects (تصاميم) — social media design projects, each with a card logo and a set of design images
create table if not exists public.designs_projects (
  id uuid primary key default gen_random_uuid(),
  name_ar text not null default '',
  name_en text not null default '',
  desc_ar text not null default '',
  desc_en text not null default '',
  card_image_url text not null default '',
  images jsonb not null default '[]'::jsonb,
  sort_order integer not null default 0,
  visible boolean not null default true,
  created_at timestamptz not null default now()
);

-- 3. Visitor contact messages
create table if not exists public.contact_messages (
  id bigint generated always as identity primary key,
  name text not null default '',
  email text not null default '',
  message text not null default '',
  read boolean not null default false,
  created_at timestamptz not null default now()
);

-- 4. Row level security
alter table public.site_content enable row level security;
alter table public.portfolio_items enable row level security;
alter table public.designs_projects enable row level security;
alter table public.contact_messages enable row level security;

-- Everyone (anon) can read content; only the logged-in admin can write.
create policy "public read content" on public.site_content
  for select using (true);
create policy "admin write content" on public.site_content
  for all using (auth.role() = 'authenticated')
  with check (auth.role() = 'authenticated');

create policy "public read portfolio" on public.portfolio_items
  for select using (true);
create policy "admin write portfolio" on public.portfolio_items
  for all using (auth.role() = 'authenticated')
  with check (auth.role() = 'authenticated');

create policy "public read designs" on public.designs_projects
  for select using (true);
create policy "admin write designs" on public.designs_projects
  for all using (auth.role() = 'authenticated')
  with check (auth.role() = 'authenticated');

-- Anyone can send a message; only the admin can read/mark them.
create policy "anyone can send message" on public.contact_messages
  for insert with check (true);
create policy "admin reads messages" on public.contact_messages
  for select using (auth.role() = 'authenticated');
create policy "admin updates messages" on public.contact_messages
  for update using (auth.role() = 'authenticated')
  with check (auth.role() = 'authenticated');
create policy "admin deletes messages" on public.contact_messages
  for delete using (auth.role() = 'authenticated');

-- 4b. Table grants (needed when created via raw SQL)
grant select on public.site_content to anon, authenticated;
grant select on public.portfolio_items to anon, authenticated;
grant insert on public.contact_messages to anon, authenticated;
grant select, update, delete on public.contact_messages to authenticated;
grant insert, update, delete on public.site_content to authenticated;
grant insert, update, delete on public.portfolio_items to authenticated;

-- 5. Public storage bucket for uploaded images
insert into storage.buckets (id, name, public)
values ('site-assets', 'site-assets', true)
on conflict (id) do nothing;

create policy "public read assets" on storage.objects
  for select using (bucket_id = 'site-assets');
create policy "admin uploads assets" on storage.objects
  for insert with check (bucket_id = 'site-assets' and auth.role() = 'authenticated');
create policy "admin updates assets" on storage.objects
  for update using (bucket_id = 'site-assets' and auth.role() = 'authenticated');
create policy "admin deletes assets" on storage.objects
  for delete using (bucket_id = 'site-assets' and auth.role() = 'authenticated');

-- 6. updated_at maintenance
create or replace function public.touch_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end $$;

drop trigger if exists site_content_touch on public.site_content;
create trigger site_content_touch
  before update on public.site_content
  for each row execute function public.touch_updated_at();
