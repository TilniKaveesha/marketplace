import { type NextRequest, NextResponse } from "next/server"
import { getAnalyticsData } from "@/lib/admin-actions"

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const period = searchParams.get("period") || "30d"

    const analytics = await getAnalyticsData(period)

    return NextResponse.json({
      success: true,
      data: analytics,
    })
  } catch (error) {
    console.error("Error fetching analytics:", error)
    return NextResponse.json(
      {
        success: false,
        error: "Failed to fetch analytics",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    )
  }
}
