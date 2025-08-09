import { getAllShops } from "@/lib/admin-actions"
import { AdminShopsContent } from "@/components/admin/AdminShopsContent"

export default async function AdminShopsPage() {
  try {
    const shops = await getAllShops()
    return <AdminShopsContent shops={shops} />
  } catch (error) {
    console.error("Error loading shops:", error)
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-red-600 mb-2">Error Loading Shops</h2>
          <p className="text-muted-foreground">{error instanceof Error ? error.message : "Failed to load shops"}</p>
        </div>
      </div>
    )
  }
}
