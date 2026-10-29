import { needsCards, needsInApp, needsWalletArt } from "@/lib/onboarding/conditions"
import type { OnboardingValues } from "@/lib/onboarding/schema"

export const CHAPTERS = [
  { id: "01", title: "Welcome", owner: "Founder or BD" },
  { id: "02", title: "Trust", owner: "Compliance" },
  { id: "03", title: "Experience", owner: "Product and design" },
  { id: "04", title: "Build", owner: "Engineering" },
] as const

export const STEPS = [
  {
    id: "about",
    chapter: "01",
    kicker: "Discovery · 1 of 3",
    title: "Tell us about you",
    lede: "A few facts so the launch call starts from your company, not a blank page.",
  },
  {
    id: "launch",
    chapter: "01",
    kicker: "Discovery · 2 of 3",
    title: "What will you launch?",
    lede: "Choose the products, rails, and regions. You can widen this later.",
  },
  {
    id: "scale",
    chapter: "01",
    kicker: "Discovery · 3 of 3",
    title: "Scale and timing",
    lede: "Estimates are enough. We go deeper by region in the compliance profile.",
  },
  {
    id: "profile",
    chapter: "02",
    kicker: "Program profile",
    title: "Your launch, at a glance",
    lede: "We share this profile with sponsor and network partners. Start every region in year 1, even if you arrive there later.",
  },
  {
    id: "company",
    chapter: "02",
    kicker: "Company verification",
    title: "Who you are",
    lede: "Send what you have. We may ask for more during review.",
  },
  {
    id: "contacts",
    chapter: "02",
    kicker: "Company verification",
    title: "Key contacts",
    lede: "The people Apocor works with during review and after launch.",
  },
  {
    id: "controls",
    chapter: "02",
    kicker: "Controls",
    title: "Financial crime and security",
    lede: "If an item does not apply, say why. Share at least the policies you already have.",
  },
  {
    id: "protection",
    chapter: "02",
    kicker: "Customer protection",
    title: "Looking after your users",
    lede: "Clear ways to raise an issue, and terms they can trust. Write “none” where you will not charge a fee.",
  },
  {
    id: "declaration",
    chapter: "02",
    kicker: "Declaration",
    title: "Ready for review",
    lede: "Confirm the compliance pack is accurate to the best of your knowledge.",
  },
  {
    id: "experience",
    chapter: "03",
    kicker: "Your experience",
    title: "Configure how your users pay",
    lede: "Leave spend controls blank to use Apocor’s defaults. We refine the rest together before go-live.",
  },
  {
    id: "brand",
    chapter: "03",
    kicker: "Brand essentials",
    title: "Your brand, front and centre",
    lede: "Users should see you, not us. These assets appear in your app, in mobile wallets, and in payment notifications.",
  },
  {
    id: "wallet-art",
    chapter: "03",
    kicker: "Mobile wallet credential",
    title: "What users see when they tap",
    lede: "Apple Pay and Google Pay artwork has the longest approval lead time, so it is the first asset we need.",
    gate: "wallet",
  },
  {
    id: "inapp-art",
    chapter: "03",
    kicker: "In-app credential",
    title: "Checkout details, beautifully placed",
    lede: "You supply the artwork. We render the number, name, expiry, and security code on top.",
    gate: "inapp",
  },
  {
    id: "cards",
    chapter: "03",
    kicker: "Optional · Apocor Cards",
    title: "Cards, if you want them",
    lede: "Most users will never need one. Tell us how you would offer a branded card alongside tap, scan, and online.",
    gate: "cards",
  },
  {
    id: "build",
    chapter: "04",
    kicker: "Your build",
    title: "One integration, built your way",
    lede: "Tell us who is building and how, so the right support is there from day one.",
  },
  {
    id: "flows",
    chapter: "04",
    kicker: "Path to go-live",
    title: "Sandbox to live",
    lede: "Tick the flows that belong in your launch. Each one needs a pass in sandbox before the pilot.",
  },
  {
    id: "screens",
    chapter: "04",
    kicker: "Experience review",
    title: "Show us the experience",
    lede: "A Figma link is enough. Exported screens are even better. We review them before the pilot.",
  },
  {
    id: "golive",
    chapter: "04",
    kicker: "Go-live",
    title: "Ready when you are",
    lede: "Mark what is already true. The signature confirms you are ready to launch with Apocor.",
  },
  {
    id: "review",
    chapter: "04",
    kicker: "Review",
    title: "Send it through",
    lede: "Read it once. You can step back into any chapter before it is filed.",
  },
] as const

export type StepId = (typeof STEPS)[number]["id"]

export function isStepVisible(id: StepId, values: OnboardingValues) {
  const step = STEPS.find((item) => item.id === id)
  if (!step || !("gate" in step)) return true
  if (step.gate === "wallet") return needsWalletArt(values)
  if (step.gate === "inapp") return needsInApp(values)
  if (step.gate === "cards") return needsCards(values)
  return true
}

export function visibleSteps(values: OnboardingValues) {
  return STEPS.filter((step) => isStepVisible(step.id, values))
}
