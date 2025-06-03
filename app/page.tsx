"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/lib/auth-context"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Alert, AlertDescription } from "@/components/ui/alert"
import Image from "next/image"
import Link from "next/link"

export default function Login() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [backgroundImage, setBackgroundImage] = useState<string | null>(null)
  const router = useRouter()
  const { login } = useAuth()

  useEffect(() => {
    // Load a random police-related image
    setBackgroundImage("/placeholder.svg?height=1080&width=1920")
  }, [])

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    const result = await login(email, password)

    if (!result.success) {
      setError(result.error || "Une erreur est survenue lors de la connexion")
    } else {
      router.push("/dashboard")
    }

    setLoading(false)
  }

  return (
    <div className="flex min-h-screen">
      {/* Left column with background image */}
      <div className="hidden md:block md:w-1/2 relative overflow-hidden">
        <div className="absolute inset-0">
          <Image
            src={backgroundImage || "/placeholder.svg"}
            alt="Police background"
            layout="fill"
            objectFit="cover"
            quality={100}
          />
          <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
            <h1 className="text-4xl font-bold text-white">Cahier de Veille</h1>
          </div>
        </div>
      </div>

      {/* Right column with login form */}
      <div className="w-full md:w-1/2 flex items-center justify-center p-8 bg-white">
        <div className="w-full max-w-md">
          <div className="flex justify-center mb-8">
            <Image
              src="/placeholder.svg?height=150&width=150"
              alt="Police de Charleroi"
              width={150}
              height={150}
              className="object-contain"
            />
          </div>
          <h2 className="text-2xl font-bold mb-6 text-center">Connexion</h2>
          <form onSubmit={handleLogin} className="space-y-4">
            <Input type="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} required />
            <Input
              type="password"
              placeholder="Mot de passe"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? "Chargement..." : "Se connecter"}
            </Button>
          </form>

          <div className="text-center mt-4">
            <Link href="/register" className="text-blue-600 hover:underline">
              Pas encore de compte ? Inscrivez-vous
            </Link>
          </div>

          {error && (
            <Alert variant="destructive" className="mt-4">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
        </div>
      </div>
    </div>
  )
}
