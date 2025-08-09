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

// Get overall admin stats
export async function getAdminStats(): Promise<AdminStats> {
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

    return {
      totalUsers: authUsersResponse.total,
      totalShops: shopsResponse.total,
      totalListings: listingsResponse.total,
      totalOrders: ordersResponse.total,
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

    console.log("Fetching auth users...")

    // Get auth users
    const authUsersResponse = await users.list([
      Query.limit(limit),
      Query.offset(offset),
      Query.orderDesc("registration"),
    ])

    console.log("Auth users response:", authUsersResponse)

    // Get custom user data
    const customUsersMap = new Map<string, CustomUser>()
    try {
      const customUsersResponse = await databases.listDocuments(
        APP_CONFIG.APPWRITE.DATABASE_ID,
        APP_CONFIG.APPWRITE.USER_ID,
        [Query.limit(limit)],
      )
      console.log("Custom users response:", customUsersResponse)

      customUsersResponse.documents.forEach((doc: any) => {
        customUsersMap.set(doc.userId, doc as CustomUser)
      })
    } catch (error) {
      console.log("No custom user collection or error fetching:", error)
    }

    // Combine auth users with custom data
    const combinedUsers: CombinedUser[] = authUsersResponse.users.map((authUser: any) => {
      const customUser = customUsersMap.get(authUser.$id)

      return {
        $id: authUser.$id,
        name: authUser.name || authUser.email?.split("@")[0] || "Unknown User",
        email: authUser.email,
        phone: authUser.phone,
        customPhone: customUser?.Phone,
        idNumber: customUser?.IdNumber,
        status: authUser.status ? "active" : "suspended",
        role: authUser.labels?.includes("admin") ? "admin" : "user",
        $createdAt: authUser.registration,
        $updatedAt: authUser.registration,
        labels: authUser.labels || [],
        emailVerified: authUser.emailVerification,
        phoneVerified: authUser.phoneVerification,
      }
    })

    console.log("Combined users:", combinedUsers)
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

    console.log("Fetching shops from database:", APP_CONFIG.APPWRITE.DATABASE_ID, APP_CONFIG.APPWRITE.SHOP_ID)

    const response = await databases.listDocuments(APP_CONFIG.APPWRITE.DATABASE_ID, APP_CONFIG.APPWRITE.SHOP_ID, [
      Query.limit(limit),
      Query.offset(offset),
      Query.orderDesc("$createdAt"),
    ])

    console.log("Shops response:", response)

    // Get owner information for each shop
    const shopsWithOwners = await Promise.all(
      response.documents.map(async (doc: any) => {
        let ownerName = "Unknown Owner"
        let ownerEmail = ""

        try {
          // Get owner info from auth users
          const owner = await users.get(doc.userId)
          ownerName = owner.name || owner.email?.split("@")[0] || "Unknown Owner"
          ownerEmail = owner.email || ""
        } catch (error) {
          console.log(`Could not fetch owner info for user ${doc.userId}:`, error)
        }

        return {
          $id: doc.$id,
          ShopName: doc.ShopName || "Unnamed Shop",
          Description: doc.Description || "",
          userId: doc.userId,
          ownerName,
          ownerEmail,
          status: doc.status || "pending",
          logo: doc.logo,
          totalListings: doc.totalListings || 0,
          $createdAt: doc.$createdAt,
          $updatedAt: doc.$updatedAt,
        } as Shop
      }),
    )

    console.log("Shops with owners:", shopsWithOwners)
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

    const response = await databases.listDocuments(
      APP_CONFIG.APPWRITE.DATABASE_ID,
      APP_CONFIG.APPWRITE.ITEM_LISTING_ID,
      [Query.limit(limit), Query.offset(offset), Query.orderDesc("$createdAt")],
    )

    return response.documents.map((doc: any) => ({
      $id: doc.$id,
      title: doc.title || "Untitled Listing",
      description: doc.description || "",
      price: doc.price || 0,
      images: doc.images || [],
      category: doc.category || "Other",
      status: doc.status || "pending",
      sellerName: doc.sellerName || "Unknown Seller",
      sellerId: doc.sellerId,
      $createdAt: doc.$createdAt,
      $updatedAt: doc.$updatedAt,
    })) as Listing[]
  } catch (error) {
    console.error("Failed to get listings:", error)
    throw error
  }
}

// Get all orders
export async function getAllOrders(limit = DEFAULT_LIMIT, offset = DEFAULT_OFFSET): Promise<Order[]> {
  try {
    const { databases } = await createAdminClient()

    const response = await databases.listDocuments(
      APP_CONFIG.APPWRITE.DATABASE_ID,
      APP_CONFIG.APPWRITE.ODERS_COLLECTION_ID,
      [Query.limit(limit), Query.offset(offset), Query.orderDesc("$createdAt")],
    )

    return response.documents.map((doc: any) => ({
      $id: doc.$id,
      buyerId: doc.buyerId,
      sellerId: doc.sellerId,
      listingId: doc.listingId,
      totalAmount: doc.totalAmount || 0,
      status: doc.status || "pending",
      $createdAt: doc.$createdAt,
      $updatedAt: doc.$updatedAt,
    })) as Order[]
  } catch (error) {
    console.error("Error fetching orders:", error)
    throw error
  }
}

// Update user status (auth user)
export async function updateUserStatus(userId: string, status: "active" | "suspended"): Promise<boolean> {
  try {
    const { users } = await createAdminClient()

    // Update auth user status
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
    throw error
  }
}

// Update shop status
export async function updateShopStatus(shopId: string, status: Shop["status"]): Promise<Shop> {
  try {
    const { databases } = await createAdminClient()

    const response = await databases.updateDocument(
      APP_CONFIG.APPWRITE.DATABASE_ID,
      APP_CONFIG.APPWRITE.SHOP_ID,
      shopId,
      { status },
    )
    return response as unknown as Shop
  } catch (error) {
    console.error("Failed to update shop status:", error)
    throw error
  }
}

// Update listing status
export async function updateListingStatus(listingId: string, status: Listing["status"]): Promise<Listing> {
  try {
    const { databases } = await createAdminClient()

    const response = await databases.updateDocument(
      APP_CONFIG.APPWRITE.DATABASE_ID,
      APP_CONFIG.APPWRITE.ITEM_LISTING_ID,
      listingId,
      { status },
    )
    return response as unknown as Listing
  } catch (error) {
    console.error("Failed to update listing status:", error)
    throw error
  }
}
