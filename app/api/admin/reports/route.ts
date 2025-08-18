import { type NextRequest, NextResponse } from "next/server"
import { createAdminClient } from "@/lib/appwrite-server"
import { APP_CONFIG } from "@/lib/app-config"
import { Query } from "node-appwrite"

export async function POST(request: NextRequest) {
  try {
    const { type, startDate, endDate, format = "json" } = await request.json()
    const { databases } = await createAdminClient()

    const queries: any[] = [Query.limit(1000)]

    if (startDate) {
      queries.push(Query.greaterThanEqual("$createdAt", startDate))
    }

    if (endDate) {
      queries.push(Query.lessThanEqual("$createdAt", endDate))
    }

    let data: any

    switch (type) {
      case "sales":
        const orders = await databases.listDocuments(
          APP_CONFIG.APPWRITE.DATABASE_ID,
          APP_CONFIG.APPWRITE.ODERS_COLLECTION_ID,
          [...queries, Query.equal("paymentStatus", "completed")],
        )
        data = orders.documents
        break

      case "users":
        const users = await databases.listDocuments(
          APP_CONFIG.APPWRITE.DATABASE_ID,
          APP_CONFIG.APPWRITE.USER_ID,
          queries,
        )
        data = users.documents
        break

      case "inventory":
        const listings = await databases.listDocuments(
          APP_CONFIG.APPWRITE.DATABASE_ID,
          APP_CONFIG.APPWRITE.ITEM_LISTING_ID,
          queries,
        )
        data = listings.documents
        break

      default:
        const [allUsers, allShops, allListings, allOrders] = await Promise.all([
          databases.listDocuments(APP_CONFIG.APPWRITE.DATABASE_ID, APP_CONFIG.APPWRITE.USER_ID, [Query.limit(100)]),
          databases.listDocuments(APP_CONFIG.APPWRITE.DATABASE_ID, APP_CONFIG.APPWRITE.SHOP_ID, [Query.limit(100)]),
          databases.listDocuments(APP_CONFIG.APPWRITE.DATABASE_ID, APP_CONFIG.APPWRITE.ITEM_LISTING_ID, [
            Query.limit(100),
          ]),
          databases.listDocuments(APP_CONFIG.APPWRITE.DATABASE_ID, APP_CONFIG.APPWRITE.ODERS_COLLECTION_ID, [
            Query.limit(100),
          ]),
        ])

        data = {
          users: allUsers.total,
          shops: allShops.total,
          listings: allListings.total,
          orders: allOrders.total,
          summary: {
            totalUsers: allUsers.total,
            totalShops: allShops.total,
            totalListings: allListings.total,
            totalOrders: allOrders.total,
          },
        }
    }

    if (format === "csv") {
      if (Array.isArray(data) && data.length > 0) {
        const headers = Object.keys(data[0]).join(",")
        const rows = data.map((item) => Object.values(item).join(",")).join("\n")
        return new NextResponse(`${headers}\n${rows}`, {
          headers: {
            "Content-Type": "text/csv",
            "Content-Disposition": `attachment; filename="${type}-report.csv"`,
          },
        })
      }
      return new NextResponse("No data available", {
        headers: { "Content-Type": "text/csv" },
      })
    }

    return NextResponse.json({ success: true, data })
  } catch (error) {
    console.error("Error generating report:", error)
    return NextResponse.json({ success: false, error: "Failed to generate report" }, { status: 500 })
  }
}
