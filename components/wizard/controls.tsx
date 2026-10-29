"use client"

import { useEffect, useRef } from "react"
import type { Control, FieldPath, FieldPathByValue, UseFormRegister } from "react-hook-form"
import { Controller } from "react-hook-form"

import { Checkbox } from "@/components/ui/checkbox"
import {
  Field,
  FieldContent,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
  FieldLegend,
  FieldSet,
} from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group"
import { FILE_SPECS, type FileField } from "@/lib/onboarding/files"
import type { Option } from "@/lib/onboarding/options"
import type { OnboardingValues } from "@/lib/onboarding/schema"

export function fieldDomId(name: string) {
  return name.replaceAll(".", "-")
}

type TextProps = {
  label: string
  name: FieldPath<OnboardingValues>
  register: UseFormRegister<OnboardingValues>
  error?: string
  description?: string
  type?: string
  placeholder?: string
  maxLength?: number
  inputMode?: React.HTMLAttributes<HTMLInputElement>["inputMode"]
  onClear?: (name: string) => void
}

export function TextField({
  label,
  name,
  register,
  error,
  description,
  type = "text",
  placeholder,
  maxLength,
  inputMode,
  onClear,
}: TextProps) {
  const id = fieldDomId(name)
  const registered = register(name)
  return (
    <Field data-invalid={error ? true : undefined}>
      <FieldLabel htmlFor={id}>{label}</FieldLabel>
      {description ? <FieldDescription>{description}</FieldDescription> : null}
      <Input
        id={id}
        type={type}
        placeholder={placeholder}
        maxLength={maxLength}
        inputMode={inputMode}
        className="h-11"
        aria-invalid={error ? true : undefined}
        {...registered}
        onChange={(event) => {
          registered.onChange(event)
          onClear?.(name)
        }}
      />
      <FieldError>{error}</FieldError>
    </Field>
  )
}

export function AreaField({
  label,
  name,
  register,
  error,
  description,
  placeholder,
  onClear,
}: Omit<TextProps, "type" | "maxLength" | "inputMode">) {
  const id = fieldDomId(name)
  const registered = register(name)
  return (
    <Field data-invalid={error ? true : undefined}>
      <FieldLabel htmlFor={id}>{label}</FieldLabel>
      {description ? <FieldDescription>{description}</FieldDescription> : null}
      <Textarea
        id={id}
        placeholder={placeholder}
        className="min-h-28"
        aria-invalid={error ? true : undefined}
        {...registered}
        onChange={(event) => {
          registered.onChange(event)
          onClear?.(name)
        }}
      />
      <FieldError>{error}</FieldError>
    </Field>
  )
}

export function SingleChoice({
  control,
  name,
  label,
  options,
  error,
  description,
}: {
  control: Control<OnboardingValues>
  name: FieldPathByValue<OnboardingValues, string>
  label: string
  options: readonly Option[]
  error?: string
  description?: string
}) {
  return (
    <Controller
      control={control}
      name={name}
      render={({ field }) => (
        <FieldSet>
          <FieldLegend variant="label">{label}</FieldLegend>
          {description ? <FieldDescription>{description}</FieldDescription> : null}
          <Field data-invalid={error ? true : undefined}>
            <ToggleGroup
              type="single"
              value={typeof field.value === "string" ? field.value : ""}
              onValueChange={field.onChange}
              variant="outline"
              spacing={2}
              className="flex w-full flex-wrap"
              aria-invalid={error ? true : undefined}
            >
              {options.map((option) => (
                <ToggleGroupItem
                  key={option.value}
                  value={option.value}
                  className="h-auto px-3 py-2 whitespace-normal"
                >
                  {option.label}
                </ToggleGroupItem>
              ))}
            </ToggleGroup>
            <FieldError>{error}</FieldError>
          </Field>
        </FieldSet>
      )}
    />
  )
}

export function MultiChoice({
  control,
  name,
  label,
  options,
  error,
  description,
  exclusive,
}: {
  control: Control<OnboardingValues>
  name: FieldPathByValue<OnboardingValues, string[]>
  label: string
  options: readonly Option[]
  error?: string
  description?: string
  exclusive?: string
}) {
  return (
    <Controller
      control={control}
      name={name}
      render={({ field }) => {
        const current = Array.isArray(field.value) ? field.value : []
        return (
          <FieldSet>
            <FieldLegend variant="label">{label}</FieldLegend>
            {description ? <FieldDescription>{description}</FieldDescription> : null}
            <Field data-invalid={error ? true : undefined}>
              <ToggleGroup
                type="multiple"
                value={current}
                onValueChange={(next) => {
                  if (!exclusive) {
                    field.onChange(next)
                    return
                  }
                  const turnedOn = next.find((item) => !current.includes(item))
                  field.onChange(
                    turnedOn === exclusive ? [exclusive] : next.filter((item) => item !== exclusive)
                  )
                }}
                variant="outline"
                spacing={2}
                className="flex w-full flex-wrap"
                aria-invalid={error ? true : undefined}
              >
                {options.map((option) => (
                  <ToggleGroupItem
                    key={option.value}
                    value={option.value}
                    className="h-auto px-3 py-2 whitespace-normal"
                  >
                    {option.label}
                  </ToggleGroupItem>
                ))}
              </ToggleGroup>
              <FieldError>{error}</FieldError>
            </Field>
          </FieldSet>
        )
      }}
    />
  )
}

