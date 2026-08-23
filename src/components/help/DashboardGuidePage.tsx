import {
  BookOpen,
  CircleHelp,
  CreditCard,
  LifeBuoy,
  ListChecks,
  MessageSquareWarning,
  ShieldCheck,
  WalletCards
} from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/Card";

type Workspace = "account" | "seller" | "admin";
type Mode = "faq" | "help";

type GuideEntry = {
  title: string;
  body: string;
  points?: string[];
};

type GuideSection = {
  title: string;
  description: string;
  entries: GuideEntry[];
};

const content: Record<Workspace, Record<Mode, GuideSection[]>> = {
  account: {
    faq: [
      {
        title: "Buying And Checkout",
        description: "Payment, cart, delivery, and order access.",
        entries: [
          {
            title: "Can I pay for multiple accounts at once?",
            body: "Checkout is one account at a time. This keeps each order, delivery vault, dispute window, and refund trail separate."
          },
          {
            title: "Why does an account say checkout is unavailable?",
            body: "Checkout closes when the listing is sold, taken down, withdrawn, rejected, expired from a pending hold, or no longer approved for purchase."
          },
          {
            title: "When do I see delivery details?",
            body: "Delivery details unlock on the order page after payment is confirmed. If payment is still pending, the delivery vault remains locked."
          },
          {
            title: "Can a seller see my private information?",
            body: "Sellers see order information needed to complete the sale. Support and dispute conversations stay inside Gaming Index so private contact is not required."
          }
        ]
      },
      {
        title: "Wallet, Refunds, And Withdrawals",
        description: "How credit, refunds, and withdrawal requests behave.",
        entries: [
          {
            title: "How do refunds work?",
            body: "Approved refunds return to your wallet credit. You can track the transaction, then request withdrawal when the balance is available."
          },
          {
            title: "Why is my wallet shown in another currency?",
            body: "Gaming Index stores financial records in NGN as the base currency. Your selected currency is used for display estimates."
          },
          {
            title: "Can I withdraw buyer wallet credit?",
            body: "Yes. Refund credit that is available in your wallet can be submitted for withdrawal from the Withdrawals page."
          },
          {
            title: "Why was my withdrawal rejected?",
            body: "A withdrawal may be rejected when bank details are incomplete, the account name cannot be verified, or a review issue is found. The admin note appears in withdrawal history."
          }
        ]
      },
      {
        title: "Disputes, Reviews, And Account Status",
        description: "What happens when something needs review.",
        entries: [
          {
            title: "When should I open a dispute?",
            body: "Open a dispute from an eligible paid order if access details are invalid, the account does not match the listing, or delivery cannot be completed."
          },
          {
            title: "Why can I not open a dispute on some orders?",
            body: "A dispute button is disabled when the order is outside the dispute window, not paid, already has a case, or is not eligible under the current order state."
          },
          {
            title: "Can I review a seller?",
            body: "Yes, after an eligible purchase. Reviews are tied to buyer history so ratings stay connected to real transactions."
          },
          {
            title: "What does account limited or under review mean?",
            body: "Some actions may be paused while Gaming Index reviews safety, payment, dispute, or account activity."
          }
        ]
      }
    ],
    help: [
      {
        title: "Find And Buy Accounts",
        description: "The normal buyer flow from browsing to checkout.",
        entries: [
          {
            title: "Browse the marketplace",
            body: "Open Marketplace, use filters for game, price, and status, then open a listing for full details.",
            points: ["Check the game, account level, login method, seller rating, price, and image.", "Use saved listings for accounts you want to compare later."]
          },
          {
            title: "Start checkout",
            body: "Use Buy Now from a listing or open Cart for staged accounts. Checkout stays one order at a time.",
            points: ["Review the amount before paying.", "Return to Order History if a checkout remains pending."]
          },
          {
            title: "Open delivery details",
            body: "After payment confirmation, go to Order History and open the order to view the delivery vault."
          },
          {
            title: "Keep your proof",
            body: "Save useful screenshots around payment and delivery. They help support if an issue needs review."
          }
        ]
      },
      {
        title: "Manage Purchases",
        description: "Where to go after payment.",
        entries: [
          {
            title: "Order History",
            body: "Use Order History to continue pending checkout, open paid orders, reveal delivery details, review seller information, and access case actions."
          },
          {
            title: "Disputes",
            body: "Use Disputes when a paid order has an account access issue. Upload clear screenshots and a short video when needed."
          },
          {
            title: "Wallet",
            body: "Wallet shows available refund credit, totals, and transaction movements. Withdrawals handles bank payout requests."
          },
          {
            title: "Notifications",
            body: "Notifications show payment updates, dispute messages, refunds, withdrawal progress, account status, and Gaming Index announcements."
          }
        ]
      },
      {
        title: "Account Settings And Support",
        description: "Profile, preferences, and help channels.",
        entries: [
          {
            title: "Profile settings",
            body: "Update your display name, profile photo, appearance, font size, notification preferences, payout defaults, and account control options."
          },
          {
            title: "Seller access",
            body: "Use Seller Access when you are ready to list accounts. If enabled, the workspace switcher lets you move between buyer and seller dashboards."
          },
          {
            title: "Support tickets",
            body: "Use Support for payment questions, withdrawal help, technical issues, or account questions that are not tied to an active dispute."
          },
          {
            title: "Account safety",
            body: "Do not share passwords outside the delivery vault or dispute/support systems. Keep all case communication inside Gaming Index."
          }
        ]
      }
    ]
  },
  seller: {
    faq: [
      {
        title: "Seller Access And Listings",
        description: "Requirements before and after listing accounts.",
        entries: [
          {
            title: "Why do I need KYC?",
            body: "KYC keeps upload access controlled and helps protect buyers from unsafe marketplace activity."
          },
          {
            title: "Why can upload be locked?",
            body: "Upload can be locked when KYC is not approved, the seller account is restricted, or account status is under review."
          },
          {
            title: "Can I upload multiple images?",
            body: "Listings use one main grid image for marketplace clarity. Disputes and support can carry multiple evidence files when needed."
          },
          {
            title: "Can I edit a sold listing?",
            body: "Sold, refunded, taken-down, and withdrawn listings remain in history for records. Active listing details should be correct before checkout."
          }
        ]
      },
      {
        title: "Sales, Funds, And Withdrawals",
        description: "How seller earnings move through the system.",
        entries: [
          {
            title: "When are funds available?",
            body: "Sale funds first move into pending balance. They become available after the buyer protection hold and admin release."
          },
          {
            title: "How does Gaming Index commission work?",
            body: "Commission is deducted from the sale amount before seller payout. The current platform rate is controlled from admin business settings."
          },
          {
            title: "Why is my wallet shown in another currency?",
            body: "Funds are stored in NGN as the base currency. Your selected display currency is an estimate based on the active rate table."
          },
          {
            title: "How do withdrawals work?",
            body: "Submit a withdrawal from available balance. Admin reviews the request, adds payout proof when paid, or returns funds if rejected."
          }
        ]
      },
      {
        title: "Disputes, Ratings, And Enforcement",
        description: "What happens when buyer issues or quality problems appear.",
        entries: [
          {
            title: "Will I join every dispute automatically?",
            body: "No. Gaming Index reviews buyer evidence first. Sellers are invited only when admin needs seller response."
          },
          {
            title: "What should I upload in a dispute?",
            body: "Upload clear proof that the account details were correct, delivery was completed, or the issue is not caused by the listing."
          },
          {
            title: "Where do buyer reviews show?",
            body: "Verified buyer reviews appear on your Reviews page and affect your public seller rating."
          },
          {
            title: "What can trigger restrictions?",
            body: "Invalid delivery, repeated disputes, misleading listings, private contact pressure, unsafe account details, or policy abuse can trigger warnings, restrictions, takedowns, refunds, or suspension."
          }
        ]
      }
    ],
    help: [
      {
        title: "Start Selling",
        description: "From verification to a clean listing.",
        entries: [
          {
            title: "Complete KYC",
            body: "Open KYC Verification, submit accurate details, and wait for review before upload access is fully available."
          },
          {
            title: "Create a listing",
            body: "Open Upload Account, choose the game, add a clear title, price, login method, account level, and one strong marketplace image."
          },
          {
            title: "Save delivery vault details",
            body: "Add account login details and transfer notes before publishing. Buyers unlock this vault only after payment confirmation."
          },
          {
            title: "Review My Listings",
            body: "Use My Listings for active listings and Listing History for sold, withdrawn, refunded, or admin-reviewed records."
          }
        ]
      },
      {
        title: "Manage Sales",
        description: "What to watch after a buyer pays.",
        entries: [
          {
            title: "Orders",
            body: "Orders show buyer purchases connected to your listings, including payout amount, order status, and payment state."
          },
          {
            title: "Wallet",
            body: "Wallet separates pending balance from available balance. Pending means funds are still inside buyer protection or review."
          },
          {
            title: "Withdrawals",
            body: "Enter an amount within available balance, confirm bank details, and submit. Track the result from Withdrawal History."
          },
          {
            title: "Transactions",
            body: "Transactions show credits, debits, releases, withdrawal requests, refunds, and admin adjustments."
          }
        ]
      },
      {
        title: "Keep Your Seller Account Healthy",
        description: "Quality habits that reduce disputes.",
        entries: [
          {
            title: "Use accurate listing details",
            body: "Avoid inflated descriptions. The game, level, login method, and access notes should match the account being sold."
          },
          {
            title: "Respond to cases quickly",
            body: "If admin invites you into a dispute, reply with facts and evidence. Do not contact the buyer privately."
          },
          {
            title: "Watch notifications",
            body: "Notifications show sales, dispute updates, payout movement, account notices, and platform alerts."
          },
          {
            title: "Ask support early",
            body: "Use Support when something looks wrong with listing upload, KYC, withdrawal, wallet balance, or delivery details."
          }
        ]
      }
    ]
  },
  admin: {
    faq: [
      {
        title: "Operational Priority",
        description: "What should receive attention first.",
        entries: [
          {
            title: "What should be reviewed first?",
            body: "Prioritize open disputes, paid orders needing release, withdrawals, pending KYC, suspension appeals, support requests, and account deletion/reactivation reviews."
          },
          {
            title: "When should funds be released?",
            body: "Release seller funds only when payment is confirmed, escrow is holding, the order is eligible, and no active issue blocks payout."
          },
          {
            title: "When should refunds be used?",
            body: "Refund when evidence supports buyer protection, duplicate payment, invalid delivery, seller fault, or an admin-approved dispute outcome."
          },
          {
            title: "Do currency rates affect stored funds?",
            body: "No. Financial records stay in NGN. Currency rates only affect display conversion across buyer, seller, and admin views."
          }
        ]
      },
      {
        title: "Moderation And Enforcement",
        description: "Seller quality, users, disputes, and reviews.",
        entries: [
          {
            title: "How should seller enforcement work?",
            body: "Use warnings, upload restriction, listing takedown, refund, suspension, or deletion review based on evidence, impact, and repeat behavior."
          },
          {
            title: "When should a dispute be escalated to seller?",
            body: "Escalate only when buyer evidence is not enough to decide fairly. Sellers should not automatically join every dispute."
          },
          {
            title: "Can hidden reviews still be audited?",
            body: "Yes. Moderated reviews remain available in admin review tools with the admin reason."
          },
          {
            title: "How should account deletion be handled?",
            body: "Approve deletion only after checking pending orders, disputes, withdrawals, wallet obligations, appeals, and account safety concerns."
          }
        ]
      },
      {
        title: "Business Settings And Communication",
        description: "Platform controls and user messaging.",
        entries: [
          {
            title: "Who controls commission?",
            body: "Admin business settings control the active commission rate. Changes should be deliberate because they affect seller payout calculations."
          },
          {
            title: "Where should platform news go?",
            body: "Use Alerts and News for buyer/seller announcements. Enable notifications when the update must appear inside the notification page too."
          },
          {
            title: "How long can suspended users appeal?",
            body: "Use the configured suspension appeal window in business settings. After the window, accounts can move toward deletion review based on policy."
          },
          {
            title: "What should be logged?",
            body: "Financial actions, dispute decisions, account enforcement, KYC decisions, withdrawal actions, and deletion/restoration decisions should remain auditable."
          }
        ]
      }
    ],
    help: [
      {
        title: "Daily Review Flow",
        description: "A practical order for admin work.",
        entries: [
          {
            title: "Start with Dashboard and Analytics",
            body: "Use Dashboard for current shortcuts and Analytics for movement across orders, listings, revenue, disputes, sellers, and ratings."
          },
          {
            title: "Check Disputes",
            body: "Review pending cases, buyer evidence, order details, payment status, seller history, previous disputes, and decide whether to reject, resolve, or invite seller."
          },
          {
            title: "Review Withdrawals",
            body: "Confirm wallet balance movement, bank details, status, payout proof, and admin note before marking paid or rejected."
          },
          {
            title: "Process KYC and Appeals",
            body: "KYC controls seller upload access. Appeals and reactivation requests affect account access and should include clear admin notes."
          }
        ]
      },
      {
        title: "Marketplace Management",
        description: "Listings, sellers, orders, and buyer safety.",
        entries: [
          {
            title: "Listings",
            body: "Use Listings for active marketplace review and Listing History for sold, withdrawn, refunded, rejected, or taken-down records."
          },
          {
            title: "Sellers",
            body: "Open Sellers to inspect identity, KYC status, listings, order history, dispute history, rating quality, wallet posture, and direct contact details."
          },
          {
            title: "Orders",
            body: "Use Orders to confirm payment state, escrow state, commission, seller payout, listing title, buyer information, and release eligibility."
          },
          {
            title: "Reviews",
            body: "Use Seller Reviews to hide poor-quality or abusive reviews while preserving audit visibility."
          }
        ]
      },
      {
        title: "Platform Controls",
        description: "Settings that affect how the business runs.",
        entries: [
          {
            title: "Currency Rates",
            body: "Update display rates against NGN. Keep NGN as the base because stored financial records and admin accounting depend on it."
          },
          {
            title: "Business Settings",
            body: "Control commission, dispute settings, payout rules, appeal duration, and other operational policy values from one place."
          },
          {
            title: "Alerts and News",
            body: "Publish short platform notices for buyers and sellers. Use notification delivery when the message should be permanently visible."
          },
          {
            title: "Support and Feedback",
            body: "Use Support for user-specific issues and Feedback for product suggestions. Close tickets only when the user-facing issue is handled."
          }
        ]
      }
    ]
  }
};

