"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { supabase } from "@/lib/supabase"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Alert, AlertDescription } from "@/components/ui/alert"
import Image from "next/image"
import Link from "next/link"

const UNSPLASH_ACCESS_KEY = "Ekhz2I0y-jtO48lGAJ73Wg7DPoaxLHZ-ktJfFHm0Nuw"
const NUMBER_OF_IMAGES = 5
const ROTATION_INTERVAL = 10000 // 10 seconds

export default function Login() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [backgroundImages, setBackgroundImages] = useState<string[]>([])
  const [currentImageIndex, setCurrentImageIndex] = useState(0)
  const router = useRouter()

  useEffect(() => {
    fetchBackgroundImages()
  }, [])

  useEffect(() => {
    if (backgroundImages.length > 0) {
      const interval = setInterval(() => {
        setCurrentImageIndex((prevIndex) => (prevIndex + 1) % backgroundImages.length)
      }, ROTATION_INTERVAL)

      return () => clearInterval(interval)
    }
  }, [backgroundImages])

  const fetchBackgroundImages = async () => {
    try {
      const response = await fetch(
        `https://api.unsplash.com/photos/random?query=police&count=${NUMBER_OF_IMAGES}&client_id=${UNSPLASH_ACCESS_KEY}`,
      )
      const data = await response.json()
      setBackgroundImages(data.map((image: any) => image.urls.regular))
    } catch (error) {
      console.error("Error fetching background images:", error)
    }
  }

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    const { error } = await supabase.auth.signInWithPassword({ email, password })

    if (error) {
      setError(error.message)
    } else {
      router.push("/dashboard")
    }

    setLoading(false)
  }

  return (
    <div className="flex min-h-screen">
      {/* Left column with rotating background images */}
      <div className="hidden md:block md:w-1/2 relative overflow-hidden">
        {backgroundImages.map((image, index) => (
          <div
            key={index}
            className={`absolute inset-0 transition-opacity duration-1000 ${
              index === currentImageIndex ? "opacity-100" : "opacity-0"
            }`}
          >
            <Image
              src={image || "/placeholder.svg"}
              alt={`Police background ${index + 1}`}
              layout="fill"
              objectFit="cover"
              quality={100}
            />
            <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
              <h1 className="text-4xl font-bold text-white">Cahier de Veille</h1>
            </div>
          </div>
        ))}
      </div>

      {/* Right column with login form */}
      <div className="w-full md:w-1/2 flex items-center justify-center p-8 bg-white">
        <div className="w-full max-w-md">
          <div className="flex justify-center mb-8">
            <Image
              src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/logo-removebg-preview-NRXNNyOrizzUkvylW7LM9LmNIFfGlX.png"
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

