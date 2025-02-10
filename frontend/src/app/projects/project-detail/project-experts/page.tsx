"use client"

import { useState, useEffect } from "react"
import { useSearchParams, useRouter } from "next/navigation"
import { Search, Plus, Download } from "lucide-react"
import { Nav } from "@/components/nav"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import API from "@/services/api"

// Interface untuk data Expert Pipeline
interface ExpertPipeline {
  project_pipeline_id: number
  created_at: string
  expert_id_id: number
  project_id_id: number
  user_id_id: number
  expert?: {
    position: string
    company: string
    contact_details: string
    user?: {
      username: string
    }
  }
}

// Interface untuk data Expert Published
interface ExpertPublished {
  project_publish_id: number
  angles: string
  created_at: string
  expert_id_id: number
  project_id_id: number
  status_id_id: number
  user_id_id: number
  expert?: {
    position: string
    company: string
    contact_details: string
    user?: {
      username: string
    }
  }
}

export default function ProjectExpertsPage() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const projectId = searchParams.get("id")

  const [pipelineExperts, setPipelineExperts] = useState<ExpertPipeline[]>([])
  const [publishedExperts, setPublishedExperts] = useState<ExpertPublished[]>([])
  const [searchQuery, setSearchQuery] = useState("")
  const [activeTab, setActiveTab] = useState<"pipeline" | "published">("pipeline")

  // Fetch data experts berdasarkan project_id dan tab yang aktif
  useEffect(() => {
    if (!projectId) return

    const fetchExperts = async () => {
      try {
        if (activeTab === "pipeline") {
          const response = await API.get(`/project_pipeline/?project_id=${projectId}`)
          setPipelineExperts(response.data)
        } else {
          const response = await API.get(`/project_published/?project_id=${projectId}`)
          setPublishedExperts(response.data)
        }
      } catch (error) {
        console.error("Error fetching experts:", error)
      }
    }

    fetchExperts()
  }, [projectId, activeTab])

  // Filter dan pencarian experts berdasarkan tab yang aktif
  const filteredExperts =
    activeTab === "pipeline"
      ? pipelineExperts.filter(
          (expert) =>
            expert.expert?.position?.toLowerCase().includes(searchQuery.toLowerCase()) ||
            expert.expert?.company?.toLowerCase().includes(searchQuery.toLowerCase()),
        )
      : publishedExperts.filter(
          (expert) =>
            expert.expert?.position?.toLowerCase().includes(searchQuery.toLowerCase()) ||
            expert.expert?.company?.toLowerCase().includes(searchQuery.toLowerCase()),
        )

  // Fungsi untuk menampilkan warna status expert
  const getStatusColor = (status: string) => {
    switch (status) {
      case "Added":
        return "bg-gray-100 text-gray-800"
      case "In Progress":
        return "bg-yellow-100 text-yellow-800"
      case "Published":
        return "bg-green-100 text-green-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Nav isProjectDetail projectName={`Project ${projectId}`} />

      <main className="container mx-auto px-4 py-8">
        <div className="mb-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="relative flex-1 max-w-md w-full">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              placeholder="Search experts..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 rounded-full border-2 border-blue-200 focus:border-blue-400 focus:ring focus:ring-blue-200 focus:ring-opacity-50 bg-white"
            />
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={() => {
                /* Tambahkan logika download */
              }}
              className="rounded-full border-2 border-blue-200 hover:border-blue-400 hover:bg-blue-50"
            >
              <Download className="h-4 w-4 mr-2 text-blue-600" />
              Download
            </Button>
            <Button
              onClick={() => router.push(`/projects/experts/add?project_id=${projectId}`)}
              className="bg-blue-600 hover:bg-blue-700 text-white rounded-full"
            >
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

        {/* Tabel Experts */}
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Position</TableHead>
                  <TableHead>Company</TableHead>
                  <TableHead>Contact</TableHead>
                  <TableHead>Added by</TableHead>
                  <TableHead>Added at</TableHead>
                  {activeTab === "published" && <TableHead>Angles</TableHead>}
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredExperts.map((expert) => (
                  <TableRow
                    key={activeTab === "pipeline" ? expert.project_pipeline_id : expert.project_publish_id}
                    className="hover:bg-gray-50"
                  >
                    <TableCell className="font-medium">{expert.expert?.position}</TableCell>
                    <TableCell>{expert.expert?.company}</TableCell>
                    <TableCell>{expert.expert?.contact_details}</TableCell>
                    <TableCell>{expert.expert?.user?.username}</TableCell>
                    <TableCell>{new Date(expert.created_at).toLocaleDateString()}</TableCell>
                    {activeTab === "published" && <TableCell>{(expert as ExpertPublished).angles}</TableCell>}
                    <TableCell>
                      <Badge className={getStatusColor(expert.status_id_id?.toString() || "")}>
                        {expert.status_id_id ? "Published" : "Pipeline"}
                      </Badge>
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