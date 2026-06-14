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

export interface Profile {
  id: string;
  full_name: string;
  username: string;
  email: string;
  role: AppRole;
  seller_enabled: boolean;
  kyc_status: KycStatus;
  is_banned: boolean;
  banned_at?: string | null;
  banned_reason?: string;
  banned_by?: string | null;
  created_at: string;
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
  listing_id?: string | null;
  rating: number;
  review: string;
  created_at: string;
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
  status: OrderStatus;
  payment_status?: PaymentStatus;
  payment_provider?: string;
  payment_reference?: string;
  payment_channel?: string;
  payment_last4?: string;
  paid_at?: string | null;
  escrow_status?: "not_started" | "holding" | "released" | "refunded" | "disputed";
  seller_hold_expires_at?: string | null;
  seller_released_at?: string | null;
  seller_released_by?: string | null;
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
