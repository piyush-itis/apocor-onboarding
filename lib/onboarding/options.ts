export const COMPANY_TYPES = [
  { value: "crypto", label: "Crypto wallet" },
  { value: "stablecoin", label: "Stablecoin-native wallet" },
  { value: "fintech", label: "Fintech or neobank" },
  { value: "exchange", label: "Exchange or broker" },
  { value: "marketplace", label: "Marketplace or platform" },
  { value: "other", label: "Other" },
] as const

export const WALLET_BUILDS = [
  { value: "eoa", label: "Externally owned account (EOA)" },
  { value: "aa", label: "Account abstraction" },
  { value: "mpc", label: "MPC" },
  { value: "custodial", label: "Custodial" },
  { value: "waas", label: "Wallet-as-a-Service provider" },
] as const

export const REFERRAL_SOURCES = [
  { value: "referral", label: "Referral from" },
  { value: "partner", label: "Network or banking partner" },
  { value: "event", label: "Event" },
  { value: "website", label: "Website or search" },
  { value: "other", label: "Other" },
] as const

export const PRODUCTS = [
  { value: "pay", label: "Apocor Pay" },
  { value: "direct", label: "Apocor Direct" },
  { value: "accept", label: "Apocor Accept" },
  { value: "intelligence", label: "Apocor Intelligence Commerce" },
  { value: "cards", label: "Apocor Cards" },
] as const

export const PAY_METHODS = [
  { value: "nfc", label: "Tap to Pay in your app (NFC)" },
  { value: "apple", label: "Apple Pay" },
  { value: "google", label: "Google Pay" },
  { value: "qr", label: "Scan to Pay (QR)" },
  { value: "online", label: "Pay Online" },
] as const

export const USER_TYPES = [
  { value: "consumers", label: "Consumers" },
  { value: "businesses", label: "Businesses" },
  { value: "both", label: "Both" },
] as const

export const CARD_FORMATS = [
  { value: "virtual", label: "Virtual" },
  { value: "physical", label: "Physical" },
  { value: "none", label: "Not needed" },
] as const

export const STABLECOINS = [
  { value: "usdc", label: "USDC" },
  { value: "usdg", label: "USDG" },
  { value: "eurc", label: "EURC" },
  { value: "pyusd", label: "PYUSD" },
  { value: "other", label: "Other" },
] as const

export const WALLET_STRUCTURES = [
  { value: "custodial", label: "Custodial" },
  { value: "non-custodial", label: "Non-custodial" },
] as const

export const CHAINS = [
  { value: "base", label: "Base" },
  { value: "solana", label: "Solana" },
  { value: "stellar", label: "Stellar" },
  { value: "polygon", label: "Polygon" },
  { value: "ethereum", label: "Ethereum" },
  { value: "arbitrum", label: "Arbitrum" },
  { value: "bnb", label: "BNB Chain" },
  { value: "other", label: "Other" },
] as const

export const REGIONS = [
  { id: "us", label: "United States" },
  { id: "eu", label: "Europe & UK" },
  { id: "me", label: "Middle East & Turkey" },
  { id: "sa", label: "South Asia" },
  { id: "sea", label: "Southeast Asia" },
  { id: "ea", label: "East Asia" },
  { id: "latam", label: "Latin America & Caribbean" },
  { id: "africa", label: "Africa" },
  { id: "other", label: "Other" },
] as const

export const SUCCESS_OUTCOMES = [
  { value: "ux", label: "A better user experience" },
  { value: "acquisition", label: "User acquisition" },
  { value: "retention", label: "Retention and engagement" },
  { value: "suite", label: "A broader product suite" },
  { value: "revenue", label: "Revenue growth" },
  { value: "differentiation", label: "Standing out from competitors" },
] as const

export const PARTNER_PRIORITIES = [
  { value: "reach", label: "Global reach" },
  { value: "support", label: "Hands-on integration support" },
  { value: "commercial", label: "Commercial terms" },
  { value: "reliability", label: "Reliability and uptime" },
  { value: "custom", label: "Custom solutions" },
  { value: "docs", label: "Excellent API documentation" },
] as const

export const CONTACT_ROLES = [
  { id: "sponsor", label: "Executive sponsor" },
  { id: "compliance", label: "Compliance officer / MLRO" },
  { id: "technical", label: "Technical lead" },
  { id: "operations", label: "Operations & support lead" },
  { id: "finance", label: "Finance / treasury" },
] as const

export const AML_ITEMS = [
  {
    id: "policy",
    file: "amlPolicy",
    label: "AML policy",
    hint: "How you detect and respond to suspicious activity",
  },
  {
    id: "kyc",
    file: "amlKyc",
    label: "KYC policy",
    hint: "How you verify customer identity",
  },
  {
    id: "monitoring",
    file: "amlMonitoring",
    label: "Transaction monitoring",
    hint: "How transactions are screened and flagged",
  },
  {
    id: "risk",
    file: "amlRisk",
    label: "AML risk assessment",
    hint: "How you evaluate and categorise AML risk",
  },
  {
    id: "review",
    file: "amlReview",
    label: "Latest independent review",
    hint: "Internal or external AML/BSA audits, if available",
  },
  {
    id: "other",
    file: "amlOther",
    label: "Anything else",
    hint: "Other documents describing your BSA/AML approach",
  },
] as const

