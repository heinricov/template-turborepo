import React from "react"
import { NavHeader } from "./navigations/nav-header"
import { Footer } from "./navigations/nav-footer"

export function WarpLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <NavHeader />
      {children}
      <Footer />
    </>
  )
}
