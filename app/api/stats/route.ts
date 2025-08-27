import { createClient } from "@/lib/server"

export async function GET() {
  const supabase = createClient()

  try {
    // Get counts for all tables
    const [membersResult, contractsResult, paymentsResult, scheduleResult] = await Promise.all([
      supabase.from("members").select("*", { count: "exact", head: true }),
      supabase.from("contracts").select("*", { count: "exact", head: true }),
      supabase.from("payments").select("*", { count: "exact", head: true }),
      supabase.from("schedule").select("*", { count: "exact", head: true })
    ])

    const stats = {
      members: membersResult.count || 0,
      contracts: contractsResult.count || 0,
      payments: paymentsResult.count || 0,
      schedule: scheduleResult.count || 0,
      total: (membersResult.count || 0) + (contractsResult.count || 0) + (paymentsResult.count || 0) + (scheduleResult.count || 0)
    }

    return Response.json(stats)
  } catch (error) {
    console.error("Error fetching stats:", error)
    return Response.json({ error: "Failed to fetch stats" }, { status: 500 })
  }
}
