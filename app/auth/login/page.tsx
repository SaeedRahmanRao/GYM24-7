"use client"

import type React from "react"

import { createClient } from "@/lib/client"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useState } from "react"

export default function Page() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()

  // Employee login states
  const [employeeUsername, setEmployeeUsername] = useState("")
  const [employeePassword, setEmployeePassword] = useState("")
  const [employeeError, setEmployeeError] = useState<string | null>(null)
  const [isEmployeeLoading, setIsEmployeeLoading] = useState(false)

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    const supabase = createClient()
    setIsLoading(true)
    setError(null)

    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })
      if (error) throw error
      router.push("/")
    } catch (error: unknown) {
      setError(error instanceof Error ? error.message : "An error occurred")
    } finally {
      setIsLoading(false)
    }
  }

  const handleEmployeeLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsEmployeeLoading(true)
    setEmployeeError(null)

    try {
      const response = await fetch("/api/employee-auth", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          username: employeeUsername,
          password: employeePassword,
        }),
      })

      const result = await response.json()

      if (response.ok && result.success) {
        // Store employee session data
        localStorage.setItem("employeeSession", JSON.stringify(result.data))
        router.push("/")
      } else {
        setEmployeeError(result.error || "Login failed")
      }
    } catch {
      setEmployeeError("An error occurred during login")
    } finally {
      setIsEmployeeLoading(false)
    }
  }

  return (
    <div className="flex min-h-screen w-full items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 p-4">
      <div className="w-full max-w-md">
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold text-foreground">AI Gym 24/7</h1>
          <p className="text-muted-foreground mt-2">Smart Fitness Management</p>
        </div>
        
        <Card className="w-full">
          <CardHeader className="space-y-1">
            <CardTitle className="text-2xl text-center">Login</CardTitle>
            <CardDescription className="text-center">
              Choose your login method below
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="admin" className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="admin">Admin</TabsTrigger>
                <TabsTrigger value="employee">Employee</TabsTrigger>
              </TabsList>
              
              <TabsContent value="admin" className="space-y-4">
                <form onSubmit={handleLogin} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="m@example.com"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="password">Password</Label>
                    <Input
                      id="password"
                      type="password"
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                    />
                  </div>
                  {error && (
                    <div className="text-sm text-red-500 bg-red-50 dark:bg-red-950 p-3 rounded-md">
                      {error}
                    </div>
                  )}
                  <Button type="submit" className="w-full" disabled={isLoading}>
                    {isLoading ? "Logging in..." : "Login"}
                  </Button>
                </form>
                <div className="mt-6 text-center text-sm">
                  Don&apos;t have an account?{" "}
                  <Link href="/auth/sign-up" className="text-primary hover:underline">
                    Sign up
                  </Link>
                </div>
              </TabsContent>
              
              <TabsContent value="employee" className="space-y-4">
                <form onSubmit={handleEmployeeLogin} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="employee-username">Username</Label>
                    <Input
                      id="employee-username"
                      type="text"
                      placeholder="Enter your username"
                      required
                      value={employeeUsername}
                      onChange={(e) => setEmployeeUsername(e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="employee-password">Password</Label>
                    <Input
                      id="employee-password"
                      type="password"
                      required
                      value={employeePassword}
                      onChange={(e) => setEmployeePassword(e.target.value)}
                    />
                  </div>
                  {employeeError && (
                    <div className="text-sm text-red-500 bg-red-50 dark:bg-red-950 p-3 rounded-md">
                      {employeeError}
                    </div>
                  )}
                  <Button type="submit" className="w-full" disabled={isEmployeeLoading}>
                    {isEmployeeLoading ? "Logging in..." : "Employee Login"}
                  </Button>
                </form>
                <div className="mt-6 text-center text-sm text-muted-foreground">
                  Employee access with different permission levels
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
