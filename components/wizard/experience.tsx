"use client"

import { useEffect } from "react"

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
import { Separator } from "@/components/ui/separator"
import {
  FileField,
  MultiChoice,
  SingleChoice,
  TextField,
} from "@/components/wizard/controls"
import type { StepProps } from "@/components/wizard/types"
import {
  CARD_NETWORKS,
  CARD_PRODUCTS,
  CASH_CHOICES,
  DIRECT_DESTINATIONS,
  ENABLE_CHOICES,
  PAY_METHODS,
  PHYSICAL_CARD_FORMATS,
} from "@/lib/onboarding/options"

export function ExperienceStep({ form, errors }: StepProps) {
  const { register, control, watch, setValue, getValues } = form
  const payOnline = watch("payOnline")
  useEffect(() => {
    const values = getValues()
    if (!values.payOnline && values.payMethods.includes("online")) setValue("payOnline", "enable")
    if (!values.accept && values.products.includes("accept")) setValue("accept", "enable")
    if (!values.intelligence && values.products.includes("intelligence")) {
      setValue("intelligence", "enable")
    }
  }, [getValues, setValue])

  useEffect(() => {
    const methods = getValues("payMethods")
    if (payOnline === "enable" && !methods.includes("online")) {
      setValue("payMethods", [...methods, "online"], { shouldDirty: true })
    }
    if (payOnline === "later" && methods.includes("online")) {
      setValue(
        "payMethods",
        methods.filter((method) => method !== "online"),
        { shouldDirty: true }
      )
    }
  }, [payOnline, getValues, setValue])

  function syncMethod(method: string, enabled: boolean) {
    const methods = new Set(getValues("payMethods"))
    if (enabled) methods.add(method)
    else methods.delete(method)
    setValue("payMethods", [...methods], { shouldDirty: true })
  }

  return (
    <div className="flex flex-col gap-8">
      <MultiChoice
        control={control}
        name="payMethods"
        label="Apocor Pay"
        description="Tap at a terminal, through Apple Pay or Google Pay, scan a QR, or pay online."
        options={PAY_METHODS}
        error={errors.payMethods}
      />
      <FieldSet>
        <FieldLegend>Scan to Pay</FieldLegend>
        <FieldDescription>Pay by scanning merchant QR codes, at home and abroad.</FieldDescription>
        <FieldGroup>
          <Field orientation="horizontal" data-invalid={errors.scanVisa ? true : undefined}>
            <Checkbox
              id="scan-visa"
              checked={watch("scanVisa")}
              aria-invalid={errors.scanVisa ? true : undefined}
              onCheckedChange={(state) => {
                const checked = state === true
                setValue("scanVisa", checked, { shouldDirty: true })
                syncMethod("qr", checked || getValues("scanLocal"))
              }}
            />
            <FieldLabel htmlFor="scan-visa">Visa acceptance QR</FieldLabel>
          </Field>
          <Field orientation="horizontal">
            <Checkbox
              id="scan-local"
              checked={watch("scanLocal")}
              onCheckedChange={(state) => {
                const checked = state === true
                setValue("scanLocal", checked, { shouldDirty: true })
                syncMethod("qr", checked || getValues("scanVisa"))
              }}
            />
            <FieldLabel htmlFor="scan-local">Local QR networks</FieldLabel>
          </Field>
          <FieldError>{errors.scanVisa}</FieldError>
          {watch("scanLocal") ? (
            <TextField
              label="Which local networks?"
              name="localQrNetworks"
              register={register}
              error={errors.localQrNetworks}
              description="For example UPI, PIX, or QR Ph."
            />
          ) : null}
        </FieldGroup>
      </FieldSet>
      <SingleChoice control={control} name="payOnline" label="Pay Online" options={ENABLE_CHOICES} error={errors.payOnline} />
      <MultiChoice
        control={control}
        name="directDestinations"
        label="Apocor Direct"
        description="Push funds out to wherever your users need them."
        options={DIRECT_DESTINATIONS}
        error={errors.directDestinations}
        exclusive="later"
      />
      <SingleChoice control={control} name="accept" label="Apocor Accept" options={ENABLE_CHOICES} error={errors.accept} />
      <SingleChoice
        control={control}
        name="intelligence"
        label="Apocor Intelligence Commerce"
        options={ENABLE_CHOICES}
        error={errors.intelligence}
      />
      <Separator />
      <FieldSet>
        <FieldLegend>Default spend controls</FieldLegend>
        <FieldDescription>Leave blank to use Apocor’s defaults.</FieldDescription>
        <FieldGroup>
          <TextField label="Per-payment limit (USD)" name="limitPerPayment" register={register} error={errors.limitPerPayment} />
          <TextField label="Daily limit (USD)" name="limitDaily" register={register} error={errors.limitDaily} />
          <TextField label="Monthly limit (USD)" name="limitMonthly" register={register} error={errors.limitMonthly} />
          <TextField label="Merchant categories to block" name="blockedCategories" register={register} error={errors.blockedCategories} />
          <TextField label="Countries to block" name="blockedCountries" register={register} error={errors.blockedCountries} />
          <SingleChoice
            control={control}
            name="cashWithdrawals"
            label="Cash withdrawals"
            description="Cards only. Leave unselected to decide later."
            options={CASH_CHOICES}
            error={errors.cashWithdrawals}
          />
        </FieldGroup>
      </FieldSet>
    </div>
  )
}

