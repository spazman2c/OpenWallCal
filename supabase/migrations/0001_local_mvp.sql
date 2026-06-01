create extension if not exists pgcrypto;

create table if not exists users_local (
  id uuid primary key default gen_random_uuid(),
  email text not null unique,
  name text not null,
  password_hash text not null,
  created_at timestamptz not null default now()
);

create table if not exists households (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  timezone text not null default 'America/New_York',
  week_starts_on text not null default 'sunday',
  created_at timestamptz not null default now()
);

create table if not exists household_members (
  household_id uuid not null references households(id) on delete cascade,
  user_id uuid not null references users_local(id) on delete cascade,
  role text not null default 'owner',
  created_at timestamptz not null default now(),
  primary key (household_id, user_id)
);

create table if not exists sessions_local (
  token_hash text primary key,
  user_id uuid not null references users_local(id) on delete cascade,
  expires_at timestamptz not null,
  created_at timestamptz not null default now()
);

create table if not exists household_invites (
  id uuid primary key default gen_random_uuid(),
  household_id uuid not null references households(id) on delete cascade,
  invited_email text,
  invited_name text,
  role text not null default 'adult',
  token text not null unique,
  accepted_at timestamptz,
  expires_at timestamptz not null default now() + interval '14 days',
  created_at timestamptz not null default now()
);

create table if not exists profiles (
  id uuid primary key default gen_random_uuid(),
  household_id uuid not null references households(id) on delete cascade,
  name text not null,
  color text not null default '#3f7f8f',
  initials text not null,
  emoji text,
  type text not null default 'generic',
  relationship text,
  avatar_url text,
  archived_at timestamptz,
  created_at timestamptz not null default now()
);

