"use client"

import { Checkbox } from "@/components/ui/checkbox"
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Field, FieldDescription, FieldError, FieldGroup, FieldLabel, FieldLegend, FieldSet } from "@/components/ui/field"
import { Separator } from "@/components/ui/separator"
import { AreaField, MultiChoice, SingleChoice, TextField } from "@/components/wizard/controls"
import type { StepProps } from "@/components/wizard/types"
import {
  CARD_FORMATS,
  CHAINS,
  COMPANY_TYPES,
  PAY_METHODS,
  PRODUCTS,
  REFERRAL_SOURCES,
  REGIONS,
  STABLECOINS,
  PARTNER_PRIORITIES,
  SUCCESS_OUTCOMES,
  USER_TYPES,
  WALLET_BUILDS,
  WALLET_STRUCTURES,
  YEARS,
} from "@/lib/onboarding/options"

export function AboutStep({ form, errors }: StepProps) {
  const { register, control } = form
  const heard = form.watch("heardAbout")
  return (
    <FieldGroup>
      <TextField label="Company legal name" name="legalName" register={register} error={errors.legalName} />
      <TextField label="Brand or app name" name="brandName" register={register} error={errors.brandName} />
      <TextField label="Country of incorporation" name="country" register={register} error={errors.country} />
      <TextField label="Website" name="website" register={register} error={errors.website} placeholder="https://" />
      <TextField label="Your name" name="contactName" register={register} error={errors.contactName} />
      <TextField label="Title" name="contactTitle" register={register} error={errors.contactTitle} />
      <TextField label="Email" name="email" register={register} error={errors.email} type="email" />
      <TextField label="Phone" name="phone" register={register} error={errors.phone} type="tel" />
      <SingleChoice control={control} name="companyType" label="What best describes you?" options={COMPANY_TYPES} error={errors.companyType} />
      {form.watch("companyType") === "other" ? (
        <TextField label="Describe your company" name="companyTypeOther" register={register} error={errors.companyTypeOther} />
      ) : null}
      <SingleChoice control={control} name="walletBuild" label="How is your wallet built?" options={WALLET_BUILDS} error={errors.walletBuild} />
      <TextField label="Monthly active users today" name="monthlyActiveUsers" register={register} error={errors.monthlyActiveUsers} description="An estimate is fine." />
      <TextField label="Licences or registrations held" name="licences" register={register} error={errors.licences} description="For example MSB, EMI, or VASP. Write none if you have no licence yet." />
      <SingleChoice control={control} name="heardAbout" label="How did you hear about Apocor?" options={REFERRAL_SOURCES} error={errors.heardAbout} />
      {heard === "referral" || heard === "other" ? (
        <TextField
          label={heard === "referral" ? "Who referred you?" : "Where did you hear about us?"}
          name="heardAboutDetail"
          register={register}
          error={errors.heardAboutDetail}
        />
      ) : null}
    </FieldGroup>
  )
}

export function LaunchStep({ form, errors }: StepProps) {
  const { register, control, setValue, watch } = form
  const chains = watch("chains")
  const ranks = watch("regionRanks")
  return (
    <div className="flex flex-col gap-8">
      <FieldGroup>
        <MultiChoice control={control} name="products" label="Products" description="Choose all that interest you." options={PRODUCTS} error={errors.products} />
        <MultiChoice control={control} name="payMethods" label="How will your users pay?" options={PAY_METHODS} error={errors.payMethods} />
        <SingleChoice control={control} name="userType" label="Who are your users?" options={USER_TYPES} error={errors.userType} />
        <SingleChoice control={control} name="cardFormat" label="Cards, if you want them" options={CARD_FORMATS} error={errors.cardFormat} />
        <MultiChoice control={control} name="stablecoins" label="Funding stablecoins" options={STABLECOINS} error={errors.stablecoins} />
        {watch("stablecoins").includes("other") ? (
          <TextField label="Other stablecoin" name="stablecoinOther" register={register} error={errors.stablecoinOther} />
        ) : null}
        <SingleChoice
          control={control}
          name="walletStructure"
          label="Wallet structure"
          description="Non-custodial funds flows are reviewed and approved by Apocor."
          options={WALLET_STRUCTURES}
          error={errors.walletStructure}
        />
      </FieldGroup>
      <Separator />
      <FieldSet>
        <FieldLegend>Chains your wallets and funds sit on</FieldLegend>
        <FieldDescription>We will agree one primary chain for launch.</FieldDescription>
        <FieldGroup>
          <CheckChains form={form} error={errors.chains} />
          {chains.includes("other") ? (
            <TextField label="Other chain" name="chainOther" register={register} error={errors.chainOther} />
          ) : null}
          <Field data-invalid={errors.primaryChain ? true : undefined}>
            <FieldLabel>Primary chain for launch</FieldLabel>
            <Select
              value={watch("primaryChain") || undefined}
              onValueChange={(value) => setValue("primaryChain", value, { shouldDirty: true })}
            >
              <SelectTrigger className="w-full data-[size=default]:h-11" aria-invalid={errors.primaryChain ? true : undefined}>
                <SelectValue placeholder="Choose the launch chain" />
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  {CHAINS.filter((chain) => chains.includes(chain.value)).map((chain) => (
                    <SelectItem key={chain.value} value={chain.value}>
                      {chain.label}
                    </SelectItem>
                  ))}
                </SelectGroup>
              </SelectContent>
            </Select>
            <FieldError>{errors.primaryChain}</FieldError>
          </Field>
        </FieldGroup>
      </FieldSet>
      <Separator />
      <FieldSet>
        <FieldLegend>Where will you launch?</FieldLegend>
        <FieldDescription>Rank your regions. 1 means first. Leave the rest blank.</FieldDescription>
        <FieldError>{errors.regionRanks}</FieldError>
        <FieldGroup>
          {REGIONS.map((region) => (
            <Field key={region.id} orientation="horizontal" data-invalid={errors[`regionRanks.${region.id}`] ? true : undefined}>
              <FieldLabel htmlFor={`rank-${region.id}`}>{region.label}</FieldLabel>
              <Select
                value={ranks[region.id] || "blank"}
                onValueChange={(value) =>
                  setValue(`regionRanks.${region.id}`, value === "blank" ? "" : value, { shouldDirty: true })
                }
              >
                <SelectTrigger id={`rank-${region.id}`} className="w-28 data-[size=default]:h-11" aria-invalid={errors[`regionRanks.${region.id}`] ? true : undefined}>
                  <SelectValue placeholder="Rank" />
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    <SelectItem value="blank">Blank</SelectItem>
                    {Array.from({ length: 9 }, (_, index) => String(index + 1)).map((rank) => (
                      <SelectItem key={rank} value={rank}>
                        {rank}
                      </SelectItem>
                    ))}
                  </SelectGroup>
                </SelectContent>
              </Select>
              <FieldError>{errors[`regionRanks.${region.id}`]}</FieldError>
            </Field>
          ))}
          {ranks.other ? (
            <TextField label="Other region" name="regionOther" register={register} error={errors.regionOther} />
          ) : null}
        </FieldGroup>
      </FieldSet>
    </div>
  )
}

