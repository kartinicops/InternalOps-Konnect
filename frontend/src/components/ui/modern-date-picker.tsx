// components/ui/modern-date-picker.tsx
"use client";

import React, { useState, useRef, useEffect } from "react";
import { Calendar, ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { format, addMonths, subMonths } from "date-fns";
import { DayPicker } from "react-day-picker";
import "react-day-picker/dist/style.css";
import { motion, AnimatePresence } from "framer-motion";

interface ModernDatePickerProps {
  date: Date | undefined;
  setDate: (date: Date | undefined) => void;
  label?: string;
  placeholder?: string;
  minDate?: Date;
  maxDate?: Date;
}

export function ModernDatePicker({ 
  date, 
  setDate, 
  label, 
  placeholder = "Select date",
  minDate,
  maxDate
}: ModernDatePickerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [month, setMonth] = useState<Date>(new Date());
  const containerRef = useRef<HTMLDivElement>(null);

  // Close the calendar when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    
    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen]);

  // Handle keyboard navigation
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (!isOpen) return;
      
      if (e.key === "Escape") {
        setIsOpen(false);
      }
    }

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen]);

  const handleNextMonth = () => setMonth(addMonths(month, 1));
  const handlePrevMonth = () => setMonth(subMonths(month, 1));

  const formattedDate = date ? format(date, "EEE, d MMM yyyy") : placeholder;

  return (
    <div className="relative" ref={containerRef}>
      {label && (
        <label className="block text-sm font-medium text-gray-700 mb-1">
          {label}
        </label>
      )}
      
      <Button
        type="button"
        variant="outline"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full justify-between text-left font-normal 
                  border border-gray-300 bg-white hover:bg-gray-50 
                  py-2.5 px-4 rounded-lg shadow-sm transition-all
                  focus:ring-2 focus:ring-blue-500 focus:border-transparent"
      >
        <div className="flex items-center">
          <Calendar className="mr-2 h-4 w-4 text-blue-500" />
          <span className={date ? "text-gray-900" : "text-gray-500"}>
            {formattedDate}
          </span>
        </div>
        <div className="opacity-70">▼</div>
      </Button>
      
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -5 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -5 }}
            transition={{ duration: 0.15 }}
            className="absolute left-0 right-0 mt-1 bg-white rounded-lg shadow-xl 
                      border border-gray-200 z-[1000] overflow-hidden"
          >
            <div className="p-3">
              <div className="flex items-center justify-between mb-2">
                <Button
                  onClick={handlePrevMonth}
                  variant="ghost"
                  className="h-8 w-8 p-0 rounded-full hover:bg-gray-100"
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <h2 className="text-sm font-medium text-gray-700">
                  {format(month, "MMMM yyyy")}
                </h2>
                <Button
                  onClick={handleNextMonth}
                  variant="ghost"
                  className="h-8 w-8 p-0 rounded-full hover:bg-gray-100"
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
              
              <DayPicker
                mode="single"
                selected={date}
                onSelect={(day) => {
                  setDate(day);
                  setIsOpen(false);
                }}
                month={month}
                onMonthChange={setMonth}
                disabled={[
                  { before: minDate },
                  { after: maxDate },
                ].filter(Boolean)}
                className="p-0"
                classNames={{
                  months: "flex flex-col",
                  month: "space-y-2",
                  caption: "flex justify-center relative items-center",
                  caption_label: "hidden", // Hide default caption as we have custom one
                  nav: "hidden", // Hide default nav as we have custom one
                  table: "w-full border-collapse",
                  head_row: "flex w-full",
                  head_cell: "text-xs font-medium text-gray-500 w-9 m-0 p-0 text-center",
                  row: "flex w-full mt-1",
                  cell: "text-center text-sm relative p-0 m-0",
                  day: "h-9 w-9 p-0 flex items-center justify-center rounded-full hover:bg-blue-100 mx-auto",
                  day_today: "bg-blue-50 font-semibold text-blue-600",
                  day_selected: "bg-blue-600 text-white hover:bg-blue-700 font-semibold",
                  day_disabled: "text-gray-300 hover:bg-transparent",
                  day_outside: "text-gray-300 opacity-50",
                  day_range_middle: "bg-blue-50",
                  day_hidden: "invisible",
                }}
              />
            </div>
            
            <div className="border-t border-gray-200 p-2 flex justify-between bg-gray-50">
              <Button
                type="button"
                variant="ghost"
                onClick={() => {
                  setDate(undefined);
                  setIsOpen(false);
                }}
                className="text-sm text-gray-600 hover:text-red-500 px-3 py-1 rounded"
              >
                Clear
              </Button>
              <Button
                type="button"
                variant="ghost"
                onClick={() => {
                  setDate(new Date());
                  setIsOpen(false);
                }}
                className="text-sm text-blue-600 hover:text-blue-700 px-3 py-1 rounded font-medium"
              >
                Today
              </Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}