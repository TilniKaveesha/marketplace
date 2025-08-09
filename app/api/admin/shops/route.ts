import { type NextRequest, NextResponse } from "next/server"
import { getAllShops } from "@/lib/admin-actions"

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const limit = Number.parseInt(searchParams.get("limit") || "1000")
    const offset = Number.parseInt(searchParams.get("offset") || "0")

    const shops = await getAllShops(limit, offset)

    return NextResponse.json({
      success: true,
      data: shops,
      total: shops.length,
    })
  } catch (error) {
    console.error("Error fetching shops:", error)
    return NextResponse.json(
      {
        success: false,
        error: "Failed to fetch shops",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    )
  }
}
