"use client"

import { AdminStatsCard } from "@/components/admin/AdminStatsCard"
import { RecentActivity } from "@/components/admin/RecentActivity"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Users, Store, Package, DollarSign, TrendingUp, TrendingDown } from 'lucide-react'

export default function AdminDashboard() {
  const stats = [
    {
      title: "Total Users",
      value: "2,847",
      change: "+12.5%",
      trend: "up" as const,
      icon: Users,
      description: "Active users this month"
    },
    {
      title: "Active Shops",
      value: "1,234",
      change: "+8.2%",
      trend: "up" as const,
      icon: Store,
      description: "Shops with recent activity"
    },
    {
      title: "Total Listings",
      value: "15,678",
      change: "+23.1%",
      trend: "up" as const,
      icon: Package,
      description: "Active product listings"
    },
    {
      title: "Revenue",
      value: "$45,231",
      change: "-2.4%",
      trend: "down" as const,
      icon: DollarSign,
      description: "Total revenue this month"
    }
  ]

  const recentActivities = [
    {
      id: "1",
      type: "user_registered",
      message: "New user John Doe registered",
      timestamp: "2 minutes ago",
      user: "John Doe"
    },
    {
      id: "2",
      type: "shop_created",
      message: "New shop 'Tech Store' was created",
      timestamp: "5 minutes ago",
      user: "Jane Smith"
    },
    {
      id: "3",
      type: "listing_added",
      message: "New listing 'iPhone 15' was added",
      timestamp: "10 minutes ago",
      user: "Mike Johnson"
    },
    {
      id: "4",
      type: "order_placed",
      message: "Order #1234 was placed",
      timestamp: "15 minutes ago",
      user: "Sarah Wilson"
    }
  ]

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground">
          Welcome to your admin dashboard. Here's what's happening with your marketplace.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <AdminStatsCard
            key={stat.title}
            title={stat.title}
            value={stat.value}
            change={stat.change}
            trend={stat.trend}
            icon={stat.icon}
            description={stat.description}
          />
        ))}
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        <Card className="col-span-4">
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
            <CardDescription>
              Latest activities across your marketplace
            </CardDescription>
          </CardHeader>
          <CardContent>
            <RecentActivity activities={recentActivities} />
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
            <div className="space-y-2">
              <button className="w-full text-left p-3 rounded-lg border hover:bg-gray-50 transition-colors">
                <div className="font-medium">Review Pending Shops</div>
                <div className="text-sm text-muted-foreground">3 shops awaiting approval</div>
              </button>
              <button className="w-full text-left p-3 rounded-lg border hover:bg-gray-50 transition-colors">
                <div className="font-medium">Moderate Listings</div>
                <div className="text-sm text-muted-foreground">12 listings need review</div>
              </button>
              <button className="w-full text-left p-3 rounded-lg border hover:bg-gray-50 transition-colors">
                <div className="font-medium">User Reports</div>
                <div className="text-sm text-muted-foreground">5 new reports</div>
              </button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
