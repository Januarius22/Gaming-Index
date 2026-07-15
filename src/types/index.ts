export type AppRole = "user" | "admin";

export type KycStatus = "not_started" | "pending" | "approved" | "rejected";

export type ListingStatus =
  | "draft"
  | "pending_review"
  | "approved"
  | "rejected"
  | "sold"
  | "taken_down"
  | "withdrawn";

export type OrderStatus = "pending" | "processing" | "completed" | "cancelled";
export type PaymentStatus = "pending" | "successful" | "failed";
export type DisputeStatus =
  | "pending_admin_review"
  | "awaiting_seller_response"
  | "under_investigation"
  | "resolved"
  | "rejected"
  | "refunded"
  | "open"
  | "reviewing";

export interface Profile {
  id: string;
  full_name: string;
  username: string;
  email: string;
  avatar_name?: string;
  avatar_path?: string;
  avatar_url?: string;
  role: AppRole;
  seller_enabled: boolean;
  kyc_status: KycStatus;
  seller_strikes?: number;
  seller_restricted_until?: string | null;
  seller_restriction_reason?: string;
  is_banned: boolean;
  banned_at?: string | null;
  banned_reason?: string;
  banned_by?: string | null;
  is_deleted?: boolean;
  deleted_at?: string | null;
  deleted_reason?: string;
  deleted_by?: string | null;
  created_at: string;
}

export type NotificationPreferences = Record<string, boolean>;

export interface ProfileSettings {
  profile_id: string;
  phone_number: string;
  default_bank_name: string;
  default_account_number: string;
  default_account_name: string;
  display_currency: string;
  theme_preference: "light" | "dark" | "system";
  font_size_preference: "compact" | "comfortable" | "large";
  two_factor_preference_enabled: boolean;
  two_factor_method: "authenticator" | "email";
  notification_preferences: NotificationPreferences;
  created_at?: string;
  updated_at?: string;
}

export interface KycSubmission {
  id: string;
  seller_id: string;
  full_name: string;
  email: string;
  username: string;
  phone_number?: string;
  date_of_birth?: string;
  country?: string;
  state?: string;
  city?: string;
  state_city?: string;
  residential_address?: string;
  document_type: string;
  document_number: string;
  document_front_name?: string;
  document_front_path?: string;
  document_front_url?: string;
  document_back_name?: string;
  document_back_path?: string;
  document_back_url?: string;
  proof_of_address_type?: string;
  proof_of_address_name?: string;
  proof_of_address_path?: string;
  proof_of_address_url?: string;
  selfie_file_name?: string;
  selfie_file_path?: string;
  selfie_file_url?: string;
  rejection_reason?: string;
  doc_clear_confirmed?: boolean;
  doc_color_confirmed?: boolean;
  doc_corners_confirmed?: boolean;
  doc_name_match_confirmed?: boolean;
  doc_not_expired_confirmed?: boolean;
  selfie_matches_id_confirmed?: boolean;
  status: Extract<KycStatus, "pending" | "approved" | "rejected">;
  created_at: string;
}

export interface Listing {
  id: string;
  seller_id: string;
  seller_name: string;
  seller_username: string;
  game: string;
  title: string;
  description: string;
  price: number;
  platform: string;
  account_level: string;
  login_method: string;
  extra_notes: string;
  status: ListingStatus;
  image_names?: string[];
  image_paths?: string[];
  image_urls?: string[];
  seller_is_banned?: boolean;
  seller_avatar_url?: string;
  seller_rating?: number;
  seller_reviews?: number;
  seller_tag?: "top_seller" | null;
  sold_at?: string | null;
  withdrawn_at?: string | null;
  admin_note?: string;
  admin_action_at?: string | null;
  admin_action_by?: string | null;
  created_at: string;
}

export interface ListingDeliveryDetails {
  id: string;
  listing_id: string;
  seller_id: string;
  account_login_id: string;
  account_password: string;
  recovery_details?: string;
  transfer_note?: string;
  ready_for_release_confirmed: boolean;
  not_personal_confirmed: boolean;
  created_at: string;
}

export interface SellerRating {
  id: string;
  seller_id: string;
  buyer_id: string;
  order_id?: string | null;
  listing_id?: string | null;
  rating: number;
  review: string;
  tags?: string[];
  is_hidden?: boolean;
  hidden_reason?: string;
  hidden_by?: string | null;
  hidden_at?: string | null;
  created_at: string;
}

export interface AdminSellerReview extends SellerRating {
  seller_name?: string;
  seller_username?: string;
  buyer_name?: string;
  buyer_email?: string;
  listing_title?: string;
  order_reference?: string;
}

export interface CurrencyRate {
  code: string;
  name: string;
  symbol: string;
  ngn_rate: number;
  enabled: boolean;
  updated_by?: string | null;
  updated_at: string;
  created_at?: string;
}

