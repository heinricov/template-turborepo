import Link from "next/link"

const links = [
  { label: "About", href: "#" },
  { label: "Blog", href: "#" },
  { label: "Contact", href: "#" },
]

export function Footer() {
  return (
    <footer className="bg-background @container py-12">
      <div className="mx-auto max-w-6xl px-6">
        <div className="border-y py-8">
          <div className="flex flex-col gap-6 @xl:flex-row @xl:items-center">
            <div className="flex flex-col">
              <Link href="/" aria-label="home">
                <span className="text-2xl font-bold">Turborepo</span>
              </Link>
              <p className="text-muted-foreground text-sm">
                &copy; {2026} Veil.
              </p>
            </div>
            <nav className="flex flex-wrap gap-x-6 gap-y-2 @xl:ml-auto">
              {links.map((link) => (
                <Link
                  key={link.label}
                  href={link.href}
                  className="text-muted-foreground hover:text-foreground text-sm transition-colors"
                >
                  {link.label}
                </Link>
              ))}
            </nav>
          </div>
        </div>
      </div>
    </footer>
  )
}
