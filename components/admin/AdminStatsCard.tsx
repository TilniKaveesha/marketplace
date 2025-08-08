import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { type LucideIcon } from 'lucide-react'

interface AdminStatsCardProps {
  title: string
  value: string
  description: string
  icon: LucideIcon
  trend: "up" | "down"
  change?: string
}

export function AdminStatsCard({
  title,
  value,
  description,
  icon: Icon,
  trend,
  change
}: AdminStatsCardProps) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        <Icon className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
        <p className="text-xs text-muted-foreground">{description}</p>
        {change && (
          <p className={`text-xs ${trend === "up" ? "text-green-600" : "text-red-600"} mt-1`}>
            {change}
          </p>
        )}
      </CardContent>
    </Card>
  )
}
