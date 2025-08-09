import { type NextRequest, NextResponse } from "next/server"
import { updateShopStatus } from "@/lib/admin-actions"

export async function PATCH(request: NextRequest, { params }: { params: { shopId: string } }) {
  try {
    const { shopId } = params
    const { status } = await request.json()

    if (!shopId) {
      return NextResponse.json({ success: false, error: "Shop ID is required" }, { status: 400 })
    }

    if (!status) {
      return NextResponse.json({ success: false, error: "Status is required" }, { status: 400 })
    }

    // Validate status
    if (!["active", "pending", "suspended"].includes(status)) {
      return NextResponse.json({ success: false, error: "Invalid status" }, { status: 400 })
    }

    const updatedShop = await updateShopStatus(shopId, status)

    return NextResponse.json({
      success: true,
      message: `Shop ${status} successfully`,
      data: updatedShop,
    })
  } catch (error) {
    console.error("Error updating shop status:", error)
    return NextResponse.json(
      {
        success: false,
        error: "Failed to update shop status",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    )
  }
}
