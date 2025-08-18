"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { AdminStatsCard } from "./AdminStatsCard"
import { fetchAdminAnalytics } from "@/lib/admin-actions-client"
import { DollarSign, ShoppingCart, Users, TrendingUp, Package, Eye } from "lucide-react"

interface AnalyticsData {
  revenue: {
    total: number
    orders: number
    avgOrderValue: number
  }
  listings: {
    total: number
    active: number
    pending: number
  }
  users: {
    total: number
    newUsers: number
  }
  metrics: {
    conversionRate: number
    totalOrders: number
    completedOrders: number
  }
}

export function AdminAnalyticsContent() {
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null)
  const [loading, setLoading] = useState(true)
  const [period, setPeriod] = useState("30d")

  const fetchAnalytics = async () => {
    try {
      setLoading(true)
      const data = await fetchAdminAnalytics(period)
      if (data) {
        setAnalytics(data)
      }
    } catch (error) {
      console.error("Failed to fetch analytics:", error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchAnalytics()
  }, [period])

  if (loading) {
    return <div className="flex items-center justify-center h-64">Loading analytics...</div>
  }

  if (!analytics) {
    return <div className="flex items-center justify-center h-64">Failed to load analytics</div>
  }

  const revenueStats = [
    {
      title: "Total Revenue",
      value: `$${(analytics.revenue?.total || 0).toLocaleString()}`,
      description: "Total platform revenue",
      icon: DollarSign,
      trend: "up" as const,
      change: "+25% from last period",
    },
    {
      title: "Total Orders",
      value: (analytics.revenue?.orders || 0).toString(),
      description: "Orders processed",
      icon: ShoppingCart,
      trend: "up" as const,
      change: "+20% from last period",
    },
    {
      title: "Avg Order Value",
      value: `$${(analytics.revenue?.avgOrderValue || 0).toFixed(2)}`,
      description: "Average order amount",
      icon: TrendingUp,
      trend: "up" as const,
      change: "+5% from last period",
    },
    {
      title: "Conversion Rate",
      value: `${(analytics.metrics?.conversionRate || 0).toFixed(1)}%`,
      description: "Order completion rate",
      icon: TrendingUp,
      trend: "up" as const,
      change: "+2% from last period",
    },
  ]

  const platformStats = [
    {
      title: "Total Listings",
      value: (analytics.listings?.total || 0).toString(),
      description: "All platform listings",
      icon: Package,
      trend: "up" as const,
      change: "+15% from last period",
    },
    {
      title: "Active Listings",
      value: (analytics.listings?.active || 0).toString(),
      description: "Currently visible",
      icon: Eye,
      trend: "up" as const,
      change: "+12% from last period",
    },
    {
      title: "New Users",
      value: (analytics.users?.newUsers || 0).toString(),
      description: "User registrations",
      icon: Users,
      trend: "up" as const,
      change: "+18% from last period",
    },
    {
      title: "Pending Listings",
      value: (analytics.listings?.pending || 0).toString(),
      description: "Awaiting approval",
      icon: Package,
      trend: "down" as const,
      change: "-8% from last period",
    },
  ]

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Analytics Dashboard</h1>
          <p className="text-muted-foreground">Platform performance insights</p>
        </div>
        <Select value={period} onValueChange={setPeriod}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Select period" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="7d">Last 7 days</SelectItem>
            <SelectItem value="30d">Last 30 days</SelectItem>
            <SelectItem value="90d">Last 90 days</SelectItem>
            <SelectItem value="1y">Last year</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Revenue Metrics */}
      <Card>
        <CardHeader>
          <CardTitle>Revenue Metrics</CardTitle>
          <CardDescription>Financial performance overview</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {revenueStats.map((stat, index) => (
              <AdminStatsCard key={index} {...stat} />
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Platform Metrics */}
      <Card>
        <CardHeader>
          <CardTitle>Platform Metrics</CardTitle>
          <CardDescription>User engagement and content statistics</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {platformStats.map((stat, index) => (
              <AdminStatsCard key={index} {...stat} />
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Additional Analytics Cards */}
      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Order Status Breakdown</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span>Completed Orders</span>
                <span className="font-medium">{analytics.metrics?.completedOrders || 0}</span>
              </div>
              <div className="flex justify-between items-center">
                <span>Total Orders</span>
                <span className="font-medium">{analytics.metrics?.totalOrders || 0}</span>
              </div>
              <div className="flex justify-between items-center">
                <span>Success Rate</span>
                <span className="font-medium">{(analytics.metrics?.conversionRate || 0).toFixed(1)}%</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Listing Status Overview</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span>Active Listings</span>
                <span className="font-medium">{analytics.listings?.active || 0}</span>
              </div>
              <div className="flex justify-between items-center">
                <span>Pending Approval</span>
                <span className="font-medium">{analytics.listings?.pending || 0}</span>
              </div>
              <div className="flex justify-between items-center">
                <span>Approval Rate</span>
                <span className="font-medium">
                  {(((analytics.listings?.active || 0) / (analytics.listings?.total || 1)) * 100).toFixed(1)}%
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
