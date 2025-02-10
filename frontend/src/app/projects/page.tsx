"use client"

import { useState, useEffect, useMemo } from "react"
import Link from "next/link"
import { Nav } from "@/components/nav"
import { Input } from "@/components/ui/input"
import { Search, Filter, ArrowUpDown } from "lucide-react"
import { Button } from "@/components/ui/button"
import API from "@/services/api" // Pastikan path sesuai
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { useSearchParams, useRouter } from "next/navigation"

interface Project {
  project_id: number
  project_name: string
  status: string
  timeline_start: string
  timeline_end: string
  expected_calls: number
  completed_calls: number
  client_requirements: string
  created_at: string
  geography: string
}

export default function ProjectsPage() {
  const [projects, setProjects] = useState<Project[]>([])
  const [loading, setLoading] = useState(true)
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc")
  const [statusFilter, setStatusFilter] = useState<string[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const searchParams = useSearchParams()
  const router = useRouter()
  const id = searchParams.get("id")

  // 🔹 Ambil data proyek dari API Django setelah mendapatkan CSRF token
  useEffect(() => {
    const fetchProjects = async () => {
      try {
        await API.get("/api/csrf/") // Ambil CSRF token sebelum request
        const response = await API.get("/projects/", { withCredentials: true })
        setProjects(response.data)
      } catch (error) {
        console.error("Error fetching projects:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchProjects()
  }, [])

  // 🔹 Filter dan urutkan proyek
  const filteredAndSortedProjects = useMemo(() => {
    let filtered = projects

    // Filter berdasarkan status
    if (statusFilter.length > 0) {
      filtered = filtered.filter((project) => statusFilter.includes(project.status))
    }

    // Filter berdasarkan pencarian
    if (searchTerm) {
      filtered = filtered.filter((project) => project.project_name.toLowerCase().includes(searchTerm.toLowerCase()))
    }

    // Urutkan proyek
    return filtered.sort((a, b) => {
      if (sortOrder === "asc") {
        return a.project_name.localeCompare(b.project_name)
      } else {
        return b.project_name.localeCompare(a.project_name)
      }
    })
  }, [projects, sortOrder, statusFilter, searchTerm])

  if (loading) {
    return <div className="flex items-center justify-center h-screen">Loading projects...</div>
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <Nav isProjectDetail={true} projectName={`Project ${id}`} />
      <main className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold text-blue-600">Projects</h1>
          <Link href="/add-project" passHref>
            <Button className="bg-blue-600 hover:bg-blue-700 text-white">+ New Project</Button>
          </Link>
        </div>

        {/* 🔹 Search dan Filter Section */}
        <div className="mb-6 flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0 md:space-x-4">
          <div className="relative flex items-center w-full md:w-1/3">
            <Search className="absolute left-3 text-gray-400" />
            <Input
              type="text"
              placeholder="Search projects..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 rounded-full border-2 border-blue-200 focus:border-blue-400 focus:ring focus:ring-blue-200 focus:ring-opacity-50 bg-white"
            />
          </div>
          <div className="flex space-x-2">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" className="flex items-center">
                  <Filter className="mr-2 h-4 w-4" /> Filter
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                <DropdownMenuCheckboxItem
                  checked={statusFilter.includes("active")}
                  onCheckedChange={(checked) =>
                    setStatusFilter(
                      checked ? [...statusFilter, "active"] : statusFilter.filter((item) => item !== "active"),
                    )
                  }
                >
                  Active
                </DropdownMenuCheckboxItem>
                <DropdownMenuCheckboxItem
                  checked={statusFilter.includes("close")}
                  onCheckedChange={(checked) =>
                    setStatusFilter(
                      checked ? [...statusFilter, "close"] : statusFilter.filter((item) => item !== "close"),
                    )
                  }
                >
                  Close
                </DropdownMenuCheckboxItem>
              </DropdownMenuContent>
            </DropdownMenu>
            <Button
              variant="outline"
              onClick={() => setSortOrder(sortOrder === "asc" ? "desc" : "asc")}
              className="flex items-center"
            >
              <ArrowUpDown className="mr-2 h-4 w-4" />
              Sort: {sortOrder === "asc" ? "A-Z" : "Z-A"}
            </Button>
          </div>
        </div>

        {/* 🔹 Project Table */}
        <div className="bg-white rounded-lg shadow-lg overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Project</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Timeline</TableHead>
                <TableHead>Expected Calls</TableHead>
                <TableHead>Completed Calls</TableHead>
                <TableHead>Geography</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredAndSortedProjects.map((project) => (
                <TableRow key={project.project_id}>
                  <TableCell className="font-medium">
                    <Link
                      href={`/projects/project-detail?id=${project.project_id}`}
                      className="text-blue-600 hover:underline"
                    >
                      {project.project_name}
                    </Link>
                  </TableCell>
                  <TableCell>
                    <Badge variant={project.status === "active" ? "default" : "secondary"} className="rounded-md">
                      {project.status}
                    </Badge>
                  </TableCell>
                  <TableCell>{`${project.timeline_start} - ${project.timeline_end}`}</TableCell>
                  <TableCell>{project.expected_calls}</TableCell>
                  <TableCell>{project.completed_calls}</TableCell>
                  <TableCell>{project.geography}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </main>
    </div>
  )
}

