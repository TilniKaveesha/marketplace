import { type NextRequest, NextResponse } from "next/server"
import { updateOrderStatus } from "@/lib/admin-actions"

export async function PATCH(request: NextRequest, { params }: { params: { orderId: string } }) {
  try {
    const { orderId } = params
    const { status, paymentStatus } = await request.json()

    if (!orderId) {
      return NextResponse.json({ success: false, error: "Order ID is required" }, { status: 400 })
    }

    const updatedOrder = await updateOrderStatus(orderId, status, paymentStatus)

    return NextResponse.json({
      success: true,
      message: `Order ${status} successfully`,
      data: updatedOrder,
    })
  } catch (error) {
    console.error("Error updating order status:", error)
    return NextResponse.json(
      {
        success: false,
        error: "Failed to update order status",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    )
  }
}
