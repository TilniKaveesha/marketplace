import { NextResponse } from "next/server"
import { createAdminClient } from "@/lib/appwrite-server"
import { APP_CONFIG } from "@/lib/app-config"
import { Query } from "node-appwrite"

export async function GET() {
  try {
    const { databases, users } = await createAdminClient()

    const [authUsersResponse, shopsResponse, listingsResponse, ordersResponse] = await Promise.all([
      users.list([Query.limit(1)]),
      databases.listDocuments(APP_CONFIG.APPWRITE.DATABASE_ID, APP_CONFIG.APPWRITE.SHOP_ID, [Query.limit(1)]),
      databases.listDocuments(APP_CONFIG.APPWRITE.DATABASE_ID, APP_CONFIG.APPWRITE.ITEM_LISTING_ID, [Query.limit(1)]),
      databases.listDocuments(APP_CONFIG.APPWRITE.DATABASE_ID, APP_CONFIG.APPWRITE.ODERS_COLLECTION_ID, [
        Query.limit(1),
      ]),
    ])

    const stats = {
      totalUsers: authUsersResponse.total,
      totalShops: shopsResponse.total,
      totalListings: listingsResponse.total,
      totalOrders: ordersResponse.total,
    }

    return NextResponse.json({ success: true, data: stats })
  } catch (error) {
    console.error("Error fetching admin stats:", error)
    return NextResponse.json({ success: false, error: "Failed to fetch admin stats" }, { status: 500 })
  }
}
