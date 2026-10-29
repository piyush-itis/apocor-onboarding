import { z } from "zod"

import { needsFundsFlow, needsInApp, needsWalletArt } from "@/lib/onboarding/conditions"
import { fileProblem, imageProblem, isFileField } from "@/lib/onboarding/files"
import {
  AML_ITEMS,
  CONTACT_ROLES,
  REGIONS,
  SCREENS,
} from "@/lib/onboarding/options"
import type { FileBag, OnboardingValues } from "@/lib/onboarding/schema"
import { type StepId, visibleSteps } from "@/lib/onboarding/steps"

export type FieldErrors = Record<string, string>

const required = (message: string) =>
  z.string().refine((value) => value.trim().length > 0, { message })

const email = z.email("Enter a valid email.")

function issues(result: { success: true } | { success: false; error: z.ZodError }): FieldErrors {
  if (result.success) return {}
  const errors: FieldErrors = {}
  for (const issue of result.error.issues) {
    const key = issue.path.map(String).join(".")
    if (key && !errors[key]) errors[key] = issue.message
  }
  return errors
}

function requireFile(errors: FieldErrors, field: string, files: FileBag) {
  const attached = files[field] ?? []
  if (!attached.length) {
    errors[`file.${field}`] = "Attach this file."
    return
  }
  const problem = fileProblem(field, attached)
  if (problem) errors[`file.${field}`] = problem
}

function checkAttached(errors: FieldErrors, field: string, files: FileBag) {
  const attached = files[field] ?? []
  if (!attached.length) return
  const problem = fileProblem(field, attached)
  if (problem) errors[`file.${field}`] = problem
}

async function checkImages(errors: FieldErrors, field: string, files: FileBag) {
  const attached = files[field] ?? []
  if (!attached.length || errors[`file.${field}`]) return
  const problem = await imageProblem(field, attached)
  if (problem) errors[`file.${field}`] = problem
}

function oneOf(value: string, allowed: readonly string[], message: string) {
  return allowed.includes(value) ? null : message
}

function rgb(value: string) {
  const match = value.trim().match(/^(\d{1,3})\s*,\s*(\d{1,3})\s*,\s*(\d{1,3})$/)
  if (!match) return false
  return match.slice(1, 4).every((part) => Number(part) <= 255)
}

function hexColor(value: string) {
  return /^#?[0-9a-fA-F]{6}$/.test(value.trim())
}

function positivePixel(value: string) {
  return /^\d+(\.\d+)?$/.test(value.trim()) && Number(value) >= 0
}

