'use client'

import { useState, useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Nav } from "@/components/nav"
import { Search, Plus, Download } from "lucide-react"
import Pipeline from "@/components/pipeline" // Import the Pipeline component
import Published from "@/components/published" // Import the Published component
import API from "@/services/api"

const ProjectExpertsPage = () => {
  const searchParams = useSearchParams()
  const router = useRouter()
  const projectId = searchParams.get("id") || ""
  const [projectName, setProjectName] = useState<string>("")
  const [activeTab, setActiveTab] = useState<"pipeline" | "published">("pipeline")
  const [searchQuery, setSearchQuery] = useState("")

  useEffect(() => {
    const fetchProjectName = async () => {
      try {
        const response = await API.get(`/projects/${projectId}/`, { withCredentials: true })
        setProjectName(response.data.project_name)
      } catch (error) {
        console.error("Error fetching project name:", error)
      }
    }

    if (projectId) {
      fetchProjectName()
    }
  }, [projectId])

  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(event.target.value)
  }

  const handleAddExpert = () => {
    router.push("/projects/project-detail/project-experts/add-expert")
  }

  const handleDownload = () => {
    console.log("Download button clicked")
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Nav isProjectDetail projectName={projectName} />

      <main className="container mx-auto px-4 py-8">
        {/* Search and Action Buttons */}
        <div className="mb-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="relative flex-1 max-w-md w-full">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <input
              type="text"
              value={searchQuery}
              onChange={handleSearchChange}
              placeholder="Search experts..."
              className="pl-10 rounded-full border-2 border-blue-200 focus:border-blue-400 focus:ring focus:ring-blue-200 focus:ring-opacity-50 bg-white w-full py-2 px-4"
            />
          </div>

          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={handleDownload}
              className="rounded-full border-2 border-blue-200 hover:border-blue-400 hover:bg-blue-50"
            >
              <Download className="h-4 w-4 mr-2 text-blue-600" />
              Download
            </Button>
            <Button
              onClick={handleAddExpert}
              className="bg-blue-600 hover:bg-blue-700 text-white rounded-full"
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Expert
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
          {activeTab === "pipeline" ? (
            <Pipeline project_id={projectId} />
          ) : (
            <Published project_id={projectId} />
          )}
        </div>
      </main>
    </div>
  )
}

export default ProjectExpertsPage