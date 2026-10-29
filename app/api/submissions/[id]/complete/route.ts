import { NextResponse } from "next/server"

import { completeSubmission } from "@/lib/onboarding/storage"

export async function POST(
  _request: Request,
  context: { params: Promise<{ id: string }> }
) {
  const { id } = await context.params
  try {
    await completeSubmission(id)
    return NextResponse.json({ ok: true })
  } catch {
    return NextResponse.json({ error: "Submission not found." }, { status: 404 })
  }
}
