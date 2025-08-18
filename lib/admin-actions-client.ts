// This version uses the client-side Appwrite client instead of server-only functions

// Constants
const DEFAULT_LIMIT = 1000
const DEFAULT_OFFSET = 0

// Interfaces (reusing from server version)
export interface AdminStats {
  totalUsers: number
  totalShops: number
  totalListings: number
  totalOrders: number
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

// Client-side functions that make API calls instead of direct database access
export async function getAdminStats(): Promise<AdminStats> {
  try {
    const response = await fetch("/api/admin/stats")
    if (!response.ok) throw new Error("Failed to fetch admin stats")
    return await response.json()
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

export async function getAllUsers(limit = DEFAULT_LIMIT, offset = DEFAULT_OFFSET): Promise<CombinedUser[]> {
  try {
    const response = await fetch(`/api/admin/users?limit=${limit}&offset=${offset}`)
    if (!response.ok) throw new Error("Failed to fetch users")
    return await response.json()
  } catch (error) {
    console.error("Failed to get users:", error)
    return []
  }
}

export async function getAllShops(limit = DEFAULT_LIMIT, offset = DEFAULT_OFFSET): Promise<Shop[]> {
  try {
    const response = await fetch(`/api/admin/shops?limit=${limit}&offset=${offset}`)
    if (!response.ok) throw new Error("Failed to fetch shops")
    return await response.json()
  } catch (error) {
    console.error("Failed to get shops:", error)
    return []
  }
}

export async function getAllListings(limit = DEFAULT_LIMIT, offset = DEFAULT_OFFSET): Promise<Listing[]> {
  try {
    const response = await fetch(`/api/admin/listings?limit=${limit}&offset=${offset}`)
    if (!response.ok) throw new Error("Failed to fetch listings")
    return await response.json()
  } catch (error) {
    console.error("Failed to get listings:", error)
    return []
  }
}

export async function getAllOrders(limit = DEFAULT_LIMIT, offset = DEFAULT_OFFSET): Promise<Order[]> {
  try {
    const response = await fetch(`/api/admin/orders?limit=${limit}&offset=${offset}`)
    if (!response.ok) throw new Error("Failed to fetch orders")
    return await response.json()
  } catch (error) {
    console.error("Error fetching orders:", error)
    return []
  }
}

export async function updateUserStatus(userId: string, status: "active" | "suspended"): Promise<boolean> {
  try {
    const response = await fetch(`/api/admin/users/${userId}/status`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    })
    return response.ok
  } catch (error) {
    console.error("Failed to update user status:", error)
    return false
  }
}

export async function updateUserLabels(userId: string, labels: string[]): Promise<boolean> {
  try {
    const response = await fetch(`/api/admin/users/${userId}/labels`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ labels }),
    })
    return response.ok
  } catch (error) {
    console.error("Failed to update user labels:", error)
    return false
  }
}

export async function updateShopStatus(shopId: string, status: Shop["status"]): Promise<Shop | null> {
  try {
    const response = await fetch(`/api/admin/shops/${shopId}/status`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    })
    if (!response.ok) return null
    return await response.json()
  } catch (error) {
    console.error("Failed to update shop status:", error)
    return null
  }
}

export async function updateListingStatus(listingId: string, status: Listing["status"]): Promise<Listing | null> {
  try {
    const response = await fetch(`/api/admin/listings/${listingId}/status`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    })
    if (!response.ok) return null
    return await response.json()
  } catch (error) {
    console.error("Failed to update listing status:", error)
    return null
  }
}

export async function updateOrderStatus(orderId: string, status?: string, paymentStatus?: string) {
  try {
    const response = await fetch(`/api/admin/orders/${orderId}/status`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status, paymentStatus }),
    })
    if (!response.ok) return null
    return await response.json()
  } catch (error) {
    console.error("Error updating order status:", error)
    return null
  }
}

export async function getAnalyticsData(period = "30d") {
  try {
    const response = await fetch(`/api/admin/analytics?period=${period}`)
    if (!response.ok) return null
    return await response.json()
  } catch (error) {
    console.error("Error fetching analytics:", error)
    return null
  }
}

export async function fetchAdminAnalytics(period = "30d") {
  return getAnalyticsData(period)
}
