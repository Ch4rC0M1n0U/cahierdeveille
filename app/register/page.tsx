"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { supabase } from "@/lib/supabase"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import Image from "next/image"
import Link from "next/link"

export default function Register() {
  const [formData, setFormData] = useState({
    operator: "",
    matricule: "",
    email: "",
    password: "",
    confirmPassword: "",
    service: "",
    rgpd: false,
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()

  const validateEmail = (email: string) => {
    const regex = /@police\.belgium\.eu$/
    return regex.test(email)
  }

  const validateForm = () => {
    if (!formData.operator.trim()) {
      setError("Le nom de l'opérateur est requis")
      return false
    }
    if (!formData.matricule.trim()) {
      setError("Le matricule est requis")
      return false
    }
    if (!validateEmail(formData.email)) {
      setError("Seules les adresses e-mail @police.belgium.eu sont autorisées")
      return false
    }
    if (formData.password.length < 6) {
      setError("Le mot de passe doit contenir au moins 6 caractères")
      return false
    }
    if (formData.password !== formData.confirmPassword) {
      setError("Les mots de passe ne correspondent pas")
      return false
    }
    if (!formData.service.trim()) {
      setError("Le service est requis")
      return false
    }
    if (!formData.rgpd) {
      setError("Vous devez accepter les conditions d'utilisation")
      return false
    }
    return true
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    if (!validateForm()) {
      return
    }

    setLoading(true)

    try {
      const { error: signUpError } = await supabase.auth.signUp({
        email: formData.email,
        password: formData.password,
        options: {
          data: {
            operator_name: formData.operator,
            matricule: formData.matricule,
            service: formData.service,
          },
        },
      })

      if (signUpError) throw signUpError

      // Create profile entry
      const {
        data: { user },
      } = await supabase.auth.getUser()
      if (user) {
        const { error: profileError } = await supabase.from("profiles").upsert({
          id: user.id,
          redacteur_name: formData.operator,
          matricule: formData.matricule,
          service: formData.service,
        })

        if (profileError) throw profileError
      }

      setError("Vérifiez votre email pour confirmer votre inscription.")
      setTimeout(() => {
        router.push("/login")
      }, 3000)
    } catch (error) {
      setError(error.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="flex justify-center mb-8">
          <Image
            src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/logo-removebg-preview-NRXNNyOrizzUkvylW7LM9LmNIFfGlX.png"
            alt="Police de Charleroi"
            width={150}
            height={150}
            className="object-contain"
          />
        </div>
        <div className="bg-white rounded-lg shadow-md p-8">
          <h1 className="text-2xl font-bold mb-6 text-center">Inscription</h1>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="operator">Opérateur</Label>
              <Input
                id="operator"
                value={formData.operator}
                onChange={(e) => setFormData({ ...formData, operator: e.target.value })}
                placeholder="Nom de l'opérateur"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="matricule">Matricule</Label>
              <Input
                id="matricule"
                value={formData.matricule}
                onChange={(e) => setFormData({ ...formData, matricule: e.target.value })}
                placeholder="Votre matricule"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                placeholder="votre.email@police.belgium.eu"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Mot de passe</Label>
              <Input
                id="password"
                type="password"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                placeholder="Votre mot de passe"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Confirmer le mot de passe</Label>
              <Input
                id="confirmPassword"
                type="password"
                value={formData.confirmPassword}
                onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                placeholder="Confirmez votre mot de passe"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="service">Service</Label>
              <Input
                id="service"
                value={formData.service}
                onChange={(e) => setFormData({ ...formData, service: e.target.value })}
                placeholder="Votre service"
                required
              />
            </div>

            <div className="flex items-center space-x-2">
              <Checkbox
                id="rgpd"
                checked={formData.rgpd}
                onCheckedChange={(checked) => setFormData({ ...formData, rgpd: checked as boolean })}
              />
              <Label htmlFor="rgpd" className="text-sm">
                J'accepte les conditions d'utilisation et la politique de confidentialité
              </Label>
            </div>

            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? "Inscription en cours..." : "S'inscrire"}
            </Button>

            <div className="text-center mt-4">
              <Link href="/" className="text-sm text-blue-600 hover:underline">
                Déjà inscrit ? Connectez-vous
              </Link>
            </div>
          </form>

          {error && (
            <Alert variant="destructive" className="mt-4">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
        </div>
      </div>
    </div>
  )
}

