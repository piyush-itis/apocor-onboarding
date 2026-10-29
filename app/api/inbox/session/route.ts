import { cookies } from "next/headers"
import { NextResponse } from "next/server"

import { ACCESS_COOKIE, accessToken, keysMatch } from "@/lib/onboarding/auth"

export async function POST(request: Request) {
  const expected = process.env.ONBOARDING_ACCESS_KEY
  if (!expected) {
    return NextResponse.json({ error: "The inbox key is not configured." }, { status: 503 })
  }
  const body = (await request.json().catch(() => null)) as { key?: unknown } | null
  const key = typeof body?.key === "string" ? body.key : ""
  if (!keysMatch(key, expected)) {
    return NextResponse.json({ error: "That key does not match." }, { status: 401 })
  }
  const jar = await cookies()
  jar.set(ACCESS_COOKIE, accessToken(expected), {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 24 * 30,
  })
  return NextResponse.json({ ok: true })
}
