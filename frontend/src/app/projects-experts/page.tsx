'use client'

import { useState } from "react"
import { useRouter } from 'next/navigation' // Import the useRouter hook
import { Nav } from "@/components/nav"
import { Input } from "@/components/ui/input"
import { Checkbox } from "@/components/ui/checkbox"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Search, Plus } from 'lucide-react'
import { useSearchParams } from 'next/navigation'

// Sample data
const experts = [
  {
    id: 1,
    position: "Head of Sales & Marketing B2C",
    company: "Tate & Lyle Sugars",
    period: "Oct 2024 - Present",
    contactDetails: "-",
    addedBy: "Valeri Adelia",
    addedAt: "9 Dec 2024 10:00",
    priority: 3,
    status: "Added"
  },
  {
    id: 2,
    position: "Commercial Excellence Director",
    company: "TEREOS",
    period: "Mar 2023 - Present",
    contactDetails: "-",
    addedBy: "Valeri Adelia",
    addedAt: "9 Dec 2024 17:54",
    priority: 3,
    status: "Added"
  },
  {
    id: 3,
    position: "Regional Technical Manager",
    company: "PureCircle",
    period: "Dec 2019 - Present",
    contactDetails: "-",
    addedBy: "Valeri Adelia",
    addedAt: "9 Dec 2024 08:55",
    priority: 3,
    status: "Added"
  }
]

export default function ProjectExpertsPage() {
  const [searchQuery, setSearchQuery] = useState("")
  const [showDeclined, setShowDeclined] = useState(false)
  const searchParams = useSearchParams()
  const router = useRouter() // Use the useRouter hook
  const projectName = searchParams.get('project') || ''

  const decodedProjectName = decodeURIComponent(projectName).split('-').map(word => 
    word.charAt(0).toUpperCase() + word.slice(1)
  ).join(' ')

  const filteredExperts = experts.filter(expert => 
    expert.position.toLowerCase().includes(searchQuery.toLowerCase()) ||
    expert.company.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const handleAddExpert = () => {
    router.push('/add-expert') // Navigate to the "Add Expert" page
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Nav isProjectDetail projectName={decodedProjectName} />
      
      <div className="p-6">
        <div className="mb-6 flex items-center justify-between">
          <div className="flex items-center gap-4 flex-1">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder="Search experts..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9"
              />
            </div>
            <div className="flex items-center gap-2">
              <Checkbox
                id="declined"
                checked={showDeclined}
                onCheckedChange={(checked) => setShowDeclined(checked as boolean)}
              />
              <label htmlFor="declined" className="text-sm text-gray-600">
                Show declined experts
              </label>
            </div>
          </div>
          <Button className="ml-4" onClick={handleAddExpert}>
            <Plus className="h-4 w-4 mr-2" />
            Add expert
          </Button>
        </div>

        <div className="bg-white rounded-lg shadow">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Expert</TableHead>
                <TableHead>Company</TableHead>
                <TableHead>Contact details</TableHead>
                <TableHead>Added by</TableHead>
                <TableHead>Added at</TableHead>
                <TableHead>Priority</TableHead>
                <TableHead>Recruitment status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredExperts.map((expert) => (
                <TableRow key={expert.id}>
                  <TableCell className="font-medium">{expert.position}</TableCell>
                  <TableCell>
                    <div>{expert.company}</div>
                    <div className="text-sm text-gray-500">{expert.period}</div>
                  </TableCell>
                  <TableCell>{expert.contactDetails}</TableCell>
                  <TableCell>{expert.addedBy}</TableCell>
                  <TableCell>{expert.addedAt}</TableCell>
                  <TableCell>
                    <div className="flex gap-0.5">
                      {Array.from({ length: expert.priority }).map((_, i) => (
                        <div
                          key={i}
                          className="h-2 w-2 rounded-full bg-gray-300"
                        />
                      ))}
                    </div>
                  </TableCell>
                  <TableCell>
                    <span className="text-green-600">{expert.status}</span>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>
    </div>
  )
}