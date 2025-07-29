"use client"
import { Button } from "@/components/ui/button"
import { useRouter } from "next/navigation"
import { useState } from "react"
import { toast } from "@/hooks/use-toast"
import useCurrentUser from "@/hooks/api/use-current-user"
import { ShoppingCart } from "lucide-react"

export function CheckoutButton({
  listingId,
  price,
  sellerId,
  className = "",
}: {
  listingId: string | undefined
  price: number
  sellerId: string | undefined
  className?: string
}) {
  const router = useRouter()
  const { data: session } = useCurrentUser()
  const [isLoading, setIsLoading] = useState(false)

  const handleCheckout = async () => {
    if (!listingId) {
      toast({
        title: "Error",
        description: "Invalid listing ID",
        variant: "destructive",
      })
      return
    }

    if (!session?.user) {
      router.push(`/login?redirect=/checkout/${listingId}`)
      return
    }

    // Redirect to checkout page
    router.push(`/checkout/${listingId}`)
  }

  return (
    <Button
      onClick={handleCheckout}
      disabled={isLoading}
      className={`bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white font-semibold transition-all duration-200 transform hover:scale-105 ${className}`}
    >
      {isLoading ? (
        <div className="flex items-center gap-2">
          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
          Loading...
        </div>
      ) : (
        <div className="flex items-center gap-2">
          <ShoppingCart className="w-4 h-4" />
          Buy Now - ${price.toFixed(2)}
        </div>
      )}
    </Button>
  )
}
