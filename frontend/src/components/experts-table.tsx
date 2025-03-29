"use client"

import { useState, useEffect } from "react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { 
  Download, 
  Briefcase, 
  Edit2, 
  Trash2, 
  MoreHorizontal,
  Eye
} from 'lucide-react'
import { ExpertModal } from "./expert-modal"
import { ProjectSelectModal } from "./project-select-modal"
import API from "@/services/api"
import Link from "next/link"
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu"
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"

export interface Expert {
  id: string
  fullName: string
  industry: string
  countryOfResidence: string
  expertCost: number
  email: string
  phone: string
  isFormer: boolean
  linkedIn: string
  career: Array<{
    title: string
    company_name: string
    dateRange: string
  }>
  projects: Array<{
    projectId: string
    projectName: string
  }>
}

export function ExpertsTable() {
  const [experts, setExperts] = useState<Expert[]>([])
  const [selectedExpert, setSelectedExpert] = useState<Expert | null>(null)
  const [loading, setLoading] = useState(true)
  const [isProjectModalOpen, setIsProjectModalOpen] = useState(false)
  const [projects, setProjects] = useState<any[]>([]) 
  const [loadingProjects, setLoadingProjects] = useState(true)
  const [expertToDelete, setExpertToDelete] = useState<Expert | null>(null)
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)

  // Fetching expert data, career data, and project data
  useEffect(() => {
    fetchExpertsWithDetails()
  }, [])

  const fetchExpertsWithDetails = async () => {
    try {
      setLoading(true)

      // Fetch experts data
      const expertResponse = await API.get("/experts/") 
      const expertsData = expertResponse.data.map((expert: any) => ({
        id: expert.expert_id,
        fullName: expert.full_name,
        industry: expert.industry,
        countryOfResidence: expert.country_of_residence,
        expertCost: expert.expert_cost,
        email: expert.email,
        phone: expert.phone_number,
        linkedIn: expert.linkedIn_profile_link,
        isFormer: expert.email_confirmed,
      }))

      // Fetch career data
      const careerResponse = await API.get("/expert_experiences")
      const careerData = careerResponse.data

      // Fetch project data
      const projectsResponse = await API.get("/projects")
      const projectsData = projectsResponse.data.map((project: any) => ({
        id: project.project_id,
        projectName: project.project_name,
      }));

      // Fetch pipeline and published projects
      const pipelineResponse = await API.get("/project_pipeline")
      const pipelineData = pipelineResponse.data.map((projectPipeline: any) => ({
        expertId: projectPipeline.expert_id,
        projectId: projectPipeline.project_id,
      }));

      const publishedResponse = await API.get("/project_published")
      const publishedData = publishedResponse.data.map((projectPublished: any) => ({
        expertId: projectPublished.expert_id,
        projectId: projectPublished.project_id,
      }));

      // Merge project data with expert data (both pipeline and published)
      const expertsWithDetails = expertsData.map((expert: any) => {
        const expertCareer = careerData.filter((career: any) => career.expert_id === expert.id)

        // Directly linking project ids to experts from pipeline and published projects
        const expertPipelineProjects = pipelineData.filter((pipeline: any) => pipeline.expertId === expert.id)
          .map((pipeline: any) => {
            return projectsData.find((project: any) => project.id === pipeline.projectId)
          }).filter(Boolean)

        const expertPublishedProjects = publishedData.filter((published: any) => published.expertId === expert.id)
          .map((published: any) => {
            return projectsData.find((project: any) => project.id === published.projectId)
          }).filter(Boolean)

        return {
          ...expert,
          career: expertCareer, // Contains company_name and title
          projects: [...expertPipelineProjects, ...expertPublishedProjects],
        }
      })

      setExperts(expertsWithDetails) // Set the experts data with career and project information
    } catch (error) {
      console.error("Error fetching experts with details:", error)
      toast.error("Failed to load experts data. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  // Fetch projects when modal is opened
  useEffect(() => {
    const fetchProjects = async () => {
      try {
        const response = await API.get("/projects/")
        setProjects(response.data)
      } catch (error) {
        console.error("Error fetching projects:", error)
        toast.error("Failed to load projects. Please try again.")
      } finally {
        setLoadingProjects(false)
      }
    }

    if (isProjectModalOpen) {
      fetchProjects()
    }
  }, [isProjectModalOpen])

  const handleExpertClick = (expert: Expert) => {
    setSelectedExpert(expert)
  }

  const handleAddToProject = () => {
    setIsProjectModalOpen(true)
  }

  const handleProjectSelect = async (projectId: string) => {
    if (selectedExpert) {
      try {
        const response = await API.post("/project_pipeline/", {
          expert_id: selectedExpert.id,
          project_id: projectId,
        })
        console.log("Expert added to project:", response.data)
        toast.success("Expert added to project successfully.")
        setIsProjectModalOpen(false)
      } catch (error) {
        console.error("Error adding expert to project:", error)
        toast.error("Failed to add expert to project. Please try again.")
      }
    }
  }

  const handleDeleteExpert = (expert: Expert, e: React.MouseEvent) => {
    e.stopPropagation() // Prevent row click event
    setExpertToDelete(expert)
    setIsDeleteModalOpen(true)
  }

  const confirmDelete = async () => {
    if (!expertToDelete) return

    try {
      await API.delete(`/experts/${expertToDelete.id}`)
      setExperts(experts.filter(expert => expert.id !== expertToDelete.id))
      toast.success(`${expertToDelete.fullName} has been deleted.`)
    } catch (error) {
      console.error("Error deleting expert:", error)
      toast.error("Failed to delete expert. Please try again.")
    } finally {
      setIsDeleteModalOpen(false)
      setExpertToDelete(null)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {/* Toast Container for notifications */}
      <ToastContainer 
        position="top-right"
        autoClose={5000}
        hideProgressBar={false}
        newestOnTop
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
      />
      
      <div className="rounded-lg border border-gray-200 bg-white overflow-hidden">
        <Table>
          <TableHeader className="bg-gray-50">
            <TableRow>
              <TableHead className="w-[30px]"></TableHead>
              <TableHead>Expert</TableHead>
              <TableHead>Industry</TableHead>
              <TableHead>Location</TableHead>
              <TableHead>Cost</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {experts.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="h-24 text-center text-gray-500">
                  No experts found. Add your first expert to get started.
                </TableCell>
              </TableRow>
            ) : (
              experts.map((expert) => (
                <TableRow
                  key={expert.id}
                  className="cursor-pointer transition-colors hover:bg-blue-50"
                  onClick={() => handleExpertClick(expert)}
                >
                  <TableCell>
                    <input
                      type="checkbox"
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500 focus:ring-offset-0"
                      onClick={(e) => e.stopPropagation()}
                    />
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <div className="relative flex h-10 w-10 shrink-0 overflow-hidden rounded-full">
                        <div className="bg-blue-100 text-blue-600 font-medium flex items-center justify-center w-full h-full">
                          {expert.fullName.split(' ').map(name => name[0]).join('').toUpperCase().substring(0, 2)}
                        </div>
                      </div>
                      <div>
                        <div className="font-medium text-gray-900">{expert.fullName}</div>
                        <div className="text-sm text-gray-500">{expert.email}</div>
                      </div>
                      {expert.isFormer && (
                        <Badge
                          variant="secondary"
                          className="ml-2 bg-blue-100 text-blue-700 hover:bg-blue-200"
                        >
                          Former
                        </Badge>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <span className="inline-flex items-center rounded-full bg-gray-100 px-2.5 py-0.5 text-xs font-medium text-gray-800">
                      {expert.industry}
                    </span>
                  </TableCell>
                  <TableCell>{expert.countryOfResidence}</TableCell>
                  <TableCell>${expert.expertCost.toLocaleString()}</TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2" onClick={(e) => e.stopPropagation()}>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-gray-500 hover:text-blue-600"
                        onClick={() => handleExpertClick(expert)}
                      >
                        <Eye className="h-4 w-4" />
                        <span className="sr-only">View</span>
                      </Button>
                      <Link href={`/experts/edit/${expert.id}`} legacyBehavior passHref>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-gray-500 hover:text-blue-600"
                        >
                          <Edit2 className="h-4 w-4" />
                          <span className="sr-only">Edit</span>
                        </Button>
                      </Link>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-gray-500 hover:text-red-600"
                        onClick={(e) => handleDeleteExpert(expert, e)}
                      >
                        <Trash2 className="h-4 w-4" />
                        <span className="sr-only">Delete</span>
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      <ExpertModal
        expert={selectedExpert}
        isOpen={selectedExpert !== null}
        onClose={() => setSelectedExpert(null)}
        onAddToProject={handleAddToProject}
        pipeline={selectedExpert ? selectedExpert.projects.filter((project) => project.projectName.includes('pipeline')).map((project) => project.projectName) : []}
        published={selectedExpert ? selectedExpert.projects.filter((project) => project.projectName.includes('published')).map((project) => project.projectName) : []}
        projects={selectedExpert ? selectedExpert.projects.map((project) => project.projectName) : []}
      />

      <ProjectSelectModal
        isOpen={isProjectModalOpen}
        onClose={() => setIsProjectModalOpen(false)}
        onSelect={handleProjectSelect}
      />

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={isDeleteModalOpen} onOpenChange={setIsDeleteModalOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Expert</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete {expertToDelete?.fullName}? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDelete}
              className="bg-red-600 text-white hover:bg-red-700"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}