"use client"

import { Field, FieldError, FieldLabel } from "@workspace/shadcn/ui/field"
import { InputGroup, InputGroupAddon, InputGroupInput } from "@workspace/shadcn/ui/input-group"
import { HashIcon } from "lucide-react"

export interface InputNumberProps {
  name: string
  label?: string
  value: number | string
  onChange: (value: number) => void
  error?: string
  placeholder?: string
  required?: boolean
  disabled?: boolean
}

export function InputNumber({
  name,
  label,
  value,
  onChange,
  error,
  placeholder,
  required,
  disabled,
}: InputNumberProps) {
  return (
    <Field data-invalid={!!error}>
      {label && <FieldLabel htmlFor={name}>{label}</FieldLabel>}
      <InputGroup>
        <InputGroupAddon>
          <HashIcon className="text-muted-foreground" />
        </InputGroupAddon>
        <InputGroupInput
          id={name}
          name={name}
          placeholder={placeholder ?? "Enter number"}
          type="number"
          value={value}
          onChange={(e) => onChange(e.target.valueAsNumber)}
          required={required}
          disabled={disabled}
          aria-invalid={!!error}
        />
      </InputGroup>
      <FieldError errors={error ? [{ message: error }] : []} />
    </Field>
  )
}
