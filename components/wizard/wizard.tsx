"use client"

import { useCallback, useEffect, useMemo, useState, useSyncExternalStore, type ReactNode } from "react"
import Link from "next/link"
import { motion, useReducedMotion } from "motion/react"
import { ArrowLeftIcon, ArrowRightIcon, InfoIcon } from "lucide-react"
import { useForm, useWatch } from "react-hook-form"
import { toast } from "sonner"

import { AnswersSummary } from "@/components/onboarding/answers-summary"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Separator } from "@/components/ui/separator"
import { Spinner } from "@/components/ui/spinner"
import { BuildStep, FlowsStep, GoLiveStep, ReviewStep, ScreensStep } from "@/components/wizard/build"
import { AboutStep, LaunchStep, ScaleStep } from "@/components/wizard/discovery"
import { BrandStep, CardsStep, ExperienceStep, InAppStep, WalletArtStep } from "@/components/wizard/experience"
import { CompanyStep, ContactsStep, ControlsStep, DeclarationStep, ProfileStep, ProtectionStep } from "@/components/wizard/trust"
import type { StepProps } from "@/components/wizard/types"
import { clearDraft, draftSnapshot, parseDraft, saveDraft, subscribeDraft } from "@/lib/onboarding/draft"
import { createDefaults, type FileBag, type OnboardingValues } from "@/lib/onboarding/schema"
import { CHAPTERS, STEPS, visibleSteps, type StepId } from "@/lib/onboarding/steps"
import { validateAll, validateStep, type FieldErrors } from "@/lib/onboarding/validate"

const stepViews: Record<StepId, (props: StepProps) => ReactNode> = {
  about: (props) => <AboutStep {...props} />,
  launch: (props) => <LaunchStep {...props} />,
  scale: (props) => <ScaleStep {...props} />,
  profile: (props) => <ProfileStep {...props} />,
  company: (props) => <CompanyStep {...props} />,
  contacts: (props) => <ContactsStep {...props} />,
  controls: (props) => <ControlsStep {...props} />,
  protection: (props) => <ProtectionStep {...props} />,
  declaration: (props) => <DeclarationStep {...props} />,
  experience: (props) => <ExperienceStep {...props} />,
  brand: (props) => <BrandStep {...props} />,
  "wallet-art": (props) => <WalletArtStep {...props} />,
  "inapp-art": (props) => <InAppStep {...props} />,
  cards: (props) => <CardsStep {...props} />,
  build: (props) => <BuildStep {...props} />,
  flows: (props) => <FlowsStep {...props} />,
  screens: (props) => <ScreensStep {...props} />,
  golive: (props) => <GoLiveStep {...props} />,
  review: (props) => <ReviewStep {...props} />,
}

function resolveStep(steps: ReturnType<typeof visibleSteps>, stepId: StepId) {
  if (steps.some((step) => step.id === stepId)) return stepId
  const start = STEPS.findIndex((step) => step.id === stepId)
  for (let index = start; index >= 0; index -= 1) {
    const candidate = STEPS[index]
    if (candidate && steps.some((step) => step.id === candidate.id)) return candidate.id
  }
  return steps[0]?.id ?? "about"
}

export function Wizard() {
  const raw = useSyncExternalStore(subscribeDraft, draftSnapshot, () => "")
  if (!raw) {
    return (
      <main className="min-h-svh bg-background px-6 py-8">
        <p className="font-display text-2xl">Apocor</p>
      </main>
    )
  }
  const draft = parseDraft(raw)
  return (
    <WizardForm
      initialValues={draft?.values ?? createDefaults()}
      initialFileNames={draft?.fileNames ?? {}}
    />
  )
}

