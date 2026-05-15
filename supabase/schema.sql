create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text not null,
  username text unique not null,
  email text unique not null,
  role text not null default 'user' check (role in ('user', 'admin')),
  seller_enabled boolean not null default false,
  kyc_status text not null default 'not_started' check (kyc_status in ('not_started', 'pending', 'approved', 'rejected')),
  created_at timestamp with time zone not null default now()
);

alter table public.profiles add column if not exists seller_enabled boolean not null default false;
update public.profiles set seller_enabled = true where role = 'seller';
update public.profiles set role = 'user' where role = 'seller';
alter table public.profiles alter column role set default 'user';
alter table public.profiles drop constraint if exists profiles_role_check;
alter table public.profiles add constraint profiles_role_check check (role in ('user', 'admin'));

create table if not exists public.kyc_submissions (
  id uuid primary key default gen_random_uuid(),
  seller_id uuid not null references public.profiles(id) on delete cascade,
  full_name text not null,
  document_type text not null,
  document_number text not null,
  status text not null default 'pending' check (status in ('pending', 'approved', 'rejected')),
  created_at timestamp with time zone not null default now()
);

create table if not exists public.listings (
  id uuid primary key default gen_random_uuid(),
  seller_id uuid not null references public.profiles(id) on delete cascade,
  game text not null,
  title text not null,
  description text not null,
  price numeric not null,
  platform text not null,
  account_level text not null,
  login_method text not null,
  extra_notes text,
  status text not null default 'pending_review' check (status in ('draft', 'pending_review', 'approved', 'rejected', 'sold')),
  created_at timestamp with time zone not null default now()
);

create table if not exists public.orders (
  id uuid primary key default gen_random_uuid(),
  buyer_name text not null,
  buyer_email text not null,
  seller_id uuid not null references public.profiles(id) on delete cascade,
  listing_id uuid not null references public.listings(id) on delete cascade,
  amount numeric not null,
  status text not null default 'pending' check (status in ('pending', 'processing', 'completed', 'cancelled')),
  created_at timestamp with time zone not null default now()
);

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (
    id,
    full_name,
    username,
    email,
    role,
    seller_enabled,
    kyc_status
  )
  values (
    new.id,
    coalesce(new.raw_user_meta_data ->> 'full_name', split_part(new.email, '@', 1)),
    coalesce(new.raw_user_meta_data ->> 'username', 'user_' || left(new.id::text, 8)),
    new.email,
    coalesce(new.raw_user_meta_data ->> 'role', 'user'),
    coalesce((new.raw_user_meta_data ->> 'seller_enabled')::boolean, false),
    coalesce(new.raw_user_meta_data ->> 'kyc_status', 'not_started')
  )
  on conflict (id) do nothing;

  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

alter table public.profiles enable row level security;
alter table public.kyc_submissions enable row level security;
alter table public.listings enable row level security;
alter table public.orders enable row level security;

create policy "profiles readable by authenticated users"
  on public.profiles
  for select
  to authenticated
  using (true);

create policy "users can update their own profile"
  on public.profiles
  for update
  to authenticated
  using (auth.uid() = id)
  with check (auth.uid() = id);

create policy "sellers can insert their own kyc submission"
  on public.kyc_submissions
  for insert
  to authenticated
  with check (auth.uid() = seller_id);

create policy "authenticated users can read kyc submissions"
  on public.kyc_submissions
  for select
  to authenticated
  using (true);

create policy "authenticated users can update kyc submissions"
  on public.kyc_submissions
  for update
  to authenticated
  using (true)
  with check (true);

create policy "sellers can insert their own listings"
  on public.listings
  for insert
  to authenticated
  with check (auth.uid() = seller_id);

create policy "authenticated users can read listings"
  on public.listings
  for select
  to authenticated
  using (true);

create policy "authenticated users can update listings"
  on public.listings
  for update
  to authenticated
  using (true)
  with check (true);

create policy "authenticated users can read orders"
  on public.orders
  for select
  to authenticated
  using (true);

create policy "authenticated users can insert orders"
  on public.orders
  for insert
  to authenticated
  with check (true);
