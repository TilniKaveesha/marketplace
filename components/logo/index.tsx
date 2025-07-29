import { Sparkles } from "lucide-react"
import Link from "next/link"

const Logo = () => {
  return (
    <Link href="/" className="flex items-center gap-3 group">
      <div className="relative">
        <div className="size-10 bg-gradient-to-br from-primary to-purple-600 rounded-xl flex items-center justify-center shadow-lg group-hover:shadow-xl transition-all duration-300 group-hover:scale-105">
          <Sparkles className="w-6 h-6 text-white" />
        </div>
        <div className="absolute -top-1 -right-1 w-3 h-3 bg-emerald-400 rounded-full animate-pulse" />
      </div>
      <div className="flex flex-col">
        <span className="font-bold text-xl bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
          Community
        </span>
        <span className="text-sm text-primary font-medium -mt-1">Shop</span>
      </div>
    </Link>
  )
}

export default Logo
