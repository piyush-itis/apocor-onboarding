export const MAX_FILE_BYTES = 8 * 1024 * 1024

const documents = [".pdf", ".png", ".jpg", ".jpeg", ".webp"]
const images = [".png", ".jpg", ".jpeg", ".webp"]

export type FileSpec = {
  label: string
  hint: string
  accept: string
  extensions: string[]
  multiple: boolean
  width?: number
  height?: number
}

function spec(
  label: string,
  hint: string,
  extensions: string[],
  extra: Partial<Pick<FileSpec, "multiple" | "width" | "height">> = {}
): FileSpec {
  return {
    label,
    hint,
    accept: extensions.join(","),
    extensions,
    multiple: extra.multiple ?? false,
    width: extra.width,
    height: extra.height,
  }
}

export const FILE_SPECS = {
  incorporation: spec(
    "Certificate of incorporation",
    "PDF or a clear scan.",
    documents
  ),
  articles: spec(
    "Memorandum and articles",
    "Or the equivalent constitutional document.",
    documents
  ),
  directors: spec("Register of directors", "PDF or a clear scan.", documents),
  shareholders: spec(
    "Shareholder register",
    "Owners of 25% or more.",
    documents
  ),
  ownerIds: spec(
    "ID and proof of address",
    "For directors and owners. You can attach more than one file.",
    documents,
    { multiple: true }
  ),
  licencesDoc: spec(
    "Licences and registrations",
    "Send what you hold today.",
    documents
  ),
  businessAddressProof: spec(
    "Proof of business address",
    "A recent statement or official letter.",
    documents
  ),
  groupChart: spec("Group structure chart", "If you are part of a group.", documents),
  financials: spec("Latest financial statements", "The most recent set you can share.", documents),
  fundsFlow: spec(
    "Funds-flow diagram",
    "Required for non-custodial wallets. Apocor reviews and approves the flow.",
    [...documents, ".svg"]
  ),
  amlPolicy: spec("AML policy", "How you detect and respond to suspicious activity.", documents),
  amlKyc: spec("KYC policy", "How you verify customer identity.", documents),
  amlMonitoring: spec(
    "Transaction monitoring",
    "How transactions are screened and flagged.",
    documents
  ),
  amlRisk: spec("AML risk assessment", "How you evaluate and categorise AML risk.", documents),
  amlReview: spec(
    "Latest independent review",
    "An internal or external AML/BSA audit, if you have one.",
    documents
  ),
  amlOther: spec("Other BSA/AML material", "Anything else that describes your approach.", documents),
  infoSec: spec(
    "Information security evidence",
    "SOC 2, ISO, PCI, or your InfoSec policy and audit plan.",
    documents
  ),
  insurance: spec(
    "Cyber liability insurance",
    "Certificate or attestation. It must be current on your go-live date.",
    documents
  ),
  complaintsPolicy: spec(
    "Complaints policy and procedure",
    "How a complaint moves from intake to resolution.",
    documents
  ),
  complaintsTracker: spec(
    "Complaints tracker",
    "The sheet you will share with Apocor each month.",
    [".pdf", ".csv", ".xlsx", ".numbers"]
  ),
  terms: spec("User terms and conditions", "Reviewed by Apocor before launch.", documents),
  feeScheduleDoc: spec("Fee schedule", "What users can read about pricing.", documents),
  privacy: spec("Privacy policy", "Reviewed by Apocor before launch.", documents),
  marketing: spec(
    "Marketing and website copy",
    "Copy that describes Apocor-powered features.",
    documents
  ),
  appIcon: spec(
    "App icon",
    "PNG, 100 × 100 px, for wallet notifications.",
    [".png"],
    { width: 100, height: 100 }
  ),
  logoSvg: spec("Logo, SVG", "A vector logo for light and dark lockups.", [".svg"]),
  logoPngLight: spec("Logo, PNG for light backgrounds", "A PNG that reads on a light surface.", [".png"]),
  logoPngDark: spec("Logo, PNG for dark backgrounds", "A PNG that reads on a dark surface.", [".png"]),
  sourceFiles: spec(
    "Editable source files",
    "So revisions can turn around quickly. Zip the working files if there are several.",
    [".zip", ".ai", ".psd", ".fig", ".sketch", ".svg", ".pdf", ".png"],
    { multiple: true }
  ),
  brandGuidelines: spec("Brand guidelines", "If you have them.", documents),
  walletBlank: spec(
    "Wallet credential, blank",
    "1536 × 969 px PNG. Your logo, the network logo, and DEBIT in capitals. Square corners.",
    [".png"],
    { width: 1536, height: 969 }
  ),
  walletLast4: spec(
    "Wallet credential, last 4",
    "1536 × 969 px PNG with only the last 4 digits populated.",
    [".png"],
    { width: 1536, height: 969 }
  ),
  inAppBlank: spec(
    "In-app credential, blank",
    "500 × 315 px PNG or JPG, horizontal.",
    [".png", ".jpg", ".jpeg"],
    { width: 500, height: 315 }
  ),
  inAppPopulated: spec(
    "In-app credential, populated",
    "500 × 315 px with number, name, expiry, and security code placed.",
    [".png", ".jpg", ".jpeg"],
    { width: 500, height: 315 }
  ),
  screenActivation: spec("Activation screens", "A design export or screenshot.", images, { multiple: true }),
  screenPaying: spec("Paying screens", "Tap, scan, and online, as you will launch them.", images, { multiple: true }),
  screenHistory: spec("History screens", "Summary and single-payment views.", images, { multiple: true }),
  screenStatements: spec("Statement screens", "How users find and download statements.", images, { multiple: true }),
  screenSupport: spec("Support screens", "How users reach you.", images, { multiple: true }),
  screenFunding: spec("Funding screens", "How users add stablecoins.", images, { multiple: true }),
  screenWithdrawals: spec("Withdrawal screens", "How users move funds out.", images, { multiple: true }),
  screenDisputes: spec("Dispute screens", "Where users report a payment problem.", images, { multiple: true }),
  screenFreeze: spec(
    "Freeze, cancel, and replace screens",
    "How users manage their credential.",
    images,
    { multiple: true }
  ),
} as const satisfies Record<string, FileSpec>

