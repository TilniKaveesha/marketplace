"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { ListingActions } from "@/components/admin/ListingActions"
import { Search, Package } from 'lucide-react'

interface Listing {
  $id: string
  title: string
  price: number
  category: string
  condition: string
  shop: {
    name: string
    owner: string
  }
  status: 'active' | 'suspended' | 'pending'
  images: string[]
  $createdAt: string
}

export default function AdminListings() {
  const [listings, setListings] = useState<Listing[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'suspended' | 'pending'>('all')
  const [categoryFilter, setCategoryFilter] = useState<string>('all')

  useEffect(() => {
    fetchListings()
  }, [])

  const fetchListings = async () => {
    try {
      // Mock data - replace with actual API call
      const mockListings: Listing[] = [
        {
          $id: "1",
          title: "iPhone 15 Pro Max",
          price: 1200,
          category: "Electronics",
          condition: "New",
          shop: {
            name: "Tech Store",
            owner: "John Doe"
          },
          status: "active",
          images: ["/placeholder.svg?height=100&width=100"],
          $createdAt: "2024-01-15T10:30:00.000Z"
        },
        {
          $id: "2",
          title: "Designer Handbag",
          price: 350,
          category: "Fashion",
          condition: "Like New",
          shop: {
            name: "Fashion Hub",
            owner: "Jane Smith"
          },
          status: "active",
          images: ["/placeholder.svg?height=100&width=100"],
          $createdAt: "2024-01-20T14:20:00.000Z"
        },
        {
          $id: "3",
          title: "Vintage Lamp",
          price: 85,
          category: "Home & Garden",
          condition: "Used",
          shop: {
            name: "Home Decor",
            owner: "Bob Wilson"
          },
          status: "pending",
          images: ["/placeholder.svg?height=100&width=100"],
          $createdAt: "2024-01-25T09:15:00.000Z"
        }
      ]
      setListings(mockListings)
    } catch (error) {
      console.error("Failed to fetch listings:", error)
    } finally {
      setLoading(false)
    }
  }

  const categories = ['all', ...Array.from(new Set(listings.map(listing => listing.category)))]

  const filteredListings = listings.filter(listing => {
    const matchesSearch = listing.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         listing.shop.name.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = statusFilter === 'all' || listing.status === statusFilter
    const matchesCategory = categoryFilter === 'all' || listing.category === categoryFilter
    return matchesSearch && matchesStatus && matchesCategory
  })

  const handleListingAction = async (listingId: string, action: 'approve' | 'suspend' | 'activate') => {
    try {
      const status = action === 'approve' ? 'active' : action === 'suspend' ? 'suspended' : 'active'
      const response = await fetch(`/api/admin/listings/${listingId}/status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status }),
      })

      if (response.ok) {
        setListings(listings.map(listing => 
          listing.$id === listingId 
            ? { ...listing, status }
            : listing
        ))
      }
    } catch (error) {
      console.error("Failed to update listing status:", error)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-2 text-gray-600">Loading listings...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Listing Management</h1>
          <p className="text-gray-600">Manage all marketplace listings</p>
        </div>
        <div className="flex items-center gap-2">
          <Package className="h-5 w-5 text-gray-500" />
          <span className="text-sm text-gray-600">{listings.length} total listings</span>
        </div>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search listings by title or shop..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <div className="flex gap-2 flex-wrap">
              <select
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                className="px-3 py-2 border rounded-md text-sm"
              >
                {categories.map(category => (
                  <option key={category} value={category}>
                    {category === 'all' ? 'All Categories' : category}
                  </option>
                ))}
              </select>
              <Button
                variant={statusFilter === 'all' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setStatusFilter('all')}
              >
                All
              </Button>
              <Button
                variant={statusFilter === 'active' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setStatusFilter('active')}
              >
                Active
              </Button>
              <Button
                variant={statusFilter === 'pending' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setStatusFilter('pending')}
              >
                Pending
              </Button>
              <Button
                variant={statusFilter === 'suspended' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setStatusFilter('suspended')}
              >
                Suspended
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Listings Table */}
      <Card>
        <CardHeader>
          <CardTitle>Listings ({filteredListings.length})</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Item</TableHead>
                <TableHead>Price</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Shop</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Created</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredListings.map((listing) => (
                <TableRow key={listing.$id}>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <img
                        src={listing.images[0] || "/placeholder.svg"}
                        alt={listing.title}
                        className="w-12 h-12 object-cover rounded"
                      />
                      <div>
                        <div className="font-medium">{listing.title}</div>
                        <div className="text-sm text-gray-500">{listing.condition}</div>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="font-medium">${listing.price}</div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline">
                      {listing.category}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div>
                      <div className="font-medium">{listing.shop.name}</div>
                      <div className="text-sm text-gray-500">{listing.shop.owner}</div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge 
                      variant={
                        listing.status === 'active' ? 'default' : 
                        listing.status === 'pending' ? 'secondary' : 'destructive'
                      }
                    >
                      {listing.status}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="text-sm">
                      {new Date(listing.$createdAt).toLocaleDateString()}
                    </div>
                  </TableCell>
                  <TableCell>
                    <ListingActions
                      listing={listing}
                      onAction={handleListingAction}
                    />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}
