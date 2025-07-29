import { Loader2 } from "lucide-react"

export default function Loading() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-50 via-white to-indigo-50">
      <div className="flex items-center space-x-2">
        <Loader2 className="h-6 w-6 animate-spin text-purple-600" />
        <span className="text-lg font-medium text-gray-700">Loading payment...</span>
      </div>
    </div>
  )
}
