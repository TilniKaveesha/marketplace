import { useState } from "react"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { MoreHorizontal, Check, X, Pause } from 'lucide-react'
import { updateShopStatus } from "@/lib/admin-actions"
import { toast } from "@/hooks/use-toast"

interface Shop {
  $id: string
  name: string
  description: string
  ownerName: string
  ownerId: string
  status: "active" | "pending" | "suspended"
  $createdAt: string
  $updatedAt: string
}

interface ShopActionsProps {
  shop: Shop
  onUpdate: () => void
}

export function ShopActions({ shop, onUpdate }: ShopActionsProps) {
  const [loading, setLoading] = useState(false)

  const handleStatusUpdate = async (status: "active" | "pending" | "suspended") => {
    setLoading(true)
    try {
      const success = await updateShopStatus(shop.$id, status)
      if (success) {
        toast({
          title: "Success",
          description: `Shop status updated to ${status}`,
        })
        onUpdate()
      } else {
        toast({
          title: "Error",
          description: "Failed to update shop status",
          variant: "destructive",
        })
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update shop status",
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
        {shop.status !== "active" && (
          <DropdownMenuItem onClick={() => handleStatusUpdate("active")}>
            <Check className="mr-2 h-4 w-4" />
            Approve
          </DropdownMenuItem>
        )}
        {shop.status !== "suspended" && (
          <DropdownMenuItem onClick={() => handleStatusUpdate("suspended")}>
            <Pause className="mr-2 h-4 w-4" />
            Suspend
          </DropdownMenuItem>
        )}
        {shop.status !== "pending" && (
          <DropdownMenuItem onClick={() => handleStatusUpdate("pending")}>
            <X className="mr-2 h-4 w-4" />
            Set Pending
          </DropdownMenuItem>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
