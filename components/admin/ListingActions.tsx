import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { MoreHorizontal, Check, X, Eye, Package } from 'lucide-react'

interface Listing {
  $id: string
  title: string
  status: 'active' | 'suspended' | 'pending'
}

interface ListingActionsProps {
  listing: Listing
  onAction: (listingId: string, action: 'approve' | 'suspend' | 'activate') => void
}

export function ListingActions({ listing, onAction }: ListingActionsProps) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="h-8 w-8 p-0">
          <MoreHorizontal className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem>
          <Eye className="mr-2 h-4 w-4" />
          View Listing
        </DropdownMenuItem>
        {listing.status === 'pending' && (
          <DropdownMenuItem 
            onClick={() => onAction(listing.$id, 'approve')}
            className="text-green-600"
          >
            <Check className="mr-2 h-4 w-4" />
            Approve Listing
          </DropdownMenuItem>
        )}
        {listing.status === 'active' ? (
          <DropdownMenuItem 
            onClick={() => onAction(listing.$id, 'suspend')}
            className="text-red-600"
          >
            <X className="mr-2 h-4 w-4" />
            Suspend Listing
          </DropdownMenuItem>
        ) : listing.status === 'suspended' && (
          <DropdownMenuItem 
            onClick={() => onAction(listing.$id, 'activate')}
            className="text-green-600"
          >
            <Package className="mr-2 h-4 w-4" />
            Activate Listing
          </DropdownMenuItem>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
