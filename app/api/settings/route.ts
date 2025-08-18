import { type NextRequest, NextResponse } from "next/server"
import { updateAdminSettings } from "@/lib/admin-actions"

export async function PATCH(request: NextRequest) {
  try {
    const { category, settings } = await request.json()

    if (!category || !settings) {
      return NextResponse.json({ success: false, error: "Category and settings are required" }, { status: 400 })
    }

    const updatedSettings = await updateAdminSettings(category, settings)

    return NextResponse.json({
      success: true,
      message: `${category} settings updated successfully`,
      data: updatedSettings,
    })
  } catch (error) {
    console.error("Error updating admin settings:", error)
    return NextResponse.json(
      {
        success: false,
        error: "Failed to update settings",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    )
  }
}
