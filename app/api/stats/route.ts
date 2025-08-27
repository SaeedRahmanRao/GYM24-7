import { type NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/server"

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()

    const [
      { count: totalMembers },
      { count: activeMembers },
      { count: totalContracts },
      { count: activeContracts },
      { count: totalPayments },
      { count: totalClasses },
      { data: recentWebhooks },
    ] = await Promise.all([
      supabase.from("members").select("*", { count: "exact", head: true }),
      supabase.from("members").select("*", { count: "exact", head: true }).eq("status", "active"),
      supabase.from("contracts").select("*", { count: "exact", head: true }),
      supabase.from("contracts").select("*", { count: "exact", head: true }).eq("status", "active"),
      supabase.from("payments").select("*", { count: "exact", head: true }),
      supabase.from("schedule").select("*", { count: "exact", head: true }),
      supabase
        .from("webhook_log")
        .select("webhook_type, processed_at, status")
        .order("processed_at", { ascending: false })
        .limit(10),
    ])

    const { data: activeContractsData } = await supabase
      .from("contracts")
      .select("monthly_fee")
      .eq("status", "active")
      .not("monthly_fee", "is", null)

    const monthlyRevenue =
      activeContractsData?.reduce((sum, contract) => {
        return sum + (Number.parseFloat(contract.monthly_fee?.toString() || "0") || 0)
      }, 0) || 0

    return NextResponse.json({
      success: true,
      data: {
        members: {
          total: totalMembers || 0,
          active: activeMembers || 0,
          inactive: (totalMembers || 0) - (activeMembers || 0),
        },
        contracts: {
          total: totalContracts || 0,
          active: activeContracts || 0,
          inactive: (totalContracts || 0) - (activeContracts || 0),
        },
        payments: {
          total: totalPayments || 0,
        },
        schedule: {
          total: totalClasses || 0,
        },
        revenue: {
          monthly: monthlyRevenue,
          currency: "USD", // You can make this configurable
        },
        recentActivity: recentWebhooks || [],
      },
    })
  } catch (error) {
    console.error("[v0] Stats API error:", error)
    return NextResponse.json({ success: false, error: "Failed to fetch statistics" }, { status: 500 })
  }
}
