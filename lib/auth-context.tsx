"use client"

import { createContext, useContext, useState, useEffect, type ReactNode } from "react"
import { useRouter } from "next/navigation"
import Cookies from "js-cookie"

interface User {
  id: string
  email: string
}

interface AuthContextType {
  user: User | null
  loading: boolean
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>
  logout: () => void
  register: (userData: any) => Promise<{ success: boolean; error?: string }>
  getUser: () => Promise<User | null>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    const initAuth = async () => {
      const user = await getUser()
      setUser(user)
      setLoading(false)
    }
    initAuth()
  }, [])

  const login = async (email: string, password: string) => {
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      })

      const data = await res.json()

      if (!res.ok) {
        return { success: false, error: data.error || "Login failed" }
      }

      setUser(data.user)
      return { success: true }
    } catch (error) {
      return { success: false, error: "An error occurred during login" }
    }
  }

  const logout = async () => {
    await fetch("/api/auth/logout", { method: "POST" })
    Cookies.remove("auth-token")
    setUser(null)
    router.push("/")
  }

  const register = async (userData: any) => {
    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(userData),
      })

      const data = await res.json()

      if (!res.ok) {
        return { success: false, error: data.error || "Registration failed" }
      }

      return { success: true }
    } catch (error) {
      return { success: false, error: "An error occurred during registration" }
    }
  }

  const getUser = async (): Promise<User | null> => {
    try {
      const res = await fetch("/api/auth/user")
      if (!res.ok) return null

      const data = await res.json()
      return data.user
    } catch (error) {
      return null
    }
  }

  return (
    <AuthContext.Provider value={{ user, loading, login, logout, register, getUser }}>{children}</AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}
