"use client"

import { AdminNavbar } from "@/components/admin/AdminNavbar"
import { AdminSidebar } from "@/components/admin/AdminSidebar"
import useCurrentUser from "@/hooks/api/use-current-user"
import { useRouter } from "next/navigation"
import { useEffect } from "react"
import { Loader2 } from 'lucide-react'

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const { data: userData, isPending, error } = useCurrentUser()
  const router = useRouter()
  const user = userData?.user

  useEffect(() => {
    if (!isPending && (!user || (user.email !== 'admin@communityshop.com' && !user.labels?.includes('admin')))) {
      router.push('/')
    }
  }, [user, isPending, router])

  if (isPending) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    )
  }

  if (!user || (user.email !== 'admin@communityshop.com' && !user.labels?.includes('admin'))) {
    return null
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <AdminNavbar user={user} />
      <div className="flex">
        <AdminSidebar />
        <main className="flex-1 p-6">
          {children}
        </main>
      </div>
    </div>
  )
}