export interface BusinessSettings {
  id: string;
  platform_commission_rate: number;
  buyer_protection_hold_hours: number;
  dispute_window_hours: number;
  withdrawal_review_hours: number;
  suspension_appeal_window_days: number;
  max_dispute_images: number;
  max_dispute_videos: number;
  max_dispute_video_seconds: number;
  max_dispute_image_size_mb: number;
  max_dispute_video_size_mb: number;
  max_listing_images: number;
  auto_release_enabled: boolean;
  partial_refund_enabled: boolean;
  updated_by?: string | null;
  updated_at?: string;
  created_at?: string;
}

export interface AdminSuspendedAccount extends Profile {
  appeal_status?: "none" | "pending" | "approved" | "rejected";
  appeal_created_at?: string | null;
  appeal_deadline_at?: string | null;
  deletion_eligible: boolean;
}

export interface DeletedAccount {
  id: string;
  profile_id: string;
  full_name: string;
  username: string;
  email: string;
  role: AppRole;
  seller_enabled: boolean;
  kyc_status: KycStatus;
  banned_at?: string | null;
  banned_reason: string;
  deleted_reason: string;
  deleted_by?: string | null;
  deleted_at: string;
  restored_at?: string | null;
  restored_by?: string | null;
  snapshot: Record<string, unknown>;
  created_at: string;
}

export interface SiteAnnouncement {
  id: string;
  title: string;
  message: string;
  audience: "all" | "buyers" | "sellers";
  tone: "info" | "success" | "warning" | "danger";
  link_path: string;
  is_active: boolean;
  starts_at?: string | null;
  ends_at?: string | null;
  created_by?: string | null;
  closed_by?: string | null;
  closed_at?: string | null;
  created_at: string;
  updated_at?: string;
}

export interface Order {
  id: string;
  buyer_id?: string | null;
  buyer_name: string;
  buyer_email: string;
  buyer_phone?: string;
  seller_id: string;
  listing_id: string;
  listing_title: string;
  amount: number;
  platform_fee_rate?: number;
  platform_fee_amount?: number;
  seller_payout_amount?: number;
  status: OrderStatus;
  payment_status?: PaymentStatus;
  payment_provider?: string;
  payment_reference?: string;
  payment_channel?: string;
  payment_last4?: string;
  paid_at?: string | null;
  checkout_expires_at?: string | null;
  escrow_status?: "not_started" | "holding" | "released" | "refunded" | "disputed";
  seller_hold_expires_at?: string | null;
  seller_released_at?: string | null;
  seller_released_by?: string | null;
  created_at: string;
}

export interface Dispute {
  id: string;
  order_id: string;
  listing_id?: string | null;
  buyer_id: string;
  seller_id: string;
  reason: string;
  details: string;
  status: DisputeStatus;
  admin_note: string;
  resolution?: string;
  seller_visible?: boolean;
  locked_at?: string | null;
  locked_by?: string | null;
  assigned_admin_id?: string | null;
  final_outcome?: string;
  final_note?: string;
  resolved_at?: string | null;
  opened_by?: string | null;
  reviewed_by?: string | null;
  reviewed_at?: string | null;
  closed_at?: string | null;
  last_message_at?: string | null;
  created_at: string;
  listing_title?: string;
  buyer_name?: string;
  buyer_email?: string;
  seller_name?: string;
  seller_username?: string;
  amount?: number;
}

export interface DisputeAttachment {
  id: string;
  dispute_id: string;
  message_id?: string | null;
  uploader_id: string;
  file_name: string;
  file_path: string;
  file_type: "image" | "video";
  duration_seconds?: number | null;
  file_url?: string;
  created_at: string;
}

export interface DisputeMessage {
  id: string;
  dispute_id: string;
  sender_id: string;
  sender_role: "buyer" | "seller" | "admin";
  message: string;
  created_at: string;
  sender_name?: string;
  attachments?: DisputeAttachment[];
  read_count?: number;
  delivery_status?: "sending" | "sent" | "failed";
}

export type SidebarCounts = Record<string, number>;

export interface SellerEnforcement {
  id: string;
  seller_id: string;
  dispute_id?: string | null;
  action: "warning" | "temporary_restriction" | "seller_suspension";
  reason: string;
  strike_count: number;
  restricted_until?: string | null;
  acknowledged_at?: string | null;
  created_by?: string | null;
  created_at: string;
}

export interface Wallet {
  profile_id: string;
  available_balance: number;
  pending_balance: number;
  total_earned: number;
  total_deposited: number;
  total_withdrawn: number;
  created_at: string;
  updated_at: string;
}

export type WithdrawalStatus = "pending" | "approved" | "rejected" | "paid" | "cancelled";

