import type { OnboardingValues } from "@/lib/onboarding/schema"

export function needsWalletArt(values: Pick<OnboardingValues, "payMethods">) {
  return values.payMethods.includes("apple") || values.payMethods.includes("google")
}

export function needsInApp(values: Pick<OnboardingValues, "payMethods">) {
  return values.payMethods.includes("online")
}

export function needsCards(
  values: Pick<OnboardingValues, "products" | "cardFormat">
) {
  return (
    values.products.includes("cards") ||
    values.cardFormat === "virtual" ||
    values.cardFormat === "physical"
  )
}

export function needsFundsFlow(values: Pick<OnboardingValues, "walletStructure">) {
  return values.walletStructure === "non-custodial"
}
