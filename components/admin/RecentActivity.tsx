import { formatDistanceToNow } from "date-fns"

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
  if (!activities || activities.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-muted-foreground">No recent activity</p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {activities.map((activity) => (
        <div key={activity.id} className="flex items-start space-x-4">
          <div className="flex-shrink-0">
            <div className={`w-2 h-2 rounded-full ${
              activity.type === 'user' ? 'bg-blue-500' :
              activity.type === 'shop' ? 'bg-green-500' :
              activity.type === 'listing' ? 'bg-purple-500' :
              'bg-orange-500'
            }`} />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-gray-900">
              {activity.message}
            </p>
            <p className="text-sm text-gray-500">
              by {activity.user} • {formatDistanceToNow(new Date(activity.timestamp), { addSuffix: true })}
            </p>
          </div>
        </div>
      ))}
    </div>
  )
}
