"use client"

import { useState, useMemo, type FormEvent } from "react"
import { z } from "zod"

import { Button } from "@workspace/shadcn/ui/button"

import { InputText } from "./input-text"
import { InputEmail } from "./input-email"
import { InputPassword } from "./input-password"
import { InputNumber } from "./input-number"
import { InputTextarea } from "./input-textarea"
import { InputSelect } from "./input-select"
import { InputDate } from "./input-date"

export interface DataFormField {
  name: string
  label: string
  type: "text" | "email" | "password" | "number" | "textarea" | "select" | "date"
  placeholder?: string
  required?: boolean
  options?: { label: string; value: string }[]
  defaultValue?: string | number
}

export interface DataFormProps {
  fields: DataFormField[]
  onSubmit: (data: Record<string, unknown>) => void
  submitLabel?: string
  cancelLabel?: string
  onCancel?: () => void
  layoutCol?: 1 | 2 | 3 | 4
  widthForm?: "sm" | "md" | "lg" | "xl" | "2xl" | "3xl" | "4xl" | "5xl"
  disabled?: boolean
}

type FormErrors = Record<string, string | undefined>

function buildSchema(fields: DataFormField[]) {
  const shape: Record<string, z.ZodTypeAny> = {}
  for (const field of fields) {
    let schema: z.ZodTypeAny

    switch (field.type) {
      case "email":
        schema = field.required
          ? z.string().min(1).email()
          : z.string().email().optional().or(z.literal(""))
        break
      case "number":
        schema = field.required ? z.coerce.number() : z.coerce.number().optional()
        break
      case "select":
        schema = field.required
          ? z.string().min(1, `${field.label} wajib dipilih`)
          : z.string().optional().or(z.literal(""))
        break
      case "date":
        schema = field.required
          ? z.date()
          : z.date().optional()
        break
      default:
        schema = field.required
          ? z.string().min(1)
          : z.string().optional().or(z.literal(""))
        break
    }

    shape[field.name] = schema
  }
  return z.object(shape)
}

function getFormMaxWidth(
  widthForm?: DataFormProps["widthForm"],
  layoutCol = 1
): string {
  switch (widthForm) {
    case "sm":
      return "24rem"
    case "md":
      return "28rem"
    case "lg":
      return "32rem"
    case "xl":
      return "36rem"
    case "2xl":
      return "42rem"
    case "3xl":
      return "48rem"
    case "4xl":
      return "56rem"
    case "5xl":
      return "64rem"
    default:
      return layoutCol > 1 ? "48rem" : "32rem"
  }
}

export default function DataForm({
  fields,
  onSubmit,
  submitLabel = "Submit",
  cancelLabel = "Cancel",
  onCancel,
  layoutCol = 1,
  widthForm,
  disabled = false,
}: DataFormProps) {
  const initialValues = useMemo(() => {
    const init: Record<string, unknown> = {}
    for (const field of fields) {
      if (field.type === "date") {
        init[field.name] = field.defaultValue ? new Date(field.defaultValue as string) : undefined
      } else {
        init[field.name] = field.defaultValue ?? ""
      }
    }
    return init
  }, [fields])

  const [values, setValues] = useState<Record<string, unknown>>(initialValues)
  const [errors, setErrors] = useState<FormErrors>({})

  const setFieldValue = (name: string, value: unknown) => {
    setValues((prev) => ({ ...prev, [name]: value }))
    setErrors((prev) => {
      if (!prev[name]) return prev
      const next = { ...prev }
      delete next[name]
      return next
    })
  }

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault()

    const raw: Record<string, unknown> = { ...values }

    const schema = buildSchema(fields)
    const result = schema.safeParse(raw)

    if (!result.success) {
      const fieldErrors: FormErrors = {}
      for (const issue of result.error.issues) {
        const name = String(issue.path[0] ?? "")
        if (name && !fieldErrors[name]) {
          fieldErrors[name] = issue.message
        }
      }
      setErrors(fieldErrors)
      return
    }

    setErrors({})
    onSubmit(result.data as Record<string, unknown>)
  }

  const handleCancel = () => {
    if (onCancel) {
      onCancel()
      return
    }
    setValues(initialValues)
    setErrors({})
  }

  const formMaxWidth = getFormMaxWidth(widthForm, layoutCol)

  return (
    <form
      onSubmit={handleSubmit}
      className="flex w-full flex-col gap-4 rounded-md border p-4"
      noValidate
      style={{
        maxWidth: formMaxWidth,
        ...(layoutCol > 1
          ? {
              display: "grid",
              gridTemplateColumns: `repeat(${layoutCol}, 1fr)`,
              alignItems: "start",
            }
          : undefined),
      }}
    >
      {fields.map((field) => {
        const value = values[field.name]
        const error = errors[field.name]

        switch (field.type) {
          case "email":
            return (
              <InputEmail
                key={field.name}
                name={field.name}
                label={field.label}
                value={typeof value === "string" ? value : ""}
                onChange={(v) => setFieldValue(field.name, v)}
                error={error}
                placeholder={field.placeholder}
                required={field.required}
                disabled={disabled}
              />
            )
          case "password":
            return (
              <InputPassword
                key={field.name}
                name={field.name}
                label={field.label}
                value={typeof value === "string" ? value : ""}
                onChange={(v) => setFieldValue(field.name, v)}
                error={error}
                placeholder={field.placeholder}
                required={field.required}
                disabled={disabled}
              />
            )
          case "number":
            return (
              <InputNumber
                key={field.name}
                name={field.name}
                label={field.label}
                value={typeof value === "number" ? value : ""}
                onChange={(v) => setFieldValue(field.name, v)}
                error={error}
                placeholder={field.placeholder}
                required={field.required}
                disabled={disabled}
              />
            )
          case "textarea":
            return (
              <InputTextarea
                key={field.name}
                name={field.name}
                label={field.label}
                value={typeof value === "string" ? value : ""}
                onChange={(v) => setFieldValue(field.name, v)}
                error={error}
                placeholder={field.placeholder}
                required={field.required}
                disabled={disabled}
              />
            )
          case "select":
            return (
              <InputSelect
                key={field.name}
                name={field.name}
                label={field.label}
                value={typeof value === "string" ? value : ""}
                onChange={(v) => setFieldValue(field.name, v)}
                error={error}
                placeholder={field.placeholder}
                required={field.required}
                disabled={disabled}
                options={field.options ?? []}
              />
            )
          case "date":
            return (
              <InputDate
                key={field.name}
                name={field.name}
                label={field.label}
                value={value as Date | undefined}
                onChange={(date) => setFieldValue(field.name, date)}
                error={error}
                placeholder={field.placeholder}
                required={field.required}
                disabled={disabled}
              />
            )
          default:
            return (
              <InputText
                key={field.name}
                name={field.name}
                label={field.label}
                value={typeof value === "string" ? value : ""}
                onChange={(v) => setFieldValue(field.name, v)}
                error={error}
                placeholder={field.placeholder}
                required={field.required}
                disabled={disabled}
              />
            )
        }
      })}

      {!disabled && (
        <div
          className="flex w-full "
          style={layoutCol > 1 ? { gridColumn: `span ${layoutCol}` } : undefined}
        >
          <div className="ml-auto">
            <Button className="mr-2" type="button" variant="outline" onClick={handleCancel}>
            {cancelLabel}
          </Button>
          <Button type="submit">{submitLabel}</Button>
          </div>
        </div>
      )}
    </form>
  )
}
