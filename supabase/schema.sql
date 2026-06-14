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
alter table public.orders add column if not exists escrow_status text not null default 'not_started';
alter table public.orders add column if not exists seller_hold_expires_at timestamp with time zone;
alter table public.orders add column if not exists seller_released_at timestamp with time zone;
alter table public.orders add column if not exists seller_released_by uuid references public.profiles(id) on delete set null;
alter table public.orders drop constraint if exists orders_payment_status_check;
alter table public.orders add constraint orders_payment_status_check
  check (payment_status in ('pending', 'successful', 'failed'));
alter table public.orders drop constraint if exists orders_escrow_status_check;
alter table public.orders add constraint orders_escrow_status_check
  check (escrow_status in ('not_started', 'holding', 'released', 'refunded', 'disputed'));
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

create table if not exists public.wallets (
  profile_id uuid primary key references public.profiles(id) on delete cascade,
  available_balance numeric(12, 2) not null default 0 check (available_balance >= 0),
  pending_balance numeric(12, 2) not null default 0 check (pending_balance >= 0),
  total_earned numeric(12, 2) not null default 0 check (total_earned >= 0),
  total_deposited numeric(12, 2) not null default 0 check (total_deposited >= 0),
  total_withdrawn numeric(12, 2) not null default 0 check (total_withdrawn >= 0),
  created_at timestamp with time zone not null default now(),
  updated_at timestamp with time zone not null default now()
);

alter table public.wallets add column if not exists available_balance numeric(12, 2) not null default 0;
alter table public.wallets add column if not exists pending_balance numeric(12, 2) not null default 0;
alter table public.wallets add column if not exists total_earned numeric(12, 2) not null default 0;
alter table public.wallets add column if not exists total_deposited numeric(12, 2) not null default 0;
alter table public.wallets add column if not exists total_withdrawn numeric(12, 2) not null default 0;
alter table public.wallets add column if not exists updated_at timestamp with time zone not null default now();
alter table public.wallets alter column available_balance type numeric(18, 2);
alter table public.wallets alter column pending_balance type numeric(18, 2);
alter table public.wallets alter column total_earned type numeric(18, 2);
alter table public.wallets alter column total_deposited type numeric(18, 2);
alter table public.wallets alter column total_withdrawn type numeric(18, 2);
alter table public.wallets drop constraint if exists wallets_available_balance_check;
alter table public.wallets add constraint wallets_available_balance_check check (available_balance >= 0);
alter table public.wallets drop constraint if exists wallets_pending_balance_check;
alter table public.wallets add constraint wallets_pending_balance_check check (pending_balance >= 0);
alter table public.wallets drop constraint if exists wallets_total_earned_check;
alter table public.wallets add constraint wallets_total_earned_check check (total_earned >= 0);
alter table public.wallets drop constraint if exists wallets_total_deposited_check;
alter table public.wallets add constraint wallets_total_deposited_check check (total_deposited >= 0);
alter table public.wallets drop constraint if exists wallets_total_withdrawn_check;
alter table public.wallets add constraint wallets_total_withdrawn_check check (total_withdrawn >= 0);

insert into public.wallets (profile_id)
select profile.id
from public.profiles as profile
on conflict (profile_id) do nothing;

create table if not exists public.wallet_transactions (
  id uuid primary key default gen_random_uuid(),
  wallet_profile_id uuid not null references public.wallets(profile_id) on delete cascade,
  type text not null check (
    type in (
      'deposit',
      'purchase_hold',
      'seller_pending_earning',
      'seller_release',
      'withdrawal_request',
      'withdrawal_paid',
      'withdrawal_rejected',
      'refund',
      'admin_adjustment'
    )
  ),
  direction text not null check (direction in ('credit', 'debit')),
  balance_bucket text not null default 'available' check (balance_bucket in ('available', 'pending', 'external')),
  status text not null default 'completed' check (status in ('pending', 'completed', 'failed', 'cancelled')),
  amount numeric(12, 2) not null check (amount > 0),
  order_id uuid references public.orders(id) on delete set null,
  listing_id uuid references public.listings(id) on delete set null,
  payment_reference text not null default '',
  description text not null default '',
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamp with time zone not null default now()
);

