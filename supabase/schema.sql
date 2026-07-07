create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text not null,
  username text unique not null,
  email text unique not null,
  role text not null default 'user' check (role in ('user', 'admin')),
  seller_enabled boolean not null default false,
  kyc_status text not null default 'not_started' check (kyc_status in ('not_started', 'pending', 'approved', 'rejected')),
  is_banned boolean not null default false,
  seller_strikes integer not null default 0 check (seller_strikes >= 0),
  seller_restricted_until timestamp with time zone,
  seller_restriction_reason text not null default '',
  banned_at timestamp with time zone,
  banned_reason text not null default '',
  banned_by uuid references public.profiles(id) on delete set null,
  created_at timestamp with time zone not null default now()
);

alter table public.profiles add column if not exists seller_enabled boolean not null default false;
alter table public.profiles add column if not exists is_banned boolean not null default false;
alter table public.profiles add column if not exists seller_strikes integer not null default 0;
alter table public.profiles add column if not exists seller_restricted_until timestamp with time zone;
alter table public.profiles add column if not exists seller_restriction_reason text not null default '';
alter table public.profiles add column if not exists banned_at timestamp with time zone;
alter table public.profiles add column if not exists banned_reason text not null default '';
alter table public.profiles add column if not exists banned_by uuid references public.profiles(id) on delete set null;
update public.profiles set seller_enabled = true where role = 'seller';
update public.profiles set role = 'user' where role = 'seller';
alter table public.profiles alter column role set default 'user';
alter table public.profiles drop constraint if exists profiles_role_check;
alter table public.profiles add constraint profiles_role_check check (role in ('user', 'admin'));

create table if not exists public.profile_settings (
  profile_id uuid primary key references public.profiles(id) on delete cascade,
  phone_number text not null default '',
  default_bank_name text not null default '',
  default_account_number text not null default '',
  default_account_name text not null default '',
  notification_preferences jsonb not null default '{}'::jsonb,
  created_at timestamp with time zone not null default now(),
  updated_at timestamp with time zone not null default now()
);

alter table public.profile_settings add column if not exists phone_number text not null default '';
alter table public.profile_settings add column if not exists default_bank_name text not null default '';
alter table public.profile_settings add column if not exists default_account_number text not null default '';
alter table public.profile_settings add column if not exists default_account_name text not null default '';
alter table public.profile_settings add column if not exists notification_preferences jsonb not null default '{}'::jsonb;
alter table public.profile_settings add column if not exists created_at timestamp with time zone not null default now();
alter table public.profile_settings add column if not exists updated_at timestamp with time zone not null default now();
insert into public.profile_settings (profile_id)
select profile.id
from public.profiles as profile
on conflict (profile_id) do nothing;
alter table public.profiles drop constraint if exists profiles_seller_strikes_check;
alter table public.profiles add constraint profiles_seller_strikes_check check (seller_strikes >= 0);

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

insert into storage.buckets (id, name, public)
values ('dispute-evidence', 'dispute-evidence', false)
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
  platform_fee_rate numeric(5, 4) not null default 0.15,
  platform_fee_amount numeric(18, 2) not null default 0,
  seller_payout_amount numeric(18, 2) not null default 0,
  status text not null default 'pending' check (status in ('pending', 'processing', 'completed', 'cancelled')),
  payment_status text not null default 'pending' check (payment_status in ('pending', 'successful', 'failed')),
  payment_provider text not null default '',
  payment_reference text not null default '',
  payment_channel text not null default '',
  payment_last4 text not null default '',
  paid_at timestamp with time zone,
  checkout_expires_at timestamp with time zone,
  created_at timestamp with time zone not null default now()
);

alter table public.orders add column if not exists buyer_id uuid references public.profiles(id) on delete cascade;
alter table public.orders add column if not exists buyer_phone text not null default '';
alter table public.orders add column if not exists listing_title text not null default '';
alter table public.orders add column if not exists platform_fee_rate numeric(5, 4) not null default 0.15;
alter table public.orders add column if not exists platform_fee_amount numeric(18, 2) not null default 0;
alter table public.orders add column if not exists seller_payout_amount numeric(18, 2) not null default 0;
alter table public.orders add column if not exists payment_status text not null default 'pending';
alter table public.orders add column if not exists payment_provider text not null default '';
alter table public.orders add column if not exists payment_reference text not null default '';
alter table public.orders add column if not exists payment_channel text not null default '';
alter table public.orders add column if not exists payment_last4 text not null default '';
alter table public.orders add column if not exists paid_at timestamp with time zone;
alter table public.orders add column if not exists checkout_expires_at timestamp with time zone;
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
alter table public.orders drop constraint if exists orders_platform_fee_rate_check;
alter table public.orders add constraint orders_platform_fee_rate_check
  check (platform_fee_rate >= 0 and platform_fee_rate < 1);
alter table public.orders drop constraint if exists orders_platform_fee_amount_check;
alter table public.orders add constraint orders_platform_fee_amount_check
  check (platform_fee_amount >= 0);
alter table public.orders drop constraint if exists orders_seller_payout_amount_check;
alter table public.orders add constraint orders_seller_payout_amount_check
  check (seller_payout_amount >= 0);
update public.orders
set
  platform_fee_rate = 0,
  platform_fee_amount = 0,
  seller_payout_amount = amount
where payment_status = 'successful'
  and platform_fee_amount = 0
  and seller_payout_amount = 0;
update public.orders
set
  platform_fee_rate = coalesce(nullif(platform_fee_rate, 0), 0.15),
  platform_fee_amount = round(amount * coalesce(nullif(platform_fee_rate, 0), 0.15), 2),
  seller_payout_amount = amount - round(amount * coalesce(nullif(platform_fee_rate, 0), 0.15), 2)
where payment_status <> 'successful'
  and (
    platform_fee_amount = 0
    or seller_payout_amount = 0
  );
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
update public.orders
set checkout_expires_at = created_at + interval '30 minutes'
where status = 'pending'
  and checkout_expires_at is null;
delete from public.orders
where status in ('pending', 'cancelled')
  and payment_status = 'pending'
  and paid_at is null
  and checkout_expires_at is not null
  and checkout_expires_at <= now();

create or replace function public.clear_expired_pending_orders()
returns integer
language plpgsql
security definer
set search_path = public
as $$
declare
  cleared_count integer;
begin
  delete from public.orders
  where status in ('pending', 'cancelled')
    and payment_status = 'pending'
    and paid_at is null
    and checkout_expires_at is not null
    and checkout_expires_at <= now();

  get diagnostics cleared_count = row_count;
  return cleared_count;
end;
$$;

create or replace function public.cancel_expired_pending_orders()
returns integer
language plpgsql
security definer
set search_path = public
as $$
begin
  return public.clear_expired_pending_orders();
end;
$$;

create table if not exists public.disputes (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references public.orders(id) on delete cascade,
  listing_id uuid references public.listings(id) on delete set null,
  buyer_id uuid not null references public.profiles(id) on delete cascade,
  seller_id uuid not null references public.profiles(id) on delete cascade,
  reason text not null,
  details text not null,
  status text not null default 'open' check (status in ('open', 'reviewing', 'resolved', 'rejected', 'refunded')),
  admin_note text not null default '',
  resolution text not null default '',
  opened_by uuid references public.profiles(id) on delete set null,
  reviewed_by uuid references public.profiles(id) on delete set null,
  reviewed_at timestamp with time zone,
  closed_at timestamp with time zone,
  last_message_at timestamp with time zone not null default now(),
  created_at timestamp with time zone not null default now()
);

alter table public.disputes add column if not exists listing_id uuid references public.listings(id) on delete set null;
alter table public.disputes add column if not exists buyer_id uuid references public.profiles(id) on delete cascade;
alter table public.disputes add column if not exists seller_id uuid references public.profiles(id) on delete cascade;
alter table public.disputes add column if not exists reason text not null default '';
alter table public.disputes add column if not exists details text not null default '';
alter table public.disputes add column if not exists status text not null default 'open';
alter table public.disputes add column if not exists admin_note text not null default '';
alter table public.disputes add column if not exists resolution text not null default '';
alter table public.disputes add column if not exists opened_by uuid references public.profiles(id) on delete set null;
alter table public.disputes add column if not exists reviewed_by uuid references public.profiles(id) on delete set null;
alter table public.disputes add column if not exists reviewed_at timestamp with time zone;
alter table public.disputes add column if not exists closed_at timestamp with time zone;
alter table public.disputes add column if not exists last_message_at timestamp with time zone not null default now();
alter table public.disputes drop constraint if exists disputes_status_check;
alter table public.disputes add constraint disputes_status_check
  check (status in ('open', 'reviewing', 'resolved', 'rejected', 'refunded'));
