import { createAdminClient } from "./appwrite-server"
import { APP_CONFIG } from "./app-config"
import { Query } from "node-appwrite"

// Constants
const DEFAULT_LIMIT = 1000
const DEFAULT_OFFSET = 0

// Interfaces
export interface AdminStats {
  totalUsers: number
  totalShops: number
  totalListings: number
  totalOrders: number
}

export interface AuthUser {
  $id: string
  name: string
  email: string
  phone?: string
  status: boolean
  registration: string
  emailVerification: boolean
  phoneVerification: boolean
  labels: string[]
  prefs: any
}

export interface CustomUser {
  $id: string
  userId: string
  Phone: string
  IdNumber: string
  $createdAt: string
  $updatedAt: string
}

export interface CombinedUser {
  $id: string
  name: string
  email: string
  phone?: string
  customPhone?: string
  idNumber?: string
  status: "active" | "suspended" | "banned"
  role: "user" | "seller" | "admin"
  $createdAt: string
  $updatedAt: string
  labels?: string[]
  emailVerified: boolean
  phoneVerified: boolean
}

export interface Shop {
  $id: string
  ShopName: string
  Description?: string
  userId: string
  ownerName?: string
  ownerEmail?: string
  status: "active" | "pending" | "suspended"
  logo?: string
  totalListings?: number
  $createdAt: string
  $updatedAt: string
}

export interface Listing {
  $id: string
  title: string
  description: string
  price: number
  images: string[]
  category: string
  status: "active" | "pending" | "rejected" | "sold"
  sellerName: string
  sellerId: string
  $createdAt: string
  $updatedAt: string
}

export interface Order {
  $id: string
  buyerId: string
  sellerId: string
  listingId: string
  totalAmount: number
  status: "pending" | "completed" | "cancelled"
  $createdAt: string
  $updatedAt: string
}

// Helper function to create absolute URLs for server-side fetch calls
// function createAbsoluteUrl(path: string): string {
//   return `${APP_CONFIG.BASE_URL}${path}`
// }

// Get overall admin stats
export async function getAdminStats() {
  try {
    const { databases } = await createAdminClient()

    // Get counts from each collection
    const [usersResult, shopsResult, listingsResult, ordersResult] = await Promise.all([
      databases.listDocuments(APP_CONFIG.APPWRITE.DATABASE_ID, APP_CONFIG.APPWRITE.USER_ID, [Query.limit(1)]),
      databases.listDocuments(APP_CONFIG.APPWRITE.DATABASE_ID, APP_CONFIG.APPWRITE.SHOP_ID, [Query.limit(1)]),
      databases.listDocuments(APP_CONFIG.APPWRITE.DATABASE_ID, APP_CONFIG.APPWRITE.ITEM_LISTING_ID, [Query.limit(1)]),
      databases.listDocuments(APP_CONFIG.APPWRITE.DATABASE_ID, APP_CONFIG.APPWRITE.ODERS_COLLECTION_ID, [
        Query.limit(1),
      ]),
    ])

    return {
      totalUsers: usersResult.total,
      totalShops: shopsResult.total,
      totalListings: listingsResult.total,
      totalOrders: ordersResult.total,
    }
  } catch (error) {
    console.error("Error fetching admin stats:", error)
    return {
      totalUsers: 0,
      totalShops: 0,
      totalListings: 0,
      totalOrders: 0,
    }
  }
}

// Get all users (combining auth users with custom user data)
export async function getAllUsers(limit = DEFAULT_LIMIT, offset = DEFAULT_OFFSET): Promise<CombinedUser[]> {
  try {
    const { databases, users } = await createAdminClient()

    // Get auth users
    const authUsers = await users.list([Query.limit(limit), Query.offset(offset)])

    // Get custom user data
    const customUsersResult = await databases.listDocuments(
      APP_CONFIG.APPWRITE.DATABASE_ID,
      APP_CONFIG.APPWRITE.USER_ID,
      [Query.limit(limit), Query.offset(offset)],
    )

    // Combine auth users with custom user data
    const combinedUsers: CombinedUser[] = authUsers.users.map((authUser) => {
      const customUser = customUsersResult.documents.find((cu: any) => cu.userId === authUser.$id)

      return {
        $id: authUser.$id,
        name: authUser.name,
        email: authUser.email,
        phone: authUser.phone,
        customPhone: customUser?.Phone,
        idNumber: customUser?.IdNumber,
        status: authUser.status ? "active" : "suspended",
        role: authUser.labels?.includes("admin") ? "admin" : authUser.labels?.includes("seller") ? "seller" : "user",
        $createdAt: authUser.registration,
        $updatedAt: customUser?.$updatedAt || authUser.registration,
        labels: authUser.labels,
        emailVerified: authUser.emailVerification,
        phoneVerified: authUser.phoneVerification,
      }
    })

    return combinedUsers
  } catch (error) {
    console.error("Failed to get users:", error)
    throw error
  }
}

