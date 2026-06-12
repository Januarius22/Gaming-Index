"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireAccountProfile } from "@/lib/auth";
import {
  removeCartListingId,
  removeSavedListingId,
  toggleCartListingId,
  toggleSavedListingId
} from "@/lib/buyerStore";
import {
  getBuyerOrderDetail,
  getBuyerOrders,
  getMarketplaceListingById
} from "@/lib/data";
import {
  addDemoOrder,
  updateDemoListingStatus,
  updateDemoOrder,
  updateDemoProfile
} from "@/lib/demoStore";
import { hasSupabaseEnv } from "@/lib/supabaseClient";
import { getSupabaseServerClient } from "@/lib/supabaseServer";
import {
  getNigeriaTimestamp,
  isOrderPaymentConfirmed,
  isValidPhoneNumber
} from "@/lib/utils";
import type { ActionState } from "@/types";

function getSafeReturnPath(value: string, fallback = "/account/marketplace") {
  return value.startsWith("/account/") ? value : fallback;
}

function getRedirectWithNotice(pathname: string, notice: string) {
  const [basePath, existingQuery = ""] = pathname.split("?");
  const searchParams = new URLSearchParams(existingQuery);
  searchParams.set("notice", notice);
  return `${basePath}?${searchParams.toString()}`;
}

function getCheckoutPath(orderId: string, notice?: string) {
  const basePath = `/account/checkout/${orderId}`;

  if (!notice) {
    return basePath;
  }

  return `${basePath}?notice=${encodeURIComponent(notice)}`;
}

function getOrderDetailPath(orderId: string, notice?: string) {
  const basePath = `/account/orders/${orderId}`;

  if (!notice) {
    return basePath;
  }

  return `${basePath}?notice=${encodeURIComponent(notice)}`;
}

function getPaymentReference() {
  const stamp = Date.now().toString(36).toUpperCase();
  const randomChunk = crypto.randomUUID().slice(0, 8).toUpperCase();
  return `GI-${stamp}-${randomChunk}`;
}

function isValidExpiry(value: string) {
  const trimmed = value.trim();

  if (!/^(0[1-9]|1[0-2])\/\d{2}$/.test(trimmed)) {
    return false;
  }

  const [monthPart, yearPart] = trimmed.split("/");
  const month = Number(monthPart);
  const year = Number(`20${yearPart}`);
  const expiryDate = new Date(year, month, 0, 23, 59, 59, 999);

  return expiryDate.getTime() >= Date.now();
}

function revalidateBuyerWorkspace() {
  revalidatePath("/account/marketplace");
  revalidatePath("/account/saved");
  revalidatePath("/account/cart");
  revalidatePath("/account/orders");
}

function revalidateBuyerCheckout(listingId: string, orderId: string) {
  revalidateBuyerWorkspace();
  revalidatePath("/");
  revalidatePath("/marketplace");
  revalidatePath(`/marketplace/${listingId}`);
  revalidatePath(`/account/marketplace/${listingId}`);
  revalidatePath(`/account/checkout/${orderId}`);
  revalidatePath(`/account/checkout/${orderId}/success`);
  revalidatePath(`/account/orders/${orderId}`);
  revalidatePath("/seller/orders");
  revalidatePath("/seller/listings");
  revalidatePath("/seller/history");
  revalidatePath("/admin/orders");
  revalidatePath("/admin/listings");
  revalidatePath("/admin/listing-history");
}

async function createPendingOrderForListing({
  buyerId,
  buyerName,
  buyerEmail,
  sellerId,
  listingId,
  listingTitle,
  amount
}: {
  buyerId: string;
  buyerName: string;
  buyerEmail: string;
  sellerId: string;
  listingId: string;
  listingTitle: string;
  amount: number;
}) {
  if (!hasSupabaseEnv) {
    return addDemoOrder({
      buyer_id: buyerId,
      buyer_name: buyerName,
      buyer_email: buyerEmail,
      buyer_phone: "",
      seller_id: sellerId,
      listing_id: listingId,
      listing_title: listingTitle,
      amount,
      status: "pending",
      payment_status: "pending",
      payment_provider: "",
      payment_reference: "",
      payment_channel: "card",
      payment_last4: "",
      paid_at: null
    });
  }

  const supabase = await getSupabaseServerClient();

  if (!supabase) {
    return null;
  }

  const { data, error } = await supabase
    .from("orders")
    .insert({
      buyer_id: buyerId,
      buyer_name: buyerName,
      buyer_email: buyerEmail,
      buyer_phone: "",
      seller_id: sellerId,
      listing_id: listingId,
      listing_title: listingTitle,
      amount,
      status: "pending",
      payment_status: "pending",
      payment_provider: "",
      payment_reference: "",
      payment_channel: "card",
      payment_last4: "",
      paid_at: null
    })
    .select("*")
    .single();

  if (error) {
    return null;
  }

  return data;
}