export const INFOSEC_CHOICES = [
  { value: "soc2", label: "SOC 2 Type 2 or equivalent" },
  { value: "policy", label: "InfoSec policy and audit plan" },
  { value: "neither", label: "Neither applies" },
] as const

export const FEE_ROWS = [
  { id: "account", label: "Account or monthly fee" },
  { id: "fx", label: "FX or cross-border markup" },
  { id: "payout", label: "Payout or withdrawal" },
  { id: "virtualCard", label: "Virtual card" },
  { id: "physicalCard", label: "Physical card and delivery" },
  { id: "atm", label: "ATM withdrawal" },
  { id: "other", label: "Other" },
] as const

export const ENABLE_CHOICES = [
  { value: "enable", label: "Enable" },
  { value: "later", label: "Not now" },
] as const

export const DIRECT_DESTINATIONS = [
  { value: "cards", label: "To cards" },
  { value: "bank", label: "To bank accounts" },
  { value: "wallets", label: "To wallets" },
  { value: "later", label: "Not now" },
] as const

export const CASH_CHOICES = [
  { value: "allow", label: "Allow" },
  { value: "block", label: "Block" },
] as const

export const PHYSICAL_CARD_FORMATS = [
  { value: "virtual", label: "Virtual" },
  { value: "plastic", label: "Plastic" },
  { value: "metal", label: "Metal" },
] as const

export const CARD_PRODUCTS = [
  { value: "debit", label: "Debit" },
  { value: "prepaid", label: "Prepaid" },
] as const

export const CARD_NETWORKS = [
  { value: "visa", label: "Visa" },
  { value: "mastercard", label: "Mastercard" },
  { value: "either", label: "Either" },
] as const

export const SURFACES = [
  { value: "ios", label: "iOS app" },
  { value: "android", label: "Android app" },
  { value: "web", label: "Web" },
  { value: "backend", label: "Backend only" },
] as const

export const YES_NO = [
  { value: "yes", label: "Yes" },
  { value: "no", label: "No" },
] as const

export const FLOWS = [
  { value: "activation", label: "Activation inside your app" },
  { value: "tap", label: "Tap to Pay" },
  { value: "scan", label: "Scan to Pay" },
  { value: "online", label: "Pay Online" },
  { value: "funding", label: "Funding the wallet" },
  { value: "withdrawals", label: "Withdrawals and payouts" },
  { value: "refunds", label: "Refunds and reversals" },
  { value: "declines", label: "Declines and spend controls" },
  { value: "disputes", label: "Disputes" },
  { value: "freeze", label: "Freeze, cancel and replace" },
  { value: "notifications", label: "Payment notifications" },
  { value: "statements", label: "Monthly statements" },
] as const

export const SCREENS = [
  {
    id: "screenActivation",
    label: "Activation",
    hint: "How users switch on payments in your app",
  },
  {
    id: "screenPaying",
    label: "Paying",
    hint: "Each experience you launch: tap, scan, online",
  },
  {
    id: "screenHistory",
    label: "Payment history and detail",
    hint: "Summary and single-payment views",
  },
  {
    id: "screenStatements",
    label: "Monthly statements",
    hint: "How users find and download them",
  },
  {
    id: "screenSupport",
    label: "Support and complaints",
    hint: "How users reach you",
  },
  {
    id: "screenFunding",
    label: "Funding the wallet",
    hint: "How users add stablecoins",
  },
  {
    id: "screenWithdrawals",
    label: "Withdrawals",
    hint: "How users move funds out",
  },
  {
    id: "screenDisputes",
    label: "Disputes",
    hint: "Where users report a problem with a payment",
  },
  {
    id: "screenFreeze",
    label: "Freeze, cancel and replace",
    hint: "How users manage their credential",
  },
] as const

export const GO_LIVE_CHECKS = [
  { id: "compliance", label: "Compliance review complete" },
  { id: "brand", label: "Brand assets approved" },
  { id: "tests", label: "Test checklist signed off" },
  { id: "experience", label: "Experience review approved" },
  { id: "insurance", label: "Cyber insurance current on go-live day" },
  { id: "terms", label: "User terms, fees and privacy policy live" },
  { id: "support", label: "Support briefed, complaints tracker live" },
  { id: "pilot", label: "Pilot reviewed with Apocor" },
] as const

export const YEARS = [
  { id: "year1", label: "Year 1" },
  { id: "year2", label: "Year 2" },
  { id: "year3", label: "Year 3" },
] as const

export type Option = { value: string; label: string }

export function labelFor(options: readonly Option[], value: string) {
  return options.find((option) => option.value === value)?.label ?? value
}

export function labelsFor(options: readonly Option[], values: string[]) {
  return values
    .map((value) => labelFor(options, value))
    .filter(Boolean)
    .join(", ")
}
