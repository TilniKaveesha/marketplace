import { getAllOrders } from "@/lib/admin-actions"
import { AdminOrdersContent } from "@/components/admin/AdminOrdersContent"

export default async function AdminOrdersPage() {
  try {
    const orders = await getAllOrders()
    return <AdminOrdersContent initialOrders={orders} />
  } catch (error) {
    console.error("Error loading orders:", error)
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-red-600 mb-2">Error Loading Orders</h2>
          <p className="text-muted-foreground">{error instanceof Error ? error.message : "Failed to load orders"}</p>
        </div>
      </div>
    )
  }
}
