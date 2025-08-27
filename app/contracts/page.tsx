"use client"

import { useState, useEffect } from "react"
import { createClient } from "@/lib/client"
import { FileText, Search, Filter, Plus, Calendar, DollarSign, Activity } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { AuthenticatedLayout } from "@/components/authenticated-layout"

interface Contract {
  id: string
  monday_contract_id: string
  member_id: string
  contract_type: string
  start_date: string
  end_date: string
  monthly_fee: number
  status: string
  created_at: string
  updated_at: string
  members: {
    id: string
    name: string
    email: string
    status: string
  }
}

export default function ContractsPage() {
  const [contracts, setContracts] = useState<Contract[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")

  useEffect(() => {
    const fetchContracts = async () => {
      try {
        const response = await fetch("/api/contracts")
        if (response.ok) {
          const data = await response.json()
          setContracts(data.data || [])
        }
      } catch (error) {
        console.error("Error fetching contracts:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchContracts()
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

  const filteredContracts = contracts.filter((contract) => {
    const matchesSearch =
      contract.members.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      contract.contract_type.toLowerCase().includes(searchTerm.toLowerCase()) ||
      contract.monday_contract_id.toLowerCase().includes(searchTerm.toLowerCase())

    const matchesStatus = statusFilter === "all" || contract.status.toLowerCase() === statusFilter.toLowerCase()

    return matchesSearch && matchesStatus
  })

  return (
    <AuthenticatedLayout 
      title="Contracts Management"
      headerActions={
        <Button size="sm" asChild>
          <a href="/contracts/add">
            <Plus className="h-4 w-4 mr-1" />
            New Contract
          </a>
        </Button>
      }
    >
      <div className="space-y-6 p-6">
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
              <div>
                <h2 className="text-2xl font-bold tracking-tight">Contract Overview</h2>
                <p className="text-muted-foreground">Manage and monitor all member contracts</p>
              </div>
              <div className="flex items-center gap-2">
                <div className="relative">
                  <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search contracts..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-8 w-64"
                  />
                </div>
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="w-32">
                    <Filter className="h-4 w-4 mr-2" />
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="expired">Expired</SelectItem>
                    <SelectItem value="inactive">Inactive</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-4">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Contracts</CardTitle>
                  <FileText className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-primary">{contracts.length}</div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Active Contracts</CardTitle>
                  <Activity className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-primary">
                    {contracts.filter((c) => c.status === "active").length}
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Monthly Revenue</CardTitle>
                  <DollarSign className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-primary">
                    $
                    {contracts
                      .filter((c) => c.status === "active")
                      .reduce((sum, c) => sum + c.monthly_fee, 0)
                      .toLocaleString()}
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Expiring Soon</CardTitle>
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-primary">
                    {
                      contracts.filter((c) => {
                        const endDate = new Date(c.end_date)
                        const thirtyDaysFromNow = new Date()
                        thirtyDaysFromNow.setDate(thirtyDaysFromNow.getDate() + 30)
                        return endDate <= thirtyDaysFromNow && c.status === "active"
                      }).length
                    }
                  </div>
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>All Contracts</CardTitle>
                <CardDescription>Complete list of member contracts with details and status</CardDescription>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <div className="space-y-4">
                    {[...Array(5)].map((_, i) => (
                      <div key={i} className="flex items-center space-x-4 p-4 border rounded-lg">
                        <div className="h-12 w-12 rounded-full bg-muted animate-pulse" />
                        <div className="space-y-2 flex-1">
                          <div className="h-4 bg-muted rounded animate-pulse" />
                          <div className="h-3 bg-muted rounded w-2/3 animate-pulse" />
                        </div>
                        <div className="h-6 w-16 bg-muted rounded animate-pulse" />
                      </div>
                    ))}
                  </div>
                ) : filteredContracts.length > 0 ? (
                  <div className="space-y-4">
                    {filteredContracts.map((contract) => (
                      <div
                        key={contract.id}
                        className="flex items-center space-x-4 p-4 border rounded-lg hover:bg-muted/50 transition-colors"
                      >
                        <Avatar>
                          <AvatarImage src={`/placeholder.svg?height=48&width=48&query=${contract.members.name}`} />
                          <AvatarFallback>
                            {contract.members.name
                              .split(" ")
                              .map((n) => n[0])
                              .join("")}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1 space-y-1">
                          <div className="flex items-center gap-2">
                            <p className="text-sm font-medium">{contract.members.name}</p>
                            <Badge variant="outline" className="text-xs">
                              {contract.monday_contract_id}
                            </Badge>
                          </div>
                          <p className="text-xs text-muted-foreground">
                            {contract.contract_type} • ${contract.monthly_fee}/month
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {new Date(contract.start_date).toLocaleDateString()} -{" "}
                            {new Date(contract.end_date).toLocaleDateString()}
                          </p>
                        </div>
                        <div className="text-right space-y-1">
                          <Badge className={getStatusColor(contract.status)}>{contract.status}</Badge>
                          <p className="text-xs text-muted-foreground">
                            {Math.ceil(
                              (new Date(contract.end_date).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24),
                            )}{" "}
                            days left
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <p className="text-lg font-medium">No contracts found</p>
                    <p className="text-sm text-muted-foreground mb-4">
                      {searchTerm || statusFilter !== "all"
                        ? "Try adjusting your search or filter criteria"
                        : "Get started by creating your first contract"}
                    </p>
                    <Button asChild>
                      <a href="/contracts/add">
                        <Plus className="h-4 w-4 mr-2" />
                        Create Contract
                      </a>
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
      </div>
    </AuthenticatedLayout>
  )
}
