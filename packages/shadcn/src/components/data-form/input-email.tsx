"use client"

import { Field, FieldError, FieldLabel } from "@workspace/shadcn/ui/field"
import { InputGroup, InputGroupAddon, InputGroupInput } from "@workspace/shadcn/ui/input-group"
import { MailIcon } from "lucide-react"

export interface InputEmailProps {
  name: string
  label?: string
  value: string
  onChange: (value: string) => void
  error?: string
  placeholder?: string
  required?: boolean
  disabled?: boolean
}

export function InputEmail({
  name,
  label,
  value,
  onChange,
  error,
  placeholder,
  required,
  disabled,
}: InputEmailProps) {
  return (
    <Field data-invalid={!!error}>
      {label && <FieldLabel htmlFor={name}>{label}</FieldLabel>}
      <InputGroup>
        <InputGroupAddon>
          <MailIcon className="text-muted-foreground" />
        </InputGroupAddon>
        <InputGroupInput
          id={name}
          name={name}
          placeholder={placeholder ?? "Enter email"}
          type="email"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          required={required}
          disabled={disabled}
          aria-invalid={!!error}
        />
      </InputGroup>
      <FieldError errors={error ? [{ message: error }] : []} />
    </Field>
  )
}