// Get all shops (with owner information)
export async function getAllShops(limit = DEFAULT_LIMIT, offset = DEFAULT_OFFSET): Promise<Shop[]> {
  try {
    const { databases, users } = await createAdminClient()

    const shopsResult = await databases.listDocuments(APP_CONFIG.APPWRITE.DATABASE_ID, APP_CONFIG.APPWRITE.SHOP_ID, [
      Query.limit(limit),
      Query.offset(offset),
    ])

    // Enrich shops with owner information
    const shopsWithOwners: Shop[] = await Promise.all(
      shopsResult.documents.map(async (shop: any) => {
        try {
          const owner = await users.get(shop.userId)
          return {
            $id: shop.$id,
            ShopName: shop.ShopName,
            Description: shop.Description,
            userId: shop.userId,
            ownerName: owner.name,
            ownerEmail: owner.email,
            status: shop.status || "active",
            logo: shop.logo,
            totalListings: shop.totalListings,
            $createdAt: shop.$createdAt,
            $updatedAt: shop.$updatedAt,
          }
        } catch (error) {
          // If owner not found, return shop without owner info
          return {
            $id: shop.$id,
            ShopName: shop.ShopName,
            Description: shop.Description,
            userId: shop.userId,
            status: shop.status || "active",
            logo: shop.logo,
            totalListings: shop.totalListings,
            $createdAt: shop.$createdAt,
            $updatedAt: shop.$updatedAt,
          }
        }
      }),
    )

    return shopsWithOwners
  } catch (error) {
    console.error("Failed to get shops:", error)
    throw error
  }
}

// Get all listings
export async function getAllListings(limit = DEFAULT_LIMIT, offset = DEFAULT_OFFSET): Promise<Listing[]> {
  try {
    const { databases } = await createAdminClient()

    const listingsResult = await databases.listDocuments(
      APP_CONFIG.APPWRITE.DATABASE_ID,
      APP_CONFIG.APPWRITE.ITEM_LISTING_ID,
      [Query.limit(limit), Query.offset(offset)],
    )

    const listings: Listing[] = listingsResult.documents.map((listing: any) => ({
      $id: listing.$id,
      title: listing.title,
      description: listing.description,
      price: listing.price,
      images: Array.isArray(listing.images) ? listing.images : JSON.parse(listing.images || "[]"),
      category: listing.category,
      status: listing.status || "active",
      sellerName: listing.sellerName,
      sellerId: listing.sellerId,
      $createdAt: listing.$createdAt,
      $updatedAt: listing.$updatedAt,
    }))

    return listings
  } catch (error) {
    console.error("Failed to get listings:", error)
    throw error
  }
}

// Get all orders
export async function getAllOrders(limit = DEFAULT_LIMIT, offset = DEFAULT_OFFSET): Promise<Order[]> {
  try {
    const { databases } = await createAdminClient()

    const ordersResult = await databases.listDocuments(
      APP_CONFIG.APPWRITE.DATABASE_ID,
      APP_CONFIG.APPWRITE.ODERS_COLLECTION_ID,
      [Query.limit(limit), Query.offset(offset)],
    )

    const orders: Order[] = ordersResult.documents.map((order: any) => ({
      $id: order.$id,
      buyerId: order.userId,
      sellerId: order.shopId,
      listingId: order.listingId,
      totalAmount: order.amount,
      status: order.status,
      $createdAt: order.$createdAt,
      $updatedAt: order.$updatedAt,
    }))

    return orders
  } catch (error) {
    console.error("Error fetching orders:", error)
    throw error
  }
}

// Update user status (auth user)
export async function updateUserStatus(userId: string, status: "active" | "suspended"): Promise<boolean> {
  try {
    const { users } = await createAdminClient()
    await users.updateStatus(userId, status === "active")
    return true
  } catch (error) {
    console.error("Failed to update user status:", error)
    throw error
  }
}

// Update user labels (for admin role)
export async function updateUserLabels(userId: string, labels: string[]): Promise<boolean> {
  try {
    const { users } = await createAdminClient()
    await users.updateLabels(userId, labels)
    return true
  } catch (error) {
    console.error("Failed to update user labels:", error)
    return false
  }
}

