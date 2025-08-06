import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"

interface Activity {
  id: string
  type: string
  message: string
  timestamp: string
  user: string
}

interface RecentActivityProps {
  activities: Activity[]
}

export function RecentActivity({ activities }: RecentActivityProps) {
  const getActivityBadge = (type: string) => {
    switch (type) {
      case 'user_registered':
        return <Badge variant="default">User</Badge>
      case 'shop_created':
        return <Badge variant="secondary">Shop</Badge>
      case 'listing_added':
        return <Badge variant="outline">Listing</Badge>
      case 'order_placed':
        return <Badge variant="destructive">Order</Badge>
      default:
        return <Badge variant="outline">{type}</Badge>
    }
  }

  return (
    <div className="space-y-4">
      {activities.map((activity) => (
        <div key={activity.id} className="flex items-center space-x-4">
          <Avatar className="h-8 w-8">
            <AvatarFallback>
              {activity.user.charAt(0).toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1 space-y-1">
            <div className="flex items-center space-x-2">
              {getActivityBadge(activity.type)}
              <p className="text-sm font-medium">{activity.message}</p>
            </div>
            <p className="text-xs text-muted-foreground">{activity.timestamp}</p>
          </div>
        </div>
      ))}
    </div>
  )
}
