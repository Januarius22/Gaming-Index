import Link from "next/link";
import {
  Ban,
  CheckCircle2,
  CreditCard,
  FileCheck2,
  LockKeyhole,
  PackageCheck,
  ShieldCheck,
  ShoppingCart,
  UserCheck
} from "lucide-react";
import HowItWorks from "@/components/public/HowItWorks";
import { buttonClassName } from "@/components/ui/Button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/Card";

const buyerSteps = [
  {
    title: "Browse before you commit",
    description:
      "Open listings, compare price, seller rating, platform, login method, and account level before choosing an account.",
    icon: ShoppingCart
  },
  {
    title: "Checkout creates a record",
    description:
      "When payment is completed, the buyer gets an order page with the account, seller, amount, and delivery status.",
    icon: CreditCard
  },
  {
    title: "Delivery unlocks after payment",
    description:
      "Private login details stay locked until payment is confirmed, then the buyer can open the order and secure the account.",
    icon: LockKeyhole
  }
];

const sellerSteps = [
  {
    title: "Enable seller access",
    description:
      "A normal buyer account can unlock seller tools from the account workspace when the user is ready to list.",
    icon: UserCheck
  },
  {
    title: "Complete verification",
    description:
      "Seller KYC helps keep the marketplace controlled before accounts are published for buyers.",
    icon: FileCheck2
  },
  {
    title: "Publish with delivery details",
    description:
      "Sellers upload one clear grid image, account details, and private delivery information for the paid buyer.",
    icon: PackageCheck
  }
];

const safetyItems = [
  "Sellers complete KYC before publishing accounts.",
  "Private delivery details stay hidden until payment is confirmed.",
  "Admins can take down unsafe listings and add a reason.",
  "Admins can suspend users with a visible reason and restore access later.",
  "Listings from suspended sellers are hidden until the seller is restored.",
  "Orders keep a record of purchase status and delivery access."
];

const faqs = [
  {
    question: "When does a buyer see login details?",
    answer:
      "After payment is confirmed. The order page then unlocks the seller’s delivery details."
  },
  {
    question: "What happens to sold accounts?",
    answer:
      "Sold listings can remain visible for a short time for reference, but buyers cannot buy them again."
  },
  {
    question: "What happens if a seller is suspended?",
    answer:
      "Their live listings are hidden from the marketplace until an admin restores the account."
  },
  {
    question: "Can a suspended user sign in?",
    answer:
      "Yes. They can sign in to view the suspension reason, but account and marketplace actions stay locked."
  }
];

function FlowCard({
  title,
  description,
  icon: Icon,
  index
}: {
  title: string;
  description: string;
  icon: typeof ShoppingCart;
  index: number;
}) {
  return (
    <Card className="h-full border-border/70">
      <CardHeader>
        <div className="flex items-center justify-between gap-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary-soft text-primary">
            <Icon className="h-5 w-5" />
          </div>
          <span className="rounded-full bg-surface px-3 py-1 text-xs font-semibold text-muted-foreground">
            {String(index + 1).padStart(2, "0")}
          </span>
        </div>
        <CardTitle className="pt-4">{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
    </Card>
  );
}

export default function HowItWorksPage() {
  return (
    <div className="pb-16">
      <HowItWorks
        title="A simple flow for buyers and sellers"
        description="Gaming Index keeps browsing, checkout, seller verification, and account delivery in one clear process."
        className="pb-8 pt-6"
      />

      <section className="px-4 py-10 sm:px-6 lg:px-8">
        <div className="mx-auto grid max-w-7xl gap-8 lg:grid-cols-2">
          <div className="space-y-5">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.18em] text-primary">
                Buyer flow
              </p>
              <h2 className="mt-3 font-heading text-3xl font-semibold text-foreground">
                From listing to delivery
              </h2>
            </div>
            <div className="grid gap-4">
              {buyerSteps.map((step, index) => (
                <FlowCard key={step.title} {...step} index={index} />
              ))}
            </div>
          </div>

          <div className="space-y-5">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.18em] text-primary">
                Seller flow
              </p>
              <h2 className="mt-3 font-heading text-3xl font-semibold text-foreground">
                From verification to listing
              </h2>
            </div>
            <div className="grid gap-4">
              {sellerSteps.map((step, index) => (
                <FlowCard key={step.title} {...step} index={index} />
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="px-4 py-10 sm:px-6 lg:px-8">
        <div className="mx-auto grid max-w-7xl gap-5 lg:grid-cols-[0.9fr_1.1fr]">
          <div className="space-y-3">
            <p className="text-sm font-semibold uppercase tracking-[0.18em] text-primary">
              Safety
            </p>
            <h2 className="font-heading text-3xl font-semibold text-foreground">
              Built around controlled access
            </h2>
            <p className="text-base leading-7 text-muted-foreground">
              The marketplace is designed so sensitive account delivery details are not exposed
              before payment, and admins can act when a listing or account needs attention.
            </p>
            <div className="flex flex-wrap gap-3 pt-3">
              <Link href="/marketplace" className={buttonClassName({ className: "rounded-2xl" })}>
                Browse Marketplace
              </Link>
              <Link
                href="/auth/register"
                className={buttonClassName({ variant: "secondary", className: "rounded-2xl" })}
              >
                Create Account
              </Link>
            </div>
          </div>

          <Card className="border-border/70">
            <CardContent className="grid gap-3 p-5 sm:grid-cols-2 sm:p-6">
              {safetyItems.map((item, index) => {
                const Icon = index === 3 ? Ban : index === 1 ? LockKeyhole : ShieldCheck;

                return (
                  <div key={item} className="flex gap-3 rounded-3xl bg-surface p-4">
                    <div className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-2xl bg-white text-primary shadow-sm">
                      <Icon className="h-4 w-4" />
                    </div>
                    <p className="text-sm leading-6 text-muted-foreground">{item}</p>
                  </div>
                );
              })}
            </CardContent>
          </Card>
        </div>
      </section>

      <section className="px-4 py-10 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl space-y-5">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.18em] text-primary">
              Questions
            </p>
            <h2 className="mt-3 font-heading text-3xl font-semibold text-foreground">
              Common things to know
            </h2>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            {faqs.map((faq) => (
              <Card key={faq.question} className="border-border/70">
                <CardHeader>
                  <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-primary-soft text-primary">
                    <CheckCircle2 className="h-5 w-5" />
                  </div>
                  <CardTitle className="pt-3 text-xl">{faq.question}</CardTitle>
                  <CardDescription>{faq.answer}</CardDescription>
                </CardHeader>
              </Card>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