export function BrandStep({ form, errors, files, setFiles }: StepProps) {
  const { register, watch } = form
  const name = watch("shortProgramName")
  return (
    <FieldGroup>
      <TextField
        label="Short program name"
        name="shortProgramName"
        register={register}
        error={errors.shortProgramName}
        maxLength={32}
        description={`Shown in the wallet. ${name.length}/32 characters.`}
      />
      <FileField field="appIcon" files={files.appIcon ?? []} onChange={(next) => setFiles("appIcon", next)} error={errors["file.appIcon"]} />
      <FileField field="logoSvg" files={files.logoSvg ?? []} onChange={(next) => setFiles("logoSvg", next)} error={errors["file.logoSvg"]} />
      <FileField field="logoPngLight" files={files.logoPngLight ?? []} onChange={(next) => setFiles("logoPngLight", next)} error={errors["file.logoPngLight"]} />
      <FileField field="logoPngDark" files={files.logoPngDark ?? []} onChange={(next) => setFiles("logoPngDark", next)} error={errors["file.logoPngDark"]} />
      <FileField field="sourceFiles" files={files.sourceFiles ?? []} onChange={(next) => setFiles("sourceFiles", next)} error={errors["file.sourceFiles"]} />
      <FileField field="brandGuidelines" files={files.brandGuidelines ?? []} onChange={(next) => setFiles("brandGuidelines", next)} error={errors["file.brandGuidelines"]} />
      <TextField label="Background colour" name="colorBackground" register={register} error={errors.colorBackground} placeholder="255, 255, 255" description="RGB fallback behind the wallet credential." />
      <TextField label="Foreground colour" name="colorForeground" register={register} error={errors.colorForeground} placeholder="28, 25, 21" description="Used for the last 4 digits." />
      <TextField label="Label colour" name="colorLabels" register={register} error={errors.colorLabels} placeholder="28, 25, 21" description="Text on the front of the credential." />
    </FieldGroup>
  )
}

export function WalletArtStep({ errors, files, setFiles }: StepProps) {
  return (
    <FieldGroup>
      <FieldDescription>
        Two templates: one blank, with your logo and the network logo, and one with only the last 4 digits. Square corners. Leave out the chip, magstripe, hologram, name, expiry, and shading.
      </FieldDescription>
      <FileField field="walletBlank" files={files.walletBlank ?? []} onChange={(next) => setFiles("walletBlank", next)} error={errors["file.walletBlank"]} />
      <FileField field="walletLast4" files={files.walletLast4 ?? []} onChange={(next) => setFiles("walletLast4", next)} error={errors["file.walletLast4"]} />
    </FieldGroup>
  )
}

export function InAppStep({ form, errors, files, setFiles }: StepProps) {
  const { register } = form
  const details = [
    { id: "number", label: "Number" },
    { id: "name", label: "Name" },
    { id: "expiry", label: "Expiry" },
    { id: "cvv", label: "CVV / CVC" },
  ] as const
  return (
    <div className="flex flex-col gap-8">
      <FieldGroup>
        <FileField field="inAppBlank" files={files.inAppBlank ?? []} onChange={(next) => setFiles("inAppBlank", next)} error={errors["file.inAppBlank"]} />
        <FileField field="inAppPopulated" files={files.inAppPopulated ?? []} onChange={(next) => setFiles("inAppPopulated", next)} error={errors["file.inAppPopulated"]} />
      </FieldGroup>
      <FieldSet>
        <FieldLegend>How the details render</FieldLegend>
        <FieldDescription>
          Details render in capitals, in a single font. Apocor will share the supported font list.
        </FieldDescription>
        <FieldGroup>
          <TextField label="Font" name="credentialFont" register={register} error={errors.credentialFont} />
          <TextField label="Font colour" name="credentialFontColor" register={register} error={errors.credentialFontColor} placeholder="#1A1C16" />
          <TextField label="Font size (px)" name="credentialFontSize" register={register} error={errors.credentialFontSize} inputMode="decimal" />
          <TextField label="Group spacing (px)" name="credentialGroupSpacing" register={register} error={errors.credentialGroupSpacing} inputMode="decimal" />
        </FieldGroup>
      </FieldSet>
      <FieldSet>
        <FieldLegend>Position of each detail</FieldLegend>
        <FieldDescription>X and Y in pixels on the 500 × 315 artwork.</FieldDescription>
        <FieldGroup>
          {details.map((detail) => (
            <FieldSet key={detail.id}>
              <FieldLegend variant="label">{detail.label}</FieldLegend>
              <FieldGroup>
                <TextField label="X" name={`credentialPositions.${detail.id}.x`} register={register} error={errors[`credentialPositions.${detail.id}.x`]} inputMode="decimal" />
                <TextField label="Y" name={`credentialPositions.${detail.id}.y`} register={register} error={errors[`credentialPositions.${detail.id}.y`]} inputMode="decimal" />
              </FieldGroup>
            </FieldSet>
          ))}
        </FieldGroup>
      </FieldSet>
    </div>
  )
}

export function CardsStep({ form, errors }: StepProps) {
  const { register, control, watch } = form
  const formats = watch("cardFormats")
  return (
    <FieldGroup>
      <MultiChoice control={control} name="cardFormats" label="Format" options={PHYSICAL_CARD_FORMATS} error={errors.cardFormats} />
      <SingleChoice control={control} name="cardProduct" label="Product" options={CARD_PRODUCTS} error={errors.cardProduct} />
      <SingleChoice control={control} name="cardNetwork" label="Network" options={CARD_NETWORKS} error={errors.cardNetwork} />
      {formats.includes("plastic") || formats.includes("metal") ? (
        <TextField
          label="Physical card delivery countries"
          name="deliveryCountries"
          register={register}
          error={errors.deliveryCountries}
          description="Opting in to physical cards means we will send the print specification."
        />
      ) : null}
    </FieldGroup>
  )
}
