"use client";

import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Dropdown } from "@/components/ui/dropdown";

// Custom Switch (Toggle Button)
function CustomSwitch({ id }: { id: string }) {
  const [isOn, setIsOn] = useState(false);

  return (
    <button
      id={id}
      onClick={() => setIsOn(!isOn)}
      className={`w-12 h-6 flex items-center rounded-full p-1 transition-all ${
        isOn ? "bg-blue-600" : "bg-gray-600"
      }`}
    >
      <div
        className={`w-4 h-4 bg-white rounded-full shadow-md transform transition-transform ${
          isOn ? "translate-x-6" : "translate-x-0"
        }`}
      />
    </button>
  );
}

export function ExpertsFilters() {
  const [employmentType, setEmploymentType] = useState<"current" | "former">("current");

  return (
    <div className="w-80 space-y-6 p-4 border-r min-h-screen bg-white text-black">
      
      {/* General Search */}
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <h2 className="text-lg font-medium">General search</h2>
          <Button variant="ghost" className="text-sm text-gray-600 hover:text-black">Clear all</Button>
        </div>
        <Input placeholder="Search" className="w-full border-gray-300" />
      </div>

      {/* Work Experience */}
      <div className="space-y-4">
        <h2 className="text-lg font-medium">Work experience</h2>
        <div>
          <Label htmlFor="expert-title">Expert title</Label>
          <Input id="expert-title" placeholder="Expert title" className="border-gray-300" />
        </div>
        <div>
          <Label htmlFor="companies">Companies</Label>
          <Input id="companies" placeholder="Companies" className="border-gray-300" />
        </div>
      </div>

      {/* Employment Type */}
      <div className="space-y-4">
        <h2 className="text-lg font-medium">Employment</h2>
        <div className="flex w-full rounded-lg border p-1 transition-all bg-gray-100 border-gray-300">
          <button
            className={`w-1/2 py-2 text-sm font-medium rounded-md transition-all ${
              employmentType === "current"
                ? "bg-white shadow-sm text-black"
                : "bg-gray-100 text-gray-600 hover:bg-gray-200"
            }`}
            onClick={() => setEmploymentType("current")}
          >
            Current
          </button>
          <button
            className={`w-1/2 py-2 text-sm font-medium rounded-md transition-all ${
              employmentType === "former"
                ? "bg-white shadow-sm text-black"
                : "bg-gray-100 text-gray-600 hover:bg-gray-200"
            }`}
            onClick={() => setEmploymentType("former")}
          >
            Former
          </button>
        </div>
        <Dropdown placeholder="8/8 selected" options={["Option 1", "Option 2"]} className="border-gray-300" />
      </div>

      {/* Other Filters */}
      <div className="space-y-4">
        <h2 className="text-lg font-medium">Other</h2>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <Label htmlFor="completed-call" className="text-gray-700">Has completed at least one call</Label>
            <CustomSwitch id="completed-call" />
          </div>
          <div className="flex items-center justify-between">
            <Label htmlFor="published" className="text-gray-700">Has been published previously</Label>
            <CustomSwitch id="published" />
          </div>
        </div>
      </div>
    </div>
  );
}