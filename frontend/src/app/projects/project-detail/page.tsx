"use client"

import { useState, useEffect } from "react"
import { useSearchParams, useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Nav } from "@/components/nav"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Calendar, FileText, Users, Download, ArrowLeft, Settings } from "lucide-react"
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

export default function ProjectDetailPage() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const id = searchParams.get("id")
  const [project, setProject] = useState<Project | null>(null)
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<"overview" | "experts">("overview")

  useEffect(() => {
    if (!id) return

    const fetchProject = async () => {
      try {
        await API.get("/api/csrf/")
        const response = await API.get(`/projects/${id}/`, { withCredentials: true })
        setProject(response.data)
      } catch (error) {
        console.error("Error fetching project:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchProject()
  }, [id])

  if (loading) {
    return <div className="flex items-center justify-center h-screen">Loading project details...</div>
  }

  if (!project) {
    return <div className="flex items-center justify-center h-screen">Project not found</div>
  }

  const renderOverview = () => (
    <>
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Status</CardTitle>
            <Badge variant={project.status === "active" ? "default" : "secondary"}>{project.status}</Badge>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{project.status}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Timeline</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{`${project.timeline_start} - ${project.timeline_end}`}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Expected Calls</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{project.expected_calls}</div>
          </CardContent>
        </Card>
      </div>

      <Card className="mt-8">
        <CardHeader>
          <CardTitle>Client Requirements</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <p className="font-medium">
              We are seeking to interview an individual who has experience in the shrimp industry, more specifically:
            </p>
            <ul className="list-disc pl-5 space-y-2">
              <li>Hands on experience in conducting exports of shrimp from shrimp producing country(s)</li>
              <li>Hands on experience in negotiating contract and price with vendors in the importing country</li>
              <li>Knowledge of value chain of shrimps from farm to processing plant to exporting</li>
              <li>English/Bahasa speaking</li>
              <li>Company names: Camimex group</li>
            </ul>
          </div>
        </CardContent>
      </Card>

      <Card className="mt-8">
        <CardHeader>
          <CardTitle>General Screening Questions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            <div>
              <ol className="list-decimal pl-6 space-y-2">
                {project.general_screening_questions ? (
                  project.general_screening_questions
                    .split("\n")
                    .map((question, index) => (
                      <li key={index}>{question.replace(/^(Question\s*\d+\s*:\s*)/, "").trim()}</li>
                    ))
                ) : (
                  <p>No screening questions available.</p>
                )}
              </ol>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="mt-8">
        <CardHeader>
          <CardTitle>Files</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            {project.files?.length ? (
              project.files.map((file) => (
                <Button
                  key={file.name}
                  variant="outline"
                  asChild
                  className="h-auto py-2 px-3 flex items-center justify-start"
                >
                  <Link href={file.url} download>
                    <FileText className="mr-2 h-4 w-4 flex-shrink-0" />
                    <span className="truncate">{file.name}</span>
                    <Download className="ml-auto h-4 w-4 flex-shrink-0" />
                  </Link>
                </Button>
              ))
            ) : (
              <p className="text-muted-foreground col-span-full">No files available.</p>
            )}
          </div>
        </CardContent>
      </Card>
    </>
  )

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="border-b bg-white shadow-sm">
        <Nav isProjectDetail={true} projectName={project.project_name} />
      </div>

      <div className="container mx-auto py-8 px-4 sm:px-6 lg:px-8">
        <div className="mb-6">
          <div className="flex gap-[1px]  p-1 rounded-t-lg">
          <Button
        variant="ghost"
        className={`
          relative group px-4 py-2 h-9 text-sm font-medium rounded-t-md rounded-b-none
          flex items-center gap-2 min-w-[200px] border-t border-x
          ${
            activeTab === "overview"
              ? "bg-white text-blue-600 border-blue-400"
              : "bg-blue-50 text-blue-700 border-transparent hover:bg-blue-100"
          }
        `}
        onClick={() => {
          setActiveTab("overview")
          router.push(`/projects/project-detail?id=${id}`)
        }}
      >
        <span className="flex-1 text-left">Overview</span>
        {activeTab === "overview" && (
          <span className="opacity-0 group-hover:opacity-100 transition-opacity text-blue-400 hover:text-blue-600">
            ×
          </span>
        )}
      </Button>
      <Button
        variant="ghost"
        className={`
          relative group px-4 py-2 h-9 text-sm font-medium rounded-t-md rounded-b-none
          flex items-center gap-2 min-w-[200px] border-t border-x
          ${
            activeTab === "experts"
              ? "bg-white text-blue-600 border-blue-400"
              : "bg-blue-50 text-blue-700 border-transparent hover:bg-blue-100"
          }
        `}
        onClick={() => {
          setActiveTab("experts")
          router.push(`/projects/project-detail/project-experts?id=${id}`)
        }}
      >
        <span className="flex-1 text-left">Experts</span>
        {activeTab === "experts" && (
          <span className="opacity-0 group-hover:opacity-100 transition-opacity text-blue-400 hover:text-blue-600">
            ×
          </span>
        )}
      </Button>
          </div>
        </div>

        <div className="bg-white rounded-b-lg rounded-tr-lg shadow-lg p-6">
          {activeTab === "overview" ? (
            renderOverview()
          ) : (
            <div className="mt-6">
              <p>Loading experts...</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}