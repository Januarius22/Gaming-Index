create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text not null,
  username text unique not null,
  email text unique not null,
  role text not null default 'user' check (role in ('user', 'admin')),
  seller_enabled boolean not null default false,
  kyc_status text not null default 'not_started' check (kyc_status in ('not_started', 'pending', 'approved', 'rejected')),
  is_banned boolean not null default false,
  banned_at timestamp with time zone,
  banned_reason text not null default '',
  banned_by uuid references public.profiles(id) on delete set null,
  created_at timestamp with time zone not null default now()
);

alter table public.profiles add column if not exists seller_enabled boolean not null default false;
alter table public.profiles add column if not exists is_banned boolean not null default false;
alter table public.profiles add column if not exists banned_at timestamp with time zone;
alter table public.profiles add column if not exists banned_reason text not null default '';
alter table public.profiles add column if not exists banned_by uuid references public.profiles(id) on delete set null;
update public.profiles set seller_enabled = true where role = 'seller';
update public.profiles set role = 'user' where role = 'seller';
alter table public.profiles alter column role set default 'user';
alter table public.profiles drop constraint if exists profiles_role_check;
alter table public.profiles add constraint profiles_role_check check (role in ('user', 'admin'));

create table if not exists public.kyc_submissions (
  id uuid primary key default gen_random_uuid(),
  seller_id uuid not null references public.profiles(id) on delete cascade,
  full_name text not null,
  email text not null default '',
  username text not null default '',
  phone_number text not null default '',
  date_of_birth date,
  country text not null default '',
  state text not null default '',
  city text not null default '',
  state_city text not null default '',
  residential_address text not null default '',
  document_type text not null,
  document_number text not null,
  document_front_name text not null default '',
  document_front_path text not null default '',
  document_back_name text not null default '',
  document_back_path text not null default '',
  proof_of_address_type text not null default '',
  proof_of_address_name text not null default '',
  proof_of_address_path text not null default '',
  selfie_file_name text not null default '',
  selfie_file_path text not null default '',
  rejection_reason text not null default '',
  doc_clear_confirmed boolean not null default false,
  doc_color_confirmed boolean not null default false,
  doc_corners_confirmed boolean not null default false,
  doc_name_match_confirmed boolean not null default false,
  doc_not_expired_confirmed boolean not null default false,
  selfie_matches_id_confirmed boolean not null default false,
  status text not null default 'pending' check (status in ('pending', 'approved', 'rejected')),
  created_at timestamp with time zone not null default now()
);

alter table public.kyc_submissions add column if not exists email text not null default '';
alter table public.kyc_submissions add column if not exists username text not null default '';
alter table public.kyc_submissions add column if not exists phone_number text not null default '';
alter table public.kyc_submissions add column if not exists date_of_birth date;
alter table public.kyc_submissions add column if not exists country text not null default '';
alter table public.kyc_submissions add column if not exists state text not null default '';
alter table public.kyc_submissions add column if not exists city text not null default '';
alter table public.kyc_submissions add column if not exists state_city text not null default '';
alter table public.kyc_submissions add column if not exists residential_address text not null default '';
alter table public.kyc_submissions add column if not exists document_front_name text not null default '';
alter table public.kyc_submissions add column if not exists document_front_path text not null default '';
alter table public.kyc_submissions add column if not exists document_back_name text not null default '';
alter table public.kyc_submissions add column if not exists document_back_path text not null default '';
alter table public.kyc_submissions add column if not exists proof_of_address_type text not null default '';
alter table public.kyc_submissions add column if not exists proof_of_address_name text not null default '';
alter table public.kyc_submissions add column if not exists proof_of_address_path text not null default '';
alter table public.kyc_submissions add column if not exists selfie_file_name text not null default '';
alter table public.kyc_submissions add column if not exists selfie_file_path text not null default '';
alter table public.kyc_submissions add column if not exists rejection_reason text not null default '';
alter table public.kyc_submissions add column if not exists doc_clear_confirmed boolean not null default false;
alter table public.kyc_submissions add column if not exists doc_color_confirmed boolean not null default false;
alter table public.kyc_submissions add column if not exists doc_corners_confirmed boolean not null default false;
alter table public.kyc_submissions add column if not exists doc_name_match_confirmed boolean not null default false;
alter table public.kyc_submissions add column if not exists doc_not_expired_confirmed boolean not null default false;
alter table public.kyc_submissions add column if not exists selfie_matches_id_confirmed boolean not null default false;

