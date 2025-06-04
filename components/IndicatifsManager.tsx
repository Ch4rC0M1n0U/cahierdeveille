import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { supabase } from "@/lib/supabase"
import { Trash2 } from "lucide-react"

interface IndicatifsManagerProps {
  cahierId: string
  initialIndicatifs?: string[]
  onUpdate: (newIndicatifs: string[]) => void
}

export function IndicatifsManager({ cahierId, initialIndicatifs, onUpdate }: IndicatifsManagerProps) {
  const [indicatifs, setIndicatifs] = useState<string[]>(initialIndicatifs || [])
  const [newIndicatif, setNewIndicatif] = useState("")

  useEffect(() => {
    if (initialIndicatifs) {
      setIndicatifs(initialIndicatifs)
    }
  }, [initialIndicatifs])

  const addIndicatif = async () => {
    if (newIndicatif && !indicatifs.includes(newIndicatif)) {
      try {
        if (!cahierId) {
          throw new Error("cahierId is undefined or null")
        }
        const { data, error } = await supabase
          .from("indicatifs")
          .insert({ cahier_id: cahierId, indicatif: newIndicatif })
          .select()

        if (error) {
          throw error
        }

        if (!data || data.length === 0) {
          throw new Error("No data returned after insertion")
        }

        const updatedIndicatifs = [...indicatifs, newIndicatif]
        setIndicatifs(updatedIndicatifs)
        onUpdate(updatedIndicatifs)
        setNewIndicatif("")
      } catch (error) {
        console.error("Erreur lors de l'ajout de l'indicatif:", error)
        alert(`Erreur lors de l'ajout de l'indicatif: ${error.message || "Erreur inconnue"}`)
      }
    }
  }

  const removeIndicatif = async (indicatifToRemove: string) => {
    try {
      if (!cahierId) {
        throw new Error("cahierId is undefined or null")
      }
      const { error } = await supabase
        .from("indicatifs")
        .delete()
        .eq("cahier_id", cahierId)
        .eq("indicatif", indicatifToRemove)

      if (error) {
        throw error
      }

      const updatedIndicatifs = indicatifs.filter((ind) => ind !== indicatifToRemove)
      setIndicatifs(updatedIndicatifs)
      onUpdate(updatedIndicatifs)
    } catch (error) {
      console.error("Erreur lors de la suppression de l'indicatif:", error)
      alert(`Erreur lors de la suppression de l'indicatif: ${error.message || "Erreur inconnue"}`)
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex gap-2">
        <Input value={newIndicatif} onChange={(e) => setNewIndicatif(e.target.value)} placeholder="Nouvel indicatif" />
        <Button onClick={addIndicatif}>Ajouter</Button>
      </div>
      <ul className="space-y-2">
        {indicatifs.map((indicatif) => (
          <li key={indicatif} className="flex justify-between items-center">
            <span>{indicatif}</span>
            <Button variant="ghost" size="sm" onClick={() => removeIndicatif(indicatif)}>
              <Trash2 className="h-4 w-4" />
            </Button>
          </li>
        ))}
      </ul>
    </div>
  )
}
