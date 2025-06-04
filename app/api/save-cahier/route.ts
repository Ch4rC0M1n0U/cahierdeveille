import { NextResponse } from "next/server"
import { supabase } from "@/lib/supabase"

export async function POST(req: Request) {
  if (req.method === "POST") {
    try {
      const { eventDetails, communications } = await req.json()

      // Insérer les détails de l'événement
      const { data: cahierData, error: cahierError } = await supabase
        .from("cahiers_de_veille")
        .insert([eventDetails])
        .select()

      if (cahierError) throw cahierError

      const cahierId = cahierData[0].id

      // Insérer les communications
      const { error: communicationsError } = await supabase
        .from("communications")
        .insert(communications.map((comm) => ({ ...comm, cahier_id: cahierId })))

      if (communicationsError) throw communicationsError

      return NextResponse.json({ success: true, data: { id: cahierId, ...eventDetails, communications } })
    } catch (error) {
      console.error("Error saving cahier:", error)
      return NextResponse.json({ success: false, error: "Error saving cahier" }, { status: 500 })
    }
  } else {
    return NextResponse.json({ success: false, error: "Method not allowed" }, { status: 405 })
  }
}
