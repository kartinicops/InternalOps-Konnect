"use client"

import { Nav } from "@/components/nav"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Checkbox } from "@/components/ui/checkbox"
import { useRouter } from "next/navigation"

export default function EditProject({ params }: { params: { id: string } }) {
  const router = useRouter()

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    // Handle form submission
    router.push(`/projects/${params.id}`)
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
                    defaultValue="food and beverage industry in Latin America and the United States"
                  />
                </div>
                <div>
                  <Label htmlFor="status">Status</Label>
                  <Select defaultValue="in-progress">
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
                    <Input id="timeline-start" type="date" defaultValue="2024-12-09" />
                  </div>
                  <div>
                    <Label htmlFor="timeline-end">Timeline End</Label>
                    <Input id="timeline-end" type="date" defaultValue="2025-01-31" />
                  </div>
                </div>
                <div>
                  <Label htmlFor="expected-calls">Expected Calls</Label>
                  <Input id="expected-calls" type="number" defaultValue="10" />
                </div>
                <div>
                  <Label htmlFor="timezone">Project Timezone</Label>
                  <Input id="timezone" defaultValue="Asia/Tokyo, GMT+9" />
                </div>
                <div>
                  <Label htmlFor="currency">Currency</Label>
                  <Select defaultValue="usd">
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

          {/* Companies of Interest */}
          <Card>
            <CardHeader>
              <CardTitle>Companies of Interest</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4">
                <div className="grid grid-cols-3 font-semibold border-b pb-2">
                  <div>Company</div>
                  <div>Current</div>
                  <div>Former</div>
                </div>
                {["Distriaves", "Carnes Casablanca"].map((company, index) => (
                  <div key={index} className="grid grid-cols-3 items-center">
                    <div>{company}</div>
                    <div>
                      <Checkbox defaultChecked />
                    </div>
                    <div>
                      <Checkbox defaultChecked />
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* General Questions */}
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
                    defaultValue="Please provide the alphabets(A-J) of the categories..."
                  />
                </div>
                <div>
                  <Label htmlFor="question2">Question 2</Label>
                  <Textarea
                    id="question2"
                    defaultValue="Please provide the information on the market trends..."
                  />
                </div>
                <div>
                  <Label htmlFor="question3">Question 3</Label>
                  <Textarea
                    id="question3"
                    defaultValue="Please provide the key success factors..."
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
                defaultValue="Do not mention the client's company name or identity..."
                rows={4}
              />
            </CardContent>
          </Card>

          <div className="flex justify-end gap-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => router.push(`/projects/${params.id}`)}
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