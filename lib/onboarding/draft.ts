import { mergeDefaults, type OnboardingValues } from "@/lib/onboarding/schema"

const KEY = "apocor-onboarding-draft-v1"
const EVENT = "apocor-draft"

export type Draft = {
  values: OnboardingValues
  fileNames: Record<string, string[]>
}

export function parseDraft(raw: string | null): Draft | null {
  if (!raw || raw === "none") return null
  try {
    const parsed = JSON.parse(raw) as { values?: unknown; fileNames?: Record<string, string[]> }
    return {
      values: mergeDefaults(parsed.values),
      fileNames: parsed.fileNames ?? {},
    }
  } catch {
    return null
  }
}

export function draftSnapshot() {
  return window.localStorage.getItem(KEY) ?? "none"
}

export function subscribeDraft(onStoreChange: () => void) {
  window.addEventListener(EVENT, onStoreChange)
  window.addEventListener("storage", onStoreChange)
  return () => {
    window.removeEventListener(EVENT, onStoreChange)
    window.removeEventListener("storage", onStoreChange)
  }
}

export function saveDraft(values: OnboardingValues, fileNames: Record<string, string[]>) {
  const payload: Draft = { values, fileNames }
  window.localStorage.setItem(KEY, JSON.stringify(payload))
  window.dispatchEvent(new Event(EVENT))
}

export function clearDraft() {
  window.localStorage.removeItem(KEY)
  window.dispatchEvent(new Event(EVENT))
}
