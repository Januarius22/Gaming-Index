import "server-only";
import { cookies } from "next/headers";

const SAVED_LISTINGS_COOKIE = "gi_saved_listings";
const CART_LISTINGS_COOKIE = "gi_cart_listings";

function encodeListingIds(value: string[]) {
  return Buffer.from(JSON.stringify(value), "utf8").toString("base64url");
}

function decodeListingIds(value: string | undefined) {
  if (!value) {
    return [] as string[];
  }

  try {
    const decoded = JSON.parse(Buffer.from(value, "base64url").toString("utf8"));
    return Array.isArray(decoded)
      ? decoded.filter((entry): entry is string => typeof entry === "string" && entry.length > 0)
      : [];
  } catch {
    return [] as string[];
  }
}

async function readListingIdsCookie(name: string) {
  const cookieStore = await cookies();
  return decodeListingIds(cookieStore.get(name)?.value);
}

async function writeListingIdsCookie(name: string, listingIds: string[]) {
  const cookieStore = await cookies();
  cookieStore.set(name, encodeListingIds(Array.from(new Set(listingIds))), {
    httpOnly: true,
    sameSite: "lax",
    path: "/"
  });
}

export async function getSavedListingIds() {
  return readListingIdsCookie(SAVED_LISTINGS_COOKIE);
}

export async function getCartListingIds() {
  return readListingIdsCookie(CART_LISTINGS_COOKIE);
}

export async function toggleSavedListingId(listingId: string) {
  const savedListingIds = await getSavedListingIds();
  const isSaved = savedListingIds.includes(listingId);
  const nextListingIds = isSaved
    ? savedListingIds.filter((entry) => entry !== listingId)
    : [listingId, ...savedListingIds];

  await writeListingIdsCookie(SAVED_LISTINGS_COOKIE, nextListingIds);

  return {
    saved: !isSaved
  };
}

export async function removeSavedListingId(listingId: string) {
  const savedListingIds = await getSavedListingIds();
  const nextListingIds = savedListingIds.filter((entry) => entry !== listingId);
  await writeListingIdsCookie(SAVED_LISTINGS_COOKIE, nextListingIds);
}

export async function addCartListingId(listingId: string) {
  const cartListingIds = await getCartListingIds();

  if (!cartListingIds.includes(listingId)) {
    await writeListingIdsCookie(CART_LISTINGS_COOKIE, [listingId, ...cartListingIds]);
  }
}

export async function toggleCartListingId(listingId: string) {
  const cartListingIds = await getCartListingIds();
  const isInCart = cartListingIds.includes(listingId);
  const nextListingIds = isInCart
    ? cartListingIds.filter((entry) => entry !== listingId)
    : [listingId, ...cartListingIds];

  await writeListingIdsCookie(CART_LISTINGS_COOKIE, nextListingIds);

  return {
    inCart: !isInCart
  };
}

export async function removeCartListingId(listingId: string) {
  const cartListingIds = await getCartListingIds();
  const nextListingIds = cartListingIds.filter((entry) => entry !== listingId);
  await writeListingIdsCookie(CART_LISTINGS_COOKIE, nextListingIds);
}
