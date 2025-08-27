"use client"

import { useState, useEffect } from "react"
import { createClient } from "@/lib/client"
import { useRouter } from "next/navigation"
import { FileText, ArrowLeft, Save, X, Users, Activity, DollarSign, Calendar, TrendingUp } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Alert, AlertDescription } from "@/components/ui/alert"
import {
  SidebarProvider,
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarInset,
  SidebarTrigger,
} from "@/components/ui/sidebar"
import { Separator } from "@/components/ui/separator"


interface Member {
  id: string
  name: string
  email: string
  status: string
}

export default function AddContractPage() {
  const [user, setUser] = useState<any>(null)
  const [authLoading, setAuthLoading] = useState(true)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const [members, setMembers] = useState<Member[]>([])
  const [membersLoading, setMembersLoading] = useState(true)
  const router = useRouter()

  const [formData, setFormData] = useState({
    member_id: "",
    contract_type: "",
    start_date: "",
    end_date: "",
    monthly_fee: "",
    status: "active",
  })

  useEffect(() => {
    const checkAuth = async () => {
      const supabase = createClient()
      const {
        data: { user },
        error,
      } = await supabase.auth.getUser()

      if (error || !user) {
        router.push("/auth/login")
        return
      }

      setUser(user)
      setAuthLoading(false)
    }

    checkAuth()
  }, [router])

  useEffect(() => {
    if (!user || authLoading) return

    const fetchMembers = async () => {
      try {
        const response = await fetch("/api/members?status=active")
        if (response.ok) {
          const data = await response.json()
          setMembers(data.data || [])
        }
      } catch (error) {
        console.error("Error fetching members:", error)
      } finally {
        setMembersLoading(false)
      }
    }

    fetchMembers()
  }, [user, authLoading])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    try {
      const response = await fetch("/api/contracts", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "Failed to create contract")
      }

      setSuccess(true)
      setTimeout(() => {
        router.push("/contracts")
      }, 2000)
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred")
    } finally {
      setLoading(false)
    }
  }

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value,
    }))
  }

  const handleSignOut = async () => {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push("/auth/login")
  }

  if (authLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    )
  }

  if (!user) {
    return null
  }

  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full">
        <Sidebar>
          <SidebarHeader className="border-b border-sidebar-border">
            <div className="flex items-center gap-2 px-2 py-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
                <Activity className="h-4 w-4" />
              </div>
              <div className="flex flex-col">
                <span className="text-sm font-semibold">AI Gym 24/7</span>
                <span className="text-xs text-muted-foreground">Smart Fitness Management</span>
              </div>
            </div>
          </SidebarHeader>
                     <SidebarContent>
             <SidebarMenu>
                               <SidebarMenuItem>
                  <SidebarMenuButton asChild>
                    <a href="/">
                      <TrendingUp className="h-4 w-4" />
                      <span>Dashboard</span>
                    </a>
                  </SidebarMenuButton>
                </SidebarMenuItem>
               <SidebarMenuItem>
                 <SidebarMenuButton asChild>
                   <a href="/members">
                     <Users className="h-4 w-4" />
                     <span>Members</span>
                   </a>
                 </SidebarMenuButton>
               </SidebarMenuItem>
               <SidebarMenuItem>
                 <SidebarMenuButton isActive>
                   <FileText className="h-4 w-4" />
                   <span>Contracts</span>
                 </SidebarMenuButton>
               </SidebarMenuItem>
               <SidebarMenuItem>
                 <SidebarMenuButton asChild>
                   <a href="/payments">
                     <DollarSign className="h-4 w-4" />
                     <span>Payments</span>
                   </a>
                 </SidebarMenuButton>
               </SidebarMenuItem>
               <SidebarMenuItem>
                 <SidebarMenuButton asChild>
                   <a href="/schedule">
                     <Calendar className="h-4 w-4" />
                     <span>Schedule</span>
                   </a>
                 </SidebarMenuButton>
               </SidebarMenuItem>
             </SidebarMenu>
           </SidebarContent>
        </Sidebar>

        <SidebarInset>
          <header className="flex h-16 shrink-0 items-center gap-2 border-b border-border px-4">
            <SidebarTrigger className="-ml-1" />
            <Separator orientation="vertical" className="mr-2 h-4" />
            <div className="flex flex-1 items-center gap-2">
              <Button variant="ghost" size="sm" asChild>
                <a href="/contracts">
                  <ArrowLeft className="h-4 w-4 mr-1" />
                  Back to Contracts
                </a>
              </Button>
              <h1 className="text-lg font-semibold font-serif">Add New Contract</h1>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground">{user.email}</span>
              <Button size="sm" variant="outline" onClick={handleSignOut}>
                Sign Out
              </Button>
            </div>
          </header>

          <main className="flex-1 space-y-6 p-6">
            <div className="max-w-2xl mx-auto">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <FileText className="h-5 w-5" />
                    New Contract Information
                  </CardTitle>
                  <CardDescription>
                    Create a new membership contract for a gym member. All fields marked with * are required.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {error && (
                    <Alert className="mb-6 border-red-200 bg-red-50 dark:border-red-800 dark:bg-red-950">
                      <X className="h-4 w-4" />
                      <AlertDescription>{error}</AlertDescription>
                    </Alert>
                  )}

                  {success && (
                    <Alert className="mb-6 border-green-200 bg-green-50 dark:border-green-800 dark:bg-green-950">
                      <Save className="h-4 w-4" />
                      <AlertDescription>Contract created successfully! Redirecting...</AlertDescription>
                    </Alert>
                  )}

                  <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="space-y-2">
                      <Label htmlFor="member_id">Member *</Label>
                      <Select value={formData.member_id} onValueChange={(value) => handleInputChange("member_id", value)}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select a member" />
                        </SelectTrigger>
                                                 <SelectContent>
                           {membersLoading ? (
                             <SelectItem value="loading" disabled>Loading members...</SelectItem>
                           ) : members.length > 0 ? (
                             members.map((member) => (
                               <SelectItem key={member.id} value={member.id}>
                                 {member.name} ({member.email})
                               </SelectItem>
                             ))
                           ) : (
                             <SelectItem value="no-members" disabled>No active members found</SelectItem>
                           )}
                         </SelectContent>
                      </Select>
                    </div>

                    <div className="grid gap-4 md:grid-cols-2">
                      <div className="space-y-2">
                        <Label htmlFor="contract_type">Contract Type *</Label>
                        <Input
                          id="contract_type"
                          type="text"
                          placeholder="Premium Membership"
                          value={formData.contract_type}
                          onChange={(e) => handleInputChange("contract_type", e.target.value)}
                          required
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="monthly_fee">Monthly Fee ($)</Label>
                        <Input
                          id="monthly_fee"
                          type="number"
                          step="0.01"
                          placeholder="99.99"
                          value={formData.monthly_fee}
                          onChange={(e) => handleInputChange("monthly_fee", e.target.value)}
                        />
                      </div>
                    </div>

                    <div className="grid gap-4 md:grid-cols-2">
                      <div className="space-y-2">
                        <Label htmlFor="start_date">Start Date</Label>
                        <Input
                          id="start_date"
                          type="date"
                          value={formData.start_date}
                          onChange={(e) => handleInputChange("start_date", e.target.value)}
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="end_date">End Date</Label>
                        <Input
                          id="end_date"
                          type="date"
                          value={formData.end_date}
                          onChange={(e) => handleInputChange("end_date", e.target.value)}
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="status">Status</Label>
                      <Select value={formData.status} onValueChange={(value) => handleInputChange("status", value)}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="active">Active</SelectItem>
                          <SelectItem value="pending">Pending</SelectItem>
                          <SelectItem value="expired">Expired</SelectItem>
                          <SelectItem value="inactive">Inactive</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="flex gap-4 pt-4">
                      <Button type="submit" disabled={loading || success || !formData.member_id || !formData.contract_type}>
                        {loading ? (
                          <>
                            <div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent mr-2" />
                            Creating...
                          </>
                        ) : (
                          <>
                            <Save className="h-4 w-4 mr-2" />
                            Create Contract
                          </>
                        )}
                      </Button>
                      <Button type="button" variant="outline" onClick={() => router.push("/contracts")}>
                        Cancel
                      </Button>
                    </div>
                  </form>
                </CardContent>
              </Card>
            </div>
          </main>
        </SidebarInset>
      </div>
    </SidebarProvider>
  )
}
