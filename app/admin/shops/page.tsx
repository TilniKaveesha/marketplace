"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { ShopActions } from "@/components/admin/ShopActions"
import { Search, Store } from 'lucide-react'

interface Shop {
  $id: string
  name: string
  description: string
  owner: {
    name: string
    email: string
  }
  status: 'active' | 'suspended' | 'pending'
  listingCount: number
  $createdAt: string
}

export default function AdminShops() {
  const [shops, setShops] = useState<Shop[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'suspended' | 'pending'>('all')

  useEffect(() => {
    fetchShops()
  }, [])

  const fetchShops = async () => {
    try {
      // Mock data - replace with actual API call
      const mockShops: Shop[] = [
        {
          $id: "1",
          name: "Tech Store",
          description: "Electronics and gadgets",
          owner: {
            name: "John Doe",
            email: "john@example.com"
          },
          status: "active",
          listingCount: 25,
          $createdAt: "2024-01-15T10:30:00.000Z"
        },
        {
          $id: "2",
          name: "Fashion Hub",
          description: "Trendy clothing and accessories",
          owner: {
            name: "Jane Smith",
            email: "jane@example.com"
          },
          status: "active",
          listingCount: 18,
          $createdAt: "2024-01-20T14:20:00.000Z"
        },
        {
          $id: "3",
          name: "Home Decor",
          description: "Beautiful home decorations",
          owner: {
            name: "Bob Wilson",
            email: "bob@example.com"
          },
          status: "pending",
          listingCount: 5,
          $createdAt: "2024-01-25T09:15:00.000Z"
        }
      ]
      setShops(mockShops)
    } catch (error) {
      console.error("Failed to fetch shops:", error)
    } finally {
      setLoading(false)
    }
  }

  const filteredShops = shops.filter(shop => {
    const matchesSearch = shop.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         shop.owner.name.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = statusFilter === 'all' || shop.status === statusFilter
    return matchesSearch && matchesStatus
  })

  const handleShopAction = async (shopId: string, action: 'approve' | 'suspend' | 'activate') => {
    try {
      const status = action === 'approve' ? 'active' : action === 'suspend' ? 'suspended' : 'active'
      const response = await fetch(`/api/admin/shops/${shopId}/status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status }),
      })

      if (response.ok) {
        setShops(shops.map(shop => 
          shop.$id === shopId 
            ? { ...shop, status }
            : shop
        ))
      }
    } catch (error) {
      console.error("Failed to update shop status:", error)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-2 text-gray-600">Loading shops...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Shop Management</h1>
          <p className="text-gray-600">Manage all marketplace shops</p>
        </div>
        <div className="flex items-center gap-2">
          <Store className="h-5 w-5 text-gray-500" />
          <span className="text-sm text-gray-600">{shops.length} total shops</span>
        </div>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search shops by name or owner..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <div className="flex gap-2">
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

      {/* Shops Table */}
      <Card>
        <CardHeader>
          <CardTitle>Shops ({filteredShops.length})</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Shop</TableHead>
                <TableHead>Owner</TableHead>
                <TableHead>Listings</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Created</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredShops.map((shop) => (
                <TableRow key={shop.$id}>
                  <TableCell>
                    <div>
                      <div className="font-medium">{shop.name}</div>
                      <div className="text-sm text-gray-500">{shop.description}</div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div>
                      <div className="font-medium">{shop.owner.name}</div>
                      <div className="text-sm text-gray-500">{shop.owner.email}</div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline">
                      {shop.listingCount} items
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge 
                      variant={
                        shop.status === 'active' ? 'default' : 
                        shop.status === 'pending' ? 'secondary' : 'destructive'
                      }
                    >
                      {shop.status}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="text-sm">
                      {new Date(shop.$createdAt).toLocaleDateString()}
                    </div>
                  </TableCell>
                  <TableCell>
                    <ShopActions
                      shop={shop}
                      onAction={handleShopAction}
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
