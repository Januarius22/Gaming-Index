export type AppRole = "user" | "admin";

export type KycStatus = "not_started" | "pending" | "approved" | "rejected";

export type ListingStatus =
  | "draft"
  | "pending_review"
  | "approved"
  | "rejected"
  | "sold";

export type OrderStatus = "pending" | "processing" | "completed" | "cancelled";

export interface Profile {
  id: string;
  full_name: string;
  username: string;
  email: string;
  role: AppRole;
  seller_enabled: boolean;
  kyc_status: KycStatus;
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
  seller_rating?: number;
  seller_reviews?: number;
  seller_tag?: "top_seller" | null;
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
  buyer_name: string;
  buyer_email: string;
  seller_id: string;
  listing_id: string;
  listing_title: string;
  amount: number;
  status: OrderStatus;
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