create table if not exists events (
  id uuid primary key default gen_random_uuid(),
  household_id uuid not null references households(id) on delete cascade,
  title text not null,
  description text,
  location text,
  starts_at timestamptz not null,
  ends_at timestamptz not null,
  all_day boolean not null default false,
  timezone text not null default 'America/New_York',
  source text not null default 'local',
  profile_ids uuid[] not null default '{}',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists task_series (
  id uuid primary key default gen_random_uuid(),
  household_id uuid not null references households(id) on delete cascade,
  title text not null,
  emoji text,
  description text,
  task_type text not null default 'chore',
  assignment_type text not null default 'profiles',
  assigned_profile_ids uuid[] not null default '{}',
  due_date date,
  due_time time,
  time_of_day text not null default 'any',
  repeat_rule text,
  star_value integer not null default 0,
  status text not null default 'open',
  completed_at timestamptz,
  skipped_at timestamptz,
  claimed_by_profile_id uuid,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists lists (
  id uuid primary key default gen_random_uuid(),
  household_id uuid not null references households(id) on delete cascade,
  title text not null,
  color text not null default '#d97745',
  list_type text not null default 'other',
  hide_from_display boolean not null default false,
  created_at timestamptz not null default now()
);

create table if not exists list_items (
  id uuid primary key default gen_random_uuid(),
  list_id uuid not null references lists(id) on delete cascade,
  household_id uuid not null references households(id) on delete cascade,
  name text not null,
  quantity text,
  unit text,
  section text,
  notes text,
  completed_at timestamptz,
  sort_order integer not null default 0,
  created_at timestamptz not null default now()
);

create table if not exists meal_categories (
  id uuid primary key default gen_random_uuid(),
  household_id uuid not null references households(id) on delete cascade,
  name text not null,
  color text not null default '#8fa58a',
  sort_order integer not null default 0,
  hidden boolean not null default false
);

create table if not exists meals (
  id uuid primary key default gen_random_uuid(),
  household_id uuid not null references households(id) on delete cascade,
  meal_date date not null,
  category text not null default 'Dinner',
  title text not null,
  notes text,
  recipe_id uuid,
  created_at timestamptz not null default now()
);

create table if not exists recipes (
  id uuid primary key default gen_random_uuid(),
  household_id uuid not null references households(id) on delete cascade,
  title text not null,
  category text not null default 'other',
  ingredients jsonb not null default '[]',
  instructions text[] not null default '{}',
  notes text,
  source_url text,
  created_at timestamptz not null default now()
);

create table if not exists devices (
  id uuid primary key default gen_random_uuid(),
  household_id uuid references households(id) on delete cascade,
  name text not null default 'Wall Display',
  room text,
  orientation text not null default 'landscape',
  display_mode text not null default 'home',
  token_hash text,
  pairing_code text unique,
  pairing_expires_at timestamptz,
  allowed_actions jsonb not null default '{"completeTasks": false, "checkLists": false, "switchViews": true}',
  last_seen_at timestamptz,
  revoked_at timestamptz,
  created_at timestamptz not null default now()
);

create table if not exists star_transactions (
  id uuid primary key default gen_random_uuid(),
  household_id uuid not null references households(id) on delete cascade,
  profile_id uuid not null references profiles(id) on delete cascade,
  amount integer not null,
  reason text not null,
  source_id uuid,
  created_at timestamptz not null default now()
);

create table if not exists reward_catalog (
  id uuid primary key default gen_random_uuid(),
  household_id uuid not null references households(id) on delete cascade,
  title text not null,
  description text,
  star_cost integer not null default 0,
  active boolean not null default true,
  created_at timestamptz not null default now()
);

create table if not exists reward_redemptions (
  id uuid primary key default gen_random_uuid(),
  household_id uuid not null references households(id) on delete cascade,
  profile_id uuid not null references profiles(id) on delete cascade,
  reward_id uuid references reward_catalog(id) on delete set null,
  reward_title text not null,
  star_cost integer not null,
  status text not null default 'redeemed',
  created_at timestamptz not null default now()
);

alter table profiles add column if not exists relationship text;
alter table profiles add column if not exists avatar_url text;
alter table households add column if not exists address_text text;
alter table households add column if not exists weather_enabled boolean not null default true;
alter table households add column if not exists temperature_unit text not null default 'F';
alter table households add column if not exists updated_at timestamptz not null default now();
alter table devices add column if not exists sleep_enabled boolean not null default false;
alter table devices add column if not exists sleep_start time;
alter table devices add column if not exists sleep_end time;
alter table devices add column if not exists brightness integer not null default 100;
alter table devices add column if not exists parental_lock_enabled boolean not null default false;
alter table devices add column if not exists parental_lock_mode text not null default 'add_modify';
alter table devices add column if not exists parental_lock_timeout_minutes integer not null default 5;
alter table devices add column if not exists updated_at timestamptz not null default now();

create table if not exists calendar_accounts (
  id uuid primary key default gen_random_uuid(),
  household_id uuid not null references households(id) on delete cascade,
  provider text not null default 'ics',
  account_label text not null,
  external_account_id text,
  sync_mode text not null default 'one_way',
  status text not null default 'active',
  last_synced_at timestamptz,
  last_error text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists calendars (
  id uuid primary key default gen_random_uuid(),
  household_id uuid not null references households(id) on delete cascade,
  calendar_account_id uuid references calendar_accounts(id) on delete cascade,
  provider text not null default 'local',
  external_calendar_id text,
  name text not null,
  color text,
  visible boolean not null default true,
  profile_id uuid references profiles(id) on delete set null,
  read_only boolean not null default false,
  sync_token text,
  ics_url text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists household_invites_token_idx on household_invites(token);
create index if not exists events_household_starts_idx on events(household_id, starts_at);
create index if not exists tasks_household_due_idx on task_series(household_id, due_date);
create index if not exists list_items_household_idx on list_items(household_id, completed_at);
create index if not exists meals_household_date_idx on meals(household_id, meal_date);
create index if not exists devices_token_idx on devices(token_hash) where token_hash is not null;
create index if not exists rewards_household_idx on reward_catalog(household_id, active);
create index if not exists star_transactions_profile_idx on star_transactions(household_id, profile_id, created_at);
create index if not exists calendar_accounts_household_idx on calendar_accounts(household_id, status);
create index if not exists calendars_household_idx on calendars(household_id, provider, visible);
