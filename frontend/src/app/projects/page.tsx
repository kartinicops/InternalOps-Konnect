"use client"

import { useState, useEffect, useMemo } from "react"
import Link from "next/link"
import { Nav } from "@/components/nav"
import { Input } from "@/components/ui/input"
import { Search, Filter, ArrowUpDown, Pencil, Trash2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import API from "@/services/api"
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"

interface Project {
  project_id: number
  project_name: string
  status: boolean
  timeline_start: string
  timeline_end: string
  expected_calls: number
  completed_calls: number
  client_requirements: string
  created_at: string
}

export default function ProjectsPage() {
  const [projects, setProjects] = useState<Project[]>([])
  const [loading, setLoading] = useState(true)
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc")
  const [statusFilter, setStatusFilter] = useState<string[]>([])
  const [searchTerm, setSearchTerm] = useState("")

  useEffect(() => {
    const fetchProjects = async () => {
      try {
        await API.get("/api/csrf/")
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

  const filteredAndSortedProjects = useMemo(() => {
    let filtered = projects

    if (statusFilter.length > 0) {
      filtered = filtered.filter((project) => {
        return statusFilter.includes(project.status ? "closed" : "active")
      })
    }

    if (searchTerm) {
      filtered = filtered.filter((project) => project.project_name.toLowerCase().includes(searchTerm.toLowerCase()))
    }

    return filtered.sort((a, b) => {
      if (sortOrder === "asc") {
        return a.project_name.localeCompare(b.project_name)
      } else {
        return b.project_name.localeCompare(a.project_name)
      }
    })
  }, [projects, sortOrder, statusFilter, searchTerm])

  const handleDelete = (projectId: number) => {
    console.log(`Delete project with id: ${projectId}`)
  }

  if (loading) {
    return <div className="flex items-center justify-center h-screen">Loading projects...</div>
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <Nav />
      <main className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold text-blue-600 px-28">Projects</h1>
        </div>

        <div className="bg-white rounded-lg shadow-lg overflow-hidden max-w-screen-xl mx-auto p-2">
          {/* Search and Filter Section - Now inside the white container */}
          <div className="px-2 py-4 border-b border-gray-200">
            <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0 md:space-x-4">
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
              <div className="flex items-center space-x-2">
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
                      checked={statusFilter.includes("closed")}
                      onCheckedChange={(checked) =>
                        setStatusFilter(
                          checked ? [...statusFilter, "closed"] : statusFilter.filter((item) => item !== "closed"),
                        )
                      }
                    >
                      Closed
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
                <Link href="/add-project" passHref>
                  <Button className="bg-blue-600 hover:bg-blue-700 text-white">+ New Project</Button>
                </Link>
              </div>
            </div>
          </div>

          {/* Project Table */}
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="text-center">Project</TableHead>
                <TableHead className="text-center">Status</TableHead>
                <TableHead className="text-center">Timeline</TableHead>
                <TableHead className="text-center">Expected Calls</TableHead>
                <TableHead className="text-center">Completed Calls</TableHead>
                <TableHead className="w-[100px] text-center">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredAndSortedProjects.map((project) => (
                <TableRow key={project.project_id} className="text-center">
                  <TableCell>
                    <Link
                      href={`/projects/project-detail?id=${project.project_id}`}
                      className="text-blue-600 hover:underline"
                    >
                      {project.project_name}
                    </Link>
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant={project.status ? "default" : "secondary"}
                      className={`rounded-md ${project.status ? "bg-green-100 text-green-800" : "bg-blue-100 text-blue-800"}`}
                    >
                      {project.status ? "Closed" : "Active"}
                    </Badge>
                  </TableCell>
                  <TableCell>{`${project.timeline_start} - ${project.timeline_end}`}</TableCell>
                  <TableCell>{project.expected_calls}</TableCell>
                  <TableCell>{project.completed_calls}</TableCell>
                  <TableCell>
                    <div className="flex justify-center space-x-2">
                      <Link href={`/projects/edit-project?id=${project.project_id}`} passHref>
                        <Button variant="ghost" size="icon">
                          <Pencil className="h-4 w-4" />
                        </Button>
                      </Link>
                      <Button variant="ghost" size="icon" onClick={() => handleDelete(project.project_id)}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </main>
    </div>
  )
}

