import { NextResponse } from "next/server"

import { hasInboxAccess } from "@/lib/onboarding/auth"
import { readSubmissionFile } from "@/lib/onboarding/storage"

export async function GET(
  _request: Request,
  context: { params: Promise<{ id: string; name: string }> }
) {
  if (!(await hasInboxAccess())) {
    return NextResponse.json({ error: "Sign in required." }, { status: 401 })
  }
  const { id, name } = await context.params
  const found = await readSubmissionFile(id, name)
  if (!found) return NextResponse.json({ error: "File not found." }, { status: 404 })
  return new NextResponse(new Uint8Array(found.bytes), {
    headers: {
      "Content-Type": found.file.type || "application/octet-stream",
      "Content-Disposition": `attachment; filename="${found.file.name.replace(/"/g, "")}"`,
    },
  })
}
