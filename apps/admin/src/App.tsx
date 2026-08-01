import { useMemo, useState } from "react"
import { Routes, Route, Navigate, Outlet, useLocation } from "react-router-dom"
import { LayoutDashboard, ShieldCheck, Users } from "lucide-react"

import LayoutSide from "@workspace/shadcn/components/sidebar/layout-side"
import type { LoginResult } from "@workspace/shadcn/components/auth/login"
import { ThemeProvider } from "@workspace/shadcn/ui/theme-provider"
import LoginPage from "@/pages/login"
import DashboardPage from "@/pages/dashboard"
import UsersPage from "@/pages/users"
import UsersRegisterPage from "@/pages/users/register"
import UsersProfilePage from "@/pages/users/profile"
import UserDetailPage from "@/pages/users/detail"

const AUTH_KEY = "admin_auth"

function App() {
  const location = useLocation()
  const pathname = location.pathname

  const [auth, setAuth] = useState<LoginResult | null>(() => {
    try {
      return JSON.parse(localStorage.getItem(AUTH_KEY) ?? "null") as LoginResult | null
    } catch {
      return null
    }
  })

  const { menus, collapsMenus, breadcrumb } = useMemo(() => {
    const menus = [
      {
        title: "Dashboard",
        url: "/dashboard",
        icon: LayoutDashboard,
        isActive: pathname.startsWith("/dashboard"),
      },
    ]

    const collapsMenus = [
      {
        title: "Users",
        url: "/users",
        icon: Users,
        isActive: pathname.startsWith("/users"),
        items: [
          {
            title: "Register",
            url: "/users/register",
            isActive: pathname === "/users/register",
          },
          {
            title: "Users Profile",
            url: "/users/profile",
            isActive: pathname === "/users/profile",
          },
        ],
      },
    ]

    const isEdit = new URLSearchParams(location.search).get("edit") === "true"

    let breadcrumb: { label: string; href?: string }[] = []
    if (pathname === "/dashboard") {
      breadcrumb = [{ label: "Dashboard" }]
    } else if (pathname === "/users") {
      breadcrumb = [{ label: "Users" }]
    } else if (pathname === "/users/register") {
      breadcrumb = [{ label: "Users", href: "/users" }, { label: "Register" }]
    } else if (pathname === "/users/profile") {
      breadcrumb = [{ label: "Users", href: "/users" }, { label: "Profile" }]
    } else if (pathname.startsWith("/users/")) {
      breadcrumb = [
        { label: "Users", href: "/users" },
        { label: isEdit ? "Edit User" : "User Detail" },
      ]
    }

    return { menus, collapsMenus, breadcrumb }
  }, [pathname, location.search])

  const handleLogin = (result: LoginResult) => {
    localStorage.setItem(AUTH_KEY, JSON.stringify(result))
    setAuth(result)
  }

  const handleLogout = () => {
    localStorage.removeItem(AUTH_KEY)
    setAuth(null)
  }

  return (
    <ThemeProvider>
      <Routes>
        <Route
          path="/login"
          element={
            auth ? (
              <Navigate to="/dashboard" replace />
            ) : (
              <LoginPage onLogin={handleLogin} />
            )
          }
        />
        <Route
          element={
            auth ? (
              <LayoutSide
                brand={{
                  name: "Admin Panel",
                  description: "Management System",
                  logo: ShieldCheck,
                }}
                user={{
                  name: auth.user.username ?? auth.user.email,
                  email: auth.user.email,
                  avatar: "",
                }}
                onLogout={handleLogout}
                breadcrumb={breadcrumb}
                menu={{
                  NavMain: {
                    title: "Main Menus",
                    items: menus,
                  },
                  NavCollaps: {
                    title: "Collaps Menus",
                    items: collapsMenus,
                  },
                }}
              >
                <Outlet />
              </LayoutSide>
            ) : (
              <Navigate to="/login" replace />
            )
          }
        >
          <Route path="/dashboard" element={<DashboardPage />} />
          <Route path="/users" element={<UsersPage />} />
          <Route path="/users/register" element={<UsersRegisterPage />} />
          <Route path="/users/profile" element={<UsersProfilePage />} />
          <Route path="/users/:id" element={<UserDetailPage />} />
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Route>
      </Routes>
    </ThemeProvider>
  )
}

export default App
