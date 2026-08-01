"use client"

import { Field, FieldError, FieldLabel } from "@workspace/shadcn/ui/field"
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from "@workspace/shadcn/ui/select"

export interface InputSelectProps {
  name: string
  label?: string
  value: string
  onChange: (value: string) => void
  error?: string
  placeholder?: string
  required?: boolean
  disabled?: boolean
  options: { label: string; value: string }[]
}

export function InputSelect({
  name,
  label,
  value,
  onChange,
  error,
  placeholder,
  required,
  disabled,
  options,
}: InputSelectProps) {
  return (
    <Field data-invalid={!!error}>
      {label && <FieldLabel htmlFor={name}>{label}</FieldLabel>}
      <Select
        name={name}
        value={value || undefined}
        onValueChange={(v) => {
          if (v !== null) onChange(v)
        }}
        required={required}
        disabled={disabled}
        aria-invalid={!!error}
      >
        <SelectTrigger>
          <SelectValue placeholder={placeholder ?? "Select an option"} />
        </SelectTrigger>
        <SelectContent>
          <SelectGroup>
            {options.map((item) => (
              <SelectItem key={item.value} value={item.value}>
                {item.label}
              </SelectItem>
            ))}
          </SelectGroup>
        </SelectContent>
      </Select>
      <FieldError errors={error ? [{ message: error }] : []} />
    </Field>
  )
}
