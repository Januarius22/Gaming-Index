import { NextResponse } from "next/server";
import { getPaystackCheckoutVerificationPath } from "@/actions/account";

export async function GET(request: Request) {
  const url = new URL(request.url);
  const reference = url.searchParams.get("reference") ?? url.searchParams.get("trxref") ?? "";
  const redirectPath = await getPaystackCheckoutVerificationPath(reference);

  return NextResponse.redirect(new URL(redirectPath, url.origin));
}