alter table public.disputes drop constraint if exists disputes_details_check;
alter table public.disputes add constraint disputes_details_check
  check (length(trim(details)) >= 20);
update public.disputes
set last_message_at = coalesce(reviewed_at, created_at, now())
where last_message_at is null;

create table if not exists public.dispute_messages (
  id uuid primary key default gen_random_uuid(),
  dispute_id uuid not null references public.disputes(id) on delete cascade,
  sender_id uuid not null references public.profiles(id) on delete cascade,
  sender_role text not null check (sender_role in ('buyer', 'seller', 'admin')),
  message text not null default '',
  created_at timestamp with time zone not null default now()
);

alter table public.dispute_messages add column if not exists sender_role text not null default 'buyer';
alter table public.dispute_messages add column if not exists message text not null default '';
alter table public.dispute_messages drop constraint if exists dispute_messages_sender_role_check;
alter table public.dispute_messages add constraint dispute_messages_sender_role_check
  check (sender_role in ('buyer', 'seller', 'admin'));

create table if not exists public.dispute_message_reads (
  message_id uuid not null references public.dispute_messages(id) on delete cascade,
  profile_id uuid not null references public.profiles(id) on delete cascade,
  read_at timestamp with time zone not null default now(),
  primary key (message_id, profile_id)
);

create table if not exists public.dispute_attachments (
  id uuid primary key default gen_random_uuid(),
  dispute_id uuid not null references public.disputes(id) on delete cascade,
  message_id uuid references public.dispute_messages(id) on delete cascade,
  uploader_id uuid not null references public.profiles(id) on delete cascade,
  file_name text not null default '',
  file_path text not null default '',
  file_type text not null check (file_type in ('image', 'video')),
  duration_seconds numeric(6, 2),
  created_at timestamp with time zone not null default now()
);

alter table public.dispute_attachments add column if not exists message_id uuid references public.dispute_messages(id) on delete cascade;
alter table public.dispute_attachments add column if not exists uploader_id uuid references public.profiles(id) on delete cascade;
alter table public.dispute_attachments add column if not exists file_name text not null default '';
alter table public.dispute_attachments add column if not exists file_path text not null default '';
alter table public.dispute_attachments add column if not exists file_type text not null default 'image';
alter table public.dispute_attachments add column if not exists duration_seconds numeric(6, 2);
alter table public.dispute_attachments drop constraint if exists dispute_attachments_file_type_check;
alter table public.dispute_attachments add constraint dispute_attachments_file_type_check
  check (file_type in ('image', 'video'));
alter table public.dispute_attachments drop constraint if exists dispute_attachments_video_duration_check;
alter table public.dispute_attachments add constraint dispute_attachments_video_duration_check
  check (file_type <> 'video' or duration_seconds is null or duration_seconds <= 15);

create table if not exists public.seller_enforcements (
  id uuid primary key default gen_random_uuid(),
  seller_id uuid not null references public.profiles(id) on delete cascade,
  dispute_id uuid references public.disputes(id) on delete set null,
  action text not null check (action in ('warning', 'temporary_restriction', 'seller_suspension')),
  reason text not null default '',
  strike_count integer not null default 0 check (strike_count >= 0),
  restricted_until timestamp with time zone,
  acknowledged_at timestamp with time zone,
  created_by uuid references public.profiles(id) on delete set null,
  created_at timestamp with time zone not null default now()
);

alter table public.seller_enforcements add column if not exists dispute_id uuid references public.disputes(id) on delete set null;
alter table public.seller_enforcements add column if not exists reason text not null default '';
alter table public.seller_enforcements add column if not exists strike_count integer not null default 0;
alter table public.seller_enforcements add column if not exists restricted_until timestamp with time zone;
alter table public.seller_enforcements add column if not exists acknowledged_at timestamp with time zone;
alter table public.seller_enforcements add column if not exists created_by uuid references public.profiles(id) on delete set null;
alter table public.seller_enforcements drop constraint if exists seller_enforcements_action_check;
alter table public.seller_enforcements add constraint seller_enforcements_action_check
  check (action in ('warning', 'temporary_restriction', 'seller_suspension'));
alter table public.seller_enforcements drop constraint if exists seller_enforcements_strike_count_check;
alter table public.seller_enforcements add constraint seller_enforcements_strike_count_check check (strike_count >= 0);

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

create or replace function public.wallet_reconciliation(target_profile_id uuid)
returns table (
  profile_id uuid,
  available_balance numeric,
  expected_available_balance numeric,
  available_difference numeric,
  pending_balance numeric,
  expected_pending_balance numeric,
  pending_difference numeric
)
language sql
security definer
set search_path = public
as $$
  with ledger as (
    select
      coalesce(
        sum(
          case
            when balance_bucket = 'available'
              and direction = 'credit'
              and status = 'completed' then amount
            when balance_bucket = 'available'
              and direction = 'debit'
              and status in ('pending', 'completed') then -amount
            else 0
          end
        ),
        0
      ) as expected_available_balance,
      coalesce(
        sum(
          case
            when balance_bucket = 'pending'
              and direction = 'credit'
              and status = 'completed' then amount
            when balance_bucket = 'pending'
              and direction = 'debit'
              and status = 'completed' then -amount
            when type = 'seller_release'
              and balance_bucket = 'available'
              and direction = 'credit'
              and status = 'completed' then -amount
            else 0
          end
        ),
        0
      ) as expected_pending_balance
    from public.wallet_transactions
    where wallet_profile_id = target_profile_id
  )
  select
    wallet.profile_id,
    wallet.available_balance,
    ledger.expected_available_balance,
    wallet.available_balance - ledger.expected_available_balance as available_difference,
    wallet.pending_balance,
    ledger.expected_pending_balance,
    wallet.pending_balance - ledger.expected_pending_balance as pending_difference
  from public.wallets as wallet
  cross join ledger
  where wallet.profile_id = target_profile_id;
$$;

create or replace function public.assert_wallet_reconciled(target_profile_id uuid)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  reconciliation record;
begin
  select *
  into reconciliation
  from public.wallet_reconciliation(target_profile_id);

  if not found then
    raise exception 'Wallet not found.';
  end if;

  if abs(reconciliation.available_difference) >= 0.01
    or abs(reconciliation.pending_difference) >= 0.01 then
    raise exception 'Wallet balance does not match transaction ledger.';
  end if;
end;
$$;

revoke all on function public.wallet_reconciliation(uuid) from public, anon, authenticated;
revoke all on function public.assert_wallet_reconciled(uuid) from public, anon, authenticated;

create table if not exists public.withdrawal_requests (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid not null references public.profiles(id) on delete cascade,
  amount numeric(12, 2) not null check (amount > 0),
  bank_name text not null default '',
  account_number text not null default '',
  account_name text not null default '',
  status text not null default 'pending' check (status in ('pending', 'approved', 'rejected', 'paid', 'cancelled')),
  admin_note text not null default '',
  payout_provider text not null default '',
  payout_reference text not null default '',
  payout_proof_name text not null default '',
  payout_proof_path text not null default '',
  paid_note text not null default '',
  reviewed_by uuid references public.profiles(id) on delete set null,
  reviewed_at timestamp with time zone,
  paid_at timestamp with time zone,
  created_at timestamp with time zone not null default now()
);

alter table public.withdrawal_requests add column if not exists bank_name text not null default '';
alter table public.withdrawal_requests add column if not exists account_number text not null default '';
alter table public.withdrawal_requests add column if not exists account_name text not null default '';
alter table public.withdrawal_requests add column if not exists admin_note text not null default '';
alter table public.withdrawal_requests add column if not exists payout_provider text not null default '';
alter table public.withdrawal_requests add column if not exists payout_reference text not null default '';
alter table public.withdrawal_requests add column if not exists payout_proof_name text not null default '';
alter table public.withdrawal_requests add column if not exists payout_proof_path text not null default '';
alter table public.withdrawal_requests add column if not exists paid_note text not null default '';
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

create table if not exists public.site_feedback (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid not null references public.profiles(id) on delete cascade,
  workspace text not null default 'account' check (workspace in ('account', 'seller')),
  category text not null default 'suggestion' check (category in ('bug', 'suggestion', 'payment', 'buyer_experience', 'seller_experience', 'other')),
  rating integer check (rating between 1 and 5),
  message text not null,
  status text not null default 'new' check (status in ('new', 'reviewed', 'planned', 'closed')),
  admin_note text not null default '',
  reviewed_by uuid references public.profiles(id) on delete set null,
  reviewed_at timestamp with time zone,
  created_at timestamp with time zone not null default now()
);

