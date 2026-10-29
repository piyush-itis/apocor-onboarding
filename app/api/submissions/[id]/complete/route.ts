import { NextResponse } from "next/server"

import { completeSubmission } from "@/lib/onboarding/storage"

export const maxDuration = 60

export async function POST(
  _request: Request,
  context: { params: Promise<{ id: string }> }
) {
  const { id } = await context.params
  try {
    await completeSubmission(id)
    return NextResponse.json({ ok: true })
  } catch (error) {
    const message = error instanceof Error ? error.message : "Could not finish the submission."
    const safe = message.startsWith("Could not email") || message === "Email is not configured." || message === "Invalid submission."
    return NextResponse.json(
      { error: safe ? message : "Could not finish the submission." },
      { status: 400 }
    )
  }
}
