"use client"

import { useState } from "react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { Dropdown } from "@/components/ui/dropdown"

export function ExpertsFilters() {
  const [employmentType, setEmploymentType] = useState<"current" | "former">("current")

  return (
    <div className="w-80 space-y-6 p-4 border-r min-h-screen">
      <div className="space-y-4">
        <h2 className="text-lg font-medium">General search</h2>
        <div className="flex items-center gap-2">
          <Input placeholder="Search" className="flex-1" />
          <Button variant="outline" size="sm">Clear all</Button>
        </div>
      </div>

      <div className="space-y-4">
        <h2 className="text-lg font-medium">Work experience</h2>
        <div>
          <Label htmlFor="expert-title">Expert title</Label>
          <Input id="expert-title" placeholder="Expert title" />
        </div>
        <div>
          <Label htmlFor="companies">Companies</Label>
          <Input id="companies" placeholder="Companies" />
        </div>
      </div>

      <div className="space-y-4">
        <h2 className="text-lg font-medium">Employment</h2>
        <div className="flex gap-2">
          <Button 
            variant={employmentType === "current" ? "default" : "outline"}
            onClick={() => setEmploymentType("current")}
          >
            Current
          </Button>
          <Button
            variant={employmentType === "former" ? "default" : "outline"}
            onClick={() => setEmploymentType("former")}
          >
            Former
          </Button>
        </div>
        <Dropdown placeholder="Ended employment" options={["Option 1", "Option 2"]} />
      </div>

      <div className="space-y-4">
        <h2 className="text-lg font-medium">Other</h2>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <Label htmlFor="completed-call">Has completed at least one call</Label>
            <Switch id="completed-call" />
          </div>
          <div className="flex items-center justify-between">
            <Label htmlFor="published">Has been published previously</Label>
            <Switch id="published" />
          </div>
        </div>
      </div>
    </div>
  )
}