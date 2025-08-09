"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { MoreHorizontal, Search, UserCheck, UserX, Shield, Loader2, Phone, CreditCard } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

interface CombinedUser {
  $id: string
  name: string
  email: string
  phone?: string
  customPhone?: string
  idNumber?: string
  status: "active" | "suspended" | "banned"
  role: "user" | "seller" | "admin"
  $createdAt: string
  $updatedAt: string
  labels?: string[]
  emailVerified: boolean
  phoneVerified: boolean
}

interface AdminUsersContentProps {
  users: CombinedUser[]
}

export function AdminUsersContent({ users: initialUsers }: AdminUsersContentProps) {
  const [users, setUsers] = useState(initialUsers)
  const [searchTerm, setSearchTerm] = useState("")
  const [filterStatus, setFilterStatus] = useState<string>("all")
  const [loading, setLoading] = useState(false)
  const { toast } = useToast()

  // Debug: Log the initial users
  useEffect(() => {
    console.log("AdminUsersContent: Initial users:", initialUsers)
  }, [initialUsers])

  const filteredUsers = users.filter((user) => {
    const matchesSearch =
      user.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.customPhone?.includes(searchTerm) ||
      user.idNumber?.includes(searchTerm)

    const matchesStatus =
      filterStatus === "all" ||
      (filterStatus === "active" && user.status === "active") ||
      (filterStatus === "suspended" && user.status === "suspended") ||
      (filterStatus === "admin" && user.labels?.includes("admin"))

    return matchesSearch && matchesStatus
  })

  const handleUserStatusChange = async (userId: string, newStatus: string) => {
    setLoading(true)
    try {
      const response = await fetch(`/api/admin/users/${userId}/status`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ status: newStatus }),
      })

      if (response.ok) {
        if (newStatus === "admin") {
          setUsers(
            users.map((user) =>
              user.$id === userId
                ? {
                    ...user,
                    labels: [...(user.labels || []), "admin"],
                    role: "admin" as const,
                  }
                : user,
            ),
          )
        } else {
          setUsers(
            users.map((user) =>
              user.$id === userId
                ? {
                    ...user,
                    status: newStatus as "active" | "suspended" | "banned",
                  }
                : user,
            ),
          )
        }

        toast({
          title: "Success",
          description: `User ${newStatus === "suspended" ? "suspended" : newStatus === "admin" ? "promoted to admin" : "activated"} successfully`,
        })
      } else {
        const errorData = await response.json()
        throw new Error(errorData.error || "Failed to update user status")
      }
    } catch (error) {
      console.error("Error updating user status:", error)
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to update user status",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const getStatusBadge = (user: CombinedUser) => {
    if (user.labels?.includes("admin")) {
      return (
        <Badge variant="secondary" className="bg-purple-100 text-purple-800">
          Admin
        </Badge>
      )
    }
    if (user.status === "suspended") {
      return <Badge variant="destructive">Suspended</Badge>
    }
    return (
      <Badge variant="default" className="bg-green-100 text-green-800">
        Active
      </Badge>
    )
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    })
  }

  // Show loading state if no users and not an error
  if (users.length === 0 && !loading) {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold">Users Management</h1>
            <p className="text-muted-foreground">Manage all users in the system</p>
          </div>
        </div>
        <Card>
          <CardContent className="flex items-center justify-center py-12">
            <div className="text-center">
              <p className="text-lg text-muted-foreground mb-2">No users found</p>
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
          <h1 className="text-3xl font-bold">Users Management</h1>
          <p className="text-muted-foreground">Manage all users in the system</p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>All Users ({filteredUsers.length})</CardTitle>
          <div className="flex gap-4 items-center">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder="Search users..."
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
                <DropdownMenuItem onClick={() => setFilterStatus("all")}>All Users</DropdownMenuItem>
                <DropdownMenuItem onClick={() => setFilterStatus("active")}>Active Users</DropdownMenuItem>
                <DropdownMenuItem onClick={() => setFilterStatus("suspended")}>Suspended Users</DropdownMenuItem>
                <DropdownMenuItem onClick={() => setFilterStatus("admin")}>Admin Users</DropdownMenuItem>
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
                <TableHead>User</TableHead>
                <TableHead>Contact Info</TableHead>
                <TableHead>Verification</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Joined</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredUsers.map((user) => (
                <TableRow key={user.$id}>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <Avatar className="h-8 w-8">
                        <AvatarImage src={`https://api.dicebear.com/7.x/initials/svg?seed=${user.name}`} />
                        <AvatarFallback>
                          {user.name?.charAt(0)?.toUpperCase() || user.email?.charAt(0)?.toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <div className="font-medium">{user.name || "No name"}</div>
                        <div className="text-sm text-muted-foreground">{user.email}</div>
                        <div className="text-xs text-muted-foreground">ID: {user.$id.slice(-8)}</div>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="space-y-1">
                      {user.phone && (
                        <div className="flex items-center gap-1 text-sm">
                          <Phone className="h-3 w-3" />
                          {user.phone}
                        </div>
                      )}
                      {user.customPhone && (
                        <div className="flex items-center gap-1 text-sm text-muted-foreground">
                          <Phone className="h-3 w-3" />
                          {user.customPhone}
                        </div>
                      )}
                      {user.idNumber && (
                        <div className="flex items-center gap-1 text-sm text-muted-foreground">
                          <CreditCard className="h-3 w-3" />
                          {user.idNumber}
                        </div>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="space-y-1">
                      <Badge variant={user.emailVerified ? "default" : "secondary"} className="text-xs">
                        Email {user.emailVerified ? "✓" : "✗"}
                      </Badge>
                      {user.phone && (
                        <Badge variant={user.phoneVerified ? "default" : "secondary"} className="text-xs">
                          Phone {user.phoneVerified ? "✓" : "✗"}
                        </Badge>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>{getStatusBadge(user)}</TableCell>
                  <TableCell>{formatDate(user.$createdAt)}</TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="h-8 w-8 p-0" disabled={loading}>
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        {user.status === "suspended" ? (
                          <DropdownMenuItem
                            onClick={() => handleUserStatusChange(user.$id, "active")}
                            className="text-green-600"
                          >
                            <UserCheck className="mr-2 h-4 w-4" />
                            Activate User
                          </DropdownMenuItem>
                        ) : (
                          <DropdownMenuItem
                            onClick={() => handleUserStatusChange(user.$id, "suspended")}
                            className="text-red-600"
                          >
                            <UserX className="mr-2 h-4 w-4" />
                            Suspend User
                          </DropdownMenuItem>
                        )}
                        {!user.labels?.includes("admin") && (
                          <DropdownMenuItem
                            onClick={() => handleUserStatusChange(user.$id, "admin")}
                            className="text-purple-600"
                          >
                            <Shield className="mr-2 h-4 w-4" />
                            Make Admin
                          </DropdownMenuItem>
                        )}
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          {filteredUsers.length === 0 && users.length > 0 && (
            <div className="text-center py-8 text-muted-foreground">No users found matching your criteria.</div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
