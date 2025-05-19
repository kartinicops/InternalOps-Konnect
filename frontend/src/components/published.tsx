"use client"

import { useState, useEffect } from "react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import API from "@/services/api"
import ExportExpertsButton from "@/components/export-experts-button"
import { Loader2 } from 'lucide-react'

interface Expert {
  expert_id: number
  full_name: string
  industry: string
  email: string
  country_of_residence: string
  created_at: string
  status_id: number
}

interface PublishedData {
  project_publish_id: number
  expert_id: number
  project_id: number
  user_id: number
  status_id: number
  expert_availability: string | null
  angles: string
  created_at: string
}

interface ExpertAvailability {
  expert_availability_id: number
  expert_id: number
  project_publish_id: number
  available_time: string
}

interface PublishedProps {
  project_id: string
  onSelectExpert: (expertId: number) => void
}

const Published = ({ project_id, onSelectExpert }: PublishedProps) => {
  const [publishedExperts, setPublishedExperts] = useState<Expert[]>([])
  const [publishedData, setPublishedData] = useState<PublishedData[]>([])
  const [expertAvailabilities, setExpertAvailabilities] = useState<ExpertAvailability[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [selectedExpertIds, setSelectedExpertIds] = useState<number[]>([])
  const [expertExperiences, setExpertExperiences] = useState<any[]>([])

  useEffect(() => {
    const fetchPublishedExperts = async () => {
      setIsLoading(true)
      setError(null)
      try {
        // Fetch published data specifically for this project
        const response = await API.get(`/project_published/`, {
          params: { project_id },
          withCredentials: true,
        })

        // Filter published data for this specific project
        const filteredPublished = response.data.filter(
          (item: PublishedData) => item.project_id === Number.parseInt(project_id),
        )

        setPublishedData(filteredPublished)

        // Get expert IDs from filtered published data
        const expertIds = filteredPublished.map((item: PublishedData) => item.expert_id)

        if (expertIds.length > 0) {
          // Fetch experts for these specific IDs
          const expertsResponse = await API.get(`/experts/`, {
            params: { expert_ids: expertIds },
            withCredentials: true,
          })

          // Filter experts to match the IDs from published data
          const filteredExperts = expertsResponse.data.filter((expert: Expert) => expertIds.includes(expert.expert_id))

          setPublishedExperts(filteredExperts)

          // Fetch expert experiences for these experts
          await fetchExpertExperiences(expertIds)

          // Fetch expert availabilities for these experts
          await fetchExpertAvailabilities(expertIds)
        } else {
          setPublishedExperts([])
        }
      } catch (error) {
        console.error("Error fetching published experts:", error)
        setError("Failed to fetch published data. Please try again later.")
      } finally {
        setIsLoading(false)
      }
    }

    fetchPublishedExperts()
  }, [project_id])

  // Fetch expert experiences for experts
  const fetchExpertExperiences = async (expertIds: number[]) => {
    try {
      const experiencesResponse = await API.get(`/expert_experiences/`, {
        withCredentials: true,
      })

      // Filter experiences for our experts
      const filteredExperiences = experiencesResponse.data.filter((experience: any) =>
        expertIds.includes(experience.expert_id),
      )

      setExpertExperiences(filteredExperiences)
    } catch (error) {
      console.error("Error fetching expert experiences:", error)
    }
  }

  // Fetch expert availabilities for experts
  const fetchExpertAvailabilities = async (expertIds: number[]) => {
    try {
      // Fetch all availabilities
      const availabilitiesResponse = await API.get(`/expert_availabilities/`, {
        withCredentials: true,
      })

      // Filter availabilities for our experts
      const filteredAvailabilities = availabilitiesResponse.data.filter((availability: ExpertAvailability) =>
        expertIds.includes(availability.expert_id),
      )

      setExpertAvailabilities(filteredAvailabilities)
    } catch (error) {
      console.error("Error fetching expert availabilities:", error)
      // Don't throw the error, just log it and continue
    }
  }

  // Get the latest position for an expert
  const getExpertPosition = (expertId: number): string => {
    // Filter experiences for this expert
    const experiences = expertExperiences.filter((exp) => exp.expert_id === expertId)

    // Sort by start_date to get the most recent one (assuming the format is consistent)
    const sortedExperiences = [...experiences].sort((a, b) => {
      return new Date(b.start_date).getTime() - new Date(a.start_date).getTime()
    })

    // Return the title of the most recent experience or empty string if none found
    return sortedExperiences.length > 0 ? sortedExperiences[0].title : ""
  }

  // Status and availability helpers
  const getStatus = (expertId: number): string => {
    // Find the published entry for this expert
    const publishedEntry = publishedData.find((item) => item.expert_id === expertId)

    // Get status_id from the published entry
    const statusId = publishedEntry?.status_id

    // Return status based on status_id
    switch (statusId) {
      case 1:
        return "Proposed"
      case 2:
        return "Schedule Call"
      case 3:
        return "Rejected"
      default:
        return "Unknown Status"
    }
  }

  const getStatusColor = (status: string): string => {
    switch (status) {
      case "Proposed":
        return "bg-blue-100 text-blue-800"
      case "Schedule Call":
        return "bg-green-100 text-green-800"
      case "Rejected":
        return "bg-red-100 text-red-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const getExpertAvailability = (expertId: number): string[] => {
    try {
      // Find all availabilities for this expert
      const availabilities = expertAvailabilities.filter((avail) => avail.expert_id === expertId)

      if (availabilities.length === 0) {
        return ["-"]
      }

      // Return all available times, formatted without "(Jakarta time)"
      return availabilities.map((avail) => avail.available_time.replace(" (Jakarta time)", ""))
    } catch (error) {
      console.error("Error getting expert availability:", error)
      return ["-"]
    }
  }

  const getAddedAt = (expertId: number): string => {
    const publishedEntry = publishedData.find((item) => item.expert_id === expertId)
    return publishedEntry ? publishedEntry.created_at : ""
  }

  const handleRowClick = (expertId: number) => {
    onSelectExpert(expertId)
  }

  // Toggle expert selection for PDF export
  const toggleExpertSelection = (expertId: number) => {
    setSelectedExpertIds((prev) =>
      prev.includes(expertId) ? prev.filter((id) => id !== expertId) : [...prev, expertId],
    )
  }

  // Select all experts
  const selectAllExperts = () => {
    if (selectedExpertIds.length === publishedExperts.length) {
      setSelectedExpertIds([])
    } else {
      setSelectedExpertIds(publishedExperts.map((expert) => expert.expert_id))
    }
  }

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="h-8 w-8 text-blue-600 animate-spin" />
        <span className="ml-2 text-gray-600">Loading experts...</span>
      </div>
    )
  }

  if (error) {
    return (
      <div className="p-4 bg-red-50 text-red-700 rounded-md">
        <p>{error}</p>
        <Button variant="outline" className="mt-2" onClick={() => window.location.reload()}>
          Retry
        </Button>
      </div>
    )
  }

  return (
    <div className="w-full">
      <div className="flex justify-between mb-4">
        <div className="flex gap-2">
          <Button variant="outline" onClick={selectAllExperts} disabled={publishedExperts.length === 0}>
            {selectedExpertIds.length === publishedExperts.length ? "Deselect All" : "Select All"}
          </Button>

          <ExportExpertsButton expertIds={selectedExpertIds} disabled={selectedExpertIds.length === 0} />
        </div>
      </div>

      <div className="overflow-x-auto rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[50px]">
                <input
                  type="checkbox"
                  checked={selectedExpertIds.length === publishedExperts.length && publishedExperts.length > 0}
                  onChange={selectAllExperts}
                  disabled={publishedExperts.length === 0}
                  className="h-4 w-4 rounded border-gray-300"
                />
              </TableHead>
              <TableHead>Expert</TableHead>
              <TableHead>Position</TableHead>
              <TableHead>Industry</TableHead>
              <TableHead>Contact details</TableHead>
              <TableHead>Location</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Availability</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {publishedExperts.length > 0 ? (
              publishedExperts.map((expert) => {
                const status = getStatus(expert.expert_id)
                const availabilities = getExpertAvailability(expert.expert_id)

                return (
                  <TableRow key={expert.expert_id} className="cursor-pointer hover:bg-gray-50">
                    <TableCell className="w-[50px]">
                      <input
                        type="checkbox"
                        checked={selectedExpertIds.includes(expert.expert_id)}
                        onChange={(e) => {
                          e.stopPropagation()
                          toggleExpertSelection(expert.expert_id)
                        }}
                        className="h-4 w-4 rounded border-gray-300"
                      />
                    </TableCell>
                    <TableCell className="font-medium" onClick={() => handleRowClick(expert.expert_id)}>
                      {expert.full_name}
                    </TableCell>
                    <TableCell onClick={() => handleRowClick(expert.expert_id)}>
                      {getExpertPosition(expert.expert_id)}
                    </TableCell>
                    <TableCell onClick={() => handleRowClick(expert.expert_id)}>{expert.industry}</TableCell>
                    <TableCell onClick={() => handleRowClick(expert.expert_id)}>{expert.email}</TableCell>
                    <TableCell onClick={() => handleRowClick(expert.expert_id)}>
                      {expert.country_of_residence}
                    </TableCell>
                    <TableCell onClick={() => handleRowClick(expert.expert_id)}>
                      <Badge className={getStatusColor(status)}>{status}</Badge>
                    </TableCell>
                    <TableCell onClick={() => handleRowClick(expert.expert_id)}>
                      <div className="space-y-1">
                        {availabilities.map((time, index) => (
                          <div
                            key={index}
                            className={time !== "-" ? "text-sm bg-green-50 text-green-800 px-2 py-1 rounded-md" : ""}
                          >
                            {time}
                          </div>
                        ))}
                      </div>
                    </TableCell>
                  </TableRow>
                )
              })
            ) : (
              <TableRow>
                <TableCell colSpan={9} className="text-center text-gray-500">
                  No experts found for this project.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}

export default Published
