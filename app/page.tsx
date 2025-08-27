"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { AuthenticatedLayout } from "@/components/authenticated-layout"
import { useAuth } from "@/components/authenticated-layout"
import { TrendingUp, Users, FileText, DollarSign, Calendar, Plus } from "lucide-react"
import Link from "next/link"

interface Stats {
  members: number
  contracts: number
  payments: number
  schedule: number
  total: number
}

export default function DashboardPage() {
  const { user } = useAuth()
  const [stats, setStats] = useState<Stats>({
    members: 0,
    contracts: 0,
    payments: 0,
    schedule: 0,
    total: 0
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchStats()
  }, [])

  const fetchStats = async () => {
    try {
      const response = await fetch("/api/stats")
      if (response.ok) {
        const data = await response.json()
        setStats(data)
      }
    } catch (error) {
      console.error("Error fetching stats:", error)
    } finally {
      setLoading(false)
    }
  }

  const statCards = [
    {
      title: "Total Members",
      value: stats.members,
      description: "Active gym members",
      icon: Users,
      href: "/members",
      color: "text-blue-600"
    },
    {
      title: "Active Contracts",
      value: stats.contracts,
      description: "Current contracts",
      icon: FileText,
      href: "/contracts",
      color: "text-green-600"
    },
    {
      title: "Total Payments",
      value: stats.payments,
      description: "Payment transactions",
      icon: DollarSign,
      href: "/payments",
      color: "text-yellow-600"
    },
    {
      title: "Scheduled Classes",
      value: stats.schedule,
      description: "Upcoming classes",
      icon: Calendar,
      href: "/schedule",
      color: "text-purple-600"
    }
  ]

  return (
    <AuthenticatedLayout 
      title="Dashboard"
      showBackButton
      backHref="/"
      headerActions={
        <div className="flex gap-2">
          <Button asChild>
            <Link href="/members/add">
              <Plus className="mr-2 h-4 w-4" />
              Add Member
            </Link>
          </Button>
          <Button asChild variant="outline">
            <Link href="/contracts/add">
              <FileText className="mr-2 h-4 w-4" />
              New Contract
            </Link>
          </Button>
        </div>
      }
    >
      <div className="space-y-6">
        {/* Welcome Section */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-6 w-6" />
              Welcome to AI Gym 24/7
            </CardTitle>
            <CardDescription>
              Smart fitness management system dashboard. Monitor your gym&apos;s performance and manage operations efficiently.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-4">
              <div className="flex-1">
                <p className="text-sm text-muted-foreground">
                  Logged in as: <span className="font-medium">{user?.email}</span>
                </p>
                <p className="text-sm text-muted-foreground mt-1">
                  Last updated: {new Date().toLocaleDateString()}
                </p>
              </div>
              <Badge variant="secondary" className="text-xs">
                {new Date().toLocaleTimeString()}
              </Badge>
            </div>
          </CardContent>
        </Card>

        {/* Stats Overview */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {statCards.map((stat, index) => {
            const IconComponent = stat.icon
            return (
              <Card key={index} className="hover:shadow-md transition-shadow">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
                  <IconComponent className={`h-4 w-4 ${stat.color}`} />
                </CardHeader>
                <CardContent>
                  {loading ? (
                    <div className="h-8 w-16 bg-muted animate-pulse rounded" />
                  ) : (
                    <div className="text-2xl font-bold">{stat.value}</div>
                  )}
                  <p className="text-xs text-muted-foreground mt-1">{stat.description}</p>
                  <Button variant="ghost" size="sm" className="mt-2 p-0 h-auto" asChild>
                    <Link href={stat.href}>
                      View details →
                    </Link>
                  </Button>
                </CardContent>
              </Card>
            )
          })}
        </div>

        {/* Quick Actions */}
        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
            <CardDescription>
              Common tasks and shortcuts for daily operations
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              <Button asChild className="h-auto p-4 flex-col gap-2">
                <Link href="/members/add">
                  <Users className="h-6 w-6" />
                  <span>Add New Member</span>
                </Link>
              </Button>
              <Button asChild variant="outline" className="h-auto p-4 flex-col gap-2">
                <Link href="/contracts/add">
                  <FileText className="h-6 w-6" />
                  <span>Create Contract</span>
                </Link>
              </Button>
              <Button asChild variant="outline" className="h-auto p-4 flex-col gap-2">
                <Link href="/payments">
                  <DollarSign className="h-6 w-6" />
                  <span>View Payments</span>
                </Link>
              </Button>
              <Button asChild variant="outline" className="h-auto p-4 flex-col gap-2">
                <Link href="/schedule">
                  <Calendar className="h-6 w-6" />
                  <span>Class Schedule</span>
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Recent Activity */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
            <CardDescription>
              Latest updates and activities in your gym
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center gap-4 p-3 rounded-lg bg-muted/50">
                <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
                  <Users className="h-4 w-4 text-primary" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium">New member registration</p>
                  <p className="text-xs text-muted-foreground">Member added to the system</p>
                </div>
                <span className="text-xs text-muted-foreground">2 hours ago</span>
              </div>
              <div className="flex items-center gap-4 p-3 rounded-lg bg-muted/50">
                <div className="h-8 w-8 rounded-full bg-green-100 flex items-center justify-center">
                  <FileText className="h-4 w-4 text-green-600" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium">Contract renewed</p>
                  <p className="text-xs text-muted-foreground">Monthly membership extended</p>
                </div>
                <span className="text-xs text-muted-foreground">1 day ago</span>
              </div>
              <div className="flex items-center gap-4 p-3 rounded-lg bg-muted/50">
                <div className="h-8 w-8 rounded-full bg-yellow-100 flex items-center justify-center">
                  <DollarSign className="h-4 w-4 text-yellow-600" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium">Payment received</p>
                  <p className="text-xs text-muted-foreground">Monthly fee payment processed</p>
                </div>
                <span className="text-xs text-muted-foreground">3 days ago</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </AuthenticatedLayout>
  )
}
