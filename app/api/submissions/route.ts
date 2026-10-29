import { NextResponse } from "next/server"

import { createSubmission } from "@/lib/onboarding/storage"

export const maxDuration = 60

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as { answers?: unknown }
    const record = await createSubmission(body.answers)
    return NextResponse.json({ id: record.id })
  } catch (error) {
    const message = error instanceof Error ? error.message : "Those answers could not be saved."
    const safe = message.startsWith("Could not email") || message === "Email is not configured."
    return NextResponse.json(
      { error: safe ? message : "Those answers could not be saved." },
      { status: 400 }
    )
  }
}
