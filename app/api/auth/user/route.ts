import { NextResponse } from "next/server"
import { cookies } from "next/headers"
import { verifyToken, getDb } from "@/lib/db"

export async function GET() {
  try {
    const token = cookies().get("auth-token")?.value

    if (!token) {
      return NextResponse.json({ user: null })
    }

    const payload = verifyToken(token)
    if (!payload) {
      return NextResponse.json({ user: null })
    }

    const db = await getDb()
    const user = await db.get("SELECT id, email FROM users WHERE id = ?", [payload.id])

    if (!user) {
      return NextResponse.json({ user: null })
    }

    return NextResponse.json({ user })
  } catch (error) {
    console.error("Get user error:", error)
    return NextResponse.json({ user: null })
  }
}
