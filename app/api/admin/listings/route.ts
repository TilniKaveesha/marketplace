import { type NextRequest, NextResponse } from "next/server"
import { getAllListings } from "@/lib/admin-actions"

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const limit = Number.parseInt(searchParams.get("limit") || "1000")
    const offset = Number.parseInt(searchParams.get("offset") || "0")
    const status = searchParams.get("status")
    const category = searchParams.get("category")
    const search = searchParams.get("search")

    const listings = await getAllListings(limit, offset)

    // Apply filters
    let filteredListings = listings

    if (status && status !== "all") {
      filteredListings = filteredListings.filter((listing) => listing.status === status)
    }

    if (category && category !== "all") {
      filteredListings = filteredListings.filter((listing) => listing.category === category)
    }

    if (search) {
      const searchLower = search.toLowerCase()
      filteredListings = filteredListings.filter(
        (listing) =>
          listing.title.toLowerCase().includes(searchLower) ||
          listing.description.toLowerCase().includes(searchLower) ||
          listing.sellerName.toLowerCase().includes(searchLower),
      )
    }

    return NextResponse.json({
      success: true,
      data: filteredListings,
      total: filteredListings.length,
    })
  } catch (error) {
    console.error("Error fetching listings:", error)
    return NextResponse.json(
      {
        success: false,
        error: "Failed to fetch listings",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    )
  }
}
