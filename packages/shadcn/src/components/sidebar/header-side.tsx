import { Separator } from "@workspace/shadcn/ui/separator"
import { SidebarTrigger } from "@workspace/shadcn/ui/sidebar"

import { BreadcrumbSide, type BreadcrumbItemType } from "./breadcrumb-side"
import { NavUser } from "./nav-user"

export function HeaderSide({
  breadcrumb,
  user,
  onLogout,
}: {
  breadcrumb?: BreadcrumbItemType[]
  user?: {
    name: string
    email: string
    avatar?: string
  } | null
  onLogout?: () => void
}) {
  return (
    <header className="sticky top-0 z-30 flex h-12 py-2 shrink-0 items-center gap-2 border-b bg-background transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-12">
      <div className="flex w-full items-center gap-2 px-4">
        <SidebarTrigger className="-ml-1" size="lg" />
        <Separator
          orientation="vertical"
          className="mr-2 data-[orientation=vertical]:h-12"
        />
        <BreadcrumbSide items={breadcrumb} />
        {user ? (
          <div className="ml-auto">
            <NavUser user={user} onLogout={onLogout} />
          </div>
        ) : null}
      </div>
    </header>
  )
}
