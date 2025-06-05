"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { supabase } from "@/lib/supabase"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Navigation } from "@/components/Navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { FileText, Clock, Users, PlusCircle } from "lucide-react"
import { Line } from "react-chartjs-2"
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js"

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend)

async function getDashboardData(userId: string) {
  const { data: totalCahiers, error: totalError } = await supabase
    .from("cahiers_de_veille")
    .select("id", { count: "exact" })
    .eq("user_id", userId)
    .eq("archived", false)

  const { data: recentCahiers, error: recentError } = await supabase
    .from("cahiers_de_veille")
    .select("id, evenement, created_at")
    .eq("user_id", userId)
    .eq("archived", false)
    .order("created_at", { ascending: false })
    .limit(5)

  const { data: activityData, error: activityError } = await supabase
    .from("cahiers_de_veille")
    .select("created_at")
    .eq("user_id", userId)
    .eq("archived", false)
    .gte("created_at", new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString())
    .order("created_at", { ascending: true })

  if (totalError || recentError || activityError) {
    console.error("Error fetching dashboard data:", totalError || recentError || activityError)
    return null
  }

  return {
    totalCahiers: totalCahiers.length,
    recentCahiers,
    activityData,
  }
}

export default function Dashboard() {
  const [user, setUser] = useState(null)
  const [dashboardData, setDashboardData] = useState(null)
  const [newEventTitle, setNewEventTitle] = useState("")
  const [isNewEventDialogOpen, setIsNewEventDialogOpen] = useState(false)
  const [redacteurName, setRedacteurName] = useState("")
  const router = useRouter()

  useEffect(() => {
    const fetchUserAndData = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser()
      setUser(user)

      if (user) {
        const data = await getDashboardData(user.id)
        setDashboardData(data)
        getRedacteurName(user.id)
      }
    }

    fetchUserAndData()

    const { data: authListener } = supabase.auth.onAuthStateChange((event, session) => {
      setUser(session?.user ?? null)
      if (session?.user) {
        getDashboardData(session.user.id).then(setDashboardData)
        getRedacteurName(session.user.id)
      } else {
        setDashboardData(null)
        setRedacteurName("")
      }
    })

    return () => {
      authListener.subscription.unsubscribe()
    }
  }, [])

  const getRedacteurName = async (userId) => {
    try {
      const { data, error } = await supabase.from("profiles").select("redacteur_name").eq("id", userId).single()

      if (error) {
        if (error.code === "PGRST116") {
          console.log("Profil non trouvé pour l'utilisateur")
          // Essayer de récupérer depuis les métadonnées utilisateur
          const {
            data: { user },
          } = await supabase.auth.getUser()
          if (user?.user_metadata?.operator_name) {
            setRedacteurName(user.user_metadata.operator_name)
          }
        } else {
          console.error("Error fetching redacteur name:", error)
        }
      } else if (data && data.redacteur_name) {
        setRedacteurName(data.redacteur_name)
      }
    } catch (error) {
      console.error("Error fetching redacteur name:", error)
    }
  }

  const handleNewEventSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (newEventTitle.trim()) {
      router.push(`/new-cahier?title=${encodeURIComponent(newEventTitle.trim())}`)
    }
    setIsNewEventDialogOpen(false)
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString("fr-FR", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  const activityChartData = {
    labels: dashboardData?.activityData.map((item) => formatDate(item.created_at)) || [],
    datasets: [
      {
        label: "Cahiers créés",
        data: dashboardData?.activityData.map((_, index) => index + 1) || [],
        fill: false,
        borderColor: "rgb(75, 192, 192)",
        tension: 0.1,
      },
    ],
  }

  const activityChartOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: "top" as const,
      },
      title: {
        display: true,
        text: "Activité des 30 derniers jours",
      },
    },
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <Navigation />
      <main className="container mx-auto p-4">
        <div className="flex items-center gap-4 mb-6">
          <h1 className="text-2xl font-bold">
            Tableau de bord
            {redacteurName && <span className="font-normal"> - {redacteurName}</span>}
          </h1>
        </div>
        {user ? (
          <>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total des cahiers</CardTitle>
                  <FileText className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{dashboardData?.totalCahiers || 0}</div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Cahiers récents</CardTitle>
                  <Clock className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{dashboardData?.recentCahiers.length || 0}</div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Utilisateurs actifs</CardTitle>
                  <Users className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">1</div>
                </CardContent>
              </Card>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
              <Card>
                <CardHeader>
                  <CardTitle>Activité récente</CardTitle>
                </CardHeader>
                <CardContent>
                  <Line options={activityChartOptions} data={activityChartData} />
                </CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <CardTitle>Cahiers récents</CardTitle>
                </CardHeader>
                <CardContent>
                  {dashboardData?.recentCahiers.length > 0 ? (
                    <ul className="space-y-2">
                      {dashboardData.recentCahiers.map((cahier) => (
                        <li key={cahier.id} className="flex justify-between items-center">
                          <span>
                            {cahier.evenement} -{" "}
                            <span className="text-sm text-gray-500">{formatDate(cahier.created_at)}</span>
                          </span>
                          <div className="space-x-2">
                            <Link href={`/cahier/${cahier.id}`}>
                              <Button variant="outline" size="sm">
                                Voir
                              </Button>
                            </Link>
                          </div>
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p>Vous n'avez pas encore de cahiers.</p>
                  )}
                </CardContent>
              </Card>
            </div>
            <div className="mt-6">
              <Dialog open={isNewEventDialogOpen} onOpenChange={setIsNewEventDialogOpen}>
                <DialogTrigger asChild>
                  <Button className="flex items-center gap-2">
                    <PlusCircle className="h-4 w-4" />
                    Créer un nouveau cahier
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <form onSubmit={handleNewEventSubmit}>
                    <DialogHeader>
                      <DialogTitle>Nouveau Cahier de Veille</DialogTitle>
                      <DialogDescription>
                        Entrez le titre de l'événement pour votre nouveau cahier de veille.
                      </DialogDescription>
                    </DialogHeader>
                    <div className="py-4">
                      <Label htmlFor="eventTitle" className="text-right">
                        Titre de l'événement
                      </Label>
                      <Input
                        id="eventTitle"
                        value={newEventTitle}
                        onChange={(e) => setNewEventTitle(e.target.value)}
                        placeholder="Entrez le titre de l'événement"
                      />
                    </div>
                    <DialogFooter>
                      <Button type="submit">Créer</Button>
                    </DialogFooter>
                  </form>
                </DialogContent>
              </Dialog>
            </div>
          </>
        ) : (
          <div className="bg-white rounded-lg shadow-md p-6">
            <p className="text-xl mb-4">Connectez-vous pour voir votre tableau de bord.</p>
            <Link href="/">
              <Button>Se connecter</Button>
            </Link>
          </div>
        )}
      </main>
    </div>
  )
}
