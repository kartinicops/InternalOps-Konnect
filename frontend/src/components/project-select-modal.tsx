"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Search, X } from "lucide-react"
import { Badge } from "@/components/ui/badge"

interface Project {
  id: string
  name: string
  company: string
  status: "In progress"
}

interface ProjectSelectModalProps {
  isOpen: boolean
  onClose: () => void
  onSelect: (projectId: string) => void
}

const dummyProjects: Project[] = [
  {
    id: "1",
    name: "Motor insurance in Southeast Asia",
    company: "Abeam Consulting",
    status: "In progress",
  },
  {
    id: "2",
    name: "Digital services vendor landscape for 20+ companies",
    company: "Zinnov",
    status: "In progress",
  },
  {
    id: "3",
    name: "DRAM Design",
    company: "Alaris",
    status: "In progress",
  },
  {
    id: "4",
    name: "Use of copper molds in continuous steel casting",
    company: "Aditya Birla Group",
    status: "In progress",
  },
  {
    id: "5",
    name: "Project Nexus",
    company: "1Lattice",
    status: "In progress",
  },
  {
    id: "6",
    name: "Experts in Cotton Yarn Manufacturing",
    company: "Textile Corp",
    status: "In progress",
  },
]

export function ProjectSelectModal({ isOpen, onClose, onSelect }: ProjectSelectModalProps) {
  const [searchQuery, setSearchQuery] = useState("")

  const filteredProjects = dummyProjects.filter(
    (project) =>
      project.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      project.company.toLowerCase().includes(searchQuery.toLowerCase()),
  )

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px] bg-white p-0 rounded-lg overflow-hidden">
        <DialogHeader className="px-4 py-3 flex flex-row items-center justify-between border-b">
          <DialogTitle className="text-lg font-semibold">Select project</DialogTitle>
          {/* <button
            onClick={onClose}
            className="rounded-full p-2 opacity-70 hover:bg-gray-100 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
          >
            <X className="h-5 w-5" />
            <span className="sr-only">Close</span>
          </button> */}
        </DialogHeader>

        <div className="p-4">
          <div className="relative mb-4">
            <Search className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
            <Input
              placeholder="Search projects..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 pr-4 py-2 rounded-full border-2 border-gray-200 focus:border-blue-500 focus:ring focus:ring-blue-200 focus:ring-opacity-50 bg-white text-sm"
            />
          </div>

          <div className="max-h-[300px] overflow-y-auto pr-2 -mr-2">
            {filteredProjects.map((project) => (
              <div
                key={project.id}
                onClick={() => onSelect(project.id)}
                className="flex items-start justify-between p-3 cursor-pointer hover:bg-gray-50 rounded-lg transition-all duration-200 mb-1 border border-transparent hover:border-gray-200"
              >
                <div className="space-y-1 flex-grow mr-4">
                  <div className="font-medium text-base">{project.name}</div>
                  <div className="text-xs text-gray-500">{project.company}</div>
                </div>
                <Badge className="bg-green-100 text-green-800 hover:bg-green-200 px-2 py-0.5 text-xs font-medium rounded-full">
                  {project.status}
                </Badge>
              </div>
            ))}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}