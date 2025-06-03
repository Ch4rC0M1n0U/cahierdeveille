import type React from "react"
import type { Metadata } from "next"
import "./globals.css"
import { AuthProvider } from "@/lib/auth-context"

export const metadata: Metadata = {
  title: "Cahier de Veille",
  description: "Application de gestion des cahiers de veille",
  generator: "v0.dev",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="fr">
      <body>
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  )
}