alter table public.wallet_transactions add column if not exists order_id uuid references public.orders(id) on delete set null;
alter table public.wallet_transactions add column if not exists listing_id uuid references public.listings(id) on delete set null;
alter table public.wallet_transactions add column if not exists payment_reference text not null default '';
alter table public.wallet_transactions add column if not exists description text not null default '';
alter table public.wallet_transactions add column if not exists metadata jsonb not null default '{}'::jsonb;
alter table public.wallet_transactions alter column amount type numeric(18, 2);
alter table public.wallet_transactions drop constraint if exists wallet_transactions_type_check;
alter table public.wallet_transactions add constraint wallet_transactions_type_check
  check (
    type in (
      'deposit',
      'purchase_hold',
      'seller_pending_earning',
      'seller_release',
      'withdrawal_request',
      'withdrawal_paid',
      'withdrawal_rejected',
      'refund',
      'admin_adjustment'
    )
  );
alter table public.wallet_transactions drop constraint if exists wallet_transactions_direction_check;
alter table public.wallet_transactions add constraint wallet_transactions_direction_check
  check (direction in ('credit', 'debit'));
alter table public.wallet_transactions drop constraint if exists wallet_transactions_balance_bucket_check;
alter table public.wallet_transactions add constraint wallet_transactions_balance_bucket_check
  check (balance_bucket in ('available', 'pending', 'external'));
alter table public.wallet_transactions drop constraint if exists wallet_transactions_status_check;
alter table public.wallet_transactions add constraint wallet_transactions_status_check
  check (status in ('pending', 'completed', 'failed', 'cancelled'));
alter table public.wallet_transactions drop constraint if exists wallet_transactions_amount_check;
alter table public.wallet_transactions add constraint wallet_transactions_amount_check check (amount > 0);

create table if not exists public.withdrawal_requests (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid not null references public.profiles(id) on delete cascade,
  amount numeric(12, 2) not null check (amount > 0),
  bank_name text not null default '',
  account_number text not null default '',
  account_name text not null default '',
  status text not null default 'pending' check (status in ('pending', 'approved', 'rejected', 'paid', 'cancelled')),
  admin_note text not null default '',
  reviewed_by uuid references public.profiles(id) on delete set null,
  reviewed_at timestamp with time zone,
  paid_at timestamp with time zone,
  created_at timestamp with time zone not null default now()
);

alter table public.withdrawal_requests add column if not exists bank_name text not null default '';
alter table public.withdrawal_requests add column if not exists account_number text not null default '';
alter table public.withdrawal_requests add column if not exists account_name text not null default '';
alter table public.withdrawal_requests add column if not exists admin_note text not null default '';
alter table public.withdrawal_requests add column if not exists reviewed_by uuid references public.profiles(id) on delete set null;
alter table public.withdrawal_requests add column if not exists reviewed_at timestamp with time zone;
alter table public.withdrawal_requests add column if not exists paid_at timestamp with time zone;
alter table public.withdrawal_requests alter column amount type numeric(18, 2);
alter table public.withdrawal_requests drop constraint if exists withdrawal_requests_status_check;
alter table public.withdrawal_requests add constraint withdrawal_requests_status_check
  check (status in ('pending', 'approved', 'rejected', 'paid', 'cancelled'));
alter table public.withdrawal_requests drop constraint if exists withdrawal_requests_amount_check;
alter table public.withdrawal_requests add constraint withdrawal_requests_amount_check check (amount > 0);

create table if not exists public.suspension_appeals (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid not null references public.profiles(id) on delete cascade,
  email text not null,
  phone_number text not null default '',
  appeal_reason text not null,
  status text not null default 'pending' check (status in ('pending', 'reviewed', 'approved', 'rejected')),
  admin_note text not null default '',
  reviewed_by uuid references public.profiles(id) on delete set null,
  reviewed_at timestamp with time zone,
  created_at timestamp with time zone not null default now()
);

