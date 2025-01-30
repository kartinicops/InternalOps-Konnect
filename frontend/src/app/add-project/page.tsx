"use client"

import { useState } from "react"
import { Calendar, Plus, Upload, X } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { DatePicker } from "@/components/ui/date-picker"
import { Nav } from "@/components/nav" // Import the Nav component

export default function AddProject() {
  const [companies, setCompanies] = useState<string[]>([""])
  const [categories, setCategories] = useState<string[]>([""])

  const addCompany = () => {
    setCompanies([...companies, ""])
  }

  const removeCompany = (index: number) => {
    const newCompanies = companies.filter((_, i) => i !== index)
    setCompanies(newCompanies.length ? newCompanies : [""])
  }

  const updateCompany = (index: number, value: string) => {
    const newCompanies = [...companies]
    newCompanies[index] = value
    setCompanies(newCompanies)
  }

  const addCategory = () => {
    setCategories([...categories, ""])
  }

  const removeCategory = (index: number) => {
    const newCategories = categories.filter((_, i) => i !== index)
    setCategories(newCategories.length ? newCategories : [""])
  }

  const updateCategory = (index: number, value: string) => {
    const newCategories = [...categories]
    newCategories[index] = value
    setCategories(newCategories)
  }

  return (
    <div>
      <Nav /> {/* Add the Nav component here */}
      <form className="container mx-auto p-6 space-y-6">
        <h1 className="text-3xl font-bold">Add New Project</h1>

        {/* Basic Info */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card>
            <CardHeader>
              <Label htmlFor="status">Status</Label>
            </CardHeader>
            <CardContent>
              <Input id="status" placeholder="Enter project status" />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <Label>Timeline</Label>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="startDate">Start Date</Label>
                <DatePicker />
              </div>
              <div>
                <Label htmlFor="endDate">End Date</Label>
                <DatePicker />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <Label htmlFor="expectedCalls">Expected Calls</Label>
            </CardHeader>
            <CardContent>
              <Input id="expectedCalls" type="number" min="0" placeholder="Enter number of expected calls" />
            </CardContent>
          </Card>
        </div>

        {/* Companies of Interest */}
        <Card>
          <CardHeader>
            <CardTitle>Companies of Interest</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {companies.map((company, index) => (
              <div key={index} className="flex gap-2">
                <Input
                  value={company}
                  onChange={(e) => updateCompany(index, e.target.value)}
                  placeholder="Enter company name"
                />
                <Button type="button" variant="outline" size="icon" onClick={() => removeCompany(index)}>
                  <X className="h-4 w-4" />
                </Button>
              </div>
            ))}
            <Button type="button" variant="outline" className="w-full" onClick={addCompany}>
              <Plus className="h-4 w-4 mr-2" />
              Add Company
            </Button>
          </CardContent>
        </Card>

        {/* Client Requirements */}
        <Card>
          <CardHeader>
            <CardTitle>Client Requirements</CardTitle>
          </CardHeader>
          <CardContent>
            <Textarea placeholder="Enter client requirements" className="min-h-[100px]" />
          </CardContent>
        </Card>

        {/* Categories of Interest */}
        <Card>
          <CardHeader>
            <CardTitle>Categories of Interest</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {categories.map((category, index) => (
              <div key={index} className="flex gap-2">
                <Input
                  value={category}
                  onChange={(e) => updateCategory(index, e.target.value)}
                  placeholder="Enter category"
                />
                <Button type="button" variant="outline" size="icon" onClick={() => removeCategory(index)}>
                  <X className="h-4 w-4" />
                </Button>
              </div>
            ))}
            <Button type="button" variant="outline" className="w-full" onClick={addCategory}>
              <Plus className="h-4 w-4 mr-2" />
              Add Category
            </Button>
          </CardContent>
        </Card>

        {/* Questions */}
        <Card>
          <CardHeader>
            <CardTitle>General Screening Questions</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="question1">Market Trends Question</Label>
              <Textarea id="question1" placeholder="Enter question about market trends" className="min-h-[100px]" />
            </div>
            <div>
              <Label htmlFor="question2">Key Success Factors Question</Label>
              <Textarea id="question2" placeholder="Enter question about key success factors" className="min-h-[100px]" />
            </div>
            <div>
              <Label htmlFor="question3">Major Players Question</Label>
              <Textarea id="question3" placeholder="Enter question about major players" className="min-h-[100px]" />
            </div>
          </CardContent>
        </Card>

        {/* File Upload */}
        <Card>
          <CardHeader>
            <CardTitle>Files</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid w-full max-w-sm items-center gap-1.5">
              <Label htmlFor="file">Upload File</Label>
              <Input id="file" type="file" />
            </div>
          </CardContent>
        </Card>

        {/* Submit Button */}
        <div className="flex justify-end gap-4">
          <Button variant="outline">Cancel</Button>
          <Button type="submit">Create Project</Button>
        </div>
      </form>
    </div>
  )
}