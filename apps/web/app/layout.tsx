import { Geist_Mono, Inter } from "next/font/google"

import "@workspace/shadcn/globals.css"
import { ThemeProvider } from "@workspace/shadcn/ui/theme-provider"
import { cn } from "@workspace/shadcn/lib/utils"
import { WarpLayout } from "@/components/warp-layout"

const inter = Inter({ subsets: ["latin"], variable: "--font-sans" })

const fontMono = Geist_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
})

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={cn(
        "antialiased",
        fontMono.variable,
        "font-sans",
        inter.variable
      )}
    >
      <body>
        <ThemeProvider>
          <WarpLayout>{children}</WarpLayout>
        </ThemeProvider>
      </body>
    </html>
  )
}
