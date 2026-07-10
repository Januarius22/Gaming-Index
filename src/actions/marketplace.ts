"use server";

import { revalidatePath } from "next/cache";
import { getCurrentProfile } from "@/lib/auth";
import { getDemoOrders, upsertDemoSellerRating } from "@/lib/demoStore";
import { hasSupabaseEnv } from "@/lib/supabaseClient";
import { getSupabaseServerClient } from "@/lib/supabaseServer";
import type { ActionState } from "@/types";

export async function submitSellerRatingAction(
  _prevState: ActionState,
  formData: FormData
): Promise<ActionState> {
  const profile = await getCurrentProfile();
  const sellerId = String(formData.get("sellerId") ?? "").trim();
  const listingId = String(formData.get("listingId") ?? "").trim();
  const review = String(formData.get("review") ?? "").trim();
  const rating = Number(formData.get("rating") ?? 0);

  if (!profile || profile.role === "admin") {
    return {
      status: "error",
      message: "Login with a buyer account to rate this seller."
    };
  }

  if (profile.is_banned) {
    return {
      status: "error",
      message: "Your account is suspended. Marketplace actions are unavailable."
    };
  }

  if (!sellerId || !listingId) {
    return {
      status: "error",
      message: "We could not find the seller for this rating."
    };
  }

  if (profile.id === sellerId) {
    return {
      status: "error",
      message: "You cannot rate your own seller account."
    };
  }

  if (!Number.isInteger(rating) || rating < 1 || rating > 5) {
    return {
      status: "error",
      message: "Choose a rating from 1 to 5 stars."
    };
  }

  if (hasSupabaseEnv) {
    const supabase = await getSupabaseServerClient();
    const { data: order } = await supabase!
      .from("orders")
      .select("id")
      .eq("buyer_id", profile.id)
      .eq("seller_id", sellerId)
      .eq("listing_id", listingId)
      .eq("payment_status", "successful")
      .in("status", ["processing", "completed"])
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    if (!order?.id) {
      return {
        status: "error",
        message: "Only buyers with a completed purchase can rate this seller."
      };
    }

    const { error } = await supabase!.from("seller_ratings").upsert(
      {
        seller_id: sellerId,
        buyer_id: profile.id,
        order_id: order.id,
        listing_id: listingId,
        rating,
        review,
        tags: [],
        is_hidden: false
      },
      {
        onConflict: "order_id"
      }
    );

    if (error) {
      return {
        status: "error",
        message: error.message
      };
    }
  } else {
    const orders = await getDemoOrders();
    const order = orders
      .filter(
        (entry) =>
          entry.buyer_id === profile.id &&
          entry.seller_id === sellerId &&
          entry.listing_id === listingId &&
          entry.payment_status === "successful" &&
          (entry.status === "processing" || entry.status === "completed")
      )
      .sort((left, right) => right.created_at.localeCompare(left.created_at))[0];

    if (!order) {
      return {
        status: "error",
        message: "Only buyers with a completed purchase can rate this seller."
      };
    }

    await upsertDemoSellerRating({
      sellerId,
      buyerId: profile.id,
      orderId: order.id,
      listingId,
      rating,
      review
    });
  }

  revalidatePath("/marketplace");
  revalidatePath("/account/marketplace");
  revalidatePath(`/marketplace/${listingId}`);

  return {
    status: "success",
    message: "Your seller rating has been saved."
  };
}
