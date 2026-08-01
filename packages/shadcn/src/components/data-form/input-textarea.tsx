"use client"

import { Field, FieldError, FieldLabel } from "@workspace/shadcn/ui/field"
import { Textarea } from "@workspace/shadcn/ui/textarea"

export interface InputTextareaProps {
  name: string
  label?: string
  value: string
  onChange: (value: string) => void
  error?: string
  placeholder?: string
  required?: boolean
  disabled?: boolean
}

export function InputTextarea({
  name,
  label,
  value,
  onChange,
  error,
  placeholder,
  required,
  disabled,
}: InputTextareaProps) {
  return (
    <Field data-invalid={!!error}>
      {label && <FieldLabel htmlFor={name}>{label}</FieldLabel>}
      <Textarea
        id={name}
        name={name}
        placeholder={placeholder ?? "Enter text"}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        required={required}
        disabled={disabled}
        aria-invalid={!!error}
      />
      <FieldError errors={error ? [{ message: error }] : []} />
    </Field>
  )
}
