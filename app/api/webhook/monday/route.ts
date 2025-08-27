import { type NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/server"

interface MondayWebhookPayload {
  type: "create_pulse" | "update_column_value"
  triggerTime: string
  subscriptionId: number
  userId: number
  originalTriggerUuid: string
  boardId: number
  pulseId: number
  pulseName: string
  columnId?: string
  columnType?: string
  value?: {
    label?: {
      index?: number
      text?: string
    }
    date?: {
      date?: string
      time?: string
    }
    text?: string
    email?: {
      email?: string
      text?: string
    }
    phone?: string
    numbers?: string
  }
  previousValue?: any
  changedAt: number
  isTopGroup: boolean
  groupId: string
}

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    const payload: MondayWebhookPayload = await request.json()

    console.log("[v0] Received Monday.com webhook:", JSON.stringify(payload, null, 2))

    await supabase.from("webhook_log").insert({
      webhook_type: payload.type,
      payload: payload,
      status: "received",
    })

    if (payload.type === "create_pulse") {
      await handlePulseCreation(supabase, payload)
    } else if (payload.type === "update_column_value") {
      await handleColumnUpdate(supabase, payload)
    }

    return NextResponse.json({ success: true, message: "Webhook processed successfully" })
  } catch (error) {
    console.error("[v0] Webhook processing error:", error)

    try {
      const supabase = await createClient()
      await supabase.from("webhook_log").insert({
        webhook_type: "error",
        payload: { error: error instanceof Error ? error.message : "Unknown error" },
        status: "error",
        error_message: error instanceof Error ? error.message : "Unknown error",
      })
    } catch (logError) {
      console.error("[v0] Failed to log webhook error:", logError)
    }

    return NextResponse.json({ success: false, error: "Webhook processing failed" }, { status: 500 })
  }
}

async function handlePulseCreation(supabase: any, payload: MondayWebhookPayload) {
  console.log("[v0] Handling pulse creation for:", payload.pulseName)

  // You'll need to configure these board IDs based on your Monday.com setup
  const MEMBERS_BOARD_ID = 123456789 // Replace with actual member board ID
  const CONTRACTS_BOARD_ID = 987654321 // Replace with actual contract board ID

  if (payload.boardId === MEMBERS_BOARD_ID) {
    const { error } = await supabase.from("members").insert({
      monday_member_id: payload.pulseId.toString(),
      name: payload.pulseName,
      status: "active",
    })

    if (error) {
      console.error("[v0] Error creating member:", error)
      throw error
    }

    console.log("[v0] Created new member:", payload.pulseName)
  } else if (payload.boardId === CONTRACTS_BOARD_ID) {
    const { error } = await supabase.from("contracts").insert({
      monday_contract_id: payload.pulseId.toString(),
      contract_type: payload.pulseName,
      status: "active",
    })

    if (error) {
      console.error("[v0] Error creating contract:", error)
      throw error
    }

    console.log("[v0] Created new contract:", payload.pulseName)
  }
}

async function handleColumnUpdate(supabase: any, payload: MondayWebhookPayload) {
  console.log("[v0] Handling column update for pulse:", payload.pulseId)

  const MEMBERS_BOARD_ID = 123456789 // Replace with actual member board ID
  const CONTRACTS_BOARD_ID = 987654321 // Replace with actual contract board ID

  if (payload.boardId === MEMBERS_BOARD_ID) {
    await handleMemberColumnUpdate(supabase, payload)
  } else if (payload.boardId === CONTRACTS_BOARD_ID) {
    await handleContractColumnUpdate(supabase, payload)
  }
}

async function handleMemberColumnUpdate(supabase: any, payload: MondayWebhookPayload) {
  const mondayMemberId = payload.pulseId.toString()
  const updateData: any = { updated_at: new Date().toISOString() }

  switch (payload.columnId) {
    case "email":
      if (payload.value?.email?.email) {
        updateData.email = payload.value.email.email
      }
      break
    case "phone":
      if (payload.value?.phone) {
        updateData.phone = payload.value.phone
      }
      break
    case "status":
      if (payload.value?.label?.text) {
        updateData.status = payload.value.label.text.toLowerCase()
      }
      break
    case "name":
      if (payload.value?.text) {
        updateData.name = payload.value.text
      }
      break
  }

  if (Object.keys(updateData).length > 1) {
    // More than just updated_at
    const { error } = await supabase.from("members").update(updateData).eq("monday_member_id", mondayMemberId)

    if (error) {
      console.error("[v0] Error updating member:", error)
      throw error
    }

    console.log("[v0] Updated member:", mondayMemberId, updateData)
  }
}

async function handleContractColumnUpdate(supabase: any, payload: MondayWebhookPayload) {
  const mondayContractId = payload.pulseId.toString()
  const updateData: any = { updated_at: new Date().toISOString() }

  switch (payload.columnId) {
    case "member":
      // Handle member assignment - you'd need to map Monday member ID to your member ID
      break
    case "start_date":
      if (payload.value?.date?.date) {
        updateData.start_date = payload.value.date.date
      }
      break
    case "end_date":
      if (payload.value?.date?.date) {
        updateData.end_date = payload.value.date.date
      }
      break
    case "monthly_fee":
      if (payload.value?.numbers) {
        updateData.monthly_fee = Number.parseFloat(payload.value.numbers)
      }
      break
    case "status":
      if (payload.value?.label?.text) {
        updateData.status = payload.value.label.text.toLowerCase()
      }
      break
    case "contract_type":
      if (payload.value?.text) {
        updateData.contract_type = payload.value.text
      }
      break
  }

  if (Object.keys(updateData).length > 1) {
    // More than just updated_at
    const { error } = await supabase.from("contracts").update(updateData).eq("monday_contract_id", mondayContractId)

    if (error) {
      console.error("[v0] Error updating contract:", error)
      throw error
    }

    console.log("[v0] Updated contract:", mondayContractId, updateData)
  }
}
