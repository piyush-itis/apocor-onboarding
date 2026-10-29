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
import { Input } from "@/components/ui/input"
import {
  Table,
  TableBody,
  TableCell,
  TableFooter,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { AreaField, FileField, SignaturePad, SingleChoice, TextField } from "@/components/wizard/controls"
import type { StepProps } from "@/components/wizard/types"
import { needsFundsFlow } from "@/lib/onboarding/conditions"
import type { FileField as FileFieldName } from "@/lib/onboarding/files"
import { AML_ITEMS, CONTACT_ROLES, INFOSEC_CHOICES, REGIONS } from "@/lib/onboarding/options"

const companyFiles: FileFieldName[] = [
  "incorporation",
  "articles",
  "directors",
  "shareholders",
  "ownerIds",
  "licencesDoc",
  "businessAddressProof",
  "groupChart",
  "financials",
]

export function ProfileStep({ form, errors }: StepProps) {
  const { register, watch } = form
  const projections = watch("projections")
  const total = (key: "usersYear1" | "usersYear2" | "usersYear3" | "avgSpend" | "paymentsPerUser") =>
    REGIONS.reduce((sum, region) => {
      const value = Number(String(projections[region.id][key]).replace(/,/g, ""))
      return sum + (Number.isFinite(value) ? value : 0)
    }, 0)

  return (
    <div className="flex flex-col gap-8">
      <FieldGroup>
        <AreaField
          label="Business description"
          name="businessDescription"
          register={register}
          error={errors.businessDescription}
          description="In three sentences, what you do and how your users will pay with Apocor."
        />
        <TextField
          label="Priority countries"
          name="priorityCountries"
          register={register}
          error={errors.priorityCountries}
        />
      </FieldGroup>
      <FieldSet>
        <FieldLegend>Projections by region</FieldLegend>
        <FieldDescription>
          Start every region in year 1, even if you launch there later. Estimates are fine.
        </FieldDescription>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Region</TableHead>
              <TableHead className="text-right">Users Y1</TableHead>
              <TableHead className="text-right">Users Y2</TableHead>
              <TableHead className="text-right">Users Y3</TableHead>
              <TableHead className="text-right">Avg spend</TableHead>
              <TableHead className="text-right">Payments</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {REGIONS.map((region) => (
              <TableRow key={region.id}>
                <TableCell>{region.label}</TableCell>
                {(["usersYear1", "usersYear2", "usersYear3", "avgSpend", "paymentsPerUser"] as const).map(
                  (key) => (
                    <TableCell key={key}>
                      <Input
                        aria-label={`${region.label} ${key}`}
                        className="h-9 text-right"
                        inputMode="decimal"
                        {...register(`projections.${region.id}.${key}`)}
                      />
                    </TableCell>
                  )
                )}
              </TableRow>
            ))}
          </TableBody>
          <TableFooter>
            <TableRow>
              <TableCell>Total</TableCell>
              <TableCell className="text-right">{total("usersYear1").toLocaleString()}</TableCell>
              <TableCell className="text-right">{total("usersYear2").toLocaleString()}</TableCell>
              <TableCell className="text-right">{total("usersYear3").toLocaleString()}</TableCell>
              <TableCell className="text-right">{total("avgSpend").toLocaleString()}</TableCell>
              <TableCell className="text-right">{total("paymentsPerUser").toLocaleString()}</TableCell>
            </TableRow>
          </TableFooter>
        </Table>
      </FieldSet>
    </div>
  )
}

export function CompanyStep({ form, errors, files, setFiles }: StepProps) {
  const { register, watch } = form
  return (
    <div className="flex flex-col gap-8">
      <FieldGroup>
        <TextField label="Company registration number" name="registrationNumber" register={register} error={errors.registrationNumber} />
        <TextField label="Regulator, if licensed" name="regulator" register={register} error={errors.regulator} />
        <AreaField label="Registered address" name="registeredAddress" register={register} error={errors.registeredAddress} />
      </FieldGroup>
      <FieldGroup>
        {companyFiles.map((field) => (
          <FileField
            key={field}
            field={field}
            files={files[field] ?? []}
            onChange={(next) => setFiles(field, next)}
            error={errors[`file.${field}`]}
          />
        ))}
        {needsFundsFlow({ walletStructure: watch("walletStructure") }) ? (
          <FileField
            field="fundsFlow"
            files={files.fundsFlow ?? []}
            onChange={(next) => setFiles("fundsFlow", next)}
            error={errors["file.fundsFlow"]}
          />
        ) : null}
      </FieldGroup>
    </div>
  )
}

export function ContactsStep({ form, errors }: StepProps) {
  const { register } = form
  return (
    <div className="flex flex-col gap-8">
      {CONTACT_ROLES.map((role) => (
        <FieldSet key={role.id}>
          <FieldLegend>{role.label}</FieldLegend>
          <FieldGroup>
            <TextField label="Name" name={`contacts.${role.id}.name`} register={register} error={errors[`contacts.${role.id}.name`]} />
            <TextField label="Title" name={`contacts.${role.id}.title`} register={register} error={errors[`contacts.${role.id}.title`]} />
            <TextField label="Email" name={`contacts.${role.id}.email`} register={register} error={errors[`contacts.${role.id}.email`]} type="email" />
          </FieldGroup>
        </FieldSet>
      ))}
    </div>
  )
}

export function ControlsStep({ form, errors, files, setFiles }: StepProps) {
  const { register, control, watch, setValue } = form
  return (
    <div className="flex flex-col gap-8">
      <FieldSet>
        <FieldLegend>BSA / AML</FieldLegend>
        <FieldDescription>
          How you comply with the Bank Secrecy Act and anti-money laundering rules, or their equivalent. Share at least one. If an item does not apply, say why.
        </FieldDescription>
        <FieldGroup>
          {AML_ITEMS.map((item) => {
            const answer = watch(`aml.${item.id}`)
            return (
              <FieldSet key={item.id}>
                <FieldLegend variant="label">{item.label}</FieldLegend>
                <FieldDescription>{item.hint}</FieldDescription>
                <Field orientation="horizontal">
                  <Checkbox
                    id={`na-${item.id}`}
                    checked={answer.notApplicable}
                    onCheckedChange={(state) =>
                      setValue(`aml.${item.id}.notApplicable`, state === true, { shouldDirty: true })
                    }
                  />
                  <FieldLabel htmlFor={`na-${item.id}`}>This does not apply</FieldLabel>
                </Field>
                {answer.notApplicable ? (
                  <TextField
                    label="Why it does not apply"
                    name={`aml.${item.id}.reason`}
                    register={register}
                    error={errors[`aml.${item.id}`]}
                  />
                ) : (
                  <FileField
                    field={item.file}
                    files={files[item.file] ?? []}
                    onChange={(next) => setFiles(item.file, next)}
                    error={errors[`aml.${item.id}`] || errors[`file.${item.file}`]}
                  />
                )}
              </FieldSet>
            )
          })}
        </FieldGroup>
      </FieldSet>
      <SingleChoice
        control={control}
        name="infoSecChoice"
        label="Information security"
        description="Provide one: a report, a policy and audit plan, or an explanation."
        options={INFOSEC_CHOICES}
        error={errors.infoSecChoice}
      />
      {watch("infoSecChoice") === "neither" ? (
        <AreaField
          label="Why it does not apply"
          name="infoSecExplanation"
          register={register}
          error={errors.infoSecExplanation}
        />
      ) : (
        <FileField
          field="infoSec"
          files={files.infoSec ?? []}
          onChange={(next) => setFiles("infoSec", next)}
          error={errors["file.infoSec"]}
        />
      )}
      <FileField
        field="insurance"
        files={files.insurance ?? []}
        onChange={(next) => setFiles("insurance", next)}
        error={errors["file.insurance"]}
      />
      <AreaField
        label="If the certificate is not ready"
        name="insuranceNote"
        register={register}
        error={errors.insuranceNote}
        description="Tell us the status. It must be current on your go-live date."
      />
    </div>
  )
}

export function ProtectionStep({ form, errors, files, setFiles }: StepProps) {
  const { register, watch, setValue } = form
  const fees = watch("fees")
  return (
    <div className="flex flex-col gap-8">
      <FieldGroup>
        <AreaField label="How users raise a complaint" name="complaintsHow" register={register} error={errors.complaintsHow} description="Usually how they start a support request." />
        <FileField field="complaintsPolicy" files={files.complaintsPolicy ?? []} onChange={(next) => setFiles("complaintsPolicy", next)} error={errors["file.complaintsPolicy"]} />
        <Field orientation="horizontal" data-invalid={errors.trackerReady ? true : undefined}>
          <Checkbox
            id="tracker-ready"
            checked={watch("trackerReady")}
            aria-invalid={errors.trackerReady ? true : undefined}
            onCheckedChange={(state) => setValue("trackerReady", state === true, { shouldDirty: true })}
          />
          <FieldLabel htmlFor="tracker-ready">A monthly complaints tracker is set up</FieldLabel>
        </Field>
        <FieldError>{errors.trackerReady}</FieldError>
        <FileField field="complaintsTracker" files={files.complaintsTracker ?? []} onChange={(next) => setFiles("complaintsTracker", next)} error={errors["file.complaintsTracker"]} />
        <AreaField label="How users start a dispute" name="disputesHow" register={register} error={errors.disputesHow} description="For billing errors and unauthorised use." />
      </FieldGroup>
      <FieldSet>
        <FieldLegend>What your users read</FieldLegend>
        <FieldDescription>Reviewed by Apocor before launch.</FieldDescription>
        <FieldGroup>
          {(["terms", "feeScheduleDoc", "privacy", "marketing"] as const).map((field) => (
            <FileField key={field} field={field} files={files[field] ?? []} onChange={(next) => setFiles(field, next)} error={errors[`file.${field}`]} />
          ))}
        </FieldGroup>
      </FieldSet>
      <FieldSet>
        <FieldLegend>Fees you plan to charge users</FieldLegend>
        <FieldDescription>Write none where you will not charge.</FieldDescription>
        <FieldGroup>
          {fees.map((fee, index) => (
            <Field key={fee.id} data-invalid={errors[`fees.${index}.amount`] ? true : undefined}>
              <FieldLabel htmlFor={`fee-${fee.id}`}>{fee.label}</FieldLabel>
              <Input
                id={`fee-${fee.id}`}
                className="h-11"
                placeholder="Amount, or none"
                aria-invalid={errors[`fees.${index}.amount`] ? true : undefined}
                {...register(`fees.${index}.amount`)}
              />
              <Input className="h-11" placeholder="Notes" aria-label={`${fee.label} notes`} {...register(`fees.${index}.notes`)} />
              <FieldError>{errors[`fees.${index}.amount`]}</FieldError>
            </Field>
          ))}
        </FieldGroup>
      </FieldSet>
    </div>
  )
}

export function DeclarationStep({ form, errors }: StepProps) {
  const { register, watch, setValue } = form
  return (
    <FieldGroup>
      <FieldDescription>
        I confirm the information and documents provided are accurate and complete to the best of my knowledge.
      </FieldDescription>
      <TextField label="Name" name="declarationName" register={register} error={errors.declarationName} />
      <TextField label="Title" name="declarationTitle" register={register} error={errors.declarationTitle} />
      <TextField label="Company" name="declarationCompany" register={register} error={errors.declarationCompany} />
      <TextField label="Date" name="declarationDate" type="date" register={register} error={errors.declarationDate} />
      <SignaturePad
        value={watch("declarationSignature")}
        onChange={(next) => setValue("declarationSignature", next, { shouldDirty: true })}
        error={errors.declarationSignature}
      />
      <Field orientation="horizontal" data-invalid={errors.declarationConfirmed ? true : undefined}>
        <Checkbox
          id="declaration-confirmed"
          checked={watch("declarationConfirmed")}
          aria-invalid={errors.declarationConfirmed ? true : undefined}
          onCheckedChange={(state) => setValue("declarationConfirmed", state === true, { shouldDirty: true })}
        />
        <FieldLabel htmlFor="declaration-confirmed">I confirm this pack is accurate</FieldLabel>
      </Field>
      <FieldError>{errors.declarationConfirmed}</FieldError>
    </FieldGroup>
  )
}
