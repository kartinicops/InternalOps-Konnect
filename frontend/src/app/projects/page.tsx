"use client"

import { useState, useEffect, useMemo } from "react"
import Link from "next/link"
import { Nav } from "@/components/nav"
import { Input } from "@/components/ui/input"
import {
  Search,
  ArrowUpDown,
  Pencil,
  Trash2,
  MoreHorizontal,
  Plus,
  Eye,
  ChevronLeft,
  ChevronRight,
  CheckCircle,
  Clock,
  Calendar,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import API from "@/services/api"
import { getAuthHeader } from "@/services/auth-header";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
  DropdownMenuItem,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { ToastContainer, toast } from "react-toastify"
import "react-toastify/dist/ReactToastify.css"

interface Project {
  project_id: number
  project_name: string
  status: boolean
  timeline_start: string
  timeline_end: string
  expected_calls: number
  completed_calls: number
  client_requirements: string
  client_company_id: number
  geography_id: number
  created_at: string
}

export default function ProjectsPage() {
  const [projects, setProjects] = useState<Project[]>([])
  const [loading, setLoading] = useState(true)
  const [sortField, setSortField] = useState<"name" | "timeline">("name")
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc")
  const [statusFilter, setStatusFilter] = useState<string[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [deleteProjectId, setDeleteProjectId] = useState<number | null>(null)
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [clients, setClients] = useState<Record<number, string>>({})
  const [geographies, setGeographies] = useState<Record<number, string>>({})

  // Fixed to 10 items per page as requested
  const itemsPerPage = 10
  const [currentPage, setCurrentPage] = useState(1)

  useEffect(() => {
    const fetchProjects = async () => {
      try {
        const response = await API.get("/projects/")
        
        const projectsData = response.data
        setProjects(projectsData)

        // Fetch clients and geographies
        const fetchClients = async () => {
          try {
            const clientResponse = await API.get("/project_client_company/", {
              headers: {
                Authorization: sessionStorage.getItem("auth_token") || "",
              },
            })

            const clientData = clientResponse.data.reduce((acc: Record<number, string>, client: any) => {
              acc[client.client_company_id] = client.company_name
              return acc
            }, {})
            setClients(clientData)
          } catch (error) {
            console.error("Error fetching clients:", error)
          }
        }

        const fetchGeographies = async () => {
          try {
            const geoResponse = await API.get("/projects_geography/")
            const geoData = geoResponse.data.reduce((acc: Record<number, string>, geo: any) => {
              acc[geo.geography_id] = geo.country
              return acc
            }, {})
            setGeographies(geoData)
          } catch (error) {
            console.error("Error fetching geographies:", error)
          }
        }

        await Promise.all([fetchClients(), fetchGeographies()])
      } catch (error) {
        console.error("Error fetching projects:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchProjects()
  }, [])

  const handleStatusFilter = (status: string) => {
    if (statusFilter.includes(status)) {
      setStatusFilter(statusFilter.filter((item) => item !== status))
    } else {
      setStatusFilter([...statusFilter, status])
    }
  }

  const handleSort = (field: "name" | "timeline") => {
    if (sortField === field) {
      // If clicking the same field, toggle the sort order
      setSortOrder(sortOrder === "asc" ? "desc" : "asc")
    } else {
      // If clicking a different field, set it as the new sort field and reset to ascending
      setSortField(field)
      setSortOrder("asc")
    }
  }

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
      if (sortField === "name") {
        // Sort by project name
        if (sortOrder === "asc") {
          return a.project_name.localeCompare(b.project_name)
        } else {
          return b.project_name.localeCompare(a.project_name)
        }
      } else {
        // Sort by timeline start date
        const dateA = new Date(a.timeline_start)
        const dateB = new Date(b.timeline_start)

        if (sortOrder === "asc") {
          return dateA.getTime() - dateB.getTime()
        } else {
          return dateB.getTime() - dateA.getTime()
        }
      }
    })
  }, [projects, sortField, sortOrder, statusFilter, searchTerm])

  // Pagination logic
  const totalPages = Math.ceil(filteredAndSortedProjects.length / itemsPerPage)
  const indexOfLastItem = currentPage * itemsPerPage
  const indexOfFirstItem = indexOfLastItem - itemsPerPage
  const currentItems = filteredAndSortedProjects.slice(indexOfFirstItem, indexOfLastItem)

  const paginate = (pageNumber: number) => {
    if (pageNumber > 0 && pageNumber <= totalPages) {
      setCurrentPage(pageNumber)
    }
  }

  // Reset to first page when filters change
  useEffect(() => {
    setCurrentPage(1)
  }, [statusFilter, searchTerm, sortField, sortOrder])

  const handleDelete = async () => {
    if (deleteProjectId !== null) {
      setShowDeleteModal(false)

      try {
        await API.delete(`/projects/${deleteProjectId}`, { withCredentials: true })
        toast.success("Project deleted successfully!", {
          position: "top-right",
          autoClose: 2000,
          onClose: () => {
            setProjects((prev) => prev.filter((project) => project.project_id !== deleteProjectId))
          },
        })
      } catch (error) {
        console.error("Error deleting project:", error)
        toast.error("Failed to delete project.", {
          position: "top-right",
          autoClose: 2000,
        })
      }
    }
  }

  const handleDeleteClick = (projectId: number) => {
    setDeleteProjectId(projectId)
    setShowDeleteModal(true)
  }

  // Calculate completion percentage for progress bar
  const getCompletionPercentage = (completed: number, expected: number) => {
    if (expected === 0) return 0
    return Math.min(Math.round((completed / expected) * 100), 100)
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-lg text-gray-600">Loading projects...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Nav />
      <main className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold text-blue-700 px-4 md:px-8 lg:px-8">Projects</h1>
        </div>

        <div className="bg-white rounded-xl shadow-lg overflow-hidden mx-auto py-4 px-4 md:px-6 lg:px-8 border border-gray-200">
          {/* Search and Filter Section */}
          <div className="py-4 border-b border-gray-200">
            <div className="flex flex-col md:flex-row justify-between items-center gap-4">
              <div className="relative flex items-center w-full md:w-1/3">
                <Search className="absolute left-3 text-blue-400" />
                <Input
                  type="text"
                  placeholder="Search projects..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 rounded-full border border-gray-300 focus:border-blue-400 focus:ring focus:ring-blue-200 focus:ring-opacity-50 bg-white"
                />
              </div>

              <div className="flex items-center gap-3 flex-wrap justify-center md:justify-end">
                {/* Status filter toggle buttons */}
                <div className="flex items-center gap-2 mr-1">
                  <Button
                    onClick={() => handleStatusFilter("active")}
                    variant={statusFilter.includes("active") ? "default" : "outline"}
                    className={`rounded-full px-3 py-1 h-9 text-sm flex items-center gap-1.5 ${
                      statusFilter.includes("active")
                        ? "bg-blue-100 text-blue-800 border border-blue-200 hover:bg-blue-200"
                        : "bg-white border border-gray-300 text-gray-700 hover:bg-gray-50 hover:border-blue-300"
                    }`}
                  >
                    <Clock className="h-4 w-4" />
                    Active
                  </Button>

                  <Button
                    onClick={() => handleStatusFilter("closed")}
                    variant={statusFilter.includes("closed") ? "default" : "outline"}
                    className={`rounded-full px-3 py-1 h-9 text-sm flex items-center gap-1.5 ${
                      statusFilter.includes("closed")
                        ? "bg-green-100 text-green-800 border border-green-200 hover:bg-green-200"
                        : "bg-white border border-gray-300 text-gray-700 hover:bg-gray-50 hover:border-green-300"
                    }`}
                  >
                    <CheckCircle className="h-4 w-4" />
                    Closed
                  </Button>
                </div>

                {/* Sort dropdown for Name */}
                <Button
                  variant="outline"
                  onClick={() => handleSort("name")}
                  className={`flex items-center rounded-full px-3 py-1 h-9 ${
                    sortField === "name"
                      ? "bg-blue-50 border-blue-200 text-blue-700"
                      : "bg-white border border-gray-300 text-gray-700 hover:bg-gray-50"
                  }`}
                >
                  <ArrowUpDown className="mr-2 h-4 w-4" />
                  Name {sortField === "name" && (sortOrder === "asc" ? "↑" : "↓")}
                </Button>

                {/* Sort button for Timeline */}
                <Button
                  variant="outline"
                  onClick={() => handleSort("timeline")}
                  className={`flex items-center rounded-full px-3 py-1 h-9 ${
                    sortField === "timeline"
                      ? "bg-blue-50 border-blue-200 text-blue-700"
                      : "bg-white border border-gray-300 text-gray-700 hover:bg-gray-50"
                  }`}
                >
                  <Calendar className="mr-2 h-4 w-4" />
                  Timeline {sortField === "timeline" && (sortOrder === "asc" ? "↑" : "↓")}
                </Button>

                <Link href="/add-project" passHref>
                  <Button className="bg-blue-600 hover:bg-blue-700 text-white shadow-sm rounded-full">
                    <Plus className="mr-2 h-4 w-4" /> New Project
                  </Button>
                </Link>
              </div>
            </div>
          </div>

          {/* Project Table */}
          <div className="overflow-x-auto mt-4">
            <Table className="w-full border border-gray-200 rounded-xl">
              <TableHeader>
                <TableRow className="bg-blue-50 border-b border-gray-200">
                  <TableHead className="text-left whitespace-nowrap font-semibold text-blue-900 py-4 px-6 rounded-tl-xl">
                    Project
                  </TableHead>
                  <TableHead className="text-center whitespace-nowrap font-semibold text-blue-900 py-4">
                    Client
                  </TableHead>
                  <TableHead className="text-center whitespace-nowrap font-semibold text-blue-900 py-4">
                    Geography
                  </TableHead>
                  <TableHead className="text-center whitespace-nowrap font-semibold text-blue-900 py-4">
                    Status
                  </TableHead>
                  <TableHead className="text-center whitespace-nowrap font-semibold text-blue-900 py-4">
                    Timeline
                  </TableHead>
                  <TableHead className="text-center whitespace-nowrap font-semibold text-blue-900 py-4">
                    Completion
                  </TableHead>
                  <TableHead className="text-right whitespace-nowrap font-semibold text-blue-900 py-4 px-6 rounded-tr-xl">
                    Actions
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {currentItems.map((project, index) => {
                  const completionPercentage = getCompletionPercentage(project.completed_calls, project.expected_calls)
                  const isLastRow = index === currentItems.length - 1

                  return (
                    <TableRow
                      key={project.project_id}
                      className={`hover:bg-gray-50 transition-colors border-b border-gray-200 cursor-pointer ${
                        index % 2 === 0 ? "bg-white" : "bg-gray-50/30"
                      } ${isLastRow ? "rounded-b-xl" : ""}`}
                      onClick={() => (window.location.href = `/projects/project-detail?id=${project.project_id}`)}
                    >
                      <TableCell className={`py-4 px-6 font-medium ${isLastRow ? "rounded-bl-xl" : ""}`}>
                        <Link
                          href={`/projects/project-detail?id=${project.project_id}`}
                          className="text-blue-600 hover:text-blue-800 underline-offset-2 hover:underline"
                        >
                          {project.project_name}
                        </Link>
                      </TableCell>
                      <TableCell className="py-4 text-center text-gray-700">
                        {clients[project.client_company_id] || "Unknown"}
                      </TableCell>
                      <TableCell className="py-4 text-center text-gray-700">
                        {geographies[project.geography_id] || "Unknown"}
                      </TableCell>
                      <TableCell className="py-4 text-center">
                        <Badge
                          variant={project.status ? "default" : "secondary"}
                          className={`px-3 py-1 rounded-full text-xs font-medium ${
                            project.status
                              ? "bg-green-100 text-green-800 border border-green-200"
                              : "bg-blue-100 text-blue-800 border border-blue-200"
                          }`}
                        >
                          {project.status ? "Closed" : "Active"}
                        </Badge>
                      </TableCell>
                      <TableCell className="py-4 text-center text-gray-700">
                        <div className="text-sm">
                          <div className="text-xs text-gray-500 mb-1">Start: {project.timeline_start}</div>
                          <div className="text-xs text-gray-500">End: {project.timeline_end}</div>
                        </div>
                      </TableCell>
                      <TableCell className="py-4 text-center">
                        <div className="flex flex-col items-center space-y-1 px-2">
                          <div className="w-full max-w-[140px] mx-auto bg-gray-200 rounded-full h-2.5 overflow-hidden">
                            <div
                              className={`h-2.5 rounded-full ${
                                completionPercentage < 30
                                  ? "bg-red-500"
                                  : completionPercentage < 70
                                    ? "bg-yellow-500"
                                    : "bg-green-500"
                              }`}
                              style={{ width: `${completionPercentage}%` }}
                            ></div>
                          </div>
                          <div className="text-xs text-gray-600 whitespace-nowrap">
                            <span className="font-medium">{completionPercentage}%</span> ({project.completed_calls}/
                            {project.expected_calls})
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className={`py-4 px-6 text-right ${isLastRow ? "rounded-br-xl" : ""}`}>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="rounded-full p-2 hover:bg-blue-100 text-gray-500 hover:text-blue-600"
                            >
                              <MoreHorizontal className="h-5 w-5" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent
                            align="end"
                            className="w-48 p-2 rounded-xl shadow-lg border border-gray-200 bg-white"
                          >
                            <Link
                              href={`/projects/project-detail?id=${project.project_id}`}
                              passHref
                              className="w-full"
                            >
                              <DropdownMenuItem className="cursor-pointer rounded-lg py-2 hover:bg-gray-50">
                                <Eye className="h-4 w-4 mr-2 text-gray-500" /> View Details
                              </DropdownMenuItem>
                            </Link>
                            <Link href={`/projects/edit-project?id=${project.project_id}`} passHref className="w-full">
                              <DropdownMenuItem className="cursor-pointer rounded-lg py-2 hover:bg-gray-50">
                                <Pencil className="h-4 w-4 mr-2 text-blue-500" /> Edit Project
                              </DropdownMenuItem>
                            </Link>
                            <DropdownMenuSeparator className="my-1 bg-gray-200" />
                            <DropdownMenuItem
                              className="cursor-pointer rounded-lg py-2 text-red-600 hover:text-red-700 hover:bg-red-50"
                              onClick={() => handleDeleteClick(project.project_id)}
                            >
                              <Trash2 className="h-4 w-4 mr-2" /> Delete Project
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  )
                })}

                {currentItems.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={7} className="py-12 text-center text-gray-500 rounded-b-xl">
                      <div className="flex flex-col items-center space-y-2">
                        <Search className="h-8 w-8 text-blue-200" />
                        <p className="text-blue-700">No projects found matching your criteria</p>
                        <p className="text-blue-400 text-sm mt-1">Try adjusting your search or filter settings</p>
                      </div>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>

          {/* Pagination */}
          {filteredAndSortedProjects.length > 0 && (
  <div className="flex items-center justify-between px-4 py-3 mt-4 bg-white rounded-xl shadow-sm border border-blue-100">
    <div className="text-sm text-gray-600">
      Showing{" "}
      <span className="font-medium text-blue-700">{indexOfFirstItem + 1}</span> to{" "}
      <span className="font-medium text-blue-700">{Math.min(indexOfLastItem, filteredAndSortedProjects.length)}</span>{" "}
      of <span className="font-medium text-blue-700">{filteredAndSortedProjects.length}</span> projects
    </div>

    <div className="flex gap-2">
      <Button
        variant="outline"
        size="sm"
        onClick={() => paginate(currentPage - 1)}
        disabled={currentPage === 1}
        className="h-9 w-9 p-0 rounded-full border border-blue-200 bg-white text-blue-500 hover:bg-blue-50 disabled:opacity-40"
      >
        &lt;
      </Button>

      {Array.from({ length: totalPages }, (_, i) => i + 1)
        .filter(
          (page) =>
            page === 1 ||
            page === totalPages ||
            (page >= currentPage - 1 && page <= currentPage + 1)
        )
        .reduce((acc: (number | "...")[], page, i, array) => {
          if (i > 0 && page !== array[i - 1] + 1) {
            acc.push("...")
          }
          acc.push(page)
          return acc
        }, [])
        .map((page, idx) =>
          page === "..." ? (
            <span key={`ellipsis-${idx}`} className="flex items-center justify-center h-9 w-9 text-blue-400">…</span>
          ) : (
            <Button
              key={page}
              variant={currentPage === page ? "default" : "outline"}
              size="sm"
              onClick={() => paginate(page)}
              className={`h-9 w-9 p-0 rounded-full ${
                currentPage === page
                  ? "bg-blue-500 text-white border-0 shadow-md"
                  : "bg-white text-blue-600 border border-blue-200 hover:bg-blue-50"
              }`}
            >
              {page}
            </Button>
          )
        )}

      <Button
        variant="outline"
        size="sm"
        onClick={() => paginate(currentPage + 1)}
        disabled={currentPage === totalPages}
        className="h-9 w-9 p-0 rounded-full border border-blue-200 bg-white text-blue-500 hover:bg-blue-50 disabled:opacity-40"
      >
        &gt;
      </Button>
    </div>
  </div>
)}

        </div>
      </main>

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex justify-center items-center z-50 backdrop-blur-sm">
          <div className="bg-white rounded-xl p-6 shadow-xl max-w-sm w-full mx-4 border border-gray-200 animate-in fade-in-90 zoom-in-95">
            <h2 className="text-xl font-semibold text-gray-800 mb-2">Delete Project?</h2>
            <p className="text-gray-600 mb-6">
              Are you sure you want to delete this project? This action cannot be undone.
            </p>
            <div className="flex justify-end gap-3">
              <Button
                onClick={() => setShowDeleteModal(false)}
                variant="outline"
                className="px-4 py-2 border border-gray-200 text-gray-700 hover:bg-gray-50 rounded-full"
              >
                Cancel
              </Button>
              <Button
                onClick={handleDelete}
                className="px-4 py-2 bg-red-600 text-white hover:bg-red-700 rounded-full shadow-sm"
              >
                Delete
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* React Toast Container */}
      <ToastContainer position="bottom-right" theme="colored" />
    </div>
  )
}

