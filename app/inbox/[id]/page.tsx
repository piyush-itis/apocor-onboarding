import type { Metadata } from "next"
import Link from "next/link"
import { notFound, redirect } from "next/navigation"

import { AnswersSummary } from "@/components/onboarding/answers-summary"
import { Button } from "@/components/ui/button"
import { hasInboxAccess } from "@/lib/onboarding/auth"
import { getSubmission } from "@/lib/onboarding/storage"

export const metadata: Metadata = {
  title: "Submission",
}

export const dynamic = "force-dynamic"

export default async function SubmissionPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  if (!(await hasInboxAccess())) redirect("/inbox")
  const { id } = await params
  const submission = await getSubmission(id)
  if (!submission) notFound()

  return (
    <main className="mx-auto flex min-h-svh w-full max-w-3xl flex-col gap-8 px-5 py-12">
      <div className="flex items-center justify-between gap-4">
        <Link href="/" className="font-display text-2xl">
          Apocor
        </Link>
        <Button asChild variant="outline">
          <Link href="/inbox">All submissions</Link>
        </Button>
      </div>
      <div className="flex flex-col gap-2">
        <p className="text-xs tracking-[0.18em] text-muted-foreground uppercase">{submission.status}</p>
        <h1 className="font-display text-4xl">
          {submission.answers.brandName || submission.answers.legalName}
        </h1>
        <p className="text-muted-foreground">
          {submission.id} · {new Date(submission.createdAt).toLocaleString()}
        </p>
      </div>
      {submission.files.length ? (
        <div className="flex flex-col gap-2">
          <h2 className="text-sm font-medium">Files</h2>
          <div className="flex flex-col items-start gap-1">
            {submission.files.map((file) => (
              <Button key={file.storedName} variant="link" asChild>
                <a href={`/api/submissions/${submission.id}/files/${file.storedName}`}>{file.name}</a>
              </Button>
            ))}
          </div>
        </div>
      ) : null}
      <AnswersSummary values={submission.answers} files={submission.files} />
    </main>
  )
}
