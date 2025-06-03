"use client"

import Link from "next/link"
import { useRouter } from "next/navigation"
import { useState, useEffect } from "react"
import { supabase } from "@/lib/supabase"
import type { User } from "@supabase/supabase-js"
import { Button } from "@/components/ui/button"
import Image from "next/image"
import { LogOut } from "lucide-react"

export function Navigation() {
  const router = useRouter()
  const [user, setUser] = useState<User | null>(null)
  const [newEventTitle, setNewEventTitle] = useState("")
  const [isNewEventDialogOpen, setIsNewEventDialogOpen] = useState(false)

  useEffect(() => {
    const { data: authListener } = supabase.auth.onAuthStateChange((event, session) => {
      setUser(session?.user ?? null)
    })

    supabase.auth.getUser().then(({ data: { user } }) => {
      setUser(user)
    })

    return () => {
      authListener.subscription.unsubscribe()
    }
  }, [])

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    router.push("/")
  }

  const handleNewEventSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (newEventTitle.trim()) {
      router.push(`/new-cahier?title=${encodeURIComponent(newEventTitle.trim())}`)
    }
    setIsNewEventDialogOpen(false)
  }

  return (
    <nav className="bg-gray-800 text-white p-4 shadow-md">
      <div className="container mx-auto flex justify-between items-center">
        <div className="flex items-center gap-4">
          <Link href={user ? "/dashboard" : "/"} className="flex items-center gap-4">
            <Image
              src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/logo-removebg-preview-NRXNNyOrizzUkvylW7LM9LmNIFfGlX.png"
              alt="Police de Charleroi"
              width={40}
              height={40}
              className="object-contain"
            />
            <span className="text-xl font-bold">Cahier de Veille</span>
          </Link>
        </div>
        <div className="space-x-4">
          {user ? (
            <>
              <div className="flex items-center space-x-4">
                {/* Removed repeated "Nouveau Cahier" button */}
                <Link href="/dashboard" className="text-white hover:text-gray-300">
                  Tableau de bord
                </Link>
                <Link href="/profile" className="text-white hover:text-gray-300">
                  Profil
                </Link>
                <Button onClick={handleSignOut} variant="outline" className="bg-red-500 text-white hover:bg-red-600">
                  <LogOut className="h-4 w-4 mr-2" />
                  Déconnexion
                </Button>
              </div>
            </>
          ) : (
            <Link href="/" className="hover:text-gray-300">
              Connexion
            </Link>
          )}
        </div>
      </div>
    </nav>
  )
}