alter table public.suspension_appeals add column if not exists email text not null default '';
alter table public.suspension_appeals add column if not exists phone_number text not null default '';
alter table public.suspension_appeals add column if not exists appeal_reason text not null default '';
alter table public.suspension_appeals add column if not exists status text not null default 'pending';
alter table public.suspension_appeals add column if not exists admin_note text not null default '';
alter table public.suspension_appeals add column if not exists reviewed_by uuid references public.profiles(id) on delete set null;
alter table public.suspension_appeals add column if not exists reviewed_at timestamp with time zone;
alter table public.suspension_appeals drop constraint if exists suspension_appeals_status_check;
alter table public.suspension_appeals add constraint suspension_appeals_status_check
  check (status in ('pending', 'reviewed', 'approved', 'rejected'));
alter table public.suspension_appeals drop constraint if exists suspension_appeals_appeal_reason_check;
alter table public.suspension_appeals add constraint suspension_appeals_appeal_reason_check
  check (length(trim(appeal_reason)) >= 20);

create table if not exists public.notifications (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid not null references public.profiles(id) on delete cascade,
  type text not null default 'general',
  title text not null,
  message text not null default '',
  link_path text not null default '',
  metadata jsonb not null default '{}'::jsonb,
  read_at timestamp with time zone,
  created_at timestamp with time zone not null default now()
);

alter table public.notifications add column if not exists type text not null default 'general';
alter table public.notifications add column if not exists link_path text not null default '';
alter table public.notifications add column if not exists metadata jsonb not null default '{}'::jsonb;
alter table public.notifications add column if not exists read_at timestamp with time zone;

create or replace function public.notify_admins(
  notification_type text,
  notification_title text,
  notification_message text,
  notification_link_path text default '',
  notification_metadata jsonb default '{}'::jsonb
)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.notifications (
    profile_id,
    type,
    title,
    message,
    link_path,
    metadata
  )
  select
    admin_profile.id,
    notification_type,
    notification_title,
    notification_message,
    notification_link_path,
    notification_metadata
  from public.profiles as admin_profile
  where admin_profile.role = 'admin';
end;
$$;

create or replace function public.submit_suspension_appeal(
  appeal_email text,
  appeal_phone_number text,
  appeal_reason text
)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  requester_id uuid;
  requester public.profiles%rowtype;
  appeal_id uuid;
begin
  requester_id := auth.uid();

  if requester_id is null then
    raise exception 'You must be signed in to submit an appeal.';
  end if;

  select *
  into requester
  from public.profiles
  where id = requester_id;

  if not found then
    raise exception 'Profile not found.';
  end if;

  if requester.role = 'admin' then
    raise exception 'Admin accounts cannot submit suspension appeals.';
  end if;

  if requester.is_banned is not true then
    raise exception 'Only suspended accounts can submit an appeal.';
  end if;

  if trim(appeal_email) = ''
    or trim(appeal_phone_number) = ''
    or length(trim(appeal_reason)) < 20 then
    raise exception 'Email, phone number, and a detailed appeal reason are required.';
  end if;

  insert into public.suspension_appeals (
    profile_id,
    email,
    phone_number,
    appeal_reason
  )
  values (
    requester_id,
    lower(trim(appeal_email)),
    trim(appeal_phone_number),
    trim(appeal_reason)
  )
  returning id into appeal_id;

  perform public.notify_admins(
    'admin_suspension_appeal',
    'New suspension appeal',
    requester.full_name || ' submitted an account suspension appeal.',
    '/admin/users',
    jsonb_build_object(
      'appeal_id', appeal_id,
      'profile_id', requester_id,
      'email', lower(trim(appeal_email)),
      'phone_number', trim(appeal_phone_number),
      'reason', trim(appeal_reason),
      'ban_reason', requester.banned_reason,
      'banned_at', requester.banned_at
    )
  );

  return appeal_id;
end;
$$;

create or replace function public.ensure_profile_wallet()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.wallets (profile_id)
  values (new.id)
  on conflict (profile_id) do nothing;

  return new;
