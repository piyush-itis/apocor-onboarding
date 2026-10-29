import { FILE_SPECS, isFileField } from "@/lib/onboarding/files"
import type { OnboardingValues } from "@/lib/onboarding/schema"
import { buildSummary } from "@/lib/onboarding/summary"

type MailedSubmission = {
  id: string
  createdAt: string
  answers: OnboardingValues
  files: { field: string; name: string }[]
}

const notifyEmail = process.env.ONBOARDING_NOTIFY_EMAIL || "piyush@apocor.ai"

type Attachment = {
  filename: string
  content: Buffer
  contentType?: string
}

export function clientLabel(values: Pick<OnboardingValues, "brandName" | "legalName">) {
  return (values.brandName.trim() || values.legalName.trim() || "New client").slice(0, 80)
}

function signatureFile(dataUrl: string, filename: string): Attachment | null {
  const match = dataUrl.match(/^data:(image\/[\w.+-]+);base64,(.+)$/)
  if (!match) return null
  return {
    filename,
    content: Buffer.from(match[2], "base64"),
    contentType: match[1],
  }
}

function submissionText(record: MailedSubmission) {
  const sections = buildSummary(
    record.answers,
    record.files.map((file) => ({ field: file.field, name: file.name }))
  )
  const lines = [
    `Reference ${record.id}`,
    `Received ${record.createdAt}`,
    "",
    ...sections.flatMap((section) => [
      section.title,
      ...section.rows.map((row) => `${row.label}: ${row.value}`),
      "",
    ]),
  ]
  if (record.answers.declarationSignature.startsWith("data:image")) {
    lines.push("Declaration signature: attached")
  }
  if (record.answers.signoffSignature.startsWith("data:image")) {
    lines.push("Go-live signature: attached")
  }
  lines.push("", "Uploaded documents arrive as separate emails with this same reference.")
  return lines.join("\n")
}

async function sendMail(input: {
  subject: string
  text: string
  replyTo?: string
  attachments?: Attachment[]
}) {
  const apiKey = process.env.RESEND_API_KEY
  const from = process.env.RESEND_FROM
  if (!apiKey || !from) throw new Error("Email is not configured.")

  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
      "User-Agent": "apocor-onboarding",
    },
    body: JSON.stringify({
      from,
      to: [notifyEmail],
      subject: input.subject,
      text: input.text,
      reply_to: input.replyTo || undefined,
      attachments: input.attachments?.map((file) => ({
        filename: file.filename,
        content: file.content.toString("base64"),
        content_type: file.contentType,
      })),
    }),
  })

  if (!response.ok) {
    const detail = await response.text()
    console.error("Resend error", response.status, detail.slice(0, 500))
    throw new Error("Could not email this submission.")
  }
}

export async function emailSubmission(record: MailedSubmission) {
  const answers = {
    ...record.answers,
    declarationSignature: record.answers.declarationSignature ? "[see attachment]" : "",
    signoffSignature: record.answers.signoffSignature ? "[see attachment]" : "",
  }
  const attachments: Attachment[] = [
    {
      filename: "answers.json",
      content: Buffer.from(JSON.stringify(answers, null, 2)),
      contentType: "application/json",
    },
  ]
  const declaration = signatureFile(record.answers.declarationSignature, "declaration-signature.png")
  const signoff = signatureFile(record.answers.signoffSignature, "golive-signature.png")
  if (declaration) attachments.push(declaration)
  if (signoff) attachments.push(signoff)

  await sendMail({
    subject: `Apocor onboarding · ${clientLabel(record.answers)}`,
    text: submissionText(record),
    replyTo: record.answers.email.trim() || undefined,
    attachments,
  })
}

export async function emailSubmissionFile(input: {
  id: string
  label: string
  field: string
  filename: string
  bytes: Buffer
  contentType: string
}) {
  const fieldLabel = isFileField(input.field) ? FILE_SPECS[input.field].label : input.field
  await sendMail({
    subject: `Apocor file · ${input.label} · ${fieldLabel}`,
    text: [`Reference ${input.id}`, `Field: ${fieldLabel}`, `File: ${input.filename}`].join("\n"),
    attachments: [
      {
        filename: input.filename || "upload",
        content: input.bytes,
        contentType: input.contentType || "application/octet-stream",
      },
    ],
  })
}

export async function emailSubmissionComplete(id: string, label: string) {
  await sendMail({
    subject: `Apocor onboarding complete · ${label}`,
    text: `Reference ${id} is complete. The answers and each uploaded file were sent in the previous emails.`,
  })
}
