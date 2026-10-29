import { mkdir, readFile, readdir, writeFile } from "node:fs/promises"
import path from "node:path"

import { extensionOf, isFileField, MAX_FILE_BYTES } from "@/lib/onboarding/files"
import { mergeDefaults, onboardingSchema, type OnboardingValues } from "@/lib/onboarding/schema"

export type StoredFile = {
  field: string
  name: string
  size: number
  type: string
  storedName: string
}

export type SubmissionRecord = {
  id: string
  createdAt: string
  updatedAt: string
  status: "receiving" | "complete"
  answers: OnboardingValues
  files: StoredFile[]
}

const root = path.join(process.cwd(), "data", "submissions")

function assertId(id: string) {
  if (!/^[0-9a-f-]{36}$/i.test(id)) throw new Error("Invalid submission.")
  return id
}

export function submissionDir(id: string) {
  return path.join(root, assertId(id))
}

async function readRecord(id: string) {
  const raw = await readFile(path.join(submissionDir(id), "answers.json"), "utf8")
  return JSON.parse(raw) as SubmissionRecord
}

async function writeRecord(record: SubmissionRecord) {
  await mkdir(submissionDir(record.id), { recursive: true })
  await writeFile(
    path.join(submissionDir(record.id), "answers.json"),
    JSON.stringify(record, null, 2)
  )
}

export async function createSubmission(input: unknown) {
  const answers = mergeDefaults(onboardingSchema.parse(input))
  const id = crypto.randomUUID()
  const now = new Date().toISOString()
  const record: SubmissionRecord = {
    id,
    createdAt: now,
    updatedAt: now,
    status: "receiving",
    answers,
    files: [],
  }
  await writeRecord(record)
  return record
}

export function safeFileName(name: string) {
  const base = name.split(/[/\\]/).pop() ?? "file"
  const cleaned = base.replace(/[^a-zA-Z0-9._-]/g, "_").slice(0, 80)
  return cleaned || "file"
}

export async function saveSubmissionFile(id: string, field: string, file: File) {
  if (!isFileField(field)) throw new Error("Unknown file.")
  if (file.size > MAX_FILE_BYTES) throw new Error("File is larger than 8 MB.")
  const extension = extensionOf(file.name)
  const storedName = `${field}__${Date.now()}__${safeFileName(file.name || `file${extension}`)}`
  if (!/^[a-zA-Z0-9._-]+$/.test(storedName)) throw new Error("Invalid file name.")
  const record = await readRecord(id)
  const bytes = Buffer.from(await file.arrayBuffer())
  await writeFile(path.join(submissionDir(id), storedName), bytes)
  const next: StoredFile = {
    field,
    name: file.name,
    size: file.size,
    type: file.type,
    storedName,
  }
  record.files = record.files.filter((item) => item.field !== field || field === "ownerIds" || field === "sourceFiles" || field.startsWith("screen"))
  record.files.push(next)
  record.updatedAt = new Date().toISOString()
  await writeRecord(record)
  return next
}

export async function completeSubmission(id: string) {
  const record = await readRecord(id)
  record.status = "complete"
  record.updatedAt = new Date().toISOString()
  await writeRecord(record)
  return record
}

export async function listSubmissions() {
  try {
    const entries = await readdir(root)
    const records = await Promise.all(
      entries.map(async (entry) => {
        try {
          return await readRecord(entry)
        } catch {
          return null
        }
      })
    )
    return records
      .filter((record): record is SubmissionRecord => Boolean(record))
      .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
  } catch {
    return []
  }
}

export async function getSubmission(id: string) {
  try {
    return await readRecord(id)
  } catch {
    return null
  }
}

export async function readSubmissionFile(id: string, storedName: string) {
  if (!/^[a-zA-Z0-9._-]+$/.test(storedName)) return null
  const record = await getSubmission(id)
  const match = record?.files.find((file) => file.storedName === storedName)
  if (!record || !match) return null
  const bytes = await readFile(path.join(submissionDir(id), storedName))
  return { file: match, bytes }
}
