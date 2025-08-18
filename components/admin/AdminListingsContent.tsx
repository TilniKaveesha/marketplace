"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Search, Eye, Package, Filter, DollarSign } from "lucide-react"
import { AdminStatsCard } from "./AdminStatsCard"
import { ListingActions } from "./ListingActions"

interface Listing {
  $id: string
  title: string
  displayTitle: string
  description: string
  price: number
  currency: string
  category: string
  condition: string
  status: "active" | "pending" | "rejected" | "sold"
  images: string[]
  sellerName: string
  sellerId: string
  shop: {
    ShopName: string
    userId: string
  }
  $createdAt: string
  $updatedAt: string
}

export function AdminListingsContent() {
  const [listings, setListings] = useState<Listing[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [categoryFilter, setCategoryFilter] = useState("all")

  const fetchListings = async () => {
    try {
      setLoading(true)
      const params = new URLSearchParams()
      if (statusFilter !== "all") params.append("status", statusFilter)
      if (categoryFilter !== "all") params.append("category", categoryFilter)
      if (searchTerm) params.append("search", searchTerm)

      const response = await fetch(`/api/admin/listings?${params}`)
      const data = await response.json()

      if (data.success) {
        // Transform the data to match our interface
        const transformedListings = data.data.map((listing: any) => ({
          ...listing,
          title: listing.displayTitle || listing.title || "Untitled",
          description: listing.description || "No description available",
          sellerName: listing.shop?.ShopName || "Unknown Seller",
          sellerId: listing.shop?.userId || listing.sellerId || "",
          $updatedAt: listing.$updatedAt || listing.$createdAt,
        }))
        setListings(transformedListings)
      }
    } catch (error) {
      console.error("Failed to fetch listings:", error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchListings()
  }, [statusFilter, categoryFilter, searchTerm])

  const stats = [
    {
      title: "Total Listings",
      value: listings.length.toString(),
      description: "All marketplace listings",
      icon: Package,
      trend: "up" as const,
      change: "+12% from last month",
    },
    {
      title: "Active Listings",
      value: listings.filter((l) => l.status === "active").length.toString(),
      description: "Currently visible listings",
      icon: Eye,
      trend: "up" as const,
      change: "+8% from last month",
    },
    {
      title: "Pending Review",
      value: listings.filter((l) => l.status === "pending").length.toString(),
      description: "Awaiting moderation",
      icon: Filter,
      trend: "down" as const,
      change: "-5% from last month",
    },
    {
      title: "Total Value",
      value: `$${listings.reduce((sum, l) => sum + l.price, 0).toLocaleString()}`,
      description: "Combined listing value",
      icon: DollarSign,
      trend: "up" as const,
      change: "+15% from last month",
    },
  ]

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active":
        return "bg-green-100 text-green-800"
      case "pending":
        return "bg-yellow-100 text-yellow-800"
      case "suspended":
      case "rejected":
        return "bg-red-100 text-red-800"
      case "sold":
        return "bg-blue-100 text-blue-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  if (loading) {
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

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle>Listings Management</CardTitle>
          <CardDescription>Manage and moderate all marketplace listings</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row gap-4 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search listings..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="rejected">Rejected</SelectItem>
                <SelectItem value="sold">Sold</SelectItem>
              </SelectContent>
            </Select>
            <Select value={categoryFilter} onValueChange={setCategoryFilter}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Filter by category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                <SelectItem value="electronics">Electronics</SelectItem>
                <SelectItem value="clothing">Clothing</SelectItem>
                <SelectItem value="home">Home & Garden</SelectItem>
                <SelectItem value="sports">Sports</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Listings Table */}
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Listing</TableHead>
                  <TableHead>Shop</TableHead>
                  <TableHead>Price</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Created</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {listings.map((listing) => (
                  <TableRow key={listing.$id}>
                    <TableCell>
                      <div className="flex items-center space-x-3">
                        {listing.images && listing.images.length > 0 && (
                          <img
                            src={listing.images[0] || "/placeholder.svg"}
                            alt={listing.title}
                            className="h-10 w-10 rounded-md object-cover"
                          />
                        )}
                        <div>
                          <div className="font-medium">{listing.title}</div>
                          <div className="text-sm text-muted-foreground">{listing.condition}</div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="font-medium">{listing.sellerName}</div>
                    </TableCell>
                    <TableCell>
                      <div className="font-medium">
                        {listing.currency} {listing.price.toLocaleString()}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">{listing.category}</Badge>
                    </TableCell>
                    <TableCell>
                      <Badge className={getStatusColor(listing.status)}>{listing.status}</Badge>
                    </TableCell>
                    <TableCell>{new Date(listing.$createdAt).toLocaleDateString()}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Button variant="ghost" size="sm">
                          <Eye className="h-4 w-4" />
                        </Button>
                        <ListingActions listing={listing} onUpdate={fetchListings} />
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
