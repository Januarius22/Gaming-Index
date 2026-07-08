import type { Metadata } from "next";
import LegalPageShell from "@/components/legal/LegalPageShell";

export const metadata: Metadata = {
  title: "Disclaimer | Gaming Index",
  description:
    "Important marketplace, platform, account-transfer, and third-party game disclaimer for Gaming Index."
};

const lastUpdated = "July 8, 2026";

function Section({
  title,
  children
}: Readonly<{
  title: string;
  children: React.ReactNode;
}>) {
  return (
    <section className="rounded-[30px] border border-border/75 bg-white p-7 shadow-[0_22px_60px_-42px_rgba(6,43,99,0.36)] sm:p-8">
      <h2 className="font-heading text-2xl font-semibold text-foreground">{title}</h2>
      <div className="mt-4 space-y-4 text-sm leading-7 text-muted-foreground sm:text-[15px]">
        {children}
      </div>
    </section>
  );
}

export default function DisclaimerPage() {
  return (
    <LegalPageShell
      eyebrow="Disclaimer"
      title="Important marketplace and third-party platform notice."
      summary="Gaming Index is an independent marketplace. Buyers and sellers should review listing details, transfer limits, and third-party platform rules before using the service."
      lastUpdated={lastUpdated}
    >
      <Section title="Independent Marketplace">
        <p>
          Gaming Index is not owned, operated, endorsed, or sponsored by any game publisher,
          console network, app store, payment provider, or third-party platform shown in listings.
          Game names, platform names, logos, and related references belong to their respective
          owners.
        </p>
      </Section>

      <Section title="Account Transfer Risk">
        <p>
          Digital account transfers may be affected by the rules, technical controls, or enforcement
          decisions of the original game or platform operator. Gaming Index does not guarantee that a
          third-party platform will permit, recognize, or continue supporting any account transfer.
        </p>
      </Section>

      <Section title="Seller Responsibility">
        <p>
          Sellers are responsible for listing only accounts they are authorized to transfer. Listing
          details, screenshots, access information, recovery details, and transfer notes must be
          accurate and must not mislead buyers.
        </p>
      </Section>

      <Section title="Buyer Review">
        <p>
          Buyers are responsible for reviewing the listing, seller information, price, platform,
          login method, delivery details, and available evidence before checkout. Marketplace tools
          can reduce risk, but they do not remove every risk attached to digital-account purchases.
        </p>
      </Section>

      <Section title="Disputes and Moderation">
        <p>
          Gaming Index may review orders, messages, uploaded evidence, listing details, and account
          history when handling disputes or safety reports. Outcomes may include refunds, listing
          removal, seller restrictions, account suspension, or other moderation actions.
        </p>
      </Section>

      <Section title="No Professional Advice">
        <p>
          Information on Gaming Index is provided for marketplace use only. It is not legal,
          financial, tax, or security advice. Users should make their own decisions based on their
          circumstances and the rules that apply to them.
        </p>
      </Section>
    </LegalPageShell>
  );
}
