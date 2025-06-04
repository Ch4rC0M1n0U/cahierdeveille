"use client"

import { useEffect, useState, Suspense } from "react"
import { useSearchParams } from "next/navigation"
import { Navigation } from "@/components/Navigation"
import CahierDeVeille from "@/components/CahierDeVeille"
import { supabase } from "@/lib/supabase"

function NewCahierContent() {
  const [eventTitle, setEventTitle] = useState("")
  const [redacteur, setRedacteur] = useState("")
  const searchParams = useSearchParams()

  useEffect(() => {
    const title = searchParams.get("title")
    if (title) {
      setEventTitle(decodeURIComponent(title))
    }
    getRedacteurName()
  }, [searchParams])

  async function getRedacteurName() {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser()
      if (user) {
        const { data, error } = await supabase.from("profiles").select("redacteur_name").eq("id", user.id).single()

        if (error) throw error
        if (data && data.redacteur_name) {
          setRedacteur(data.redacteur_name)
        }
      }
    } catch (error) {
      console.error("Error fetching redacteur name:", error)
    }
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <Navigation />
      <main className="container mx-auto p-4">
        <h1 className="text-3xl font-bold mb-6">Créer un Nouveau Cahier de Veille</h1>
        <div className="bg-white rounded-lg shadow-md p-6">
          <CahierDeVeille initialEventTitle={eventTitle} redacteurName={redacteur} />
        </div>
      </main>
    </div>
  )
}

export default function NewCahier() {
  return (
    <Suspense fallback={<div>Chargement...</div>}>
      <NewCahierContent />
    </Suspense>
  )
}

