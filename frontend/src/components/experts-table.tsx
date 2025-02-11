"use client"

import { useState, useEffect } from "react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Download, Briefcase } from 'lucide-react'
import { ExpertModal } from "./expert-modal"
import { ProjectSelectModal } from "./project-select-modal"
import API from "@/services/api" // Adjust with actual API service path

interface Expert {
  id: string
  title: string
  company: string
  dateRange: string
  lastPublished: string
  projects: number
  calls: number
  isFormer: boolean
  email: string
  phone: string
  timezone: string
  location: string
  career: Array<{
    title: string
    company: string
    dateRange: string
  }>
  projects: Array<{
    name: string
    status: string
    rating: number
  }>
}

export function ExpertsTable() {
  const [experts, setExperts] = useState<Expert[]>([])
  const [selectedExperts, setSelectedExperts] = useState<string[]>([])
  const [selectedExpert, setSelectedExpert] = useState<Expert | null>(null)
  const [isProjectModalOpen, setIsProjectModalOpen] = useState(false)
  const [loading, setLoading] = useState(true)

  // Fetching experts from the API
  useEffect(() => {
    const fetchExperts = async () => {
      try {
        setLoading(true)
        const response = await API.get("/api/experts/") // API endpoint to fetch experts
        setExperts(response.data)
      } catch (error) {
        console.error("Error fetching experts:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchExperts()
  }, [])

  const handleCheckboxChange = (id: string) => {
    setSelectedExperts((prev) =>
      prev.includes(id) ? prev.filter((expertId) => expertId !== id) : [...prev, id]
    )
  }

  const handleExpertClick = (expert: Expert) => {
    setSelectedExpert(expert)
  }

  const handleDownloadExperts = () => {
    const data = JSON.stringify(
      experts.filter((expert) => selectedExperts.includes(expert.id)),
      null,
      2
    )
    const blob = new Blob([data], { type: "application/json" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = "experts.json"
    a.click()
    URL.revokeObjectURL(url)
  }

  const handleProjectSelect = (projectId: string) => {
    console.log("Selected project:", projectId)
    console.log("Selected experts:", selectedExperts)
    setIsProjectModalOpen(false)
  }

  if (loading) {
    return <div className="flex items-center justify-center h-screen">Loading experts...</div>
  }

  return (
    <div className="space-y-4">
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[30px]"></TableHead>
              <TableHead>Title</TableHead>
              <TableHead>Company</TableHead>
              <TableHead>Last published</TableHead>
              <TableHead className="text-center">Projects</TableHead>
              <TableHead className="text-center">Calls</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {experts.map((expert) => (
              <TableRow
                key={expert.id}
                className="cursor-pointer transition-colors hover:bg-secondary/10"
                onClick={() => handleExpertClick(expert)}
              >
                <TableCell onClick={(e) => e.stopPropagation()}>
                  <input
                    type="checkbox"
                    className="rounded border-gray-300 text-primary transition-colors hover:border-primary focus:ring-primary focus:ring-offset-0"
                    checked={selectedExperts.includes(expert.id)}
                    onChange={() => handleCheckboxChange(expert.id)}
                  />
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    {expert.isFormer && (
                      <Badge
                        variant="secondary"
                        className="text-xs transition-colors hover:bg-secondary/80"
                      >
                        Former
                      </Badge>
                    )}
                    <span className="transition-colors group-hover:text-primary">
                      {expert.title}
                    </span>
                  </div>
                </TableCell>
                <TableCell>
                  <div className="space-y-1">
                    <div>{expert.company}</div>
                    <div className="text-sm text-muted-foreground">{expert.dateRange}</div>
                  </div>
                </TableCell>
                <TableCell>{expert.lastPublished}</TableCell>
                <TableCell className="text-center">{expert.projects.length}</TableCell>
                <TableCell className="text-center">{expert.calls}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {selectedExperts.length > 0 && (
        <div className="flex justify-end gap-2">
          <Button
            variant="outline"
            onClick={handleDownloadExperts}
            className="transition-all hover:bg-secondary/10 hover:text-primary hover:border-primary"
          >
            <Download className="mr-2 h-4 w-4" />
            Download Experts
          </Button>
          <Button 
            className="transition-all hover:bg-primary-dark hover:shadow-md"
            onClick={() => setIsProjectModalOpen(true)}
          >
            <Briefcase className="mr-2 h-4 w-4" />
            Add to Project
          </Button>
        </div>
      )}

      <ExpertModal
        expert={selectedExpert}
        isOpen={selectedExpert !== null}
        onClose={() => setSelectedExpert(null)}
        onAddToProject={() => {
          setSelectedExpert(null)
          setIsProjectModalOpen(true)
        }}
      />

      <ProjectSelectModal
        isOpen={isProjectModalOpen}
        onClose={() => setIsProjectModalOpen(false)}
        onSelect={handleProjectSelect}
      />
    </div>
  )
}