alter table public.site_feedback add column if not exists profile_id uuid references public.profiles(id) on delete cascade;
alter table public.site_feedback add column if not exists workspace text not null default 'account';
alter table public.site_feedback add column if not exists category text not null default 'suggestion';
alter table public.site_feedback add column if not exists rating integer;
alter table public.site_feedback add column if not exists message text not null default '';
alter table public.site_feedback add column if not exists status text not null default 'new';
alter table public.site_feedback add column if not exists admin_note text not null default '';
alter table public.site_feedback add column if not exists reviewed_by uuid references public.profiles(id) on delete set null;
alter table public.site_feedback add column if not exists reviewed_at timestamp with time zone;
alter table public.site_feedback drop constraint if exists site_feedback_workspace_check;
alter table public.site_feedback add constraint site_feedback_workspace_check
  check (workspace in ('account', 'seller'));
alter table public.site_feedback drop constraint if exists site_feedback_category_check;
alter table public.site_feedback add constraint site_feedback_category_check
  check (category in ('bug', 'suggestion', 'payment', 'buyer_experience', 'seller_experience', 'other'));
alter table public.site_feedback drop constraint if exists site_feedback_rating_check;
alter table public.site_feedback add constraint site_feedback_rating_check
  check (rating is null or rating between 1 and 5);
alter table public.site_feedback drop constraint if exists site_feedback_status_check;
alter table public.site_feedback add constraint site_feedback_status_check
  check (status in ('new', 'reviewed', 'planned', 'closed'));
alter table public.site_feedback drop constraint if exists site_feedback_message_check;
alter table public.site_feedback add constraint site_feedback_message_check
  check (length(trim(message)) >= 10);

create table if not exists public.support_tickets (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid not null references public.profiles(id) on delete cascade,
  workspace text not null default 'account' check (workspace in ('account', 'seller')),
  category text not null default 'other' check (category in ('account', 'payment', 'withdrawal', 'listing', 'kyc', 'technical', 'other')),
  subject text not null,
  status text not null default 'open' check (status in ('open', 'in_review', 'resolved', 'closed')),
  last_message_at timestamp with time zone not null default now(),
  closed_at timestamp with time zone,
  created_at timestamp with time zone not null default now()
);

alter table public.support_tickets add column if not exists profile_id uuid references public.profiles(id) on delete cascade;
alter table public.support_tickets add column if not exists workspace text not null default 'account';
alter table public.support_tickets add column if not exists category text not null default 'other';
alter table public.support_tickets add column if not exists subject text not null default '';
alter table public.support_tickets add column if not exists status text not null default 'open';
alter table public.support_tickets add column if not exists last_message_at timestamp with time zone not null default now();
alter table public.support_tickets add column if not exists closed_at timestamp with time zone;
alter table public.support_tickets drop constraint if exists support_tickets_workspace_check;
alter table public.support_tickets add constraint support_tickets_workspace_check
  check (workspace in ('account', 'seller'));
alter table public.support_tickets drop constraint if exists support_tickets_category_check;
alter table public.support_tickets add constraint support_tickets_category_check
  check (category in ('account', 'payment', 'withdrawal', 'listing', 'kyc', 'technical', 'other'));
alter table public.support_tickets drop constraint if exists support_tickets_status_check;
alter table public.support_tickets add constraint support_tickets_status_check
  check (status in ('open', 'in_review', 'resolved', 'closed'));
alter table public.support_tickets drop constraint if exists support_tickets_subject_check;
alter table public.support_tickets add constraint support_tickets_subject_check
  check (length(trim(subject)) >= 4);

create table if not exists public.support_ticket_messages (
  id uuid primary key default gen_random_uuid(),
  ticket_id uuid not null references public.support_tickets(id) on delete cascade,
  sender_id uuid not null references public.profiles(id) on delete cascade,
  sender_role text not null default 'user' check (sender_role in ('user', 'admin')),
  message text not null,
  created_at timestamp with time zone not null default now()
);

alter table public.support_ticket_messages add column if not exists sender_role text not null default 'user';
alter table public.support_ticket_messages add column if not exists message text not null default '';
alter table public.support_ticket_messages drop constraint if exists support_ticket_messages_sender_role_check;
alter table public.support_ticket_messages add constraint support_ticket_messages_sender_role_check
  check (sender_role in ('user', 'admin'));
alter table public.support_ticket_messages drop constraint if exists support_ticket_messages_message_check;
alter table public.support_ticket_messages add constraint support_ticket_messages_message_check
  check (length(trim(message)) >= 2);

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

