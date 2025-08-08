"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { AdminStatsCard } from "@/components/admin/AdminStatsCard"
import { RecentActivity } from "@/components/admin/RecentActivity"
import { Button } from "@/components/ui/button"
import { Users, Store, Package, ShoppingCart, TrendingUp } from 'lucide-react'
import Link from "next/link"

interface AdminStats {
  totalUsers: number
  totalShops: number
  totalListings: number
  totalOrders: number
}

interface Activity {
  id: string
  type: string
  message: string
  timestamp: string
  user: string
}

export function AdminDashboardContent({
  stats,
  recentActivity
}: {
  stats: AdminStats
  recentActivity: Activity[]
}) {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Admin Dashboard</h1>
          <p className="text-muted-foreground">
            Welcome to your marketplace admin panel. Monitor and manage your platform.
          </p>
        </div>
        <div className="flex gap-2">
          <Button asChild>
            <Link href="/admin/listings">
              <Package className="mr-2 h-4 w-4" />
              Manage Listings
            </Link>
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <AdminStatsCard
          title="Total Users"
          value={stats.totalUsers.toString()}
          description="Registered users"
          icon={Users}
          trend="up"
          change="+12% from last month"
        />
        <AdminStatsCard
          title="Active Shops"
          value={stats.totalShops.toString()}
          description="Seller shops"
          icon={Store}
          trend="up"
          change="+8% from last month"
        />
        <AdminStatsCard
          title="Total Listings"
          value={stats.totalListings.toString()}
          description="Product listings"
          icon={Package}
          trend="up"
          change="+15% from last month"
        />
        <AdminStatsCard
          title="Total Orders"
          value={stats.totalOrders.toString()}
          description="Completed orders"
          icon={ShoppingCart}
          trend="up"
          change="+23% from last month"
        />
      </div>

      {/* Recent Activity and Quick Actions */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        <Card className="col-span-4">
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
            <CardDescription>
              Latest activities across your marketplace
            </CardDescription>
          </CardHeader>
          <CardContent>
            <RecentActivity activities={recentActivity} />
          </CardContent>
        </Card>

        <Card className="col-span-3">
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
            <CardDescription>
              Common administrative tasks
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Button asChild className="w-full justify-start">
              <Link href="/admin/users">
                <Users className="mr-2 h-4 w-4" />
                Manage Users
              </Link>
            </Button>
            <Button asChild variant="outline" className="w-full justify-start">
              <Link href="/admin/shops">
                <Store className="mr-2 h-4 w-4" />
                Manage Shops
              </Link>
            </Button>
            <Button asChild variant="outline" className="w-full justify-start">
              <Link href="/admin/listings">
                <Package className="mr-2 h-4 w-4" />
                Review Listings
              </Link>
            </Button>
            <Button asChild variant="outline" className="w-full justify-start">
              <Link href="/admin/orders">
                <ShoppingCart className="mr-2 h-4 w-4" />
                View Orders
              </Link>
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* System Status */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            System Status
          </CardTitle>
          <CardDescription>
            Current system health and performance metrics
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-3">
            <div className="flex items-center gap-2">
              <div className="h-2 w-2 bg-green-500 rounded-full"></div>
              <span className="text-sm">Database: Operational</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="h-2 w-2 bg-green-500 rounded-full"></div>
              <span className="text-sm">Payment Gateway: Operational</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="h-2 w-2 bg-yellow-500 rounded-full"></div>
              <span className="text-sm">Image Storage: Degraded</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
