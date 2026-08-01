"use client"

import { useState } from "react"
import { format } from "date-fns"
import { ChevronDownIcon } from "lucide-react"

import { Button } from "@workspace/shadcn/ui/button"
import { Calendar } from "@workspace/shadcn/ui/calendar"
import { Field, FieldError, FieldLabel } from "@workspace/shadcn/ui/field"
import { Popover, PopoverContent, PopoverTrigger } from "@workspace/shadcn/ui/popover"

export interface InputDateProps {
  name: string
  label?: string
  value: Date | undefined
  onChange: (date: Date | undefined) => void
  error?: string
  placeholder?: string
  required?: boolean
  disabled?: boolean
}

export function InputDate({
  name,
  label,
  value,
  onChange,
  error,
  placeholder,
  disabled,
}: InputDateProps) {
  const [open, setOpen] = useState(false)

  return (
    <Field data-invalid={!!error}>
      {label && <FieldLabel htmlFor={name}>{label}</FieldLabel>}
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger
          render={
            <Button
              id={name}
              variant="outline"
              data-empty={!value}
              className="w-full justify-between text-left font-normal data-[empty=true]:text-muted-foreground"
              disabled={disabled}
            >
              {value ? format(value, "PPP") : <span>{placeholder ?? "Pick a date"}</span>}
              <ChevronDownIcon data-icon="inline-end" />
            </Button>
          }
        />
        <PopoverContent className="w-auto p-0" align="start">
          <Calendar
            mode="single"
            selected={value}
            onSelect={(date) => {
              onChange(date)
              setOpen(false)
            }}
            defaultMonth={value}
          />
        </PopoverContent>
      </Popover>
      <FieldError errors={error ? [{ message: error }] : []} />
    </Field>
  )
}
