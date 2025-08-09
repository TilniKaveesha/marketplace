import { getAllUsers } from "@/lib/admin-actions"
import { AdminUsersContent } from "@/components/admin/AdminUsersContent"

export default async function AdminUsersPage() {
  try {
    const users = await getAllUsers()
    return <AdminUsersContent users={users} />
  } catch (error) {
    console.error("Error loading users:", error)
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-red-600 mb-2">Error Loading Users</h2>
          <p className="text-muted-foreground">{error instanceof Error ? error.message : "Failed to load users"}</p>
        </div>
      </div>
    )
  }
}