async function markOrderPaid({
  orderId,
  listingId,
  buyerPhone,
  paymentReference,
  paymentLast4,
  paymentProvider = "secure_checkout",
  paymentChannel = "card"
}: {
  orderId: string;
  listingId: string;
  buyerPhone: string;
  paymentReference: string;
  paymentLast4: string;
  paymentProvider?: string;
  paymentChannel?: string;
}) {
  const paidAt = getNigeriaTimestamp();

  if (!hasSupabaseEnv) {
    const soldListing = await updateDemoListingStatus(listingId, "sold", {
      sold_at: paidAt
    });

    if (!soldListing) {
      return { ok: false as const, reason: "listing-unavailable" };
    }

    const updatedOrder = await updateDemoOrder(orderId, {
      buyer_phone: buyerPhone,
      status: "completed",
      payment_status: "successful",
      payment_provider: paymentProvider,
      payment_reference: paymentReference,
      payment_channel: paymentChannel,
      payment_last4: paymentLast4,
      paid_at: paidAt
    });

    if (!updatedOrder) {
      await updateDemoListingStatus(listingId, "approved");
      return { ok: false as const, reason: "payment-failed" };
    }

    return { ok: true as const };
  }

  const supabase = await getSupabaseServerClient();

  if (!supabase) {
    return { ok: false as const, reason: "payment-failed" };
  }

  const { data: soldListing, error: listingError } = await supabase
    .from("listings")
    .update({ status: "sold", sold_at: paidAt })
    .eq("id", listingId)
    .eq("status", "approved")
    .select("id")
    .maybeSingle();

  if (listingError || !soldListing) {
    return { ok: false as const, reason: "listing-unavailable" };
  }

  const { error: orderError } = await supabase
    .from("orders")
    .update({
    buyer_phone: buyerPhone,
    status: "completed",
    payment_status: "successful",
    payment_provider: paymentProvider,
    payment_reference: paymentReference,
    payment_channel: paymentChannel,
    payment_last4: paymentLast4,
    paid_at: paidAt
    })
    .eq("id", orderId);

  if (orderError) {
    await supabase
      .from("listings")
      .update({ status: "approved" })
      .eq("id", listingId)
      .eq("status", "sold");

    return { ok: false as const, reason: "payment-failed" };
  }

  return { ok: true as const };
}

export async function unlockSellerAccessAction(
  prevState: ActionState,
  formData: FormData
): Promise<ActionState> {
  void prevState;
  void formData;
  const profile = await requireAccountProfile();

  if (profile.seller_enabled) {
    redirect("/seller/dashboard");
  }

  if (hasSupabaseEnv) {
    const supabase = await getSupabaseServerClient();
    const { error } = await supabase!
      .from("profiles")
      .update({ seller_enabled: true })
      .eq("id", profile.id);

    if (error) {
      return {
        status: "error",
        message: error.message
      };
    }

    revalidatePath("/account/dashboard");
    revalidatePath("/account/seller");
    revalidatePath("/admin/users");
    revalidatePath("/admin/sellers");
    redirect("/seller/kyc");
  }

  await updateDemoProfile(profile.id, { seller_enabled: true });

  revalidatePath("/account/dashboard");
  revalidatePath("/account/seller");
  revalidatePath("/admin/users");
  revalidatePath("/admin/sellers");
  redirect("/seller/kyc");
}

