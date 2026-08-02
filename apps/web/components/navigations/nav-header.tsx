"use client"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { X } from "lucide-react"
import { Button } from "@workspace/shadcn/ui/button"
import React from "react"
import { NavUser } from "./nav-user"
import { AUTH_EVENT, clearStoredAuth, getStoredAuth } from "@/lib/auth"

const menuItems = [
  { name: "Home", href: "/" },
  { name: "Data", href: "/data" },
]

export const NavHeader = () => {
  const router = useRouter()
  const [menuState, setMenuState] = React.useState(false)
  const [auth, setAuth] = React.useState<
    ReturnType<typeof getStoredAuth> | undefined
  >(undefined)

  React.useEffect(() => {
    setAuth(getStoredAuth())

    const handleAuthChange = () => setAuth(getStoredAuth())
    window.addEventListener(AUTH_EVENT, handleAuthChange)

    return () => window.removeEventListener(AUTH_EVENT, handleAuthChange)
  }, [])

  React.useEffect(() => {
    if (!menuState) return

    const mediaQuery = window.matchMedia("(max-width: 1023px)")
    const updateOverflow = () => {
      document.documentElement.classList.toggle(
        "overflow-hidden",
        mediaQuery.matches
      )
    }

    updateOverflow()
    mediaQuery.addEventListener("change", updateOverflow)

    return () => {
      mediaQuery.removeEventListener("change", updateOverflow)
      document.documentElement.classList.remove("overflow-hidden")
    }
  }, [menuState])

  const handleLogout = () => {
    clearStoredAuth()
    setMenuState(false)
    router.push("/")
  }

  return (
    <header>
      <nav
        data-state={menuState && "active"}
        className="bg-background fixed top-0 z-20 w-full border-b data-[state=active]:bottom-0"
      >
        <div className="mx-auto max-w-6xl px-6">
          <div className="relative flex flex-wrap items-center justify-between py-5 max-lg:gap-6">
            <div className="flex w-full items-center justify-between gap-12 lg:w-auto">
              <Link
                href="/"
                aria-label="home"
                className="flex items-center space-x-2"
              >
                <span className="text-2xl font-bold">Turborepo</span>
              </Link>

              <div className="flex items-center gap-2">
                <div className="lg:hidden">
                  {auth === undefined ? null : auth ? (
                    <NavUser
                      user={{
                        name: auth.user.username ?? auth.user.email,
                        email: auth.user.email,
                      }}
                      onLogout={handleLogout}
                    />
                  ) : (
                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        nativeButton={false}
                        render={
                          <Link href="/auth/login">
                            <span>Login</span>
                          </Link>
                        }
                      />
                      <Button
                        size="sm"
                        nativeButton={false}
                        render={
                          <Link href="/auth/signup">
                            <span>Sign Up</span>
                          </Link>
                        }
                      />
                    </div>
                  )}
                </div>
                <button
                  onClick={() => setMenuState(!menuState)}
                  aria-label={menuState == true ? "Close Menu" : "Open Menu"}
                  className="relative z-20 block cursor-pointer after:absolute after:-inset-4 lg:hidden"
                >
                  <div
                    aria-hidden
                    className="m-auto flex size-4.5 flex-col items-center justify-center gap-1.75 duration-200 in-data-[state=active]:scale-0 in-data-[state=active]:rotate-180 in-data-[state=active]:opacity-0"
                  >
                    <span className="bg-foreground h-0.5 w-full rounded-full" />
                    <span className="bg-foreground h-0.5 w-full rounded-full" />
                  </div>

                  <X className="absolute inset-0 m-auto size-6 -translate-x-0.75 scale-0 -rotate-180 opacity-0 duration-200 in-data-[state=active]:scale-100 in-data-[state=active]:rotate-0 in-data-[state=active]:opacity-100" />
                </button>
              </div>

              <div className="max-lg:hidden">
                <div className="flex items-center gap-8 text-sm">
                  <ul className="flex items-center gap-8">
                    {menuItems.map((item) => (
                      <li key={item.href}>
                        <Link
                          href={item.href}
                          className="text-muted-foreground hover:text-accent-foreground block duration-150"
                        >
                          <span>{item.name}</span>
                        </Link>
                      </li>
                    ))}
                  </ul>
                  <div className="border-border flex items-center gap-2 border-l pl-6">
                    {auth === undefined ? null : auth ? (
                      <NavUser
                        user={{
                          name: auth.user.username ?? auth.user.email,
                          email: auth.user.email,
                        }}
                        onLogout={handleLogout}
                      />
                    ) : (
                      <>
                        <Button
                          variant="outline"
                          size="sm"
                          nativeButton={false}
                          render={
                            <Link href="/auth/login">
                              <span>Login</span>
                            </Link>
                          }
                        />
                        <Button
                          size="sm"
                          nativeButton={false}
                          render={
                            <Link href="/auth/signup">
                              <span>Sign Up</span>
                            </Link>
                          }
                        />
                      </>
                    )}
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-background mb-6 hidden w-full flex-wrap items-center justify-end space-y-8 in-data-[state=active]:block md:flex-nowrap lg:m-0 lg:flex lg:w-fit lg:gap-6 lg:space-y-0 lg:border-transparent lg:bg-transparent lg:p-0 lg:shadow-none lg:in-data-[state=active]:flex dark:shadow-none dark:lg:bg-transparent">
              <div className="lg:hidden">
                <ul>
                  {menuItems.map((item) => (
                    <li key={item.href}>
                      <Link
                        href={item.href}
                        className="text-foreground block py-3 text-2xl font-medium"
                      >
                        <span>{item.name}</span>
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </div>
      </nav>
    </header>
  )
}
