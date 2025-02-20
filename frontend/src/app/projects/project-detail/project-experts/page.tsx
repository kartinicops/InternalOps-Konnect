'use client'

import { useState, useEffect } from "react"
import { useSearchParams, useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Nav } from "@/components/nav"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Calendar, FileText, Users, Download } from "lucide-react"
import API from "@/services/api"

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
  general_screening_questions: string
  files: { name: string; url: string }[]
}

interface Expert {
  id: number
  full_name: string
  company: string
  contactDetails: string
  status: "proposed" | "schedule call" | "rejected"
  added_by: string // User who added the expert
}

interface ProjectPipeline {
  project_pipeline_id: number
  project_id: number
  expert_id: number
}

interface ProjectPublished {
  project_publish_id: number
  project_id: number
  expert_id: number
}

interface User {
  user_id: number
  full_name: string
}

export default function ProjectDetailPage() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const id = searchParams.get("id")
  const [project, setProject] = useState<Project | null>(null)
  const [experts, setExperts] = useState<Expert[]>([])
  const [projectPipeline, setProjectPipeline] = useState<ProjectPipeline[]>([])
  const [projectPublished, setProjectPublished] = useState<ProjectPublished[]>([])
  const [users, setUsers] = useState<User[]>([]) // To hold user data
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<"overview" | "experts">("overview")

  useEffect(() => {
    if (!id) return

    const fetchData = async () => {
      try {
        // Ensure CSRF token is fetched
        await API.get("/api/csrf/")

        // Fetch Project data based on project_id
        const projectResponse = await API.get(`/projects/${id}/`, { withCredentials: true })
        setProject(projectResponse.data)

        // Fetch project_pipeline data based on project_id
        const projectPipelineResponse = await API.get(`/project_pipeline/?project_id=${id}`, { withCredentials: true })
        setProjectPipeline(projectPipelineResponse.data)

        // Fetch project_published data based on project_id
        const projectPublishedResponse = await API.get(`/project_published/?project_id=${id}`, { withCredentials: true })
        setProjectPublished(projectPublishedResponse.data)

        // Fetch expert IDs from both project_pipeline and project_published
        const expertIds = [
          ...projectPipelineResponse.data.map((item: ProjectPipeline) => item.expert_id),
          ...projectPublishedResponse.data.map((item: ProjectPublished) => item.expert_id)
        ]

        // Fetch experts based on expert IDs
        if (expertIds.length > 0) {
          const expertsResponse = await API.get(`/experts/`, { params: { expert_ids: expertIds }, withCredentials: true })
          setExperts(expertsResponse.data)
        } else {
          setExperts([])
        }

        // Fetch user data to display "added by" column
        // const usersResponse = await API.get(`/users/`, { withCredentials: true })
        // setUsers(usersResponse.data)

      } catch (error) {
        console.error("Error fetching project data:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [id])

  const handleSort = (field: keyof Expert) => {
    if (sortField === field) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc")
    } else {
      setSortField(field)
      setSortDirection("asc")
    }
  }

  const handleAddExpert = () => {
    router.push("/projects/add-expert")
  }

  const getStatusColor = (status: Expert["status"]) => {
    switch (status) {
      case "proposed":
        return "bg-yellow-100 text-yellow-800"
      case "schedule call":
        return "bg-blue-100 text-blue-800"
      case "rejected":
        return "bg-red-100 text-red-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  // const getUserName = (userId: number) => {
  //   const user = users.find((u) => u.user_id === userId)
  //   return user ? user.full_name : "Unknown"
  // }

  if (loading) {
    return <div className="flex items-center justify-center h-screen">Loading project details...</div>
  }

  if (!project) {
    return <div className="flex items-center justify-center h-screen">Project not found</div>
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="border-b bg-white shadow-sm">
        <Nav isProjectDetail projectName={project?.project_name || "Loading..."} />
      </div>

      <main className="container py-8 px-4 sm:px-6 lg:px-8">
        <div className="mb-6 flex flex-col gap-4">
          <div className="flex gap-4">
            <Button
              variant="ghost"
              className={`relative group px-4 py-2 h-9 text-sm font-medium rounded-t-md rounded-b-none
                ${activeTab === "overview" ? "bg-white text-blue-600 border-blue-400" : "bg-blue-50 text-blue-700 border-transparent hover:bg-blue-100"}`}
              onClick={() => {
                setActiveTab("overview")
                router.push(`/projects/project-detail?id=${id}`)
              }}
            >
              Overview
            </Button>
            <Button
              variant="ghost"
              className={`relative group px-4 py-2 h-9 text-sm font-medium rounded-t-md rounded-b-none
                ${activeTab === "experts" ? "bg-white text-blue-600 border-blue-400" : "bg-blue-50 text-blue-700 border-transparent hover:bg-blue-100"}`}
              onClick={() => {
                setActiveTab("experts")
                router.push(`/projects/project-detail/project-experts?id=${id}`)
              }}
            >
              Experts
            </Button>
          </div>

          <div className="flex items-center justify-between gap-4 px-4">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder="Search experts..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 rounded-full border-2 border-blue-200 focus:border-blue-400 focus:ring focus:ring-blue-200 focus:ring-opacity-50 bg-white"
              />
            </div>
            <div className="flex gap-2">
              <Button variant="outline" className="rounded-full border-2 border-blue-200 hover:border-blue-400 hover:bg-blue-50">
                <Download className="h-4 w-4 mr-2 text-blue-600" />
                Download
              </Button>
              <Button onClick={handleAddExpert} className="bg-blue-600 hover:bg-blue-700 text-white rounded-full">
                <Plus className="h-4 w-4 mr-2" />
                Add Expert
              </Button>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Expert</TableHead>
                  <TableHead>Company</TableHead>
                  <TableHead>Contact details</TableHead>
                  <TableHead>Added by</TableHead> {/* New column */}
                  <TableHead>Added at</TableHead>
                  {activeTab === "published" && <TableHead>Status</TableHead>}
                  {activeTab === "pipeline" && <TableHead>Action</TableHead>}
                </TableRow>
              </TableHeader>
              <TableBody>
                {/* Mapping data expert */}
                {experts.map((expert) => {
                  return (
                    <TableRow key={expert.id} className="hover:bg-gray-50">
                      <TableCell className="font-medium">{expert.full_name}</TableCell>
                      <TableCell>{expert.company}</TableCell>
                      <TableCell>{expert.contactDetails}</TableCell>
                      {/* <TableCell>{getUserName(expert.id)}</TableCell>  */}
                      <TableCell>10 Dec 2024</TableCell>
                      {activeTab === "published" && (
                        <TableCell>
                          <Badge className={getStatusColor(expert.status)}>{expert.status}</Badge>
                        </TableCell>
                      )}
                      {activeTab === "pipeline" && (
                        <TableCell>
                          <Button className="bg-blue-600 hover:bg-blue-700 text-white rounded-full text-xs py-1 px-2">
                            Move to Published
                            <ArrowRight className="h-3 w-3 ml-1" />
                          </Button>
                        </TableCell>
                      )}
                    </TableRow>
                  )
                })}
              </TableBody>
            </Table>
          </div>
        </div>
      </main>
    </div>
  )
}