export function CheckList({
  label,
  description,
  options,
  value,
  onChange,
  error,
}: {
  label: string
  description?: string
  options: readonly { value: string; label: string; hint?: string }[]
  value: string[]
  onChange: (next: string[]) => void
  error?: string
}) {
  return (
    <FieldSet>
      <FieldLegend>{label}</FieldLegend>
      {description ? <FieldDescription>{description}</FieldDescription> : null}
      <FieldGroup>
        {options.map((option) => {
          const id = fieldDomId(`${label}-${option.value}`)
          const checked = value.includes(option.value)
          return (
            <Field key={option.value} orientation="horizontal" data-invalid={error ? true : undefined}>
              <Checkbox
                id={id}
                checked={checked}
                aria-invalid={error ? true : undefined}
                onCheckedChange={(state) => {
                  onChange(
                    state === true
                      ? [...value, option.value]
                      : value.filter((item) => item !== option.value)
                  )
                }}
              />
              <FieldContent>
                <FieldLabel htmlFor={id}>{option.label}</FieldLabel>
                {option.hint ? <FieldDescription>{option.hint}</FieldDescription> : null}
              </FieldContent>
            </Field>
          )
        })}
      </FieldGroup>
      <FieldError>{error}</FieldError>
    </FieldSet>
  )
}

export function FileField({
  field,
  files,
  onChange,
  error,
}: {
  field: FileField
  files: File[]
  onChange: (next: File[]) => void
  error?: string
}) {
  const spec = FILE_SPECS[field]
  const id = `file-${field}`
  return (
    <Field data-invalid={error ? true : undefined}>
      <FieldLabel htmlFor={id}>{spec.label}</FieldLabel>
      <FieldDescription>
        {spec.hint} 8 MB maximum.
      </FieldDescription>
      <Input
        id={id}
        type="file"
        accept={spec.accept}
        multiple={spec.multiple}
        className="h-11"
        aria-invalid={error ? true : undefined}
        onChange={(event) => onChange(Array.from(event.target.files ?? []))}
      />
      {files.length ? (
        <ul className="flex flex-col gap-1 text-sm text-muted-foreground">
          {files.map((file) => (
            <li key={`${file.name}-${file.size}`}>{file.name}</li>
          ))}
        </ul>
      ) : null}
      <FieldError>{error}</FieldError>
    </Field>
  )
}

export function SignaturePad({
  value,
  onChange,
  error,
}: {
  value: string
  onChange: (next: string) => void
  error?: string
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  function prepare() {
    const canvas = canvasRef.current
    if (!canvas) return null
    const rect = canvas.getBoundingClientRect()
    const ratio = window.devicePixelRatio || 1
    canvas.width = Math.max(1, Math.floor(rect.width * ratio))
    canvas.height = Math.max(1, Math.floor(rect.height * ratio))
    const context = canvas.getContext("2d")
    if (!context) return null
    context.scale(ratio, ratio)
    context.lineWidth = 1.8
    context.lineCap = "round"
    context.lineJoin = "round"
    context.strokeStyle = "#1c1915"
    return { canvas, context, width: rect.width, height: rect.height }
  }

  useEffect(() => {
    const prepared = prepare()
    if (!prepared || !value) return
    const image = new Image()
    image.onload = () => {
      prepared.context.drawImage(image, 0, 0, prepared.width, prepared.height)
    }
    image.src = value
    // Restore a saved signature once. Later strokes stay on the canvas.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  function point(event: React.PointerEvent<HTMLCanvasElement>) {
    const rect = event.currentTarget.getBoundingClientRect()
    return { x: event.clientX - rect.left, y: event.clientY - rect.top }
  }

  return (
    <Field data-invalid={error ? true : undefined}>
      <FieldLabel>Signature</FieldLabel>
      <FieldDescription>Sign with a finger, stylus, or mouse.</FieldDescription>
      <canvas
        ref={canvasRef}
        className="h-36 w-full touch-none rounded-lg border bg-white"
        aria-invalid={error ? true : undefined}
        onPointerDown={(event) => {
          const context = canvasRef.current?.getContext("2d")
          if (!context) return
          context.strokeStyle = "#1c1915"
          context.lineWidth = 1.8
          context.lineCap = "round"
          event.currentTarget.setPointerCapture(event.pointerId)
          const next = point(event)
          context.beginPath()
          context.moveTo(next.x, next.y)
        }}
        onPointerMove={(event) => {
          if (!event.currentTarget.hasPointerCapture(event.pointerId)) return
          const context = canvasRef.current?.getContext("2d")
          if (!context) return
          const next = point(event)
          context.lineTo(next.x, next.y)
          context.stroke()
        }}
        onPointerUp={(event) => {
          if (event.currentTarget.hasPointerCapture(event.pointerId)) {
            event.currentTarget.releasePointerCapture(event.pointerId)
          }
          onChange(canvasRef.current?.toDataURL("image/png") ?? "")
        }}
      />
      <button
        type="button"
        className="w-fit text-sm text-muted-foreground underline-offset-4 hover:underline"
        onClick={() => {
          prepare()
          onChange("")
        }}
      >
        Clear signature
      </button>
      <FieldError>{error}</FieldError>
    </Field>
  )
}
