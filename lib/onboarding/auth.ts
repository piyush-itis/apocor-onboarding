import { createHash, timingSafeEqual } from "node:crypto"

import { cookies } from "next/headers"

export const ACCESS_COOKIE = "apocor_onboarding_access"

export function accessToken(key: string) {
  return createHash("sha256").update(`apocor-onboarding:${key}`).digest("hex")
}

export function keysMatch(input: string, expected: string) {
  const left = Buffer.from(accessToken(input))
  const right = Buffer.from(accessToken(expected))
  return left.length === right.length && timingSafeEqual(left, right)
}

export async function hasInboxAccess() {
  const expected = process.env.ONBOARDING_ACCESS_KEY
  if (!expected) return false
  const jar = await cookies()
  const token = jar.get(ACCESS_COOKIE)?.value
  if (!token) return false
  const valid = accessToken(expected)
  if (token.length !== valid.length) return false
  return timingSafeEqual(Buffer.from(token), Buffer.from(valid))
}