const workspaceLabels: Record<Workspace, string> = {
  account: "Account",
  seller: "Seller",
  admin: "Admin"
};

const sectionIcons = [ListChecks, CreditCard, ShieldCheck, WalletCards, MessageSquareWarning, LifeBuoy];

export default function DashboardGuidePage({
  workspace,
  mode
}: {
  workspace: Workspace;
  mode: Mode;
}) {
  const sections = content[workspace][mode];
  const Icon = mode === "faq" ? CircleHelp : BookOpen;

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader className="p-6 sm:p-7">
          <div className="flex items-center gap-3">
            <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-primary-soft text-primary">
              <Icon className="h-5 w-5" />
            </span>
            <div>
              <CardTitle>{mode === "faq" ? "FAQs" : "Help guide"}</CardTitle>
              <CardDescription>
                {workspaceLabels[workspace]} workspace {mode === "faq" ? "answers" : "workflow guide"}.
              </CardDescription>
            </div>
          </div>
        </CardHeader>
      </Card>

      {sections.map((section, sectionIndex) => {
        const SectionIcon = sectionIcons[sectionIndex % sectionIcons.length];

        return (
          <section key={section.title} className="space-y-4">
            <div className="flex items-start gap-3">
              <span className="mt-1 flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-primary-soft text-primary">
                <SectionIcon className="h-4 w-4" />
              </span>
              <div>
                <h2 className="font-heading text-xl font-semibold text-foreground">
                  {section.title}
                </h2>
                <p className="mt-1 text-sm leading-6 text-muted-foreground">
                  {section.description}
                </p>
              </div>
            </div>

            <div className="grid gap-4 lg:grid-cols-2">
              {section.entries.map((entry) => (
                <Card key={entry.title}>
                  <CardContent className="p-6 sm:p-7">
                    <div className="flex gap-4">
                      <span className="mt-1 flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-white text-primary shadow-sm">
                        <LifeBuoy className="h-4 w-4" />
                      </span>
                      <div className="min-w-0">
                        <h3 className="font-heading text-lg font-semibold text-foreground">
                          {entry.title}
                        </h3>
                        <p className="mt-2 text-sm leading-7 text-muted-foreground">
                          {entry.body}
                        </p>
                        {entry.points ? (
                          <ul className="mt-3 space-y-2 text-sm leading-6 text-muted-foreground">
                            {entry.points.map((point) => (
                              <li key={point} className="flex gap-2">
                                <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-primary" />
                                <span>{point}</span>
                              </li>
                            ))}
                          </ul>
                        ) : null}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </section>
        );
      })}
    </div>
  );
}
