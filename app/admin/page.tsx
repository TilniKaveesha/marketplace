// Remove `"use client"` from page.tsx

import { AdminDashboardContent } from "@/components/admin/AdminDashboardContent"
import {
  getAdminStats,
  getAllListings,
  getAllUsers,
  getAllShops,
  getAllOrders
} from "@/lib/admin-actions"

export default async function AdminDashboardPage() {
  const stats = await getAdminStats()
  const [recentListings, recentUsers, recentShops, recentOrders] = await Promise.all([
    getAllListings(),
    getAllUsers(),
    getAllShops(),
    getAllOrders()
  ])

  const recentActivity = [
    ...recentListings.slice(0, 3).map((doc: any) => ({
      id: doc.$id,
      type: 'listing',
      message: `New listing: ${doc.title}`,
      timestamp: doc.$createdAt,
      user: doc.sellerName || 'Unknown seller'
    })),
    ...recentUsers.slice(0, 3).map((doc: any) => ({
      id: doc.$id,
      type: 'user',
      message: `New user registered`,
      timestamp: doc.$createdAt,
      user: doc.name || doc.email || 'Unknown user'
    })),
    ...recentShops.slice(0, 3).map((doc: any) => ({
      id: doc.$id,
      type: 'shop',
      message: `New shop created: ${doc.name}`,
      timestamp: doc.$createdAt,
      user: doc.ownerName || 'Unknown owner'
    })),
    ...recentOrders.slice(0, 3).map((doc: any) => ({
      id: doc.$id,
      type: 'order',
      message: `New order placed`,
      timestamp: doc.$createdAt,
      user: `Order #${doc.$id.slice(-6)}`
    }))
  ].sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()).slice(0, 10)

  return <AdminDashboardContent stats={stats} recentActivity={recentActivity} />
}
