"use client"

import { Checkbox } from "@/components/ui/checkbox"
import {
  Field,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
  FieldLegend,
  FieldSet,
} from "@/components/ui/field"
import { Button } from "@/components/ui/button"
import { AreaField, CheckList, FileField, MultiChoice, SignaturePad, SingleChoice, TextField } from "@/components/wizard/controls"
import type { StepProps } from "@/components/wizard/types"
import { AnswersSummary } from "@/components/onboarding/answers-summary"
import { FLOWS, GO_LIVE_CHECKS, SCREENS, SURFACES, YES_NO } from "@/lib/onboarding/options"
import { PlusIcon } from "lucide-react"

export function BuildStep({ form, errors }: StepProps) {
  const { register, control, watch, setValue } = form
  const people = watch("sandboxUsers")
  return (
    <div className="flex flex-col gap-8">
      <FieldGroup>
        <TextField label="Who owns the integration end to end?" name="integrationOwner" register={register} error={errors.integrationOwner} />
        <TextField label="Technical team size" name="teamSize" register={register} error={errors.teamSize} />
        <MultiChoice control={control} name="surfaces" label="Where will Apocor run?" options={SURFACES} error={errors.surfaces} />
        <SingleChoice control={control} name="experienceUx" label="UX and UI design" options={YES_NO} error={errors.experienceUx} />
        <SingleChoice control={control} name="experienceApis" label="Integrating third-party APIs" options={YES_NO} error={errors.experienceApis} />
        <SingleChoice control={control} name="experienceWhiteLabel" label="White-label fintech integrations" description="On-ramps, PSPs, and similar." options={YES_NO} error={errors.experienceWhiteLabel} />
        <AreaField label="Current payments, wallet, and infrastructure partners" name="currentPartners" register={register} error={errors.currentPartners} />
        <AreaField label="Your Apocor dashboard" name="dashboardWishes" register={register} error={errors.dashboardWishes} description="Any user, payment, or reporting data you would like to see there." />
      </FieldGroup>
      <FieldSet>
        <FieldLegend>Who needs sandbox access?</FieldLegend>
        <FieldError>{errors.sandboxUsers}</FieldError>
        <FieldGroup>
          {people.map((person, index) => (
            <FieldSet key={index}>
              <FieldLegend variant="label">Person {index + 1}</FieldLegend>
              <FieldGroup>
                <TextField label="Name" name={`sandboxUsers.${index}.name`} register={register} error={errors[`sandboxUsers.${index}.name`]} />
                <TextField label="Email" name={`sandboxUsers.${index}.email`} register={register} error={errors[`sandboxUsers.${index}.email`]} type="email" />
                {people.length > 1 ? (
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() =>
                      setValue(
                        "sandboxUsers",
                        people.filter((_, item) => item !== index),
                        { shouldDirty: true }
                      )
                    }
                  >
                    Remove
                  </Button>
                ) : null}
              </FieldGroup>
            </FieldSet>
          ))}
          <Button
            type="button"
            variant="outline"
            onClick={() => setValue("sandboxUsers", [...people, { name: "", email: "" }], { shouldDirty: true })}
          >
            <PlusIcon data-icon="inline-start" />
            Add person
          </Button>
        </FieldGroup>
      </FieldSet>
    </div>
  )
}

export function FlowsStep({ form, errors }: StepProps) {
  const flows = form.watch("flows")
  return (
    <CheckList
      label="Flows to test"
      description="Tick the ones that apply to your launch."
      options={FLOWS}
      value={flows}
      onChange={(next) => form.setValue("flows", next, { shouldDirty: true })}
      error={errors.flows}
    />
  )
}

export function ScreensStep({ form, errors, files, setFiles }: StepProps) {
  const { register } = form
  return (
    <FieldGroup>
      <TextField
        label="Design file link"
        name="designLink"
        register={register}
        error={errors.designLink}
        placeholder="https://"
        description="Figma or similar. Exported screens can stand in for the link."
      />
      {SCREENS.map((screen) => (
        <FileField
          key={screen.id}
          field={screen.id}
          files={files[screen.id] ?? []}
          onChange={(next) => setFiles(screen.id, next)}
          error={errors[`file.${screen.id}`]}
        />
      ))}
    </FieldGroup>
  )
}

export function GoLiveStep({ form, errors }: StepProps) {
  const { register, watch, setValue } = form
  const checks = watch("goLiveChecks")
  return (
    <FieldGroup>
      <FieldSet>
        <FieldLegend>Go-live readiness</FieldLegend>
        <FieldDescription>Mark what is already true. Unchecked items stay visible for the launch conversation.</FieldDescription>
        <FieldGroup>
          {GO_LIVE_CHECKS.map((item) => (
            <Field key={item.id} orientation="horizontal">
              <Checkbox
                id={`golive-${item.id}`}
                checked={checks[item.id]}
                onCheckedChange={(state) =>
                  setValue(`goLiveChecks.${item.id}`, state === true, { shouldDirty: true })
                }
              />
              <FieldLabel htmlFor={`golive-${item.id}`}>{item.label}</FieldLabel>
            </Field>
          ))}
        </FieldGroup>
      </FieldSet>
      <FieldDescription>
        We confirm everything above is complete and we are ready to launch with Apocor.
      </FieldDescription>
      <TextField label="Name" name="signoffName" register={register} error={errors.signoffName} />
      <TextField label="Title" name="signoffTitle" register={register} error={errors.signoffTitle} />
      <TextField label="Date" name="signoffDate" type="date" register={register} error={errors.signoffDate} />
      <SignaturePad
        value={watch("signoffSignature")}
        onChange={(next) => setValue("signoffSignature", next, { shouldDirty: true })}
        error={errors.signoffSignature}
      />
      <Field orientation="horizontal" data-invalid={errors.signoffConfirmed ? true : undefined}>
        <Checkbox
          id="signoff-confirmed"
          checked={watch("signoffConfirmed")}
          aria-invalid={errors.signoffConfirmed ? true : undefined}
          onCheckedChange={(state) => setValue("signoffConfirmed", state === true, { shouldDirty: true })}
        />
        <FieldLabel htmlFor="signoff-confirmed">We are ready to launch with Apocor</FieldLabel>
      </Field>
      <FieldError>{errors.signoffConfirmed}</FieldError>
    </FieldGroup>
  )
}

export function ReviewStep({ form, files, onEdit }: StepProps) {
  const values = form.watch()
  const attached = Object.entries(files).flatMap(([field, list]) =>
    list.map((file) => ({ field, name: file.name }))
  )
  return <AnswersSummary values={values} files={attached} onEdit={onEdit} />
}
