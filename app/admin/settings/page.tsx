import { getAdminSettings } from "@/lib/admin-actions"
import { AdminSettingsContent } from "@/components/admin/AdminSettingsContent"

export default async function AdminSettingsPage() {
  try {
    const settings = await getAdminSettings()
    return <AdminSettingsContent initialSettings={settings} />
  } catch (error) {
    console.error("Error loading settings:", error)
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-red-600 mb-2">Error Loading Settings</h2>
          <p className="text-muted-foreground">{error instanceof Error ? error.message : "Failed to load settings"}</p>
        </div>
      </div>
    )
  }
}
