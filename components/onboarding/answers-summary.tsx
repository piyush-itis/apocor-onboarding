import { Button } from "@/components/ui/button"
import {
  Card,
  CardAction,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { buildSummary, type SummaryFile } from "@/lib/onboarding/summary"
import type { OnboardingValues } from "@/lib/onboarding/schema"
import type { StepId } from "@/lib/onboarding/steps"

export function AnswersSummary({
  values,
  files,
  onEdit,
}: {
  values: OnboardingValues
  files: SummaryFile[]
  onEdit?: (stepId: StepId) => void
}) {
  const sections = buildSummary(values, files)
  return (
    <div className="flex flex-col gap-4">
      {sections.map((section) => (
        <Card key={section.id}>
          <CardHeader>
            <CardTitle>{section.title}</CardTitle>
            {onEdit ? (
              <CardAction>
                <Button type="button" variant="ghost" size="sm" onClick={() => onEdit(section.stepId)}>
                  Edit
                </Button>
              </CardAction>
            ) : null}
          </CardHeader>
          <CardContent>
            <dl className="flex flex-col gap-4">
              {section.rows.map((row) => (
                <div key={row.label} className="flex flex-col gap-1">
                  <dt className="text-muted-foreground">{row.label}</dt>
                  <dd className="whitespace-pre-wrap">{row.value}</dd>
                </div>
              ))}
            </dl>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
