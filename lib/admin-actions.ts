
import { Query } from "appwrite"
import { createAnonymousClient } from "./appwrite";
import { APP_CONFIG } from "./app-config";

export async function getAdminStats() {
  const { databases } = await createAnonymousClient();

  try {
    // Get total users
    const users = await databases.listDocuments(
      process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID!,
      process.env.NEXT_PUBLIC_APPWRITE_COLLECTION_USER_ID!,
      [Query.limit(1)]
    )

    // Get total shops
    const shops = await databases.listDocuments(
      process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID!,
      process.env.NEXT_PUBLIC_APPWRITE_COLLECTION_SHOP_ID!,
      [Query.limit(1)]
    )

    // Get total listings
    const listings = await databases.listDocuments(
      process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID!,
      process.env.NEXT_PUBLIC_APPWRITE_COLLECTION_ITEM_LISTING_ID!,
      [Query.limit(1)]
    )

    // Get total orders
    const orders = await databases.listDocuments(
      process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID!,
      process.env.NEXT_PUBLIC_APPWRITE_COLLECTION_ORDERS_ID!,
      [Query.limit(1)]
    )

    return {
      totalUsers: users.total,
      totalShops: shops.total,
      totalListings: listings.total,
      totalOrders: orders.total,
    }
  } catch (error) {
    console.error("Failed to get admin stats:", error)
    throw error
  }
}

export async function getAllUsers(limit = 100, offset = 0) {
  const { databases } = await createAnonymousClient();

  try {
    const response = await databases.listDocuments(
      process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID!,
      process.env.NEXT_PUBLIC_APPWRITE_COLLECTION_USER_ID!,
      [
        Query.limit(limit),
        Query.offset(offset),
        Query.orderDesc("$createdAt")
      ]
    )
    return response
  } catch (error) {
    console.error("Failed to get users:", error)
    throw error
  }
}

export async function getAllShops(limit = 100, offset = 0) {
  const { databases } = await createAnonymousClient();

  try {
    const response = await databases.listDocuments(
      process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID!,
      process.env.NEXT_PUBLIC_APPWRITE_COLLECTION_SHOP_ID!,
      [
        Query.limit(limit),
        Query.offset(offset),
        Query.orderDesc("$createdAt")
      ]
    )
    return response
  } catch (error) {
    console.error("Failed to get shops:", error)
    throw error
  }
}

export async function getAllListings(limit = 100, offset = 0) {
  const { databases } = await createAnonymousClient();

  try {
    const response = await databases.listDocuments(
      process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID!,
      process.env.NEXT_PUBLIC_APPWRITE_COLLECTION_ITEM_LISTING_ID!,
      [
        Query.limit(limit),
        Query.offset(offset),
        Query.orderDesc("$createdAt")
      ]
    )
    return response
  } catch (error) {
    console.error("Failed to get listings:", error)
    throw error
  }
}

export async function updateUserStatus(userId: string, status: 'active' | 'suspended') {
  const { databases } = await createAnonymousClient();

  try {
    const response = await databases.updateDocument(
      process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID!,
      process.env.NEXT_PUBLIC_APPWRITE_COLLECTION_USER_ID!,
      userId,
      { status }
    )
    return response
  } catch (error) {
    console.error("Failed to update user status:", error)
    throw error
  }
}

export async function updateShopStatus(shopId: string, status: 'active' | 'suspended' | 'pending') {
  const { databases } = await createAnonymousClient();

  try {
    const response = await databases.updateDocument(
      process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID!,
      process.env.NEXT_PUBLIC_APPWRITE_COLLECTION_SHOP_ID!,
      shopId,
      { status }
    )
    return response
  } catch (error) {
    console.error("Failed to update shop status:", error)
    throw error
  }
}

export async function updateListingStatus(listingId: string, status: 'active' | 'suspended' | 'pending') {
  const { databases } = await createAnonymousClient();

  try {
    const response = await databases.updateDocument(
      process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID!,
      process.env.NEXT_PUBLIC_APPWRITE_COLLECTION_ITEM_LISTING_ID!,
      listingId,
      { status }
    )
    return response
  } catch (error) {
    console.error("Failed to update listing status:", error)
    throw error
  }
}
