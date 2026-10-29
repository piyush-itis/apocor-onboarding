import type { Metadata } from "next"
import Link from "next/link"

import { UnlockForm } from "@/components/inbox/unlock-form"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Empty, EmptyDescription, EmptyHeader, EmptyTitle } from "@/components/ui/empty"
import { hasInboxAccess } from "@/lib/onboarding/auth"
import { listSubmissions } from "@/lib/onboarding/storage"

export const metadata: Metadata = {
  title: "Inbox",
}

export const dynamic = "force-dynamic"

export default async function InboxPage() {
  return (
    <main className="mx-auto flex min-h-svh w-full max-w-3xl flex-col gap-8 px-5 py-12">
      <Link href="/" className="font-display text-2xl">
        Apocor
      </Link>
      <InboxBody />
    </main>
  )
}

async function InboxBody() {
  if (!process.env.ONBOARDING_ACCESS_KEY) {
    return (
      <div className="flex flex-col gap-3">
        <h1 className="font-display text-4xl">Inbox is not configured.</h1>
        <p className="text-muted-foreground">Set ONBOARDING_ACCESS_KEY before opening submissions.</p>
      </div>
    )
  }

  if (!(await hasInboxAccess())) return <UnlockForm />

  const submissions = await listSubmissions()
  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-2">
        <p className="text-xs tracking-[0.18em] text-muted-foreground uppercase">Team inbox</p>
        <h1 className="font-display text-4xl">Submissions</h1>
      </div>
      {submissions.length ? (
        <div className="flex flex-col gap-4">
          {submissions.map((submission) => (
            <Card key={submission.id}>
              <CardHeader>
                <CardTitle>{submission.answers.brandName || submission.answers.legalName || "Untitled"}</CardTitle>
                <CardDescription>
                  {submission.answers.email || "No email"} · {new Date(submission.createdAt).toLocaleString()} · {submission.status}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">{submission.answers.legalName}</p>
              </CardContent>
              <CardFooter>
                <Button asChild variant="outline">
                  <Link href={`/inbox/${submission.id}`}>Open</Link>
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      ) : (
        <Empty>
          <EmptyHeader>
            <EmptyTitle>No submissions yet</EmptyTitle>
            <EmptyDescription>Completed onboarding forms will appear here.</EmptyDescription>
          </EmptyHeader>
        </Empty>
      )}
    </div>
  )
}