export async function validateStep(
  id: StepId,
  values: OnboardingValues,
  files: FileBag
): Promise<FieldErrors> {
  const errors: FieldErrors = {}

  if (id === "about") {
    Object.assign(
      errors,
      issues(
        z
          .object({
            legalName: required("Enter the legal name."),
            brandName: required("Enter the brand or app name."),
            country: required("Enter the country of incorporation."),
            website: required("Enter a website."),
            contactName: required("Enter your name."),
            contactTitle: required("Enter your title."),
            email,
            phone: required("Enter a phone number."),
            companyType: required("Choose what best describes you."),
            walletBuild: required("Choose how the wallet is built."),
            monthlyActiveUsers: required("Enter monthly active users. An estimate is fine."),
            licences: required("List licences, or write none."),
            heardAbout: required("Tell us how you heard about Apocor."),
          })
          .safeParse(values)
      )
    )
    if (values.companyType === "other" && !values.companyTypeOther.trim()) {
      errors.companyTypeOther = "Tell us what best describes you."
    }
    if (
      (values.heardAbout === "referral" || values.heardAbout === "other") &&
      !values.heardAboutDetail.trim()
    ) {
      errors.heardAboutDetail = "Add a short note."
    }
  }

  if (id === "launch") {
    if (!values.products.length) errors.products = "Choose at least one product."
    if (values.products.includes("pay") && !values.payMethods.length) {
      errors.payMethods = "Choose how users will pay."
    }
    const userType = oneOf(
      values.userType,
      ["consumers", "businesses", "both"],
      "Choose who your users are."
    )
    if (userType) errors.userType = userType
    const cardFormat = oneOf(
      values.cardFormat,
      ["virtual", "physical", "none"],
      "Tell us about cards."
    )
    if (cardFormat) errors.cardFormat = cardFormat
    if (!values.stablecoins.length) errors.stablecoins = "Choose at least one stablecoin."
    if (values.stablecoins.includes("other") && !values.stablecoinOther.trim()) {
      errors.stablecoinOther = "Name the other stablecoin."
    }
    const structure = oneOf(
      values.walletStructure,
      ["custodial", "non-custodial"],
      "Choose a wallet structure."
    )
    if (structure) errors.walletStructure = structure
    if (!values.chains.length) errors.chains = "Choose at least one chain."
    if (values.chains.includes("other") && !values.chainOther.trim()) {
      errors.chainOther = "Name the other chain."
    }
    if (!values.primaryChain) errors.primaryChain = "Choose the primary chain for launch."
    else if (!values.chains.includes(values.primaryChain)) {
      errors.primaryChain = "The primary chain should be one you selected."
    }

    const used = new Set<string>()
    let ranked = 0
    for (const region of REGIONS) {
      const rank = values.regionRanks[region.id].trim()
      if (!rank) continue
      ranked += 1
      if (!/^[1-9]$/.test(rank)) {
        errors[`regionRanks.${region.id}`] = "Use a rank from 1 to 9."
      } else if (used.has(rank)) {
        errors[`regionRanks.${region.id}`] = "Each rank can only be used once."
      } else {
        used.add(rank)
      }
    }
    if (!ranked) errors.regionRanks = "Rank at least the first region. 1 means first."
    if (values.regionRanks.other && !values.regionOther.trim()) {
      errors.regionOther = "Name the other region."
    }
  }

  if (id === "scale") {
    Object.assign(
      errors,
      issues(
        z
          .object({
            activeUsers: required("Enter year-1 active users."),
            monthlyVolume: required("Enter year-1 monthly volume."),
            paymentsPerUser: required("Enter year-1 payments per user."),
            avgSpend: required("Enter year-1 average spend."),
          })
          .safeParse(values.metrics.year1)
      )
    )
    const remapped: FieldErrors = {}
    for (const [key, message] of Object.entries(errors)) {
      remapped[`metrics.year1.${key}`] = message
    }
    Object.keys(errors).forEach((key) => delete errors[key])
    Object.assign(errors, remapped)
    Object.assign(
      errors,
      issues(
        z
          .object({
            budget: required("Enter the approved budget."),
            kickoff: required("Choose a kickoff date."),
            integration: required("Choose an integration and testing date."),
            pilot: required("Choose a pilot date."),
            goLive: required("Choose a go-live date."),
          })
          .safeParse(values)
      )
    )
    if (!values.success.length) errors.success = "Choose what success looks like."
    if (!values.partnerPriorities.length) {
      errors.partnerPriorities = "Choose what matters most in a partner."
    }
  }

  if (id === "profile") {
    if (values.businessDescription.trim().length < 40) {
      errors.businessDescription =
        "Describe the business in about three sentences, and how users will pay with Apocor."
    }
    if (!values.priorityCountries.trim()) {
      errors.priorityCountries = "List the priority countries."
    }
  }

  if (id === "company") {
    Object.assign(
      errors,
      issues(
        z
          .object({
            registrationNumber: required("Enter the company registration number."),
            registeredAddress: required("Enter the registered address."),
          })
          .safeParse(values)
      )
    )
    requireFile(errors, "incorporation", files)
    for (const field of [
      "articles",
      "directors",
      "shareholders",
      "ownerIds",
      "licencesDoc",
      "businessAddressProof",
      "groupChart",
      "financials",
    ]) {
      checkAttached(errors, field, files)
    }
    if (needsFundsFlow(values)) requireFile(errors, "fundsFlow", files)
    else checkAttached(errors, "fundsFlow", files)
  }

  if (id === "contacts") {
    for (const role of CONTACT_ROLES) {
      const contact = values.contacts[role.id]
      if (!contact.name.trim()) errors[`contacts.${role.id}.name`] = "Enter a name."
      if (!contact.title.trim()) errors[`contacts.${role.id}.title`] = "Enter a title."
      if (!z.email().safeParse(contact.email).success) {
        errors[`contacts.${role.id}.email`] = "Enter a valid email."
      }
    }
  }

  if (id === "controls") {
    for (const item of AML_ITEMS) {
      const attached = files[item.file] ?? []
      const answer = values.aml[item.id]
      if (!attached.length && !answer.notApplicable) {
        errors[`aml.${item.id}`] = "Attach the document, or tell us why it does not apply."
      } else if (answer.notApplicable && !answer.reason.trim()) {
        errors[`aml.${item.id}`] = "Tell us why this does not apply."
      } else if (attached.length) {
        const problem = fileProblem(item.file, attached)
        if (problem) errors[`file.${item.file}`] = problem
      }
    }
    const infoSec = oneOf(
      values.infoSecChoice,
      ["soc2", "policy", "neither"],
      "Tell us how you evidence information security."
    )
    if (infoSec) errors.infoSecChoice = infoSec
    if (values.infoSecChoice === "soc2" || values.infoSecChoice === "policy") {
      requireFile(errors, "infoSec", files)
    } else {
      checkAttached(errors, "infoSec", files)
    }
    if (values.infoSecChoice === "neither" && !values.infoSecExplanation.trim()) {
      errors.infoSecExplanation = "Explain why a report or policy does not apply."
    }
    const insurance = files.insurance ?? []
    if (!insurance.length && !values.insuranceNote.trim()) {
      errors.insuranceNote = "Attach the certificate, or explain its status."
    } else if (insurance.length) {
      const problem = fileProblem("insurance", insurance)
      if (problem) errors["file.insurance"] = problem
    }
  }

  if (id === "protection") {
    if (!values.complaintsHow.trim()) {
      errors.complaintsHow = "Describe how users raise a complaint."
    }
    if (!values.disputesHow.trim()) errors.disputesHow = "Describe how users start a dispute."
    if (!values.trackerReady && !(files.complaintsTracker ?? []).length) {
      errors.trackerReady = "Confirm the monthly tracker, or attach it."
    }
    checkAttached(errors, "complaintsPolicy", files)
    checkAttached(errors, "complaintsTracker", files)
    for (const field of ["terms", "feeScheduleDoc", "privacy", "marketing"]) {
      checkAttached(errors, field, files)
    }
    values.fees.forEach((fee, index) => {
      if (!fee.amount.trim()) {
        errors[`fees.${index}.amount`] = "Enter an amount, or none."
      }
    })
  }

  if (id === "declaration") {
    Object.assign(
      errors,
      issues(
        z
          .object({
            declarationName: required("Enter your name."),
            declarationTitle: required("Enter your title."),
            declarationCompany: required("Enter the company."),
            declarationDate: required("Choose a date."),
            declarationSignature: required("Sign in the box."),
          })
          .safeParse(values)
      )
    )
    if (!values.declarationConfirmed) {
      errors.declarationConfirmed = "Confirm the information is accurate."
    }
  }

  if (id === "experience") {
    if (values.products.includes("pay") && !values.payMethods.length) {
      errors.payMethods = "Choose at least one Apocor Pay experience."
    }
    if (values.payMethods.includes("qr") && !values.scanVisa && !values.scanLocal) {
      errors.scanVisa = "Choose Visa acceptance QR, local QR networks, or both."
    }
    if (values.scanLocal && !values.localQrNetworks.trim()) {
      errors.localQrNetworks = "Name the local QR networks."
    }
    for (const [key, message] of [
      ["payOnline", "Say whether Pay Online is in this launch."],
      ["accept", "Say whether Apocor Accept is in this launch."],
      ["intelligence", "Say whether Intelligence Commerce is in this launch."],
    ] as const) {
      const problem = oneOf(values[key], ["enable", "later"], message)
      if (problem) errors[key] = problem
    }
    if (values.products.includes("direct") && !values.directDestinations.length) {
      errors.directDestinations = "Choose where Apocor Direct sends funds."
    }
    if (
      values.cashWithdrawals &&
      !["allow", "block"].includes(values.cashWithdrawals)
    ) {
      errors.cashWithdrawals = "Allow or block cash withdrawals."
    }
  }

  if (id === "brand") {
    if (!values.shortProgramName.trim()) {
      errors.shortProgramName = "Enter the short program name."
    } else if (values.shortProgramName.trim().length > 32) {
      errors.shortProgramName = "Keep the program name to 32 characters."
    }
    for (const [key, label] of [
      ["colorBackground", "background"],
      ["colorForeground", "foreground"],
      ["colorLabels", "label"],
    ] as const) {
      if (!rgb(values[key])) errors[key] = `Enter the ${label} colour as RGB, like 255, 255, 255.`
    }
    requireFile(errors, "appIcon", files)
    requireFile(errors, "logoSvg", files)
    requireFile(errors, "logoPngLight", files)
    requireFile(errors, "logoPngDark", files)
    for (const field of ["sourceFiles", "brandGuidelines"]) checkAttached(errors, field, files)
    await checkImages(errors, "appIcon", files)
  }

  if (id === "wallet-art" && needsWalletArt(values)) {
    requireFile(errors, "walletBlank", files)
    requireFile(errors, "walletLast4", files)
    await checkImages(errors, "walletBlank", files)
    await checkImages(errors, "walletLast4", files)
  }

  if (id === "inapp-art" && needsInApp(values)) {
    requireFile(errors, "inAppBlank", files)
    requireFile(errors, "inAppPopulated", files)
    await checkImages(errors, "inAppBlank", files)
    await checkImages(errors, "inAppPopulated", files)
    if (!values.credentialFont.trim()) errors.credentialFont = "Name the font."
    if (!hexColor(values.credentialFontColor)) {
      errors.credentialFontColor = "Enter a hex colour, like #1A1C16."
    }
    if (!positivePixel(values.credentialFontSize)) {
      errors.credentialFontSize = "Enter the font size in pixels."
    }
    if (!positivePixel(values.credentialGroupSpacing)) {
      errors.credentialGroupSpacing = "Enter the group spacing in pixels."
    }
    for (const detail of ["number", "name", "expiry", "cvv"] as const) {
      const point = values.credentialPositions[detail]
      if (!positivePixel(point.x)) errors[`credentialPositions.${detail}.x`] = "Enter X in pixels."
      if (!positivePixel(point.y)) errors[`credentialPositions.${detail}.y`] = "Enter Y in pixels."
    }
  }

  if (id === "cards") {
    if (!values.cardFormats.length) errors.cardFormats = "Choose at least one format."
    const product = oneOf(values.cardProduct, ["debit", "prepaid"], "Choose debit or prepaid.")
    if (product) errors.cardProduct = product
    const network = oneOf(
      values.cardNetwork,
      ["visa", "mastercard", "either"],
      "Choose a network."
    )
    if (network) errors.cardNetwork = network
    if (
      (values.cardFormats.includes("plastic") || values.cardFormats.includes("metal")) &&
      !values.deliveryCountries.trim()
    ) {
      errors.deliveryCountries = "List the countries where a physical card can be delivered."
    }
  }

  if (id === "build") {
    Object.assign(
      errors,
      issues(
        z
          .object({
            integrationOwner: required("Name the integration owner."),
            teamSize: required("Enter the technical team size."),
          })
          .safeParse(values)
      )
    )
    if (!values.surfaces.length) errors.surfaces = "Choose where Apocor will run."
    for (const [key, message] of [
      ["experienceUx", "Tell us about UX and UI design experience."],
      ["experienceApis", "Tell us about third-party API experience."],
      ["experienceWhiteLabel", "Tell us about white-label fintech experience."],
    ] as const) {
      if (!["yes", "no"].includes(values[key])) errors[key] = message
    }
    const filled = values.sandboxUsers.filter((person) => person.name.trim() || person.email.trim())
    if (!filled.length) errors.sandboxUsers = "Add at least one person who needs sandbox access."
    values.sandboxUsers.forEach((person, index) => {
      if (!person.name.trim() && !person.email.trim()) return
      if (!person.name.trim()) errors[`sandboxUsers.${index}.name`] = "Enter a name."
      if (!z.email().safeParse(person.email).success) {
        errors[`sandboxUsers.${index}.email`] = "Enter a valid email."
      }
    })
  }

  if (id === "flows") {
    if (!values.flows.length) errors.flows = "Tick the flows that apply to this launch."
  }

  if (id === "screens") {
    const hasScreen = SCREENS.some((screen) => (files[screen.id] ?? []).length > 0)
    if (!values.designLink.trim() && !hasScreen) {
      errors.designLink = "Add a design link, or upload at least one screen."
    }
    for (const screen of SCREENS) checkAttached(errors, screen.id, files)
  }

  if (id === "golive") {
    Object.assign(
      errors,
      issues(
        z
          .object({
            signoffName: required("Enter your name."),
            signoffTitle: required("Enter your title."),
            signoffDate: required("Choose a date."),
            signoffSignature: required("Sign in the box."),
          })
          .safeParse(values)
      )
    )
    if (!values.signoffConfirmed) {
      errors.signoffConfirmed = "Confirm you are ready to launch."
    }
  }

  for (const key of Object.keys(errors)) {
    if (key.startsWith("file.") && !isFileField(key.slice(5))) delete errors[key]
  }

  return errors
}

export async function validateAll(values: OnboardingValues, files: FileBag) {
  for (const step of visibleSteps(values)) {
    if (step.id === "review") continue
    const errors = await validateStep(step.id, values, files)
    if (Object.keys(errors).length) return { stepId: step.id, errors }
  }
  return null
}