export interface WithdrawalRequest {
  id: string;
  profile_id: string;
  amount: number;
  bank_name: string;
  account_number: string;
  account_name: string;
  status: WithdrawalStatus;
  admin_note: string;
  payout_provider?: string;
  payout_reference?: string;
  payout_proof_name?: string;
  payout_proof_path?: string;
  payout_proof_url?: string;
  paid_note?: string;
  reviewed_by?: string | null;
  reviewed_at?: string | null;
  paid_at?: string | null;
  created_at: string;
  profile_name?: string;
  profile_email?: string;
  profile_username?: string;
}

export type SuspensionAppealStatus = "pending" | "reviewed" | "approved" | "rejected";
export type SiteFeedbackStatus = "new" | "reviewed" | "planned" | "closed";
export type SiteFeedbackCategory =
  | "bug"
  | "suggestion"
  | "payment"
  | "buyer_experience"
  | "seller_experience"
  | "other";

export interface SuspensionAppeal {
  id: string;
  profile_id: string;
  email: string;
  phone_number: string;
  appeal_reason: string;
  status: SuspensionAppealStatus;
  admin_note: string;
  reviewed_by?: string | null;
  reviewed_at?: string | null;
  created_at: string;
  profile_name?: string;
  profile_email?: string;
  profile_username?: string;
  banned_reason?: string;
  banned_at?: string | null;
}

export interface SiteFeedback {
  id: string;
  profile_id: string;
  workspace: "account" | "seller";
  category: SiteFeedbackCategory;
  rating?: number | null;
  message: string;
  status: SiteFeedbackStatus;
  admin_note: string;
  reviewed_by?: string | null;
  reviewed_at?: string | null;
  created_at: string;
  profile_name?: string;
  profile_email?: string;
  profile_username?: string;
}

export type SupportTicketStatus = "open" | "in_review" | "resolved" | "closed";
export type SupportTicketCategory =
  | "account"
  | "payment"
  | "withdrawal"
  | "listing"
  | "kyc"
  | "technical"
  | "other";

export interface SupportTicket {
  id: string;
  profile_id: string;
  workspace: "account" | "seller";
  category: SupportTicketCategory;
  subject: string;
  status: SupportTicketStatus;
  last_message_at: string;
  closed_at?: string | null;
  created_at: string;
  profile_name?: string;
  profile_email?: string;
  profile_username?: string;
}

export interface SupportTicketMessage {
  id: string;
  ticket_id: string;
  sender_id: string;
  sender_role: "user" | "admin";
  message: string;
  created_at: string;
  sender_name?: string;
}

export interface WalletTransaction {
  id: string;
  wallet_profile_id: string;
  type: string;
  direction: "credit" | "debit";
  balance_bucket: "available" | "pending" | "external";
  status: "pending" | "completed" | "failed" | "cancelled";
  amount: number;
  description: string;
  created_at: string;
}

export interface Notification {
  id: string;
  profile_id: string;
  type: string;
  title: string;
  message: string;
  link_path: string;
  metadata: Record<string, unknown>;
  read_at?: string | null;
  created_at: string;
}

export interface ActivityItem {
  id: string;
  title: string;
  detail: string;
  created_at: string;
}

export interface DashboardStat {
  label: string;
  value: string;
  helper: string;
  href?: string;
}

export interface AnalyticsMetric {
  label: string;
  value: string;
  helper: string;
  href?: string;
}

export interface AnalyticsDatum {
  label: string;
  value: number;
  helper?: string;
}

export interface AnalyticsTrendDatum {
  label: string;
  value: number;
  secondaryValue?: number;
}

export interface AdminAnalytics {
  metrics: AnalyticsMetric[];
  salesTrend: AnalyticsTrendDatum[];
  listingStatus: AnalyticsDatum[];
  orderStatus: AnalyticsDatum[];
  disputeStatus: AnalyticsDatum[];
  gameBreakdown: AnalyticsDatum[];
  kycBreakdown: AnalyticsDatum[];
  financialBreakdown: AnalyticsDatum[];
  topSellers: Array<{
    seller_id: string;
    seller_name: string;
    seller_username: string;
    sales: number;
    revenue: number;
  }>;
  recentSignals: Array<{
    title: string;
    detail: string;
    href: string;
  }>;
}

export interface SellerAnalytics {
  metrics: AnalyticsMetric[];
  earningsTrend: AnalyticsTrendDatum[];
  listingStatus: AnalyticsDatum[];
  orderStatus: AnalyticsDatum[];
  gameBreakdown: AnalyticsDatum[];
  withdrawalStatus: AnalyticsDatum[];
  reputation: AnalyticsDatum[];
  recentSales: Array<{
    order_id: string;
    title: string;
    amount: number;
    created_at: string;
  }>;
  signals: Array<{
    title: string;
    detail: string;
    href: string;
  }>;
}

export type SessionProfile = Profile;

export interface ActionState {
  status: "idle" | "success" | "error";
  message?: string;
}

export type LoginActionState = ActionState;

export type RegisterActionState = ActionState;

export type ListingActionState = ActionState;

export type KycActionState = ActionState;
