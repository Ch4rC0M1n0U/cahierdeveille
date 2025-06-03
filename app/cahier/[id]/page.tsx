"use client"

import { useParams } from "next/navigation"
import { Navigation } from "@/components/Navigation"
import CahierDeVeille from "@/components/CahierDeVeille"
import { useState, useEffect } from "react"
import { supabase } from "@/lib/supabase"
import type { User } from "@supabase/supabase-js"

export default function EditCahier() {
  const params = useParams()
  const cahierId = params.id as string
  const [user, setUser] = useState<User | null>(null)

  useEffect(() => {
    const getUser = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser()
      setUser(user)
    }
    getUser()
  }, [])

  return (
    <div className="min-h-screen bg-gray-100">
      <Navigation />
      <main className="container mx-auto p-4">
        <h1 className="text-3xl font-bold mb-6">Éditer le Cahier de Veille</h1>
        <div className="bg-white rounded-lg shadow-md p-6">
          <CahierDeVeille cahierId={cahierId} user={user || undefined} />
        </div>
      </main>
    </div>
  )
}
