import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { MoreHorizontal, UserCheck, UserX, Eye } from 'lucide-react'

interface User {
  $id: string
  name: string
  email: string
  status: 'active' | 'suspended'
}

interface UserActionsProps {
  user: User
  onAction: (userId: string, action: 'suspend' | 'activate') => void
}

export function UserActions({ user, onAction }: UserActionsProps) {
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
          View Details
        </DropdownMenuItem>
        {user.status === 'active' ? (
          <DropdownMenuItem 
            onClick={() => onAction(user.$id, 'suspend')}
            className="text-red-600"
          >
            <UserX className="mr-2 h-4 w-4" />
            Suspend User
          </DropdownMenuItem>
        ) : (
          <DropdownMenuItem 
            onClick={() => onAction(user.$id, 'activate')}
            className="text-green-600"
          >
            <UserCheck className="mr-2 h-4 w-4" />
            Activate User
          </DropdownMenuItem>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
