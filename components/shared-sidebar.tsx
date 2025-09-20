"use client"

import { Activity, TrendingUp, Users, FileText, DollarSign, Calendar, Package, Briefcase, LogOut, TestTube } from "lucide-react"
import {
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
} from "@/components/ui/sidebar"
import { usePathname } from "next/navigation"
import Link from "next/link"
import { useEffect, useState } from "react"

export function SharedSidebar() {
  const pathname = usePathname()
  const [employeeSession, setEmployeeSession] = useState<{
    id: string
    name: string
    email: string
    position: string
    department: string
    access_level: string
    employee_type: string
    username: string
    last_login: string | null
  } | null>(null)

  useEffect(() => {
    // Check for employee session in localStorage
    const session = localStorage.getItem("employeeSession")
    if (session) {
      try {
        setEmployeeSession(JSON.parse(session))
      } catch (error) {
        console.error("Error parsing employee session:", error)
      }
    }
  }, [])

  const isActive = (path: string) => {
    if (path === "/" && pathname === "/") return true
    if (path !== "/" && pathname.startsWith(path)) return true
    return false
  }

  const handleLogout = () => {
    localStorage.removeItem("employeeSession")
    setEmployeeSession(null)
    window.location.href = "/auth/login"
  }

  return (
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
        {employeeSession && (
          <div className="px-2 py-2 border-t border-sidebar-border">
            <div className="flex items-center justify-between">
              <div className="flex flex-col">
                <span className="text-xs font-medium">{employeeSession.name}</span>
                <span className="text-xs text-muted-foreground">
                  {employeeSession.position} - Type {employeeSession.employee_type}
                </span>
              </div>
              <button
                onClick={handleLogout}
                className="p-1 hover:bg-muted rounded"
                title="Logout"
              >
                <LogOut className="h-3 w-3" />
              </button>
            </div>
          </div>
        )}
      </SidebarHeader>
      <SidebarContent>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton asChild isActive={isActive("/")}>
              <Link href="/">
                <TrendingUp className="h-4 w-4" />
                <span>Dashboard</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
          <SidebarMenuItem>
            <SidebarMenuButton asChild isActive={isActive("/products")}>
              <Link href="/products">
                <Package className="h-4 w-4" />
                <span>Products</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
          <SidebarMenuItem>
            <SidebarMenuButton asChild isActive={isActive("/members")}>
              <Link href="/members">
                <Users className="h-4 w-4" />
                <span>Members</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
          <SidebarMenuItem>
            <SidebarMenuButton asChild isActive={isActive("/employees")}>
              <Link href="/employees">
                <Briefcase className="h-4 w-4" />
                <span>Employees</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
          <SidebarMenuItem>
            <SidebarMenuButton asChild isActive={isActive("/contracts")}>
              <Link href="/contracts">
                <FileText className="h-4 w-4" />
                <span>Contracts</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
          {/* Hide payments section for Type B employees */}
          {(!employeeSession || employeeSession.employee_type !== "B") && (
            <SidebarMenuItem>
              <SidebarMenuButton asChild isActive={isActive("/payments")}>
                <Link href="/payments">
                  <DollarSign className="h-4 w-4" />
                  <span>Payments</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
          )}
          <SidebarMenuItem>
            <SidebarMenuButton asChild isActive={isActive("/schedule")}>
              <Link href="/schedule">
                <Calendar className="h-4 w-4" />
                <span>Schedule</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
          <SidebarMenuItem>
            <SidebarMenuButton asChild isActive={isActive("/payments/test")}>
              <Link href="/payments/test">
                <TestTube className="h-4 w-4" />
                <span>Payment Testing</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarContent>
    </Sidebar>
  )
}
