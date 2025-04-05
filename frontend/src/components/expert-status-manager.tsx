'use client'

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Loader2, AlertCircle, User, Check, X, Calendar } from "lucide-react"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Switch } from "@/components/ui/switch"
import { toast } from "react-toastify"
import API from "@/services/api"

// Define the types for our data
interface ProjectPublishedData {
  project_publish_id: number
  expert_id: number
  project_id: number
  user_id: number
  status_id: number
  expert_availability: boolean
  angles: string
  created_at: string
  project_name?: string // Will be populated after fetching from projects API
}

interface StatusOption {
  id: number
  label: string
  color: string
  icon: JSX.Element
}

const statusOptions: StatusOption[] = [
  { 
    id: 1, 
    label: "Propose", 
    color: "bg-yellow-100 text-yellow-800 border-yellow-300", 
    icon: <AlertCircle className="h-4 w-4 text-yellow-500" /> 
  },
  { 
    id: 2, 
    label: "Schedule Call", 
    color: "bg-blue-100 text-blue-800 border-blue-300", 
    icon: <Calendar className="h-4 w-4 text-blue-500" /> 
  },
  { 
    id: 3, 
    label: "Reject", 
    color: "bg-red-100 text-red-800 border-red-300", 
    icon: <X className="h-4 w-4 text-red-500" /> 
  }
]

interface ExpertStatusManagerProps {
  expertId: string | null
  projectId?: string | null // Optional - if coming from a specific project
  onStatusChange?: (status: any) => void
}

