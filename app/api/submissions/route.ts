import { NextResponse } from "next/server"

import { createSubmission } from "@/lib/onboarding/storage"

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as { answers?: unknown }
    const record = await createSubmission(body.answers)
    return NextResponse.json({ id: record.id })
  } catch {
    return NextResponse.json({ error: "Those answers could not be saved." }, { status: 400 })
  }
}