export async function toggleSavedListingAction(formData: FormData) {
  await requireAccountProfile();
  const listingId = String(formData.get("listingId") ?? "").trim();
  const returnTo = getSafeReturnPath(String(formData.get("returnTo") ?? ""));

  if (!listingId || !(await getMarketplaceListingById(listingId))) {
    redirect(getRedirectWithNotice(returnTo, "listing-save-failed"));
  }

  const result = await toggleSavedListingId(listingId);

  revalidateBuyerWorkspace();

  redirect(
    getRedirectWithNotice(
      returnTo,
      result.saved ? "listing-saved" : "listing-unsaved"
    )
  );
}

export async function toggleSavedListingInlineAction(listingId: string) {
  await requireAccountProfile();
  const safeListingId = String(listingId).trim();

  if (!safeListingId || !(await getMarketplaceListingById(safeListingId))) {
    return {
      ok: false,
      saved: false,
      message: "We could not update saved items right now."
    };
  }

  const result = await toggleSavedListingId(safeListingId);

  revalidateBuyerWorkspace();

  return {
    ok: true,
    saved: result.saved,
    message: result.saved ? "Listing saved for later." : "Listing removed from saved items."
  };
}

export async function addToCartAction(formData: FormData) {
  await requireAccountProfile();
  const listingId = String(formData.get("listingId") ?? "").trim();
  const returnTo = getSafeReturnPath(String(formData.get("returnTo") ?? ""));

  if (!listingId || !(await getMarketplaceListingById(listingId))) {
    redirect(getRedirectWithNotice(returnTo, "cart-add-failed"));
  }

  const result = await toggleCartListingId(listingId);

  revalidateBuyerWorkspace();

  redirect(
    getRedirectWithNotice(returnTo, result.inCart ? "cart-added" : "cart-removed")
  );
}

export async function toggleCartListingInlineAction(listingId: string) {
  await requireAccountProfile();
  const safeListingId = String(listingId).trim();

  if (!safeListingId || !(await getMarketplaceListingById(safeListingId))) {
    return {
      ok: false,
      inCart: false,
      message: "We could not update your cart right now."
    };
  }

  const result = await toggleCartListingId(safeListingId);

  revalidateBuyerWorkspace();

  return {
    ok: true,
    inCart: result.inCart,
    message: result.inCart ? "Listing added to your cart." : "Listing removed from your cart."
  };
}

export async function buyNowAction(formData: FormData) {
  const profile = await requireAccountProfile();
  const listingId = String(formData.get("listingId") ?? "").trim();
  const returnTo = getSafeReturnPath(String(formData.get("returnTo") ?? ""));

  if (!listingId) {
    redirect(getRedirectWithNotice(returnTo, "buy-now-failed"));
  }

  const listing = await getMarketplaceListingById(listingId);

  if (!listing || listing.status !== "approved" || listing.seller_id === profile.id) {
    redirect(getRedirectWithNotice(returnTo, "buy-now-failed"));
  }

  const buyerOrders = await getBuyerOrders(profile);
  const existingPendingOrder = buyerOrders.find(
    (order) => order.listing_id === listingId && order.status === "pending"
  );

  if (existingPendingOrder) {
    redirect(getCheckoutPath(existingPendingOrder.id, "checkout-resumed"));
  }

  const existingPaidOrder = buyerOrders.find(
    (order) => order.listing_id === listingId && isOrderPaymentConfirmed(order.status)
  );

  if (existingPaidOrder) {
    redirect(getOrderDetailPath(existingPaidOrder.id, "payment-already-confirmed"));
  }

  const nextOrder = await createPendingOrderForListing({
    buyerId: profile.id,
    buyerName: profile.full_name,
    buyerEmail: profile.email,
    sellerId: listing.seller_id,
    listingId: listing.id,
    listingTitle: listing.title,
    amount: listing.price
  });

  if (!nextOrder) {
    redirect(getRedirectWithNotice(returnTo, "buy-now-failed"));
  }

  revalidateBuyerCheckout(listing.id, nextOrder.id);

  redirect(getCheckoutPath(nextOrder.id));
}

export async function removeSavedListingAction(formData: FormData) {
  await requireAccountProfile();
  const listingId = String(formData.get("listingId") ?? "").trim();
  const returnTo = getSafeReturnPath(String(formData.get("returnTo") ?? ""), "/account/saved");

  if (!listingId) {
    redirect(getRedirectWithNotice(returnTo, "listing-remove-failed"));
  }

  await removeSavedListingId(listingId);

  revalidateBuyerWorkspace();

  redirect(getRedirectWithNotice(returnTo, "listing-unsaved"));
}