end;
$$;

drop trigger if exists ensure_profile_wallet_after_insert on public.profiles;
create trigger ensure_profile_wallet_after_insert
  after insert on public.profiles
  for each row execute procedure public.ensure_profile_wallet();

create or replace function public.notify_admins_on_kyc_submission()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  perform public.notify_admins(
    'admin_kyc_submission',
    'New KYC submission',
    new.full_name || ' submitted KYC for review.',
    '/admin/kyc',
    jsonb_build_object(
      'kyc_submission_id', new.id,
      'seller_id', new.seller_id,
      'seller_name', new.full_name,
      'email', new.email,
      'document_type', new.document_type
    )
  );

  return new;
end;
$$;

drop trigger if exists notify_admins_on_kyc_submission_after_insert on public.kyc_submissions;
create trigger notify_admins_on_kyc_submission_after_insert
  after insert on public.kyc_submissions
  for each row execute procedure public.notify_admins_on_kyc_submission();

create or replace function public.notify_admins_on_listing_created()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  perform public.notify_admins(
    'admin_listing_created',
    'New listing created',
    coalesce(nullif(new.seller_name, ''), 'A seller') || ' created ' || new.title || '.',
    '/admin/listings',
    jsonb_build_object(
      'listing_id', new.id,
      'seller_id', new.seller_id,
      'seller_name', new.seller_name,
      'seller_username', new.seller_username,
      'title', new.title,
      'game', new.game,
      'amount', new.price,
      'status', new.status
    )
  );

  return new;
end;
$$;

drop trigger if exists notify_admins_on_listing_created_after_insert on public.listings;
create trigger notify_admins_on_listing_created_after_insert
  after insert on public.listings
  for each row execute procedure public.notify_admins_on_listing_created();

create or replace function public.record_seller_pending_earning(target_order_id uuid)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  paid_order public.orders%rowtype;
  hold_expires_at timestamp with time zone;
begin
  select *
  into paid_order
  from public.orders
  where id = target_order_id
  for update;

  if not found then
    raise exception 'Order not found.';
  end if;

  if paid_order.payment_status <> 'successful'
    or paid_order.status not in ('processing', 'completed') then
    raise exception 'Order payment is not confirmed.';
  end if;

  if paid_order.escrow_status in ('holding', 'released') then
    return;
  end if;

  if auth.uid() is not null
    and auth.uid() is distinct from paid_order.buyer_id
    and not exists (
      select 1
      from public.profiles as admin_profile
      where admin_profile.id = auth.uid()
        and admin_profile.role = 'admin'
    ) then
    raise exception 'Only the buyer or an admin can record this order escrow.';
  end if;

  hold_expires_at := coalesce(paid_order.paid_at, now()) + interval '24 hours';

  insert into public.wallets (profile_id)
  values (paid_order.seller_id)
  on conflict (profile_id) do nothing;

  update public.wallets
  set
    pending_balance = pending_balance + paid_order.amount,
    updated_at = now()
  where profile_id = paid_order.seller_id;

  insert into public.wallet_transactions (
    wallet_profile_id,
    type,
    direction,
    balance_bucket,
    status,
    amount,
    order_id,
    listing_id,
    payment_reference,
    description,
    metadata
  )
  values (
    paid_order.seller_id,
    'seller_pending_earning',
    'credit',
    'pending',
    'completed',
    paid_order.amount,
    paid_order.id,
    paid_order.listing_id,
    paid_order.payment_reference,
    'Sale funds are pending buyer protection release.',
    jsonb_build_object(
      'hold_expires_at', hold_expires_at,
      'listing_title', paid_order.listing_title
    )
  );

  insert into public.notifications (
    profile_id,
    type,
    title,
    message,
    link_path,
    metadata
  )
  values (
    paid_order.seller_id,
    'seller_sale',
    'New sale pending release',
    'A buyer paid for ' || paid_order.listing_title || '. The funds are now in your pending balance.',
    '/seller/orders',
    jsonb_build_object(
      'order_id', paid_order.id,
      'listing_id', paid_order.listing_id,
      'amount', paid_order.amount,
      'hold_expires_at', hold_expires_at
    )
  );

  perform public.notify_admins(
    'admin_order_paid',
    'Order paid',
    'A buyer paid for ' || paid_order.listing_title || '. Funds are now pending release.',
    '/admin/orders',
    jsonb_build_object(
      'order_id', paid_order.id,
      'listing_id', paid_order.listing_id,
      'seller_id', paid_order.seller_id,
      'buyer_id', paid_order.buyer_id,
      'amount', paid_order.amount,
      'hold_expires_at', hold_expires_at
    )
  );

  update public.orders
  set
    escrow_status = 'holding',
    seller_hold_expires_at = hold_expires_at
  where id = paid_order.id;
