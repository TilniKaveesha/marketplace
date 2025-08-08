import { useState } from "react"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { MoreHorizontal, Check, X, Pause, ShoppingCart } from 'lucide-react'
import { updateListingStatus } from "@/lib/admin-actions"
import { toast } from "@/hooks/use-toast"

interface Listing {
  $id: string
  title: string
  description: string
  price: number
  images: string[]
  category: string
  status: "active" | "pending" | "rejected" | "sold"
  sellerName: string
  sellerId: string
  $createdAt: string
  $updatedAt: string
}

interface ListingActionsProps {
  listing: Listing
  onUpdate: () => void
}

export function ListingActions({ listing, onUpdate }: ListingActionsProps) {
  const [loading, setLoading] = useState(false)

  const handleStatusUpdate = async (status: "active" | "pending" | "rejected" | "sold") => {
    setLoading(true)
    try {
      const success = await updateListingStatus(listing.$id, status)
      if (success) {
        toast({
          title: "Success",
          description: `Listing status updated to ${status}`,
        })
        onUpdate()
      } else {
        toast({
          title: "Error",
          description: "Failed to update listing status",
          variant: "destructive",
        })
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update listing status",
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
        {listing.status !== "active" && (
          <DropdownMenuItem onClick={() => handleStatusUpdate("active")}>
            <Check className="mr-2 h-4 w-4" />
            Approve
          </DropdownMenuItem>
        )}
        {listing.status !== "rejected" && (
          <DropdownMenuItem onClick={() => handleStatusUpdate("rejected")}>
            <X className="mr-2 h-4 w-4" />
            Reject
          </DropdownMenuItem>
        )}
        {listing.status !== "pending" && (
          <DropdownMenuItem onClick={() => handleStatusUpdate("pending")}>
            <Pause className="mr-2 h-4 w-4" />
            Set Pending
          </DropdownMenuItem>
        )}
        {listing.status !== "sold" && (
          <DropdownMenuItem onClick={() => handleStatusUpdate("sold")}>
            <ShoppingCart className="mr-2 h-4 w-4" />
            Mark as Sold
          </DropdownMenuItem>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
