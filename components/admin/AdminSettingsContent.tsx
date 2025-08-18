"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useToast } from "@/hooks/use-toast"
import { Globe, CreditCard, Shield, Bell, Users, Store } from "lucide-react"

interface AdminSettings {
  platform: {
    siteName: string
    currency: string
    timezone: string
    maintenanceMode: boolean
  }
  payment: {
    commissionRate: number
    payoutSchedule: string
    minimumPayout: number
  }
  security: {
    twoFactorRequired: boolean
    passwordMinLength: number
    sessionTimeout: number
  }
}

interface AdminSettingsContentProps {
  initialSettings: AdminSettings
}

export function AdminSettingsContent({ initialSettings }: AdminSettingsContentProps) {
  const [settings, setSettings] = useState(initialSettings)
  const [loading, setLoading] = useState(false)
  const { toast } = useToast()

  const updateSettings = async (category: string, newSettings: any) => {
    setLoading(true)
    try {
      const response = await fetch("/api/admin/settings", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ category, settings: newSettings }),
      })

      if (response.ok) {
        setSettings((prev) => ({
          ...prev,
          [category]: newSettings,
        }))
        toast({
          title: "Settings Updated",
          description: `${category} settings have been saved successfully.`,
        })
      } else {
        throw new Error("Failed to update settings")
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update settings. Please try again.",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Admin Settings</h1>
          <p className="text-muted-foreground">Manage your marketplace configuration and preferences</p>
        </div>
      </div>

      <Tabs defaultValue="platform" className="space-y-4">
        <TabsList className="grid w-full grid-cols-6">
          <TabsTrigger value="platform" className="flex items-center gap-2">
            <Globe className="h-4 w-4" />
            Platform
          </TabsTrigger>
          <TabsTrigger value="payment" className="flex items-center gap-2">
            <CreditCard className="h-4 w-4" />
            Payment
          </TabsTrigger>
          <TabsTrigger value="security" className="flex items-center gap-2">
            <Shield className="h-4 w-4" />
            Security
          </TabsTrigger>
          <TabsTrigger value="notifications" className="flex items-center gap-2">
            <Bell className="h-4 w-4" />
            Notifications
          </TabsTrigger>
          <TabsTrigger value="users" className="flex items-center gap-2">
            <Users className="h-4 w-4" />
            Users
          </TabsTrigger>
          <TabsTrigger value="marketplace" className="flex items-center gap-2">
            <Store className="h-4 w-4" />
            Marketplace
          </TabsTrigger>
        </TabsList>

        <TabsContent value="platform" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Platform Settings</CardTitle>
              <CardDescription>Configure basic platform information and behavior</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="siteName">Site Name</Label>
                  <Input
                    id="siteName"
                    value={settings.platform.siteName}
                    onChange={(e) =>
                      setSettings((prev) => ({
                        ...prev,
                        platform: { ...prev.platform, siteName: e.target.value },
                      }))
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="currency">Default Currency</Label>
                  <Select
                    value={settings.platform.currency}
                    onValueChange={(value) =>
                      setSettings((prev) => ({
                        ...prev,
                        platform: { ...prev.platform, currency: value },
                      }))
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="USD">USD - US Dollar</SelectItem>
                      <SelectItem value="EUR">EUR - Euro</SelectItem>
                      <SelectItem value="GBP">GBP - British Pound</SelectItem>
                      <SelectItem value="KHR">KHR - Cambodian Riel</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="timezone">Timezone</Label>
                <Select
                  value={settings.platform.timezone}
                  onValueChange={(value) =>
                    setSettings((prev) => ({
                      ...prev,
                      platform: { ...prev.platform, timezone: value },
                    }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="UTC">UTC</SelectItem>
                    <SelectItem value="America/New_York">Eastern Time</SelectItem>
                    <SelectItem value="America/Los_Angeles">Pacific Time</SelectItem>
                    <SelectItem value="Asia/Phnom_Penh">Cambodia Time</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex items-center space-x-2">
                <Switch
                  id="maintenanceMode"
                  checked={settings.platform.maintenanceMode}
                  onCheckedChange={(checked) =>
                    setSettings((prev) => ({
                      ...prev,
                      platform: { ...prev.platform, maintenanceMode: checked },
                    }))
                  }
                />
                <Label htmlFor="maintenanceMode">Maintenance Mode</Label>
              </div>
              <Button
                onClick={() => updateSettings("platform", settings.platform)}
                disabled={loading}
                className="w-full"
              >
                Save Platform Settings
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="payment" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Payment Settings</CardTitle>
              <CardDescription>Configure payment processing and commission rates</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="commissionRate">Commission Rate (%)</Label>
                  <Input
                    id="commissionRate"
                    type="number"
                    min="0"
                    max="100"
                    step="0.1"
                    value={settings.payment.commissionRate}
                    onChange={(e) =>
                      setSettings((prev) => ({
                        ...prev,
                        payment: { ...prev.payment, commissionRate: Number.parseFloat(e.target.value) },
                      }))
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="minimumPayout">Minimum Payout ($)</Label>
                  <Input
                    id="minimumPayout"
                    type="number"
                    min="0"
                    value={settings.payment.minimumPayout}
                    onChange={(e) =>
                      setSettings((prev) => ({
                        ...prev,
                        payment: { ...prev.payment, minimumPayout: Number.parseInt(e.target.value) },
                      }))
                    }
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="payoutSchedule">Payout Schedule</Label>
                <Select
                  value={settings.payment.payoutSchedule}
                  onValueChange={(value) =>
                    setSettings((prev) => ({
                      ...prev,
                      payment: { ...prev.payment, payoutSchedule: value },
                    }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="daily">Daily</SelectItem>
                    <SelectItem value="weekly">Weekly</SelectItem>
                    <SelectItem value="monthly">Monthly</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <Button onClick={() => updateSettings("payment", settings.payment)} disabled={loading} className="w-full">
                Save Payment Settings
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="security" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Security Settings</CardTitle>
              <CardDescription>Configure security policies and requirements</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center space-x-2">
                <Switch
                  id="twoFactorRequired"
                  checked={settings.security.twoFactorRequired}
                  onCheckedChange={(checked) =>
                    setSettings((prev) => ({
                      ...prev,
                      security: { ...prev.security, twoFactorRequired: checked },
                    }))
                  }
                />
                <Label htmlFor="twoFactorRequired">Require Two-Factor Authentication</Label>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="passwordMinLength">Minimum Password Length</Label>
                  <Input
                    id="passwordMinLength"
                    type="number"
                    min="6"
                    max="32"
                    value={settings.security.passwordMinLength}
                    onChange={(e) =>
                      setSettings((prev) => ({
                        ...prev,
                        security: { ...prev.security, passwordMinLength: Number.parseInt(e.target.value) },
                      }))
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="sessionTimeout">Session Timeout (hours)</Label>
                  <Input
                    id="sessionTimeout"
                    type="number"
                    min="1"
                    max="168"
                    value={settings.security.sessionTimeout}
                    onChange={(e) =>
                      setSettings((prev) => ({
                        ...prev,
                        security: { ...prev.security, sessionTimeout: Number.parseInt(e.target.value) },
                      }))
                    }
                  />
                </div>
              </div>
              <Button
                onClick={() => updateSettings("security", settings.security)}
                disabled={loading}
                className="w-full"
              >
                Save Security Settings
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="notifications" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Notification Settings</CardTitle>
              <CardDescription>Configure system notifications and alerts</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-4">
                <div className="flex items-center space-x-2">
                  <Switch id="emailNotifications" defaultChecked />
                  <Label htmlFor="emailNotifications">Email Notifications</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Switch id="smsNotifications" />
                  <Label htmlFor="smsNotifications">SMS Notifications</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Switch id="pushNotifications" defaultChecked />
                  <Label htmlFor="pushNotifications">Push Notifications</Label>
                </div>
              </div>
              <Button className="w-full">Save Notification Settings</Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="users" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>User Management Settings</CardTitle>
              <CardDescription>Configure user registration and management policies</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-4">
                <div className="flex items-center space-x-2">
                  <Switch id="allowRegistration" defaultChecked />
                  <Label htmlFor="allowRegistration">Allow New User Registration</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Switch id="requireEmailVerification" defaultChecked />
                  <Label htmlFor="requireEmailVerification">Require Email Verification</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Switch id="requirePhoneVerification" />
                  <Label htmlFor="requirePhoneVerification">Require Phone Verification</Label>
                </div>
              </div>
              <Button className="w-full">Save User Settings</Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="marketplace" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Marketplace Settings</CardTitle>
              <CardDescription>Configure marketplace behavior and policies</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-4">
                <div className="flex items-center space-x-2">
                  <Switch id="autoApproveListings" />
                  <Label htmlFor="autoApproveListings">Auto-approve New Listings</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Switch id="allowGuestCheckout" defaultChecked />
                  <Label htmlFor="allowGuestCheckout">Allow Guest Checkout</Label>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="maxImagesPerListing">Max Images per Listing</Label>
                  <Input id="maxImagesPerListing" type="number" min="1" max="20" defaultValue="10" />
                </div>
              </div>
              <Button className="w-full">Save Marketplace Settings</Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
