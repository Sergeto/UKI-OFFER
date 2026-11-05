-- Firme (tenants), membri, logo-uri. Fiecare rând e legat de o firmă; RLS separă firmele între ele.
create table public.organizations (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  cui text,
  reg_com text,
  address text,
  county text,
  city text,
  vat_payer boolean,
  phone text,
  email text,
  logo_path text,
  brand_primary text,
  brand_secondary text,
  onboarding_step int not null default 2,
  created_by uuid not null default auth.uid() references auth.users(id) on delete cascade,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.organization_members (
  organization_id uuid not null references public.organizations(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  role text not null default 'owner' check (role in ('owner','admin','member')),
  created_at timestamptz not null default now(),
  primary key (organization_id, user_id)
);
create index on public.organization_members(user_id);

alter table public.organizations enable row level security;
alter table public.organization_members enable row level security;

create or replace function public.is_org_member(org uuid)
returns boolean language sql stable security definer set search_path = '' as $$
  select exists (select 1 from public.organization_members m
                 where m.organization_id = org and m.user_id = (select auth.uid()));
$$;
create or replace function public.is_org_admin(org uuid)
returns boolean language sql stable security definer set search_path = '' as $$
  select exists (select 1 from public.organization_members m
                 where m.organization_id = org and m.user_id = (select auth.uid())
                   and m.role in ('owner','admin'));
$$;
revoke execute on function public.is_org_member(uuid) from anon, public;
revoke execute on function public.is_org_admin(uuid) from anon, public;
grant execute on function public.is_org_member(uuid) to authenticated;
grant execute on function public.is_org_admin(uuid) to authenticated;

create or replace function public.add_creator_as_owner()
returns trigger language plpgsql security definer set search_path = '' as $$
begin
  insert into public.organization_members(organization_id, user_id, role)
  values (new.id, new.created_by, 'owner');
  return new;
end $$;
revoke execute on function public.add_creator_as_owner() from anon, authenticated, public;
create trigger organizations_add_owner after insert on public.organizations
  for each row execute function public.add_creator_as_owner();

create or replace function public.touch_updated_at()
returns trigger language plpgsql set search_path = '' as $$
begin new.updated_at = now(); return new; end $$;
create trigger organizations_touch before update on public.organizations
  for each row execute function public.touch_updated_at();

create policy "membrii vad firma" on public.organizations for select to authenticated
  using (public.is_org_member(id) or created_by = (select auth.uid()));
create policy "utilizatorul isi creeaza firma" on public.organizations for insert to authenticated
  with check (created_by = (select auth.uid()));
create policy "adminii modifica firma" on public.organizations for update to authenticated
  using (public.is_org_admin(id)) with check (public.is_org_admin(id));
create policy "membrii vad colegii" on public.organization_members for select to authenticated
  using (public.is_org_member(organization_id));

-- Logo-uri: calea este <org_id>/logo-<timestamp>.<ext>
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('logos', 'logos', true, 5242880, array['image/png','image/jpeg','image/svg+xml','image/webp']);

create policy "adminii incarca logo" on storage.objects for insert to authenticated
  with check (bucket_id = 'logos' and public.is_org_admin(((storage.foldername(name))[1])::uuid));
create policy "adminii inlocuiesc logo" on storage.objects for update to authenticated
  using (bucket_id = 'logos' and public.is_org_admin(((storage.foldername(name))[1])::uuid));
create policy "adminii sterg logo" on storage.objects for delete to authenticated
  using (bucket_id = 'logos' and public.is_org_admin(((storage.foldername(name))[1])::uuid));
