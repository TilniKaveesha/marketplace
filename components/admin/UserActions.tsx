import { useState } from "react"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { MoreHorizontal, UserCheck, UserX, Ban } from 'lucide-react'
import { updateUserStatus } from "@/lib/admin-actions"
import { toast } from "@/hooks/use-toast"

interface User {
  $id: string
  name: string
  email: string
  status: "active" | "suspended" | "banned"
  role: "user" | "seller" | "admin"
  $createdAt: string
  $updatedAt: string
}

interface UserActionsProps {
  user: User
  onUpdate: () => void
}

export function UserActions({ user, onUpdate }: UserActionsProps) {
  const [loading, setLoading] = useState(false)

  const handleStatusUpdate = async (status: "active" | "suspended" | "banned") => {
    setLoading(true)
    try {
      const success = await updateUserStatus(user.$id, status)
      if (success) {
        toast({
          title: "Success",
          description: `User status updated to ${status}`,
        })
        onUpdate()
      } else {
        toast({
          title: "Error",
          description: "Failed to update user status",
          variant: "destructive",
        })
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update user status",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="h-8 w-8 p-0" disabled={loading}>
          <MoreHorizontal className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        {user.status !== "active" && (
          <DropdownMenuItem onClick={() => handleStatusUpdate("active")}>
            <UserCheck className="mr-2 h-4 w-4" />
            Activate
          </DropdownMenuItem>
        )}
        {user.status !== "suspended" && (
          <DropdownMenuItem onClick={() => handleStatusUpdate("suspended")}>
            <UserX className="mr-2 h-4 w-4" />
            Suspend
          </DropdownMenuItem>
        )}
        {user.status !== "banned" && (
          <DropdownMenuItem onClick={() => handleStatusUpdate("banned")}>
            <Ban className="mr-2 h-4 w-4" />
            Ban
          </DropdownMenuItem>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