create or replace function public.notify_current_profile(
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
  if auth.uid() is null then
    raise exception 'You must be signed in to create this notice.';
  end if;

  insert into public.notifications (
    profile_id,
    type,
    title,
    message,
    link_path,
    metadata
  )
  values (
    auth.uid(),
    notification_type,
    notification_title,
    notification_message,
    notification_link_path,
    notification_metadata
  );
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

  insert into public.profile_settings (profile_id)
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
  insert into public.notifications (
    profile_id,
    type,
    title,
    message,
    link_path,
    metadata
  )
  values (
    new.seller_id,
    'kyc_submitted',
    'KYC submitted',
    'Your KYC submission is now under review.',
    '/seller/kyc',
    jsonb_build_object(
      'kyc_submission_id', new.id,
      'seller_id', new.seller_id,
      'document_type', new.document_type
    )
  );

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
  insert into public.notifications (
    profile_id,
    type,
    title,
    message,
    link_path,
    metadata
  )
  values (
    new.seller_id,
    'listing_published',
    'Listing published',
    new.title || ' is now live on the marketplace.',
    '/seller/listings',
    jsonb_build_object(
      'listing_id', new.id,
      'title', new.title,
      'game', new.game,
      'amount', new.price,
      'status', new.status
    )
  );

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

create or replace function public.notify_on_listing_status_change()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if new.status = 'withdrawn' and old.status is distinct from new.status then
    insert into public.notifications (
      profile_id,
      type,
      title,
      message,
      link_path,
      metadata
    )
    values (
      new.seller_id,
      'listing_withdrawn',
      'Listing withdrawn',
      new.title || ' was removed from the marketplace.',
      '/seller/history',
      jsonb_build_object(
        'listing_id', new.id,
        'title', new.title,
        'game', new.game,
        'withdrawn_at', new.withdrawn_at
      )
    );
  end if;

  return new;
end;
$$;

drop trigger if exists notify_on_listing_status_change_after_update on public.listings;
create trigger notify_on_listing_status_change_after_update
  after update of status on public.listings
  for each row execute procedure public.notify_on_listing_status_change();

create or replace function public.submit_order_dispute(
  target_order_id uuid,
  dispute_reason text,
  dispute_details text
)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  requester_id uuid;
  target_order public.orders%rowtype;
  dispute_id uuid;
begin
  requester_id := auth.uid();

  if requester_id is null then
    raise exception 'You must be signed in to open a dispute.';
  end if;

  if trim(dispute_reason) = ''
    or length(trim(dispute_details)) < 20 then
    raise exception 'Select a reason and add dispute details.';
  end if;

  select *
  into target_order
  from public.orders
  where id = target_order_id
  for update;

  if not found then
    raise exception 'Order not found.';
  end if;

  if target_order.buyer_id is distinct from requester_id
    and not exists (
      select 1
      from public.profiles as buyer_profile
      where buyer_profile.id = requester_id
        and lower(buyer_profile.email) = lower(target_order.buyer_email)
    ) then
    raise exception 'Only the buyer can open a dispute for this order.';
  end if;

  if target_order.payment_status <> 'successful'
    or target_order.status not in ('processing', 'completed') then
    raise exception 'Only paid orders can be disputed.';
  end if;

  if exists (
    select 1
    from public.disputes as existing_dispute
    where existing_dispute.order_id = target_order.id
      and existing_dispute.status in ('open', 'reviewing')
  ) then
    raise exception 'A dispute is already open for this order.';
  end if;

  insert into public.disputes (
    order_id,
    listing_id,
    buyer_id,
    seller_id,
    reason,
    details,
    opened_by,
    last_message_at
  )
  values (
    target_order.id,
    target_order.listing_id,
    requester_id,
    target_order.seller_id,
    trim(dispute_reason),
    trim(dispute_details),
    requester_id,
    now()
  )
  returning id into dispute_id;

  insert into public.dispute_messages (
    dispute_id,
    sender_id,
    sender_role,
    message
  )
  values (
    dispute_id,
    requester_id,
    'buyer',
    trim(dispute_details)
  );

  update public.orders
  set escrow_status = 'disputed'
  where id = target_order.id;

  insert into public.notifications (
    profile_id,
    type,
    title,
    message,
    link_path,
    metadata
  )
  values
  (
    requester_id,
    'buyer_dispute_opened',
    'Dispute opened',
    'Your dispute has been sent to admin review.',
    '/account/disputes/' || dispute_id,
    jsonb_build_object(
      'dispute_id', dispute_id,
      'order_id', target_order.id,
      'reason', trim(dispute_reason)
    )
  ),
  (
    target_order.seller_id,
    'seller_dispute_opened',
    'Order dispute opened',
    'A buyer opened a dispute for ' || target_order.listing_title || '.',
    '/seller/disputes/' || dispute_id,
    jsonb_build_object(
      'dispute_id', dispute_id,
      'order_id', target_order.id,
      'listing_id', target_order.listing_id,
      'reason', trim(dispute_reason)
    )
  );

  perform public.notify_admins(
    'admin_dispute_opened',
    'New dispute opened',
    'A buyer opened a dispute for ' || target_order.listing_title || '.',
    '/admin/disputes/' || dispute_id,
    jsonb_build_object(
      'dispute_id', dispute_id,
      'order_id', target_order.id,
      'buyer_id', requester_id,
      'seller_id', target_order.seller_id,
      'listing_id', target_order.listing_id,
      'amount', target_order.amount,
      'reason', trim(dispute_reason),
      'details', trim(dispute_details)
    )
  );

  return dispute_id;
end;
$$;

create or replace function public.send_dispute_message(
  target_dispute_id uuid,
  message_body text default '',
  attachment_file_names text[] default array[]::text[],
  attachment_file_paths text[] default array[]::text[],
  attachment_file_types text[] default array[]::text[],
  attachment_duration_seconds numeric[] default array[]::numeric[]
)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  requester_id uuid;
  dispute_row public.disputes%rowtype;
  sender_role text;
  message_id uuid;
  attachment_count integer;
  attachment_index integer;
  attachment_type text;
  attachment_duration numeric;
begin
  requester_id := auth.uid();

  if requester_id is null then
    raise exception 'You must be signed in to send a message.';
  end if;

  select *
  into dispute_row
  from public.disputes
  where id = target_dispute_id
  for update;

  if not found then
    raise exception 'Dispute not found.';
  end if;

  if dispute_row.status in ('resolved', 'rejected', 'refunded') then
    raise exception 'This dispute is closed.';
  end if;

  if requester_id = dispute_row.buyer_id then
    sender_role := 'buyer';
  elsif requester_id = dispute_row.seller_id then
    sender_role := 'seller';
  elsif exists (
    select 1
    from public.profiles as admin_profile
    where admin_profile.id = requester_id
      and admin_profile.role = 'admin'
  ) then
    sender_role := 'admin';
  else
    raise exception 'You cannot message this dispute.';
  end if;

  attachment_count := coalesce(array_length(attachment_file_paths, 1), 0);

  if trim(coalesce(message_body, '')) = '' and attachment_count = 0 then
    raise exception 'Add a message or evidence.';
  end if;

  if attachment_count <> coalesce(array_length(attachment_file_names, 1), 0)
    or attachment_count <> coalesce(array_length(attachment_file_types, 1), 0) then
    raise exception 'Evidence details are incomplete.';
  end if;

  insert into public.dispute_messages (
    dispute_id,
    sender_id,
    sender_role,
    message
  )
  values (
    dispute_row.id,
    requester_id,
    sender_role,
    trim(coalesce(message_body, ''))
  )
  returning id into message_id;

  for attachment_index in 1..attachment_count loop
    attachment_type := attachment_file_types[attachment_index];
    attachment_duration := attachment_duration_seconds[attachment_index];

    if attachment_type not in ('image', 'video') then
      raise exception 'Evidence file type is invalid.';
    end if;

    if attachment_type = 'video'
      and attachment_duration is not null
      and attachment_duration > 15 then
      raise exception 'Video evidence must be 15 seconds or less.';
    end if;

    if attachment_file_paths[attachment_index] is null
      or attachment_file_paths[attachment_index] = ''
      or split_part(attachment_file_paths[attachment_index], '/', 1) <> requester_id::text then
      raise exception 'Evidence path is invalid.';
    end if;

    insert into public.dispute_attachments (
      dispute_id,
      message_id,
      uploader_id,
      file_name,
      file_path,
      file_type,
      duration_seconds
    )
    values (
      dispute_row.id,
      message_id,
      requester_id,
      coalesce(attachment_file_names[attachment_index], ''),
      attachment_file_paths[attachment_index],
      attachment_type,
      attachment_duration
    );
  end loop;

  update public.disputes
  set
    status = case
      when sender_role = 'admin' and status = 'open' then 'reviewing'
      else status
    end,
    last_message_at = now()
  where id = dispute_row.id;

  if sender_role <> 'buyer' then
    insert into public.notifications (
      profile_id,
      type,
      title,
      message,
      link_path,
      metadata
    )
    values (
      dispute_row.buyer_id,
      'buyer_dispute_message',
      'Dispute update',
      'There is a new message on your dispute case.',
      '/account/disputes/' || dispute_row.id,
      jsonb_build_object('dispute_id', dispute_row.id, 'message_id', message_id)
    );
  end if;

  if sender_role <> 'seller' then
    insert into public.notifications (
      profile_id,
      type,
      title,
      message,
      link_path,
      metadata
    )
    values (
      dispute_row.seller_id,
      'seller_dispute_message',
      'Dispute update',
      'There is a new message on an order dispute.',
      '/seller/disputes/' || dispute_row.id,
      jsonb_build_object('dispute_id', dispute_row.id, 'message_id', message_id)
    );
  end if;

  if sender_role <> 'admin' then
    perform public.notify_admins(
      'admin_dispute_message',
      'Dispute message',
      'A dispute case has a new message.',
      '/admin/disputes/' || dispute_row.id,
      jsonb_build_object('dispute_id', dispute_row.id, 'message_id', message_id)
    );
  end if;

  return message_id;
end;
$$;

create or replace function public.review_order_dispute(
  target_dispute_id uuid,
  next_status text,
  review_note text default ''
)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  dispute_row public.disputes%rowtype;
  linked_order public.orders%rowtype;
  seller_refund_amount numeric;
begin
  if not exists (
    select 1
    from public.profiles as admin_profile
    where admin_profile.id = auth.uid()
      and admin_profile.role = 'admin'
  ) then
    raise exception 'Only admins can review disputes.';
  end if;

  if next_status not in ('reviewing', 'resolved', 'rejected') then
    raise exception 'Invalid dispute status.';
  end if;

  if next_status in ('resolved', 'rejected') and trim(review_note) = '' then
    raise exception 'Add a review note before closing this dispute.';
  end if;

  select *
  into dispute_row
  from public.disputes
  where id = target_dispute_id
  for update;

  if not found then
    raise exception 'Dispute not found.';
  end if;

  if dispute_row.status in ('resolved', 'rejected', 'refunded') then
    raise exception 'This dispute is already closed.';
  end if;

  select *
  into linked_order
  from public.orders
  where id = dispute_row.order_id
  for update;

  update public.disputes
  set
    status = next_status,
    admin_note = case
      when trim(review_note) = '' then admin_note
      else trim(review_note)
    end,
    resolution = case
      when next_status in ('resolved', 'rejected') then trim(review_note)
      else resolution
    end,
    reviewed_by = auth.uid(),
    reviewed_at = now(),
    closed_at = case
      when next_status in ('resolved', 'rejected') then now()
      else closed_at
    end,
    last_message_at = now()
  where id = dispute_row.id;

  insert into public.dispute_messages (
    dispute_id,
    sender_id,
    sender_role,
    message
  )
  values (
    dispute_row.id,
    auth.uid(),
    'admin',
    case
      when trim(review_note) = '' then 'This dispute is now under review.'
      else trim(review_note)
    end
  );

  if next_status in ('resolved', 'rejected') then
    update public.orders
    set escrow_status = case
      when escrow_status = 'disputed' then 'holding'
      else escrow_status
    end
    where id = dispute_row.order_id;
  end if;

  insert into public.notifications (
    profile_id,
    type,
    title,
    message,
    link_path,
    metadata
  )
  values
  (
    dispute_row.buyer_id,
    'buyer_dispute_' || next_status,
    case
      when next_status = 'reviewing' then 'Dispute under review'
      when next_status = 'resolved' then 'Dispute resolved'
      else 'Dispute rejected'
    end,
    case
      when next_status = 'reviewing' then 'Admin is reviewing your dispute.'
      when next_status = 'resolved' then 'Your dispute has been resolved: ' || trim(review_note)
      else 'Your dispute was rejected: ' || trim(review_note)
    end,
    '/account/disputes/' || dispute_row.id,
    jsonb_build_object(
      'dispute_id', dispute_row.id,
      'order_id', dispute_row.order_id,
      'status', next_status,
      'note', trim(review_note)
    )
  ),
  (
    dispute_row.seller_id,
    'seller_dispute_' || next_status,
    case
      when next_status = 'reviewing' then 'Dispute under review'
      when next_status = 'resolved' then 'Dispute resolved'
      else 'Dispute rejected'
    end,
    case
      when next_status = 'reviewing' then 'Admin is reviewing a dispute on your order.'
      when next_status = 'resolved' then 'A dispute on your order was resolved: ' || trim(review_note)
      else 'A dispute on your order was rejected: ' || trim(review_note)
    end,
    '/seller/disputes/' || dispute_row.id,
    jsonb_build_object(
      'dispute_id', dispute_row.id,
      'order_id', dispute_row.order_id,
      'listing_id', dispute_row.listing_id,
      'status', next_status,
      'note', trim(review_note)
    )
  );
end;
$$;

drop function if exists public.refund_order_dispute(uuid, text);
create or replace function public.refund_order_dispute(
  target_dispute_id uuid,
  refund_note text,
  take_listing_down boolean default false
)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  dispute_row public.disputes%rowtype;
  linked_order public.orders%rowtype;
begin
  if not exists (
    select 1
    from public.profiles as admin_profile
    where admin_profile.id = auth.uid()
      and admin_profile.role = 'admin'
  ) then
    raise exception 'Only admins can refund disputes.';
  end if;

  if trim(refund_note) = '' then
    raise exception 'Add a refund note.';
  end if;

  select *
  into dispute_row
  from public.disputes
  where id = target_dispute_id
  for update;

  if not found then
    raise exception 'Dispute not found.';
  end if;

  if dispute_row.status in ('resolved', 'rejected', 'refunded') then
    raise exception 'This dispute is already closed.';
  end if;

  select *
  into linked_order
  from public.orders
  where id = dispute_row.order_id
  for update;

  if not found then
    raise exception 'Order not found.';
  end if;

  if linked_order.payment_status <> 'successful'
    or linked_order.escrow_status not in ('holding', 'disputed') then
    raise exception 'This order is not eligible for refund.';
  end if;

  seller_refund_amount := coalesce(
    nullif(linked_order.seller_payout_amount, 0),
    linked_order.amount - coalesce(linked_order.platform_fee_amount, 0),
    linked_order.amount
  );

  if seller_refund_amount <= 0 then
    raise exception 'Seller payout amount is invalid for this refund.';
  end if;

  insert into public.wallets (profile_id)
  values (dispute_row.buyer_id)
  on conflict (profile_id) do nothing;

  insert into public.wallets (profile_id)
  values (dispute_row.seller_id)
  on conflict (profile_id) do nothing;

  update public.wallets
  set
    available_balance = available_balance + linked_order.amount,
    total_deposited = total_deposited + linked_order.amount,
    updated_at = now()
  where profile_id = dispute_row.buyer_id;

  update public.wallets
  set
    pending_balance = pending_balance - seller_refund_amount,
    updated_at = now()
  where profile_id = dispute_row.seller_id
    and pending_balance >= seller_refund_amount;

  if not found then
    raise exception 'Seller pending balance is lower than the refund amount.';
  end if;

  update public.orders
  set
    status = 'cancelled',
    escrow_status = 'refunded'
  where id = linked_order.id;

  if take_listing_down then
    update public.listings
    set
      status = 'taken_down',
      admin_note = trim(refund_note),
      admin_action_at = now(),
      admin_action_by = auth.uid()
    where id = linked_order.listing_id;
  end if;

  update public.disputes
  set
    status = 'refunded',
    admin_note = trim(refund_note),
    resolution = trim(refund_note),
    reviewed_by = auth.uid(),
    reviewed_at = now(),
    closed_at = now(),
    last_message_at = now()
  where id = dispute_row.id;

  insert into public.dispute_messages (
    dispute_id,
    sender_id,
    sender_role,
    message
  )
  values (
    dispute_row.id,
    auth.uid(),
    'admin',
    trim(refund_note)
  );

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
  values
  (
    dispute_row.buyer_id,
    'refund',
    'credit',
    'available',
    'completed',
    linked_order.amount,
    linked_order.id,
    linked_order.listing_id,
    linked_order.payment_reference,
    'Order refund issued.',
    jsonb_build_object(
      'dispute_id', dispute_row.id,
      'note', trim(refund_note),
      'gross_amount', linked_order.amount,
      'platform_fee_amount', linked_order.platform_fee_amount,
      'listing_taken_down', take_listing_down
    )
  ),
  (
    dispute_row.seller_id,
    'refund',
    'debit',
    'pending',
    'completed',
    seller_refund_amount,
    linked_order.id,
    linked_order.listing_id,
    linked_order.payment_reference,
    'Sale funds returned to buyer.',
    jsonb_build_object(
      'dispute_id', dispute_row.id,
      'note', trim(refund_note),
      'gross_amount', linked_order.amount,
      'platform_fee_amount', linked_order.platform_fee_amount,
      'listing_taken_down', take_listing_down
    )
  );

  perform public.assert_wallet_reconciled(dispute_row.buyer_id);
  perform public.assert_wallet_reconciled(dispute_row.seller_id);

  insert into public.notifications (
    profile_id,
    type,
    title,
    message,
    link_path,
    metadata
  )
  values
  (
    dispute_row.buyer_id,
    'buyer_refund_issued',
    'Refund issued',
    'A refund was issued for your disputed order.',
    '/account/disputes/' || dispute_row.id,
    jsonb_build_object(
      'dispute_id', dispute_row.id,
      'order_id', linked_order.id,
      'amount', linked_order.amount,
      'platform_fee_amount', linked_order.platform_fee_amount,
      'seller_payout_amount', seller_refund_amount,
      'note', trim(refund_note),
      'listing_taken_down', take_listing_down
    )
  ),
  (
    dispute_row.seller_id,
    'seller_dispute_refunded',
    'Order refunded',
    case
      when take_listing_down then 'A disputed order was refunded and the listing was taken down.'
      else 'A disputed order was refunded.'
    end,
    '/seller/disputes/' || dispute_row.id,
    jsonb_build_object(
      'dispute_id', dispute_row.id,
      'order_id', linked_order.id,
      'listing_id', linked_order.listing_id,
      'amount', linked_order.amount,
      'platform_fee_amount', linked_order.platform_fee_amount,
      'seller_payout_amount', seller_refund_amount,
      'note', trim(refund_note),
      'listing_taken_down', take_listing_down
    )
  );
end;
$$;

create or replace function public.enforce_seller_for_dispute(
  target_dispute_id uuid,
  enforcement_action text,
  enforcement_reason text,
  restriction_days integer default 0
)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  dispute_row public.disputes%rowtype;
  restriction_until timestamp with time zone;
  new_strike_count integer;
begin
  if not exists (
    select 1
    from public.profiles as admin_profile
    where admin_profile.id = auth.uid()
      and admin_profile.role = 'admin'
  ) then
    raise exception 'Only admins can enforce seller penalties.';
  end if;

  if enforcement_action not in ('warning', 'temporary_restriction', 'seller_suspension') then
    raise exception 'Invalid seller enforcement action.';
  end if;

  if trim(enforcement_reason) = '' then
    raise exception 'Add an enforcement reason.';
  end if;

  if enforcement_action = 'temporary_restriction'
    and (restriction_days is null or restriction_days <= 0) then
    raise exception 'Add the restriction duration.';
  end if;

  select *
  into dispute_row
  from public.disputes
  where id = target_dispute_id
  for update;

  if not found then
    raise exception 'Dispute not found.';
  end if;

  restriction_until := case
    when enforcement_action = 'temporary_restriction' then now() + make_interval(days => restriction_days)
    else null
  end;

  update public.profiles
  set
    seller_strikes = seller_strikes + 1,
    seller_restricted_until = case
      when enforcement_action = 'temporary_restriction' then restriction_until
      when enforcement_action = 'seller_suspension' then null
      else seller_restricted_until
    end,
    seller_restriction_reason = case
      when enforcement_action in ('temporary_restriction', 'seller_suspension') then trim(enforcement_reason)
      else seller_restriction_reason
    end,
    seller_enabled = case
      when enforcement_action = 'seller_suspension' then false
      else seller_enabled
    end
  where id = dispute_row.seller_id
  returning seller_strikes into new_strike_count;

  insert into public.seller_enforcements (
    seller_id,
    dispute_id,
    action,
    reason,
    strike_count,
    restricted_until,
    created_by
  )
  values (
    dispute_row.seller_id,
    dispute_row.id,
    enforcement_action,
    trim(enforcement_reason),
    new_strike_count,
    restriction_until,
    auth.uid()
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
    dispute_row.seller_id,
    'seller_enforcement_' || enforcement_action,
    case
      when enforcement_action = 'warning' then 'Seller warning issued'
      when enforcement_action = 'temporary_restriction' then 'Seller uploads restricted'
      else 'Seller access suspended'
    end,
    case
      when enforcement_action = 'warning' then trim(enforcement_reason)
      when enforcement_action = 'temporary_restriction' then trim(enforcement_reason)
      else trim(enforcement_reason)
    end,
    '/seller/disputes/' || dispute_row.id,
    jsonb_build_object(
      'dispute_id', dispute_row.id,
      'action', enforcement_action,
      'strike_count', new_strike_count,
      'restricted_until', restriction_until,
      'reason', trim(enforcement_reason)
    )
  );
end;
$$;

create or replace function public.acknowledge_seller_enforcement(target_enforcement_id uuid)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  if auth.uid() is null then
    raise exception 'You must be signed in to acknowledge this notice.';
  end if;

  update public.seller_enforcements
  set acknowledged_at = coalesce(acknowledged_at, now())
  where id = target_enforcement_id
    and seller_id = auth.uid();

  if not found then
    raise exception 'Seller notice not found.';
  end if;
end;
$$;

create or replace function public.mark_dispute_messages_read(target_dispute_id uuid)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  viewer_id uuid;
begin
  viewer_id := auth.uid();

  if viewer_id is null then
    raise exception 'You must be signed in to read this case.';
  end if;

  if not exists (
    select 1
    from public.disputes as dispute
    where dispute.id = target_dispute_id
      and (
        viewer_id = dispute.buyer_id
        or viewer_id = dispute.seller_id
        or exists (
          select 1
          from public.profiles as admin_profile
          where admin_profile.id = viewer_id
            and admin_profile.role = 'admin'
        )
      )
  ) then
    raise exception 'Case not found.';
  end if;

  insert into public.dispute_message_reads (message_id, profile_id)
  select message.id, viewer_id
  from public.dispute_messages as message
  where message.dispute_id = target_dispute_id
    and message.sender_id <> viewer_id
  on conflict (message_id, profile_id) do update
    set read_at = coalesce(public.dispute_message_reads.read_at, excluded.read_at);
end;
$$;

create or replace function public.clear_seller_restriction(
  target_seller_id uuid,
  admin_note text default ''
)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  if not exists (
    select 1
    from public.profiles as admin_profile
    where admin_profile.id = auth.uid()
      and admin_profile.role = 'admin'
  ) then
    raise exception 'Only admins can clear seller restrictions.';
  end if;

  update public.profiles
  set
    seller_restricted_until = null,
    seller_restriction_reason = ''
  where id = target_seller_id;

  insert into public.notifications (
    profile_id,
    type,
    title,
    message,
    link_path,
    metadata
  )
  values (
    target_seller_id,
    'seller_restriction_cleared',
    'Seller restriction cleared',
    coalesce(nullif(trim(admin_note), ''), 'Your seller upload restriction has been cleared.'),
    '/seller/dashboard',
    jsonb_build_object('note', trim(admin_note))
  );
end;
$$;

create or replace function public.record_seller_pending_earning(target_order_id uuid)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  paid_order public.orders%rowtype;
  hold_expires_at timestamp with time zone;
  seller_earning_amount numeric;
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

  if paid_order.escrow_status in ('holding', 'released', 'disputed', 'refunded') then
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
  seller_earning_amount := coalesce(
    nullif(paid_order.seller_payout_amount, 0),
    paid_order.amount - coalesce(paid_order.platform_fee_amount, 0),
    paid_order.amount
  );

  if seller_earning_amount <= 0 then
    raise exception 'Seller payout amount is invalid for this order.';
  end if;

  insert into public.wallets (profile_id)
  values (paid_order.seller_id)
  on conflict (profile_id) do nothing;

  update public.wallets
  set
    pending_balance = pending_balance + seller_earning_amount,
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
    seller_earning_amount,
    paid_order.id,
    paid_order.listing_id,
    paid_order.payment_reference,
    'Sale funds are pending buyer protection release.',
    jsonb_build_object(
      'hold_expires_at', hold_expires_at,
      'listing_title', paid_order.listing_title,
      'gross_amount', paid_order.amount,
      'platform_fee_amount', paid_order.platform_fee_amount
    )
  );

  perform public.assert_wallet_reconciled(paid_order.seller_id);

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
      'amount', seller_earning_amount,
      'gross_amount', paid_order.amount,
      'platform_fee_amount', paid_order.platform_fee_amount,
      'hold_expires_at', hold_expires_at
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
    paid_order.buyer_id,
    'buyer_purchase_successful',
    'Purchase successful',
    'Your payment for ' || paid_order.listing_title || ' was successful.',
    '/account/orders/' || paid_order.id,
    jsonb_build_object(
      'order_id', paid_order.id,
      'listing_id', paid_order.listing_id,
      'seller_id', paid_order.seller_id,
      'amount', paid_order.amount,
      'payment_reference', paid_order.payment_reference
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
      'platform_fee_amount', paid_order.platform_fee_amount,
      'seller_payout_amount', seller_earning_amount,
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

create or replace function public.complete_checkout_payment(
  target_order_id uuid,
  buyer_phone_number text,
  checkout_payment_reference text,
  checkout_payment_last4 text,
  checkout_payment_provider text,
  checkout_payment_channel text,
  checkout_paid_at timestamp with time zone default now()
)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  checkout_order public.orders%rowtype;
  checkout_listing public.listings%rowtype;
  checkout_platform_fee_rate numeric(5, 4);
  checkout_platform_fee_amount numeric(18, 2);
  checkout_seller_payout_amount numeric(18, 2);
begin
  if auth.uid() is null then
    raise exception 'You must be signed in to complete checkout.';
  end if;

  select *
  into checkout_order
  from public.orders
  where id = target_order_id
  for update;

  if not found then
    raise exception 'Order not found.';
  end if;

  if checkout_order.buyer_id is distinct from auth.uid()
    and not exists (
      select 1
      from public.profiles as buyer_profile
      where buyer_profile.id = auth.uid()
        and lower(buyer_profile.email) = lower(checkout_order.buyer_email)
    ) then
    raise exception 'This checkout does not belong to your account.';
  end if;

  if checkout_order.status <> 'pending'
    or checkout_order.payment_status <> 'pending' then
    raise exception 'This checkout is no longer pending.';
  end if;

  if checkout_order.checkout_expires_at is not null
    and checkout_order.checkout_expires_at <= now() then
    raise exception 'This checkout has expired.';
  end if;

  select *
  into checkout_listing
  from public.listings
  where id = checkout_order.listing_id
  for update;

  if not found or checkout_listing.status <> 'approved' then
    raise exception 'This listing is no longer available.';
  end if;

  if checkout_listing.seller_id = auth.uid() then
    raise exception 'You cannot buy your own listing.';
  end if;

  checkout_platform_fee_rate := coalesce(nullif(checkout_order.platform_fee_rate, 0), 0.15);
  checkout_platform_fee_amount := round(checkout_order.amount * checkout_platform_fee_rate, 2);
  checkout_seller_payout_amount := checkout_order.amount - checkout_platform_fee_amount;

  if checkout_seller_payout_amount <= 0 then
    raise exception 'Seller payout amount is invalid for this checkout.';
  end if;

  update public.listings
  set
    status = 'sold',
    sold_at = checkout_paid_at
  where id = checkout_listing.id
    and status = 'approved';

  update public.orders
  set
    buyer_phone = trim(buyer_phone_number),
    platform_fee_rate = checkout_platform_fee_rate,
    platform_fee_amount = checkout_platform_fee_amount,
    seller_payout_amount = checkout_seller_payout_amount,
    status = 'completed',
    payment_status = 'successful',
    payment_provider = checkout_payment_provider,
    payment_reference = checkout_payment_reference,
    payment_channel = checkout_payment_channel,
    payment_last4 = checkout_payment_last4,
    paid_at = checkout_paid_at
  where id = checkout_order.id;

  perform public.record_seller_pending_earning(checkout_order.id);
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
  seller_release_amount numeric;
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

  seller_release_amount := coalesce(
    nullif(held_order.seller_payout_amount, 0),
    held_order.amount - coalesce(held_order.platform_fee_amount, 0),
    held_order.amount
  );

  if seller_release_amount <= 0 then
    raise exception 'Seller payout amount is invalid for this release.';
  end if;

  insert into public.wallets (profile_id)
  values (held_order.seller_id)
  on conflict (profile_id) do nothing;

  update public.wallets
  set
    pending_balance = pending_balance - seller_release_amount,
    available_balance = available_balance + seller_release_amount,
    total_earned = total_earned + seller_release_amount,
    updated_at = now()
  where profile_id = held_order.seller_id
    and pending_balance >= seller_release_amount;

  if not found then
    raise exception 'Seller pending balance is lower than the release amount.';
  end if;

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
    seller_release_amount,
    held_order.id,
    held_order.listing_id,
    held_order.payment_reference,
    'Sale funds released to available balance.',
    jsonb_build_object(
      'listing_title', held_order.listing_title,
      'gross_amount', held_order.amount,
      'platform_fee_amount', held_order.platform_fee_amount
    )
  );

  perform public.assert_wallet_reconciled(held_order.seller_id);

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
      'amount', seller_release_amount,
      'gross_amount', held_order.amount,
      'platform_fee_amount', held_order.platform_fee_amount
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
  requester_profile public.profiles%rowtype;
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

  select *
  into requester_profile
  from public.profiles
  where id = requester_id;

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

  perform public.assert_wallet_reconciled(requester_id);

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
    case
      when requester_profile.seller_enabled then '/seller/withdrawals'
      else '/account/withdrawals'
    end,
    jsonb_build_object('withdrawal_request_id', request_id, 'amount', withdrawal_amount)
  );

  perform public.notify_admins(
    'admin_withdrawal_request',
    'New withdrawal request',
    case
      when requester_profile.seller_enabled then 'A seller requested a withdrawal.'
      else 'A buyer requested a refund withdrawal.'
    end,
    '/admin/withdrawals',
    jsonb_build_object(
      'withdrawal_request_id', request_id,
      'profile_id', requester_id,
      'profile_role', case
        when requester_profile.seller_enabled then 'seller'
        else 'buyer'
      end,
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
  withdrawal_profile public.profiles%rowtype;
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

  select *
  into withdrawal_profile
  from public.profiles
  where id = withdrawal.profile_id;

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

  perform public.assert_wallet_reconciled(withdrawal.profile_id);

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
    case
      when withdrawal_profile.seller_enabled then '/seller/withdrawals'
      else '/account/withdrawals'
    end,
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

create or replace function public.mark_withdrawal_paid(
  target_withdrawal_id uuid,
  payout_provider_name text,
  payout_transaction_reference text,
  payout_proof_file_name text default '',
  payout_proof_file_path text default '',
  payout_admin_note text default ''
)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  withdrawal public.withdrawal_requests%rowtype;
  withdrawal_profile public.profiles%rowtype;
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

  if trim(payout_provider_name) = ''
    or trim(payout_transaction_reference) = '' then
    raise exception 'Payout provider and transaction reference are required.';
  end if;

  select *
  into withdrawal_profile
  from public.profiles
  where id = withdrawal.profile_id;

  update public.wallets
  set
    total_withdrawn = total_withdrawn + withdrawal.amount,
    updated_at = now()
  where profile_id = withdrawal.profile_id;

  update public.withdrawal_requests
  set
    status = 'paid',
    payout_provider = trim(payout_provider_name),
    payout_reference = trim(payout_transaction_reference),
    payout_proof_name = trim(payout_proof_file_name),
    payout_proof_path = trim(payout_proof_file_path),
    paid_note = trim(payout_admin_note),
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
    jsonb_build_object(
      'withdrawal_request_id', withdrawal.id,
      'payout_provider', trim(payout_provider_name),
      'payout_reference', trim(payout_transaction_reference),
      'payout_proof_name', trim(payout_proof_file_name),
      'payout_proof_path', trim(payout_proof_file_path),
      'paid_note', trim(payout_admin_note)
    )
  );

  perform public.assert_wallet_reconciled(withdrawal.profile_id);

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
    case
      when withdrawal_profile.seller_enabled then '/seller/withdrawals'
      else '/account/withdrawals'
    end,
    jsonb_build_object(
      'withdrawal_request_id', withdrawal.id,
      'amount', withdrawal.amount,
      'payout_provider', trim(payout_provider_name),
      'payout_reference', trim(payout_transaction_reference),
      'paid_note', trim(payout_admin_note)
    )
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

  insert into public.notifications (
    profile_id,
    type,
    title,
    message,
    link_path,
    metadata
  )
  values (
    new.id,
    'account_created',
    'Welcome to Gaming Index',
    'Your account is ready.',
    '/account/dashboard',
    jsonb_build_object(
      'profile_id', new.id,
      'email', new.email
    )
  )
  on conflict do nothing;

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
      or new.seller_strikes is distinct from old.seller_strikes
      or new.seller_restricted_until is distinct from old.seller_restricted_until
      or new.seller_restriction_reason is distinct from old.seller_restriction_reason
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
alter table public.profile_settings enable row level security;
alter table public.kyc_submissions enable row level security;
alter table public.listings enable row level security;
alter table public.listing_delivery_details enable row level security;
alter table public.orders enable row level security;
alter table public.disputes enable row level security;
alter table public.dispute_messages enable row level security;
alter table public.dispute_message_reads enable row level security;
alter table public.dispute_attachments enable row level security;
alter table public.seller_enforcements enable row level security;
alter table public.wallets enable row level security;
alter table public.wallet_transactions enable row level security;
alter table public.withdrawal_requests enable row level security;
alter table public.suspension_appeals enable row level security;
alter table public.site_feedback enable row level security;
alter table public.support_tickets enable row level security;
alter table public.support_ticket_messages enable row level security;
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

drop policy if exists "users can read their own profile settings" on public.profile_settings;
create policy "users can read their own profile settings"
  on public.profile_settings
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

drop policy if exists "users can insert their own profile settings" on public.profile_settings;
create policy "users can insert their own profile settings"
  on public.profile_settings
  for insert
  to authenticated
  with check (auth.uid() = profile_id);

drop policy if exists "users can update their own profile settings" on public.profile_settings;
create policy "users can update their own profile settings"
  on public.profile_settings
  for update
  to authenticated
  using (auth.uid() = profile_id)
  with check (auth.uid() = profile_id);

drop policy if exists "sellers can insert their own kyc submission" on public.kyc_submissions;
create policy "sellers can insert their own kyc submission"
  on public.kyc_submissions
  for insert
  to authenticated
  with check (auth.uid() = seller_id);

drop policy if exists "authenticated users can read kyc submissions" on public.kyc_submissions;
drop policy if exists "sellers and admins can read kyc submissions" on public.kyc_submissions;
create policy "sellers and admins can read kyc submissions"
  on public.kyc_submissions
  for select
  to authenticated
  using (
    auth.uid() = seller_id
    or exists (
      select 1
      from public.profiles as admin_profile
      where admin_profile.id = auth.uid()
        and admin_profile.role = 'admin'
    )
  );

drop policy if exists "authenticated users can update kyc submissions" on public.kyc_submissions;
drop policy if exists "admins can update kyc submissions" on public.kyc_submissions;
create policy "admins can update kyc submissions"
  on public.kyc_submissions
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
  using (
    status in ('approved', 'sold')
    or auth.uid() = seller_id
    or exists (
      select 1
      from public.profiles as admin_profile
      where admin_profile.id = auth.uid()
        and admin_profile.role = 'admin'
    )
  );

drop policy if exists "public can read live marketplace listings" on public.listings;
create policy "public can read live marketplace listings"
  on public.listings
  for select
  to anon
  using (status in ('approved', 'sold'));

drop policy if exists "authenticated users can update listings" on public.listings;
drop policy if exists "sellers can update their own listings" on public.listings;
create policy "sellers can update their own listings"
  on public.listings
  for update
  to authenticated
  using (auth.uid() = seller_id)
  with check (auth.uid() = seller_id);

drop policy if exists "admins can update any listing" on public.listings;
create policy "admins can update any listing"
  on public.listings
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
        and buyer_order.payment_status = 'successful'
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
drop policy if exists "buyers can cancel their own pending orders" on public.orders;
create policy "buyers can cancel their own pending orders"
  on public.orders
  for update
  to authenticated
  using (
    status = 'pending'
    and (
      auth.uid() = buyer_id
      or exists (
        select 1
        from public.profiles as buyer_profile
        where buyer_profile.id = auth.uid()
          and lower(buyer_profile.email) = lower(public.orders.buyer_email)
      )
    )
  )
  with check (
    status = 'cancelled'
    and (
      auth.uid() = buyer_id
      or exists (
        select 1
        from public.profiles as buyer_profile
        where buyer_profile.id = auth.uid()
          and lower(buyer_profile.email) = lower(public.orders.buyer_email)
      )
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

drop policy if exists "buyers sellers and admins can read relevant disputes" on public.disputes;
create policy "buyers sellers and admins can read relevant disputes"
  on public.disputes
  for select
  to authenticated
  using (
    auth.uid() = buyer_id
    or auth.uid() = seller_id
    or exists (
      select 1
      from public.profiles as admin_profile
      where admin_profile.id = auth.uid()
        and admin_profile.role = 'admin'
    )
  );

drop policy if exists "buyers can insert their own disputes" on public.disputes;
create policy "buyers can insert their own disputes"
  on public.disputes
  for insert
  to authenticated
  with check (auth.uid() = buyer_id);

drop policy if exists "admins can update disputes" on public.disputes;
create policy "admins can update disputes"
  on public.disputes
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

drop policy if exists "buyers sellers and admins can read dispute messages" on public.dispute_messages;
create policy "buyers sellers and admins can read dispute messages"
  on public.dispute_messages
  for select
  to authenticated
  using (
    exists (
      select 1
      from public.disputes as dispute
      where dispute.id = public.dispute_messages.dispute_id
        and (
          auth.uid() = dispute.buyer_id
          or auth.uid() = dispute.seller_id
          or exists (
            select 1
            from public.profiles as admin_profile
            where admin_profile.id = auth.uid()
              and admin_profile.role = 'admin'
          )
        )
    )
  );

drop policy if exists "case participants can insert dispute messages" on public.dispute_messages;
create policy "case participants can insert dispute messages"
  on public.dispute_messages
  for insert
  to authenticated
  with check (
    auth.uid() = sender_id
    and exists (
      select 1
      from public.disputes as dispute
      where dispute.id = public.dispute_messages.dispute_id
        and (
          (sender_role = 'buyer' and auth.uid() = dispute.buyer_id)
          or (sender_role = 'seller' and auth.uid() = dispute.seller_id)
          or (
            sender_role = 'admin'
            and exists (
              select 1
              from public.profiles as admin_profile
              where admin_profile.id = auth.uid()
                and admin_profile.role = 'admin'
            )
          )
        )
    )
  );

drop policy if exists "case participants can read dispute message receipts" on public.dispute_message_reads;
create policy "case participants can read dispute message receipts"
  on public.dispute_message_reads
  for select
  to authenticated
  using (
    exists (
      select 1
      from public.dispute_messages as message
      join public.disputes as dispute
        on dispute.id = message.dispute_id
      where message.id = public.dispute_message_reads.message_id
        and (
          auth.uid() = dispute.buyer_id
          or auth.uid() = dispute.seller_id
          or exists (
            select 1
            from public.profiles as admin_profile
            where admin_profile.id = auth.uid()
              and admin_profile.role = 'admin'
          )
        )
    )
  );

drop policy if exists "buyers sellers and admins can read dispute attachments" on public.dispute_attachments;
create policy "buyers sellers and admins can read dispute attachments"
  on public.dispute_attachments
  for select
  to authenticated
  using (
    exists (
      select 1
      from public.disputes as dispute
      where dispute.id = public.dispute_attachments.dispute_id
        and (
          auth.uid() = dispute.buyer_id
          or auth.uid() = dispute.seller_id
          or exists (
            select 1
            from public.profiles as admin_profile
            where admin_profile.id = auth.uid()
              and admin_profile.role = 'admin'
          )
        )
    )
  );

drop policy if exists "case participants can insert dispute attachments" on public.dispute_attachments;
create policy "case participants can insert dispute attachments"
  on public.dispute_attachments
  for insert
  to authenticated
  with check (
    auth.uid() = uploader_id
    and exists (
      select 1
      from public.disputes as dispute
      where dispute.id = public.dispute_attachments.dispute_id
        and (
          auth.uid() = dispute.buyer_id
          or auth.uid() = dispute.seller_id
          or exists (
            select 1
            from public.profiles as admin_profile
            where admin_profile.id = auth.uid()
              and admin_profile.role = 'admin'
          )
        )
    )
  );

drop policy if exists "sellers can read their own enforcement history" on public.seller_enforcements;
create policy "sellers can read their own enforcement history"
  on public.seller_enforcements
  for select
  to authenticated
  using (
    auth.uid() = seller_id
    or exists (
      select 1
      from public.profiles as admin_profile
      where admin_profile.id = auth.uid()
        and admin_profile.role = 'admin'
    )
  );

drop policy if exists "admins can insert seller enforcements" on public.seller_enforcements;
create policy "admins can insert seller enforcements"
  on public.seller_enforcements
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

drop policy if exists "users can read their own site feedback" on public.site_feedback;
create policy "users can read their own site feedback"
  on public.site_feedback
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

drop policy if exists "users can submit their own site feedback" on public.site_feedback;
create policy "users can submit their own site feedback"
  on public.site_feedback
  for insert
  to authenticated
  with check (auth.uid() = profile_id);

drop policy if exists "admins can update site feedback" on public.site_feedback;
create policy "admins can update site feedback"
  on public.site_feedback
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

drop policy if exists "users and admins can read support tickets" on public.support_tickets;
create policy "users and admins can read support tickets"
  on public.support_tickets
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

drop policy if exists "users can create their own support tickets" on public.support_tickets;
create policy "users can create their own support tickets"
  on public.support_tickets
  for insert
  to authenticated
  with check (auth.uid() = profile_id);

drop policy if exists "admins can update support tickets" on public.support_tickets;
create policy "admins can update support tickets"
  on public.support_tickets
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

drop policy if exists "users and admins can read support messages" on public.support_ticket_messages;
create policy "users and admins can read support messages"
  on public.support_ticket_messages
  for select
  to authenticated
  using (
    exists (
      select 1
      from public.support_tickets as ticket
      where ticket.id = public.support_ticket_messages.ticket_id
        and (
          auth.uid() = ticket.profile_id
          or exists (
            select 1
            from public.profiles as admin_profile
            where admin_profile.id = auth.uid()
              and admin_profile.role = 'admin'
          )
        )
    )
  );

drop policy if exists "users and admins can insert support messages" on public.support_ticket_messages;
create policy "users and admins can insert support messages"
  on public.support_ticket_messages
  for insert
  to authenticated
  with check (
    auth.uid() = sender_id
    and exists (
      select 1
      from public.support_tickets as ticket
      where ticket.id = public.support_ticket_messages.ticket_id
        and (
          (sender_role = 'user' and auth.uid() = ticket.profile_id)
          or (
            sender_role = 'admin'
            and exists (
              select 1
              from public.profiles as admin_profile
              where admin_profile.id = auth.uid()
                and admin_profile.role = 'admin'
            )
          )
        )
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
drop policy if exists "owners and admins can read kyc files" on storage.objects;
create policy "owners and admins can read kyc files"
  on storage.objects
  for select
  to authenticated
  using (
    bucket_id = 'kyc-documents'
    and (
      auth.uid()::text = (storage.foldername(name))[1]
      or exists (
        select 1
        from public.profiles as admin_profile
        where admin_profile.id = auth.uid()
          and admin_profile.role = 'admin'
      )
    )
  );

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

drop policy if exists "case participants can upload dispute evidence" on storage.objects;
create policy "case participants can upload dispute evidence"
  on storage.objects
  for insert
  to authenticated
  with check (
    bucket_id = 'dispute-evidence'
    and auth.uid()::text = (storage.foldername(name))[1]
  );

drop policy if exists "authenticated users can read dispute evidence" on storage.objects;
drop policy if exists "case participants and admins can read dispute evidence" on storage.objects;
create policy "case participants and admins can read dispute evidence"
  on storage.objects
  for select
  to authenticated
  using (
    bucket_id = 'dispute-evidence'
    and (
      auth.uid()::text = (storage.foldername(name))[1]
      or exists (
        select 1
        from public.disputes as dispute
        where dispute.id::text = (storage.foldername(name))[2]
          and (dispute.buyer_id = auth.uid() or dispute.seller_id = auth.uid())
      )
      or exists (
        select 1
        from public.profiles as admin_profile
        where admin_profile.id = auth.uid()
          and admin_profile.role = 'admin'
      )
    )
  );

drop policy if exists "users can delete their own dispute evidence" on storage.objects;
create policy "users can delete their own dispute evidence"
  on storage.objects
  for delete
  to authenticated
  using (
    bucket_id = 'dispute-evidence'
    and auth.uid()::text = (storage.foldername(name))[1]
  );

drop policy if exists "admins can delete any dispute evidence" on storage.objects;
create policy "admins can delete any dispute evidence"
  on storage.objects
  for delete
  to authenticated
  using (
    bucket_id = 'dispute-evidence'
    and exists (
      select 1
      from public.profiles as admin_profile
      where admin_profile.id = auth.uid()
        and admin_profile.role = 'admin'
    )
  );
