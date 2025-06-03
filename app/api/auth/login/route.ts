import { NextResponse } from "next/server"
import { cookies } from "next/headers"
import { getUserByEmail, verifyPassword, generateToken } from "@/lib/db"

export async function POST(req: Request) {
  try {
    const { email, password } = await req.json()

    const user = await getUserByEmail(email)
    if (!user) {
      return NextResponse.json({ error: "Invalid email or password" }, { status: 401 })
    }

    const isValidPassword = await verifyPassword(user, password)
    if (!isValidPassword) {
      return NextResponse.json({ error: "Invalid email or password" }, { status: 401 })
    }

    const token = generateToken(user)

    // Set cookie
    cookies().set({
      name: "auth-token",
      value: token,
      httpOnly: true,
      path: "/",
      secure: process.env.NODE_ENV === "production",
      maxAge: 60 * 60 * 24 * 7, // 7 days
    })

    return NextResponse.json({
      user: {
        id: user.id,
        email: user.email,
      },
    })
  } catch (error) {
    console.error("Login error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
