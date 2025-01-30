"use client"

import { useState } from "react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Download, Briefcase } from "lucide-react"
import { ExpertModal } from "./expert-modal"

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

const experts: Expert[] = [
  {
    id: "1",
    title: "Head of Sales France Benelux Nordics & Export",
    company: "TEREOS",
    dateRange: "Apr 2022 - Feb 2023",
    lastPublished: "-",
    projects: 1,
    calls: 0,
    isFormer: true,
    email: "expert1@example.com",
    phone: "+33 1 23 45 67 89",
    timezone: "Europe/Paris",
    location: "Paris, France",
    career: [
      {
        title: "Head of Sales France Benelux Nordics & Export",
        company: "TEREOS",
        dateRange: "Apr 2022 - Feb 2023",
      },
      {
        title: "Sales Director",
        company: "Previous Company",
        dateRange: "Jan 2018 - Mar 2022",
      },
    ],
    projects: [
      {
        name: "European Market Expansion",
        status: "Completed",
        rating: 5,
      },
    ],
  },
  {
    id: "2",
    title: "Total Rewards and Data Management",
    company: "Hyundai Asia Resources, Inc. (HARI)",
    dateRange: "Mar 2018 - Aug 2020",
    lastPublished: "9 Dec 2024 15:57",
    projects: 1,
    calls: 0,
    isFormer: true,
    email: "expert2@example.com",
    phone: "+63 2 345 6789",
    timezone: "Asia/Manila",
    location: "Manila, Philippines",
    career: [
      {
        title: "Total Rewards and Data Management",
        company: "Hyundai Asia Resources, Inc. (HARI)",
        dateRange: "Mar 2018 - Aug 2020",
      },
      {
        title: "HR Specialist",
        company: "Previous Company",
        dateRange: "Jun 2015 - Feb 2018",
      },
    ],
    projects: [
      {
        name: "Employee Benefits Optimization",
        status: "In Progress",
        rating: 4,
      },
    ],
  },
]

export function ExpertsTable() {
  const [selectedExperts, setSelectedExperts] = useState<string[]>([])
  const [selectedExpert, setSelectedExpert] = useState<Expert | null>(null)

  const handleCheckboxChange = (id: string) => {
    setSelectedExperts((prev) => (prev.includes(id) ? prev.filter((expertId) => expertId !== id) : [...prev, id]))
  }

  const handleExpertClick = (expert: Expert) => {
    setSelectedExpert(expert)
  }

  const handleDownloadExperts = () => {
    const data = JSON.stringify(
      experts.filter((expert) => selectedExperts.includes(expert.id)),
      null,
      2,
    )
    const blob = new Blob([data], { type: "application/json" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = "experts.json"
    a.click()
    URL.revokeObjectURL(url)
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
      
      {/* Title */}
      <TableCell>
        <div className="flex items-center gap-2">
          {expert.isFormer && (
            <Badge variant="secondary" className="text-xs transition-colors hover:bg-secondary/80">
              Former
            </Badge>
          )}
          <span className="transition-colors group-hover:text-primary">{expert.title}</span>
        </div>
      </TableCell>
      
      {/* Company & Date Range */}
      <TableCell>
        <div className="space-y-1">
          <div>{expert.company}</div>
          <div className="text-sm text-muted-foreground">{expert.dateRange}</div>
        </div>
      </TableCell>

      {/* Last Published */}
      <TableCell>{expert.lastPublished}</TableCell>

      {/* Projects */}
      <TableCell className="text-center">{expert.projects.length}</TableCell>

      {/* Calls */}
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
          <Button className="transition-all hover:bg-primary-dark hover:shadow-md">
            <Briefcase className="mr-2 h-4 w-4" />
            Add to Project
          </Button>
        </div>
      )}

      <ExpertModal expert={selectedExpert} isOpen={selectedExpert !== null} onClose={() => setSelectedExpert(null)} />
    </div>
  )
}

