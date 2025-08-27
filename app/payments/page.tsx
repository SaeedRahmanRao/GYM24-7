"use client"

import { useState, useEffect } from "react"
import { createClient } from "@/lib/client"
import { DollarSign, Search, Filter, Plus, Calendar, CreditCard, Banknote, Activity } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { AuthenticatedLayout } from "@/components/authenticated-layout"

interface Payment {
  id: string
  contract_id: string
  member_id: string
  amount: number
  payment_date: string
  payment_method: string
  status: string
  transaction_id: string
  notes: string
  created_at: string
  members: {
    id: string
    name: string
    email: string
  }
  contracts: {
    id: string
    contract_type: string
    monthly_fee: number
  }
}

export default function PaymentsPage() {
  const [payments, setPayments] = useState<Payment[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [paymentMethodFilter, setPaymentMethodFilter] = useState("all")

  useEffect(() => {
    const fetchPayments = async () => {
      try {
        const response = await fetch("/api/payments")
        if (response.ok) {
          const data = await response.json()
          setPayments(data.data || [])
        }
      } catch (error) {
        console.error("Error fetching payments:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchPayments()
  }, [])

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case "completed":
        return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300"
      case "pending":
        return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300"
      case "failed":
        return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300"
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300"
    }
  }

  const getPaymentMethodIcon = (method: string) => {
    switch (method.toLowerCase()) {
      case "credit_card":
        return <CreditCard className="h-3 w-3" />
      case "bank_transfer":
        return <Banknote className="h-3 w-3" />
      case "cash":
        return <DollarSign className="h-3 w-3" />
      default:
        return <DollarSign className="h-3 w-3" />
    }
  }

  const filteredPayments = payments.filter((payment) => {
    const matchesSearch =
      payment.members.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      payment.transaction_id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      payment.contracts.contract_type.toLowerCase().includes(searchTerm.toLowerCase())

    const matchesStatus = statusFilter === "all" || payment.status.toLowerCase() === statusFilter
    const matchesMethod = paymentMethodFilter === "all" || payment.payment_method.toLowerCase() === paymentMethodFilter

    return matchesSearch && matchesStatus && matchesMethod
  })

  const totalRevenue = payments.reduce((sum, payment) => sum + payment.amount, 0)
  const completedPayments = payments.filter(p => p.status === "completed").length
  const pendingPayments = payments.filter(p => p.status === "pending").length

  return (
    <AuthenticatedLayout 
      title="Payments Management"
      showBackButton={true}
      backHref="/"
      headerActions={
        <Button size="sm">
          <Plus className="h-4 w-4 mr-1" />
          Record Payment
        </Button>
      }
    >
      <div className="space-y-6 p-6">
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
              <div>
                <h2 className="text-2xl font-bold tracking-tight">Payment Overview</h2>
                <p className="text-muted-foreground">Track and manage all payment transactions</p>
              </div>
              <div className="flex items-center gap-2">
                <div className="relative">
                  <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search payments..."
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
                    <SelectItem value="completed">Completed</SelectItem>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="failed">Failed</SelectItem>
                  </SelectContent>
                </Select>
                <Select value={paymentMethodFilter} onValueChange={setPaymentMethodFilter}>
                  <SelectTrigger className="w-40">
                    <Filter className="h-4 w-4 mr-2" />
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Methods</SelectItem>
                    <SelectItem value="credit_card">Credit Card</SelectItem>
                    <SelectItem value="bank_transfer">Bank Transfer</SelectItem>
                    <SelectItem value="cash">Cash</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-4">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
                  <DollarSign className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-primary">${totalRevenue.toLocaleString()}</div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Payments</CardTitle>
                  <Activity className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-primary">{payments.length}</div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Completed</CardTitle>
                  <DollarSign className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-primary">{completedPayments}</div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Pending</CardTitle>
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-primary">{pendingPayments}</div>
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>All Payments</CardTitle>
                <CardDescription>Complete list of payment transactions with details</CardDescription>
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
                ) : filteredPayments.length > 0 ? (
                  <div className="space-y-4">
                    {filteredPayments.map((payment) => (
                      <div
                        key={payment.id}
                        className="flex items-center space-x-4 p-4 border rounded-lg hover:bg-muted/50 transition-colors"
                      >
                        <Avatar className="h-12 w-12">
                          <AvatarImage src={`/placeholder.svg?height=48&width=48&query=${payment.members.name}`} />
                          <AvatarFallback>
                            {payment.members.name
                              .split(" ")
                              .map((n) => n[0])
                              .join("")}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1 space-y-1">
                          <div className="flex items-center gap-2">
                            <p className="text-sm font-medium">{payment.members.name}</p>
                            <Badge variant="outline" className="text-xs">
                              {payment.transaction_id}
                            </Badge>
                          </div>
                          <p className="text-xs text-muted-foreground">
                            {payment.contracts.contract_type} • {new Date(payment.payment_date).toLocaleDateString()}
                          </p>
                          <div className="flex items-center gap-2 text-xs text-muted-foreground">
                            <div className="flex items-center gap-1">
                              {getPaymentMethodIcon(payment.payment_method)}
                              {payment.payment_method.replace("_", " ")}
                            </div>
                          </div>
                        </div>
                        <div className="text-right space-y-1">
                          <p className="text-lg font-semibold text-primary">${payment.amount}</p>
                          <Badge className={getStatusColor(payment.status)}>{payment.status}</Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <DollarSign className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <p className="text-lg font-medium">No payments found</p>
                    <p className="text-sm text-muted-foreground mb-4">
                      {searchTerm || statusFilter !== "all" || paymentMethodFilter !== "all"
                        ? "Try adjusting your search or filter criteria"
                        : "Get started by recording your first payment"}
                    </p>
                    <Button>
                      <Plus className="h-4 w-4 mr-2" />
                      Record Payment
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
      </div>
    </AuthenticatedLayout>
  )
}