export async function removeCartListingAction(formData: FormData) {
  await requireAccountProfile();
  const listingId = String(formData.get("listingId") ?? "").trim();
  const returnTo = getSafeReturnPath(String(formData.get("returnTo") ?? ""), "/account/cart");

  if (!listingId) {
    redirect(getRedirectWithNotice(returnTo, "cart-remove-failed"));
  }

  await removeCartListingId(listingId);

  revalidateBuyerWorkspace();

  redirect(getRedirectWithNotice(returnTo, "cart-removed"));
}

export async function revealOrderDeliveryAction(formData: FormData) {
  const profile = await requireAccountProfile();
  const orderId = String(formData.get("orderId") ?? "").trim();
  const fromPage = String(formData.get("fromPage") ?? "").trim();
  const fromPageQuery = fromPage && fromPage !== "1" ? `&fromPage=${encodeURIComponent(fromPage)}` : "";

  if (!orderId) {
    redirect("/account/orders");
  }

  const orderDetail = await getBuyerOrderDetail(profile, orderId);

  if (!orderDetail) {
    redirect("/account/orders");
  }

  if (!orderDetail.paymentConfirmed) {
    redirect(`/account/orders/${orderId}?notice=delivery-locked${fromPageQuery}`);
  }

  if (!orderDetail.deliveryAvailable) {
    redirect(`/account/orders/${orderId}?notice=delivery-unavailable${fromPageQuery}`);
  }

  redirect(`/account/orders/${orderId}?notice=delivery-revealed&showDelivery=1${fromPageQuery}`);
}

export async function completeCheckoutAction(formData: FormData) {
  const profile = await requireAccountProfile();
  const orderId = String(formData.get("orderId") ?? "").trim();
  const paymentMode = String(formData.get("paymentMode") ?? "").trim();
  const buyerPhone = String(formData.get("buyerPhone") ?? "").trim();
  const cardholderName = String(formData.get("cardholderName") ?? "").trim();
  const cardNumber = String(formData.get("cardNumber") ?? "").replace(/\s+/g, "");
  const expiry = String(formData.get("expiry") ?? "").trim();
  const cvv = String(formData.get("cvv") ?? "").trim();
  const useMockProvider = paymentMode === "paystack_mock";

  if (!orderId) {
    redirect("/account/orders");
  }

  const orderDetail = await getBuyerOrderDetail(profile, orderId);

  if (!orderDetail) {
    redirect("/account/orders");
  }

  const { order, listing, paymentConfirmed } = orderDetail;

  if (paymentConfirmed) {
    redirect(getOrderDetailPath(order.id, "payment-already-confirmed"));
  }

  if (order.status !== "pending" || !listing || listing.seller_id === profile.id) {
    redirect(getCheckoutPath(order.id, "checkout-unavailable"));
  }

  const cardDetailsInvalid =
    !useMockProvider &&
    (cardholderName.length < 3 ||
      !/^\d{12,19}$/.test(cardNumber) ||
      !isValidExpiry(expiry) ||
      !/^\d{3,4}$/.test(cvv));

  if (!buyerPhone || !isValidPhoneNumber(buyerPhone) || cardDetailsInvalid) {
    redirect(getCheckoutPath(order.id, "payment-invalid"));
  }

  const paymentReference = getPaymentReference();
  const paymentLast4 = useMockProvider ? "TEST" : cardNumber.slice(-4);
  const paymentResult = await markOrderPaid({
    orderId: order.id,
    listingId: order.listing_id,
    buyerPhone,
    paymentReference,
    paymentLast4,
    paymentProvider: useMockProvider ? "paystack_mock" : "secure_checkout",
    paymentChannel: useMockProvider ? "provider_test" : "card"
  });

  if (!paymentResult.ok) {
    redirect(
      getCheckoutPath(
        order.id,
        paymentResult.reason === "listing-unavailable"
          ? "checkout-unavailable"
          : "payment-failed"
      )
    );
  }

  await removeCartListingId(order.listing_id);

  revalidateBuyerCheckout(order.listing_id, order.id);

  redirect(`/account/checkout/${order.id}/success`);
}
