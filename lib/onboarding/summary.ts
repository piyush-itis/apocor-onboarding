import { needsCards, needsFundsFlow, needsInApp, needsWalletArt } from "@/lib/onboarding/conditions"
import { FILE_SPECS, type FileField, isFileField } from "@/lib/onboarding/files"
import {
  CARD_FORMATS,
  CARD_NETWORKS,
  CARD_PRODUCTS,
  CASH_CHOICES,
  CHAINS,
  COMPANY_TYPES,
  CONTACT_ROLES,
  DIRECT_DESTINATIONS,
  ENABLE_CHOICES,
  FLOWS,
  GO_LIVE_CHECKS,
  PARTNER_PRIORITIES,
  PAY_METHODS,
  PHYSICAL_CARD_FORMATS,
  PRODUCTS,
  REFERRAL_SOURCES,
  REGIONS,
  SCREENS,
  STABLECOINS,
  SUCCESS_OUTCOMES,
  SURFACES,
  USER_TYPES,
  WALLET_BUILDS,
  WALLET_STRUCTURES,
  YES_NO,
  labelFor,
  labelsFor,
} from "@/lib/onboarding/options"
import type { OnboardingValues } from "@/lib/onboarding/schema"
import type { StepId } from "@/lib/onboarding/steps"

export type SummaryFile = { field: string; name: string }

export type SummarySection = {
  id: string
  stepId: StepId
  title: string
  rows: { label: string; value: string }[]
}

function row(label: string, value: string) {
  const trimmed = value.trim()
  return trimmed ? { label, value: trimmed } : null
}

function rows(...items: Array<{ label: string; value: string } | null>) {
  return items.filter((item): item is { label: string; value: string } => Boolean(item))
}

function filesFor(files: SummaryFile[], field: FileField) {
  return files
    .filter((file) => file.field === field)
    .map((file) => file.name)
    .join("\n")
}

function enableLabel(value: string) {
  return labelFor(ENABLE_CHOICES, value)
}

