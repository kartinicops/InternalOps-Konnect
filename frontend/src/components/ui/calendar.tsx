'use client'

import React, { useState } from "react"
import { DayPicker } from "react-day-picker"
import { ChevronLeft, ChevronRight } from "lucide-react"
import "react-day-picker/dist/style.css" // Import DayPicker styles

export function Calendar() {
  const [month, setMonth] = useState(new Date())

  const handlePrevMonth = () => {
    setMonth(new Date(month.getFullYear(), month.getMonth() - 1))
  }

  const handleNextMonth = () => {
    setMonth(new Date(month.getFullYear(), month.getMonth() + 1))
  }

  return (
    <div className="relative p-6 border rounded-lg shadow-md bg-gradient-to-b from-white to-gray-100 max-w-md mx-auto">
      {/* Header Navigation */}
      <div className="flex items-center justify-between mb-4">
        <button
          onClick={handlePrevMonth}
          className="h-10 w-10 flex items-center justify-center rounded-full bg-gray-200 hover:bg-gray-300 transition-all"
        >
          <ChevronLeft className="h-5 w-5 text-gray-600" />
        </button>
        <h2 className="text-xl font-semibold text-gray-800">
          {month.toLocaleString("default", { month: "long", year: "numeric" })}
        </h2>
        <button
          onClick={handleNextMonth}
          className="h-10 w-10 flex items-center justify-center rounded-full bg-gray-200 hover:bg-gray-300 transition-all"
        >
          <ChevronRight className="h-5 w-5 text-gray-600" />
        </button>
      </div>

      {/* DayPicker */}
      <DayPicker
        month={month}
        onMonthChange={setMonth}
        showOutsideDays={true}
        className="p-3"
        classNames={{
          months: "flex flex-col space-y-4",
          month: "space-y-2",
          table: "w-full border-collapse text-center",
          head_row: "grid grid-cols-7 text-gray-700",
          head_cell:
            "text-sm font-semibold uppercase tracking-wider pb-2 text-gray-600",
          row: "grid grid-cols-7 gap-1",
          cell: "text-center relative w-full aspect-square",
          day: "h-full w-full text-sm rounded-lg hover:bg-blue-100 hover:shadow-md focus:outline-none focus:ring-2 focus:ring-blue-400 transition-all",
          day_selected:
            "bg-blue-500 text-white font-bold shadow-lg hover:bg-blue-600",
          day_today:
            "bg-blue-100 text-blue-900 font-semibold border border-blue-400",
          day_outside: "text-gray-400 opacity-50",
          day_disabled: "text-gray-400 opacity-30",
          day_circularHighlight:
            "bg-yellow-400 text-white rounded-full shadow-md", // Custom class for circular highlight
        }}
        modifiers={{
          selected: new Date(),
          specialDays: [
            new Date(2019, 1, 8),
            new Date(2019, 1, 17),
            new Date(2019, 1, 25),
          ],
        }}
      />
    </div>
  )
}