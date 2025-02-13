"use client"

import { useState, useEffect } from "react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Download, Briefcase } from 'lucide-react'
import { ExpertModal } from "./expert-modal"
import { ProjectSelectModal } from "./project-select-modal"
import API from "@/services/api"

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

  // Fetching expert data, career data, and project data
  useEffect(() => {
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
      } finally {
        setLoading(false)
      }
    }

    fetchExpertsWithDetails()
  }, [])

  // Fetch projects when modal is opened
  useEffect(() => {
    const fetchProjects = async () => {
      try {
        const response = await API.get("http://127.0.0.1:8000/projects/")
        setProjects(response.data)
      } catch (error) {
        console.error("Error fetching projects:", error)
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
        const response = await API.post("http://127.0.0.1:8000/project_pipeline/", {
          expert_id: selectedExpert.id,
          project_id: projectId,
        })
        console.log("Expert added to project:", response.data)
        setIsProjectModalOpen(false)
      } catch (error) {
        console.error("Error adding expert to project:", error)
      }
    }
  }

  if (loading) {
    return <div className="flex items-center justify-center h-screen">Loading experts...</div>
  }

  return (
    <div className="space-y-4">
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[30px]"></TableHead>
              <TableHead>Expert</TableHead>
              <TableHead>Industry</TableHead>
              <TableHead>Location</TableHead>
              <TableHead>Cost</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {experts.map((expert) => (
              <TableRow
                key={expert.id}
                className="cursor-pointer transition-colors hover:bg-secondary/10"
                onClick={() => handleExpertClick(expert)} // Select expert on click
              >
                <TableCell>
                  <input
                    type="checkbox"
                    className="rounded border-gray-300 text-primary transition-colors hover:border-primary focus:ring-primary focus:ring-offset-0"
                  />
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    {expert.isFormer && (
                      <Badge
                        variant="secondary"
                        className="text-xs transition-colors hover:bg-secondary/80"
                      >
                        Former
                      </Badge>
                    )}
                    <span className="transition-colors group-hover:text-primary">
                      {expert.fullName}
                    </span>
                  </div>
                </TableCell>
                <TableCell>{expert.industry}</TableCell>
                <TableCell>{expert.countryOfResidence}</TableCell>
                <TableCell>{expert.expertCost}</TableCell>
              </TableRow>
            ))}
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
        onClose={() => setIsProjectModalOpen(false)} // Close the project modal
        onSelect={handleProjectSelect}
      />
    </div>
  )
}