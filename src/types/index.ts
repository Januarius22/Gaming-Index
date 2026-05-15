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
  document_type: string;
  document_number: string;
  email: string;
  username: string;
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
