import { type NextRequest, NextResponse } from "next/server"
import { getAllOrders } from "@/lib/admin-actions"

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const limit = Number.parseInt(searchParams.get("limit") || "1000")
    const offset = Number.parseInt(searchParams.get("offset") || "0")
    const status = searchParams.get("status")

    const orders = await getAllOrders(limit, offset)

    // Apply status filter if provided
    let filteredOrders = orders
    if (status && status !== "all") {
      filteredOrders = orders.filter((order) => order.status === status)
    }

    return NextResponse.json({
      success: true,
      data: filteredOrders,
      total: filteredOrders.length,
    })
  } catch (error) {
    console.error("Error fetching orders:", error)
    return NextResponse.json(
      {
        success: false,
        error: "Failed to fetch orders",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    )
  }
}