function CheckChains({ form, error }: Pick<StepProps, "form"> & { error?: string }) {
  const selected = form.watch("chains")
  return (
    <FieldSet>
      <FieldLegend variant="label">Chains</FieldLegend>
      <FieldGroup>
        {CHAINS.map((chain) => {
          const id = `chain-${chain.value}`
          const checked = selected.includes(chain.value)
          return (
            <Field key={chain.value} orientation="horizontal" data-invalid={error ? true : undefined}>
              <Checkbox
                id={id}
                checked={checked}
                aria-invalid={error ? true : undefined}
                onCheckedChange={(state) => {
                  const next =
                    state === true
                      ? [...selected, chain.value]
                      : selected.filter((item) => item !== chain.value)
                  form.setValue("chains", next, { shouldDirty: true })
                  if (!next.includes(form.getValues("primaryChain"))) {
                    form.setValue("primaryChain", "")
                  }
                }}
              />
              <FieldLabel htmlFor={id}>{chain.label}</FieldLabel>
            </Field>
          )
        })}
      </FieldGroup>
      <FieldError>{error}</FieldError>
    </FieldSet>
  )
}

export function ScaleStep({ form, errors }: StepProps) {
  const { register, control } = form
  return (
    <div className="flex flex-col gap-8">
      {YEARS.map((year) => (
        <FieldSet key={year.id}>
          <FieldLegend>{year.label}</FieldLegend>
          {year.id === "year1" ? (
            <FieldDescription>Required. Later years can wait if you are still sizing them.</FieldDescription>
          ) : null}
          <FieldGroup>
            <TextField label="Active users paying with Apocor" name={`metrics.${year.id}.activeUsers`} register={register} error={errors[`metrics.${year.id}.activeUsers`]} />
            <TextField label="Monthly payment volume (USD)" name={`metrics.${year.id}.monthlyVolume`} register={register} error={errors[`metrics.${year.id}.monthlyVolume`]} />
            <TextField label="Payments per user per month" name={`metrics.${year.id}.paymentsPerUser`} register={register} error={errors[`metrics.${year.id}.paymentsPerUser`]} />
            <TextField label="Average monthly spend per user (USD)" name={`metrics.${year.id}.avgSpend`} register={register} error={errors[`metrics.${year.id}.avgSpend`]} />
          </FieldGroup>
        </FieldSet>
      ))}
      <Separator />
      <FieldGroup>
        <TextField label="Approved budget (USD)" name="budget" register={register} error={errors.budget} />
        <TextField label="Kickoff" name="kickoff" type="date" register={register} error={errors.kickoff} />
        <TextField label="Integration and testing" name="integration" type="date" register={register} error={errors.integration} />
        <TextField label="Pilot" name="pilot" type="date" register={register} error={errors.pilot} />
        <TextField label="Go-live" name="goLive" type="date" register={register} error={errors.goLive} />
        <TextField label="Key dependency, if any" name="dependency" register={register} error={errors.dependency} />
        <MultiChoice control={control} name="success" label="What does success look like?" options={SUCCESS_OUTCOMES} error={errors.success} />
        <MultiChoice control={control} name="partnerPriorities" label="What matters most in a partner?" options={PARTNER_PRIORITIES} error={errors.partnerPriorities} />
        <AreaField label="Anything else we should know?" name="notes" register={register} error={errors.notes} />
      </FieldGroup>
    </div>
  )
}
