import { BookOpen, CircleHelp, LifeBuoy } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/Card";

type Workspace = "account" | "seller" | "admin";
type Mode = "faq" | "help";

const content: Record<Workspace, Record<Mode, Array<{ title: string; body: string }>>> = {
  account: {
    faq: [
      {
        title: "Can I pay for multiple accounts at once?",
        body: "Checkout is one account at a time so each order, delivery vault, dispute window, and refund record stays clean."
      },
      {
        title: "When do I see delivery details?",
        body: "Delivery details unlock after payment is confirmed on the order page."
      },
      {
        title: "How do refunds work?",
        body: "Approved refunds return to your wallet credit. You can use the balance for withdrawal."
      },
      {
        title: "When should I open a dispute?",
        body: "Open a dispute from an eligible paid order when the account access or listing details are not valid."
      }
    ],
    help: [
      {
        title: "Buy an account",
        body: "Open Marketplace, review the listing, add to cart or select Buy Now, then complete checkout from the order page."
      },
      {
        title: "Track purchases",
        body: "Use Order History to continue pending checkout, open paid orders, reveal delivery details, and start disputes."
      },
      {
        title: "Manage wallet credit",
        body: "Wallet shows available refund credit, withdrawal status, and transaction history."
      },
      {
        title: "Get support",
        body: "Use Support for account, payment, withdrawal, listing, or technical requests that are not tied to a dispute."
      }
    ]
  },
  seller: {
    faq: [
      {
        title: "Why do I need KYC?",
        body: "KYC keeps upload access controlled and helps protect buyers from unsafe marketplace activity."
      },
      {
        title: "When are funds available?",
        body: "Sale funds first move into pending balance, then become available after admin release."
      },
      {
        title: "Where do buyer reviews show?",
        body: "Verified buyer reviews appear on your Reviews page and affect your public seller rating."
      },
      {
        title: "Can I edit a sold listing?",
        body: "Sold and taken-down listings remain in history for records. Active listing changes should be handled before checkout."
      }
    ],
    help: [
      {
        title: "Upload a listing",
        body: "Complete KYC, open Upload Account, add one clear grid image, fill the account details, and save private delivery details."
      },
      {
        title: "Release readiness",
        body: "Keep delivery details accurate before a buyer pays. Admin and buyer workflows depend on the saved vault details."
      },
      {
        title: "Withdraw earnings",
        body: "Open Withdrawals, enter an amount within available balance, confirm bank details, and submit the request."
      },
      {
        title: "Handle disputes",
        body: "Open Disputes to follow case messages and respond with useful context when a buyer raises a case."
      }
    ]
  },
  admin: {
    faq: [
      {
        title: "What should be reviewed first?",
        body: "Prioritize paid orders, open disputes, withdrawals, pending KYC, and support requests."
      },
      {
        title: "How should seller enforcement work?",
        body: "Use warning, restriction, takedown, refund, or suspension based on evidence and impact."
      },
      {
        title: "Do currency rates affect stored funds?",
        body: "No. Financial records stay in NGN. Rates only control display conversion."
      },
      {
        title: "Can hidden reviews still be audited?",
        body: "Yes. Moderated reviews remain available in the admin review tools with the admin reason."
      }
    ],
    help: [
      {
        title: "Review marketplace operations",
        body: "Use Analytics for high-level movement, then open Orders, Withdrawals, Disputes, or Listings for action."
      },
      {
        title: "Manage sellers",
        body: "Open Sellers to check identity, KYC posture, sales, listings, disputes, ratings, and contact details."
      },
      {
        title: "Set currency rates",
        body: "Open Currency Rates and update enabled display rates against NGN when market rates change."
      },
      {
        title: "Close support requests",
        body: "Reply while a ticket is open or in review, then move it to resolved or closed once handled."
      }
    ]
  }
};

export default function DashboardGuidePage({
  workspace,
  mode
}: {
  workspace: Workspace;
  mode: Mode;
}) {
  const entries = content[workspace][mode];
  const Icon = mode === "faq" ? CircleHelp : BookOpen;

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center gap-3">
            <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-primary-soft text-primary">
              <Icon className="h-5 w-5" />
            </span>
            <div>
              <CardTitle>{mode === "faq" ? "FAQs" : "Help guide"}</CardTitle>
              <CardDescription>
                {mode === "faq"
                  ? "Straight answers for common workspace questions."
                  : "Quick directions for the workflows used most often."}
              </CardDescription>
            </div>
          </div>
        </CardHeader>
      </Card>

      <div className="grid gap-4 lg:grid-cols-2">
        {entries.map((entry) => (
          <Card key={entry.title}>
            <CardContent className="flex gap-4 p-5">
              <span className="mt-1 flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-white text-primary shadow-sm">
                <LifeBuoy className="h-4 w-4" />
              </span>
              <div>
                <h2 className="font-heading text-lg font-semibold text-foreground">
                  {entry.title}
                </h2>
                <p className="mt-2 text-sm leading-7 text-muted-foreground">{entry.body}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