function WizardForm({
  initialValues,
  initialFileNames,
}: {
  initialValues: OnboardingValues
  initialFileNames: Record<string, string[]>
}) {
  const reduce = useReducedMotion()
  const form = useForm<OnboardingValues>({ defaultValues: initialValues })
  const { getValues, control, subscribe } = form
  const payMethods = useWatch({ control, name: "payMethods" })
  const products = useWatch({ control, name: "products" })
  const cardFormat = useWatch({ control, name: "cardFormat" })
  const [stepId, setStepId] = useState<StepId>("about")
  const [errors, setErrors] = useState<FieldErrors>({})
  const [files, setFiles] = useState<FileBag>({})
  const [remembered] = useState(initialFileNames)
  const [pending, setPending] = useState(false)
  const [upload, setUpload] = useState<{ current: number; total: number } | null>(null)
  const [reference, setReference] = useState<string | null>(null)
  const [submissionId, setSubmissionId] = useState<string | null>(null)

  const steps = useMemo(
    () => visibleSteps({ ...getValues(), payMethods, products, cardFormat }),
    [cardFormat, getValues, payMethods, products]
  )
  const resolvedId = resolveStep(steps, stepId)
  const index = Math.max(0, steps.findIndex((step) => step.id === resolvedId))
  const step = steps[index] ?? steps[0]

  const persistDraft = useCallback(() => {
    const names = { ...remembered }
    for (const [field, list] of Object.entries(files)) {
      if (list.length) names[field] = list.map((file) => file.name)
    }
    saveDraft(getValues(), names)
  }, [files, getValues, remembered])

  useEffect(() => {
    let timer = 0
    const unsubscribe = subscribe({
      formState: { values: true },
      callback: () => {
        window.clearTimeout(timer)
        timer = window.setTimeout(persistDraft, 500)
      },
    })
    return () => {
      unsubscribe()
      window.clearTimeout(timer)
    }
  }, [persistDraft, subscribe])

  useEffect(() => {
    persistDraft()
  }, [persistDraft])

  function updateFiles(field: string, next: File[]) {
    setFiles((current) => ({ ...current, [field]: next }))
    setErrors((current) => {
      const copy = { ...current }
      delete copy[`file.${field}`]
      return copy
    })
  }

  async function goNext() {
    if (!step) return
    if (step.id === "review") {
      await submit()
      return
    }
    const nextErrors = await validateStep(step.id, getValues(), files)
    setErrors(nextErrors)
    if (Object.keys(nextErrors).length) {
      window.requestAnimationFrame(() => {
        document.querySelector("[data-invalid='true']")?.scrollIntoView({ behavior: "smooth", block: "center" })
      })
      return
    }
    const next = steps[index + 1]
    if (next) {
      setErrors({})
      setStepId(next.id)
      window.scrollTo({ top: 0, behavior: reduce ? "auto" : "smooth" })
    }
  }

  function goBack() {
    const previous = steps[index - 1]
    setErrors({})
    if (previous) {
      setStepId(previous.id)
      window.scrollTo({ top: 0, behavior: reduce ? "auto" : "smooth" })
      return
    }
  }

  async function submit() {
    const problem = await validateAll(getValues(), files)
    if (problem) {
      setStepId(problem.stepId)
      setErrors(problem.errors)
      toast.error("A few answers still need attention.")
      return
    }
    setPending(true)
    try {
      let id = submissionId
      if (!id) {
        const response = await fetch("/api/submissions", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ answers: getValues() }),
        })
        const body = (await response.json().catch(() => null)) as { id?: string; error?: string } | null
        if (!response.ok || !body?.id) throw new Error(body?.error || "Could not save your answers.")
        id = body.id
        setSubmissionId(id)
      }
      const entries = Object.entries(files).flatMap(([field, list]) =>
        list.map((file) => ({ field, file }))
      )
      for (let item = 0; item < entries.length; item += 1) {
        setUpload({ current: item + 1, total: entries.length })
        const body = new FormData()
        body.set("field", entries[item].field)
        body.set("file", entries[item].file)
        const response = await fetch(`/api/submissions/${id}/files`, { method: "POST", body })
        if (!response.ok) {
          const payload = (await response.json().catch(() => null)) as { error?: string } | null
          throw new Error(payload?.error || `Could not upload ${entries[item].file.name}.`)
        }
      }
      const done = await fetch(`/api/submissions/${id}/complete`, { method: "POST" })
      if (!done.ok) throw new Error("Could not finish the submission.")
      clearDraft()
      setReference(id)
      window.scrollTo({ top: 0, behavior: reduce ? "auto" : "smooth" })
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Something went wrong.")
    } finally {
      setPending(false)
      setUpload(null)
    }
  }

  const missing = Object.entries(remembered).filter(
    ([field, names]) => names.length > 0 && !(files[field]?.length)
  )
  const props: StepProps = {
    form,
    errors,
    files,
    setFiles: updateFiles,
    onEdit: (next) => {
      setErrors({})
      setStepId(next)
    },
  }

  if (reference) {
    return (
      <Confirmation
        id={reference}
        values={getValues()}
        files={Object.entries(files).flatMap(([field, list]) => list.map((file) => ({ field, name: file.name })))}
      />
    )
  }

  return (
    <div className="min-h-svh bg-background lg:grid lg:grid-cols-[18rem_minmax(0,1fr)]">
      <aside className="sticky top-0 hidden h-svh flex-col gap-8 border-r bg-card px-6 py-8 lg:flex">
        <Link href="/" className="font-display text-2xl tracking-tight">
          Apocor
        </Link>
        <nav className="flex flex-col gap-6 overflow-auto" aria-label="Onboarding chapters">
          {CHAPTERS.map((chapter) => {
            const chapterSteps = steps.filter((item) => item.chapter === chapter.id)
            return (
              <div key={chapter.id} className="flex flex-col gap-2">
                <p className="text-xs tracking-[0.18em] text-muted-foreground uppercase">
                  {chapter.id} {chapter.title}
                </p>
                {chapterSteps.map((item) => {
                  const itemIndex = steps.findIndex((candidate) => candidate.id === item.id)
                  const active = item.id === step?.id
                  return (
                    <button
                      key={item.id}
                      type="button"
                      disabled={itemIndex > index}
                      onClick={() => {
                        if (itemIndex <= index) setStepId(item.id)
                      }}
                      className={
                        active
                          ? "text-left text-sm font-medium"
                          : "text-left text-sm text-muted-foreground disabled:opacity-50"
                      }
                    >
                      {item.title}
                    </button>
                  )
                })}
              </div>
            )
          })}
        </nav>
        <p className="mt-auto text-xs text-muted-foreground">Draft saved on this device.</p>
      </aside>

      <div className="flex min-w-0 flex-col">
        <header className="sticky top-0 z-10 flex flex-col gap-3 border-b bg-background/90 px-5 py-4 backdrop-blur md:px-10">
          <div className="flex items-center justify-between gap-4 lg:hidden">
            <Link href="/" className="font-display text-xl">
              Apocor
            </Link>
            <p className="text-sm text-muted-foreground">
              {index + 1} / {steps.length}
            </p>
          </div>
          <Progress value={((index + 1) / Math.max(steps.length, 1)) * 100} aria-label="Onboarding progress" />
        </header>

        <form
          className="mx-auto flex w-full max-w-3xl flex-1 flex-col gap-8 px-5 py-8 md:px-10 md:py-12"
          onSubmit={(event) => {
            event.preventDefault()
            void goNext()
          }}
        >
          {missing.length ? (
            <Alert>
              <InfoIcon />
              <AlertTitle>Reattach files after a refresh</AlertTitle>
              <AlertDescription>
                Answers are saved on this device. Uploads stay in the session, so add these again:{" "}
                {missing.flatMap(([, names]) => names).join(", ")}.
              </AlertDescription>
            </Alert>
          ) : null}

          <motion.div
              key={step?.id}
              className="flex flex-col gap-8"
              initial={reduce ? false : { y: 16 }}
              animate={{ y: 0 }}
              transition={{ duration: reduce ? 0 : 0.35, ease: [0.22, 1, 0.36, 1] }}
            >
              <div className="flex flex-col gap-3">
                <p className="text-xs tracking-[0.18em] text-muted-foreground uppercase">{step?.kicker}</p>
                <h1 className="font-display text-4xl leading-tight text-balance md:text-5xl">{step?.title}</h1>
                <p className="max-w-xl text-muted-foreground">{step?.lede}</p>
              </div>
              {step ? stepViews[step.id](props) : null}
          </motion.div>

          <Separator />
          <div className="flex items-center justify-between gap-3">
            {index === 0 ? (
              <Button asChild type="button" variant="outline" className="h-11">
                <Link href="/">
                  <ArrowLeftIcon data-icon="inline-start" />
                  Back
                </Link>
              </Button>
            ) : (
              <Button type="button" variant="outline" className="h-11" onClick={goBack}>
                <ArrowLeftIcon data-icon="inline-start" />
                Back
              </Button>
            )}
            <Button type="submit" className="h-11 px-5" disabled={pending}>
              {pending ? <Spinner data-icon="inline-start" /> : null}
              {step?.id === "review" ? (upload ? `Sending ${upload.current} of ${upload.total}` : "Submit onboarding") : "Continue"}
              {step?.id === "review" || pending ? null : <ArrowRightIcon data-icon="inline-end" />}
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}

function Confirmation({
  id,
  values,
  files,
}: {
  id: string
  values: OnboardingValues
  files: { field: string; name: string }[]
}) {
  return (
    <main className="mx-auto flex min-h-svh w-full max-w-3xl flex-col gap-8 px-5 py-12 md:px-10">
      <Link href="/" className="font-display text-2xl">
        Apocor
      </Link>
      <div className="flex flex-col gap-3">
        <p className="text-xs tracking-[0.18em] text-muted-foreground uppercase">Received</p>
        <h1 className="font-display text-5xl leading-tight">You are on the list.</h1>
        <p className="max-w-xl text-muted-foreground">
          Reference <span className="text-foreground">{id}</span>. We will walk through the plan, confirm scope, and agree timelines on the launch call.
        </p>
      </div>
      <div className="flex flex-wrap gap-3">
        <Button asChild className="h-11 px-5">
          <a href="https://cal.com/rishabjain/synergy-meet">Book the launch call</a>
        </Button>
        <Button asChild variant="outline" className="h-11">
          <a href="mailto:rishab@apocor.ai">Email Rishab</a>
        </Button>
      </div>
      <AnswersSummary values={values} files={files} />
    </main>
  )
}
