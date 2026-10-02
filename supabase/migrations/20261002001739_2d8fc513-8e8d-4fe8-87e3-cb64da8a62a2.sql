create table public.marketing_preferences (
  user_id uuid primary key references auth.users(id) on delete cascade,
  email text not null,
  newsletter_opt_in boolean not null default false,
  consented_at timestamptz,
  updated_at timestamptz not null default now()
);
grant select, insert, update on public.marketing_preferences to authenticated;
grant all on public.marketing_preferences to service_role;
alter table public.marketing_preferences enable row level security;
create policy "Own prefs select" on public.marketing_preferences for select to authenticated using (auth.uid() = user_id);
create policy "Own prefs insert" on public.marketing_preferences for insert to authenticated with check (auth.uid() = user_id);
create policy "Own prefs update" on public.marketing_preferences for update to authenticated using (auth.uid() = user_id) with check (auth.uid() = user_id);