end;
$$;

create or replace function public.release_seller_earning(target_order_id uuid)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  held_order public.orders%rowtype;
begin
  select *
  into held_order
  from public.orders
  where id = target_order_id
  for update;

  if not found then
    raise exception 'Order not found.';
  end if;

  if not exists (
    select 1
    from public.profiles as admin_profile
    where admin_profile.id = auth.uid()
      and admin_profile.role = 'admin'
  ) then
    raise exception 'Only admins can release seller funds.';
  end if;

  if held_order.payment_status <> 'successful'
    or held_order.status not in ('processing', 'completed')
    or held_order.escrow_status <> 'holding' then
    raise exception 'Order funds are not ready for release.';
  end if;

  insert into public.wallets (profile_id)
  values (held_order.seller_id)
  on conflict (profile_id) do nothing;

  update public.wallets
  set
    pending_balance = greatest(pending_balance - held_order.amount, 0),
    available_balance = available_balance + held_order.amount,
    total_earned = total_earned + held_order.amount,
    updated_at = now()
  where profile_id = held_order.seller_id;

  insert into public.wallet_transactions (
    wallet_profile_id,
    type,
    direction,
    balance_bucket,
    status,
    amount,
    order_id,
    listing_id,
    payment_reference,
    description,
    metadata
  )
  values (
    held_order.seller_id,
    'seller_release',
    'credit',
    'available',
    'completed',
    held_order.amount,
    held_order.id,
    held_order.listing_id,
    held_order.payment_reference,
    'Sale funds released to available balance.',
    jsonb_build_object('listing_title', held_order.listing_title)
  );

  insert into public.notifications (
    profile_id,
    type,
    title,
    message,
    link_path,
    metadata
  )
  values (
    held_order.seller_id,
    'seller_release',
    'Funds released',
    'Funds for ' || held_order.listing_title || ' are now available for withdrawal.',
    '/seller/wallet',
    jsonb_build_object(
      'order_id', held_order.id,
      'listing_id', held_order.listing_id,
      'amount', held_order.amount
    )
  );

  update public.orders
  set
    escrow_status = 'released',
    seller_released_at = now(),
    seller_released_by = auth.uid()
  where id = held_order.id;
end;
$$;

create or replace function public.submit_withdrawal_request(
  withdrawal_amount numeric,
  withdrawal_bank_name text,
  withdrawal_account_number text,
  withdrawal_account_name text
)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  requester_id uuid;
  request_id uuid;
