import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { MoreHorizontal, Check, X, Eye, Store } from 'lucide-react'

interface Shop {
  $id: string
  name: string
  status: 'active' | 'suspended' | 'pending'
}

interface ShopActionsProps {
  shop: Shop
  onAction: (shopId: string, action: 'approve' | 'suspend' | 'activate') => void
}

export function ShopActions({ shop, onAction }: ShopActionsProps) {
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
          View Shop
        </DropdownMenuItem>
        {shop.status === 'pending' && (
          <DropdownMenuItem 
            onClick={() => onAction(shop.$id, 'approve')}
            className="text-green-600"
          >
            <Check className="mr-2 h-4 w-4" />
            Approve Shop
          </DropdownMenuItem>
        )}
        {shop.status === 'active' ? (
          <DropdownMenuItem 
            onClick={() => onAction(shop.$id, 'suspend')}
            className="text-red-600"
          >
            <X className="mr-2 h-4 w-4" />
            Suspend Shop
          </DropdownMenuItem>
        ) : shop.status === 'suspended' && (
          <DropdownMenuItem 
            onClick={() => onAction(shop.$id, 'activate')}
            className="text-green-600"
          >
            <Store className="mr-2 h-4 w-4" />
            Activate Shop
          </DropdownMenuItem>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
