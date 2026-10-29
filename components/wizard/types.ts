import type { UseFormReturn } from "react-hook-form"

import type { FieldErrors } from "@/lib/onboarding/validate"
import type { FileBag, OnboardingValues } from "@/lib/onboarding/schema"
import type { StepId } from "@/lib/onboarding/steps"

export type StepProps = {
  form: UseFormReturn<OnboardingValues>
  errors: FieldErrors
  files: FileBag
  setFiles: (field: string, next: File[]) => void
  onEdit?: (stepId: StepId) => void
}