export const ExpertStatusManager: React.FC<ExpertStatusManagerProps> = ({ 
  expertId, 
  projectId, 
  onStatusChange 
}) => {
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [projectsData, setProjectsData] = useState<ProjectPublishedData[]>([])
  
  // Fetch data for this expert
  useEffect(() => {
    const fetchExpertProjectData = async () => {
      if (!expertId) {
        setLoading(false)
        return
      }

      try {
        // 1. Fetch all project published entries for this expert
        const publishedResponse = await API.get(`/project_published/`)
        const allPublishedData = publishedResponse.data

        // Filter records for this expert
        const expertPublishedData = allPublishedData.filter(
          (item: any) => item.expert_id.toString() === expertId.toString()
        )

        if (expertPublishedData.length === 0) {
          setLoading(false)
          return
        }

        // 2. Fetch project details to get project names
        const projectIds = [...new Set(expertPublishedData.map((item: any) => item.project_id))]
        
        // Create a map to store project names by ID
        const projectNamesMap = new Map()

        // Fetch project details for each unique project ID
        await Promise.all(
          projectIds.map(async (id) => {
            try {
              const projectResponse = await API.get(`/projects/${id}/`)
              const projectData = projectResponse.data
              projectNamesMap.set(id, projectData.project_name)
            } catch (error) {
              console.error(`Error fetching project ${id}:`, error)
              projectNamesMap.set(id, `Project ${id}`)
            }
          })
        )

        // Add project names to the published data
        const enrichedPublishedData = expertPublishedData.map((item: any) => ({
          ...item,
          project_name: projectNamesMap.get(item.project_id) || `Project ${item.project_id}`
        }))

        // If specific projectId is provided, filter to show only that project
        const filteredData = projectId 
          ? enrichedPublishedData.filter((item: any) => item.project_id.toString() === projectId.toString())
          : enrichedPublishedData

        setProjectsData(filteredData)
      } catch (error) {
        console.error("Error fetching expert project data:", error)
        toast.error("Failed to load expert's project data")
      } finally {
        setLoading(false)
      }
    }

    fetchExpertProjectData()
  }, [expertId, projectId])

  const handleStatusChange = async (publishId: number, newStatusId: number) => {
    setSaving(true)
    try {
      await API.patch(`/project_published/${publishId}/`, {
        status_id: newStatusId
      })

      // Update local state
      setProjectsData(prev => 
        prev.map(item => 
          item.project_publish_id === publishId 
            ? { ...item, status_id: newStatusId } 
            : item
        )
      )

      toast.success("Expert status updated successfully")
      
      // Call parent callback if provided
      if (onStatusChange) {
        onStatusChange({
          publishId,
          newStatus: newStatusId
        })
      }
    } catch (error) {
      console.error("Error updating expert status:", error)
      toast.error("Failed to update expert status")
    } finally {
      setSaving(false)
    }
  }

  const handleAvailabilityChange = async (publishId: number, newAvailability: boolean) => {
    setSaving(true)
    try {
      await API.patch(`/project_published/${publishId}/`, {
        expert_availability: newAvailability
      })

      // Update local state
      setProjectsData(prev => 
        prev.map(item => 
          item.project_publish_id === publishId 
            ? { ...item, expert_availability: newAvailability } 
            : item
        )
      )

      toast.success(`Expert is now ${newAvailability ? 'available' : 'unavailable'} for this project`)
      
      // Call parent callback if provided
      if (onStatusChange) {
        onStatusChange({
          publishId,
          newAvailability
        })
      }
    } catch (error) {
      console.error("Error updating expert availability:", error)
      toast.error("Failed to update expert availability")
    } finally {
      setSaving(false)
    }
  }

  // Loading state
  if (loading) {
    return (
      <Card className="shadow-sm border border-gray-100 overflow-hidden rounded-xl bg-gradient-to-br from-white to-blue-50">
        <CardHeader className="bg-white border-b border-gray-100 py-4 px-6">
          <CardTitle className="text-lg font-semibold text-gray-800 flex items-center">
            <div className="w-1 h-5 bg-blue-600 mr-3 rounded-full"></div>
            <User className="h-4 w-4 mr-2 text-blue-600" />Expert Project Status
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6 flex justify-center items-center">
          <Loader2 className="h-5 w-5 text-blue-600 animate-spin mr-2" />
          <p className="text-gray-500">Loading projects data...</p>
        </CardContent>
      </Card>
    )
  }

  // No projects found
  if (projectsData.length === 0) {
    return (
      <Card className="shadow-sm border border-gray-100 overflow-hidden rounded-xl bg-gradient-to-br from-white to-blue-50">
        <CardHeader className="bg-white border-b border-gray-100 py-4 px-6">
          <CardTitle className="text-lg font-semibold text-gray-800 flex items-center">
            <div className="w-1 h-5 bg-blue-600 mr-3 rounded-full"></div>
            <User className="h-4 w-4 mr-2 text-blue-600" />Expert Project Status
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          <div className="text-center py-4">
            <AlertCircle className="h-8 w-8 text-gray-400 mx-auto mb-2" />
            <p className="text-gray-500">This expert is not associated with any projects yet.</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  // Render projects with status and availability controls
  return (
    <Card className="shadow-sm border border-gray-100 overflow-hidden rounded-xl bg-gradient-to-br from-white to-blue-50 group">
      <CardHeader className="bg-white border-b border-gray-100 py-4 px-6 group-hover:bg-blue-50/50 transition-colors">
        <CardTitle className="text-lg font-semibold text-gray-800 flex items-center">
          <div className="w-1 h-5 bg-blue-600 mr-3 rounded-full"></div>
          <User className="h-4 w-4 mr-2 text-blue-600" />
          Expert Project Status
        </CardTitle>
      </CardHeader>
      <CardContent className="p-6 relative">
        {/* Background decorative elements */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-blue-100 rounded-full opacity-20 -mr-20 -mt-20 z-0"></div>
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-blue-200 rounded-full opacity-10 -ml-16 -mb-16 z-0"></div>
        
        <div className="relative z-10 space-y-6">
          {projectsData.map((project) => (
            <div 
              key={project.project_publish_id} 
              className="border border-gray-200 bg-white/80 backdrop-blur-sm rounded-lg p-5 space-y-4 hover:border-blue-400 transition-colors shadow-sm hover:shadow-md"
            >
              <div className="flex justify-between items-center border-b border-gray-100 pb-3">
                <h3 className="text-base font-medium text-gray-900">
                  {project.project_name || `Project ${project.project_id}`}
                </h3>
                <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full">
                  ID: {project.project_publish_id}
                </span>
              </div>
              
              {/* Status section */}
              <div className="space-y-3">
                <Label className="text-sm font-medium text-gray-700 flex items-center gap-2">
                  <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-gray-500">
                    <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"></path>
                    <polyline points="14 2 14 8 20 8"></polyline>
                  </svg>
                  Expert Status
                </Label>
                
                <RadioGroup 
                  defaultValue={project.status_id.toString()}
                  className="flex flex-wrap gap-3"
                  onValueChange={(value) => handleStatusChange(project.project_publish_id, parseInt(value))}
                >
                  {statusOptions.map((status) => (
                    <div key={status.id} className="flex items-center space-x-2">
                      <RadioGroupItem 
                        value={status.id.toString()} 
                        id={`status-${project.project_publish_id}-${status.id}`}
                        disabled={saving}
                      />
                      <Label 
                        htmlFor={`status-${project.project_publish_id}-${status.id}`}
                        className={`text-sm flex items-center gap-1.5 px-3 py-1.5 rounded-lg border ${
                          project.status_id === status.id ? status.color : 'bg-gray-50 text-gray-700 border-gray-200'
                        } hover:border-blue-300 cursor-pointer transition-colors`}
                      >
                        {status.icon}
                        {status.label}
                      </Label>
                    </div>
                  ))}
                </RadioGroup>
              </div>
              
              {/* Availability section */}
              <div className="space-y-3 pt-2">
                <Label className="text-sm font-medium text-gray-700 flex items-center gap-2">
                  <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-gray-500">
                    <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
                    <line x1="16" y1="2" x2="16" y2="6"></line>
                    <line x1="8" y1="2" x2="8" y2="6"></line>
                    <line x1="3" y1="10" x2="21" y2="10"></line>
                  </svg>
                  Expert Availability
                </Label>
                
                <div className="flex items-center space-x-3">
                  <Switch
                    id={`availability-${project.project_publish_id}`}
                    checked={project.expert_availability}
                    onCheckedChange={(checked) => handleAvailabilityChange(project.project_publish_id, checked)}
                    disabled={saving}
                  />
                  <Label 
                    htmlFor={`availability-${project.project_publish_id}`}
                    className={`text-sm flex items-center gap-1.5 px-3 py-1.5 rounded-lg ${
                      project.expert_availability 
                        ? 'bg-green-100 text-green-800 border border-green-300' 
                        : 'bg-red-100 text-red-800 border border-red-300'
                    }`}
                  >
                    {project.expert_availability 
                      ? <Check className="h-4 w-4 text-green-600" /> 
                      : <X className="h-4 w-4 text-red-600" />
                    }
                    {project.expert_availability ? 'Available' : 'Unavailable'}
                  </Label>
                </div>
              </div>
              
              <div className="text-xs text-gray-500 mt-2 pt-2 border-t border-gray-100">
                <p>Created: {new Date(project.created_at).toLocaleString()}</p>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}

export default ExpertStatusManager;