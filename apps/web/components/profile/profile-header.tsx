import { Avatar, AvatarFallback, AvatarImage } from '@workspace/shadcn/ui/avatar'
import React from 'react'

export default function ProfileHeader() {
  return (
    <div className="relative mx-auto flex w-full max-w-3xl flex-col p-6 py-10">
        <div className="mb-4 flex items-center gap-8 max-[24rem]:gap-4">
          <div className="flex items-center gap-4">
            <Avatar className="size-28 border max-[24rem]:size-20 sm:size-40">
              <AvatarImage
                alt="User avatar"
                src="https://github.com/shadcn.png"
              />
              <AvatarFallback className="text-2xl font-medium">
                CN
              </AvatarFallback>
            </Avatar>
          </div>
          <div className="flex flex-col gap-0.5 sm:gap-1">
            <span className="text-lg font-medium tracking-tight sm:text-2xl">
              John Doe
            </span>
            <span className="text-muted-foreground sm:text-lg">
              john.doe@example.com
            </span>
          </div>
        </div>

        <p className="mt-0.5 line-clamp-4 text-muted-foreground">
          I&apos;m a passionate software developer with over 5 years of
          experience building web applications. I love working with modern
          technologies and creating user-friendly interfaces that solve
          real-world problems.
        </p>
      </div>
  )
}
