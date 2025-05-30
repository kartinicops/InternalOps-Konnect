"use client"

import type React from "react"
import { useEffect, useState } from "react"
import { X, Building, Briefcase, Calendar, User, MapPin, Mail, Phone, Link, Linkedin, DollarSign, FileText, ClipboardList } from "lucide-react"
import API from "@/services/api"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"


interface Expert {
  expert_id: number
  full_name: string
  linkedIn_profile_link: string
  industry: string
  country_of_residence: string
  email: string
  phone_number: string
  expert_cost: number
  notes: string
  email_confirmed: boolean
  created_at?: string
}

interface Experience {
  experience_id: number
  expert_id: number
  company_name: string
  title: string
  start_date: string
  end_date: string | null
}

interface Project {
  project_id: number
  project_name: string
  status: boolean
}

interface ProjectAssignment {
  expert_id: number
  project_id: number
}

interface ScreeningQuestion {
  question_id: number | null
  expert_id: number | null
  answer: string
}

interface ExpertDetailPopupProps {
  expertId: number
  onClose: () => void
}

const ExpertDetailPopup: React.FC<ExpertDetailPopupProps> = ({ expertId, onClose }) => {
  const [expert, setExpert] = useState<Expert | null>(null)
  const [experiences, setExperiences] = useState<Experience[]>([])
  const [projects, setProjects] = useState<Project[]>([])
  const [screeningQuestions, setScreeningQuestions] = useState<ScreeningQuestion[]>([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState("career")

  useEffect(() => {
    const fetchExpertData = async () => {
      try {
        setLoading(true)

        // Fetch expert details
        const expertResponse = await API.get(`/experts/${expertId}/`)
        setExpert(expertResponse.data)

        // Fetch expert experiences specifically for this expert
        const experiencesResponse = await API.get(`/expert_experiences/?expert_id=${expertId}`)
        const expertExperiences = experiencesResponse.data.filter((exp: Experience) => exp.expert_id === expertId)
        setExperiences(expertExperiences)

        // Fetch projects from pipeline and published for this expert
        const pipelineResponse = await API.get(`/project_pipeline/?expert_id=${expertId}`)
        const publishedResponse = await API.get(`/project_published/?expert_id=${expertId}`)

        const pipelineAssignments = pipelineResponse.data.filter(
          (item: ProjectAssignment) => item.expert_id === expertId,
        )

        const publishedAssignments = publishedResponse.data.filter(
          (item: ProjectAssignment) => item.expert_id === expertId,
        )

        const projectIds = [
          ...pipelineAssignments.map((item: ProjectAssignment) => item.project_id),
          ...publishedAssignments.map((item: ProjectAssignment) => item.project_id),
        ]

        const uniqueProjectIds = [...new Set(projectIds)]

        if (uniqueProjectIds.length > 0) {
          const projectsData = await Promise.all(
            uniqueProjectIds.map(async (projectId) => {
              try {
                const projectResponse = await API.get(`/projects/${projectId}/`)
                return projectResponse.data
              } catch (error) {
                console.error(`Error fetching project ${projectId}:`, error)
                return null
              }
            }),
          )

          setProjects(projectsData.filter(Boolean))
        } else {
          setProjects([])
        }

        // Fetch screening questions
        const screeningResponse = await API.get(`/screening_question/?expert_id=${expertId}`)
        setScreeningQuestions(screeningResponse.data)
      } catch (error) {
        console.error("Error fetching expert data:", error)
      } finally {
        setLoading(false)
      }
    }

    if (expertId) {
      fetchExpertData()
    }
  }, [expertId])

  // Format date from API (e.g., "01-2017" to "Jan 2017")
  const formatDate = (dateString: string | null) => {
    if (!dateString) return "Present"

    const [month, year] = dateString.split("-")
    if (!month || !year) return dateString

    try {
      const date = new Date(Number.parseInt(year), Number.parseInt(month) - 1)
      return date.toLocaleDateString("en-US", {
        month: "short",
        year: "numeric",
      })
    } catch (error) {
      return dateString
    }
  }

  // Get current or most recent position
  const getCurrentPosition = () => {
    if (!experiences || experiences.length === 0) return null

    const sortedExperiences = [...experiences].sort((a, b) => {
      if (!a.end_date) return -1
      if (!b.end_date) return 1
      return new Date(b.end_date).getTime() - new Date(a.end_date).getTime()
    })

    return sortedExperiences[0]
  }

  const currentPosition = getCurrentPosition()

  if (loading) {
    return (
      <div className="h-full w-full flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    )
  }

  if (!expert) {
    return (
      <div className="h-full w-full flex items-center justify-center p-8">
        <div className="text-center">
          <div className="text-gray-600">Expert data not found.</div>
        </div>
      </div>
    )
  }

  return (
    <div className="h-full overflow-auto">
      <div className="relative bg-white h-full">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-10 p-2 rounded-full bg-white shadow-md text-gray-500 hover:text-gray-700"
        >
          <X className="h-5 w-5" />
        </button>

        {/* Expert Profile Summary */}
        <div className="p-6 bg-gradient-to-br from-blue-50 to-white border-b">
          <div className="flex items-start">
            <div className="flex-shrink-0 h-20 w-20 bg-blue-100 rounded-full flex items-center justify-center mr-5">
              <User className="h-10 w-10 text-blue-600" />
            </div>
            <div className="flex-1">
              <h2 className="text-2xl font-bold text-gray-800">{expert.full_name}</h2>

              {currentPosition && (
                <div className="text-gray-600 mt-1">
                  {currentPosition.title} at {currentPosition.company_name}
                </div>
              )}

              <div className="flex flex-wrap gap-2 mt-3">
                <Badge className="bg-blue-100 text-blue-800 border-none">{expert.industry}</Badge>
                <Badge className="bg-gray-100 text-gray-800 border-none flex items-center">
                  <MapPin className="h-3 w-3 mr-1" />
                  {expert.country_of_residence}
                </Badge>
                <Badge className="bg-green-100 text-green-800 border-none flex items-center">
                  <DollarSign className="h-3 w-3 mr-1" />${expert.expert_cost}/hr
                </Badge>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Contact Bar */}
        <div className="flex flex-wrap gap-4 px-6 py-3 bg-gray-50 border-b text-sm">
          <a href={`mailto:${expert.email}`} className="flex items-center text-blue-600 hover:text-blue-800">
            <Mail className="h-4 w-4 mr-1" />
            {expert.email}
          </a>

          {expert.linkedIn_profile_link && (
        <a
        
        href={expert.linkedIn_profile_link}
        target="_blank"
        rel="noopener noreferrer"
        className="flex items-center text-blue-600 hover:text-blue-800"
        >
        <Linkedin className="h-4 w-4 mr-1" />
        {expert.linkedIn_profile_link}
        </a>
        )}

          {expert.phone_number && (
            <span className="flex items-center text-blue-600">
              <Phone className="h-4 w-4 mr-1" />
              {expert.phone_number}
            </span>
          )}


        </div>

        {/* Tabs */}
        <Tabs defaultValue="career" className="flex-1 flex flex-col h-[calc(100%-172px)]">
          <TabsList className="flex p-1 mx-6 mt-4 bg-gray-100 rounded-lg justify-center">
            <TabsTrigger
              value="career"
              className="flex-1 rounded-md data-[state=active]:bg-white data-[state=active]:text-blue-700 data-[state=active]:shadow-sm"
            >
              Career
            </TabsTrigger>
            <TabsTrigger
              value="projects"
              className="flex-1 rounded-md data-[state=active]:bg-white data-[state=active]:text-blue-700 data-[state=active]:shadow-sm"
            >
              Projects
            </TabsTrigger>
            <TabsTrigger
              value="screening"
              className="flex-1 rounded-md data-[state=active]:bg-white data-[state=active]:text-blue-700 data-[state=active]:shadow-sm"
            >
              Screening
            </TabsTrigger>
          </TabsList>

          <div className="flex-1 overflow-y-auto p-6">
            {/* Career History Tab */}
            <TabsContent value="career" className="mt-0 h-full">
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                    <Briefcase className="h-5 w-5 mr-2 text-blue-500" />
                    Career History
                  </h3>

                  {experiences.length > 0 ? (
                    <div className="space-y-4">
                      {experiences.map((exp) => (
                        <div key={exp.experience_id} className="bg-gray-50 p-4 rounded-lg border-l-4 border-blue-400">
                          <div className="flex flex-col">
                            <div>
                              <h4 className="font-medium text-gray-800 text-lg">{exp.title}</h4>
                              <div className="flex items-center text-gray-600 mt-1">
                                <Building className="h-4 w-4 mr-1" />
                                <span className="font-medium">{exp.company_name}</span>
                              </div>
                            </div>
                            <div className="text-sm text-gray-500 flex items-center mt-2 self-start bg-white px-3 py-1 rounded-full border border-gray-200">
                              <Calendar className="h-4 w-4 mr-1" />
                              <span>
                                {formatDate(exp.start_date)} - {formatDate(exp.end_date)}
                              </span>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="bg-gray-50 p-6 rounded-lg border border-gray-200 text-center">
                      <Briefcase className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                      <p className="text-gray-500 font-medium">No career history available</p>
                      <p className="text-gray-400 text-sm mt-1">This expert hasn't added any work experience yet.</p>
                    </div>
                  )}
                </div>

                <div>
                  <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                    <FileText className="h-5 w-5 mr-2 text-blue-500" />
                    Notes
                  </h3>
                  <div className="bg-gray-50 p-4 rounded-lg border border-gray-200 min-h-[100px]">
                    <div className="text-gray-700 whitespace-pre-line">
                      {expert.notes || "No notes available for this expert."}
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                    <Mail className="h-5 w-5 mr-2 text-blue-500" />
                    Contact Information
                  </h3>
                  <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                    <div className="space-y-4">
                      <div>
                        <p className="text-sm text-gray-500">Email</p>
                        <a href={`mailto:${expert.email}`} className="text-blue-600 hover:underline font-medium">
                          {expert.email}
                        </a>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">Phone</p>
                        <p className="font-medium">{expert.phone_number || "Not provided"}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">LinkedIn</p>
                        <a
                          href={expert.linkedIn_profile_link}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-600 hover:underline font-medium break-all"
                        >
                          {expert.linkedIn_profile_link || "Not provided"}
                        </a>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </TabsContent>

            {/* Projects Tab */}
            <TabsContent value="projects" className="mt-0 h-full">
              <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                <Briefcase className="h-5 w-5 mr-2 text-blue-500" />
                Projects ({projects.length})
              </h3>

              {projects.length > 0 ? (
                <div className="space-y-4">
                  {projects.map((project) => (
                    <div
                      key={project.project_id}
                      className="bg-white p-4 rounded-lg border border-gray-200 hover:border-blue-200 hover:shadow-md transition-all"
                    >
                      <div className="flex justify-between items-start">
                        <h4 className="font-medium text-gray-800">{project.project_name}</h4>
                        <Badge
                          className={
                            project.status
                              ? "bg-gray-100 text-gray-800 border-gray-200"
                              : "bg-green-100 text-green-800 border-green-200"
                          }
                        >
                          {project.status ? "Closed" : "Active"}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="bg-gray-50 p-6 rounded-lg border border-gray-200 text-center">
                  <Briefcase className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                  <p className="text-gray-500 font-medium">No projects available</p>
                  <p className="text-gray-400 text-sm mt-1">This expert hasn't been assigned to any projects yet.</p>
                </div>
              )}
            </TabsContent>

            {/* Screening Tab */}
            <TabsContent value="screening" className="mt-0 h-full">
              <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                <ClipboardList className="h-5 w-5 mr-2 text-blue-500" />
                Screening Questions
              </h3>

              {screeningQuestions.length > 0 ? (
                <div className="space-y-4">
                  {screeningQuestions.map((question, index) => (
                    <div key={index} className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                      <div className="space-y-2">
                        <div className="text-sm text-gray-500">Question {index + 1}</div>
                        <div className="font-medium text-gray-800 whitespace-pre-line">
                          {question.answer || "No answer provided."}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="bg-gray-50 p-6 rounded-lg border border-gray-200 text-center">
                  <ClipboardList className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                  <p className="text-gray-500 font-medium">No screening questions available</p>
                  <p className="text-gray-400 text-sm mt-1">
                    This expert hasn't completed any screening questions yet.
                  </p>
                </div>
              )}
            </TabsContent>
          </div>
        </Tabs>
      </div>
    </div>
  )
}

export default ExpertDetailPopup