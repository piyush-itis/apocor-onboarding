"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"

import { Button } from "@/components/ui/button"
import { Field, FieldError, FieldGroup, FieldLabel } from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { Spinner } from "@/components/ui/spinner"

export function UnlockForm() {
  const router = useRouter()
  const [key, setKey] = useState("")
  const [error, setError] = useState("")
  const [pending, setPending] = useState(false)

  return (
    <form
      className="flex w-full max-w-sm flex-col gap-6"
      onSubmit={async (event) => {
        event.preventDefault()
        setPending(true)
        setError("")
        const response = await fetch("/api/inbox/session", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ key }),
        })
        const body = (await response.json().catch(() => null)) as { error?: string } | null
        setPending(false)
        if (!response.ok) {
          setError(body?.error || "That key does not match.")
          return
        }
        router.refresh()
      }}
    >
      <div className="flex flex-col gap-3">
        <p className="text-xs tracking-[0.18em] text-muted-foreground uppercase">Team inbox</p>
        <h1 className="font-display text-4xl">Open the submissions.</h1>
        <p className="text-muted-foreground">Use the onboarding access key for this environment.</p>
      </div>
      <FieldGroup>
        <Field data-invalid={error ? true : undefined}>
          <FieldLabel htmlFor="access-key">Access key</FieldLabel>
          <Input
            id="access-key"
            type="password"
            autoComplete="current-password"
            className="h-11"
            value={key}
            aria-invalid={error ? true : undefined}
            onChange={(event) => setKey(event.target.value)}
          />
          <FieldError>{error}</FieldError>
        </Field>
      </FieldGroup>
      <Button type="submit" className="h-11" disabled={pending}>
        {pending ? <Spinner data-icon="inline-start" /> : null}
        Unlock inbox
      </Button>
    </form>
  )
}
