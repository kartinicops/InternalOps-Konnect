"use client"

import { useState, useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Nav } from "@/components/nav"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Checkbox } from "@/components/ui/checkbox"
import API from "@/services/api"

export default function EditProject() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const id = searchParams.get("id")
  const [project, setProject] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  // Fetch project data when the component is mounted
  useEffect(() => {
    if (!id) return

    const fetchProject = async () => {
      try {
        await API.get("/api/csrf/") // Ensure CSRF token is fetched before API request
        const response = await API.get(`/projects/${id}/`, { withCredentials: true })
        setProject(response.data)
      } catch (error) {
        console.error("Error fetching project:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchProject()
  }, [id])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    // Handle form submission (e.g., saving changes)
    router.push(`/projects/${id}`)
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      console.log("File uploaded:", file)
    }
  }

  if (loading) {
    return <div className="flex items-center justify-center h-screen">Loading project...</div>
  }

  if (!project) {
    return <div className="flex items-center justify-center h-screen">Project not found</div>
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <Nav />
      <main className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold text-blue-600">Edit Project</h1>
        </div>

        <form onSubmit={handleSubmit} className="grid gap-6">
          {/* Project Brief */}
          <Card>
            <CardHeader>
              <CardTitle>Project Brief</CardTitle>
            </CardHeader>
            <CardContent className="grid gap-4">
              <div className="grid gap-4">
                <div>
                  <Label htmlFor="name">Project Name</Label>
                  <Input
                    id="name"
                    defaultValue={project.project_name}
                  />
                </div>
                <div>
                  <Label htmlFor="status">Status</Label>
                  <Select defaultValue={project.status}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="in-progress">In Progress</SelectItem>
                      <SelectItem value="completed">Completed</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="timeline-start">Timeline Start</Label>
                    <Input id="timeline-start" type="date" defaultValue={project.timeline_start} />
                  </div>
                  <div>
                    <Label htmlFor="timeline-end">Timeline End</Label>
                    <Input id="timeline-end" type="date" defaultValue={project.timeline_end} />
                  </div>
                </div>
                <div>
                  <Label htmlFor="expected-calls">Expected Calls</Label>
                  <Input id="expected-calls" type="number" defaultValue={project.expected_calls} />
                </div>
                <div>
                  <Label htmlFor="timezone">Project Timezone</Label>
                  <Input id="timezone" defaultValue={project.timezone} />
                </div>
                <div>
                  <Label htmlFor="currency">Currency</Label>
                  <Select defaultValue={project.currency}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select currency" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="usd">USD</SelectItem>
                      <SelectItem value="eur">EUR</SelectItem>
                      <SelectItem value="gbp">GBP</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* General Screening Questions */}
          <Card>
            <CardHeader>
              <CardTitle>General Screening Questions</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="question1">Question 1</Label>
                  <Textarea
                    id="question1"
                    defaultValue="Please provide the information on the market trends and future growth drivers and inhibitors within the category."
                  />
                </div>
                <div>
                  <Label htmlFor="question2">Question 2</Label>
                  <Textarea
                    id="question2"
                    defaultValue="Please provide the key success factors within the category, insights regarding the key drivers features."
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Client Requirements */}
          <Card>
            <CardHeader>
              <CardTitle>Client Requirements</CardTitle>
            </CardHeader>
            <CardContent>
              <Textarea
                defaultValue="Must have experience of at least 3 years in F&B industry."
                rows={4}
              />
            </CardContent>
          </Card>

          {/* File Upload Section */}
          <Card>
            <CardHeader>
              <CardTitle>Files</CardTitle>
            </CardHeader>
            <CardContent>
              <div>
                <input type="file" onChange={handleFileChange} />
                {/* Display message if no file is selected */}
                <p>{!project.files || project.files.length === 0 ? "No files available." : "Files available for upload."}</p>
              </div>
            </CardContent>
          </Card>

          <div className="flex justify-end gap-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => router.push(`/projects/${id}`)}
            >
              Cancel
            </Button>
            <Button type="submit">Save Changes</Button>
          </div>
        </form>
      </main>
    </div>
  )
}