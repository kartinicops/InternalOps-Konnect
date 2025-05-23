"use client"

import { useState, useEffect } from "react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import API from "@/services/api"
import ExportExpertsButton from "@/components/export-experts-button"
import { Loader2, Trash2 } from "lucide-react"
import { toast } from "react-hot-toast"

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
  onSelectExpert?: (expertId: number) => void
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
          await fetchExpertAvailabilities(filteredPublished)
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

  // Updated function to fetch expert availabilities directly from API
  const fetchExpertAvailabilities = async (publishedRecords: PublishedData[]) => {
    try {
      // Get all project_publish_ids from the published records
      const projectPublishIds = publishedRecords.map((record) => record.project_publish_id)

      console.log("Project publish IDs for these experts:", projectPublishIds)

      // Fetch all availabilities
      const availabilitiesResponse = await API.get(`/expert_availabilities/`, {
        withCredentials: true,
      })

      console.log("All availabilities:", availabilitiesResponse.data)

      // Filter availabilities based on project_publish_ids
      const filteredAvailabilities = availabilitiesResponse.data.filter((availability: ExpertAvailability) =>
        projectPublishIds.includes(availability.project_publish_id),
      )

      console.log("Filtered availabilities for published table:", filteredAvailabilities)
      setExpertAvailabilities(filteredAvailabilities)
    } catch (error) {
      console.error("Error fetching expert availabilities:", error)
    }
  }

  // Get the expert's availability directly from the API data
  const getExpertAvailability = (expertId: number): string => {
    try {
      // Find the published record for this expert to get project_publish_id
      const publishedRecord = publishedData.find((record) => record.expert_id === expertId)
      if (!publishedRecord) return "-"

      const projectPublishId = publishedRecord.project_publish_id

      // Find all availabilities for this project_publish_id
      const expertAvails = expertAvailabilities.filter((avail) => avail.project_publish_id === projectPublishId)

      if (expertAvails.length === 0) return "-"

      // Filter for future availabilities
      const now = new Date()
      const futureAvails = expertAvails.filter((avail) => {
        try {
          const availDate = new Date(avail.available_time)
          return !isNaN(availDate.getTime()) && availDate > now
        } catch (error) {
          console.error("Error parsing date:", avail.available_time)
          return false
        }
      })

      if (futureAvails.length === 0) return "-"

      // Sort by date (nearest first)
      const sortedAvails = [...futureAvails].sort((a, b) => {
        const dateA = new Date(a.available_time)
        const dateB = new Date(b.available_time)
        return dateA.getTime() - dateB.getTime()
      })

      // Get the nearest availability
      const nearestAvail = sortedAvails[0]

      // Format the date nicely
      try {
        const availDate = new Date(nearestAvail.available_time)

        if (!isNaN(availDate.getTime())) {
          const dayOfWeek = availDate.toLocaleDateString("en-US", { weekday: "long" })
          const day = availDate.getDate()
          const month = availDate.toLocaleDateString("en-US", { month: "long" })
          const year = availDate.getFullYear()
          const hour = availDate.getHours() % 12 || 12
          const minute = availDate.getMinutes().toString().padStart(2, "0")
          const ampm = availDate.getHours() >= 12 ? "PM" : "AM"

          return `${dayOfWeek}, ${day} ${month} ${year} at ${hour}:${minute} ${ampm}`
        }

        // If date parsing fails, return the raw value
        return nearestAvail.available_time
      } catch (error) {
        console.error("Error formatting date:", error)
        return nearestAvail.available_time
      }
    } catch (error) {
      console.error("Error getting expert availability:", error)
      return "-"
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

  const getAddedAt = (expertId: number): string => {
    const publishedEntry = publishedData.find((item) => item.expert_id === expertId)
    return publishedEntry ? publishedEntry.created_at : ""
  }

  const handleRowClick = (expertId: number) => {
    if (onSelectExpert) {
      onSelectExpert(expertId)
    }
  }

  const handleRemoveFromPublished = async (expertId: number) => {
    try {
      const publishedEntry = publishedData.find(
        (item) => item.expert_id === expertId && item.project_id === parseInt(project_id)
      );
  
      if (!publishedEntry) throw new Error("Expert not found in published.");
  
      await API.delete(`/project_published/${publishedEntry.project_publish_id}/`, {
        withCredentials: true,
      });
  
      // Update local state to remove the expert
      setPublishedExperts((prevExperts) => prevExperts.filter((expert) => expert.expert_id !== expertId));
      toast.success("Expert removed from published!");
    } catch (error) {
      console.error("Error removing expert from published:", error);
      toast.error("Failed to remove expert from published.");
    }
  };

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
              {/* column delete */}
              <TableHead>Delete</TableHead>
              

            </TableRow>
          </TableHeader>
          <TableBody>
            {publishedExperts.length > 0 ? (
              publishedExperts.map((expert) => {
                const status = getStatus(expert.expert_id)
                const availability = getExpertAvailability(expert.expert_id)

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
                    {/* Show only the closest availability with styling */}
                    <TableCell onClick={() => handleRowClick(expert.expert_id)}>
                      <div
                        className={
                          availability !== "-" ? "text-sm bg-green-50 text-green-800 px-2 py-1 rounded-md" : ""
                        }
                      >
                        {availability}
                      </div>
                    </TableCell>

                    <TableCell>
                      <Trash2
                        className="cursor-pointer text-red-500 hover:text-red-700"
                        onClick={async (e) => {
                          e.stopPropagation(); // Prevent row selection
                          // Handle deleting expert from published
                          await handleRemoveFromPublished(expert.expert_id);
                        }}
                      />
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