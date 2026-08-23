import "server-only";

const PAYSTACK_BASE_URL = "https://api.paystack.co";

type PaystackInitializeResponse = {
  status: boolean;
  message: string;
  data?: {
    authorization_url: string;
    access_code: string;
    reference: string;
  };
};

type PaystackVerifyResponse = {
  status: boolean;
  message: string;
  data?: {
    id: number;
    status: string;
    reference: string;
    amount: number;
    currency: string;
    channel?: string | null;
    paid_at?: string | null;
    metadata?: unknown;
    authorization?: {
      last4?: string | null;
      channel?: string | null;
      card_type?: string | null;
      bank?: string | null;
    } | null;
    customer?: {
      email?: string | null;
    } | null;
  };
};

export type PaystackCheckoutMetadata = {
  order_id: string;
  listing_id: string;
  buyer_id: string;
  buyer_phone: string;
};

export type VerifiedPaystackTransaction = {
  reference: string;
  amount: number;
  currency: string;
  channel: string;
  last4: string;
  paidAt: string;
  metadata: Partial<PaystackCheckoutMetadata>;
};

function getPaystackSecretKey() {
  return process.env.PAYSTACK_SECRET_KEY?.trim() ?? "";
}

export function hasPaystackEnv() {
  return Boolean(getPaystackSecretKey());
}

function getMetadata(value: unknown): Partial<PaystackCheckoutMetadata> {
  if (!value || typeof value !== "object") {
    return {};
  }

  const metadata = value as Record<string, unknown>;

  return {
    order_id: typeof metadata.order_id === "string" ? metadata.order_id : undefined,
    listing_id: typeof metadata.listing_id === "string" ? metadata.listing_id : undefined,
    buyer_id: typeof metadata.buyer_id === "string" ? metadata.buyer_id : undefined,
    buyer_phone: typeof metadata.buyer_phone === "string" ? metadata.buyer_phone : undefined
  };
}

export async function initializePaystackTransaction({
  email,
  amount,
  reference,
  callbackUrl,
  metadata
}: {
  email: string;
  amount: number;
  reference: string;
  callbackUrl: string;
  metadata: PaystackCheckoutMetadata;
}) {
  const secretKey = getPaystackSecretKey();

  if (!secretKey) {
    return {
      ok: false as const,
      reason: "missing-config" as const
    };
  }

  const response = await fetch(`${PAYSTACK_BASE_URL}/transaction/initialize`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${secretKey}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      email,
      amount: Math.round(amount * 100),
      currency: "NGN",
      reference,
      callback_url: callbackUrl,
      metadata
    }),
    cache: "no-store"
  });

  const payload = (await response.json()) as PaystackInitializeResponse;

  if (!response.ok || !payload.status || !payload.data?.authorization_url) {
    return {
      ok: false as const,
      reason: "initialize-failed" as const,
      message: payload.message
    };
  }

  return {
    ok: true as const,
    authorizationUrl: payload.data.authorization_url,
    reference: payload.data.reference
  };
}

export async function verifyPaystackTransaction(reference: string) {
  const secretKey = getPaystackSecretKey();

  if (!secretKey) {
    return {
      ok: false as const,
      reason: "missing-config" as const
    };
  }

  const response = await fetch(
    `${PAYSTACK_BASE_URL}/transaction/verify/${encodeURIComponent(reference)}`,
    {
      headers: {
        Authorization: `Bearer ${secretKey}`
      },
      cache: "no-store"
    }
  );

  const payload = (await response.json()) as PaystackVerifyResponse;
  const transaction = payload.data;

  if (!response.ok || !payload.status || !transaction || transaction.status !== "success") {
    return {
      ok: false as const,
      reason: "verify-failed" as const,
      message: payload.message
    };
  }

  return {
    ok: true as const,
    transaction: {
      reference: transaction.reference,
      amount: transaction.amount / 100,
      currency: transaction.currency,
      channel:
        transaction.authorization?.channel ??
        transaction.channel ??
        "paystack",
      last4: transaction.authorization?.last4 ?? "PAYSTACK",
      paidAt: transaction.paid_at ?? new Date().toISOString(),
      metadata: getMetadata(transaction.metadata)
    } satisfies VerifiedPaystackTransaction
  };
}
