import { type NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/server"

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { searchParams } = new URL(request.url)

    const page = Number.parseInt(searchParams.get("page") || "1")
    const limit = Math.min(Number.parseInt(searchParams.get("limit") || "50"), 100)
    const search = searchParams.get("search")
    const category = searchParams.get("category")
    const brand = searchParams.get("brand")

    const offset = (page - 1) * limit

    let query = supabase
      .from("products")
      .select("*", { count: "exact" })
      .order("created_at", { ascending: false })

    if (search) {
      query = query.or(`name.ilike.%${search}%,product_id.ilike.%${search}%,type.ilike.%${search}%,category.ilike.%${search}%`)
    }

    if (category) {
      query = query.eq("category", category)
    }

    if (brand) {
      query = query.eq("brand", brand)
    }

    query = query.range(offset, offset + limit - 1)

    const { data: products, error, count } = await query

    if (error) {
      console.error("[v0] Error fetching products:", error)
      return NextResponse.json({ success: false, error: "Failed to fetch products" }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      data: products,
      pagination: {
        page,
        limit,
        total: count || 0,
        totalPages: Math.ceil((count || 0) / limit),
      },
    })
  } catch (error) {
    console.error("[v0] Products API error:", error)
    return NextResponse.json({ success: false, error: "Internal server error" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    const body = await request.json()

    const {
      name,
      product_id,
      brand,
      type,
      category,
      supplier,
      supplier_email,
      supplier_website,
      gym,
      price = 0,
      cost = 0,
      quantity = 0,
      stock = 0,
      payment_method,
      sale_status,
    } = body

    if (!name) {
      return NextResponse.json({ success: false, error: "Name is required" }, { status: 400 })
    }

    if (payment_method && !['Efectivo','Tarjeta de Crédito','Transferencia Bancaria'].includes(payment_method)) {
      return NextResponse.json({ success: false, error: "Invalid payment method" }, { status: 400 })
    }

    if (sale_status && !['registrado','vendido'].includes(sale_status)) {
      return NextResponse.json({ success: false, error: "Invalid sale status" }, { status: 400 })
    }

    const toNumber = (val: unknown, defaultValue: number | null = 0) => {
      if (val === null || val === undefined) return defaultValue
      if (typeof val === 'number') return Number.isNaN(val) ? defaultValue : val
      const str = String(val)
      if (str.trim() === "") return defaultValue
      const n = Number(str)
      return Number.isNaN(n) ? defaultValue : n
    }

    const sanitizeText = (val: unknown) => {
      if (val === null || val === undefined) return null
      const str = String(val)
      return str.trim() === "" ? null : str
    }

    const toNumericText = (val: unknown, defaultText = '0') => {
      if (val === null || val === undefined) return defaultText
      const str = String(val).trim()
      if (str === "") return defaultText
      return str
    }

    const insertData = {
      name,
      product_id: sanitizeText(product_id) || `prod_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`,
      brand: sanitizeText(brand),
      type: sanitizeText(type),
      category: sanitizeText(category),
      supplier: sanitizeText(supplier),
      supplier_email: sanitizeText(supplier_email),
      supplier_website: sanitizeText(supplier_website),
      gym: sanitizeText(gym),
      price: toNumber(price, 0),
      cost: toNumber(cost, 0),
      quantity: toNumericText(quantity, '0'),
      stock: toNumericText(stock, '0'),
      payment_method: sanitizeText(payment_method),
      sale_status: sanitizeText(sale_status) || 'registrado',
      last_update: new Date().toISOString(),
    }

    const { data: product, error } = await supabase
      .from("products")
      .insert(insertData)
      .select()
      .single()

    if (error) {
      console.error("[v0] Error creating product:", error)
      return NextResponse.json({ success: false, error: "Failed to create product" }, { status: 500 })
    }

    return NextResponse.json({ success: true, data: product })
  } catch (error) {
    console.error("[v0] Create product API error:", error)
    return NextResponse.json({ success: false, error: "Internal server error" }, { status: 500 })
  }
}


