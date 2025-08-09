import { type NextRequest, NextResponse } from "next/server"
import { updateUserStatus, updateUserLabels } from "@/lib/admin-actions"

export async function PATCH(request: NextRequest, { params }: { params: { userId: string } }) {
  try {
    const { userId } = params
    const { status } = await request.json()

    if (!userId) {
      return NextResponse.json({ success: false, error: "User ID is required" }, { status: 400 })
    }

    if (!status) {
      return NextResponse.json({ success: false, error: "Status is required" }, { status: 400 })
    }

    // Handle admin promotion
    if (status === "admin") {
      await updateUserLabels(userId, ["admin"])
      return NextResponse.json({
        success: true,
        message: "User promoted to admin successfully",
      })
    }

    // Handle status updates (active/suspended)
    if (status === "active" || status === "suspended") {
      await updateUserStatus(userId, status)
      return NextResponse.json({
        success: true,
        message: `User ${status} successfully`,
      })
    }

    return NextResponse.json({ success: false, error: "Invalid status" }, { status: 400 })
  } catch (error) {
    console.error("Error updating user status:", error)
    return NextResponse.json(
      {
        success: false,
        error: "Failed to update user status",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    )
  }
}