insert into storage.buckets (id, name, public)
values ('kyc-documents', 'kyc-documents', false)
on conflict (id) do nothing;

insert into storage.buckets (id, name, public)
values ('listing-media', 'listing-media', false)
on conflict (id) do nothing;

create table if not exists public.listings (
  id uuid primary key default gen_random_uuid(),
  seller_id uuid not null references public.profiles(id) on delete cascade,
  seller_name text not null default '',
  seller_username text not null default '',
  game text not null,
  title text not null,
  description text not null,
  price numeric not null,
  platform text not null,
  account_level text not null,
  login_method text not null,
  extra_notes text,
  image_names jsonb not null default '[]'::jsonb,
  image_paths jsonb not null default '[]'::jsonb,
  sold_at timestamp with time zone,
  withdrawn_at timestamp with time zone,
  admin_note text not null default '',
  admin_action_at timestamp with time zone,
  admin_action_by uuid references public.profiles(id) on delete set null,
  status text not null default 'approved' check (status in ('draft', 'pending_review', 'approved', 'rejected', 'sold', 'taken_down', 'withdrawn')),
  created_at timestamp with time zone not null default now()
);

alter table public.listings add column if not exists image_names jsonb not null default '[]'::jsonb;
alter table public.listings add column if not exists image_paths jsonb not null default '[]'::jsonb;
alter table public.listings add column if not exists seller_name text not null default '';
alter table public.listings add column if not exists seller_username text not null default '';
alter table public.listings add column if not exists account_level text not null default '';
alter table public.listings add column if not exists login_method text not null default '';
alter table public.listings add column if not exists extra_notes text;
alter table public.listings add column if not exists sold_at timestamp with time zone;
alter table public.listings add column if not exists withdrawn_at timestamp with time zone;
alter table public.listings add column if not exists admin_note text not null default '';
alter table public.listings add column if not exists admin_action_at timestamp with time zone;
alter table public.listings add column if not exists admin_action_by uuid references public.profiles(id) on delete set null;
update public.listings as listing
set
  seller_name = coalesce(profile.full_name, listing.seller_name, ''),
  seller_username = coalesce(profile.username, listing.seller_username, '')
from public.profiles as profile
where profile.id = listing.seller_id
  and (
    listing.seller_name = ''
    or listing.seller_username = ''
  );
update public.listings
set
  image_names = case
    when image_names is null or jsonb_typeof(image_names) <> 'array' then '[]'::jsonb
    when jsonb_array_length(image_names) > 1 then jsonb_build_array(image_names->0)
    else image_names
  end,
  image_paths = case
    when image_paths is null or jsonb_typeof(image_paths) <> 'array' then '[]'::jsonb
    when jsonb_array_length(image_paths) > 1 then jsonb_build_array(image_paths->0)
    else image_paths
  end;
update public.listings
set sold_at = created_at
where status = 'sold'
  and sold_at is null;
alter table public.listings drop constraint if exists listings_status_check;
alter table public.listings add constraint listings_status_check
  check (status in ('draft', 'pending_review', 'approved', 'rejected', 'sold', 'taken_down', 'withdrawn'));
alter table public.listings drop constraint if exists listings_image_names_single_item_check;
alter table public.listings add constraint listings_image_names_single_item_check
  check (jsonb_typeof(image_names) = 'array' and jsonb_array_length(image_names) <= 1);
alter table public.listings drop constraint if exists listings_image_paths_single_item_check;
alter table public.listings add constraint listings_image_paths_single_item_check
  check (jsonb_typeof(image_paths) = 'array' and jsonb_array_length(image_paths) <= 1);
alter table public.listings alter column status set default 'approved';
update public.listings set status = 'approved' where status = 'pending_review';

