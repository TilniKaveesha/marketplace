"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Eye, MoreHorizontal, Package, CreditCard, BarChart3, CheckCircle, DollarSign, Clock } from "lucide-react"
import { AdminStatsCard } from "./AdminStatsCard"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"

interface Order {
  $id: string
  orderId?: string
  listingTitle?: string
  totalAmount: number
  amount?: number
  currency?: string
  status: string
  paymentStatus?: string
  paymentMethod?: string
  userId?: string
  buyerId: string
  sellerId: string
  listingId: string
  shopId?: string
  $createdAt: string
  customerInfo?: string
}

interface AdminOrdersContentProps {
  initialOrders: Order[]
}

export function AdminOrdersContent({ initialOrders }: AdminOrdersContentProps) {
  const [orders, setOrders] = useState<Order[]>(initialOrders)
  const [loading, setLoading] = useState(false)
  const [statusFilter, setStatusFilter] = useState("all")
  const [paymentFilter, setPaymentFilter] = useState("all")

  const fetchOrders = async () => {
    try {
      setLoading(true)
      const params = new URLSearchParams()
      if (statusFilter !== "all") params.append("status", statusFilter)
      if (paymentFilter !== "all") params.append("paymentStatus", paymentFilter)

      const response = await fetch(`/api/admin/orders?${params}`)
      const data = await response.json()

      if (data.success) {
        setOrders(data.data)
      }
    } catch (error) {
      console.error("Failed to fetch orders:", error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      fetchOrders()
    }, 300)
    return () => clearTimeout(timeoutId)
  }, [statusFilter, paymentFilter])

  const totalRevenue = orders
    .filter((o) => o.paymentStatus === "completed" || o.status === "completed")
    .reduce((sum, o) => sum + (o.totalAmount || o.amount || 0), 0)

  const stats = [
    {
      title: "Total Orders",
      value: orders.length.toString(),
      description: "All time orders",
      trend: "up" as const,
      icon: BarChart3,
      change: "+12% from last month",
    },
    {
      title: "Completed Orders",
      value: orders.filter((o) => o.status === "completed").length.toString(),
      description: "Successfully fulfilled",
      trend: "up" as const,
      icon: CheckCircle,
      change: "+8% from last month",
    },
    {
      title: "Total Revenue",
      value: `$${totalRevenue.toLocaleString()}`,
      description: "From completed orders",
      trend: "up" as const,
      icon: DollarSign,
      change: "+15% from last month",
    },
    {
      title: "Pending Orders",
      value: orders.filter((o) => o.status === "pending").length.toString(),
      description: "Awaiting processing",
      trend: "down" as const,
      icon: Clock,
      change: "-5% from last month",
    },
  ]

  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed":
        return "bg-green-100 text-green-800"
      case "pending":
        return "bg-yellow-100 text-yellow-800"
      case "cancelled":
        return "bg-red-100 text-red-800"
      case "confirmed":
        return "bg-blue-100 text-blue-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const getPaymentStatusColor = (status: string) => {
    switch (status) {
      case "completed":
        return "bg-green-100 text-green-800"
      case "pending":
        return "bg-yellow-100 text-yellow-800"
      case "failed":
        return "bg-red-100 text-red-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const updateOrderStatus = async (orderId: string, status: string, paymentStatus?: string) => {
    try {
      const response = await fetch(`/api/admin/orders/${orderId}/status`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status, paymentStatus }),
      })

      if (response.ok) {
        fetchOrders()
      }
    } catch (error) {
      console.error("Failed to update order:", error)
    }
  }

  if (loading && orders.length === 0) {
    return <div className="flex items-center justify-center h-64">Loading...</div>
  }

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat, index) => (
          <AdminStatsCard key={index} {...stat} />
        ))}
      </div>

      {/* Orders Management */}
      <Card>
        <CardHeader>
          <CardTitle>Orders Management</CardTitle>
          <CardDescription>Monitor and manage all marketplace orders</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row gap-4 mb-6">
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="confirmed">Confirmed</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
                <SelectItem value="cancelled">Cancelled</SelectItem>
              </SelectContent>
            </Select>
            <Select value={paymentFilter} onValueChange={setPaymentFilter}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Payment status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Payments</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
                <SelectItem value="failed">Failed</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Orders Table */}
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Order ID</TableHead>
                  <TableHead>Item</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Payment Method</TableHead>
                  <TableHead>Order Status</TableHead>
                  <TableHead>Payment Status</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {orders.map((order) => (
                  <TableRow key={order.$id}>
                    <TableCell>
                      <div className="font-mono text-sm">{order.orderId || order.$id.slice(-8)}</div>
                    </TableCell>
                    <TableCell>
                      <div className="font-medium">{order.listingTitle || "Unknown Item"}</div>
                    </TableCell>
                    <TableCell>
                      <div className="font-medium">
                        {order.currency || "$"} {(order.totalAmount || order.amount || 0).toLocaleString()}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center space-x-2">
                        <CreditCard className="h-4 w-4" />
                        <span className="capitalize">{order.paymentMethod || "Unknown"}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge className={getStatusColor(order.status)}>{order.status}</Badge>
                    </TableCell>
                    <TableCell>
                      <Badge className={getPaymentStatusColor(order.paymentStatus || "pending")}>
                        {order.paymentStatus || "pending"}
                      </Badge>
                    </TableCell>
                    <TableCell>{new Date(order.$createdAt).toLocaleDateString()}</TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" className="h-8 w-8 p-0">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem>
                            <Eye className="mr-2 h-4 w-4" />
                            View Details
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => updateOrderStatus(order.$id, "confirmed")}>
                            <Package className="mr-2 h-4 w-4" />
                            Mark as Confirmed
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => updateOrderStatus(order.$id, "completed")}>
                            <Package className="mr-2 h-4 w-4" />
                            Mark as Completed
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
            {orders.length === 0 && (
              <div className="text-center py-8 text-muted-foreground">No orders found matching your criteria.</div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
