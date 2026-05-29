import type { Metadata } from "next";
import LegalPageShell from "@/components/legal/LegalPageShell";

export const metadata: Metadata = {
  title: "Privacy Policy | Gaming Index",
  description: "How Gaming Index collects, uses, stores, and protects marketplace and account data."
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

export default function PrivacyPolicyPage() {
  return (
    <LegalPageShell
      eyebrow="Privacy Policy"
      title="Your account, listing, and verification data should not feel like a mystery."
      summary="This policy explains what Gaming Index collects, why we collect it, how we use it, and the controls users have when buying, selling, saving listings, submitting KYC, or signing in."
      lastUpdated={lastUpdated}
    >
      <Section title="1. Scope">
        <p>
          This Privacy Policy applies to Gaming Index, including our public marketplace, buyer and
          seller dashboards, administrative review tools, authentication flows, cookies, and
          verification features. It covers information collected when you browse the site, create an
          account, save or cart listings, upload a seller listing, submit KYC documents, or interact
          with marketplace activity.
        </p>
        <p>
          If you do not agree with this policy, do not use the service. Because marketplace,
          privacy, and identity-verification rules can vary by region, you should also have this
          policy reviewed by counsel before production launch.
        </p>
      </Section>

      <Section title="2. Information We Collect">
        <p>Depending on how you use the service, we may collect:</p>
        <ul className="list-disc space-y-2 pl-5">
          <li>Account details such as full name, username, email address, and authentication data needed to sign you in.</li>
          <li>Profile details such as seller enablement status, KYC status, role, and timestamps tied to account activity.</li>
          <li>Marketplace listing data such as game title, platform, account level, login method, notes, screenshots, seller display information, price, and listing status.</li>
          <li>KYC and compliance data such as legal name, document numbers, address information, phone number, selfie files, and identity or proof-of-address uploads.</li>
          <li>Buyer activity data such as saved listings, cart selections, ratings, and interactions connected to account or browser state.</li>
          <li>Operational data such as IP-derived session signals, browser metadata, timestamps, and actions needed to secure the service and investigate abuse.</li>
        </ul>
      </Section>

      <Section title="3. Cookies and Similar Storage">
        <p>
          Gaming Index uses cookies and similar browser storage to keep core features working. These
          include session cookies for authentication, state cookies used in demo or fallback flows,
          and browser-stored preferences that remember saved listings, cart selections, or consent
          choices.
        </p>
        <p>
          We use a first-visit consent banner so users can choose to accept all site cookies or
          continue with essential cookies only. Essential cookies may still be used when required to
          provide secure login, marketplace access, and account continuity.
        </p>
      </Section>

      <Section title="4. How We Use Information">
        <ul className="list-disc space-y-2 pl-5">
          <li>Provide account registration, login, session handling, and dashboard access.</li>
          <li>Publish, moderate, display, and manage marketplace listings.</li>
          <li>Review seller KYC submissions and maintain marketplace trust and fraud controls.</li>
          <li>Remember user preferences such as saved items, cart activity, and buyer workspace state.</li>
          <li>Investigate abuse, suspicious behavior, policy breaches, or disputes.</li>
          <li>Operate support, internal review, and service-improvement workflows.</li>
        </ul>
      </Section>

      <Section title="5. Marketplace Visibility and Private Data">
        <p>
          Information intentionally included in a listing can appear to marketplace users, admins,
          or both, depending on the feature. Sellers should never upload personal or unrelated
          information in public listing fields. Identity-verification files, review outcomes, and
          admin-only moderation details are handled separately from public listing cards.
        </p>
        <p>
          If credential-delivery features are added later, those should be stored separately from
          public listing content and released only after the relevant purchase conditions are met.
        </p>
      </Section>

      <Section title="6. Service Providers and Infrastructure">
        <p>
          We may rely on third-party infrastructure providers to host the application, manage
          authentication, store files, and operate marketplace data. In the current application
          structure, this can include backend storage, authentication, database, and file-hosting
          services that process data on our behalf.
        </p>
        <p>
          Those providers may process personal data only to deliver the service, maintain security,
          or comply with legal obligations.
        </p>
      </Section>

      <Section title="7. Retention">
        <p>
          We retain information for as long as needed to operate the marketplace, satisfy internal
          review requirements, resolve disputes, investigate fraud, and comply with legal or
          administrative obligations. KYC data and marketplace moderation records may be retained
          longer than ordinary browsing data because of trust and safety needs.
        </p>
      </Section>

      <Section title="8. Security">
        <p>
          We use reasonable administrative, technical, and organizational measures to protect
          account, listing, and verification information. No platform can promise absolute security,
          and users remain responsible for choosing strong passwords, securing their devices, and
          avoiding the upload of unnecessary personal information.
        </p>
      </Section>

      <Section title="9. Your Choices">
        <ul className="list-disc space-y-2 pl-5">
          <li>You can control cookie consent choices at first visit by accepting all cookies or using essential-only cookies.</li>
          <li>You can edit or remove listing content you control, subject to marketplace and compliance rules.</li>
          <li>You can request account closure or ask questions about stored data through the contact method the platform provides.</li>
          <li>You should avoid submitting personal inbox credentials or sensitive information that is not required for the current marketplace flow.</li>
        </ul>
      </Section>

      <Section title="10. Children and Restricted Users">
        <p>
          Gaming Index is not intended for children or for users who cannot legally enter into these
          transactions in their jurisdiction. Do not use the service if you are prohibited from
          doing so by local law, platform terms, or account-transfer restrictions tied to a game or
          publisher.
        </p>
      </Section>

      <Section title="11. Policy Updates">
        <p>
          We may update this Privacy Policy from time to time. When we do, we will revise the
          effective date above and may add additional notice if the changes are material.
        </p>
      </Section>
    </LegalPageShell>
  );
}
