"use client"

import { useState } from "react"
import { Calendar, Plus, Trash2, AlertCircle } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { DateTimePicker } from "@/components/date-time-picker"
import { Badge } from "@/components/ui/badge"
import { toast } from "react-toastify"

interface ExpertAvailability {
  expert_availability_id?: number
  project_publish_id: number
  available_time: string // This will now store the formatted string for the backend
  isNew?: boolean
  isDeleted?: boolean
}

interface ExpertAvailabilitySectionProps {
  projectPublishId: number
  initialAvailabilities: ExpertAvailability[]
  onAvailabilitiesChange: (availabilities: ExpertAvailability[]) => void
}

export function ExpertAvailabilitySection({
  projectPublishId,
  initialAvailabilities,
  onAvailabilitiesChange,
}: ExpertAvailabilitySectionProps) {
  const [availabilities, setAvailabilities] = useState<ExpertAvailability[]>(
    initialAvailabilities.length > 0 ? initialAvailabilities : [],
  )

  const addAvailability = () => {
    if (!projectPublishId) {
      console.error("Cannot add availability: No project publish ID provided")
      toast.error("Cannot add availability: Missing project information")
      return
    }

    const newAvailability: ExpertAvailability = {
      project_publish_id: projectPublishId,
      available_time: "",
      isNew: true,
    }

    const updatedAvailabilities = [...availabilities, newAvailability]
    setAvailabilities(updatedAvailabilities)
    onAvailabilitiesChange(updatedAvailabilities)
  }

  const updateAvailability = (index: number, formattedValue: string) => {
    console.log(`Updating availability at index ${index}:`, { formattedValue })

    const updatedAvailabilities = [...availabilities]
    updatedAvailabilities[index] = {
      ...updatedAvailabilities[index],
      available_time: formattedValue, // Store the formatted string for the backend
    }

    setAvailabilities(updatedAvailabilities)
    onAvailabilitiesChange(updatedAvailabilities)
  }

  const removeAvailability = (index: number) => {
    const updatedAvailabilities = [...availabilities]

    // If it has an ID, mark it for deletion instead of removing from the array
    if (updatedAvailabilities[index].expert_availability_id) {
      updatedAvailabilities[index] = {
        ...updatedAvailabilities[index],
        isDeleted: true,
      }
    } else {
      // If it's a new entry, just remove it
      updatedAvailabilities.splice(index, 1)
    }

    setAvailabilities(updatedAvailabilities)
    onAvailabilitiesChange(updatedAvailabilities)
  }

  return (
    <Card className="shadow-sm border border-gray-100 overflow-hidden rounded-xl bg-gradient-to-br from-white to-blue-50">
      <CardHeader className="bg-white border-b border-gray-100 py-4 px-6">
        <CardTitle className="text-lg font-semibold text-gray-800 flex items-center justify-between">
          <div className="flex items-center">
            <div className="w-1 h-5 bg-blue-600 mr-3 rounded-full"></div>
            <Calendar className="h-4 w-4 mr-2 text-blue-600" />
            Expert Availability
          </div>
          <Button
            type="button"
            onClick={addAvailability}
            className="bg-blue-600 hover:bg-blue-700 text-white flex items-center gap-1 py-1 h-8 px-3 text-xs rounded-lg relative z-30"
            disabled={!projectPublishId}
          >
            <Plus className="h-3.5 w-3.5" />
            Add Time Slot
          </Button>
        </CardTitle>
      </CardHeader>
      <CardContent className="p-6 relative">
        {/* Background decorative elements */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-blue-100 rounded-full opacity-20 -mr-20 -mt-20"></div>
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-blue-200 rounded-full opacity-10 -ml-16 -mb-16"></div>

        <div className="relative z-10 space-y-4">
          <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 mb-4 flex items-start gap-2">
            <AlertCircle className="h-5 w-5 text-amber-500 flex-shrink-0 mt-0.5" />
            <div className="text-sm text-amber-800">
              <p className="font-medium">Important Note</p>
              <p>
                Times are stored and sent to the backend in the format: "Day, Date Month Year at Time (Jakarta time)"
                (e.g., "Saturday, 31 May 2025 at 8 PM (Jakarta time)")
              </p>
            </div>
          </div>

          {availabilities.filter((a) => !a.isDeleted).length === 0 ? (
            <div className="text-center py-6 bg-white/80 backdrop-blur-sm rounded-lg border border-dashed border-gray-300">
              <Calendar className="h-10 w-10 text-gray-300 mx-auto mb-2" />
              <p className="text-gray-500">No availability times added yet</p>
              <p className="text-xs text-gray-400 mt-1">Add time slots when the expert is available for meetings</p>
            </div>
          ) : (
            availabilities
              .filter((availability) => !availability.isDeleted)
              .map((availability, index) => (
                <div
                  key={availability.expert_availability_id || `new-${index}`}
                  className="bg-white/80 backdrop-blur-sm rounded-lg p-4 border border-gray-200 flex items-center justify-between"
                >
                  <div className="flex items-center gap-3 flex-1">
                    <Calendar className="h-5 w-5 text-blue-500 flex-shrink-0" />
                    <div className="flex-1">
                      <DateTimePicker
                        value={availability.available_time}
                        onChange={(formattedValue) => updateAvailability(index, formattedValue)}
                      />
                    </div>
                    {availability.isNew && (
                      <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                        New
                      </Badge>
                    )}
                  </div>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => removeAvailability(index)}
                    className="text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-full h-8 w-8 p-0"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              ))
          )}
        </div>
      </CardContent>
    </Card>
  )
}