export function buildSummary(
  values: OnboardingValues,
  files: SummaryFile[]
): SummarySection[] {
  const ranked = REGIONS.flatMap((region) => {
    const rank = values.regionRanks[region.id].trim()
    if (!rank) return []
    const name = region.id === "other" && values.regionOther ? values.regionOther : region.label
    return [{ rank: Number(rank), name }]
  }).sort((a, b) => a.rank - b.rank)

  const sections: SummarySection[] = [
    {
      id: "about",
      stepId: "about",
      title: "About you",
      rows: rows(
        row("Legal name", values.legalName),
        row("Brand", values.brandName),
        row("Country of incorporation", values.country),
        row("Website", values.website),
        row("Contact", `${values.contactName}, ${values.contactTitle}`),
        row("Email", values.email),
        row("Phone", values.phone),
        row(
          "Company type",
          values.companyType === "other"
            ? values.companyTypeOther
            : labelFor(COMPANY_TYPES, values.companyType)
        ),
        row("Wallet build", labelFor(WALLET_BUILDS, values.walletBuild)),
        row("Monthly active users", values.monthlyActiveUsers),
        row("Licences", values.licences),
        row(
          "How you heard about Apocor",
          [labelFor(REFERRAL_SOURCES, values.heardAbout), values.heardAboutDetail]
            .filter(Boolean)
            .join(" — ")
        )
      ),
    },
    {
      id: "launch",
      stepId: "launch",
      title: "What you will launch",
      rows: rows(
        row("Products", labelsFor(PRODUCTS, values.products)),
        row("How users pay", labelsFor(PAY_METHODS, values.payMethods)),
        row("Users", labelFor(USER_TYPES, values.userType)),
        row("Cards", labelFor(CARD_FORMATS, values.cardFormat)),
        row(
          "Stablecoins",
          [
            labelsFor(STABLECOINS, values.stablecoins.filter((item) => item !== "other")),
            values.stablecoins.includes("other") ? values.stablecoinOther : "",
          ]
            .filter(Boolean)
            .join(", ")
        ),
        row("Wallet structure", labelFor(WALLET_STRUCTURES, values.walletStructure)),
        row(
          "Chains",
          [
            labelsFor(CHAINS, values.chains.filter((item) => item !== "other")),
            values.chains.includes("other") ? values.chainOther : "",
          ]
            .filter(Boolean)
            .join(", ")
        ),
        row("Primary chain", labelFor(CHAINS, values.primaryChain) || values.chainOther),
        row(
          "Regions",
          ranked.map((region) => `${region.rank}. ${region.name}`).join("\n")
        )
      ),
    },
    {
      id: "scale",
      stepId: "scale",
      title: "Scale and timing",
      rows: rows(
        row("Year 1 active users", values.metrics.year1.activeUsers),
        row("Year 1 monthly volume", values.metrics.year1.monthlyVolume),
        row("Year 1 payments per user", values.metrics.year1.paymentsPerUser),
        row("Year 1 average spend", values.metrics.year1.avgSpend),
        row("Year 2 active users", values.metrics.year2.activeUsers),
        row("Year 2 monthly volume", values.metrics.year2.monthlyVolume),
        row("Year 3 active users", values.metrics.year3.activeUsers),
        row("Year 3 monthly volume", values.metrics.year3.monthlyVolume),
        row("Approved budget", values.budget),
        row("Kickoff", values.kickoff),
        row("Integration and testing", values.integration),
        row("Pilot", values.pilot),
        row("Go-live", values.goLive),
        row("Key dependency", values.dependency),
        row("Success", labelsFor(SUCCESS_OUTCOMES, values.success)),
        row("Partner priorities", labelsFor(PARTNER_PRIORITIES, values.partnerPriorities)),
        row("Notes", values.notes)
      ),
    },
    {
      id: "profile",
      stepId: "profile",
      title: "Program profile",
      rows: rows(
        row("Business description", values.businessDescription),
        row("Priority countries", values.priorityCountries),
        ...REGIONS.map((region) => {
          const projection = values.projections[region.id]
          const parts = [
            projection.usersYear1 && `Y1 users ${projection.usersYear1}`,
            projection.usersYear2 && `Y2 users ${projection.usersYear2}`,
            projection.usersYear3 && `Y3 users ${projection.usersYear3}`,
            projection.avgSpend && `spend ${projection.avgSpend}`,
            projection.paymentsPerUser && `payments ${projection.paymentsPerUser}`,
          ].filter(Boolean)
          return row(region.label, parts.join(" · "))
        })
      ),
    },
    {
      id: "company",
      stepId: "company",
      title: "Company verification",
      rows: rows(
        row("Registration number", values.registrationNumber),
        row("Regulator", values.regulator),
        row("Registered address", values.registeredAddress),
        row("Certificate of incorporation", filesFor(files, "incorporation")),
        row("Articles", filesFor(files, "articles")),
        row("Directors", filesFor(files, "directors")),
        row("Shareholders", filesFor(files, "shareholders")),
        row("ID and proof of address", filesFor(files, "ownerIds")),
        row("Licences", filesFor(files, "licencesDoc")),
        row("Business address", filesFor(files, "businessAddressProof")),
        row("Group chart", filesFor(files, "groupChart")),
        row("Financial statements", filesFor(files, "financials")),
        needsFundsFlow(values) || filesFor(files, "fundsFlow")
          ? row("Funds-flow diagram", filesFor(files, "fundsFlow") || "Required")
          : null
      ),
    },
    {
      id: "contacts",
      stepId: "contacts",
      title: "Key contacts",
      rows: CONTACT_ROLES.map((role) => {
        const contact = values.contacts[role.id]
        return {
          label: role.label,
          value: [contact.name, contact.title, contact.email].filter(Boolean).join(" · "),
        }
      }).filter((item) => item.value),
    },
    {
      id: "protection",
      stepId: "protection",
      title: "Customer protection",
      rows: rows(
        row("Complaints", values.complaintsHow),
        row("Disputes", values.disputesHow),
        row("Monthly tracker", values.trackerReady ? "Ready" : filesFor(files, "complaintsTracker")),
        ...values.fees.map((fee) =>
          row(fee.label, [fee.amount, fee.notes].filter(Boolean).join(" — "))
        )
      ),
    },
    {
      id: "experience",
      stepId: "experience",
      title: "Payment experience",
      rows: rows(
        row("Pay methods", labelsFor(PAY_METHODS, values.payMethods)),
        row(
          "Scan",
          [
            values.scanVisa ? "Visa acceptance QR" : "",
            values.scanLocal ? `Local QR: ${values.localQrNetworks || "yes"}` : "",
          ]
            .filter(Boolean)
            .join("\n")
        ),
        row("Pay Online", enableLabel(values.payOnline)),
        row("Apocor Direct", labelsFor(DIRECT_DESTINATIONS, values.directDestinations)),
        row("Apocor Accept", enableLabel(values.accept)),
        row("Intelligence Commerce", enableLabel(values.intelligence)),
        row("Per-payment limit", values.limitPerPayment),
        row("Daily limit", values.limitDaily),
        row("Monthly limit", values.limitMonthly),
        row("Blocked merchant categories", values.blockedCategories),
        row("Blocked countries", values.blockedCountries),
        row("Cash withdrawals", labelFor(CASH_CHOICES, values.cashWithdrawals))
      ),
    },
    {
      id: "brand",
      stepId: "brand",
      title: "Brand",
      rows: rows(
        row("Short program name", values.shortProgramName),
        row("Background", values.colorBackground),
        row("Foreground", values.colorForeground),
        row("Labels", values.colorLabels),
        row("App icon", filesFor(files, "appIcon")),
        row("Logo SVG", filesFor(files, "logoSvg")),
        row("Logo PNG, light", filesFor(files, "logoPngLight")),
        row("Logo PNG, dark", filesFor(files, "logoPngDark"))
      ),
    },
  ]

  if (needsWalletArt(values)) {
    sections.push({
      id: "wallet",
      stepId: "wallet-art",
      title: "Wallet credential",
      rows: rows(
        row("Blank template", filesFor(files, "walletBlank")),
        row("Last-4 template", filesFor(files, "walletLast4"))
      ),
    })
  }

  if (needsInApp(values)) {
    const positions = (["number", "name", "expiry", "cvv"] as const)
      .map((detail) => {
        const point = values.credentialPositions[detail]
        return point.x || point.y ? `${detail} ${point.x}, ${point.y}` : ""
      })
      .filter(Boolean)
      .join("\n")
    sections.push({
      id: "inapp",
      stepId: "inapp-art",
      title: "In-app credential",
      rows: rows(
        row("Blank", filesFor(files, "inAppBlank")),
        row("Populated", filesFor(files, "inAppPopulated")),
        row("Font", values.credentialFont),
        row("Font colour", values.credentialFontColor),
        row("Font size", values.credentialFontSize),
        row("Group spacing", values.credentialGroupSpacing),
        row("Positions", positions)
      ),
    })
  }

  if (needsCards(values)) {
    sections.push({
      id: "cards",
      stepId: "cards",
      title: "Cards",
      rows: rows(
        row("Format", labelsFor(PHYSICAL_CARD_FORMATS, values.cardFormats)),
        row("Product", labelFor(CARD_PRODUCTS, values.cardProduct)),
        row("Network", labelFor(CARD_NETWORKS, values.cardNetwork)),
        row("Delivery countries", values.deliveryCountries)
      ),
    })
  }

  sections.push(
    {
      id: "build",
      stepId: "build",
      title: "Build",
      rows: rows(
        row("Integration owner", values.integrationOwner),
        row("Team size", values.teamSize),
        row("Surfaces", labelsFor(SURFACES, values.surfaces)),
        row("UX and UI", labelFor(YES_NO, values.experienceUx)),
        row("Third-party APIs", labelFor(YES_NO, values.experienceApis)),
        row("White-label fintech", labelFor(YES_NO, values.experienceWhiteLabel)),
        row("Current partners", values.currentPartners),
        row(
          "Sandbox access",
          values.sandboxUsers
            .filter((person) => person.name || person.email)
            .map((person) => `${person.name} <${person.email}>`)
            .join("\n")
        ),
        row("Dashboard wishes", values.dashboardWishes)
      ),
    },
    {
      id: "flows",
      stepId: "flows",
      title: "Flows to test",
      rows: rows(row("Flows", labelsFor(FLOWS, values.flows))),
    },
    {
      id: "screens",
      stepId: "screens",
      title: "Experience review",
      rows: rows(
        row("Design file", values.designLink),
        ...SCREENS.map((screen) => row(screen.label, filesFor(files, screen.id)))
      ),
    },
    {
      id: "golive",
      stepId: "golive",
      title: "Go-live",
      rows: rows(
        ...GO_LIVE_CHECKS.map((item) =>
          row(item.label, values.goLiveChecks[item.id] ? "Yes" : "Not yet")
        ),
        row("Signed by", `${values.signoffName}, ${values.signoffTitle}`),
        row("Date", values.signoffDate)
      ),
    }
  )

  const known = new Set(sections.flatMap((section) => section.rows.map((item) => item.label)))
  const extras = files.filter((file) => isFileField(file.field) && !known.has(FILE_SPECS[file.field].label))
  if (extras.length) {
    sections.push({
      id: "files",
      stepId: "company",
      title: "Other files",
      rows: extras.map((file) => ({
        label: isFileField(file.field) ? FILE_SPECS[file.field].label : file.field,
        value: file.name,
      })),
    })
  }

  return sections.filter((section) => section.rows.length)
}
