"use client"

import { useState, useEffect } from "react"
import { createClient } from "@/lib/client"
import {
  Users,
  FileText,
  TrendingUp,
  Activity,
  Calendar,
  DollarSign,
  UserCheck,
  AlertCircle,
  Search,
  Plus,
  Database,
  ExternalLink,
} from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { AuthenticatedLayout, useAuth } from "@/components/authenticated-layout"

interface Member {
  id: string
  name: string
  email: string
  phone: string
  membership_type: string
  status: string
  join_date: string
  last_visit: string
}

interface Contract {
  id: string
  member_id: string
  member_name: string
  contract_type: string
  start_date: string
  end_date: string
  monthly_fee: number
  status: string
}

interface Stats {
  total_members: number
  active_contracts: number
  monthly_revenue: number
  new_members_this_month: number
}

export default function GymDashboard() {
  const { user } = useAuth()
  const [members, setMembers] = useState<Member[]>([])
  const [contracts, setContracts] = useState<Contract[]>([])
  const [stats, setStats] = useState<Stats>({
    total_members: 0,
    active_contracts: 0,
    monthly_revenue: 0,
    new_members_this_month: 0,
  })
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [databaseSetupNeeded, setDatabaseSetupNeeded] = useState(false)

  useEffect(() => {
    const fetchData = async () => {
      try {
        console.log("[v0] Fetching members...")
        const membersRes = await fetch("/api/members?limit=5")
        console.log("[v0] Members response status:", membersRes.status)

        console.log("[v0] Fetching contracts...")
        const contractsRes = await fetch("/api/contracts?limit=5")
        console.log("[v0] Contracts response status:", contractsRes.status)

        console.log("[v0] Fetching stats...")
        const statsRes = await fetch("/api/stats")
        console.log("[v0] Stats response status:", statsRes.status)

        if (membersRes.status === 500 || contractsRes.status === 500) {
          setDatabaseSetupNeeded(true)
        }

        const [membersData, contractsData, statsData] = await Promise.all([
          membersRes.ok ? membersRes.json() : { data: [] },
          contractsRes.ok ? contractsRes.json() : { data: [] },
          statsRes.ok
            ? statsRes.json()
            : {
                data: {
                  members: { total: 0 },
                  contracts: { active: 0 },
                  revenue: { monthly: 0 },
                  recentActivity: [],
                },
              },
        ])

        console.log("[v0] Members data received:", membersData)
        console.log("[v0] Contracts data received:", contractsData)
        console.log("[v0] Stats data received:", statsData)

        const membersArray = membersData.data || []
        const contractsArray = contractsData.data || []
        const statsObject = statsData.data || {}

        console.log("[v0] Members array length:", membersArray.length)
        console.log("[v0] Contracts array length:", contractsArray.length)

        setMembers(membersArray)
        setContracts(contractsArray)
        setStats({
          total_members: statsObject.members?.total || 0,
          active_contracts: statsObject.contracts?.active || 0,
          monthly_revenue: statsObject.revenue?.monthly || 0,
          new_members_this_month: 0, // Will be calculated from recent activity
        })

        console.log("[v0] Final members state:", membersArray)
        console.log("[v0] Final contracts state:", contractsArray)
      } catch (error) {
        console.error("[v0] Error fetching data:", error)
        setDatabaseSetupNeeded(true)
        setStats({
          total_members: 0,
          active_contracts: 0,
          monthly_revenue: 0,
          new_members_this_month: 0,
        })
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [])

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case "active":
        return "bg-primary text-primary-foreground"
      case "pending":
        return "bg-secondary text-secondary-foreground"
      case "expired":
        return "bg-destructive text-destructive-foreground"
      case "inactive":
        return "bg-muted text-muted-foreground"
      default:
        return "bg-muted text-muted-foreground"
    }
  }



  return (
    <AuthenticatedLayout
      title="Dashboard Overview"
      headerActions={
        <>
          <div className="relative">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search members..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-8 w-64"
            />
          </div>
          <Button size="sm" asChild>
            <a href="/members/add">
              <Plus className="h-4 w-4 mr-1" />
              Add Member
            </a>
          </Button>
        </>
      }
    >
      <div className="space-y-6 p-6">
            {databaseSetupNeeded && (
              <Alert className="border-amber-200 bg-amber-50 dark:border-amber-800 dark:bg-amber-950">
                <Database className="h-4 w-4" />
                <AlertTitle>Database Setup Required</AlertTitle>
                <AlertDescription className="mt-2">
                  <p className="mb-3">
                    The database tables need to be created before you can manage members and contracts.
                  </p>
                  <div className="flex items-center gap-2">
                    <Button size="sm" variant="outline" asChild>
                      <a href="/scripts/001_create_gym_tables.sql" target="_blank" rel="noopener noreferrer">
                        <ExternalLink className="h-3 w-3 mr-1" />
                        View SQL Script
                      </a>
                    </Button>
                    <span className="text-xs text-muted-foreground">
                      Run this script in your Supabase SQL editor to create the required tables.
                    </span>
                  </div>
                </AlertDescription>
              </Alert>
            )}

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Members</CardTitle>
                  <Users className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-primary">{stats.total_members}</div>
                  <p className="text-xs text-muted-foreground">+{stats.new_members_this_month} from last month</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Active Contracts</CardTitle>
                  <FileText className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-primary">{stats.active_contracts}</div>
                  <p className="text-xs text-muted-foreground">
                    {Math.round((stats.active_contracts / stats.total_members) * 100)}% of members
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Monthly Revenue</CardTitle>
                  <DollarSign className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-primary">
                    ${(stats.monthly_revenue || 0).toLocaleString()}
                  </div>
                  <p className="text-xs text-muted-foreground">From active memberships</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Member Retention</CardTitle>
                  <TrendingUp className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-primary">87%</div>
                  <Progress value={87} className="mt-2" />
                </CardContent>
              </Card>
            </div>

            <div className="grid gap-6 md:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Users className="h-5 w-5" />
                    Recent Members
                  </CardTitle>
                  <CardDescription>Latest member registrations and activity</CardDescription>
                </CardHeader>
                <CardContent>
                  {loading ? (
                    <div className="space-y-3">
                      {[...Array(3)].map((_, i) => (
                        <div key={i} className="flex items-center space-x-3">
                          <div className="h-10 w-10 rounded-full bg-muted animate-pulse" />
                          <div className="space-y-1 flex-1">
                            <div className="h-4 bg-muted rounded animate-pulse" />
                            <div className="h-3 bg-muted rounded w-2/3 animate-pulse" />
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : members.length > 0 ? (
                    <div className="space-y-4">
                      {members.slice(0, 5).map((member) => (
                        <div key={member.id} className="flex items-center space-x-3">
                          <Avatar>
                            <AvatarImage src={`/placeholder.svg?height=40&width=40&query=${member.name}`} />
                            <AvatarFallback>
                              {member.name
                                .split(" ")
                                .map((n) => n[0])
                                .join("")}
                            </AvatarFallback>
                          </Avatar>
                          <div className="flex-1 space-y-1">
                            <p className="text-sm font-medium leading-none">{member.name}</p>
                            <p className="text-xs text-muted-foreground">{member.membership_type}</p>
                          </div>
                          <Badge className={getStatusColor(member.status)}>{member.status}</Badge>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                      <p className="text-sm text-muted-foreground">No members found</p>
                      <p className="text-xs text-muted-foreground">
                        {databaseSetupNeeded
                          ? "Run the database setup script first"
                          : "Add your first member to get started"}
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <FileText className="h-5 w-5" />
                    Contract Overview
                  </CardTitle>
                  <CardDescription>Current contract statuses and renewals</CardDescription>
                </CardHeader>
                <CardContent>
                  {loading ? (
                    <div className="space-y-3">
                      {[...Array(3)].map((_, i) => (
                        <div key={i} className="flex items-center justify-between">
                          <div className="space-y-1 flex-1">
                            <div className="h-4 bg-muted rounded animate-pulse" />
                            <div className="h-3 bg-muted rounded w-1/2 animate-pulse" />
                          </div>
                          <div className="h-6 w-16 bg-muted rounded animate-pulse" />
                        </div>
                      ))}
                    </div>
                  ) : contracts.length > 0 ? (
                    <div className="space-y-4">
                      {contracts.slice(0, 5).map((contract) => (
                        <div key={contract.id} className="flex items-center justify-between">
                          <div className="space-y-1">
                            <p className="text-sm font-medium">{contract.member_name}</p>
                            <p className="text-xs text-muted-foreground">
                              {contract.contract_type} • ${contract.monthly_fee}/month
                            </p>
                          </div>
                          <Badge className={getStatusColor(contract.status)}>{contract.status}</Badge>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                      <p className="text-sm text-muted-foreground">No contracts found</p>
                      <p className="text-xs text-muted-foreground">
                        {databaseSetupNeeded
                          ? "Run the database setup script first"
                          : "Contracts will appear here once created"}
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>

            <div className="grid gap-6 md:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <DollarSign className="h-5 w-5" />
                    Last Two Payments
                  </CardTitle>
                  <CardDescription>Recent payment transactions</CardDescription>
                </CardHeader>
                <CardContent>
                  {loading ? (
                    <div className="space-y-3">
                      {[...Array(2)].map((_, i) => (
                        <div key={i} className="flex items-center justify-between">
                          <div className="space-y-1 flex-1">
                            <div className="h-4 bg-muted rounded animate-pulse" />
                            <div className="h-3 bg-muted rounded w-1/2 animate-pulse" />
                          </div>
                          <div className="h-6 w-16 bg-muted rounded animate-pulse" />
                        </div>
                      ))}
                    </div>
                  ) : contracts.length > 0 ? (
                    <div className="space-y-4">
                      {contracts.slice(0, 2).map((contract, index) => (
                        <div key={contract.id} className="flex items-center justify-between p-3 rounded-lg border">
                          <div className="space-y-1">
                            <p className="text-sm font-medium">{contract.member_name}</p>
                            <p className="text-xs text-muted-foreground">
                              {new Date(contract.start_date).toLocaleDateString()} • {contract.contract_type}
                            </p>
                          </div>
                          <div className="text-right">
                            <p className="text-sm font-semibold text-primary">${contract.monthly_fee}</p>
                            <Badge variant="outline" className="text-xs">
                              {index === 0 ? "Latest" : "Previous"}
                            </Badge>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <DollarSign className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                      <p className="text-sm text-muted-foreground">No payments found</p>
                      <p className="text-xs text-muted-foreground">Payment history will appear here</p>
                    </div>
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Calendar className="h-5 w-5" />
                    Today's Schedule
                  </CardTitle>
                  <CardDescription>Upcoming classes and appointments</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between p-3 rounded-lg border">
                      <div className="space-y-1">
                        <p className="text-sm font-medium">Morning Yoga</p>
                        <p className="text-xs text-muted-foreground">8:00 AM - 9:00 AM</p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-semibold">12/15</p>
                        <Badge variant="outline" className="text-xs">
                          Available
                        </Badge>
                      </div>
                    </div>
                    <div className="flex items-center justify-between p-3 rounded-lg border">
                      <div className="space-y-1">
                        <p className="text-sm font-medium">HIIT Training</p>
                        <p className="text-xs text-muted-foreground">6:00 PM - 7:00 PM</p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-semibold">20/20</p>
                        <Badge variant="destructive" className="text-xs">
                          Full
                        </Badge>
                      </div>
                    </div>
                    <div className="flex items-center justify-between p-3 rounded-lg border">
                      <div className="space-y-1">
                        <p className="text-sm font-medium">Personal Training</p>
                        <p className="text-xs text-muted-foreground">3:00 PM - 4:00 PM</p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-semibold">1/1</p>
                        <Badge variant="secondary" className="text-xs">
                          Booked
                        </Badge>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Quick Actions</CardTitle>
                <CardDescription>Common tasks and shortcuts for gym management</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4 md:grid-cols-3">
                  <Button className="h-20 flex-col gap-2 bg-transparent" variant="outline">
                    <UserCheck className="h-6 w-6" />
                    <span>Check-in Member</span>
                  </Button>
                  <Button className="h-20 flex-col gap-2 bg-transparent" variant="outline">
                    <Plus className="h-6 w-6" />
                    <span>New Registration</span>
                  </Button>
                  <Button className="h-20 flex-col gap-2 bg-transparent" variant="outline">
                    <AlertCircle className="h-6 w-6" />
                    <span>Renewal Alerts</span>
                  </Button>
                </div>
              </CardContent>
            </Card>
      </div>
    </AuthenticatedLayout>
  )
}
