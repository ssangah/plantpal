-- Run this in your Supabase SQL editor
-- Go to: supabase.com/dashboard -> your project -> SQL Editor -> New Query

-- Plants table
create table plants (
  id uuid default gen_random_uuid() primary key,
  name text not null,
  emoji text default '🌿',
  frequency_days integer not null default 7,
  color text default '#4a7c59',
  notes text,
  created_at timestamptz default now()
);

-- Waterings log
create table waterings (
  id uuid default gen_random_uuid() primary key,
  plant_id uuid references plants(id) on delete cascade,
  watered_by text not null,
  watered_at timestamptz default now()
);

-- Allow public read/write (no auth needed for sharing)
alter table plants enable row level security;
alter table waterings enable row level security;

create policy "Public read plants" on plants for select using (true);
create policy "Public insert plants" on plants for insert with check (true);
create policy "Public delete plants" on plants for delete using (true);

create policy "Public read waterings" on waterings for select using (true);
create policy "Public insert waterings" on waterings for insert with check (true);

-- Enable real-time updates
alter publication supabase_realtime add table plants;
alter publication supabase_realtime add table waterings;
