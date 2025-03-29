// components/ui/calendar.tsx
"use client";

import * as React from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { DayPicker, DropdownProps } from "react-day-picker";
import { format, addMonths, subMonths } from "date-fns";

import "react-day-picker/dist/style.css";

export type CalendarProps = React.ComponentProps<typeof DayPicker>;

export function Calendar({
  className,
  classNames,
  showOutsideDays = true,
  ...props
}: CalendarProps) {
  const [month, setMonth] = React.useState<Date>(props.month || new Date());

  return (
    <div className="p-3">
      <div className="flex items-center justify-between mb-2">
        <button
          onClick={() => setMonth(subMonths(month, 1))}
          className="p-1.5 rounded-full hover:bg-gray-100 text-gray-600"
        >
          <ChevronLeft className="h-4 w-4" />
        </button>
        <h2 className="font-medium text-gray-800">
          {format(month, "MMMM yyyy")}
        </h2>
        <button
          onClick={() => setMonth(addMonths(month, 1))}
          className="p-1.5 rounded-full hover:bg-gray-100 text-gray-600"
        >
          <ChevronRight className="h-4 w-4" />
        </button>
      </div>
      
      <DayPicker
        month={month}
        onMonthChange={setMonth}
        className="p-0"
        classNames={{
          months: "flex flex-col",
          month: "space-y-2",
          caption: "flex justify-center relative items-center",
          caption_label: "hidden", // Custom caption
          nav: "hidden", // Custom nav
          table: "w-full border-collapse",
          head_row: "flex w-full",
          head_cell: "text-xs font-medium text-gray-500 w-9 m-0 p-0 text-center",
          row: "flex w-full mt-1",
          cell: "text-center text-sm relative p-0 m-0",
          day: "h-9 w-9 p-0 flex items-center justify-center rounded-full hover:bg-blue-50 mx-auto",
          day_today: "bg-blue-50 font-medium text-blue-600",
          day_selected: "bg-blue-500 text-white hover:bg-blue-600 font-medium",
          day_disabled: "text-gray-300 hover:bg-transparent",
          day_outside: "text-gray-300 opacity-50",
          day_range_middle: "bg-blue-50",
          day_hidden: "invisible",
          ...classNames,
        }}
        {...props}
      />
    </div>
  );
}