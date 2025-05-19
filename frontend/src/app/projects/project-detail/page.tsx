"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import Link from "next/link"
import API from "@/services/api"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Nav } from "@/components/nav"
import {
  Calendar,
  FileText,
  Users,
  File,
  FileImage,
  FileSpreadsheet,
  Clock,
  MapPin,
  CheckCircle2,
  AlertCircle,
  Search,
  Plus,
  Building,
  Tag,
  FileArchive,
  User,
  PencilLine,
  Download,
  Loader2,
} from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ToastContainer, toast } from "react-toastify"
import "react-toastify/dist/ReactToastify.css"
import Pipeline from "@/components/pipeline"
import Published from "@/components/published"
import ExpertDetailPopup from "@/app/projects/project-detail/expert-detail-popup"
import type { Project, ProjectFile } from "@/types/project-detail"

export default function ProjectDetailPage() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const id = searchParams.get("id")
  const [project, setProject] = useState<Project | null>(null)
  const [loading, setLoading] = useState(true)
  const [expertsActiveTab, setExpertsActiveTab] = useState<"pipeline" | "published">("pipeline")
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedExpertId, setSelectedExpertId] = useState<number | null>(null)
  const [splitView, setSplitView] = useState(false)
  const [downloading, setDownloading] = useState<Record<string, boolean>>({})

  // Helper functions
  const formatDate = (dateString: string) => {
    if (!dateString) return "N/A"
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    })
  }

  const getFileIcon = (fileType: string) => {
    const iconMap = {
      pdf: <FileText className="h-10 w-10 text-red-500" />,
      excel: <FileSpreadsheet className="h-10 w-10 text-green-600" />,
      word: <FileText className="h-10 w-10 text-blue-600" />,
      image: <FileImage className="h-10 w-10 text-purple-500" />,
    }
    return iconMap[fileType?.toLowerCase()] || <File className="h-10 w-10 text-gray-500" />
  }

  // File handling functions
  const handleFileView = async (file: ProjectFile) => {
    // Get file URL from either property
    const fileUrl = file.file_url || file.file_path
    const fileId = file.file_id || file.projectFile_id

    if (!fileUrl) {
      toast.error("File URL not available")
      return
    }

    // For PDF, images, and text files, open in a new tab
    if (["pdf", "image", "txt"].includes(file.file_type?.toLowerCase())) {
      window.open(fileUrl, "_blank")
    } else {
      // For other file types, trigger download
      await downloadFile(file)
    }
  }

  // Replace the downloadFile function with this improved version that handles the API endpoint correctly
  const downloadFile = async (file: ProjectFile) => {
    const fileUrl = file.file_url || file.file_path
    const fileId = file.file_id || file.projectFile_id

    if (!fileUrl) {
      toast.error("File URL not available")
      return
    }

    try {
      // Set downloading state
      setDownloading((prev) => ({ ...prev, [fileId as string]: true }))

      // Try direct URL download first (most reliable method)
      try {
        // For direct file download, use the full URL without API path manipulation
        const response = await fetch(fileUrl, {
          method: "GET",
          credentials: "include",
        })

        if (!response.ok) {
          throw new Error(`Failed to download file: ${response.status} ${response.statusText}`)
        }

        // Get the blob from the response
        const blob = await response.blob()

        // Create a URL for the blob
        const url = window.URL.createObjectURL(blob)

        // Create a temporary link element
        const link = document.createElement("a")
        link.href = url
        link.download = file.file_name || `download.${file.file_type || "file"}`

        // Append to body, click, and remove
        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)

        // Release the object URL
        window.URL.revokeObjectURL(url)

        toast.success(`Downloading ${file.file_name}`)
        return
      } catch (error) {
        console.error("Error with direct download, trying alternative method:", error)
        // Continue to alternative methods
      }

      // Alternative method: If your API has a specific download endpoint format
      // This is a fallback in case the direct URL doesn't work
      if (fileId) {
        try {
          // Use the correct API endpoint format based on your backend
          // The error shows the endpoint should be /project_files/[filename] not /projects_files/[id]/download/
          const downloadUrl = `${process.env.API_URL || ""}/project_files/${fileId}`

          const response = await API.get(downloadUrl, {
            responseType: "blob",
          })

          // Create a Blob from the response data
          const blob = new Blob([response.data])

          // Create an object URL for the blob
          const url = window.URL.createObjectURL(blob)

          // Create a new anchor element
          const link = document.createElement("a")
          link.href = url
          link.download = file.file_name || `download.${file.file_type || "file"}`

          // Append to the body, click, and remove
          document.body.appendChild(link)
          link.click()
          document.body.removeChild(link)

          // Release the object URL
          window.URL.revokeObjectURL(url)

          toast.success(`Downloading ${file.file_name}`)
          return
        } catch (error) {
          console.error("Error with alternative download method:", error)
          throw error // Re-throw to be caught by the outer catch
        }
      } else {
        throw new Error("No file ID available for API download")
      }
    } catch (error) {
      console.error("Error downloading file:", error)
      toast.error("Failed to download file. Please try again.")
    } finally {
      setDownloading((prev) => ({ ...prev, [fileId as string]: false }))
    }
  }

  // Fetch project data
  useEffect(() => {
    if (!id) return

// Example of updated screening questions fetch logic within useEffect
const fetchProject = async () => {
  try {
    const response = await API.get(`/projects/${id}/`)
    const projectData = response.data

    // Fetch all related data in parallel
    const endpoints = [
      { key: "geography", url: `/projects_geography/${projectData.geography_id}/` },
      { key: "files", url: `/projects_files/?project_id=${id}` },
      { key: "companies_of_interest", url: `/companies_of_interest/?project_id=${id}` },
      { key: "client_companies", url: `/project_client_company/` },
      { key: "client_teams", url: `/project_client_team/` },
      { key: "client_members", url: `/client_members/` },
      { key: "screening_questions", url: `/screening_question/?project_id=${id}` }, // This already includes project_id filter
    ]

    const results = await Promise.allSettled(
      endpoints.map((endpoint) => API.get(endpoint.url))
    )
    
    
    results.forEach((result, index) => {
      const { key } = endpoints[index]
      if (result.status === "fulfilled") {
        let data = result.value.data

        // Filter files by project ID
        if (key === "files") {
          data = Array.isArray(data)
            ? data.filter((file) => file.project_id === Number.parseInt(id as string) || file.project_id === id)
            : []
        }

        // For screening_questions, ensure they belong to the current project and extract questions
        if (key === "screening_questions" && Array.isArray(data)) {
          // Double-check that screening questions belong to the current project
          const filteredQuestions = data.filter(
            (question) => question.project_id === Number.parseInt(id as string) || question.project_id === id
          )
          
          // Save filtered questions
          projectData[key] = filteredQuestions
          
          // If there are screening questions from API, replace those from the project
          const questionTexts = filteredQuestions.map((item) => item.question).filter(Boolean)
          if (questionTexts.length > 0) {
            projectData.general_screening_questions = questionTexts.join("\n\n")
          }
        } else {
          projectData[key] = data
        }
      } else {
        console.error(`Error fetching ${key}:`, result.reason)
        if (key === "geography") {
          projectData[key] = { country: "Unknown", city: "Unknown", timezone: "Unknown" }
        } else {
          projectData[key] = []
        }
      }
    })

    setProject(projectData)
  } catch (error) {
    console.error("Error fetching project:", error)
    toast.error("Failed to load project details")
  } finally {
    setLoading(false)
  }
}

    fetchProject()
  }, [id])

  // Navigation handlers
  const handleAddExpert = () => router.push(`/projects/project-detail/add-expert?id=${id}`)

  // Handle expert selection
  const handleExpertSelect = (expertId: number) => {
    setSelectedExpertId(expertId)
    setSplitView(true) // Enable split view when expert is selected
  }

  // Handle close expert detail
  const handleCloseExpertDetail = () => {
    setSelectedExpertId(null)
    setSplitView(false) // Disable split view when popup is closed
  }

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-blue-500 mx-auto"></div>
          <p className="mt-4 text-lg text-gray-600">Loading project details...</p>
        </div>
      </div>
    )
  }

  // Project not found state
  if (!project) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center p-8 max-w-md">
          <AlertCircle className="h-16 w-16 text-amber-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Project Not Found</h2>
          <p className="text-gray-600 mb-6">
            The project you're looking for doesn't exist or you don't have access to it.
          </p>
          <Button onClick={() => router.push("/projects")}>Return to Projects</Button>
        </div>
      </div>
    )
  }

  // Calculate project metrics
  const completionRate =
    project.expected_calls > 0 ? Math.round((project.completed_calls / project.expected_calls) * 100) : 0

  // Render content sections
  const renderContent = {
    requirements: () => {
      if (!project.client_requirements) return <div className="text-gray-500 text-sm">No requirements specified.</div>

      return project.client_requirements.split("\n\n").map((req, index) => (
        <div key={`req-${index}`} className="p-2 bg-blue-50 rounded-md border border-blue-100 mb-2">
          <div className="flex items-center">
            <div className="text-sm bg-white text-blue-800 w-6 h-6 rounded-full flex items-center justify-center font-medium mr-2 flex-shrink-0 border border-blue-200">
              {index + 1}
            </div>
            <div className="text-gray-800 text-sm">{req.trim()}</div>
          </div>
        </div>
      ))
    },

    screeningQuestions: () => {
      // Check first if we have data from API
      const screeningQuestionsFromAPI = project.screening_questions;
    
      if (
        screeningQuestionsFromAPI &&
        Array.isArray(screeningQuestionsFromAPI) &&
        screeningQuestionsFromAPI.length > 0
      ) {
        // Filter screening questions to ensure they belong to the current project
        const filteredQuestions = screeningQuestionsFromAPI.filter(
          (questionObj) => questionObj.project_id === Number.parseInt(id as string)
        );
    
        if (filteredQuestions.length > 0) {
          return filteredQuestions.map((questionObj, index) => (
            <div
              key={`question-${questionObj.question_id || index}`}
              className="p-2 bg-gray-50 rounded-md border border-gray-200 mb-2"
            >
              <div className="flex items-center">
                <div className="text-sm bg-blue-100 text-blue-800 w-6 h-6 rounded-full flex items-center justify-center font-medium mr-2 flex-shrink-0">
                  {index + 1}
                </div>
                <div className="text-gray-800 text-sm">{questionObj.question}</div>
              </div>
            </div>
          ));
        }
      }
    
      // Fallback to data from project if no data from API or no filtered questions for this project
      if (!project.general_screening_questions) {
        return <div className="text-gray-500 text-sm">No screening questions available for this project.</div>;
      }
    
      return project.general_screening_questions.split("\n\n").map((question, index) => (
        <div key={`question-${index}`} className="p-2 bg-gray-50 rounded-md border border-gray-200 mb-2">
          <div className="flex items-center">
            <div className="bg-blue-100 text-blue-800 w-6 h-6 rounded-full flex items-center justify-center font-medium text-sm mr-2 flex-shrink-0">
              {index + 1}
            </div>
            <div className="text-gray-800 text-sm">{question.replace(/^(Question\s*\d+\s*:\s*)/, "").trim()}</div>
          </div>
        </div>
      ));
    },
  }

  // Component sections
  interface ClientSectionProps {
    title: string
    icon: React.ReactNode
    items: any[] | undefined
    renderItem: (item: any) => React.ReactNode
    emptyMessage: string
  }

  const ClientSection = ({ title, icon, items, renderItem, emptyMessage }: ClientSectionProps) => (
    <div className="mb-4">
      <div className="flex items-center mb-2">
        {icon}
        <h3 className="text-md font-semibold text-gray-700">{title}</h3>
      </div>
      {items && items.length > 0 ? (
        <div className="space-y-2">{items.map(renderItem)}</div>
      ) : (
        <div className="text-gray-500 text-sm">{emptyMessage}</div>
      )}
    </div>
  )

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <div className="border-b bg-white shadow-sm sticky top-0 z-10">
        <Nav />
      </div>
      <ToastContainer theme="colored" />

      {/* Flex container that takes full height below the nav bar */}
      <div className="flex flex-1 h-[calc(100vh-64px)]">
        {/* Main Content Area - Dynamic width based on splitView */}
        <div className={`${splitView ? "w-1/2" : "w-full"} overflow-auto p-6 transition-all duration-300`}>
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6 gap-4">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">{project.project_name}</h1>
              <div className="flex items-center mt-2 text-sm text-gray-600">
                <Calendar className="h-4 w-4 mr-1" />
                <span>Created on {formatDate(project.created_at)}</span>
                <span className="mx-2">•</span>
                <Badge
                  variant={project.status ? "outline" : "default"}
                  className={project.status ? "bg-gray-100" : "bg-green-100 text-green-800 hover:bg-green-200"}
                >
                  {project.status ? "Closed" : "Active"}
                </Badge>
              </div>
            </div>

            <div className="flex items-center">
              <Link href={`/projects/edit-project?id=${id}`} passHref>
                <Button className="bg-white text-gray-700 hover:bg-gray-50 border border-gray-200 shadow-sm hover:shadow transition-all duration-150 rounded-full px-4 h-9 flex items-center gap-2 group">
                  <PencilLine className="h-4 w-4 text-gray-500 group-hover:text-blue-500 transition-colors" />
                  <span className="group-hover:text-blue-600 transition-colors">Edit</span>
                </Button>
              </Link>
            </div>
          </div>

          {/* Main Content Tabs */}
          <Tabs defaultValue="overview" className="w-full">
            <TabsList className="bg-blue-50 border-blue-100 p-1 rounded-t-lg">
              <TabsTrigger
                value="overview"
                className="rounded-md data-[state=active]:bg-white data-[state=active]:text-blue-700 data-[state=active]:shadow-sm"
              >
                Overview
              </TabsTrigger>
              <TabsTrigger
                value="experts"
                className="rounded-md data-[state=active]:bg-white data-[state=active]:text-blue-700 data-[state=active]:shadow-sm"
              >
                Experts
              </TabsTrigger>
            </TabsList>

            <div className="bg-white rounded-b-lg rounded-tr-lg shadow-md p-6">
              {/* Overview Tab */}
              <TabsContent value="overview" className="m-0">
                {/* Key Metrics */}
                <div className="grid gap-6 grid-cols-1 md:grid-cols-3">
                  {[
                    {
                      icon: <Clock className="h-4 w-4 mr-2 text-blue-500" />,
                      title: "Timeline",
                      value: `${formatDate(project.timeline_start)} - ${formatDate(project.timeline_end)}`,
                      subtext:
                        new Date(project.timeline_end) > new Date()
                          ? `${Math.ceil((new Date(project.timeline_end).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))} days remaining`
                          : "Project ended",
                    },
                    {
                      icon: <MapPin className="h-4 w-4 mr-2 text-blue-500" />,
                      title: "Geography",
                      value: `${project.geography?.country || "N/A"}, ${project.geography?.city || "N/A"}`,
                      subtext: project.geography?.timezone || "N/A",
                    },
                    {
                      icon: <Users className="h-4 w-4 mr-2 text-blue-500" />,
                      title: "Calls Progress",
                      value: `${project.completed_calls || 0} / ${project.expected_calls}`,
                      progress: completionRate,
                    },
                  ].map((metric, idx) => (
                    <Card key={`metric-${idx}`} className="border-0 shadow-sm">
                      <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium text-gray-500 flex items-center">
                          {metric.icon}
                          {metric.title}
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="flex flex-col">
                          <div className="text-xl font-semibold text-gray-800">{metric.value}</div>
                          {metric.progress !== undefined ? (
                            <div className="mt-2 space-y-1">
                              <div className="w-full bg-gray-100 rounded-full h-2">
                                <div
                                  className="bg-blue-600 h-2 rounded-full"
                                  style={{ width: `${metric.progress}%` }}
                                ></div>
                              </div>
                              <span className="text-sm text-gray-500">{metric.progress}% completed</span>
                            </div>
                          ) : (
                            <span className="text-sm text-gray-500 mt-1">{metric.subtext}</span>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>

                {/* Requirements & Screening Questions */}
                <div className="grid md:grid-cols-2 gap-6 mt-6">
                  {[
                    {
                      icon: <CheckCircle2 className="h-5 w-5 mr-2 text-blue-500" />,
                      title: "Client Requirements",
                      content: renderContent.requirements,
                    },
                    {
                      icon: <Users className="h-5 w-5 mr-2 text-blue-500" />,
                      title: "Screening Questions",
                      content: renderContent.screeningQuestions,
                    },
                  ].map((section, idx) => (
                    <Card key={`section-${idx}`} className="border-0 shadow-sm">
                      <CardHeader className="pb-2">
                        <CardTitle className="text-lg font-semibold flex items-center text-gray-800">
                          {section.icon}
                          {section.title}
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-2">{section.content()}</div>
                      </CardContent>
                    </Card>
                  ))}
                </div>

                {/* Client Details */}
                <Card className="mt-6 border-0 shadow-sm">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-lg font-semibold flex items-center text-gray-800">
                      <Building className="h-5 w-5 mr-2 text-blue-500" />
                      Client Details
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      {/* Companies of Interest */}
                      <div className="border rounded-lg p-4 shadow-sm">
                        <h3 className="text-sm font-medium flex items-center text-gray-700 mb-3">
                          <Tag className="h-4 w-4 mr-2 text-blue-500" />
                          Companies of Interest
                        </h3>
                        <div className="space-y-3">
                          {project.companies_of_interest &&
                          project.companies_of_interest.filter(
                            (company) => company.project_id === Number.parseInt(id as string),
                          ).length > 0 ? (
                            project.companies_of_interest
                              .filter((company) => company.project_id === Number.parseInt(id as string))
                              .map((company) => (
                                <div
                                  key={`company-${company.company_of_interest_id}`}
                                  className="bg-gray-50 p-2 rounded-lg flex justify-between items-center border"
                                >
                                  <span className="font-medium text-sm">{company.company_name}</span>
                                  <Badge
                                    variant={company.is_current ? "default" : "outline"}
                                    className={
                                      company.is_current
                                        ? "bg-green-100 text-green-800 text-xs ml-2"
                                        : "bg-gray-100 text-gray-600 text-xs ml-2"
                                    }
                                  >
                                    {company.is_current ? "Current" : "Former"}
                                  </Badge>
                                </div>
                              ))
                          ) : (
                            <div className="text-sm text-gray-500 p-2 bg-gray-50 rounded-lg border">
                              No companies of interest found.
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Client Companies */}
                      <div className="border rounded-lg p-4 shadow-sm">
                        <h3 className="text-sm font-medium flex items-center text-gray-700 mb-3">
                          <Building className="h-4 w-4 mr-2 text-blue-500" />
                          Client Companies
                        </h3>
                        <div className="space-y-3">
                          {(() => {
                            // Find client_company_id from the current project
                            const projectClientCompanyId = project.client_company_id

                            // Filter companies from project_client_company based on client_company_id
                            const relevantCompanies = project.client_companies?.filter(
                              (company) => company.client_company_id === projectClientCompanyId,
                            )

                            if (relevantCompanies?.length > 0) {
                              return relevantCompanies.map((company) => (
                                <div
                                  key={`client-company-${company.client_company_id}`}
                                  className="bg-gray-50 p-2 rounded-lg border"
                                >
                                  <span className="font-medium text-sm">{company.company_name}</span>
                                  <div className="text-xs text-gray-500 mt-1">
                                    {project.client_members?.filter(
                                      (m) => m.client_company_id === company.client_company_id,
                                    ).length || 0}{" "}
                                    team members
                                  </div>
                                </div>
                              ))
                            } else {
                              return (
                                <div className="text-sm text-gray-500 p-2 bg-gray-50 rounded-lg border">
                                  No client companies found.
                                </div>
                              )
                            }
                          })()}
                        </div>
                      </div>

                      {/* Client Members */}
                      <div className="border rounded-lg p-4 shadow-sm">
                        <h3 className="text-sm font-medium flex items-center text-gray-700 mb-3">
                          <Users className="h-4 w-4 mr-2 text-blue-500" />
                          Client Members
                        </h3>
                        <div className="space-y-3">
                          {(() => {
                            // Find client_company_id from the current project
                            const projectClientCompanyId = project.client_company_id

                            // Filter members based on client_company_id
                            const relevantMembers = project.client_members?.filter(
                              (member) => member.client_company_id === projectClientCompanyId,
                            )

                            if (relevantMembers?.length > 0) {
                              return relevantMembers.map((member) => (
                                <div
                                  key={`member-${member.client_member_id}`}
                                  className="bg-gray-50 p-2 rounded-lg border"
                                >
                                  <div className="font-medium text-sm">{member.client_name}</div>
                                  <div className="text-xs text-gray-600 flex justify-between items-center mt-1">
                                    <span className="truncate mr-2">{member.client_email || "No email"}</span>
                                    <span className="whitespace-nowrap">{member.phone_number || "No phone"}</span>
                                  </div>
                                </div>
                              ))
                            } else {
                              return (
                                <div className="text-sm text-gray-500 p-2 bg-gray-50 rounded-lg border">
                                  No client members found.
                                </div>
                              )
                            }
                          })()}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Project Files */}
                <Card className="mt-6 border-0 shadow-sm">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-lg font-semibold flex items-center text-gray-800">
                      <FileArchive className="h-5 w-5 mr-2 text-blue-500" />
                      Project Files
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {project.files && project.files.length > 0 ? (
                      <div key="files-grid" className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {project.files.map((file, fileIndex) => {
                          const fileId = file.file_id || file.projectFile_id
                          const isDownloading = downloading[fileId as string]
                          const fileUrl = file.file_url || file.file_path
                          const isViewable = ["pdf", "image", "txt"].includes(file.file_type?.toLowerCase())

                          return (
                            <div
                              key={`file-${fileId || fileIndex}`}
                              className="relative group flex items-center p-4 bg-gray-50 hover:bg-blue-50 border border-gray-200 hover:border-blue-200 rounded-lg transition-colors"
                            >
                              <div className="mr-3 flex-shrink-0">{getFileIcon(file.file_type)}</div>
                              <div className="flex-1 min-w-0">
                                <div className="font-medium text-gray-900 truncate">{file.file_name}</div>
                                <div className="text-sm text-gray-500">{formatDate(file.uploaded_at)}</div>

                                <div className="mt-2 flex gap-2">
                                  {isViewable && fileUrl && (
                                    <Button
                                      size="sm"
                                      variant="outline"
                                      className="text-blue-600 border-blue-200 hover:bg-blue-50"
                                      onClick={() => window.open(fileUrl, "_blank")}
                                    >
                                      <FileText className="h-4 w-4 mr-1" /> View
                                    </Button>
                                  )}

                                  <Button
                                    size="sm"
                                    className="bg-blue-600 hover:bg-blue-700 text-white"
                                    onClick={() => downloadFile(file)}
                                    disabled={isDownloading}
                                  >
                                    {isDownloading ? (
                                      <>
                                        <Loader2 className="h-4 w-4 animate-spin mr-1" />
                                        Downloading
                                      </>
                                    ) : (
                                      <>
                                        <Download className="h-4 w-4 mr-1" />
                                        Download
                                      </>
                                    )}
                                  </Button>
                                </div>
                              </div>
                            </div>
                          )
                        })}
                      </div>
                    ) : (
                      <div className="text-center py-12 border border-dashed border-gray-300 rounded-lg">
                        <FileText className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                        <div className="text-gray-500 font-medium">No files available</div>
                        <div className="text-gray-400 text-sm mt-1">Files will appear here once uploaded</div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Experts Tab */}
              <TabsContent value="experts" className="m-0 relative">
                <div className="mb-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                  <div className="relative flex-1 max-w-md w-full">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                    <input
                      type="text"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder="Search experts..."
                      className="pl-10 rounded-full border-2 border-blue-200 focus:border-blue-400 focus:ring focus:ring-blue-200 focus:ring-opacity-50 bg-white w-full py-2 px-4"
                    />
                  </div>

                  <div className="flex gap-2">
                    <Button onClick={handleAddExpert} className="bg-blue-600 hover:bg-blue-700 text-white rounded-full">
                      <Plus className="h-4 w-4 mr-2" />
                      Add Expert
                    </Button>
                  </div>
                </div>

                {/* Tab Navigation for Pipeline/Published */}
                <div className="flex gap-6 border-b mb-6">
                  {["pipeline", "published"].map((tab) => (
                    <button
                      key={`expert-tab-${tab}`}
                      className={`relative pb-2 px-4 text-sm transition-all ${
                        expertsActiveTab === tab
                          ? "text-blue-600 font-semibold border-b-2 border-blue-600"
                          : "text-muted-foreground hover:text-primary"
                      }`}
                      onClick={() => setExpertsActiveTab(tab as "pipeline" | "published")}
                    >
                      {tab.charAt(0).toUpperCase() + tab.slice(1)}
                    </button>
                  ))}
                </div>

                <div className="bg-white rounded-lg shadow overflow-hidden">
                  {expertsActiveTab === "pipeline" ? (
                    <Pipeline project_id={id || ""} onSelectExpert={handleExpertSelect} />
                  ) : (
                    <Published project_id={id || ""} onSelectExpert={handleExpertSelect} />
                  )}
                </div>
              </TabsContent>
            </div>
          </Tabs>
        </div>

        {/* Right panel - Expert details - Only shown when splitView is active */}
        {splitView && (
          <div className="w-1/2 overflow-auto border-l border-gray-200 bg-white">
            {selectedExpertId ? (
              <ExpertDetailPopup expertId={selectedExpertId} onClose={handleCloseExpertDetail} />
            ) : (
              <div className="h-full flex items-center justify-center p-8 text-center">
                <div>
                  <User className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                  <h3 className="text-xl font-medium text-gray-700 mb-2">Expert Details</h3>
                  <p className="text-gray-500 max-w-md">
                    Select an expert from the list to view their detailed profile information.
                  </p>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

