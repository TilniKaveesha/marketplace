"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Separator } from "@/components/ui/separator"
import { useToast } from "@/hooks/use-toast"
import useCurrentUser from "@/hooks/api/use-current-user"
import { Loader2, Banknote, QrCode, AlertCircle } from 'lucide-react'
import { Alert, AlertDescription } from "@/components/ui/alert"

interface ListingData {
  $id: string
  displayTitle: string
  price: number
  imageUrls: string[]
  shopId: string
  shop: {
    $id: string
    ShopName: string
    userId: string
  }
}

interface CheckoutFormData {
  firstName: string
  lastName: string
  email: string
  phone: string
  address: string
  city: string
  postalCode: string
  paymentMethod: "aba_payway" | "cash_on_delivery"
}

export default function CheckoutPage() {
  const params = useParams()
  const router = useRouter()
  const { toast } = useToast()
  const { data: user, isLoading: userLoading } = useCurrentUser()

  const [listing, setListing] = useState<ListingData | null>(null)
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [formData, setFormData] = useState<CheckoutFormData>({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    address: "",
    city: "",
    postalCode: "",
    paymentMethod: "aba_payway",
  })

  const listingId = params.listingId as string

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!userLoading && !user) {
      router.push("/login")
      return
    }
  }, [user, userLoading, router])

  // Pre-fill form with user data
  useEffect(() => {
    if (user) {
      const nameParts = user.name?.split(" ") || []
      setFormData((prev) => ({
        ...prev,
        firstName: nameParts[0] || "",
        lastName: nameParts.slice(1).join(" ") || "",
        email: user.email || "",
      }))
    }
  }, [user])

  // Fetch listing data
  useEffect(() => {
    const fetchListing = async () => {
      try {
        setError(null)
        const response = await fetch(`/api/listing/${listingId}`)
        if (!response.ok) {
          throw new Error("Failed to fetch listing")
        }
        const data = await response.json()
        setListing(data.listing)
      } catch (error) {
        console.error("Error fetching listing:", error)
        setError("Failed to load listing details")
        toast({
          title: "Error",
          description: "Failed to load listing details",
          variant: "destructive",
        })
      } finally {
        setLoading(false)
      }
    }

    if (listingId) {
      fetchListing()
    }
  }, [listingId, toast])

  const handleInputChange = (field: keyof CheckoutFormData, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }))
  }

  const calculateTotals = () => {
    if (!listing) return { subtotal: 0, shipping: 0, tax: 0, total: 0 }

    const subtotal = listing.price
    const shipping = 5.0
    const tax = subtotal * 0.1
    const total = subtotal + shipping + tax

    return { subtotal, shipping, tax, total }
  }

  const validateForm = (): boolean => {
    const requiredFields = ["firstName", "lastName", "email", "phone", "address", "city", "postalCode"]

    for (const field of requiredFields) {
      if (!formData[field as keyof CheckoutFormData]) {
        toast({
          title: "Validation Error",
          description: `Please fill in the ${field.replace(/([A-Z])/g, " $1").toLowerCase()} field`,
          variant: "destructive",
        })
        return false
      }
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(formData.email)) {
      toast({
        title: "Validation Error",
        description: "Please enter a valid email address",
        variant: "destructive",
      })
      return false
    }

    // Phone validation (basic)
    if (formData.phone.length < 8) {
      toast({
        title: "Validation Error",
        description: "Please enter a valid phone number",
        variant: "destructive",
      })
      return false
    }

    return true
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!listing || !user) return

    if (!validateForm()) return

    setSubmitting(true)
    setError(null)

    try {
      const { total } = calculateTotals()

      const orderData = {
        firstName: formData.firstName,
        lastName: formData.lastName,
        email: formData.email,
        phone: formData.phone,
        address: formData.address,
        city: formData.city,
        postalCode: formData.postalCode,
        paymentMethod: formData.paymentMethod,
        currency: "USD",
        quantity: 1,
        listingId: listing.$id,
        shopId: listing.shopId,
        amount: total,
        items: [
          {
            name: listing.displayTitle,
            quantity: 1,
            price: listing.price,
          },
        ],
      }

      if (formData.paymentMethod === "aba_payway") {
        // Generate QR code for ABA PayWay
        const qrResponse = await fetch("/api/aba-payway/generate-qr", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            amount: total,
            currency: "USD",
            items: orderData.items,
            customer: {
              firstName: formData.firstName,
              lastName: formData.lastName,
              email: formData.email,
              phone: formData.phone,
            },
            shipping: {
              address: formData.address,
              city: formData.city,
              postalCode: formData.postalCode,
            },
            listingId: listing.$id,
            shopId: listing.shopId,
          }),
        })

        const qrResult = await qrResponse.json()

        if (!qrResponse.ok) {
          throw new Error(qrResult.error || "Failed to generate QR code")
        }

        // Store QR data in session storage for the payment page
        sessionStorage.setItem(`payment_${qrResult.transactionId}`, JSON.stringify({
          success: true,
          transactionId: qrResult.transactionId,
          qrString: qrResult.qrString,
          qrImage: qrResult.qrImage,
          abapayDeeplink: qrResult.abapayDeeplink,
          appStore: qrResult.appStore,
          playStore: qrResult.playStore,
          amount: total,
          currency: "USD",
          expiresAt: qrResult.expiresAt,
        }))

        router.push(`/payment/qr/${qrResult.transactionId}`)
      } else {
        // Cash on delivery - create order directly
        const orderResponse = await fetch("/api/checkout", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(orderData),
        })

        const orderResult = await orderResponse.json()

        if (!orderResponse.ok) {
          throw new Error(orderResult.error || "Failed to create order")
        }

        toast({
          title: "Order Created",
          description: "Your cash on delivery order has been placed successfully!",
        })

        router.push(`/orders/success/${orderResult.orderId}`)
      }
    } catch (error: any) {
      console.error("Checkout error:", error)
      setError(error.message || "Something went wrong during checkout")
      toast({
        title: "Checkout Failed",
        description: error.message || "Something went wrong during checkout",
        variant: "destructive",
      })
    } finally {
      setSubmitting(false)
    }
  }

  if (userLoading || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    )
  }

  if (error && !listing) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center max-w-md">
          <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <h1 className="text-2xl font-bold mb-2">Error Loading Listing</h1>
          <p className="text-gray-600 mb-4">{error}</p>
          <Button onClick={() => router.push("/")}>Go Home</Button>
        </div>
      </div>
    )
  }

  if (!listing) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-2">Listing Not Found</h1>
          <p className="text-gray-600 mb-4">The item you're trying to purchase could not be found.</p>
          <Button onClick={() => router.push("/")}>Go Home</Button>
        </div>
      </div>
    )
  }

  const { subtotal, shipping, tax, total } = calculateTotals()

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        <div className="mb-8">
          <h1 className="text-3xl font-bold">Checkout</h1>
          <p className="text-gray-600">Complete your purchase</p>
        </div>

        {error && (
          <Alert className="mb-6" variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Checkout Form */}
          <Card>
            <CardHeader>
              <CardTitle>Shipping Information</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="firstName">First Name *</Label>
                    <Input
                      id="firstName"
                      value={formData.firstName}
                      onChange={(e) => handleInputChange("firstName", e.target.value)}
                      required
                      disabled={submitting}
                    />
                  </div>
                  <div>
                    <Label htmlFor="lastName">Last Name *</Label>
                    <Input
                      id="lastName"
                      value={formData.lastName}
                      onChange={(e) => handleInputChange("lastName", e.target.value)}
                      required
                      disabled={submitting}
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="email">Email *</Label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => handleInputChange("email", e.target.value)}
                    required
                    disabled={submitting}
                  />
                </div>

                <div>
                  <Label htmlFor="phone">Phone Number *</Label>
                  <Input
                    id="phone"
                    value={formData.phone}
                    onChange={(e) => handleInputChange("phone", e.target.value)}
                    required
                    disabled={submitting}
                    placeholder="e.g., +855123456789"
                  />
                </div>

                <div>
                  <Label htmlFor="address">Address *</Label>
                  <Input
                    id="address"
                    value={formData.address}
                    onChange={(e) => handleInputChange("address", e.target.value)}
                    required
                    disabled={submitting}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="city">City *</Label>
                    <Input
                      id="city"
                      value={formData.city}
                      onChange={(e) => handleInputChange("city", e.target.value)}
                      required
                      disabled={submitting}
                    />
                  </div>
                  <div>
                    <Label htmlFor="postalCode">Postal Code *</Label>
                    <Input
                      id="postalCode"
                      value={formData.postalCode}
                      onChange={(e) => handleInputChange("postalCode", e.target.value)}
                      required
                      disabled={submitting}
                    />
                  </div>
                </div>

                <Separator />

                <div>
                  <Label className="text-base font-semibold">Payment Method</Label>
                  <RadioGroup
                    value={formData.paymentMethod}
                    onValueChange={(value) => handleInputChange("paymentMethod", value)}
                    className="mt-2"
                    disabled={submitting}
                  >
                    <div className="flex items-center space-x-2 p-3 border rounded-lg">
                      <RadioGroupItem value="aba_payway" id="aba_payway" />
                      <QrCode className="h-5 w-5" />
                      <div className="flex-1">
                        <Label htmlFor="aba_payway" className="cursor-pointer font-medium">
                          ABA PayWay (QR Code)
                        </Label>
                        <p className="text-sm text-gray-500">Pay using ABA Mobile app</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2 p-3 border rounded-lg">
                      <RadioGroupItem value="cash_on_delivery" id="cash_on_delivery" />
                      <Banknote className="h-5 w-5" />
                      <div className="flex-1">
                        <Label htmlFor="cash_on_delivery" className="cursor-pointer font-medium">
                          Cash on Delivery
                        </Label>
                        <p className="text-sm text-gray-500">Pay when you receive the item</p>
                      </div>
                    </div>
                  </RadioGroup>
                </div>

                <Button type="submit" className="w-full" disabled={submitting}>
                  {submitting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Processing...
                    </>
                  ) : (
                    <>
                      {formData.paymentMethod === "aba_payway" ? (
                        <>
                          <QrCode className="mr-2 h-4 w-4" />
                          Generate QR Code
                        </>
                      ) : (
                        <>
                          <Banknote className="mr-2 h-4 w-4" />
                          Place Order
                        </>
                      )}
                    </>
                  )}
                </Button>
              </form>
            </CardContent>
          </Card>

          {/* Order Summary */}
          <Card>
            <CardHeader>
              <CardTitle>Order Summary</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center space-x-4">
                <img
                  src={listing.imageUrls?.[0] || "/placeholder.svg?height=80&width=80"}
                  alt={listing.displayTitle}
                  className="w-20 h-20 object-cover rounded-lg"
                />
                <div className="flex-1">
                  <h3 className="font-semibold">{listing.displayTitle}</h3>
                  <p className="text-sm text-gray-600">Qty: 1</p>
                  <p className="font-semibold">${listing.price.toFixed(2)}</p>
                </div>
              </div>

              <Separator />

              <div className="space-y-2">
                <div className="flex justify-between">
                  <span>Subtotal</span>
                  <span>${subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Shipping</span>
                  <span>${shipping.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Tax (10%)</span>
                  <span>${tax.toFixed(2)}</span>
                </div>
                <Separator />
                <div className="flex justify-between font-semibold text-lg">
                  <span>Total</span>
                  <span>${total.toFixed(2)}</span>
                </div>
              </div>

              <div className="text-sm text-gray-600 space-y-1">
                <p>• Secure payment processing</p>
                <p>• 30-day return policy</p>
                <p>• Customer support available</p>
                <p>• Free shipping on orders over $50</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
