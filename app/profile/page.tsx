"use client"

import { useState, useEffect } from "react"
import { supabase } from "@/lib/supabase"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Navigation } from "@/components/Navigation"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Label } from "@/components/ui/label"
import SignaturePad from "@/components/SignaturePad"
import Image from "next/image"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"

export default function Profile() {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [profileData, setProfileData] = useState({
    redacteur_name: "",
    matricule: "",
    email: "",
    service: "",
  })
  const [newPassword, setNewPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const [signature, setSignature] = useState<string | null>(null)
  const [paraphe, setParaphe] = useState<string | null>(null)
  const [isSignatureModalOpen, setIsSignatureModalOpen] = useState(false)
  const [isParapheModalOpen, setIsParapheModalOpen] = useState(false)

  useEffect(() => {
    getProfile()
  }, [])

  async function getProfile() {
    try {
      setLoading(true)
      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (user) {
        setUser(user)
        const { data, error } = await supabase.from("profiles").select("*").eq("id", user.id).single()

        if (error && error.code !== "PGRST116") {
          throw error
        }

        if (data) {
          setProfileData({
            redacteur_name: data.redacteur_name || "",
            matricule: data.matricule || "",
            email: user.email || "",
            service: data.service || "",
          })
          setSignature(data.signature || null)
          setParaphe(data.paraphe || null)
        }
      }
    } catch (error) {
      alert("Error loading user data!")
      console.error(error)
    } finally {
      setLoading(false)
    }
  }

  async function updateProfile() {
    try {
      setLoading(true)
      setError(null)
      setSuccess(null)

      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (!user) throw new Error("No user logged in")

      const updates = {
        id: user.id,
        redacteur_name: profileData.redacteur_name,
        matricule: profileData.matricule,
        service: profileData.service,
        updated_at: new Date().toISOString(),
      }

      const { error } = await supabase.from("profiles").upsert(updates)

      if (error) throw error

      if (newPassword && confirmPassword) {
        if (newPassword !== confirmPassword) {
          throw new Error("Les mots de passe ne correspondent pas.")
        }

        const { error: passwordError } = await supabase.auth.updateUser({
          password: newPassword,
        })

        if (passwordError) throw passwordError

        setNewPassword("")
        setConfirmPassword("")
      }

      setSuccess("Profil mis à jour avec succès!")
    } catch (error) {
      setError(error.message)
    } finally {
      setLoading(false)
    }
  }

  const saveSignature = async (signatureData: string) => {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser()
      if (!user) throw new Error("No user logged in")

      const { error } = await supabase.from("profiles").update({ signature: signatureData }).eq("id", user.id)

      if (error) throw error
      setSignature(signatureData)
      setSuccess("Signature enregistrée avec succès!")
      setIsSignatureModalOpen(false)
    } catch (error) {
      setError("Erreur lors de l'enregistrement de la signature")
      console.error(error)
    }
  }

  const saveParaphe = async (parapheData: string) => {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser()
      if (!user) throw new Error("No user logged in")

      const { error } = await supabase.from("profiles").update({ paraphe: parapheData }).eq("id", user.id)

      if (error) throw error
      setParaphe(parapheData)
      setSuccess("Paraphe enregistré avec succès!")
      setIsParapheModalOpen(false)
    } catch (error) {
      setError("Erreur lors de l'enregistrement du paraphe")
      console.error(error)
    }
  }

  if (!user) return null

  return (
    <div className="min-h-screen bg-gray-100">
      <Navigation />
      <main className="container mx-auto p-4">
        <h1 className="text-3xl font-bold mb-6">Profil</h1>
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="redacteur_name">Rédacteur</Label>
              <Input
                id="redacteur_name"
                type="text"
                value={profileData.redacteur_name}
                onChange={(e) => setProfileData({ ...profileData, redacteur_name: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="matricule">Matricule</Label>
              <Input
                id="matricule"
                type="text"
                value={profileData.matricule}
                onChange={(e) => setProfileData({ ...profileData, matricule: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="text" value={profileData.email} disabled />
            </div>
            <div className="space-y-2">
              <Label htmlFor="service">Service</Label>
              <Input
                id="service"
                type="text"
                value={profileData.service}
                onChange={(e) => setProfileData({ ...profileData, service: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="newPassword">Nouveau mot de passe</Label>
              <Input
                id="newPassword"
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="Laissez vide pour ne pas changer"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Confirmer le nouveau mot de passe</Label>
              <Input
                id="confirmPassword"
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Confirmez le nouveau mot de passe"
              />
            </div>
            <div className="space-y-4 mt-6">
              <h2 className="text-xl font-semibold">Signature</h2>
              {signature ? (
                <div>
                  <Image src={signature || "/placeholder.svg"} alt="Signature" width={300} height={150} />
                  <Button onClick={() => setIsSignatureModalOpen(true)} className="mt-2">
                    Modifier la signature
                  </Button>
                </div>
              ) : (
                <Button onClick={() => setIsSignatureModalOpen(true)}>Ajouter une signature</Button>
              )}
            </div>

            <Dialog open={isSignatureModalOpen} onOpenChange={setIsSignatureModalOpen}>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Signature</DialogTitle>
                  <DialogDescription>Dessinez votre signature ci-dessous</DialogDescription>
                </DialogHeader>
                <SignaturePad
                  onSave={(signatureData) => {
                    saveSignature(signatureData)
                    setIsSignatureModalOpen(false)
                  }}
                />
              </DialogContent>
            </Dialog>

            <div className="space-y-4 mt-6">
              <h2 className="text-xl font-semibold">Paraphe</h2>
              {paraphe ? (
                <div>
                  <Image src={paraphe || "/placeholder.svg"} alt="Paraphe" width={150} height={75} />
                  <Button onClick={() => setIsParapheModalOpen(true)} className="mt-2">
                    Modifier le paraphe
                  </Button>
                </div>
              ) : (
                <Button onClick={() => setIsParapheModalOpen(true)}>Ajouter un paraphe</Button>
              )}
            </div>

            <Dialog open={isParapheModalOpen} onOpenChange={setIsParapheModalOpen}>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Paraphe</DialogTitle>
                  <DialogDescription>Dessinez votre paraphe ci-dessous</DialogDescription>
                </DialogHeader>
                <SignaturePad
                  onSave={(parapheData) => {
                    saveParaphe(parapheData)
                    setIsParapheModalOpen(false)
                  }}
                  width={150}
                  height={75}
                />
              </DialogContent>
            </Dialog>
            <div>
              <Button onClick={updateProfile} disabled={loading}>
                {loading ? "Mise à jour ..." : "Mettre à jour le profil"}
              </Button>
            </div>
          </div>
          {error && (
            <Alert variant="destructive" className="mt-4">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
          {success && (
            <Alert variant="default" className="mt-4">
              <AlertDescription>{success}</AlertDescription>
            </Alert>
          )}
        </div>
      </main>
    </div>
  )
}

