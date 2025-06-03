"use client"

import Link from "next/link"
import { useRouter } from "next/navigation"
import { useAuth } from "@/lib/auth-context"
import { Button } from "@/components/ui/button"
import Image from "next/image"
import { LogOut } from "lucide-react"

export function Navigation() {
  const router = useRouter()
  const { user, logout } = useAuth()

  const handleSignOut = async () => {
    await logout()
    router.push("/")
  }

  return (
    <nav className="bg-gray-800 text-white p-4 shadow-md">
      <div className="container mx-auto flex justify-between items-center">
        <div className="flex items-center gap-4">
          <Link href={user ? "/dashboard" : "/"} className="flex items-center gap-4">
            <Image
              src="/placeholder.svg?height=40&width=40"
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