create table if not exists public.listing_delivery_details (
  id uuid primary key default gen_random_uuid(),
  listing_id uuid not null unique references public.listings(id) on delete cascade,
  seller_id uuid not null references public.profiles(id) on delete cascade,
  account_login_id text not null,
  account_password text not null,
  recovery_details text not null default '',
  transfer_note text not null default '',
  ready_for_release_confirmed boolean not null default false,
  not_personal_confirmed boolean not null default false,
  created_at timestamp with time zone not null default now()
);

alter table public.listing_delivery_details add column if not exists account_login_id text not null default '';
alter table public.listing_delivery_details add column if not exists account_password text not null default '';
alter table public.listing_delivery_details add column if not exists recovery_details text not null default '';
alter table public.listing_delivery_details add column if not exists transfer_note text not null default '';
alter table public.listing_delivery_details add column if not exists ready_for_release_confirmed boolean not null default false;
alter table public.listing_delivery_details add column if not exists not_personal_confirmed boolean not null default false;
alter table public.listing_delivery_details add column if not exists created_at timestamp with time zone not null default now();

create table if not exists public.orders (
  id uuid primary key default gen_random_uuid(),
  buyer_id uuid references public.profiles(id) on delete cascade,
  buyer_name text not null,
  buyer_email text not null,
  buyer_phone text not null default '',
  seller_id uuid not null references public.profiles(id) on delete cascade,
  listing_id uuid not null references public.listings(id) on delete cascade,
  listing_title text not null default '',
  amount numeric not null,
  status text not null default 'pending' check (status in ('pending', 'processing', 'completed', 'cancelled')),
  payment_status text not null default 'pending' check (payment_status in ('pending', 'successful', 'failed')),
  payment_provider text not null default '',
  payment_reference text not null default '',
  payment_channel text not null default '',
  payment_last4 text not null default '',
  paid_at timestamp with time zone,
  created_at timestamp with time zone not null default now()
);

alter table public.orders add column if not exists buyer_id uuid references public.profiles(id) on delete cascade;
alter table public.orders add column if not exists buyer_phone text not null default '';
alter table public.orders add column if not exists listing_title text not null default '';
alter table public.orders add column if not exists payment_status text not null default 'pending';
alter table public.orders add column if not exists payment_provider text not null default '';
alter table public.orders add column if not exists payment_reference text not null default '';
alter table public.orders add column if not exists payment_channel text not null default '';
alter table public.orders add column if not exists payment_last4 text not null default '';
alter table public.orders add column if not exists paid_at timestamp with time zone;
alter table public.orders drop constraint if exists orders_payment_status_check;
alter table public.orders add constraint orders_payment_status_check
  check (payment_status in ('pending', 'successful', 'failed'));
update public.orders as order_row
set buyer_id = profile.id
from public.profiles as profile
where order_row.buyer_id is null
  and lower(profile.email) = lower(order_row.buyer_email);
update public.orders as order_row
set listing_title = coalesce(listing.title, order_row.listing_title, '')
from public.listings as listing
where order_row.listing_id = listing.id
  and order_row.listing_title = '';

