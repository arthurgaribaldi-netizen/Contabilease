-- Ensure pgcrypto extension for gen_random_uuid
create extension if not exists pgcrypto;

-- Countries table (idempotent)
create table if not exists countries (
  id uuid primary key default gen_random_uuid(),
  iso_code varchar(2) unique not null,
  name varchar(100) not null,
  currency_code varchar(3) not null,
  date_format varchar(20) not null default 'DD/MM/YYYY',
  is_active boolean default true
);

-- Profiles table linked to auth.users
create table if not exists profiles (
  id uuid references auth.users(id) primary key,
  email varchar(255),
  full_name varchar(255),
  country_id uuid references countries(id),
  subscription_tier varchar(20) default 'free',
  created_at timestamptz default now()
);

-- Contracts skeleton: owned by a single user
create table if not exists contracts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  title varchar(200) not null,
  status varchar(20) not null default 'draft',
  currency_code varchar(3),
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Trigger to keep updated_at fresh
create or replace function set_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

drop trigger if exists trg_contracts_updated_at on contracts;
create trigger trg_contracts_updated_at
before update on contracts
for each row execute procedure set_updated_at();

-- Enable RLS
alter table profiles enable row level security;
alter table contracts enable row level security;

-- RLS policies
create policy if not exists "profiles_is_owner" on profiles
  using (auth.uid() = id);

create policy if not exists "contracts_is_owner_select" on contracts
  for select using (auth.uid() = user_id);

create policy if not exists "contracts_is_owner_modification" on contracts
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);


