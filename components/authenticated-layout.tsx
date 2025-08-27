"use client"

import { createContext, useContext, useEffect, useState } from "react"
import { createClient } from "@/lib/client"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { SharedSidebar } from "@/components/shared-sidebar"
import { Separator } from "@/components/ui/separator"
import { ArrowLeft, LogOut } from "lucide-react"
import Link from "next/link"

interface User {
  id: string
  email?: string
  user_metadata?: {
    name?: string
  }
}

interface AuthContextType {
  user: User | null
  loading: boolean
  signOut: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}

interface AuthenticatedLayoutProps {
  children: React.ReactNode
  title?: string
  showBackButton?: boolean
  backHref?: string
  headerActions?: React.ReactNode
}

export function AuthenticatedLayout({
  children,
  title,
  showBackButton = false,
  backHref,
  headerActions
}: AuthenticatedLayoutProps) {
  const { user, signOut } = useAuth()

  return (
    <div className="flex min-h-screen w-full">
      <SharedSidebar />
      
      <div className="flex-1 flex flex-col">
        <header className="flex h-16 shrink-0 items-center gap-2 border-b border-border px-4">
          <div className="flex flex-1 items-center gap-2">
            {showBackButton && backHref && (
              <Button variant="ghost" size="sm" asChild>
                <Link href={backHref}>
                  <ArrowLeft className="h-4 w-4 mr-1" />
                  Back
                </Link>
              </Button>
            )}
            {title && <h1 className="text-lg font-semibold">{title}</h1>}
          </div>
          
          <div className="flex items-center gap-2">
            {headerActions}
            <Separator orientation="vertical" className="h-4" />
            <span className="text-sm text-muted-foreground">{user?.email}</span>
            <Button size="sm" variant="outline" onClick={signOut}>
              <LogOut className="h-4 w-4 mr-1" />
              Sign Out
            </Button>
          </div>
        </header>

        <main className="flex-1 space-y-6 p-6">
          {children}
        </main>
      </div>
    </div>
  )
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const router = useRouter()

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
      setLoading(false)
    }

    checkAuth()

    const { data: { subscription } } = createClient().auth.onAuthStateChange(
      async (event, session) => {
        if (event === "SIGNED_OUT") {
          setUser(null)
          router.push("/auth/login")
        } else if (session?.user) {
          setUser(session.user)
        }
      }
    )

    return () => subscription.unsubscribe()
  }, [router])

  const signOut = async () => {
    const supabase = createClient()
    await supabase.auth.signOut()
  }

  if (loading) {
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
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent mx-auto mb-4"></div>
          <p className="text-muted-foreground">Redirecting to login...</p>
        </div>
      </div>
    )
  }

  return (
    <AuthContext.Provider value={{ user, loading, signOut }}>
      {children}
    </AuthContext.Provider>
  )
}

