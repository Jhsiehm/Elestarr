-- Elestarr. Paste into the Supabase SQL editor and run once.
--
-- Auth: Authentication > Providers > Email > Confirm email OFF
-- so create-account can sign in without a mailbox in this prototype.
-- Email proof stays in the product UI (VerifyRound). This schema stores
-- the attested public fact only: company, round, date, proved.
-- There is no result column. Do not add one.

create table if not exists public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  role text not null check (role in ('creative', 'firm')),
  display_name text not null default '',
  title text not null default '',
  location text not null default '',
  firm_name text not null default '',
  hiring_for text not null default '',
  onboarded boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.work (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid not null references public.profiles (id) on delete cascade,
  storage_path text not null,
  sort int not null default 0,
  created_at timestamptz not null default now()
);

create table if not exists public.interviews (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid not null references public.profiles (id) on delete cascade,
  company text not null,
  round text not null,
  role_title text not null default '',
  occurred_on date,
  proved boolean not null default false,
  created_at timestamptz not null default now()
);

create index if not exists work_profile_idx on public.work (profile_id, sort);
create index if not exists interviews_profile_idx on public.interviews (profile_id);

alter table public.profiles enable row level security;
alter table public.work enable row level security;
alter table public.interviews enable row level security;

-- Read the caller's role without re-entering profiles RLS.
create or replace function public.is_hiring()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.profiles
    where id = auth.uid() and role = 'firm'
  );
$$;

revoke all on function public.is_hiring() from public;
grant execute on function public.is_hiring() to authenticated;

drop policy if exists profiles_own on public.profiles;
create policy profiles_own on public.profiles
  for all
  using (auth.uid() = id)
  with check (auth.uid() = id);

drop policy if exists profiles_hiring_read_creatives on public.profiles;
create policy profiles_hiring_read_creatives on public.profiles
  for select
  using (
    onboarded = true
    and role = 'creative'
    and public.is_hiring()
  );

drop policy if exists work_own on public.work;
create policy work_own on public.work
  for all
  using (profile_id = auth.uid())
  with check (profile_id = auth.uid());

drop policy if exists work_hiring_read on public.work;
create policy work_hiring_read on public.work
  for select
  using (
    exists (
      select 1 from public.profiles owner
      where owner.id = work.profile_id
        and owner.role = 'creative'
        and owner.onboarded = true
    )
    and public.is_hiring()
  );

drop policy if exists interviews_own on public.interviews;
create policy interviews_own on public.interviews
  for all
  using (profile_id = auth.uid())
  with check (profile_id = auth.uid());

drop policy if exists interviews_hiring_read_proved on public.interviews;
create policy interviews_hiring_read_proved on public.interviews
  for select
  using (
    proved = true
    and exists (
      select 1 from public.profiles owner
      where owner.id = interviews.profile_id
        and owner.role = 'creative'
        and owner.onboarded = true
    )
    and public.is_hiring()
  );

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, role, display_name)
  values (
    new.id,
    case when coalesce(new.raw_user_meta_data->>'role', '') = 'firm' then 'firm' else 'creative' end,
    coalesce(new.raw_user_meta_data->>'display_name', '')
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

create or replace function public.touch_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists profiles_touch on public.profiles;
create trigger profiles_touch
  before update on public.profiles
  for each row execute procedure public.touch_updated_at();

insert into storage.buckets (id, name, public)
values ('work', 'work', true)
on conflict (id) do update set public = true;

drop policy if exists work_upload_own on storage.objects;
create policy work_upload_own
on storage.objects for insert to authenticated
with check (
  bucket_id = 'work'
  and split_part(name, '/', 1) = auth.uid()::text
);

drop policy if exists work_update_own on storage.objects;
create policy work_update_own
on storage.objects for update to authenticated
using (
  bucket_id = 'work'
  and split_part(name, '/', 1) = auth.uid()::text
);

drop policy if exists work_delete_own on storage.objects;
create policy work_delete_own
on storage.objects for delete to authenticated
using (
  bucket_id = 'work'
  and split_part(name, '/', 1) = auth.uid()::text
);

drop policy if exists work_public_read on storage.objects;
create policy work_public_read
on storage.objects for select
using (bucket_id = 'work');

grant usage on schema public to authenticated;
grant select, insert, update, delete on public.profiles to authenticated;
grant select, insert, update, delete on public.work to authenticated;
grant select, insert, update, delete on public.interviews to authenticated;
