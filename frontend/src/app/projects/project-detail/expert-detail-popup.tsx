"use client"

import type React from "react"
import { useEffect, useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import {
  X,
  Building,
  Briefcase,
  Calendar,
  User,
  MapPin,
  Mail,
  Phone,
  Linkedin,
  DollarSign,
  FileText,
  ClipboardList,
  Edit,
  Loader2,
} from "lucide-react"
import API from "@/services/api"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { toast } from "react-toastify"
import { motion } from "framer-motion"

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
  question_id: number
  project_id: number
  question: string
}

interface ScreeningAnswer {
  answer_id: number
  question_id: number
  expert_id: number
  project_id: number
  answer: string
}

interface ExpertDetailPopupProps {
  expertId: number
  onClose: () => void
}

const ExpertDetailPopup: React.FC<ExpertDetailPopupProps> = ({ expertId, onClose }) => {
  const router = useRouter()
  const searchParams = useSearchParams()
  const currentProjectId = searchParams.get("id") ? Number.parseInt(searchParams.get("id") as string) : null

  const [expert, setExpert] = useState<Expert | null>(null)
  const [experiences, setExperiences] = useState<Experience[]>([])
  const [projects, setProjects] = useState<Project[]>([])
  const [screeningQuestions, setScreeningQuestions] = useState<ScreeningQuestion[]>([])
  const [screeningAnswers, setScreeningAnswers] = useState<ScreeningAnswer[]>([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState("career")
  const [editedAnswers, setEditedAnswers] = useState<Record<number, string>>({})
  const [savingAnswer, setSavingAnswer] = useState<number | null>(null)
  const [navigating, setNavigating] = useState(false)

  useEffect(() => {
    const fetchExpertData = async () => {
      try {
        setLoading(true)
        const expertResponse = await API.get(`/experts/${expertId}/`)
        setExpert(expertResponse.data)

        const experiencesResponse = await API.get(`/expert_experiences/?expert_id=${expertId}`)
        const expertExperiences = experiencesResponse.data.filter((exp: Experience) => exp.expert_id === expertId)
        setExperiences(expertExperiences)

        const pipelineResponse = await API.get(`/project_pipeline/?expert_id=${expertId}`)
        const publishedResponse = await API.get(`/project_published/?expert_id=${expertId}`)

        const projectIds = [
          ...pipelineResponse.data.map((item: ProjectAssignment) => item.project_id),
          ...publishedResponse.data.map((item: ProjectAssignment) => item.project_id),
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

          if (currentProjectId) {
            try {
              const questionsResponse = await API.get(`/screening_question/?project_id=${currentProjectId}`)
              const projectQuestions = questionsResponse.data.filter(
                (q: ScreeningQuestion) => q.project_id === currentProjectId,
              )
              setScreeningQuestions(projectQuestions)

              const answersResponse = await API.get(
                `/screening_answer/?expert_id=${expertId}&project_id=${currentProjectId}`,
              )
              setScreeningAnswers(answersResponse.data || [])
            } catch (error) {
              console.error("Error fetching screening data:", error)
              setScreeningQuestions([])
              setScreeningAnswers([])
            }
          }
        }
      } catch (error) {
        console.error("Error fetching expert data:", error)
        toast.error("Failed to load expert data")
      } finally {
        setLoading(false)
      }
    }

    if (expertId) fetchExpertData()
  }, [expertId, currentProjectId])

  const handleEditExpert = () => {
    try {
      setNavigating(true)
      // Use currentProjectId instead of projectId
      router.push(
        `/projects/project-detail/project-experts/edit-expert?id=${expertId}${currentProjectId ? `&projectId=${currentProjectId}` : ""}`,
      )
      onClose()
    } catch (error) {
      console.error("Navigation error:", error)
      toast.error("Failed to navigate to edit page")
      setNavigating(false)
    }
  }

  const formatDate = (dateString: string | null) => {
    if (!dateString) return "Present"
    const [month, year] = dateString.split("-")
    if (!month || !year) return dateString
    try {
      const date = new Date(Number.parseInt(year), Number.parseInt(month) - 1)
      return date.toLocaleDateString("en-US", { month: "short", year: "numeric" })
    } catch (error) {
      return dateString
    }
  }

  const getAnswerForQuestion = (questionId: number) => {
    return (
      screeningAnswers.find((answer) => answer.question_id === questionId && answer.expert_id === expertId)?.answer ||
      null
    )
  }

  const getAnswerObjectForQuestion = (questionId: number) => {
    return screeningAnswers.find((answer) => answer.question_id === questionId && answer.expert_id === expertId) || null
  }

  const handleSaveAnswer = async (questionId: number, answer: string) => {
    setSavingAnswer(questionId)
    try {
      const existingAnswer = getAnswerObjectForQuestion(questionId)
      const payload = {
        question_id: questionId,
        expert_id: expertId,
        project_id: currentProjectId,
        answer: answer,
      }

      let response
      if (existingAnswer) {
        response = await API.put(`/screening_answer/${existingAnswer.answer_id}/`, payload)
        const updatedAnswers = screeningAnswers.map((ans) =>
          ans.answer_id === existingAnswer.answer_id ? { ...ans, answer: answer } : ans,
        )
        setScreeningAnswers(updatedAnswers)
      } else {
        response = await API.post("/screening_answer/", payload)
        setScreeningAnswers([...screeningAnswers, response.data])
      }

      const newEditedAnswers = { ...editedAnswers }
      delete newEditedAnswers[questionId]
      setEditedAnswers(newEditedAnswers)
      toast.success("Answer saved successfully")
    } catch (error) {
      console.error("Error saving answer:", error)
      toast.error("Failed to save answer")
    } finally {
      setSavingAnswer(null)
    }
  }

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

  // Check if there are any unsaved changes
  const hasUnsavedChanges = Object.keys(editedAnswers).length > 0

  // Handle close with confirmation if there are unsaved changes
  const handleCloseWithConfirmation = () => {
    if (hasUnsavedChanges) {
      if (window.confirm("You have unsaved changes. Are you sure you want to close?")) {
        onClose()
      }
    } else {
      onClose()
    }
  }

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
        {/* Close Button */}
        <motion.button
          onClick={handleCloseWithConfirmation}
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.95 }}
          className="absolute top-4 right-4 z-50"
          aria-label="Close"
        >
          <div className="p-1.5 bg-white rounded-full shadow-lg hover:shadow-xl transition-shadow">
            <X className="h-6 w-6 text-gray-600" />
          </div>
        </motion.button>

        {/* Profile Section */}
        <div className="p-6 bg-gradient-to-br from-blue-50 to-white border-b sticky top-0 z-10">
          <div className="flex items-start">
            <div className="flex-shrink-0 mr-5 flex flex-col items-center ml-4 pt-4">
              <div className="h-20 w-20 bg-blue-100 rounded-full flex items-center justify-center mb-4">
                <User className="h-10 w-10 text-blue-600" />
              </div>

              <Button
                onClick={handleEditExpert}
                variant="ghost"
                disabled={navigating}
                className="text-xs text-blue-600 hover:text-blue-800 hover:bg-blue-100 px-3 py-1 rounded-full flex items-center gap-1 h-7"
              >
                {navigating ? (
                  <>
                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                    Navigating...
                  </>
                ) : (
                  <>
                    <Edit className="h-3.5 w-3.5" />
                    Edit Profile
                  </>
                )}
              </Button>
            </div>

            <div className="flex-1 ml-6 mt-2">
              <div className="flex-1 ml-6">
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
                    <DollarSign className="h-3 w-3 mr-1" />
                    {expert.expert_cost}
                  </Badge>
                </div>

                {/* Contact icons */}
                <div className="flex gap-3 mt-4">
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="p-2 rounded-full bg-gray-100 hover:bg-gray-200 transition-all"
                    onClick={() => (window.location.href = `mailto:${expert.email}`)}
                    title="Send Email"
                  >
                    <Mail className="h-5 w-5 text-gray-600" />
                  </motion.button>

                  {expert.linkedIn_profile_link && (
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      className="p-2 rounded-full bg-gray-100 hover:bg-gray-200 transition-all"
                      onClick={() => window.open(expert.linkedIn_profile_link, "_blank")}
                      title="LinkedIn Profile"
                    >
                      <Linkedin className="h-5 w-5 text-gray-600" />
                    </motion.button>
                  )}

                  {expert.phone_number && (
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      className="p-2 rounded-full bg-gray-100 hover:bg-gray-200 transition-all"
                      onClick={async () => {
                        try {
                          await navigator.clipboard.writeText(expert.phone_number)
                          toast.success("Phone number copied!")
                        } catch (error) {
                          toast.error("Failed to copy")
                        }
                      }}
                      title="Copy Phone Number"
                    >
                      <Phone className="h-5 w-5 text-gray-600" />
                    </motion.button>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Tabs Section */}
        <Tabs defaultValue="career" className="flex-1 flex flex-col h-[calc(100%-172px)]">
          <TabsList className="flex p-1 mx-6 mt-4 bg-gray-100 rounded-lg justify-center">
            <TabsTrigger
              value="career"
              className="flex-1 rounded-md data-[state=active]:bg-white data-[state=active]:text-blue-700"
            >
              Career
            </TabsTrigger>
            <TabsTrigger
              value="projects"
              className="flex-1 rounded-md data-[state=active]:bg-white data-[state=active]:text-blue-700"
            >
              Projects
            </TabsTrigger>
            <TabsTrigger
              value="screening"
              className="flex-1 rounded-md data-[state=active]:bg-white data-[state=active]:text-blue-700"
            >
              Screening
            </TabsTrigger>
          </TabsList>

          <div className="flex-1 overflow-y-auto p-6">
            {/* Career Tab */}
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
                            <h4 className="font-medium text-gray-800 text-lg">{exp.title}</h4>
                            <div className="flex items-center text-gray-600 mt-1">
                              <Building className="h-4 w-4 mr-1" />
                              <span className="font-medium">{exp.company_name}</span>
                            </div>
                            <div className="text-sm text-gray-500 flex items-center mt-2 self-start bg-white px-3 py-1 rounded-full border">
                              <Calendar className="h-4 w-4 mr-1" />
                              {formatDate(exp.start_date)} - {formatDate(exp.end_date)}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="bg-gray-50 p-6 rounded-lg border text-center">
                      <Briefcase className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                      <p className="text-gray-500 font-medium">No career history available</p>
                    </div>
                  )}
                </div>

                <div>
                  <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                    <FileText className="h-5 w-5 mr-2 text-blue-500" />
                    Biography
                  </h3>
                  <div className="bg-gray-50 p-4 rounded-lg border min-h-[100px]">
                    <div className="text-gray-700 whitespace-pre-line">{expert.notes || "No biography available"}</div>
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
                      className={`bg-white p-4 rounded-lg border ${
                        currentProjectId === project.project_id
                          ? "border-blue-400 shadow-md"
                          : "border-gray-200 hover:border-blue-200"
                      } transition-all`}
                    >
                      <div className="flex justify-between items-start">
                        <h4 className="font-medium text-gray-800">{project.project_name}</h4>
                        <div className="flex items-center gap-2">
                          {currentProjectId === project.project_id && (
                            <Badge className="bg-blue-100 text-blue-800">Current</Badge>
                          )}
                          <Badge className={project.status ? "bg-gray-100" : "bg-green-100"}>
                            {project.status ? "Closed" : "Active"}
                          </Badge>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="bg-gray-50 p-6 rounded-lg border text-center">
                  <Briefcase className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                  <p className="text-gray-500 font-medium">No projects available</p>
                </div>
              )}
            </TabsContent>

            {/* Screening Tab */}
            <TabsContent value="screening" className="mt-0 h-full">
              <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                <ClipboardList className="h-5 w-5 mr-2 text-blue-500" />
                Project Screening
              </h3>
              {screeningQuestions.length > 0 ? (
                <div className="space-y-4">
                  {screeningQuestions.map((question) => {
                    const questionId = question.question_id
                    const answer = getAnswerForQuestion(questionId)
                    const isEditing = editedAnswers[questionId] !== undefined
                    const isSaving = savingAnswer === questionId

                    return (
                      <div key={questionId} className="bg-gray-50 p-4 rounded-lg border">
                        <div className="space-y-2">
                          <div className="text-sm text-gray-500">{question.question}</div>
                          {isEditing ? (
                            <div className="mt-2">
                              <textarea
                                className="w-full p-2 border rounded-md focus:ring-blue-500"
                                rows={4}
                                value={editedAnswers[questionId]}
                                onChange={(e) => setEditedAnswers({ ...editedAnswers, [questionId]: e.target.value })}
                                disabled={isSaving}
                              />
                              <div className="flex justify-end mt-2 gap-2">
                                <Button
                                  variant="outline"
                                  onClick={() => {
                                    const newEditedAnswers = { ...editedAnswers }
                                    delete newEditedAnswers[questionId]
                                    setEditedAnswers(newEditedAnswers)
                                  }}
                                  disabled={isSaving}
                                >
                                  Cancel
                                </Button>
                                <Button
                                  onClick={() => handleSaveAnswer(questionId, editedAnswers[questionId])}
                                  disabled={isSaving}
                                >
                                  {isSaving ? (
                                    <>
                                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                      Saving...
                                    </>
                                  ) : (
                                    "Save"
                                  )}
                                </Button>
                              </div>
                            </div>
                          ) : (
                            <div className="flex justify-between items-start">
                              <div className="font-medium text-gray-800 whitespace-pre-line">
                                {answer || "No answer provided"}
                              </div>
                              <Button
                                variant="ghost"
                                className="text-blue-600 hover:text-blue-800"
                                onClick={() => setEditedAnswers({ ...editedAnswers, [questionId]: answer || "" })}
                              >
                                {answer ? "Edit" : "Add Answer"}
                              </Button>
                            </div>
                          )}
                        </div>
                      </div>
                    )
                  })}
                </div>
              ) : (
                <div className="bg-gray-50 p-6 rounded-lg border text-center">
                  <ClipboardList className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                  <p className="text-gray-500 font-medium">No screening questions</p>
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
