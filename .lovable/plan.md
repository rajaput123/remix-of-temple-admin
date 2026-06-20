# Digidevalaya Business Connect – Implementation Plan

A new self-contained `/business-connect` section delivering the 12-flow onboarding journey as a mobile-first wizard. Frontend only — all data persists to `localStorage` via a single Zustand store. No backend, no real OTP, no real uploads (file inputs preview locally). Reuses the existing blue enterprise theme and shadcn/ui components.

## 1. Route map (added to `src/App.tsx`)

```text
/business-connect                         Landing page (Flow 1)
/business-connect/auth                    Login / Signup (Flow 2)
/business-connect/onboarding              Wizard shell (layout w/ stepper)
  ├── /type                               Flow 3  Business Type
  ├── /info                               Flow 4  Business Information
  ├── /location                           Flow 5  Business Location
  ├── /languages                          Flow 6  Languages & Communication
  ├── /verification                       Flow 7  Verification (skippable)
  ├── /gallery                            Flow 8  Media / Gallery
  ├── /subscription                       Flow 9  Plan selection
  └── /complete                           Flow 10 Congratulations
/business-connect/dashboard               Flow 11 First-time dashboard
/business-connect/profile                 Flow 12 Profile management (tabs)
/business-connect/explore                 Public business directory (stub)
```

Existing temple routes are untouched.

## 2. File structure

```text
src/
├── pages/business-connect/
│   ├── Landing.tsx
│   ├── Auth.tsx
│   ├── OnboardingLayout.tsx        wizard shell: stepper, prev/next, save
│   ├── steps/
│   │   ├── StepBusinessType.tsx
│   │   ├── StepBusinessInfo.tsx
│   │   ├── StepLocation.tsx
│   │   ├── StepLanguages.tsx
│   │   ├── StepVerification.tsx
│   │   ├── StepGallery.tsx
│   │   ├── StepSubscription.tsx
│   │   └── StepComplete.tsx
│   ├── Dashboard.tsx
│   ├── Profile.tsx
│   └── Explore.tsx
├── components/business-connect/
│   ├── BCHeader.tsx                top nav (logo, login/account)
│   ├── BCFooter.tsx
│   ├── BusinessTypeCard.tsx        icon + label selectable card
│   ├── WizardStepper.tsx           horizontal on desktop, compact on mobile
│   ├── FileDropzone.tsx            local preview only (FileReader → dataURL)
│   ├── OtpInput.tsx                6-digit input, accepts any value in mock
│   ├── PlanCard.tsx                Free / Basic / Pro / Premium
│   ├── ProfileCompletion.tsx       progress ring + checklist
│   └── VerificationBadge.tsx
├── stores/businessConnectStore.ts  Zustand + persist('bc-onboarding')
├── data/businessTypes.ts           12 categories + subcategories + icons
└── types/businessConnect.ts        TS interfaces
```

## 3. State model (`businessConnectStore.ts`)

```ts
interface BCState {
  account: { mobile?: string; email?: string; verified: boolean };
  businessType?: { category: string; subcategory?: string };
  info?: { name; legalName?; description?; ownerName; phone; whatsapp?; email; experience?; website?; gst? };
  location?: { line1; line2?; landmark?; city; district; state; country; pincode; lat?; lng?; reach };
  comms?: { languages: string[]; channels: string[] };
  verification?: { aadhaar?; pan?; docs: {type, name, dataUrl}[]; status: 'pending'|'review'|'verified'|'rejected'|'skipped' };
  media?: { logo?; cover?; gallery: string[]; videos: string[] };
  subscription?: { plan: 'trial'|'basic'|'pro'|'premium' };
  profileStatus: 'draft'|'pending'|'published'|'rejected';
  completedSteps: string[];
  // actions: setX, reset, computeCompletion()
}
```

Persisted to `localStorage`. `computeCompletion()` returns 0–100 % based on filled sections (weights: info 25, location 15, languages 10, gallery 10, verification 20, subscription 10, type 10).

## 4. Validation

Zod schemas per step (`src/lib/bc-schemas.ts`). Submit blocked until valid. Errors shown inline via shadcn `<FormMessage>`. Required fields per spec:
- Auth: mobile + 6-digit OTP (any digits accepted in mock); email format if provided.
- Info: businessName, ownerName, phone (10 digit), email.
- Location: line1, city, district, state, country, pincode (6 digit).
- Languages: ≥1 language, ≥1 channel.
- Verification: optional, "Skip for now" button.
- Gallery: optional, logo recommended (soft warning).
- Subscription: one plan required.

## 5. Wizard shell (`OnboardingLayout.tsx`)

- Top: `WizardStepper` showing 8 numbered steps (Type → Complete).
- Sticky footer on mobile with Back / Continue.
- Auto-saves to store on each `Continue`.
- Direct URL access to a later step redirects to the earliest incomplete step.
- Exit button → confirm dialog → returns to Landing (state preserved).

## 6. Key screen behaviors

**Landing (Flow 1):** Hero with "Grow your temple-ecosystem business" headline, CTA buttons (Register / Login / Explore). Sections: benefits (3-up), supported categories grid (12 cards), how-it-works (4 steps), footer.

**Auth (Flow 2):** Tabs: Mobile OTP | Email | Google. Mobile flow: enter number → "Send OTP" → OtpInput → "Verify & Continue". Google = mock button that fills mock account. Outcome: account stored, redirect to `/onboarding/type`.

**Business Type (Flow 3):** 12 cards grid (4 cols desktop, 2 mobile), selection highlights with primary border; subcategory `<Select>` appears once category is chosen (subcategories defined per category in `businessTypes.ts`).

**Verification (Flow 7):** Document uploads use `FileDropzone` (drag/drop, accepts pdf/jpg/png, reads to dataURL, shows thumbnail). Status pill defaults to "Pending". Big secondary "Skip for now" button.

**Gallery (Flow 8):** Logo (1 file), Cover (1 file), Gallery (multiple), Videos (multiple). All client-side previews only — note shown: "Media is stored locally in this demo."

**Subscription (Flow 9):** 4 `PlanCard`s with features list, price, CTA. Free Trial preselected. No payment integration — selecting just stores the plan.

**Complete (Flow 10):** Confetti-free, brand-aligned success card with business name, completion %, and 2 CTAs → Dashboard / View Profile.

**Dashboard (Flow 11):** Grid of widgets — ProfileCompletion ring, VerificationBadge, SubscriptionStatus, VisibilityStatus (Draft/Published toggle), Setup Checklist (7 items linking back to relevant edit screens), Quick Actions row.

**Profile (Flow 12):** Tabbed editor (Details / About / Gallery / Hours / Service Areas / Languages / Documents / Subscription / Preview). "Publish Profile" button moves `profileStatus` from `draft` → `pending` (mock auto-advances to `published` after 2 s for demo).

## 7. Design

- Reuses existing tokens in `src/index.css` (blue primary `221 83% 53%`). No new color palette.
- Mobile-first: single-column ≤ 768 px, 2- or 3-column from `md:` upward.
- Icons via `lucide-react`. Cards via shadcn `<Card>`, forms via shadcn `<Form>` + `react-hook-form` + `zod`.
- Empty / success / error states for each screen (e.g. no docs uploaded, OTP failed, plan selected ✓).

## 8. Out of scope (per requirements)

No CRM, bookings, leads, marketing, reports, service management. No real OTP / payments / storage / DB. Not wired to existing `TempleHub`.

## 9. Deliverables

~25 new files, 1 edit to `src/App.tsx` for routes. Estimated single implementation pass after plan approval.
