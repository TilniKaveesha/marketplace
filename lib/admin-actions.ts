import { Query } from "appwrite"
import { createAdminClient } from "./appwrite"
import { APP_CONFIG } from "./app-config"

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

export interface User {
  $id: string
  name: string
  email: string
  status: "active" | "suspended" | "banned"
  role: "user" | "seller" | "admin"
  $createdAt: string
  $updatedAt: string
}

export interface Shop {
  $id: string
  name: string
  description: string
  ownerName: string
  ownerId: string
  status: "active" | "pending" | "suspended"
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

// Get overall admin stats
export async function getAdminStats(): Promise<AdminStats> {
  const { databases } = await createAdminClient()

  try {
    const [usersResponse, shopsResponse, listingsResponse, ordersResponse] = await Promise.all([
      databases.listDocuments(APP_CONFIG.APPWRITE.DATABASE_ID, APP_CONFIG.APPWRITE.USER_ID, [Query.limit(1)]),
      databases.listDocuments(APP_CONFIG.APPWRITE.DATABASE_ID, APP_CONFIG.APPWRITE.SHOP_ID, [Query.limit(1)]),
      databases.listDocuments(APP_CONFIG.APPWRITE.DATABASE_ID, APP_CONFIG.APPWRITE.ITEM_LISTING_ID, [Query.limit(1)]),
      databases.listDocuments(APP_CONFIG.APPWRITE.DATABASE_ID, APP_CONFIG.APPWRITE.ODERS_COLLECTION_ID, [Query.limit(1)])
    ])

    return {
      totalUsers: usersResponse.total,
      totalShops: shopsResponse.total,
      totalListings: listingsResponse.total,
      totalOrders: ordersResponse.total
    }
  } catch (error) {
    console.error("Error fetching admin stats:", error)
    return {
      totalUsers: 0,
      totalShops: 0,
      totalListings: 0,
      totalOrders: 0
    }
  }
}

// Get all users
export async function getAllUsers(limit = DEFAULT_LIMIT, offset = DEFAULT_OFFSET): Promise<User[]> {
  const { databases } = await createAdminClient()

  try {
    const response = await databases.listDocuments(
      APP_CONFIG.APPWRITE.DATABASE_ID,
      APP_CONFIG.APPWRITE.USER_ID,
      [Query.limit(limit), Query.offset(offset), Query.orderDesc("$createdAt")]
    )
    return response.documents as unknown as User[]
  } catch (error) {
    console.error("Failed to get users:", error)
    throw error
  }
}

// Get all shops
export async function getAllShops(limit = DEFAULT_LIMIT, offset = DEFAULT_OFFSET): Promise<Shop[]> {
  const { databases } = await createAdminClient()

  try {
    const response = await databases.listDocuments(
      APP_CONFIG.APPWRITE.DATABASE_ID,
      APP_CONFIG.APPWRITE.SHOP_ID,
      [Query.limit(limit), Query.offset(offset), Query.orderDesc("$createdAt")]
    )
    return response.documents as unknown as Shop[]
  } catch (error) {
    console.error("Failed to get shops:", error)
    throw error
  }
}

// Get all listings
export async function getAllListings(limit = DEFAULT_LIMIT, offset = DEFAULT_OFFSET): Promise<Listing[]> {
  const { databases } = await createAdminClient()

  try {
    const response = await databases.listDocuments(
      APP_CONFIG.APPWRITE.DATABASE_ID,
      APP_CONFIG.APPWRITE.ITEM_LISTING_ID,
      [Query.limit(limit), Query.offset(offset), Query.orderDesc("$createdAt")]
    )
    return response.documents as unknown as Listing[]
  } catch (error) {
    console.error("Failed to get listings:", error)
    throw error
  }
}

// Get all orders
export async function getAllOrders(limit = DEFAULT_LIMIT, offset = DEFAULT_OFFSET): Promise<Order[]> {
  const { databases } = await createAdminClient()

  try {
    const response = await databases.listDocuments(
      APP_CONFIG.APPWRITE.DATABASE_ID,
      APP_CONFIG.APPWRITE.ODERS_COLLECTION_ID,
      [Query.limit(limit), Query.offset(offset), Query.orderDesc("$createdAt")]
    )
    return response.documents as unknown as Order[]
  } catch (error) {
    console.error("Error fetching orders:", error)
    throw error
  }
}

// Update user status
export async function updateUserStatus(userId: string, status: User["status"]): Promise<User> {
  const { databases } = await createAdminClient()

  try {
    const response = await databases.updateDocument(
      APP_CONFIG.APPWRITE.DATABASE_ID,
      APP_CONFIG.APPWRITE.USER_ID,
      userId,
      { status }
    )
    return response as unknown as User
  } catch (error) {
    console.error("Failed to update user status:", error)
    throw error
  }
}

// Update shop status
export async function updateShopStatus(shopId: string, status: Shop["status"]): Promise<Shop> {
  const { databases } = await createAdminClient()

  try {
    const response = await databases.updateDocument(
      APP_CONFIG.APPWRITE.DATABASE_ID,
      APP_CONFIG.APPWRITE.SHOP_ID,
      shopId,
      { status }
    )
    return response as unknown as Shop
  } catch (error) {
    console.error("Failed to update shop status:", error)
    throw error
  }
}

// Update listing status
export async function updateListingStatus(listingId: string, status: Listing["status"]): Promise<Listing> {
  const { databases } = await createAdminClient()

  try {
    const response = await databases.updateDocument(
      APP_CONFIG.APPWRITE.DATABASE_ID,
      APP_CONFIG.APPWRITE.ITEM_LISTING_ID,
      listingId,
      { status }
    )
    return response as unknown as Listing
  } catch (error) {
    console.error("Failed to update listing status:", error)
    throw error
  }
}
