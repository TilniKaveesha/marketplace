"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { useToast } from "@/hooks/use-toast"
import { Loader2, CheckCircle, XCircle, Clock, Smartphone, QrCode } from "lucide-react"

interface PaymentStatus {
  success: boolean
  transactionId: string
  paymentStatus: "pending" | "completed" | "failed" | "expired"
  orderStatus: string
  amount: number
  currency: string
  paidAt?: string
  updatedAt: string
}

export default function QRPaymentPage() {
  const params = useParams()
  const router = useRouter()
  const { toast } = useToast()

  const [qrCode, setQrCode] = useState<string>("")
  const [deeplink, setDeeplink] = useState<string>("")
  const [paymentStatus, setPaymentStatus] = useState<PaymentStatus | null>(null)
  const [loading, setLoading] = useState(true)
  const [timeRemaining, setTimeRemaining] = useState(30 * 60) // 30 minutes in seconds
  const [checking, setChecking] = useState(false)

  const transactionId = params.transactionId as string

  // Check payment status
  const checkPaymentStatus = async () => {
    if (checking) return

    setChecking(true)
    try {
      const response = await fetch(`/api/aba-payway/check-status/${transactionId}`)
      const data = await response.json()

      if (data.success) {
        setPaymentStatus(data)

        if (data.paymentStatus === "completed") {
          toast({
            title: "Payment Successful!",
            description: "Your payment has been processed successfully.",
          })
          setTimeout(() => {
            router.push(`/orders/success/${transactionId}`)
          }, 2000)
        } else if (data.paymentStatus === "failed") {
          toast({
            title: "Payment Failed",
            description: "Your payment could not be processed.",
            variant: "destructive",
          })
        }
      }
    } catch (error) {
      console.error("Error checking payment status:", error)
    } finally {
      setChecking(false)
    }
  }

  // Initialize payment data
  useEffect(() => {
    const initializePayment = async () => {
      try {
        // Get QR code and deeplink from session storage or API
        const qrData = sessionStorage.getItem(`qr_${transactionId}`)
        const deeplinkData = sessionStorage.getItem(`deeplink_${transactionId}`)

        if (qrData && deeplinkData) {
          setQrCode(qrData)
          setDeeplink(deeplinkData)
        }

        // Check initial status
        await checkPaymentStatus()
      } catch (error) {
        console.error("Error initializing payment:", error)
        toast({
          title: "Error",
          description: "Failed to load payment information",
          variant: "destructive",
        })
      } finally {
        setLoading(false)
      }
    }

    if (transactionId) {
      initializePayment()
    }
  }, [transactionId])

  // Poll payment status every 3 seconds
  useEffect(() => {
    if (paymentStatus?.paymentStatus === "pending") {
      const interval = setInterval(checkPaymentStatus, 3000)
      return () => clearInterval(interval)
    }
  }, [paymentStatus?.paymentStatus])

  // Countdown timer
  useEffect(() => {
    if (timeRemaining > 0 && paymentStatus?.paymentStatus === "pending") {
      const timer = setTimeout(() => {
        setTimeRemaining((prev) => prev - 1)
      }, 1000)
      return () => clearTimeout(timer)
    } else if (timeRemaining === 0) {
      setPaymentStatus((prev) => (prev ? { ...prev, paymentStatus: "expired" } : null))
    }
  }, [timeRemaining, paymentStatus?.paymentStatus])

  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60)
    const remainingSeconds = seconds % 60
    return `${minutes}:${remainingSeconds.toString().padStart(2, "0")}`
  }

  const handleOpenMobileApp = () => {
    if (deeplink) {
      window.location.href = deeplink
    }
  }

  const handleRetry = () => {
    router.back()
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    )
  }

  const getStatusIcon = () => {
    switch (paymentStatus?.paymentStatus) {
      case "completed":
        return <CheckCircle className="h-12 w-12 text-green-500" />
      case "failed":
        return <XCircle className="h-12 w-12 text-red-500" />
      case "expired":
        return <Clock className="h-12 w-12 text-orange-500" />
      default:
        return <QrCode className="h-12 w-12 text-blue-500" />
    }
  }

  const getStatusMessage = () => {
    switch (paymentStatus?.paymentStatus) {
      case "completed":
        return {
          title: "Payment Successful!",
          description: "Your payment has been processed successfully. Redirecting...",
          color: "text-green-600",
        }
      case "failed":
        return {
          title: "Payment Failed",
          description: "Your payment could not be processed. Please try again.",
          color: "text-red-600",
        }
      case "expired":
        return {
          title: "Payment Expired",
          description: "This payment session has expired. Please start a new payment.",
          color: "text-orange-600",
        }
      default:
        return {
          title: "Scan QR Code to Pay",
          description: "Use your ABA Mobile app to scan the QR code and complete payment.",
          color: "text-blue-600",
        }
    }
  }

  const statusMessage = getStatusMessage()
  const progressPercentage = ((30 * 60 - timeRemaining) / (30 * 60)) * 100

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-2xl mx-auto px-4">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold mb-2">Complete Your Payment</h1>
          <p className="text-gray-600">Transaction ID: {transactionId}</p>
        </div>

        <Card>
          <CardHeader className="text-center">
            <div className="flex justify-center mb-4">{getStatusIcon()}</div>
            <CardTitle className={statusMessage.color}>{statusMessage.title}</CardTitle>
            <p className="text-gray-600">{statusMessage.description}</p>
          </CardHeader>

          <CardContent className="space-y-6">
            {paymentStatus?.paymentStatus === "pending" && (
              <>
                {/* Timer */}
                <div className="text-center">
                  <div className="text-2xl font-mono font-bold mb-2">{formatTime(timeRemaining)}</div>
                  <Progress value={progressPercentage} className="w-full" />
                  <p className="text-sm text-gray-500 mt-2">Time remaining</p>
                </div>

                {/* QR Code */}
                {qrCode && (
                  <div className="flex justify-center">
                    <div className="bg-white p-4 rounded-lg border-2 border-gray-200">
                      <img src={qrCode || "/placeholder.svg"} alt="Payment QR Code" className="w-64 h-64" />
                    </div>
                  </div>
                )}

                {/* Mobile App Button */}
                <div className="text-center">
                  <Button onClick={handleOpenMobileApp} className="w-full max-w-sm bg-transparent" variant="outline">
                    <Smartphone className="mr-2 h-4 w-4" />
                    Open ABA Mobile App
                  </Button>
                </div>

                {/* Instructions */}
                <div className="bg-blue-50 p-4 rounded-lg">
                  <h3 className="font-semibold mb-2">Payment Instructions:</h3>
                  <ol className="list-decimal list-inside space-y-1 text-sm">
                    <li>Open your ABA Mobile app</li>
                    <li>Tap on "Scan QR" or "Pay"</li>
                    <li>Scan the QR code above</li>
                    <li>Confirm the payment amount</li>
                    <li>Complete the payment</li>
                  </ol>
                </div>

                {/* Payment Details */}
                {paymentStatus && (
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <h3 className="font-semibold mb-2">Payment Details:</h3>
                    <div className="space-y-1 text-sm">
                      <div className="flex justify-between">
                        <span>Amount:</span>
                        <span className="font-semibold">
                          ${paymentStatus.amount.toFixed(2)} {paymentStatus.currency}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span>Status:</span>
                        <span className="capitalize">{paymentStatus.paymentStatus}</span>
                      </div>
                    </div>
                  </div>
                )}
              </>
            )}

            {/* Action Buttons */}
            <div className="flex gap-4">
              {(paymentStatus?.paymentStatus === "failed" || paymentStatus?.paymentStatus === "expired") && (
                <Button onClick={handleRetry} className="flex-1">
                  Try Again
                </Button>
              )}

              <Button variant="outline" onClick={() => router.push("/")} className="flex-1">
                Back to Home
              </Button>
            </div>

            {/* Status Indicator */}
            {checking && (
              <div className="flex items-center justify-center text-sm text-gray-500">
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Checking payment status...
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
