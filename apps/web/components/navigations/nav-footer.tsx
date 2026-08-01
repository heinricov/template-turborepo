import Link from "next/link"

const links = [
  { label: "Home", href: "#" },
  { label: "Features", href: "#" },
  { label: "Pricing", href: "#" },
  { label: "About", href: "#" },
  { label: "Blog", href: "#" },
  { label: "Contact", href: "#" },
]

export function Footer() {
  return (
    <footer className="@container bg-background py-12">
      <div className="mx-auto max-w-6xl px-6">
        <div className="border-y py-8">
          <div className="flex flex-col gap-6 @xl:flex-row @xl:items-center">
            <Link href="/" aria-label="home">
              <span className="text-2xl font-bold">Turborepo</span>
            </Link>
            <nav className="flex flex-wrap gap-x-6 gap-y-2 @xl:ml-auto">
              {links.map((link) => (
                <Link
                  key={link.label}
                  href={link.href}
                  className="text-sm text-muted-foreground transition-colors hover:text-foreground"
                >
                  {link.label}
                </Link>
              ))}
            </nav>
          </div>
        </div>
        <div className="flex flex-col-reverse gap-4 pt-8 @xl:flex-row @xl:justify-between">
          <p className="text-sm text-muted-foreground">&copy; {2026} Veil.</p>
          <div className="flex flex-wrap gap-4">
            <Link
              href="#"
              className="text-sm text-muted-foreground transition-colors hover:text-foreground"
            >
              Privacy Policy
            </Link>
            <Link
              href="#"
              className="text-sm text-muted-foreground transition-colors hover:text-foreground"
            >
              Terms of Service
            </Link>
            <Link
              href="#"
              className="text-sm text-muted-foreground transition-colors hover:text-foreground"
            >
              Cookies
            </Link>
          </div>
        </div>
      </div>
    </footer>
  )
}
