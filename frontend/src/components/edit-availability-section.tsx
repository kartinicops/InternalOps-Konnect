"use client"

import { useState, useEffect } from "react"
import { Calendar, Plus, X, Loader2, Clock } from "lucide-react"
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

  // Date picker state
  const [date, setDate] = useState<Date | undefined>(addHours(new Date(), 24))
  const [hour, setHour] = useState("14")
  const [minute, setMinute] = useState("30")

  useEffect(() => {
    const fetchAvailabilities = async () => {
      if (!expertId) return

      setLoading(true)
      try {
        // First, if we have a projectId, fetch the project_publish_id
        if (projectId) {
          try {
            const publishedResponse = await API.get(`/project_published/`, {
              params: {
                project_id: projectId,
                expert_id: expertId,
              },
              withCredentials: true,
            })

            if (publishedResponse.data && publishedResponse.data.length > 0) {
              // Find the matching record for this expert and project
              const publishRecord = publishedResponse.data.find(
                (item: any) => item.project_id === Number(projectId) && item.expert_id === Number(expertId),
              )

              if (publishRecord) {
                setProjectPublishId(publishRecord.project_publish_id)
                console.log("Found project_publish_id:", publishRecord.project_publish_id)
              }
            }
          } catch (error) {
            console.error("Error fetching project_publish_id:", error)
          }
        }

        // Then fetch availabilities
        const response = await API.get(`/expert_availabilities/?expert_id=${expertId}`, {
          withCredentials: true,
        })

        // Filter availabilities for this expert
        const expertAvailabilities = response.data.filter(
          (avail: ExpertAvailability) => avail.expert_id === Number.parseInt(expertId),
        )

        setAvailabilities(expertAvailabilities)
      } catch (error) {
        console.error("Error fetching expert availabilities:", error)
        toast.error("Failed to load availability data")
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

  // Format API date to display format: "Saturday, 31 May 2025 at 2:30 PM (Jakarta time)"
  const formatAPIDateForDisplay = (apiDateString: string): string => {
    try {
      // Check if the apiDateString is valid
      if (!apiDateString || typeof apiDateString !== 'string') {
        console.warn("Invalid API date string:", apiDateString)
        return apiDateString || "Invalid date"
      }

      // Try different parsing approaches
      let date: Date

      // First, try parseISO (for ISO strings like "2025-05-31T14:30:00Z" or "2025-05-31 14:30:00")
      date = parseISO(apiDateString)

      // If parseISO fails, try treating it as a regular Date constructor input
      if (!isValid(date)) {
        // Handle space-separated format: "YYYY-MM-DD HH:MM:SS"
        const cleanedDateString = apiDateString.replace(' ', 'T')
        date = parseISO(cleanedDateString)
      }

      // If still invalid, try direct Date constructor
      if (!isValid(date)) {
        date = new Date(apiDateString)
      }

      // Final check if date is valid
      if (!isValid(date)) {
        console.error("Could not parse date:", apiDateString)
        return apiDateString // Return original if all parsing attempts fail
      }

      // Format to display format
      const dayOfWeek = format(date, "EEEE")
      const dayOfMonth = format(date, "d")
      const month = format(date, "MMMM")
      const year = format(date, "yyyy")

      // Format time in 12-hour format
      const hour12 = format(date, "h")
      const minute = format(date, "mm")
      const ampm = format(date, "a")

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

      // Construct the payload exactly as shown in the example
      const payload = {
        project_publish_id: projectPublishId,
        available_time: formattedDateTime,
      }

      console.log("Sending payload:", payload)

      const response = await API.post("/expert_availabilities/", payload, {
        withCredentials: true,
      })

      setAvailabilities([...availabilities, response.data])
      setDate(addHours(new Date(), 24)) // Reset to tomorrow
      setHour("14") // Reset hour
      setMinute("30") // Reset minute
      setIsAdding(false)
      toast.success("Availability added successfully")
    } catch (error: any) {
      console.error("Error adding availability:", error)

      // More detailed error handling
      if (error.response) {
        console.log("Error response:", error.response)
        console.log("Error data:", error.response.data)

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

  // Generate hour options (24-hour format)
  const hourOptions = Array.from({ length: 24 }).map((_, i) => {
    const hourValue = i.toString().padStart(2, "0")
    return { value: hourValue, label: hourValue }
  })

  // Generate minute options (00, 15, 30, 45)
  const minuteOptions = ["00", "15", "30", "45"].map((min) => ({ value: min, label: min }))

  return (
    <Card className="shadow-sm border border-gray-100 overflow-hidden rounded-xl bg-gradient-to-br from-white to-blue-50">
      <CardHeader className="bg-white border-b border-gray-100 py-4 px-6">
        <CardTitle className="text-lg font-semibold text-gray-800 flex items-center justify-between">
          <div className="flex items-center">
            <div className="w-1 h-5 bg-blue-600 mr-3 rounded-full"></div>
            <Calendar className="h-4 w-4 mr-2 text-blue-600" />
            Expert Availability
          </div>
          {!isAdding && (
            <Button
              type="button"
              onClick={() => setIsAdding(true)}
              className="bg-blue-600 hover:bg-blue-700 text-white flex items-center gap-1 py-1 h-8 px-3 text-xs rounded-lg"
              disabled={projectPublishId === null}
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
                  <h3 className="text-sm font-medium text-blue-600 mb-3">Add New Availability</h3>
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
                              disabled={(date) => date < new Date()}
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

                    {/* Preview */}
                    <div className="bg-blue-50 p-3 rounded-md">
                      <div className="flex flex-col space-y-1">
                        <p className="text-sm text-blue-800 font-medium">Preview:</p>
                        <div className="flex flex-col">
                          <p className="text-xs text-gray-500">API payload:</p>
                          <pre className="text-sm font-mono bg-white p-1 rounded border border-blue-100 overflow-auto">
                            {JSON.stringify(
                              {
                                project_publish_id: projectPublishId,
                                available_time: formatDateForAPI(date, hour, minute),
                              },
                              null,
                              2,
                            )}
                          </pre>
                        </div>
                        <div className="flex flex-col">
                          <p className="text-xs text-gray-500">Display format (shown to users):</p>
                          <p className="text-sm text-blue-600">
                            {date ? formatAPIDateForDisplay(formatDateForAPI(date, hour, minute)) : ""}
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="flex justify-end gap-2">
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => setIsAdding(false)}
                        className="text-sm h-9"
                      >
                        Cancel
                      </Button>
                      <Button type="button" onClick={handleAddAvailability} disabled={saving} className="text-sm h-9">
                        {saving ? (
                          <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Saving...
                          </>
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
                      <Button
                        type="button"
                        variant="ghost"
                        onClick={() => handleDeleteAvailability(avail.expert_availability_id)}
                        className="text-gray-400 hover:text-red-500 hover:bg-red-50 h-8 w-8 p-0 rounded-full"
                      >
                        <X className="h-4 w-4" />
                      </Button>
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
                      variant="ghost"
                      onClick={() => setIsAdding(true)}
                      className="mt-2 text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                    >
                      <Plus className="h-4 w-4 mr-1" />
                      Add First Availability
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