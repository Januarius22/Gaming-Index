import "server-only";
import { hasSupabaseEnv } from "@/lib/supabaseClient";
import { getSupabaseServerClient } from "@/lib/supabaseServer";

type DeletionCheckProfile = {
  id: string;
};

export async function hasPendingAccountDeletionRequest(profileId: string) {
  if (!hasSupabaseEnv) {
    return false;
  }

  const supabase = await getSupabaseServerClient();

  if (!supabase) {
    return false;
  }

  const { count } = await supabase
    .from("account_deletion_requests")
    .select("id", { count: "exact", head: true })
    .eq("profile_id", profileId)
    .eq("status", "pending");

  return (count ?? 0) > 0;
}

export async function getAccountDeletionBlockers(
  profile: DeletionCheckProfile,
  options: { includePendingDeletionRequest?: boolean } = {}
) {
  if (!hasSupabaseEnv) {
    return [];
  }

  const supabase = await getSupabaseServerClient();

  if (!supabase) {
    return ["Account checks could not be completed."];
  }

  const includePendingDeletionRequest = options.includePendingDeletionRequest ?? true;
  const [
    { data: wallet },
    { count: activeBuyerOrders },
    { count: activeSellerOrders },
    { count: openDisputes },
    { count: pendingWithdrawals },
    { count: activeListings },
    pendingRequestExists
  ] = await Promise.all([
    supabase
      .from("wallets")
      .select("available_balance, pending_balance")
      .eq("profile_id", profile.id)
      .maybeSingle(),
    supabase
      .from("orders")
      .select("id", { count: "exact", head: true })
      .eq("buyer_id", profile.id)
      .in("status", ["pending", "processing"]),
    supabase
      .from("orders")
      .select("id", { count: "exact", head: true })
      .eq("seller_id", profile.id)
      .in("escrow_status", ["holding", "disputed"]),
    supabase
      .from("disputes")
      .select("id", { count: "exact", head: true })
      .or(`buyer_id.eq.${profile.id},seller_id.eq.${profile.id}`)
      .in("status", [
        "pending_admin_review",
        "awaiting_seller_response",
        "under_investigation",
        "open",
        "reviewing"
      ]),
    supabase
      .from("withdrawal_requests")
      .select("id", { count: "exact", head: true })
      .eq("profile_id", profile.id)
      .in("status", ["pending", "approved"]),
    supabase
      .from("listings")
      .select("id", { count: "exact", head: true })
      .eq("seller_id", profile.id)
      .in("status", ["draft", "pending_review", "approved", "sold"]),
    includePendingDeletionRequest ? hasPendingAccountDeletionRequest(profile.id) : Promise.resolve(false)
  ]);

  const blockers: string[] = [];
  const availableBalance = Number(wallet?.available_balance ?? 0);
  const pendingBalance = Number(wallet?.pending_balance ?? 0);

  if (availableBalance > 0 || pendingBalance > 0) {
    blockers.push("Wallet balance must be cleared first.");
  }

  if ((activeBuyerOrders ?? 0) > 0 || (activeSellerOrders ?? 0) > 0) {
    blockers.push("Active orders must be completed or resolved first.");
  }

  if ((openDisputes ?? 0) > 0) {
    blockers.push("Open disputes must be resolved first.");
  }

  if ((pendingWithdrawals ?? 0) > 0) {
    blockers.push("Pending withdrawals must be completed first.");
  }

  if ((activeListings ?? 0) > 0) {
    blockers.push("Active seller listings must be withdrawn or resolved first.");
  }

  if (pendingRequestExists) {
    blockers.push("You already have a pending deletion request.");
  }

  return blockers;
}
