"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { useToast } from "@/hooks/use-toast"
import { Loader2, CheckCircle, XCircle, Clock, Smartphone, QrCode, Copy, ExternalLink } from 'lucide-react'

interface PaymentData {
  success: boolean
  transactionId: string
  qrString: string
  qrImage: string
  abapayDeeplink: string
  appStore: string
  playStore: string
  amount: number
  currency: string
  expiresAt: string
}

interface TransactionStatus {
  success: boolean
  transaction: {
    id: string
    status: string
    paymentStatus: string
    amount: number
    currency: string
    createdAt: string
    updatedAt: string
    paidAt?: string
  }
}

export default function QRPaymentPage() {
  const params = useParams()
  const router = useRouter()
  const { toast } = useToast()

  const [paymentData, setPaymentData] = useState<PaymentData | null>(null)
  const [transactionStatus, setTransactionStatus] = useState<TransactionStatus | null>(null)
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
        setTransactionStatus(data)

        if (data.transaction.paymentStatus === "completed") {
          toast({
            title: "Payment Successful!",
            description: "Your payment has been processed successfully.",
          })
          setTimeout(() => {
            router.push(`/orders/success/${transactionId}`)
          }, 2000)
        } else if (data.transaction.paymentStatus === "failed") {
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

  // Initialize payment data from session storage or fetch from API
  useEffect(() => {
    const initializePayment = async () => {
      try {
        // Try to get data from session storage first
        const storedData = sessionStorage.getItem(`payment_${transactionId}`)
        if (storedData) {
          const data = JSON.parse(storedData)
          setPaymentData(data)
          console.log("Payment data loaded from session:", data)
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

  // Poll payment status every 5 seconds if payment is pending
  useEffect(() => {
    if (transactionStatus?.transaction.paymentStatus === "pending") {
      const interval = setInterval(checkPaymentStatus, 5000)
      return () => clearInterval(interval)
    }
  }, [transactionStatus?.transaction.paymentStatus])

  // Countdown timer
  useEffect(() => {
    if (timeRemaining > 0 && transactionStatus?.transaction.paymentStatus === "pending") {
      const timer = setTimeout(() => {
        setTimeRemaining((prev) => prev - 1)
      }, 1000)
      return () => clearTimeout(timer)
    } else if (timeRemaining === 0) {
      setTransactionStatus((prev) => 
        prev ? {
          ...prev,
          transaction: { ...prev.transaction, paymentStatus: "expired" }
        } : null
      )
    }
  }, [timeRemaining, transactionStatus?.transaction.paymentStatus])

  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60)
    const remainingSeconds = seconds % 60
    return `${minutes}:${remainingSeconds.toString().padStart(2, "0")}`
  }

  const handleOpenMobileApp = () => {
    if (paymentData?.abapayDeeplink) {
      window.location.href = paymentData.abapayDeeplink
    }
  }

  const handleCopyQR = () => {
    if (paymentData?.qrString) {
      navigator.clipboard.writeText(paymentData.qrString)
      toast({
        title: "Copied!",
        description: "QR code string copied to clipboard",
      })
    }
  }

  const handleRetry = () => {
    router.back()
  }

  const getStatusIcon = () => {
    switch (transactionStatus?.transaction.paymentStatus) {
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
    switch (transactionStatus?.transaction.paymentStatus) {
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

  // Get the correct amount and currency - prioritize paymentData over transactionStatus
  const getPaymentAmount = () => {
    if (paymentData) {
      return {
        amount: paymentData.amount,
        currency: paymentData.currency
      }
    } else if (transactionStatus) {
      return {
        amount: transactionStatus.transaction.amount,
        currency: transactionStatus.transaction.currency
      }
    }
    return { amount: 0, currency: "USD" }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
          <p>Loading payment information...</p>
        </div>
      </div>
    )
  }

  const statusMessage = getStatusMessage()
  const progressPercentage = ((30 * 60 - timeRemaining) / (30 * 60)) * 100
  const { amount, currency } = getPaymentAmount()

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
            {transactionStatus?.transaction.paymentStatus === "pending" && (
              <>
                {/* Timer */}
                <div className="text-center">
                  <div className="text-2xl font-mono font-bold mb-2">{formatTime(timeRemaining)}</div>
                  <Progress value={progressPercentage} className="w-full" />
                  <p className="text-sm text-gray-500 mt-2">Time remaining</p>
                </div>

                {/* QR Code */}
                {paymentData?.qrImage && (
                  <div className="flex justify-center">
                    <div className="bg-white p-4 rounded-lg border-2 border-gray-200 relative">
                      <img 
                        src={paymentData.qrImage || "/placeholder.svg"} 
                        alt="Payment QR Code" 
                        className="w-150 h-150 object-contain mx-auto" 
                      />
                      <Button
                        variant="outline"
                        size="sm"
                        className="absolute top-2 right-2"
                        onClick={handleCopyQR}
                      >
                        <Copy className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                )}

                {/* Action Buttons */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <Button onClick={handleOpenMobileApp} className="w-full">
                    <Smartphone className="mr-2 h-4 w-4" />
                    Open ABA Mobile
                  </Button>
                  
                  {paymentData?.appStore && (
                    <Button 
                      variant="outline" 
                      className="w-full"
                      onClick={() => window.open(paymentData.appStore, '_blank')}
                    >
                      <ExternalLink className="mr-2 h-4 w-4" />
                      Download App
                    </Button>
                  )}
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
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h3 className="font-semibold mb-2">Payment Details:</h3>
                  <div className="space-y-1 text-sm">
                    <div className="flex justify-between">
                      <span>Amount:</span>
                      <span className="font-semibold">
                        ${amount.toFixed(2)} {currency}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span>Status:</span>
                      <span className="capitalize">
                        {transactionStatus?.transaction.paymentStatus || "pending"}
                      </span>
                    </div>
                    {transactionStatus?.transaction.createdAt && (
                      <div className="flex justify-between">
                        <span>Created:</span>
                        <span>{new Date(transactionStatus.transaction.createdAt).toLocaleString()}</span>
                      </div>
                    )}
                    {paymentData?.expiresAt && (
                      <div className="flex justify-between">
                        <span>Expires:</span>
                        <span>{new Date(paymentData.expiresAt).toLocaleString()}</span>
                      </div>
                    )}
                  </div>
                </div>
              </>
            )}

            {/* Success State */}
            {transactionStatus?.transaction.paymentStatus === "completed" && (
              <div className="text-center space-y-4">
                <div className="bg-green-50 p-4 rounded-lg">
                  <h3 className="font-semibold text-green-800 mb-2">Payment Completed!</h3>
                  <p className="text-green-700">
                    Your payment of ${amount.toFixed(2)} {currency} has been processed successfully.
                  </p>
                  {transactionStatus.transaction.paidAt && (
                    <p className="text-sm text-green-600 mt-2">
                      Paid at: {new Date(transactionStatus.transaction.paidAt).toLocaleString()}
                    </p>
                  )}
                </div>
              </div>
            )}

            {/* Failed State */}
            {transactionStatus?.transaction.paymentStatus === "failed" && (
              <div className="text-center space-y-4">
                <div className="bg-red-50 p-4 rounded-lg">
                  <h3 className="font-semibold text-red-800 mb-2">Payment Failed</h3>
                  <p className="text-red-700">
                    Your payment of ${amount.toFixed(2)} {currency} could not be processed.
                  </p>
                  <p className="text-sm text-red-600 mt-2">
                    Please try again or contact support if the issue persists.
                  </p>
                </div>
              </div>
            )}

            {/* Action Buttons for Failed/Expired */}
            <div className="flex gap-4">
              {(transactionStatus?.transaction.paymentStatus === "failed" || 
                transactionStatus?.transaction.paymentStatus === "expired") && (
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