begin
  requester_id := auth.uid();

  if requester_id is null then
    raise exception 'You must be signed in to request a withdrawal.';
  end if;

  if withdrawal_amount <= 0 then
    raise exception 'Withdrawal amount must be greater than zero.';
  end if;

  if trim(withdrawal_bank_name) = ''
    or trim(withdrawal_account_number) = ''
    or trim(withdrawal_account_name) = '' then
    raise exception 'Bank details are required.';
  end if;

  insert into public.wallets (profile_id)
  values (requester_id)
  on conflict (profile_id) do nothing;

  update public.wallets
  set
    available_balance = available_balance - withdrawal_amount,
    updated_at = now()
  where profile_id = requester_id
    and available_balance >= withdrawal_amount;

  if not found then
    raise exception 'Insufficient available balance.';
  end if;

  insert into public.withdrawal_requests (
    profile_id,
    amount,
    bank_name,
    account_number,
    account_name
  )
  values (
    requester_id,
    withdrawal_amount,
    trim(withdrawal_bank_name),
    trim(withdrawal_account_number),
    trim(withdrawal_account_name)
  )
  returning id into request_id;

  insert into public.wallet_transactions (
    wallet_profile_id,
    type,
    direction,
    balance_bucket,
    status,
    amount,
    description,
    metadata
  )
  values (
    requester_id,
    'withdrawal_request',
    'debit',
    'available',
    'pending',
    withdrawal_amount,
    'Withdrawal request submitted.',
    jsonb_build_object('withdrawal_request_id', request_id)
  );

  insert into public.notifications (
    profile_id,
    type,
    title,
    message,
    link_path,
    metadata
  )
  values (
    requester_id,
    'withdrawal_request',
    'Withdrawal request submitted',
    'Your withdrawal request is waiting for admin review.',
    '/seller/withdrawals',
    jsonb_build_object('withdrawal_request_id', request_id, 'amount', withdrawal_amount)
  );

  perform public.notify_admins(
    'admin_withdrawal_request',
    'New withdrawal request',
    'A seller requested a withdrawal.',
    '/admin/withdrawals',
    jsonb_build_object(
      'withdrawal_request_id', request_id,
      'profile_id', requester_id,
      'amount', withdrawal_amount,
      'bank_name', trim(withdrawal_bank_name),
      'account_name', trim(withdrawal_account_name)
    )
  );

  return request_id;
end;
$$;

create or replace function public.reject_withdrawal_request(
  target_withdrawal_id uuid,
  rejection_note text
)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  withdrawal public.withdrawal_requests%rowtype;
begin
  if not exists (
    select 1
    from public.profiles as admin_profile
    where admin_profile.id = auth.uid()
      and admin_profile.role = 'admin'
  ) then
    raise exception 'Only admins can reject withdrawals.';
  end if;

  select *
  into withdrawal
  from public.withdrawal_requests
  where id = target_withdrawal_id
  for update;

  if not found then
    raise exception 'Withdrawal request not found.';
  end if;

  if withdrawal.status <> 'pending' then
    raise exception 'Only pending withdrawals can be rejected.';
  end if;

  update public.wallets
  set
    available_balance = available_balance + withdrawal.amount,
    updated_at = now()
  where profile_id = withdrawal.profile_id;

  update public.withdrawal_requests
  set
    status = 'rejected',
    admin_note = coalesce(nullif(trim(rejection_note), ''), 'Rejected by admin.'),
    reviewed_by = auth.uid(),
    reviewed_at = now()
  where id = withdrawal.id;

  insert into public.wallet_transactions (
    wallet_profile_id,
    type,
    direction,
    balance_bucket,
    status,
    amount,
    description,
    metadata
  )
  values (
    withdrawal.profile_id,
    'withdrawal_rejected',
    'credit',
    'available',
    'completed',
    withdrawal.amount,
    'Withdrawal request rejected and returned to available balance.',
    jsonb_build_object('withdrawal_request_id', withdrawal.id)
  );

  insert into public.notifications (
    profile_id,
    type,
    title,
    message,
    link_path,
    metadata
  )
  values (
    withdrawal.profile_id,
    'withdrawal_rejected',
    'Withdrawal rejected',
    'Your withdrawal request was rejected: ' || coalesce(nullif(trim(rejection_note), ''), 'Rejected by admin.'),
    '/seller/withdrawals',
    jsonb_build_object(
      'withdrawal_request_id',
      withdrawal.id,
      'amount',
      withdrawal.amount,
      'reason',
      coalesce(nullif(trim(rejection_note), ''), 'Rejected by admin.')
    )
  );
end;
$$;

