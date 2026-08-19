-- Run in the SQL editor on the existing Elestarr project (after schema.sql).
-- Safe to re-run. Adds avatar, hiring fields, live sites, and a private .eml store.

alter table public.profiles
  add column if not exists avatar_path text not null default '',
  add column if not exists availability text not null default 'open',
  add column if not exists open_to text not null default '',
  add column if not exists proof_token text;

do $$
begin
  if not exists (
    select 1 from pg_constraint
    where conname = 'profiles_availability_check'
      and conrelid = 'public.profiles'::regclass
  ) then
    alter table public.profiles
      add constraint profiles_availability_check
      check (availability in ('open', 'conversation', 'not_looking'));
  end if;
end $$;

create or replace function public.new_proof_token()
returns text
language sql
as $$
  select lower(substr(replace(gen_random_uuid()::text, '-', ''), 1, 10));
$$;

update public.profiles
set proof_token = public.new_proof_token()
where proof_token is null or proof_token = '';

do $$
begin
  if not exists (
    select 1 from pg_constraint
    where conname = 'profiles_proof_token_key'
      and conrelid = 'public.profiles'::regclass
  ) then
    alter table public.profiles
      add constraint profiles_proof_token_key unique (proof_token);
  end if;
end $$;

alter table public.profiles
  alter column proof_token set default public.new_proof_token();

alter table public.profiles
  alter column proof_token set not null;

create table if not exists public.sites (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid not null references public.profiles (id) on delete cascade,
  url text not null,
  label text not null default '',
  sort int not null default 0,
  created_at timestamptz not null default now()
);

create table if not exists public.proofs (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid not null references public.profiles (id) on delete cascade,
  interview_id uuid references public.interviews (id) on delete set null,
  storage_path text not null,
  source text not null default 'upload',
  message_id text not null default '',
  from_addr text not null default '',
  from_domain text not null default '',
  subject text not null default '',
  dkim_pass boolean,
  spf_pass boolean,
  authentic boolean not null default false,
  parse_note text not null default '',
  created_at timestamptz not null default now()
);

do $$
begin
  if not exists (
    select 1 from pg_constraint
    where conname = 'proofs_source_check'
      and conrelid = 'public.proofs'::regclass
  ) then
    alter table public.proofs
      add constraint proofs_source_check
      check (source in ('upload', 'inbound'));
  end if;
end $$;

create index if not exists sites_profile_idx on public.sites (profile_id, sort);
create index if not exists proofs_profile_idx on public.proofs (profile_id, created_at desc);
create index if not exists proofs_interview_idx on public.proofs (interview_id);

alter table public.sites enable row level security;
alter table public.proofs enable row level security;

drop policy if exists sites_own on public.sites;
create policy sites_own on public.sites
  for all
  to authenticated
  using (profile_id = (select auth.uid()))
  with check (profile_id = (select auth.uid()));

drop policy if exists sites_hiring_read on public.sites;
create policy sites_hiring_read on public.sites
  for select
  to authenticated
  using (
    exists (
      select 1 from public.profiles owner
      where owner.id = sites.profile_id
        and owner.role = 'creative'
        and owner.onboarded = true
    )
    and public.is_hiring()
  );

-- Proof files stay with the candidate. Hiring never reads them.
drop policy if exists proofs_own on public.proofs;
create policy proofs_own on public.proofs
  for all
  to authenticated
  using (profile_id = (select auth.uid()))
  with check (profile_id = (select auth.uid()));

insert into storage.buckets (id, name, public)
values ('avatars', 'avatars', true)
on conflict (id) do update set public = true;

insert into storage.buckets (id, name, public)
values ('proofs', 'proofs', false)
on conflict (id) do update set public = false;

drop policy if exists avatars_upload_own on storage.objects;
create policy avatars_upload_own
on storage.objects for insert to authenticated
with check (
  bucket_id = 'avatars'
  and split_part(name, '/', 1) = (select auth.uid())::text
);

drop policy if exists avatars_update_own on storage.objects;
create policy avatars_update_own
on storage.objects for update to authenticated
using (
  bucket_id = 'avatars'
  and split_part(name, '/', 1) = (select auth.uid())::text
);

drop policy if exists avatars_delete_own on storage.objects;
create policy avatars_delete_own
on storage.objects for delete to authenticated
using (
  bucket_id = 'avatars'
  and split_part(name, '/', 1) = (select auth.uid())::text
);

drop policy if exists avatars_public_read on storage.objects;
create policy avatars_public_read
on storage.objects for select
using (bucket_id = 'avatars');

drop policy if exists proofs_upload_own on storage.objects;
create policy proofs_upload_own
on storage.objects for insert to authenticated
with check (
  bucket_id = 'proofs'
  and split_part(name, '/', 1) = (select auth.uid())::text
);

drop policy if exists proofs_update_own on storage.objects;
create policy proofs_update_own
on storage.objects for update to authenticated
using (
  bucket_id = 'proofs'
  and split_part(name, '/', 1) = (select auth.uid())::text
);

drop policy if exists proofs_delete_own on storage.objects;
create policy proofs_delete_own
on storage.objects for delete to authenticated
using (
  bucket_id = 'proofs'
  and split_part(name, '/', 1) = (select auth.uid())::text
);

drop policy if exists proofs_read_own on storage.objects;
create policy proofs_read_own
on storage.objects for select to authenticated
using (
  bucket_id = 'proofs'
  and split_part(name, '/', 1) = (select auth.uid())::text
);

grant select, insert, update, delete on public.sites to authenticated;
grant select, insert, update, delete on public.proofs to authenticated;