export type FileField = keyof typeof FILE_SPECS

export function isFileField(value: string): value is FileField {
  return value in FILE_SPECS
}

export function extensionOf(name: string) {
  const index = name.lastIndexOf(".")
  return index === -1 ? "" : name.slice(index).toLowerCase()
}

export function fileProblem(field: string, files: File[]) {
  if (!isFileField(field)) return "Unknown upload."
  const specForField = FILE_SPECS[field]
  if (!specForField.multiple && files.length > 1) return "Attach one file."
  for (const file of files) {
    if (file.size > MAX_FILE_BYTES) return "Each file must be 8 MB or smaller."
    const extension = extensionOf(file.name)
    if (!(specForField.extensions as readonly string[]).includes(extension)) {
      return `Use a ${specForField.extensions.join(", ")} file.`
    }
  }
  return null
}

export async function imageProblem(field: string, files: File[]) {
  if (!isFileField(field)) return null
  const specForField = FILE_SPECS[field]
  if (!specForField.width || !specForField.height) return null
  if (typeof createImageBitmap !== "function") return null
  for (const file of files) {
    try {
      const bitmap = await createImageBitmap(file)
      const matches =
        bitmap.width === specForField.width && bitmap.height === specForField.height
      const actual = `${bitmap.width} × ${bitmap.height}`
      bitmap.close()
      if (!matches) {
        return `Use a ${specForField.width} × ${specForField.height} px image. This one is ${actual}.`
      }
    } catch {
      return "That image could not be read."
    }
  }
  return null
}
