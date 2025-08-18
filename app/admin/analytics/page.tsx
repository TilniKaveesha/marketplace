import { getAnalyticsData } from "@/lib/admin-actions"
import { AdminAnalyticsContent } from "@/components/admin/AdminAnalyticsContent"

export default async function AdminAnalyticsPage() {
  try {
    const analytics = await getAnalyticsData("30d")
    return <AdminAnalyticsContent initialData={analytics} />
  } catch (error) {
    console.error("Error loading analytics:", error)
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-red-600 mb-2">Error Loading Analytics</h2>
          <p className="text-muted-foreground">{error instanceof Error ? error.message : "Failed to load analytics"}</p>
        </div>
      </div>
    )
  }
}
