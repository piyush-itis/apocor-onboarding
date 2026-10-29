import { NextResponse } from "next/server"

import { saveSubmissionFile } from "@/lib/onboarding/storage"

export const maxDuration = 60

export async function POST(
  request: Request,
  context: { params: Promise<{ id: string }> }
) {
  const { id } = await context.params
  const form = await request.formData()
  const field = String(form.get("field") ?? "")
  const file = form.get("file")
  if (!(file instanceof File)) {
    return NextResponse.json({ error: "Missing file." }, { status: 400 })
  }
  try {
    const saved = await saveSubmissionFile(id, field, file)
    return NextResponse.json({ ok: true, storedName: saved.storedName })
  } catch (error) {
    const message = error instanceof Error ? error.message : "Upload failed."
    return NextResponse.json({ error: message }, { status: 400 })
  }
}
