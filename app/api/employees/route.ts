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

    let query = supabase.from("employees").select("*", { count: "exact" }).order("created_at", { ascending: false })

    if (status) {
      query = query.eq("status", status)
    }

    if (search) {
      query = query.or(`name.ilike.%${search}%,email.ilike.%${search}%,first_name.ilike.%${search}%,paternal_last_name.ilike.%${search}%,position.ilike.%${search}%,department.ilike.%${search}%`)
    }

    query = query.range(offset, offset + limit - 1)

    const { data: employees, error, count } = await query

    if (error) {
      console.error("[v0] Error fetching employees:", error)
      return NextResponse.json({ success: false, error: "Failed to fetch employees" }, { status: 500 })
    }

    console.log("[v0] Employees query result:", {
      employeesCount: employees?.length || 0,
      totalCount: count,
      sampleEmployee: employees?.[0] || null,
    })

    return NextResponse.json({
      success: true,
      data: employees,
      pagination: {
        page,
        limit,
        total: count || 0,
        totalPages: Math.ceil((count || 0) / limit),
      },
    })
  } catch (error) {
    console.error("[v0] Employees API error:", error)
    return NextResponse.json({ success: false, error: "Internal server error" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    const body = await request.json()

    const {
      name,
      position,
      status = "active",
      hire_date,
      paternal_last_name,
      maternal_last_name,
      first_name,
      date_of_birth,
      email,
      primary_phone,
      address_1,
      city,
      state,
      zip_code,
      secondary_phone,
      emergency_contact_name,
      emergency_contact_phone,
      department,
      employee_id,
      salary,
      access_level,
      manager,
      work_schedule,
      skills,
      certifications,
      notes,
      version = "1.0"
    } = body

    if (!name && (!first_name || !paternal_last_name)) {
      return NextResponse.json({ 
        success: false, 
        error: "Either name or both first_name and paternal_last_name are required" 
      }, { status: 400 })
    }

    if (!email) {
      return NextResponse.json({ success: false, error: "Email is required" }, { status: 400 })
    }

    if (!primary_phone) {
      return NextResponse.json({ success: false, error: "Primary phone is required" }, { status: 400 })
    }

    // Generate a unique employee ID if not provided
    const generatedEmployeeId = employee_id || `emp_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`

    // Prepare the employee data with all fields
    const employeeData = {
      name: name || `${first_name} ${paternal_last_name}`.trim(),
      position,
      status,
      hire_date: hire_date || null,
      paternal_last_name,
      maternal_last_name,
      first_name,
      date_of_birth: date_of_birth || null,
      email,
      primary_phone,
      address_1,
      city,
      state,
      zip_code,
      secondary_phone,
      emergency_contact_name,
      emergency_contact_phone,
      department,
      employee_id: generatedEmployeeId,
      salary: salary ? parseFloat(salary) : null,
      access_level,
      manager,
      work_schedule,
      skills,
      certifications,
      notes,
      version
    }

    const { data: employee, error } = await supabase
      .from("employees")
      .insert(employeeData)
      .select()
      .single()

    if (error) {
      console.error("[v0] Error creating employee:", error)
      return NextResponse.json({ success: false, error: "Failed to create employee" }, { status: 500 })
    }

    console.log("[v0] Created new employee:", employee)

    return NextResponse.json({
      success: true,
      data: employee,
    })
  } catch (error) {
    console.error("[v0] Create employee API error:", error)
    return NextResponse.json({ success: false, error: "Internal server error" }, { status: 500 })
  }
}