create table if not exists public.seller_ratings (
  id uuid primary key default gen_random_uuid(),
  seller_id uuid not null references public.profiles(id) on delete cascade,
  buyer_id uuid not null references public.profiles(id) on delete cascade,
  listing_id uuid references public.listings(id) on delete set null,
  rating integer not null check (rating between 1 and 5),
  review text not null default '',
  created_at timestamp with time zone not null default now(),
  unique (seller_id, buyer_id)
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

create or replace function public.protect_profile_admin_fields()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if auth.uid() = old.id and not exists (
    select 1
    from public.profiles as admin_profile
    where admin_profile.id = auth.uid()
      and admin_profile.role = 'admin'
  ) then
    if
      new.role is distinct from old.role
      or new.kyc_status is distinct from old.kyc_status
      or new.is_banned is distinct from old.is_banned
      or new.banned_at is distinct from old.banned_at
      or new.banned_reason is distinct from old.banned_reason
      or new.banned_by is distinct from old.banned_by
    then
      raise exception 'Only admins can update protected profile fields.';
    end if;
  end if;

  return new;
end;
$$;

drop trigger if exists protect_profile_admin_fields_before_update on public.profiles;
create trigger protect_profile_admin_fields_before_update
  before update on public.profiles
  for each row execute procedure public.protect_profile_admin_fields();

alter table public.profiles enable row level security;
alter table public.kyc_submissions enable row level security;
alter table public.listings enable row level security;
alter table public.listing_delivery_details enable row level security;
alter table public.orders enable row level security;
alter table public.seller_ratings enable row level security;

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

drop policy if exists "admins can update any profile" on public.profiles;
create policy "admins can update any profile"
  on public.profiles
  for update
  to authenticated
  using (
    exists (
      select 1
      from public.profiles as admin_profile
      where admin_profile.id = auth.uid()
        and admin_profile.role = 'admin'
    )
  )
  with check (
    exists (
      select 1
      from public.profiles as admin_profile
      where admin_profile.id = auth.uid()
        and admin_profile.role = 'admin'
    )
  );

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

drop policy if exists "authenticated users can read listings" on public.listings;
create policy "authenticated users can read listings"
  on public.listings
  for select
  to authenticated
  using (true);

drop policy if exists "public can read live marketplace listings" on public.listings;
create policy "public can read live marketplace listings"
  on public.listings
  for select
  to anon
  using (status in ('approved', 'sold', 'pending_review'));

create policy "authenticated users can update listings"
  on public.listings
  for update
  to authenticated
  using (true)
  with check (true);

drop policy if exists "sellers can delete their own listings" on public.listings;
create policy "sellers can delete their own listings"
  on public.listings
  for delete
  to authenticated
  using (auth.uid() = seller_id);

drop policy if exists "admins can delete any listing" on public.listings;
create policy "admins can delete any listing"
  on public.listings
  for delete
  to authenticated
  using (
    exists (
      select 1
      from public.profiles as admin_profile
      where admin_profile.id = auth.uid()
        and admin_profile.role = 'admin'
    )
  );

drop policy if exists "sellers can insert their own listing delivery details" on public.listing_delivery_details;
create policy "sellers can insert their own listing delivery details"
  on public.listing_delivery_details
  for insert
  to authenticated
  with check (auth.uid() = seller_id);

drop policy if exists "sellers can read their own listing delivery details" on public.listing_delivery_details;
create policy "sellers can read their own listing delivery details"
  on public.listing_delivery_details
  for select
  to authenticated
  using (auth.uid() = seller_id);

drop policy if exists "buyers can read paid order delivery details" on public.listing_delivery_details;
create policy "buyers can read paid order delivery details"
  on public.listing_delivery_details
  for select
  to authenticated
  using (
    exists (
      select 1
      from public.orders as buyer_order
      join public.profiles as buyer_profile
        on buyer_profile.email = buyer_order.buyer_email
      where buyer_profile.id = auth.uid()
        and buyer_order.listing_id = public.listing_delivery_details.listing_id
        and buyer_order.status in ('processing', 'completed')
    )
  );

drop policy if exists "admins can read any listing delivery details" on public.listing_delivery_details;
create policy "admins can read any listing delivery details"
  on public.listing_delivery_details
  for select
  to authenticated
  using (
    exists (
      select 1
      from public.profiles as admin_profile
      where admin_profile.id = auth.uid()
        and admin_profile.role = 'admin'
    )
  );

drop policy if exists "sellers can update their own listing delivery details" on public.listing_delivery_details;
create policy "sellers can update their own listing delivery details"
  on public.listing_delivery_details
  for update
  to authenticated
  using (auth.uid() = seller_id)
  with check (auth.uid() = seller_id);

drop policy if exists "authenticated users can read orders" on public.orders;
create policy "buyers sellers and admins can read relevant orders"
  on public.orders
  for select
  to authenticated
  using (
    auth.uid() = buyer_id
    or auth.uid() = seller_id
    or exists (
      select 1
      from public.profiles as buyer_profile
      where buyer_profile.id = auth.uid()
        and lower(buyer_profile.email) = lower(public.orders.buyer_email)
    )
    or exists (
      select 1
      from public.profiles as admin_profile
      where admin_profile.id = auth.uid()
        and admin_profile.role = 'admin'
    )
  );

drop policy if exists "authenticated users can insert orders" on public.orders;
create policy "buyers can insert their own orders"
  on public.orders
  for insert
  to authenticated
  with check (
    auth.uid() = buyer_id
    or exists (
      select 1
      from public.profiles as buyer_profile
      where buyer_profile.id = auth.uid()
        and lower(buyer_profile.email) = lower(public.orders.buyer_email)
    )
  );

drop policy if exists "buyers can update their own orders" on public.orders;
create policy "buyers can update their own orders"
  on public.orders
  for update
  to authenticated
  using (
    auth.uid() = buyer_id
    or exists (
      select 1
      from public.profiles as buyer_profile
      where buyer_profile.id = auth.uid()
        and lower(buyer_profile.email) = lower(public.orders.buyer_email)
    )
  )
  with check (
    auth.uid() = buyer_id
    or exists (
      select 1
      from public.profiles as buyer_profile
      where buyer_profile.id = auth.uid()
        and lower(buyer_profile.email) = lower(public.orders.buyer_email)
    )
  );

drop policy if exists "admins can update any order" on public.orders;
create policy "admins can update any order"
  on public.orders
  for update
  to authenticated
  using (
    exists (
      select 1
      from public.profiles as admin_profile
      where admin_profile.id = auth.uid()
        and admin_profile.role = 'admin'
    )
  )
  with check (
    exists (
      select 1
      from public.profiles as admin_profile
      where admin_profile.id = auth.uid()
        and admin_profile.role = 'admin'
    )
  );

create policy "seller ratings readable by everyone"
  on public.seller_ratings
  for select
  to anon, authenticated
  using (true);

create policy "buyers can insert their own seller ratings"
  on public.seller_ratings
  for insert
  to authenticated
  with check (auth.uid() = buyer_id);

create policy "buyers can update their own seller ratings"
  on public.seller_ratings
  for update
  to authenticated
  using (auth.uid() = buyer_id)
  with check (auth.uid() = buyer_id);

drop policy if exists "authenticated users can upload their own kyc files" on storage.objects;
create policy "authenticated users can upload their own kyc files"
  on storage.objects
  for insert
  to authenticated
  with check (
    bucket_id = 'kyc-documents'
    and auth.uid()::text = (storage.foldername(name))[1]
  );

drop policy if exists "authenticated users can read kyc files" on storage.objects;
create policy "authenticated users can read kyc files"
  on storage.objects
  for select
  to authenticated
  using (bucket_id = 'kyc-documents');

drop policy if exists "authenticated users can delete their own kyc files" on storage.objects;
create policy "authenticated users can delete their own kyc files"
  on storage.objects
  for delete
  to authenticated
  using (
    bucket_id = 'kyc-documents'
    and auth.uid()::text = (storage.foldername(name))[1]
  );

drop policy if exists "authenticated users can upload their own listing media" on storage.objects;
create policy "authenticated users can upload their own listing media"
  on storage.objects
  for insert
  to authenticated
  with check (
    bucket_id = 'listing-media'
    and auth.uid()::text = (storage.foldername(name))[1]
  );

drop policy if exists "anyone can read listing media" on storage.objects;
create policy "anyone can read listing media"
  on storage.objects
  for select
  to anon, authenticated
  using (bucket_id = 'listing-media');

drop policy if exists "authenticated users can delete their own listing media" on storage.objects;
create policy "authenticated users can delete their own listing media"
  on storage.objects
  for delete
  to authenticated
  using (
    bucket_id = 'listing-media'
    and auth.uid()::text = (storage.foldername(name))[1]
  );

drop policy if exists "admins can delete any listing media" on storage.objects;
create policy "admins can delete any listing media"
  on storage.objects
  for delete
  to authenticated
  using (
    bucket_id = 'listing-media'
    and exists (
      select 1
      from public.profiles as admin_profile
      where admin_profile.id = auth.uid()
        and admin_profile.role = 'admin'
    )
  );