// Update shop status
export async function updateShopStatus(shopId: string, status: Shop["status"]): Promise<Shop | null> {
  try {
    const { databases } = await createAdminClient()

    const updatedShop = await databases.updateDocument(
      APP_CONFIG.APPWRITE.DATABASE_ID,
      APP_CONFIG.APPWRITE.SHOP_ID,
      shopId,
      { status },
    )

    return {
      $id: updatedShop.$id,
      ShopName: updatedShop.ShopName,
      Description: updatedShop.Description,
      userId: updatedShop.userId,
      status: updatedShop.status,
      logo: updatedShop.logo,
      totalListings: updatedShop.totalListings,
      $createdAt: updatedShop.$createdAt,
      $updatedAt: updatedShop.$updatedAt,
    }
  } catch (error) {
    console.error("Failed to update shop status:", error)
    throw error
  }
}

// Update listing status
export async function updateListingStatus(listingId: string, status: Listing["status"]): Promise<Listing | null> {
  try {
    const { databases } = await createAdminClient()

    const updatedListing = await databases.updateDocument(
      APP_CONFIG.APPWRITE.DATABASE_ID,
      APP_CONFIG.APPWRITE.ITEM_LISTING_ID,
      listingId,
      { status },
    )

    return {
      $id: updatedListing.$id,
      title: updatedListing.title,
      description: updatedListing.description,
      price: updatedListing.price,
      images: Array.isArray(updatedListing.images) ? updatedListing.images : JSON.parse(updatedListing.images || "[]"),
      category: updatedListing.category,
      status: updatedListing.status,
      sellerName: updatedListing.sellerName,
      sellerId: updatedListing.sellerId,
      $createdAt: updatedListing.$createdAt,
      $updatedAt: updatedListing.$updatedAt,
    }
  } catch (error) {
    console.error("Failed to update listing status:", error)
    throw error
  }
}

// Update order status
export async function updateOrderStatus(orderId: string, status?: string, paymentStatus?: string) {
  try {
    const { databases } = await createAdminClient()

    const updateData: any = {}
    if (status) updateData.status = status
    if (paymentStatus) updateData.paymentStatus = paymentStatus

    const updatedOrder = await databases.updateDocument(
      APP_CONFIG.APPWRITE.DATABASE_ID,
      APP_CONFIG.APPWRITE.ODERS_COLLECTION_ID,
      orderId,
      updateData,
    )

    return {
      $id: updatedOrder.$id,
      buyerId: updatedOrder.userId,
      sellerId: updatedOrder.shopId,
      listingId: updatedOrder.listingId,
      totalAmount: updatedOrder.amount,
      status: updatedOrder.status,
      $createdAt: updatedOrder.$createdAt,
      $updatedAt: updatedOrder.$updatedAt,
    }
  } catch (error) {
    console.error("Error updating order status:", error)
    return null
  }
}

// Get analytics data
export async function getAnalyticsData(period = "30d") {
  try {
    // This would need to be implemented based on specific analytics requirements
    // For now, return basic data structure
    return {
      period,
      revenue: 0,
      orders: 0,
      users: 0,
      growth: 0,
    }
  } catch (error) {
    console.error("Error fetching analytics:", error)
    return null
  }
}

// Generate reports
export async function generateReport(type: string, startDate: string, endDate: string, format = "json") {
  try {
    // This would need to be implemented based on specific reporting requirements
    return {
      type,
      startDate,
      endDate,
      format,
      data: [],
    }
  } catch (error) {
    console.error("Error generating report:", error)
    return null
  }
}

// Get admin settings
export async function getAdminSettings() {
  try {
    // This could be stored in a settings collection or configuration
    return {
      platform: {
        siteName: "MarketPlace Master",
        currency: "USD",
        timezone: "UTC",
        maintenanceMode: false,
      },
      payment: {
        commissionRate: 5,
        payoutSchedule: "weekly",
        minimumPayout: 50,
      },
      security: {
        twoFactorRequired: false,
        passwordMinLength: 8,
        sessionTimeout: 24,
      },
    }
  } catch (error) {
    console.error("Error fetching admin settings:", error)
    return null
  }
}

// Update admin settings
export async function updateAdminSettings(category: string, settings: any) {
  try {
    // This would need to be implemented to store settings in database
    return { category, settings }
  } catch (error) {
    console.error("Error updating admin settings:", error)
    return null
  }
}

// Fetch admin analytics
export async function fetchAdminAnalytics(period = "30d") {
  return getAnalyticsData(period)
}