create or replace function public.mark_withdrawal_paid(target_withdrawal_id uuid)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  withdrawal public.withdrawal_requests%rowtype;
begin
  if not exists (
    select 1
    from public.profiles as admin_profile
    where admin_profile.id = auth.uid()
      and admin_profile.role = 'admin'
  ) then
    raise exception 'Only admins can mark withdrawals paid.';
  end if;

  select *
  into withdrawal
  from public.withdrawal_requests
  where id = target_withdrawal_id
  for update;

  if not found then
    raise exception 'Withdrawal request not found.';
  end if;

  if withdrawal.status not in ('pending', 'approved') then
    raise exception 'This withdrawal cannot be marked paid.';
  end if;

  update public.wallets
  set
    total_withdrawn = total_withdrawn + withdrawal.amount,
    updated_at = now()
  where profile_id = withdrawal.profile_id;

  update public.withdrawal_requests
  set
    status = 'paid',
    reviewed_by = auth.uid(),
    reviewed_at = coalesce(reviewed_at, now()),
    paid_at = now()
  where id = withdrawal.id;

  insert into public.wallet_transactions (
    wallet_profile_id,
    type,
    direction,
    balance_bucket,
    status,
    amount,
    description,
    metadata
  )
  values (
    withdrawal.profile_id,
    'withdrawal_paid',
    'debit',
    'external',
    'completed',
    withdrawal.amount,
    'Withdrawal paid by admin.',
    jsonb_build_object('withdrawal_request_id', withdrawal.id)
  );

  insert into public.notifications (
    profile_id,
    type,
    title,
    message,
    link_path,
    metadata
  )
  values (
    withdrawal.profile_id,
    'withdrawal_paid',
    'Withdrawal paid',
    'Your withdrawal request has been marked paid.',
    '/seller/withdrawals',
    jsonb_build_object('withdrawal_request_id', withdrawal.id, 'amount', withdrawal.amount)
  );
end;
$$;

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
alter table public.wallets enable row level security;
alter table public.wallet_transactions enable row level security;
alter table public.withdrawal_requests enable row level security;
alter table public.suspension_appeals enable row level security;
alter table public.notifications enable row level security;
alter table public.seller_ratings enable row level security;

drop policy if exists "profiles readable by authenticated users" on public.profiles;
create policy "profiles readable by authenticated users"
  on public.profiles
  for select
  to authenticated
  using (true);

drop policy if exists "users can update their own profile" on public.profiles;
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

drop policy if exists "sellers can insert their own kyc submission" on public.kyc_submissions;
create policy "sellers can insert their own kyc submission"
  on public.kyc_submissions
  for insert
  to authenticated
  with check (auth.uid() = seller_id);

drop policy if exists "authenticated users can read kyc submissions" on public.kyc_submissions;
create policy "authenticated users can read kyc submissions"
  on public.kyc_submissions
  for select
  to authenticated
  using (true);

drop policy if exists "authenticated users can update kyc submissions" on public.kyc_submissions;
create policy "authenticated users can update kyc submissions"
  on public.kyc_submissions
  for update
  to authenticated
  using (true)
  with check (true);

drop policy if exists "sellers can insert their own listings" on public.listings;
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

drop policy if exists "authenticated users can update listings" on public.listings;
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
drop policy if exists "buyers sellers and admins can read relevant orders" on public.orders;
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
drop policy if exists "buyers can insert their own orders" on public.orders;
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

drop policy if exists "users can read their own wallet" on public.wallets;
create policy "users can read their own wallet"
  on public.wallets
  for select
  to authenticated
  using (
    auth.uid() = profile_id
    or exists (
      select 1
      from public.profiles as admin_profile
      where admin_profile.id = auth.uid()
        and admin_profile.role = 'admin'
    )
  );

drop policy if exists "admins can update wallets" on public.wallets;
create policy "admins can update wallets"
  on public.wallets
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

drop policy if exists "users can read their own wallet transactions" on public.wallet_transactions;
create policy "users can read their own wallet transactions"
  on public.wallet_transactions
  for select
  to authenticated
  using (
    auth.uid() = wallet_profile_id
    or exists (
      select 1
      from public.profiles as admin_profile
      where admin_profile.id = auth.uid()
        and admin_profile.role = 'admin'
    )
  );

