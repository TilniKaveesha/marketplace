"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Download, FileText, BarChart3, Users, Package, DownloadCloud, Calendar, Database } from "lucide-react"
import { AdminStatsCard } from "./AdminStatsCard"

export function AdminReportsContent() {
  const [reportType, setReportType] = useState("overview")
  const [startDate, setStartDate] = useState("")
  const [endDate, setEndDate] = useState("")
  const [loading, setLoading] = useState(false)

  const reportTypes = [
    { value: "overview", label: "Overview Report", icon: BarChart3 },
    { value: "sales", label: "Sales Report", icon: FileText },
    { value: "users", label: "Users Report", icon: Users },
    { value: "inventory", label: "Inventory Report", icon: Package },
  ]

  const generateReport = async (format = "json") => {
    try {
      setLoading(true)
      const params = new URLSearchParams({
        type: reportType,
        format,
        ...(startDate && { startDate }),
        ...(endDate && { endDate }),
      })

      const response = await fetch(`/api/admin/reports?${params}`)

      if (format === "csv") {
        const blob = await response.blob()
        const url = window.URL.createObjectURL(blob)
        const a = document.createElement("a")
        a.href = url
        a.download = `${reportType}-report.csv`
        document.body.appendChild(a)
        a.click()
        window.URL.revokeObjectURL(url)
        document.body.removeChild(a)
      } else {
        const data = await response.json()
        console.log("Report data:", data)
        // Handle JSON report display
      }
    } catch (error) {
      console.error("Failed to generate report:", error)
    } finally {
      setLoading(false)
    }
  }

  
const quickStats = [
  {
    title: "Reports Generated",
    value: "156",
    description: "This month",
    trend: "up",
    change: "+23% from last month",  // Use 'change' here
    icon: BarChart3,
  },
  {
    title: "Data Exports",
    value: "89",
    description: "CSV downloads",
    trend: "up",
    change: "+12% from last month",
    icon: DownloadCloud,
  },
  {
    title: "Scheduled Reports",
    value: "12",
    description: "Automated reports",
    trend: "up",
    change: "Active",
    icon: Calendar,
  },
  {
    title: "Report Storage",
    value: "2.4 GB",
    description: "Total data size",
    trend: "up",
    change: "+8% from last month",
    icon: Database,
  },
]


  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {quickStats.map((stat, index) => (
          <AdminStatsCard key={index} {...stat} />
        ))}
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Report Generator */}
        <Card>
          <CardHeader>
            <CardTitle>Generate Report</CardTitle>
            <CardDescription>Create custom reports with specific date ranges and formats</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="report-type">Report Type</Label>
              <Select value={reportType} onValueChange={setReportType}>
                <SelectTrigger>
                  <SelectValue placeholder="Select report type" />
                </SelectTrigger>
                <SelectContent>
                  {reportTypes.map((type) => (
                    <SelectItem key={type.value} value={type.value}>
                      <div className="flex items-center space-x-2">
                        <type.icon className="h-4 w-4" />
                        <span>{type.label}</span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="start-date">Start Date</Label>
                <Input id="start-date" type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="end-date">End Date</Label>
                <Input id="end-date" type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} />
              </div>
            </div>

            <div className="flex space-x-2">
              <Button onClick={() => generateReport("json")} disabled={loading} className="flex-1">
                <FileText className="mr-2 h-4 w-4" />
                View Report
              </Button>
              <Button onClick={() => generateReport("csv")} disabled={loading} variant="outline" className="flex-1">
                <Download className="mr-2 h-4 w-4" />
                Export CSV
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Report Templates */}
        <Card>
          <CardHeader>
            <CardTitle>Quick Reports</CardTitle>
            <CardDescription>Pre-configured reports for common use cases</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {reportTypes.map((type) => (
              <div key={type.value} className="flex items-center justify-between p-3 border rounded-lg">
                <div className="flex items-center space-x-3">
                  <type.icon className="h-5 w-5 text-muted-foreground" />
                  <div>
                    <div className="font-medium">{type.label}</div>
                    <div className="text-sm text-muted-foreground">
                      {type.value === "overview" && "Complete platform overview"}
                      {type.value === "sales" && "Revenue and transaction data"}
                      {type.value === "users" && "User registration and activity"}
                      {type.value === "inventory" && "Listing and inventory data"}
                    </div>
                  </div>
                </div>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => {
                    setReportType(type.value)
                    generateReport("csv")
                  }}
                  disabled={loading}
                >
                  <Download className="h-4 w-4" />
                </Button>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      {/* Recent Reports */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Reports</CardTitle>
          <CardDescription>Previously generated reports and exports</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[
              { name: "Sales Report - December 2024", type: "sales", date: "2024-12-01", size: "2.1 MB" },
              { name: "User Activity Report", type: "users", date: "2024-11-28", size: "1.8 MB" },
              { name: "Inventory Overview", type: "inventory", date: "2024-11-25", size: "3.2 MB" },
              { name: "Platform Overview - November", type: "overview", date: "2024-11-01", size: "4.5 MB" },
            ].map((report, index) => (
              <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                <div className="flex items-center space-x-3">
                  <FileText className="h-5 w-5 text-muted-foreground" />
                  <div>
                    <div className="font-medium">{report.name}</div>
                    <div className="text-sm text-muted-foreground">
                      Generated on {new Date(report.date).toLocaleDateString()} • {report.size}
                    </div>
                  </div>
                </div>
                <Button size="sm" variant="outline">
                  <Download className="h-4 w-4" />
                </Button>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
