"use client"

import { useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Search, Plus, Download } from "lucide-react"
import { Nav } from "@/components/nav"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"

// Types
interface Expert {
  id: number
  position: string
  company: string
  period: string
  contactDetails: string
  addedBy: string
  addedAt: string
  status: "Added" | "In Progress"
}

// Sample data
const experts: Expert[] = [
  {
    id: 1,
    position: "Head of Sales & Marketing B2C",
    company: "Tate & Lyle Sugars",
    period: "Oct 2024 - Present",
    contactDetails: "john.doe@email.com",
    addedBy: "Valeri Adelia",
    addedAt: "9 Dec 2024 10:00",
    status: "Added",
  },
  {
    id: 2,
    position: "Commercial Excellence Director",
    company: "TEREOS",
    period: "Mar 2023 - Present",
    contactDetails: "jane.smith@email.com",
    addedBy: "Valeri Adelia",
    addedAt: "9 Dec 2024 17:54",
    status: "In Progress",
  },
]

export default function ProjectExpertsPage() {
  const [searchQuery, setSearchQuery] = useState("")
  const [activeTab, setActiveTab] = useState<"pipeline" | "published">("pipeline")
  const [sortField, setSortField] = useState<keyof Expert | null>(null)
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc")
  const searchParams = useSearchParams()
  const router = useRouter()
  const projectName = searchParams.get("project") || ""

  const decodedProjectName = decodeURIComponent(projectName)
    .split("-")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ")

  const handleSort = (field: keyof Expert) => {
    if (sortField === field) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc")
    } else {
      setSortField(field)
      setSortDirection("asc")
    }
  }

  const sortedExperts = [...experts]
    .filter(
      (expert) =>
        expert.position.toLowerCase().includes(searchQuery.toLowerCase()) ||
        expert.company.toLowerCase().includes(searchQuery.toLowerCase()),
    )
    .sort((a, b) => {
      if (!sortField) return 0
      const aValue = a[sortField]
      const bValue = b[sortField]
      if (sortDirection === "asc") {
        return aValue < bValue ? -1 : 1
      } else {
        return aValue > bValue ? -1 : 1
      }
    })

  const handleAddExpert = () => {
    router.push("/projects/experts/add")
  }

  const getStatusColor = (status: Expert["status"]) => {
    switch (status) {
      case "Added":
        return "bg-green-100 text-green-800"
      case "In Progress":
        return "bg-yellow-100 text-yellow-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Nav isProjectDetail projectName={decodedProjectName} />

      <main className="container mx-auto px-4 py-8">
        <div className="mb-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 flex-1">
            <div className="relative flex-1 max-w-md w-full">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder="Search experts..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 rounded-full border-2 border-blue-200 focus:border-blue-400 focus:ring focus:ring-blue-200 focus:ring-opacity-50 bg-white"
              />
            </div>
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={() => {
                /* Add download logic here */
              }}
              className="rounded-full border-2 border-blue-200 hover:border-blue-400 hover:bg-blue-50"
            >
              <Download className="h-4 w-4 mr-2 text-blue-600" />
              Download
            </Button>
            <Button onClick={handleAddExpert} className="bg-blue-600 hover:bg-blue-700 text-white rounded-full">
              <Plus className="h-4 w-4 mr-2" />
              Add expert
            </Button>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex gap-6 border-b mb-6">
          {["pipeline", "published"].map((tab) => (
            <button
              key={tab}
              className={`relative pb-2 px-4 text-sm transition-all ${
                activeTab === tab
                  ? "text-blue-600 font-semibold border-b-2 border-blue-600"
                  : "text-muted-foreground hover:text-primary"
              }`}
              onClick={() => setActiveTab(tab as "pipeline" | "published")}
            >
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
            </button>
          ))}
        </div>

        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Expert</TableHead>
                  <TableHead>Company</TableHead>
                  <TableHead>Contact details</TableHead>
                  <TableHead>Added by</TableHead>
                  <TableHead>Added at</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {sortedExperts.map((expert) => (
                  <TableRow key={expert.id} className="hover:bg-gray-50">
                    <TableCell className="font-medium">{expert.position}</TableCell>
                    <TableCell>
                      <div>{expert.company}</div>
                      <div className="text-sm text-gray-500">{expert.period}</div>
                    </TableCell>
                    <TableCell>{expert.contactDetails}</TableCell>
                    <TableCell>{expert.addedBy}</TableCell>
                    <TableCell>{expert.addedAt}</TableCell>
                    <TableCell>
                      <Badge className={getStatusColor(expert.status)}>{expert.status}</Badge>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </div>
      </main>
    </div>
  )
}