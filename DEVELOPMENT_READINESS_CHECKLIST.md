# Gaming Index Development Readiness Checklist

Use this as the main gate before moving the site out of development testing.

## Must Pass Before Production

### Core User Flow
- New user signup creates profile, wallet, welcome notification, and correct default settings.
- Login redirects correctly for active, limited, suspended, deactivated, and deleted-review accounts.
- Buyer, seller, and admin dashboards load without client-side errors.
- Dashboard cards link to the correct detail pages.
- Navigation works on desktop, tablet, and mobile widths.

### Marketplace
- Listings show correct status and cannot be bought when unavailable.
- Sellers cannot buy their own listings.
- Marketplace filters include all supported games.
- Prices are stored in NGN as the base currency.
- Display currency converts consistently across marketplace, checkout, dashboards, wallets, orders, analytics, notifications, and admin views.
- User-selected currency persists after refresh and login.

### Checkout And Funds
- Checkout only works for eligible listings.
- Pending or abandoned checkout orders expire correctly.
- Completed payments create orders, lock listing state, and trigger escrow.
- Commission is calculated from the configured business rate.
- Seller wallet receives net earnings after platform commission.
- Refunds return funds to buyer wallet and take down the listing when appropriate.
- Admin views show stored NGN values and converted display values clearly.

### Uploads
- Listing images upload directly to Supabase Storage, not through Vercel.
- Profile photos upload directly to Supabase Storage.
- KYC files upload directly to Supabase Storage.
- Dispute evidence uploads directly to Supabase Storage.
- Upload errors show clear user-facing messages.
- File size, file type, and video duration limits are enforced.

### Disputes
- Buyers can only open disputes for eligible orders.
- Seller is not added until admin escalates the dispute.
- Admin can reject, resolve immediately, escalate, request evidence, refund buyer, or release funds.
- Buyer, seller, and admin receive the right notifications.
- Evidence is visible to allowed parties and cannot be deleted by users.
- Dispute messages update without manual refresh.
- Closed cases stop further replies.
- Admin actions are logged for audit.

### Notifications
- Notifications appear in the notification page permanently unless deleted by policy.
- Header/sidebar unread counts update after reading.
- Live notification polling works while users are active.
- Toast popups show for new notifications with a countdown-style progress line.
- Important events are covered: signup, seller access, listing submitted/published/rejected, purchase, refund, withdrawal, dispute updates, admin alerts, suspension, appeal, account lifecycle changes.

### Account Control
- Suspended users see the suspension page and can appeal within the configured window.
- Appeal submission shows a dedicated success page.
- Deactivated users see the deactivation page and can request reactivation.
- Admin can review reactivation requests.
- Delete requests remain reviewable when pending orders, disputes, withdrawals, or balances exist.
- Deleted accounts are stored in deleted accounts and can be restored if allowed.
- Limited accounts are blocked from sensitive actions.

### Settings
- Appearance settings save individually.
- Light mode is the default for new users.
- Dark mode remains readable across all dashboards.
- Font size selection persists after refresh.
- Currency preference persists after refresh.
- Profile photo preview is circular and uses a standard camera edit icon.
- Password and 2FA sections are present but not misleading until email automation is ready.

### Admin
- Business settings save without hard reloads and show loading states.
- Currency rates can be updated and are used by display conversion.
- Commission percentage can be updated.
- Dispute, payout, suspension, deletion, and appeal durations are configurable where needed.
- Admin analytics charts reflect real platform data.
- Admin can publish alerts/news and users see them without manual refresh.
- Admin can manage reviews/ratings responsibly.
- Admin can contact or inspect sellers from the seller management area.

### UI And UX
- No overlapping text, cards, buttons, inputs, or fixed elements on mobile.
- Chat composer works cleanly with mobile keyboards.
- Buttons show loading, disabled, success, or error states.
- Forms use direct, professional copy.
- Tags are human-readable and do not show raw underscore values.
- Empty states are polished.
- Error states explain what happened without sounding robotic.

### Technical Quality
- `npm.cmd run typecheck` passes.
- `npm.cmd run lint` passes.
- `git diff --check` passes.
- No sensitive keys are committed.
- No server action accidentally moves large uploads through Vercel.
- Supabase RLS protects all private data.
- Storage policies match the upload and read model.
- Money-moving functions are idempotent where needed.
- Critical SQL functions use row locks and avoid double-credit/double-release.
- Logs and admin audit records exist for financial and moderation decisions.

## Biggest Risks To Clear First

1. Checkout and escrow correctness.
2. Currency conversion consistency.
3. Direct Supabase uploads for all large files.
4. Dispute workflow permissions and evidence access.
5. Account restriction enforcement.
6. Notification reliability.
7. Admin business settings accuracy.
