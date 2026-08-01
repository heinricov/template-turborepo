"use client"

import { useState } from "react"
import { EyeIcon, EyeOffIcon, LockIcon } from "lucide-react"

import { Field, FieldError, FieldLabel } from "@workspace/shadcn/ui/field"
import { InputGroup, InputGroupAddon, InputGroupButton, InputGroupInput } from "@workspace/shadcn/ui/input-group"

export interface InputPasswordProps {
  name: string
  label?: string
  value: string
  onChange: (value: string) => void
  error?: string
  placeholder?: string
  required?: boolean
  disabled?: boolean
}

export function InputPassword({
  name,
  label,
  value,
  onChange,
  error,
  placeholder,
  required,
  disabled,
}: InputPasswordProps) {
  const [showPassword, setShowPassword] = useState(false)

  return (
    <Field data-invalid={!!error}>
      {label && <FieldLabel htmlFor={name}>{label}</FieldLabel>}
      <InputGroup>
        <InputGroupAddon>
          <LockIcon className="text-muted-foreground" />
        </InputGroupAddon>
        <InputGroupInput
          id={name}
          name={name}
          placeholder={placeholder ?? "Enter password"}
          type={showPassword ? "text" : "password"}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          required={required}
          disabled={disabled}
          aria-invalid={!!error}
        />
        <InputGroupAddon align="inline-end">
          <InputGroupButton onClick={() => setShowPassword(!showPassword)}>
            {showPassword ? (
              <EyeOffIcon className="size-4 text-muted-foreground" />
            ) : (
              <EyeIcon className="size-4 text-muted-foreground" />
            )}
          </InputGroupButton>
        </InputGroupAddon>
      </InputGroup>
      <FieldError errors={error ? [{ message: error }] : []} />
    </Field>
  )
}
