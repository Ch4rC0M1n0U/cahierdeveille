import { NextResponse } from "next/server"
import { createUser, getDb } from "@/lib/db"

export async function POST(req: Request) {
  try {
    const { email, password, operator, matricule, service } = await req.json()

    // Validate email domain if needed
    if (!email.endsWith("@police.belgium.eu")) {
      return NextResponse.json(
        { error: "Seules les adresses e-mail @police.belgium.eu sont autorisées" },
        { status: 400 },
      )
    }

    // Create user
    const user = await createUser(email, password)

    // Create profile
    const db = await getDb()
    await db.run("INSERT INTO profiles (id, redacteur_name, matricule, service) VALUES (?, ?, ?, ?)", [
      user.id,
      operator,
      matricule,
      service,
    ])

    return NextResponse.json({ success: true })
  } catch (error: any) {
    console.error("Registration error:", error)

    // Check for duplicate email
    if (error.message && error.message.includes("UNIQUE constraint failed: users.email")) {
      return NextResponse.json({ error: "Cette adresse email est déjà utilisée" }, { status: 400 })
    }

    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
