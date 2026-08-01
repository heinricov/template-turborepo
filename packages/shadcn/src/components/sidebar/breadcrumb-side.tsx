import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@workspace/shadcn/ui/breadcrumb"

export type BreadcrumbItemType = {
  label: string
  href?: string
}

export function BreadcrumbSide({
  items = [],
}: {
  items?: BreadcrumbItemType[]
}) {
  if (items.length === 0) return null

  return (
    <Breadcrumb>
      <BreadcrumbList>
        {items.map((item, index) => {
          const isLast = index === items.length - 1

          return (
            <BreadcrumbItem key={`${item.label}-${index}`}>
              {isLast ? (
                <BreadcrumbPage className="font-semibold">{item.label}</BreadcrumbPage>
              ) : item.href ? (
                <BreadcrumbLink href={item.href}>{item.label}</BreadcrumbLink>
              ) : (
                <span className="text-muted-foreground">{item.label}</span>
              )}
              {!isLast && <BreadcrumbSeparator />}
            </BreadcrumbItem>
          )
        })}
      </BreadcrumbList>
    </Breadcrumb>
  )
}
