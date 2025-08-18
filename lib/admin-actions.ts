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
export async function getAdminStats() {
  try {
    const response = await fetch("/api/admin/stats")
    const data = await response.json()
    return data.success
      ? data.data
      : {
          totalUsers: 0,
          totalShops: 0,
          totalListings: 0,
          totalOrders: 0,
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
    const response = await fetch(`/api/admin/users?limit=${limit}&offset=${offset}`)
    const data = await response.json()
    return data.success ? data.data : []
  } catch (error) {
    console.error("Failed to get users:", error)
    throw error
  }
}

// Get all shops (with owner information)
export async function getAllShops(limit = DEFAULT_LIMIT, offset = DEFAULT_OFFSET): Promise<Shop[]> {
  try {
    const response = await fetch(`/api/admin/shops?limit=${limit}&offset=${offset}`)
    const data = await response.json()
    return data.success ? data.data : []
  } catch (error) {
    console.error("Failed to get shops:", error)
    throw error
  }
}

// Get all listings
export async function getAllListings(limit = DEFAULT_LIMIT, offset = DEFAULT_OFFSET): Promise<Listing[]> {
  try {
    const response = await fetch(`/api/admin/listings?limit=${limit}&offset=${offset}`)
    const data = await response.json()
    return data.success ? data.data : []
  } catch (error) {
    console.error("Failed to get listings:", error)
    throw error
  }
}

// Get all orders
export async function getAllOrders(limit = DEFAULT_LIMIT, offset = DEFAULT_OFFSET): Promise<Order[]> {
  try {
    const response = await fetch(`/api/admin/orders?limit=${limit}&offset=${offset}`)
    const data = await response.json()
    return data.success ? data.data : []
  } catch (error) {
    console.error("Error fetching orders:", error)
    throw error
  }
}

// Update user status (auth user)
export async function updateUserStatus(userId: string, status: "active" | "suspended"): Promise<boolean> {
  try {
    const response = await fetch(`/api/admin/users/${userId}/status`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    })
    const data = await response.json()
    return data.success
  } catch (error) {
    console.error("Failed to update user status:", error)
    throw error
  }
}

// Update user labels (for admin role)
export async function updateUserLabels(userId: string, labels: string[]): Promise<boolean> {
  // Placeholder for future implementation
  return false
}

// Update shop status
export async function updateShopStatus(shopId: string, status: Shop["status"]): Promise<Shop | null > {
  try {
    const response = await fetch(`/api/admin/shops/${shopId}/status`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    })
    const data = await response.json()
    return data.success ? data.data : null
  } catch (error) {
    console.error("Failed to update shop status:", error)
    throw error
  }
}

// Update listing status
export async function updateListingStatus(listingId: string, status: Listing["status"]): Promise<Listing | null> {
  try {
    const response = await fetch(`/api/admin/listings/${listingId}/status`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    })
    const data = await response.json()
    return data.success ? data.data : null
  } catch (error) {
    console.error("Failed to update listing status:", error)
    throw error
  }
}

// Update order status
export async function updateOrderStatus(orderId: string, status?: string, paymentStatus?: string) {
  try {
    const response = await fetch(`/api/admin/orders/${orderId}/status`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status, paymentStatus }),
    })
    const data = await response.json()
    return data.success ? data.data : null
  } catch (error) {
    console.error("Error updating order status:", error)
    return null
  }
}

// Get analytics data
export async function getAnalyticsData(period = "30d") {
  try {
    const response = await fetch(`/api/admin/analytics?period=${period}`)
    const data = await response.json()
    return data.success ? data.data : null
  } catch (error) {
    console.error("Error fetching analytics:", error)
    return null
  }
}

// Generate reports
export async function generateReport(type: string, startDate: string, endDate: string, format = "json") {
  try {
    const response = await fetch("/api/admin/reports", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ type, startDate, endDate, format }),
    })
    const data = await response.json()
    return data.success ? data.data : null
  } catch (error) {
    console.error("Error generating report:", error)
    return null
  }
}

// Get admin settings
export async function getAdminSettings() {
  try {
    const response = await fetch("/api/admin/settings")
    const data = await response.json()
    return data.success
      ? data.data
      : {
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
    const response = await fetch("/api/admin/settings", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ category, settings }),
    })
    const data = await response.json()
    return data.success ? data.data : null
  } catch (error) {
    console.error("Error updating admin settings:", error)
    return null
  }
}

// Fetch admin analytics
export async function fetchAdminAnalytics(period = "30d") {
  try {
    const response = await fetch(`/api/admin/analytics?period=${period}`)
    const data = await response.json()
    return data.success ? data.data : null
  } catch (error) {
    console.error("Error fetching analytics:", error)
    return null
  }
}
