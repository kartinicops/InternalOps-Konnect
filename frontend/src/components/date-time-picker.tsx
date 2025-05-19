"use client"

import { useState } from "react"
import { CalendarIcon } from 'lucide-react'
import { format, parse } from "date-fns"
import { Calendar } from "@/components/ui/calendar"
import { Button } from "@/components/ui/button"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { cn } from "@/lib/page"

interface DateTimePickerProps {
  value: string
  onChange: (value: string) => void // Changed: only one value needed now
  className?: string
}

export function DateTimePicker({ value, onChange, className }: DateTimePickerProps) {
  // Parse the existing value if it exists
  const parseInitialDate = () => {
    if (!value) return new Date()

    try {
      // Try to parse the date from the format: "Saturday, 31 May 2025 at 8 PM (Jakarta time)"
      if (value.includes("at") && value.includes("Jakarta time")) {
       return parse(value.replace(" (Jakarta time)", ""), "EEEE, d MMMM yyyy 'at' h:mm a", new Date())
      }

      // If it's an ISO format, parse it directly
      return new Date(value)
    } catch (error) {
      console.error("Error parsing date:", error)
      return new Date()
    }
  }
  
  const [date, setDate] = useState<Date | undefined>(parseInitialDate())
  const [time, setTime] = useState<string>(date ? format(date, "h").toString() : "1")
  const [period, setPeriod] = useState<string>(date ? format(date, "a").toUpperCase() : "AM")

  // Time options (1-12)
  const timeOptions = Array.from({ length: 12 }, (_, i) => (i + 1).toString())

  const handleDateChange = (newDate: Date | undefined) => {
    if (!newDate) return

    setDate(newDate)
    updateDateTime(newDate, time, period)
  }

  const handleTimeChange = (newTime: string) => {
    setTime(newTime)
    if (date) {
      updateDateTime(date, newTime, period)
    }
  }

  const handlePeriodChange = (newPeriod: string) => {
    setPeriod(newPeriod)
    if (date) {
      updateDateTime(date, time, newPeriod)
    }
  }

  const updateDateTime = (date: Date, hour: string, period: string) => {
    // Create a new date with the selected time
    const newDate = new Date(date)

    // Set hours based on 12-hour format and AM/PM
    let hours = Number.parseInt(hour, 10)
    if (period === "PM" && hours !== 12) {
      hours += 12
    } else if (period === "AM" && hours === 12) {
      hours = 0
    }
    
    newDate.setHours(hours, 0, 0, 0)

    // Format the date exactly as the backend expects: "Saturday, 31 May 2025 at 8 PM (Jakarta time)"
    // Using date-fns format that matches the backend format
    const backendFormattedDate = format(newDate, "EEEE, d MMMM yyyy 'at' h a") + " (Jakarta time)"

    // Pass the formatted date to the parent component
    onChange(backendFormattedDate)
  }

  // Display the current value or placeholder
  const displayValue = value || ""

  return (
    <div className={cn("grid gap-2", className)}>
      <Popover>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            className={cn("w-full justify-start text-left font-normal", !displayValue && "text-muted-foreground")}
          >
            <CalendarIcon className="mr-2 h-4 w-4" />
            {displayValue || "Select date and time"}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="start">
          <Calendar mode="single" selected={date} onSelect={handleDateChange} initialFocus />
          <div className="p-3 border-t border-border flex gap-2">
            <Select value={time} onValueChange={handleTimeChange}>
              <SelectTrigger className="w-[110px]">
                <SelectValue placeholder="Hour" />
              </SelectTrigger>
              <SelectContent>
                {timeOptions.map((hour) => (
                  <SelectItem key={hour} value={hour}>
                    {hour}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={period} onValueChange={handlePeriodChange}>
              <SelectTrigger className="w-[110px]">
                <SelectValue placeholder="AM/PM" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="AM">AM</SelectItem>
                <SelectItem value="PM">PM</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </PopoverContent>
      </Popover>
    </div>
  )
}