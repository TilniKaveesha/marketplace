import { getAllListings } from "@/lib/admin-actions"
import { AdminListingsContent } from "@/components/admin/AdminListingsContent"

export default async function AdminListingsPage() {
  try {
    const listings = await getAllListings()
    return <AdminListingsContent initialListings={listings} />
  } catch (error) {
    console.error("Error loading listings:", error)
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-red-600 mb-2">Error Loading Listings</h2>
          <p className="text-muted-foreground">{error instanceof Error ? error.message : "Failed to load listings"}</p>
        </div>
      </div>
    )
  }
}
