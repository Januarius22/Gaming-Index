import type { Metadata } from "next";
import LegalPageShell from "@/components/legal/LegalPageShell";

export const metadata: Metadata = {
  title: "Terms & Conditions | Gaming Index",
  description: "Marketplace rules, user responsibilities, KYC expectations, and platform terms for Gaming Index."
};

const lastUpdated = "May 27, 2026";

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

export default function TermsPage() {
  return (
    <LegalPageShell
      eyebrow="Terms & Conditions"
      title="Marketplace access comes with rules for buyers, sellers, and account safety."
      summary="These terms govern use of Gaming Index, including account creation, KYC review, listing uploads, marketplace participation, moderation rights, and buyer or seller conduct across the platform."
      lastUpdated={lastUpdated}
    >
      <Section title="1. Acceptance of Terms">
        <p>
          By accessing or using Gaming Index, you agree to these Terms &amp; Conditions and to the
          associated Privacy Policy. If you do not agree, do not use the service.
        </p>
      </Section>

      <Section title="2. Marketplace Role">
        <p>
          Gaming Index provides marketplace, workflow, moderation, and dashboard tooling for buyers,
          sellers, and administrators. Unless explicitly stated otherwise, Gaming Index is not the
          original publisher of the games represented in listings and does not guarantee that any
          game publisher permits account transfer, resale, or reassignment.
        </p>
      </Section>

      <Section title="3. Eligibility and Account Responsibilities">
        <ul className="list-disc space-y-2 pl-5">
          <li>You must provide accurate registration information and keep it current.</li>
          <li>You are responsible for activity under your account and for safeguarding your sign-in credentials.</li>
          <li>You may not impersonate another person, create misleading seller identities, or use the service for fraud, abuse, or unlawful conduct.</li>
          <li>If you are not legally allowed to buy, sell, or transfer an account in your jurisdiction or under the game publisher&apos;s rules, you must not use the marketplace for that purpose.</li>
        </ul>
      </Section>

      <Section title="4. Seller Obligations">
        <ul className="list-disc space-y-2 pl-5">
          <li>Sellers must have the right to list, describe, and transfer the account they upload.</li>
          <li>Sellers must provide truthful listing details, screenshots, and descriptions that do not materially mislead buyers.</li>
          <li>Sellers must not upload stolen accounts, compromised credentials, chargeback-prone goods, or accounts tied to another person&apos;s personal data without authorization.</li>
          <li>Sellers may be required to complete KYC, identity review, or admin verification before certain marketplace actions remain available.</li>
          <li>Sellers should avoid listing personal inbox credentials and should use transfer-safe account methods whenever possible.</li>
        </ul>
      </Section>

      <Section title="5. Buyer Obligations">
        <ul className="list-disc space-y-2 pl-5">
          <li>Buyers are responsible for reviewing listing details carefully before acting on a listing.</li>
          <li>Buyers must not misuse seller information, attempt off-platform fraud, or use purchased access for unlawful or abusive behavior.</li>
          <li>After delivery, buyers should promptly rotate passwords, recovery details, and linked credentials where permitted.</li>
        </ul>
      </Section>

        <Section title="6. KYC, Moderation, and Enforcement">
          <p>
            Gaming Index may request identity verification, residential address details, selfies, or related
            materials from sellers and may use admins or automated checks to review listings, seller
            status, or marketplace activity. We may remove, suspend, limit, hide, reject, or take
          down listings or accounts at any time when needed for safety, policy enforcement, or
          legal risk management.
        </p>
      </Section>

      <Section title="7. Orders, Delivery, and Payment Limits">
        <p>
          Buyer actions may place listings into cart, create pending orders, or move a buyer into
          checkout before credential delivery is released. Delivery details must remain protected
          until the platform marks the relevant order as paid or otherwise eligible for release.
        </p>
        <p>
          Payment, credential-delivery, payout, dispute handling, and seller release workflows may
          be updated over time and may be subject to additional requirements, review windows, or
          operational safeguards.
        </p>
      </Section>

      <Section title="8. Prohibited Conduct">
        <ul className="list-disc space-y-2 pl-5">
          <li>Fraud, phishing, credential theft, reclaim attempts, or social engineering.</li>
          <li>Uploading illegal, infringing, deceptive, or harmful content.</li>
          <li>Using the platform to evade game publisher enforcement or to launder compromised digital goods.</li>
          <li>Attempting to bypass moderation, KYC review, rate limits, or account restrictions.</li>
        </ul>
      </Section>

      <Section title="9. No Guarantee and Assumption of Risk">
        <p>
          Marketplace transactions involving gaming accounts carry risk, including publisher
          enforcement, access loss, reclaim disputes, linked-email complications, or changes made by
          third-party game operators. Gaming Index does not guarantee uninterrupted access,
          continuing publisher acceptance, or a perfectly risk-free transfer.
        </p>
      </Section>

      <Section title="10. Intellectual Property and Platform Rights">
        <p>
          The Gaming Index brand, marketplace interface, software, workflows, and related materials
          remain the property of the platform operator or its licensors. Users may not copy,
          reverse-engineer, or commercially exploit the service except as expressly allowed.
        </p>
      </Section>

      <Section title="11. Limitation of Liability">
        <p>
          To the fullest extent allowed by law, Gaming Index and its operators will not be liable
          for indirect, incidental, special, consequential, punitive, or lost-profit damages arising
          from marketplace use, account-transfer disputes, third-party game enforcement, service
          outages, or user misconduct. Any direct liability that cannot legally be excluded will be
          limited to the amount paid to Gaming Index for the specific transaction giving rise to the
          claim, if any.
        </p>
      </Section>

      <Section title="12. Changes to These Terms">
        <p>
          We may revise these Terms &amp; Conditions to reflect product changes, risk controls,
          legal requirements, or operational updates. Continued use of the service after a change
          takes effect means you accept the revised terms.
        </p>
      </Section>
    </LegalPageShell>
  );
}
