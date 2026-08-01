"use client"

import { Field, FieldError, FieldLabel } from "@workspace/shadcn/ui/field"
import { InputGroup, InputGroupAddon, InputGroupInput } from "@workspace/shadcn/ui/input-group"
import { TextInitial } from "lucide-react"

export interface InputTextProps {
  name: string
  label?: string
  value: string
  onChange: (value: string) => void
  error?: string
  placeholder?: string
  required?: boolean
  disabled?: boolean
}

export function InputText({
  name,
  label,
  value,
  onChange,
  error,
  placeholder,
  required,
  disabled,
}: InputTextProps) {
  return (
    <Field data-invalid={!!error}>
      {label && <FieldLabel htmlFor={name}>{label}</FieldLabel>}
      <InputGroup>
        <InputGroupAddon>
          <TextInitial className="text-muted-foreground" />
        </InputGroupAddon>
        <InputGroupInput
          id={name}
          name={name}
          placeholder={placeholder ?? "Enter text"}
          type="text"
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
