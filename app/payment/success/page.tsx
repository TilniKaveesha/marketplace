"use client"
import { useEffect, useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { CheckCircle, Package, ArrowRight, Home } from "lucide-react"
import { toast } from "@/hooks/use-toast"

export default function PaymentSuccessPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const orderId = searchParams.get("order_id")
  const transactionId = searchParams.get("transaction_id")
  const [isVerifying, setIsVerifying] = useState(true)
  const [verificationStatus, setVerificationStatus] = useState<"success" | "failed" | "pending">("pending")

  useEffect(() => {
    if (orderId && transactionId) {
      verifyPayment()
    } else {
      setIsVerifying(false)
      setVerificationStatus("failed")
    }
  }, [orderId, transactionId])

  const verifyPayment = async () => {
    try {
      const response = await fetch(`/api/checkout/${orderId}/verify`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          transactionId,
          orderId,
        }),
      })

      if (response.ok) {
        setVerificationStatus("success")
        toast({
          title: "Payment Successful!",
          description: "Your order has been confirmed and is being processed.",
        })
      } else {
        setVerificationStatus("failed")
        toast({
          title: "Payment Verification Failed",
          description: "Please contact support if you were charged.",
          variant: "destructive",
        })
      }
    } catch (error) {
      setVerificationStatus("failed")
      toast({
        title: "Verification Error",
        description: "Unable to verify payment. Please contact support.",
        variant: "destructive",
      })
    } finally {
      setIsVerifying(false)
    }
  }

  if (isVerifying) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-indigo-50 flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardContent className="p-8 text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
            <h2 className="text-xl font-semibold text-gray-900 mb-2">Verifying Payment</h2>
            <p className="text-gray-600">Please wait while we confirm your payment...</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-indigo-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-md border-0 shadow-2xl bg-white/80 backdrop-blur-sm">
        <CardHeader className="text-center pb-4">
          <div className="mx-auto mb-4">
            {verificationStatus === "success" ? (
              <div className="w-16 h-16 bg-gradient-to-r from-green-500 to-emerald-500 rounded-full flex items-center justify-center">
                <CheckCircle className="w-8 h-8 text-white" />
              </div>
            ) : (
              <div className="w-16 h-16 bg-gradient-to-r from-red-500 to-pink-500 rounded-full flex items-center justify-center">
                <span className="text-white text-2xl">✕</span>
              </div>
            )}
          </div>
          <CardTitle className="text-2xl font-bold">
            {verificationStatus === "success" ? "Payment Successful!" : "Payment Failed"}
          </CardTitle>
        </CardHeader>
        <CardContent className="text-center space-y-6">
          {verificationStatus === "success" ? (
            <>
              <div className="space-y-2">
                <p className="text-gray-600">
                  Thank you for your purchase! Your order has been confirmed and is being processed.
                </p>
                {orderId && (
                  <div className="bg-purple-50 p-3 rounded-lg">
                    <p className="text-sm text-purple-700">
                      <strong>Order ID:</strong> {orderId}
                    </p>
                    {transactionId && (
                      <p className="text-sm text-purple-700">
                        <strong>Transaction ID:</strong> {transactionId}
                      </p>
                    )}
                  </div>
                )}
              </div>

              <div className="flex items-center justify-center gap-2 text-sm text-gray-600 bg-blue-50 p-3 rounded-lg">
                <Package className="w-4 h-4 text-blue-600" />
                <span>You'll receive an email confirmation shortly</span>
              </div>

              <div className="space-y-3">
                <Button
                  onClick={() => router.push(`/orders/success/${orderId}`)}
                  className="w-full bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700"
                >
                  View Order Details
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
                <Button variant="outline" onClick={() => router.push("/")} className="w-full">
                  <Home className="w-4 h-4 mr-2" />
                  Continue Shopping
                </Button>
              </div>
            </>
          ) : (
            <>
              <div className="space-y-2">
                <p className="text-gray-600">We couldn't process your payment. Please try again or contact support.</p>
                {orderId && (
                  <div className="bg-red-50 p-3 rounded-lg">
                    <p className="text-sm text-red-700">
                      <strong>Order ID:</strong> {orderId}
                    </p>
                  </div>
                )}
              </div>

              <div className="space-y-3">
                <Button
                  onClick={() => router.push(`/checkout/${orderId}`)}
                  className="w-full bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700"
                >
                  Try Again
                </Button>
                <Button variant="outline" onClick={() => router.push("/")} className="w-full">
                  <Home className="w-4 h-4 mr-2" />
                  Back to Home
                </Button>
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
