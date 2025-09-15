-- Enable RLS and define explicit policies
-- Countries: public read, mutations only allowed for service role

-- Ensure table exists (idempotent safety)
create table if not exists countries (
  id uuid primary key default gen_random_uuid(),
  iso_code varchar(2) unique not null,
  name varchar(100) not null,
  currency_code varchar(3) not null,
  date_format varchar(20) not null default 'DD/MM/YYYY',
  is_active boolean default true
);

-- Enable RLS on countries
alter table countries enable row level security;

-- Drop older policies if present to avoid duplicates
drop policy if exists countries_public_select on countries;
drop policy if exists countries_service_insert on countries;
drop policy if exists countries_service_update on countries;
drop policy if exists countries_service_delete on countries;

-- Public can read active and inactive countries (read-only data)
create policy countries_public_select
  on countries for select
  to public
  using (true);

-- Only service role may insert/update/delete
create policy countries_service_insert
  on countries for insert
  to public
  with check (auth.role() = 'service_role');

create policy countries_service_update
  on countries for update
  to public
  using (auth.role() = 'service_role')
  with check (auth.role() = 'service_role');

create policy countries_service_delete
  on countries for delete
  to public
  using (auth.role() = 'service_role');

-- Profiles: explicit owner-only policies
alter table profiles enable row level security;

drop policy if exists profiles_is_owner on profiles;
drop policy if exists profiles_select_owner on profiles;
drop policy if exists profiles_insert_owner on profiles;
drop policy if exists profiles_update_owner on profiles;
drop policy if exists profiles_delete_owner on profiles;

create policy profiles_select_owner
  on profiles for select
  using (auth.uid() = id);

create policy profiles_insert_owner
  on profiles for insert
  with check (auth.uid() = id);

create policy profiles_update_owner
  on profiles for update
  using (auth.uid() = id)
  with check (auth.uid() = id);

create policy profiles_delete_owner
  on profiles for delete
  using (auth.uid() = id);

-- Contracts: explicit owner-only policies
alter table contracts enable row level security;

drop policy if exists contracts_is_owner_select on contracts;
drop policy if exists contracts_is_owner_modification on contracts;
drop policy if exists contracts_select_owner on contracts;
drop policy if exists contracts_insert_owner on contracts;
drop policy if exists contracts_update_owner on contracts;
drop policy if exists contracts_delete_owner on contracts;

create policy contracts_select_owner
  on contracts for select
  using (auth.uid() = user_id);

create policy contracts_insert_owner
  on contracts for insert
  with check (auth.uid() = user_id);

create policy contracts_update_owner
  on contracts for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy contracts_delete_owner
  on contracts for delete
  using (auth.uid() = user_id);


