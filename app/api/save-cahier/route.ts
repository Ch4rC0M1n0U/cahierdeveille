import { NextResponse } from "next/server"
import { getDb } from "@/lib/db"
import { cookies } from "next/headers"
import { verifyToken } from "@/lib/db"

export async function POST(req: Request) {
  if (req.method === "POST") {
    try {
      // Verify authentication
      const token = cookies().get("auth-token")?.value
      if (!token) {
        return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 })
      }

      const payload = verifyToken(token)
      if (!payload) {
        return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 })
      }

      const { eventDetails, communications } = await req.json()
      const db = await getDb()

      // Insert event details
      const result = await db.run(
        `INSERT INTO cahiers_de_veille 
        (evenement, redacteur, poste, frequence, responsable, user_id) 
        VALUES (?, ?, ?, ?, ?, ?)`,
        [
          eventDetails.evenement,
          eventDetails.redacteur,
          eventDetails.poste,
          eventDetails.frequence,
          eventDetails.responsable,
          payload.id,
        ],
      )

      const cahierId = result.lastID

      // Insert communications
      for (const comm of communications) {
        await db.run(
          `INSERT INTO communications 
          (cahier_id, appele, appelant, heure, communication) 
          VALUES (?, ?, ?, ?, ?)`,
          [cahierId, comm.appele, comm.appelant, comm.heure, comm.communication],
        )
      }

      return NextResponse.json({
        success: true,
        data: { id: cahierId, ...eventDetails, communications },
      })
    } catch (error) {
      console.error("Error saving cahier:", error)
      return NextResponse.json({ success: false, error: "Error saving cahier" }, { status: 500 })
    }
  } else {
    return NextResponse.json({ success: false, error: "Method not allowed" }, { status: 405 })
  }
}
