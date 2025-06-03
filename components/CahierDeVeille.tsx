"use client"

import { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { jsPDF } from "jspdf"
import "jspdf-autotable"
import { Save, FileDown, Trash2, PlusCircle, Users, ArrowUpDown, ArrowUp, ArrowDown, Archive } from "lucide-react"
import Image from "next/image"
import { useRouter } from "next/navigation"
import { supabase } from "@/lib/supabase"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import type { User } from "@supabase/supabase-js"
import { IndicatifsManager } from "@/components/IndicatifsManager"
import { SelectOrInput } from "@/components/SelectOrInput"

interface CommunicationEntry {
  id?: string
  appele: string
  appelant: string
  heure: string
  communication: string
}

interface CahierDeVeilleProps {
  cahierId?: string
  initialEventTitle?: string
  redacteurName?: string
  user?: User
}

type SortColumn = "appele" | "appelant" | "heure" | "communication"
type SortDirection = "asc" | "desc" | null

export default function CahierDeVeille({
  cahierId,
  initialEventTitle = "",
  redacteurName = "",
  user,
}: CahierDeVeilleProps) {
  const [eventDetails, setEventDetails] = useState({
    evenement: initialEventTitle,
    redacteur: redacteurName || "",
    poste: "",
    frequence: "",
    responsable: "",
  })
  const [communications, setCommunications] = useState<CommunicationEntry[]>([])
  const [isSaveModalOpen, setIsSaveModalOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [signature, setSignature] = useState<string | null>(null)
  const [paraphe, setParaphe] = useState<string | null>(null)
  const [isIndicatifsModalOpen, setIsIndicatifsModalOpen] = useState(false)
  const [indicatifs, setIndicatifs] = useState<string[]>([])
  const [sortColumn, setSortColumn] = useState<SortColumn>("heure")
  const [sortDirection, setSortDirection] = useState<SortDirection>("asc")
  const newRowRef = useRef<HTMLTableRowElement>(null)
  const router = useRouter()

  useEffect(() => {
    console.log("useEffect appelé avec cahierId:", cahierId)
    if (cahierId && cahierId !== "undefined") {
      fetchCahier(cahierId)
    } else {
      setEventDetails((prev) => ({
        ...prev,
        evenement: initialEventTitle || prev.evenement,
        redacteur: redacteurName || prev.redacteur,
      }))
      setIsLoading(false)
    }

    if (user) {
      fetchUserSignatureAndParaphe(user.id)
    }
  }, [cahierId, initialEventTitle, redacteurName, user])

  const fetchCahier = async (id: string) => {
    try {
      setIsLoading(true)
      setError(null)

      console.log("Fetching cahier with id:", id)

      const { data: cahierData, error: cahierError } = await supabase
        .from("cahiers_de_veille")
        .select("*")
        .eq("id", id)
        .single()

      if (cahierError) {
        throw cahierError
      }

      console.log("Cahier data fetched:", cahierData)

      setEventDetails({
        evenement: cahierData.evenement || "",
        redacteur: cahierData.redacteur || "",
        poste: cahierData.poste || "",
        frequence: cahierData.frequence || "",
        responsable: cahierData.responsable || "",
      })

      console.log("Event details set:", eventDetails)

      const { data: communicationsData, error: communicationsError } = await supabase
        .from("communications")
        .select("id, appele, appelant, heure, communication")
        .eq("cahier_id", id)
        .order("heure", { ascending: true })

      if (communicationsError) {
        throw communicationsError
      }

      console.log("Communications data fetched:", communicationsData)

      setCommunications(communicationsData || [])

      console.log("Communications state set:", communications)

      const { data: indicatifsData, error: indicatifsError } = await supabase
        .from("indicatifs")
        .select("indicatif")
        .eq("cahier_id", id)

      if (indicatifsError) {
        throw indicatifsError
      }

      setIndicatifs(indicatifsData.map((item) => item.indicatif))
    } catch (error) {
      console.error("Erreur lors de la récupération du cahier:", error)
      setError(error.message)
    } finally {
      setIsLoading(false)
    }
  }

  const handleEventDetailsChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setEventDetails((prev) => ({ ...prev, [name]: value }))
  }

  const addNewRow = () => {
    const now = new Date()
    const formattedDateTime = `${now.toLocaleDateString()} ${now.toLocaleTimeString()}`
    setCommunications((prev) => {
      const newComm = { appele: "", appelant: "", heure: formattedDateTime, communication: "" }
      const updatedComms = [...prev, newComm]
      return sortCommunications(updatedComms, sortColumn, sortDirection)
    })
  }

  const handleCommunicationChange = (index: number, field: keyof CommunicationEntry, value: string) => {
    setCommunications((prev) => {
      const updatedCommunications = [...prev]
      updatedCommunications[index] = { ...updatedCommunications[index], [field]: value }
      return sortCommunications(updatedCommunications, sortColumn, sortDirection)
    })

    // Add new indicatif if it doesn't exist
    if ((field === "appele" || field === "appelant") && !indicatifs.includes(value)) {
      setIndicatifs((prev) => [...prev, value])
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>, index: number) => {
    if (e.key === "Enter") {
      e.preventDefault()
      addNewRow()
    }
  }

  const deleteRow = async (index: number) => {
    const commToDelete = communications[index]
    if (commToDelete.id) {
      try {
        const { error } = await supabase.from("communications").delete().eq("id", commToDelete.id)

        if (error) throw error
      } catch (error) {
        console.error("Error deleting communication:", error)
        alert("Erreur lors de la suppression de la communication. Veuillez réessayer.")
        return
      }
    }
    setCommunications((prev) => prev.filter((_, i) => i !== index))
  }

  const saveToDB = async () => {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser()
      if (!user) {
        throw new Error("Utilisateur non connecté")
      }

      let savedCahierId = cahierId

      if (!savedCahierId || savedCahierId === "undefined") {
        // Create new cahier
        const { data, error } = await supabase
          .from("cahiers_de_veille")
          .insert([{ ...eventDetails, user_id: user.id }])
          .select()

        if (error) throw error
        savedCahierId = data[0].id
      } else {
        // Update existing cahier
        const { error } = await supabase.from("cahiers_de_veille").update(eventDetails).eq("id", savedCahierId)

        if (error) throw error
      }

      // Separate new and existing communications
      const existingComms = communications.filter((comm) => comm.id)
      const newComms = communications.filter((comm) => !comm.id)

      // Update existing communications
      if (existingComms.length > 0) {
        const { error: updateError } = await supabase.from("communications").upsert(
          existingComms.map((comm) => ({
            id: comm.id,
            cahier_id: savedCahierId,
            appele: comm.appele,
            appelant: comm.appelant,
            heure: comm.heure,
            communication: comm.communication,
          })),
        )

        if (updateError) throw updateError
      }

      // Insert new communications
      if (newComms.length > 0) {
        const { error: insertError } = await supabase
          .from("communications")
          .insert(newComms.map((comm) => ({ ...comm, cahier_id: savedCahierId })))

        if (insertError) throw insertError
      }

      setIsSaveModalOpen(true)

      // Fetch updated communications to get new IDs
      const { data: updatedComms, error: fetchError } = await supabase
        .from("communications")
        .select("*")
        .eq("cahier_id", savedCahierId)

      if (fetchError) throw fetchError

      // Update local state with new IDs
      setCommunications(updatedComms)
    } catch (error) {
      console.error("Error saving cahier:", error)
      alert("Erreur lors de la sauvegarde. Veuillez réessayer.")
    }
  }

  const fetchUserSignatureAndParaphe = async (userId: string) => {
    try {
      const { data, error } = await supabase.from("profiles").select("signature, paraphe").eq("id", userId).single()

      if (error) throw error

      setSignature(data.signature)
      setParaphe(data.paraphe)
    } catch (error) {
      console.error("Erreur lors de la récupération de la signature et du paraphe:", error)
    }
  }

  const exportToPDF = () => {
    const doc = new jsPDF()
    const pageHeight = doc.internal.pageSize.height
    const pageWidth = doc.internal.pageSize.width

    // Function to add header and footer to each page
    const addHeaderAndFooter = (data) => {
      if (data.pageNumber === 1) {
        // Modern header (only on first page)
        doc.setFillColor(240, 240, 240) // Light gray background
        doc.rect(0, 0, pageWidth, 40, "F")

        doc.setFont("helvetica", "bold")
        doc.setFontSize(16)
        doc.setTextColor(50, 50, 50) // Dark gray text
        const headerText = eventDetails.evenement ? `CAHIER DE VEILLE - ${eventDetails.evenement}` : "CAHIER DE VEILLE"
        doc.text(headerText, 15, 25)

        // Add logo (only on first page)
        doc.addImage(
          "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/logo-removebg-preview-NRXNNyOrizzUkvylW7LM9LmNIFfGlX.png",
          "PNG",
          pageWidth - 50,
          5,
          35,
          35,
        )

        // Separator line (only on first page)
        doc.setDrawColor(200, 200, 200)
        doc.setLineWidth(0.5)
        doc.line(15, 40, pageWidth - 15, 40)
      }

      // Footer with paraphe box (on all pages)
      doc.setDrawColor(0)
      doc.setLineWidth(0.5)
      doc.rect(14, pageHeight - 20, 20, 15)
      doc.setFontSize(8)
      doc.setTextColor(100, 100, 100) // Gray text
      doc.text("Paraphe", 14, pageHeight - 22)

      // Ajout du paraphe
      if (paraphe) {
        doc.addImage(paraphe, "PNG", 14.5, pageHeight - 19.5, 19, 14)
      }

      // Page number (on all pages)
      doc.setFontSize(10)
      doc.text(`Page ${data.pageNumber}`, pageWidth - 25, pageHeight - 10)
    }

    // Add first page header
    addHeaderAndFooter({ pageNumber: 1 })

    // Add event details in two columns
    doc.setFont("helvetica", "normal")
    doc.setFontSize(11)
    doc.setTextColor(0, 0, 0) // Black text
    const leftColumnX = 15
    const rightColumnX = pageWidth / 2 + 10
    const startY = 55
    const lineHeight = 8

    doc.setFont("helvetica", "bold")
    doc.text("OP RADIO :", leftColumnX, startY)
    doc.setFont("helvetica", "normal")
    doc.text(eventDetails.redacteur, leftColumnX + 40, startY)

    doc.setFont("helvetica", "bold")
    doc.text("Poste :", rightColumnX, startY)
    doc.setFont("helvetica", "normal")
    doc.text(eventDetails.poste, rightColumnX + 40, startY)

    doc.setFont("helvetica", "bold")
    doc.text("Fréquence(s) :", leftColumnX, startY + lineHeight)
    doc.setFont("helvetica", "normal")
    doc.text(eventDetails.frequence, leftColumnX + 40, startY + lineHeight)

    doc.setFont("helvetica", "bold")
    doc.text("Responsable :", rightColumnX, startY + lineHeight)
    doc.setFont("helvetica", "normal")
    doc.text(eventDetails.responsable, rightColumnX + 40, startY + lineHeight)

    // Add table
    doc.autoTable({
      head: [["N°", "Appelé", "Appelant", "Heure", "Communications"]],
      body: communications.map((c, index) => [(index + 1).toString(), c.appele, c.appelant, c.heure, c.communication]),
      startY: startY + lineHeight * 3,
      styles: {
        fontSize: 9,
        cellPadding: 2,
      },
      headStyles: {
        fillColor: [220, 220, 220],
        textColor: [50, 50, 50],
        fontStyle: "bold",
        fontSize: 10,
      },
      columnStyles: {
        0: { cellWidth: 10 },
        1: { cellWidth: 25 },
        2: { cellWidth: 25 },
        3: { cellWidth: 30 },
        4: { cellWidth: "auto" },
      },
      didDrawPage: (data) => addHeaderAndFooter(data),
    })

    // Ajout de la date et heure d'exportation
    const exportDate = new Date().toLocaleString("fr-FR", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    })

    // Ajout de la ligne de signature
    const signatureY = doc.autoTable.previous.finalY + 20
    doc.setFontSize(11)
    doc.setTextColor(0, 0, 0) // Noir
    doc.text("Signature :", pageWidth - 80, signatureY, { align: "right" })

    // Ajout de la signature
    if (signature) {
      doc.addImage(signature, "PNG", pageWidth - 75, signatureY + 5, 60, 30)
    }

    // Ajout de la ligne de clôture
    const closingLineY = signatureY + 40
    doc.setDrawColor(0)
    doc.setLineWidth(0.5)
    doc.line(15, closingLineY, pageWidth - 15, closingLineY)

    // Ajout de la date et heure d'exportation
    doc.setFontSize(10)
    doc.setTextColor(100, 100, 100) // Gris
    doc.text(`Ce document a été exporté en date du ${exportDate}`, 15, closingLineY + 10)

    const now = new Date()
    const dateTime = now
      .toLocaleString("fr-FR", {
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
        hour: "2-digit",
        minute: "2-digit",
        hour12: false,
      })
      .replace(/[/:\s]/g, "-")
    const eventName = eventDetails.evenement ? `-${eventDetails.evenement.replace(/[^a-z0-9]/gi, "_")}` : ""
    const fileName = `Cahier_de_veille${eventName}_${dateTime}.pdf`
    doc.save(fileName)
  }

  const sortCommunications = (comms: CommunicationEntry[], column: SortColumn, direction: SortDirection) => {
    if (!direction) return comms

    return [...comms].sort((a, b) => {
      if (column === "heure") {
        return direction === "asc"
          ? new Date(a.heure).getTime() - new Date(b.heure).getTime()
          : new Date(b.heure).getTime() - new Date(a.heure).getTime()
      }
      if (a[column] < b[column]) return direction === "asc" ? -1 : 1
      if (a[column] > b[column]) return direction === "asc" ? 1 : -1
      return 0
    })
  }

  const handleSort = (column: SortColumn) => {
    setSortColumn(column)
    setSortDirection((prev) => {
      if (prev === null) return "asc"
      if (prev === "asc") return "desc"
      return null
    })
  }

  const sortedCommunications = sortCommunications(communications, sortColumn, sortDirection)

  const archiveCahier = async () => {
    try {
      if (!cahierId) {
        throw new Error("Impossible d'archiver un cahier non sauvegardé")
      }

      const { error } = await supabase.from("cahiers_de_veille").update({ archived: true }).eq("id", cahierId)

      if (error) throw error

      alert("Le cahier a été archivé avec succès")
      router.push("/dashboard")
    } catch (error) {
      console.error("Erreur lors de l'archivage du cahier:", error)
      alert("Erreur lors de l'archivage du cahier. Veuillez réessayer.")
    }
  }

  if (isLoading) {
    return <div>Chargement...</div>
  }

  if (error) {
    return (
      <Alert variant="destructive">
        <AlertTitle>Erreur</AlertTitle>
        <AlertDescription>{error}</AlertDescription>
      </Alert>
    )
  }

  return (
    <div className="container mx-auto p-4">
      <div className="flex items-center justify-between gap-4 mb-6">
        <div className="flex items-center gap-4">
          <Image
            src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/logo-removebg-preview-NRXNNyOrizzUkvylW7LM9LmNIFfGlX.png"
            alt="Police de Charleroi"
            width={50}
            height={50}
            className="object-contain"
          />
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold">CAHIER DE VEILLE</h1>
            {eventDetails.evenement && (
              <>
                <span className="text-2xl">-</span>
                <h2 className="text-2xl font-bold">{eventDetails.evenement}</h2>
              </>
            )}
          </div>
        </div>
        <div className="flex gap-2">
          <Button onClick={saveToDB} className="flex items-center gap-2">
            <Save className="h-4 w-4" />
            Sauvegarder
          </Button>
          <Button onClick={exportToPDF} className="flex items-center gap-2">
            <FileDown className="h-4 w-4" />
            Exporter en PDF
          </Button>
          <Button onClick={archiveCahier} className="flex items-center gap-2">
            <Archive className="h-4 w-4" />
            Archiver
          </Button>
          <Button onClick={() => setIsIndicatifsModalOpen(true)} className="flex items-center gap-2">
            <Users className="h-4 w-4" />
            Gérer les indicatifs
          </Button>
        </div>
      </div>
      <div className="grid grid-cols-2 gap-4 mb-4">
        <Input
          name="evenement"
          placeholder="Événement"
          value={eventDetails.evenement}
          onChange={handleEventDetailsChange}
        />
        <Input
          name="redacteur"
          placeholder="Rédacteur"
          value={eventDetails.redacteur}
          onChange={handleEventDetailsChange}
        />
        <Input name="poste" placeholder="Poste" value={eventDetails.poste} onChange={handleEventDetailsChange} />
        <Input
          name="frequence"
          placeholder="Fréquence(s)"
          value={eventDetails.frequence}
          onChange={handleEventDetailsChange}
        />
        <Input
          name="responsable"
          placeholder="Responsable"
          value={eventDetails.responsable}
          onChange={handleEventDetailsChange}
        />
      </div>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>
              <Button variant="ghost" onClick={() => handleSort("appele")} className="h-8 p-0">
                Appelé(s)
                {sortColumn === "appele" &&
                  (sortDirection === "asc" ? (
                    <ArrowUp className="ml-2 h-4 w-4" />
                  ) : sortDirection === "desc" ? (
                    <ArrowDown className="ml-2 h-4 w-4" />
                  ) : (
                    <ArrowUpDown className="ml-2 h-4 w-4" />
                  ))}
              </Button>
            </TableHead>
            <TableHead>
              <Button variant="ghost" onClick={() => handleSort("appelant")} className="h-8 p-0">
                Appelant
                {sortColumn === "appelant" &&
                  (sortDirection === "asc" ? (
                    <ArrowUp className="ml-2 h-4 w-4" />
                  ) : sortDirection === "desc" ? (
                    <ArrowDown className="ml-2 h-4 w-4" />
                  ) : (
                    <ArrowUpDown className="ml-2 h-4 w-4" />
                  ))}
              </Button>
            </TableHead>
            <TableHead>
              <Button variant="ghost" onClick={() => handleSort("heure")} className="h-8 p-0">
                Heure
                {sortColumn === "heure" &&
                  (sortDirection === "asc" ? (
                    <ArrowUp className="ml-2 h-4 w-4" />
                  ) : sortDirection === "desc" ? (
                    <ArrowDown className="ml-2 h-4 w-4" />
                  ) : (
                    <ArrowUpDown className="ml-2 h-4 w-4" />
                  ))}
              </Button>
            </TableHead>
            <TableHead>
              <Button variant="ghost" onClick={() => handleSort("communication")} className="h-8 p-0">
                Communications
                {sortColumn === "communication" &&
                  (sortDirection === "asc" ? (
                    <ArrowUp className="ml-2 h-4 w-4" />
                  ) : sortDirection === "desc" ? (
                    <ArrowDown className="ml-2 h-4 w-4" />
                  ) : (
                    <ArrowUpDown className="ml-2 h-4 w-4" />
                  ))}
              </Button>
            </TableHead>
            <TableHead className="w-[100px]">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {sortedCommunications.map((comm, index) => (
            <TableRow key={index} ref={index === sortedCommunications.length - 1 ? newRowRef : null}>
              <TableCell>
                <SelectOrInput
                  options={indicatifs}
                  value={comm.appele}
                  onChange={(value) => handleCommunicationChange(index, "appele", value)}
                  placeholder="Appelé(s)"
                />
              </TableCell>
              <TableCell>
                <SelectOrInput
                  options={indicatifs}
                  value={comm.appelant}
                  onChange={(value) => handleCommunicationChange(index, "appelant", value)}
                  placeholder="Appelant"
                />
              </TableCell>
              <TableCell>
                <Input
                  value={comm.heure}
                  onChange={(e) => handleCommunicationChange(index, "heure", e.target.value)}
                  readOnly
                />
              </TableCell>
              <TableCell>
                <Input
                  value={comm.communication}
                  onChange={(e) => handleCommunicationChange(index, "communication", e.target.value)}
                  onKeyPress={(e) => handleKeyPress(e, index)}
                />
              </TableCell>
              <TableCell>
                <Button variant="ghost" size="icon" onClick={() => deleteRow(index)} className="h-8 w-8 p-0">
                  <Trash2 className="h-4 w-4" />
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
      <div className="mt-4">
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button onClick={addNewRow} className="p-2">
                <PlusCircle className="h-5 w-5" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>Ajouter une ligne</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>
      <Dialog open={isSaveModalOpen} onOpenChange={setIsSaveModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Sauvegarde réussie</DialogTitle>
            <DialogDescription>
              {cahierId ? "Le cahier a été mis à jour avec succès!" : "Un nouveau cahier a été créé avec succès!"}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              onClick={() => {
                setIsSaveModalOpen(false)
                router.push(`/cahier/${cahierId}`)
              }}
            >
              OK
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      <Dialog open={isIndicatifsModalOpen} onOpenChange={setIsIndicatifsModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Gestion des indicatifs</DialogTitle>
          </DialogHeader>
          <IndicatifsManager
            cahierId={cahierId}
            initialIndicatifs={indicatifs}
            onUpdate={(newIndicatifs) => setIndicatifs(newIndicatifs)}
          />
        </DialogContent>
      </Dialog>
    </div>
  )
}

