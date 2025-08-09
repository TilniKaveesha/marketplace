"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { MoreHorizontal, Search, Store, CheckCircle, XCircle, Eye, Loader2 } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import Link from "next/link"

interface Shop {
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

interface AdminShopsContentProps {
  shops: Shop[]
}

export function AdminShopsContent({ shops: initialShops }: AdminShopsContentProps) {
  const [shops, setShops] = useState(initialShops)
  const [searchTerm, setSearchTerm] = useState("")
  const [filterStatus, setFilterStatus] = useState<string>("all")
  const [loading, setLoading] = useState(false)
  const { toast } = useToast()

  // Debug: Log the initial shops
  useEffect(() => {
    console.log("AdminShopsContent: Initial shops:", initialShops)
  }, [initialShops])

  const filteredShops = shops.filter((shop) => {
    const matchesSearch =
      shop.ShopName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      shop.ownerName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      shop.ownerEmail?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      shop.Description?.toLowerCase().includes(searchTerm.toLowerCase())

    const matchesStatus =
      filterStatus === "all" ||
      (filterStatus === "active" && shop.status === "active") ||
      (filterStatus === "suspended" && shop.status === "suspended") ||
      (filterStatus === "pending" && shop.status === "pending")

    return matchesSearch && matchesStatus
  })

  const handleShopStatusChange = async (shopId: string, newStatus: string) => {
    setLoading(true)
    try {
      const response = await fetch(`/api/admin/shops/${shopId}/status`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ status: newStatus }),
      })

      if (response.ok) {
        setShops(
          shops.map((shop) =>
            shop.$id === shopId
              ? {
                  ...shop,
                  status: newStatus as "active" | "pending" | "suspended",
                }
              : shop,
          ),
        )
        toast({
          title: "Success",
          description: `Shop ${newStatus} successfully`,
        })
      } else {
        const errorData = await response.json()
        throw new Error(errorData.error || "Failed to update shop status")
      }
    } catch (error) {
      console.error("Error updating shop status:", error)
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to update shop status",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const getStatusBadge = (shop: Shop) => {
    switch (shop.status) {
      case "suspended":
        return <Badge variant="destructive">Suspended</Badge>
      case "pending":
        return <Badge variant="secondary">Pending</Badge>
      default:
        return (
          <Badge variant="default" className="bg-green-100 text-green-800">
            Active
          </Badge>
        )
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    })
  }

  // Show loading state if no shops and not an error
  if (shops.length === 0 && !loading) {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold">Shops Management</h1>
            <p className="text-muted-foreground">Manage all shops in the marketplace</p>
          </div>
        </div>
        <Card>
          <CardContent className="flex items-center justify-center py-12">
            <div className="text-center">
              <p className="text-lg text-muted-foreground mb-2">No shops found</p>
              <p className="text-sm text-muted-foreground">
                This could mean the database is empty or there's a connection issue.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Shops Management</h1>
          <p className="text-muted-foreground">Manage all shops in the marketplace</p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>All Shops ({filteredShops.length})</CardTitle>
          <div className="flex gap-4 items-center">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder="Search shops..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline">
                  Filter:{" "}
                  {filterStatus === "all" ? "All" : filterStatus.charAt(0).toUpperCase() + filterStatus.slice(1)}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                <DropdownMenuItem onClick={() => setFilterStatus("all")}>All Shops</DropdownMenuItem>
                <DropdownMenuItem onClick={() => setFilterStatus("active")}>Active Shops</DropdownMenuItem>
                <DropdownMenuItem onClick={() => setFilterStatus("pending")}>Pending Approval</DropdownMenuItem>
                <DropdownMenuItem onClick={() => setFilterStatus("suspended")}>Suspended Shops</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </CardHeader>
        <CardContent>
          {loading && (
            <div className="flex items-center justify-center py-4">
              <Loader2 className="h-6 w-6 animate-spin" />
              <span className="ml-2">Updating...</span>
            </div>
          )}
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Shop</TableHead>
                <TableHead>Owner</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Listings</TableHead>
                <TableHead>Created</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredShops.map((shop) => (
                <TableRow key={shop.$id}>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <Avatar className="h-10 w-10">
                        <AvatarImage src={shop.logo || "/placeholder.svg"} />
                        <AvatarFallback>
                          <Store className="h-5 w-5" />
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <div className="font-medium">{shop.ShopName}</div>
                        <div className="text-sm text-muted-foreground line-clamp-1">
                          {shop.Description || "No description"}
                        </div>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div>
                      <div className="font-medium">{shop.ownerName || "Unknown Owner"}</div>
                      <div className="text-sm text-muted-foreground">{shop.ownerEmail || "No email"}</div>
                      <div className="text-xs text-muted-foreground">ID: {shop.userId?.slice(-8)}</div>
                    </div>
                  </TableCell>
                  <TableCell>{getStatusBadge(shop)}</TableCell>
                  <TableCell>{shop.totalListings || 0}</TableCell>
                  <TableCell>{formatDate(shop.$createdAt)}</TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="h-8 w-8 p-0" disabled={loading}>
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem asChild>
                          <Link href={`/shop/${shop.$id}`}>
                            <Eye className="mr-2 h-4 w-4" />
                            View Shop
                          </Link>
                        </DropdownMenuItem>
                        {shop.status === "pending" && (
                          <DropdownMenuItem
                            onClick={() => handleShopStatusChange(shop.$id, "active")}
                            className="text-green-600"
                          >
                            <CheckCircle className="mr-2 h-4 w-4" />
                            Approve Shop
                          </DropdownMenuItem>
                        )}
                        {shop.status !== "suspended" && (
                          <DropdownMenuItem
                            onClick={() => handleShopStatusChange(shop.$id, "suspended")}
                            className="text-red-600"
                          >
                            <XCircle className="mr-2 h-4 w-4" />
                            Suspend Shop
                          </DropdownMenuItem>
                        )}
                        {shop.status === "suspended" && (
                          <DropdownMenuItem
                            onClick={() => handleShopStatusChange(shop.$id, "active")}
                            className="text-green-600"
                          >
                            <CheckCircle className="mr-2 h-4 w-4" />
                            Reactivate Shop
                          </DropdownMenuItem>
                        )}
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          {filteredShops.length === 0 && shops.length > 0 && (
            <div className="text-center py-8 text-muted-foreground">No shops found matching your criteria.</div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
