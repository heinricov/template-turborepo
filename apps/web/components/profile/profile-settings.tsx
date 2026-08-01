import { Button } from '@workspace/shadcn/ui/button';
import { MapPinIcon, PencilIcon, UserIcon } from 'lucide-react';
import React from 'react'

export default function ProfileSettings() {
  return (
    <div className="mx-auto w-full max-w-3xl px-6">
        <div className="space-y-8 py-8">
          <div>
            <div className="-ms-px flex items-center justify-between gap-2.5 border border-b-0 border-dashed bg-muted/50 px-4 py-3">
              <h2 className="flex items-center gap-2.5 text-lg font-medium">
                <UserIcon className="size-5 fill-foreground/8" />
                Personal Information
              </h2>

              <Button className="-me-1 size-8" size="icon" variant="ghost">
                <PencilIcon />
              </Button>
            </div>
            <div className="grid grid-cols-1 *:-ms-px *:-mt-px *:border *:border-dashed *:px-4 *:py-3 md:grid-cols-2">
              <UserInfo label="Full Name" value="Alex Johnson" />
              <UserInfo label="Email" value="alex.johnson@example.com" />
              <UserInfo label="Phone" value="+1 (555) 123-4567" />
              <UserInfo label="Date of Birth" value="March 15, 1992" />
            </div>
          </div>

          <div>
            <div className="-ms-px flex items-center justify-between gap-2.5 border border-b-0 border-dashed bg-muted/50 px-4 py-3">
              <h2 className="flex items-center gap-2.5 text-lg font-medium">
                <MapPinIcon className="size-5 fill-foreground/8" />
                Location
              </h2>

              <Button className="-me-1 size-8" size="icon" variant="ghost">
                <PencilIcon />
              </Button>
            </div>
            <div className="grid grid-cols-1 *:-ms-px *:-mt-px *:border *:border-dashed *:px-4 *:py-3 md:grid-cols-2">
              <UserInfo label="Country" value="United States" />
              <UserInfo label="State/Province" value="California" />
              <UserInfo label="City" value="San Francisco" />
              <UserInfo label="Postal Code" value="94102" />
            </div>
          </div>
        </div>
      </div>
  )
}

function UserInfo({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <h3 className="mb-1 text-sm font-medium text-muted-foreground">
        {label}
      </h3>
      <p className="text-foreground">{value}</p>
    </div>
  )
}
