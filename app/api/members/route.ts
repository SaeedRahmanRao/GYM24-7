import { type NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/server"

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { searchParams } = new URL(request.url)

    const page = Number.parseInt(searchParams.get("page") || "1")
    const limit = Math.min(Number.parseInt(searchParams.get("limit") || "50"), 100) // Max 100 per page
    const status = searchParams.get("status")
    const search = searchParams.get("search")

    const offset = (page - 1) * limit

    let query = supabase.from("members").select("*", { count: "exact" }).order("created_at", { ascending: false })

    if (status) {
      query = query.eq("status", status)
    }

    if (search) {
      query = query.or(`name.ilike.%${search}%,email.ilike.%${search}%`)
    }

    query = query.range(offset, offset + limit - 1)

    const { data: members, error, count } = await query

    if (error) {
      console.error("[v0] Error fetching members:", error)
      return NextResponse.json({ success: false, error: "Failed to fetch members" }, { status: 500 })
    }

    console.log("[v0] Members query result:", {
      membersCount: members?.length || 0,
      totalCount: count,
      sampleMember: members?.[0] || null,
    })

    return NextResponse.json({
      success: true,
      data: members,
      pagination: {
        page,
        limit,
        total: count || 0,
        totalPages: Math.ceil((count || 0) / limit),
      },
    })
  } catch (error) {
    console.error("[v0] Members API error:", error)
    return NextResponse.json({ success: false, error: "Internal server error" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    const body = await request.json()

    const { name, email, phone, status = "active" } = body

    if (!name) {
      return NextResponse.json({ success: false, error: "Name is required" }, { status: 400 })
    }

    // Generate a unique Monday.com member ID (in real scenario, this would come from Monday.com)
    const mondayMemberId = `member_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`

    const { data: member, error } = await supabase
      .from("members")
      .insert({
        monday_member_id: mondayMemberId,
        name,
        email,
        phone,
        status,
      })
      .select()
      .single()

    if (error) {
      console.error("[v0] Error creating member:", error)
      return NextResponse.json({ success: false, error: "Failed to create member" }, { status: 500 })
    }

    console.log("[v0] Created new member:", member)

    return NextResponse.json({
      success: true,
      data: member,
    })
  } catch (error) {
    console.error("[v0] Create member API error:", error)
    return NextResponse.json({ success: false, error: "Internal server error" }, { status: 500 })
  }
}