drop policy if exists "admins can insert wallet transactions" on public.wallet_transactions;
create policy "admins can insert wallet transactions"
  on public.wallet_transactions
  for insert
  to authenticated
  with check (
    exists (
      select 1
      from public.profiles as admin_profile
      where admin_profile.id = auth.uid()
        and admin_profile.role = 'admin'
    )
  );

drop policy if exists "admins can update wallet transactions" on public.wallet_transactions;
create policy "admins can update wallet transactions"
  on public.wallet_transactions
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

drop policy if exists "users can read their own withdrawal requests" on public.withdrawal_requests;
create policy "users can read their own withdrawal requests"
  on public.withdrawal_requests
  for select
  to authenticated
  using (
    auth.uid() = profile_id
    or exists (
      select 1
      from public.profiles as admin_profile
      where admin_profile.id = auth.uid()
        and admin_profile.role = 'admin'
    )
  );

drop policy if exists "users can submit their own withdrawal requests" on public.withdrawal_requests;
create policy "users can submit their own withdrawal requests"
  on public.withdrawal_requests
  for insert
  to authenticated
  with check (auth.uid() = profile_id);

drop policy if exists "users can cancel their pending withdrawal requests" on public.withdrawal_requests;
create policy "users can cancel their pending withdrawal requests"
  on public.withdrawal_requests
  for update
  to authenticated
  using (auth.uid() = profile_id and status = 'pending')
  with check (auth.uid() = profile_id and status = 'cancelled');

drop policy if exists "admins can update withdrawal requests" on public.withdrawal_requests;
create policy "admins can update withdrawal requests"
  on public.withdrawal_requests
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

drop policy if exists "users can read their own suspension appeals" on public.suspension_appeals;
create policy "users can read their own suspension appeals"
  on public.suspension_appeals
  for select
  to authenticated
  using (
    auth.uid() = profile_id
    or exists (
      select 1
      from public.profiles as admin_profile
      where admin_profile.id = auth.uid()
        and admin_profile.role = 'admin'
    )
  );

drop policy if exists "users can submit their own suspension appeals" on public.suspension_appeals;
create policy "users can submit their own suspension appeals"
  on public.suspension_appeals
  for insert
  to authenticated
  with check (
    auth.uid() = profile_id
    and exists (
      select 1
      from public.profiles as suspended_profile
      where suspended_profile.id = auth.uid()
        and suspended_profile.is_banned = true
        and suspended_profile.role <> 'admin'
    )
  );

drop policy if exists "admins can update suspension appeals" on public.suspension_appeals;
create policy "admins can update suspension appeals"
  on public.suspension_appeals
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

drop policy if exists "users can read their own notifications" on public.notifications;
create policy "users can read their own notifications"
  on public.notifications
  for select
  to authenticated
  using (
    auth.uid() = profile_id
    or exists (
      select 1
      from public.profiles as admin_profile
      where admin_profile.id = auth.uid()
        and admin_profile.role = 'admin'
    )
  );

drop policy if exists "users can mark their notifications read" on public.notifications;
create policy "users can mark their notifications read"
  on public.notifications
  for update
  to authenticated
  using (auth.uid() = profile_id)
  with check (auth.uid() = profile_id);

drop policy if exists "admins can insert notifications" on public.notifications;
create policy "admins can insert notifications"
  on public.notifications
  for insert
  to authenticated
  with check (
    exists (
      select 1
      from public.profiles as admin_profile
      where admin_profile.id = auth.uid()
        and admin_profile.role = 'admin'
    )
  );

drop policy if exists "seller ratings readable by everyone" on public.seller_ratings;
create policy "seller ratings readable by everyone"
  on public.seller_ratings
  for select
  to anon, authenticated
  using (true);

drop policy if exists "buyers can insert their own seller ratings" on public.seller_ratings;
create policy "buyers can insert their own seller ratings"
  on public.seller_ratings
  for insert
  to authenticated
  with check (auth.uid() = buyer_id);

drop policy if exists "buyers can update their own seller ratings" on public.seller_ratings;
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
