import { Sparkles, ChevronRight, Star } from "lucide-react"
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@workspace/shadcn/ui/avatar"
import { Button } from "@workspace/shadcn/ui/button"

const avatars = [
  { src: "https://cdn.simpleicons.org/turborepo", name: "Turborepo", initials: "TB" },
  { src: "https://cdn.simpleicons.org/nestjs", name: "NestJS", initials: "NJ" },
  { src: "https://cdn.simpleicons.org/nextdotjs", name: "Next.js", initials: "NS" },
  { src: "https://cdn.simpleicons.org/prisma", name: "Prisma", initials: "PR" },
  { src: "https://cdn.simpleicons.org/sqlite", name: "SQLite", initials: "SQ" },
]

export default function HeroSection() {
  return (
    <section className="flex w-full items-center justify-center bg-background px-6 py-24 text-foreground">
      <div className="mx-auto flex max-w-2xl flex-col items-center text-center">
        <a
          href="#"
          className="group inline-flex items-center gap-2 border border-border bg-muted/40 py-1 pr-2 pl-2.5 text-xs font-medium text-foreground transition-colors hover:bg-muted"
        >
          <Sparkles className="size-3.5 text-foreground" aria-hidden="true" />
          <span>Introducing real-time collaboration</span>
          <ChevronRight
            className="size-3.5 transition-transform group-hover:translate-x-0.5"
            aria-hidden="true"
          />
        </a>

        <h1 className="mt-6 text-4xl font-bold tracking-tight text-balance sm:text-5xl">
          Ship your product faster than ever
        </h1>
        <p className="mt-5 max-w-xl text-base text-pretty text-muted-foreground">
          The all-in-one platform that helps teams design, build, and launch
          without the busywork. Free to start, no credit card required.
        </p>

        <div className="mt-8 flex flex-col items-center gap-3 sm:flex-row">
          <Button
            render={<a href="#" />}
            nativeButton={false}
            variant="outline"
            size="lg"
          >
            Book a demo
          </Button>
          <Button render={<a href="#" />} nativeButton={false} size="lg">
            Get started free
            <ChevronRight data-icon="inline-end" aria-hidden="true" />
          </Button>
        </div>

        <div className="mt-10 flex flex-col items-center gap-3 sm:flex-row sm:gap-4">
          <div className="flex -space-x-2">
            {avatars.map((avatar) => (
              <Avatar
                key={avatar.name}
                className="size-8 border-2 border-background bg-white dark:bg-white"
              >
                <AvatarImage
                  src={avatar.src}
                  alt={avatar.name}
                />
                <AvatarFallback className="text-[10px]">
                  {avatar.initials}
                </AvatarFallback>
              </Avatar>
            ))}
          </div>
          <div className="flex flex-col items-center gap-0.5 sm:items-start">
            <div className="flex items-center gap-0.5" aria-label="5 out of 5">
              {Array.from({ length: 5 }).map((_, index) => (
                <Star
                  key={index}
                  className="size-4 text-foreground"
                  aria-hidden="true"
                />
              ))}
            </div>
            <span className="text-xs text-muted-foreground">
              Trusted by 2,000+ teams worldwide
            </span>
          </div>
        </div>
      </div>
    </section>
  )
}
