"use client"

import { useState, useEffect } from "react"
import { Calendar, Plus, X, Loader2, Clock, Briefcase } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { toast } from "react-toastify"
import API from "@/services/api"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { cn } from "@/lib/page"
import { format, addHours, parseISO, isValid } from "date-fns"
import { Calendar as CalendarComponent } from "@/components/ui/calendar"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

interface ExpertAvailability {
  expert_availability_id: number
  expert_id: number
  project_publish_id: number | null
  available_time: string
}

interface EditAvailabilitySectionProps {
  expertId: string | null
  projectId: string | null
}

export default function EditAvailabilitySection({ expertId, projectId }: EditAvailabilitySectionProps) {
  const [availabilities, setAvailabilities] = useState<ExpertAvailability[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [isAdding, setIsAdding] = useState(false)
  const [projectPublishId, setProjectPublishId] = useState<number | null>(null)
  const [editingAvailability, setEditingAvailability] = useState<ExpertAvailability | null>(null)

  // Date picker state
  const [date, setDate] = useState<Date | undefined>(addHours(new Date(), 24))
  const [hour, setHour] = useState("14")
  const [minute, setMinute] = useState("30")

  useEffect(() => {
    const fetchAvailabilities = async () => {
      if (!expertId) return

      setLoading(true)
      try {
        // First, get project_publish_id for this expert
        let currentProjectPublishId = null

        try {
          console.log("Fetching project_publish_id for expert:", expertId, "project:", projectId)
          const publishedResponse = await API.get(`/project_published/`, {
            withCredentials: true,
          })

          // Filter to get data matching the expert_id
          const expertPublishedData = publishedResponse.data.filter((item: any) => item.expert_id === Number(expertId))

          // If projectId exists, filter again by project_id
          if (projectId) {
            const publishRecord = expertPublishedData.find((item: any) => item.project_id === Number(projectId))

            if (publishRecord) {
              currentProjectPublishId = publishRecord.project_publish_id
              setProjectPublishId(publishRecord.project_publish_id)
              console.log("Found project_publish_id:", publishRecord.project_publish_id)
            } else {
              console.log("No matching project_publish record found for expert:", expertId, "project:", projectId)
            }
          } else if (expertPublishedData.length > 0) {
            // If no projectId, use the first project_publish_id
            currentProjectPublishId = expertPublishedData[0].project_publish_id
            setProjectPublishId(expertPublishedData[0].project_publish_id)
            console.log("Using first project_publish_id:", currentProjectPublishId)
          }
        } catch (error) {
          console.error("Error fetching project_publish_id:", error)
        }

        // Then fetch availabilities based on project_publish_id
        if (currentProjectPublishId) {
          try {
            console.log("Fetching availabilities for project_publish_id:", currentProjectPublishId)
            const response = await API.get(`/expert_availabilities/`, {
              withCredentials: true,
            })

            // Filter availabilities based on project_publish_id
            const expertAvailabilities = response.data.filter(
              (avail: ExpertAvailability) => avail.project_publish_id === currentProjectPublishId,
            )

            console.log("Filtered availabilities:", expertAvailabilities)
            setAvailabilities(expertAvailabilities)
          } catch (error) {
            console.error("Error fetching expert availabilities:", error)
            toast.error("Failed to load availability data")
          }
        } else {
          console.log("No project_publish_id found, cannot fetch availabilities")
          setAvailabilities([])
        }
      } finally {
        setLoading(false)
      }
    }

    fetchAvailabilities()
  }, [expertId, projectId])

  // Format date to API expected format: "YYYY-MM-DD HH:MM:SS"
  const formatDateForAPI = (date: Date | undefined, hour: string, minute: string): string => {
    if (!date) return ""

    const formattedDate = format(date, "yyyy-MM-dd")
    return `${formattedDate} ${hour}:${minute}:00`
  }

  // Parse API date to Date object for editing
  const parseAPIDate = (apiDateString: string): { date: Date | undefined; hour: string; minute: string } => {
    try {
      // Handle different date formats
      let parsedDate: Date

      // Try parseISO for standard format
      parsedDate = parseISO(apiDateString)

      // If invalid, try with 'T' replacement
      if (!isValid(parsedDate)) {
        const cleanedDateString = apiDateString.replace(" ", "T")
        parsedDate = parseISO(cleanedDateString)
      }

      // If still invalid, try direct Date constructor
      if (!isValid(parsedDate)) {
        parsedDate = new Date(apiDateString)
      }

      if (!isValid(parsedDate)) {
        console.error("Could not parse date:", apiDateString)
        return { date: undefined, hour: "12", minute: "00" }
      }

      const hourStr = format(parsedDate, "HH")
      const minuteStr = format(parsedDate, "mm")

      return {
        date: parsedDate,
        hour: hourStr,
        minute: minuteStr,
      }
    } catch (error) {
      console.error("Error parsing date:", error)
      return { date: undefined, hour: "12", minute: "00" }
    }
  }

  // Format API date to display format: "Saturday, 31 May 2025 at 2:30 PM (Jakarta time)"
  const formatAPIDateForDisplay = (apiDateString: string): string => {
    try {
      // Check if the apiDateString is valid
      if (!apiDateString || typeof apiDateString !== "string") {
        console.warn("Invalid API date string:", apiDateString)
        return apiDateString || "Invalid date"
      }

      // If already in the expected format, return it as is
      if (apiDateString.includes("at") && (apiDateString.includes("AM") || apiDateString.includes("PM"))) {
        return apiDateString
      }

      // Try to parse the date
      const date = new Date(apiDateString)

      // Check if date is valid
      if (isNaN(date.getTime())) {
        console.error("Invalid date:", apiDateString)
        return apiDateString
      }

      // Format to display format
      const dayOfWeek = date.toLocaleDateString("en-US", { weekday: "long" })
      const dayOfMonth = date.getDate()
      const month = date.toLocaleDateString("en-US", { month: "long" })
      const year = date.getFullYear()

      // Format time in 12-hour format
      const hour12 = date.getHours() % 12 || 12
      const minute = date.getMinutes().toString().padStart(2, "0")
      const ampm = date.getHours() >= 12 ? "PM" : "AM"

      return `${dayOfWeek}, ${dayOfMonth} ${month} ${year} at ${hour12}:${minute} ${ampm} (Jakarta time)`
    } catch (error) {
      console.error("Error formatting date:", error, "Original string:", apiDateString)
      return apiDateString // Return original if parsing fails
    }
  }

  const handleAddAvailability = async () => {
    if (!date) {
      toast.warning("Please select a date")
      return
    }

    if (projectPublishId === null) {
      toast.error("No project publish ID found. Cannot add availability.")
      return
    }

    setSaving(true)
    try {
      // Format the date and time to the API expected format
      const formattedDateTime = formatDateForAPI(date, hour, minute)

      // Construct the payload
      const payload = {
        project_publish_id: projectPublishId,
        available_time: formattedDateTime,
      }

      console.log("Sending payload:", payload)

      const response = await API.post("/expert_availabilities/", payload, {
        withCredentials: true,
      })

      console.log("Availability added, response:", response.data)

      // Add the new availability to the state with the correct format
      const newAvailability = {
        ...response.data,
        available_time: formattedDateTime,
      }

      setAvailabilities([...availabilities, newAvailability])

      setDate(addHours(new Date(), 24)) // Reset to tomorrow
      setHour("14") // Reset hour
      setMinute("30") // Reset minute
      setIsAdding(false)
      toast.success("Availability added successfully")
    } catch (error: any) {
      console.error("Error adding availability:", error)

      // More detailed error handling
      if (error.response) {
        let errorMessage = "Failed to add availability"

        if (error.response.data) {
          if (typeof error.response.data === "string") {
            errorMessage = error.response.data
          } else if (error.response.data.message) {
            errorMessage = error.response.data.message
          } else if (error.response.data.detail) {
            errorMessage = error.response.data.detail
          }
        }

        toast.error(`Error: ${errorMessage}`)
      } else if (error.request) {
        toast.error("No response from server. Please check your connection.")
      } else {
        toast.error("Failed to add availability")
      }
    } finally {
      setSaving(false)
    }
  }

  const handleDeleteAvailability = async (availabilityId: number) => {
    try {
      await API.delete(`/expert_availabilities/${availabilityId}/`, {
        withCredentials: true,
      })

      setAvailabilities(availabilities.filter((avail) => avail.expert_availability_id !== availabilityId))
      toast.success("Availability removed successfully")
    } catch (error) {
      console.error("Error deleting availability:", error)
      toast.error("Failed to remove availability")
    }
  }

  const handleEditAvailability = (availability: ExpertAvailability) => {
    const { date: parsedDate, hour: parsedHour, minute: parsedMinute } = parseAPIDate(availability.available_time)

    setDate(parsedDate)
    setHour(parsedHour)
    setMinute(parsedMinute)
    setEditingAvailability(availability)
    setIsAdding(true)
  }

  const handleUpdateAvailability = async () => {
    if (!date || !editingAvailability) {
      toast.warning("Please select a date")
      return
    }

    setSaving(true)
    try {
      const formattedDateTime = formatDateForAPI(date, hour, minute)

      const payload = {
        project_publish_id: editingAvailability.project_publish_id,
        available_time: formattedDateTime,
      }

      const response = await API.put(`/expert_availabilities/${editingAvailability.expert_availability_id}/`, payload, {
        withCredentials: true,
      })

      // Update the availability in state
      setAvailabilities(
        availabilities.map((avail) =>
          avail.expert_availability_id === editingAvailability.expert_availability_id
            ? { ...avail, available_time: formattedDateTime }
            : avail,
        ),
      )

      setEditingAvailability(null)
      setIsAdding(false)
      toast.success("Availability updated successfully")
    } catch (error: any) {
      console.error("Error updating availability:", error)

      if (error.response) {
        let errorMessage = "Failed to update availability"

        if (error.response.data) {
          if (typeof error.response.data === "string") {
            errorMessage = error.response.data
          } else if (error.response.data.message) {
            errorMessage = error.response.data.message
          } else if (error.response.data.detail) {
            errorMessage = error.response.data.detail
          }
        }

        toast.error(`Error: ${errorMessage}`)
      } else if (error.request) {
        toast.error("No response from server. Please check your connection.")
      } else {
        toast.error("Failed to update availability")
      }
    } finally {
      setSaving(false)
    }
  }

  // Generate hour options (24-hour format)
  const hourOptions = Array.from({ length: 24 }).map((_, i) => {
    const hourValue = i.toString().padStart(2, "0")
    return { value: hourValue, label: hourValue }
  })

  // Generate minute options (00, 15, 30, 45)
  const minuteOptions = ["00", "15", "30", "45"].map((min) => ({ value: min, label: min }))

  return (
    <Card className="shadow-sm border border-gray-100 overflow-hidden rounded-xl bg-gradient-to-br from-white to-blue-50">
        <CardHeader className="bg-white border-b border-gray-100 py-4 px-6 group-hover:bg-blue-50/50 transition-colors">
            <CardTitle className="text-lg font-semibold text-gray-800 flex items-center justify-between">
          <div className="flex items-center">
            <div className="w-1 h-5 bg-blue-600 mr-3 rounded-full"></div>
            <Calendar className="h-4 w-4 mr-2 text-blue-600" />
            <Briefcase className="h-4 w-4 mr-2 text-blue-600 group-hover:text-blue-500 transition-colors" />

            Expert Availability
          </div>
          {!isAdding && (
            <Button
            type="button"
            onClick={() => {
              setIsAdding(true)
              setEditingAvailability(null)
              setDate(addHours(new Date(), 24))
              setHour("14")
              setMinute("30")
            }}
            className="bg-blue-600 hover:bg-blue-700 text-white flex items-center gap-1 py-1 h-8 px-3 text-xs rounded-lg z-20 relative"
            >
            <Plus className="h-3.5 w-3.5" />
            Add Availability
          </Button>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent className="p-6 relative">
        {/* Background decorative elements */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-blue-100 rounded-full opacity-20 -mr-20 -mt-20"></div>
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-blue-200 rounded-full opacity-10 -ml-16 -mb-16"></div>

        <div className="relative z-10 space-y-4">
          {loading ? (
            <div className="flex justify-center items-center py-8">
              <Loader2 className="h-8 w-8 text-blue-600 animate-spin" />
              <span className="ml-2 text-gray-600">Loading availabilities...</span>
            </div>
          ) : projectPublishId === null && projectId !== null ? (
            <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-200 text-center">
              <p className="text-yellow-700">
                No project publish record found for this expert and project. Availability cannot be added.
              </p>
            </div>
          ) : (
            <>
              {isAdding && (
                <div className="bg-white border border-blue-200 rounded-lg p-4 shadow-sm">
                  <h3 className="text-sm font-medium text-blue-600 mb-3">
                    {editingAvailability ? "Edit Availability" : "Add New Availability"}
                  </h3>
                  <div className="space-y-3">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {/* Date Picker */}
                      <div className="space-y-2">
                        <Label htmlFor="date" className="text-sm font-medium text-gray-700 flex items-center gap-2">
                          <Calendar className="h-3.5 w-3.5 text-gray-500" /> Date
                        </Label>
                        <Popover>
                          <PopoverTrigger asChild>
                            <Button
                              variant="outline"
                              className={cn(
                                "w-full justify-start text-left font-normal bg-white h-10 rounded-lg pl-3 text-sm focus:ring-blue-200 shadow-sm hover:shadow-md transition-shadow",
                                !date && "text-muted-foreground",
                              )}
                            >
                              <Calendar className="mr-2 h-4 w-4 text-gray-400" />
                              {date ? format(date, "PPP") : <span>Pick a date</span>}
                            </Button>
                          </PopoverTrigger>
                          <PopoverContent className="w-auto p-0" align="start">
                            
                            
                            <CalendarComponent
                              mode="single"
                              selected={date}
                              onSelect={setDate}
                              initialFocus
                              disabled={(date) => {
                                // Allow editing past dates if we're editing an existing availability
                                if (editingAvailability) return false
                                // Otherwise only allow future dates for new availabilities
                                return date < new Date()
                              }}
                            />
                          </PopoverContent>
                        </Popover>
                      </div>

                      {/* Time Picker */}
                      <div className="space-y-2">
                        <Label htmlFor="time" className="text-sm font-medium text-gray-700 flex items-center gap-2">
                          <Clock className="h-3.5 w-3.5 text-gray-500" /> Time
                        </Label>
                        <div className="flex space-x-2">
                          <Select value={hour} onValueChange={setHour}>
                            <SelectTrigger className="w-full bg-white h-10 rounded-lg pl-3 text-sm focus:ring-blue-200 shadow-sm hover:shadow-md transition-shadow">
                              <SelectValue placeholder="Hour" />
                            </SelectTrigger>
                            <SelectContent>
                              {hourOptions.map((option) => (
                                <SelectItem key={option.value} value={option.value}>
                                  {option.label}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <span className="flex items-center text-gray-500">:</span>
                          <Select value={minute} onValueChange={setMinute}>
                            <SelectTrigger className="w-full bg-white h-10 rounded-lg pl-3 text-sm focus:ring-blue-200 shadow-sm hover:shadow-md transition-shadow">
                              <SelectValue placeholder="Minute" />
                            </SelectTrigger>
                            <SelectContent>
                              {minuteOptions.map((option) => (
                                <SelectItem key={option.value} value={option.value}>
                                  {option.label}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                    </div>

                    <div className="flex justify-end gap-2">
                    <Button
                            type="button"
                            variant="outline"
                            onClick={() => {
                              setIsAdding(false)
                              setEditingAvailability(null)
                            }}
                            className="text-sm h-8 px-4 rounded-full border-2 border-gray-300 hover:border-gray-400 hover:bg-gray-50 transition-all duration-200"
                          >
                            Cancel
                          </Button>
                          <Button
                            type="button"
                            onClick={editingAvailability ? handleUpdateAvailability : handleAddAvailability}
                            disabled={saving}
                            className="text-sm h-8 px-4 rounded-full bg-gradient-to-r from-blue-400 to-blue-500 hover:from-blue-500 hover:to-blue-600 text-white shadow-md hover:shadow-lg transition-all duration-200"
                          >
                            {saving ? (
                              <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                {editingAvailability ? "Updating..." : "Saving..."}
                              </>
                            ) : editingAvailability ? (
                              "Update Availability"
                            ) : (
                              "Add Availability"
                            )}
                          </Button>
                    </div>
                  </div>
                </div>
              )}

              {availabilities.length > 0 ? (
                <div className="space-y-3">
                  {availabilities.map((avail) => (
                    <div
                      key={avail.expert_availability_id}
                      className="flex justify-between items-center bg-white p-3 rounded-lg border border-gray-200 hover:border-blue-300 transition-colors"
                    >
                      <div className="flex items-center">
                        <Calendar className="h-4 w-4 text-blue-500 mr-2" />
                        <span className="text-gray-800">{formatAPIDateForDisplay(avail.available_time)}</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Button
                          type="button"
                          variant="ghost"
                          onClick={() => handleEditAvailability(avail)}
                          className="text-blue-500 hover:text-blue-700 hover:bg-blue-50 h-8 w-8 p-0 rounded-full"
                        >
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            width="16"
                            height="16"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            className="h-4 w-4"
                          >
                            <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                            <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
                          </svg>
                        </Button>
                        <Button
                          type="button"
                          variant="ghost"
                          onClick={() => handleDeleteAvailability(avail.expert_availability_id)}
                          className="text-gray-400 hover:text-red-500 hover:bg-red-50 h-8 w-8 p-0 rounded-full"
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="bg-gray-50 p-6 rounded-lg border text-center">
                  <Calendar className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                  <p className="text-gray-500 font-medium">No availabilities added yet</p>
                  {!isAdding && projectPublishId !== null && (
                          <Button
                            type="button"
                            onClick={editingAvailability ? handleUpdateAvailability : handleAddAvailability}
                            disabled={saving}
                            className="text-sm h-10 px-6 rounded-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white shadow-md hover:shadow-lg transition-all duration-200"
                          >
                            {saving ? (
                              <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                {editingAvailability ? "Updating..." : "Saving..."}
                              </>
                            ) : editingAvailability ? (
                              "Update Availability"
                            ) : (
                              "Add Availability"
                            )}
                          </Button>
                  )}
                </div>
              )}
            </>
          )}
        </div>
      </CardContent>
    </Card>
  )
}