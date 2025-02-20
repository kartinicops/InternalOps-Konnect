"use client"

import { useState } from "react"
import axios from "axios"
import { useRouter } from "next/navigation"
import { ArrowLeft } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Nav } from "@/components/nav"

interface ExpertFormData {
  full_name: string
  linkedIn_profile_link: string
  industry: string
  country_of_residence: string
  email: string
  expert_cost: number
  phone_number: string
  notes: string
}

export default function AddExpert() {
  const router = useRouter()
  const [formData, setFormData] = useState<ExpertFormData>({
    full_name: "",
    linkedIn_profile_link: "",
    industry: "",
    country_of_residence: "",
    email: "",
    expert_cost: 0,
    phone_number: "",
    notes: "",
  })
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState("")

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: name === "expert_cost" ? Number.parseFloat(value) : value,
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setMessage("")

    try {
      await axios.post(
        "http://127.0.0.1:8000/experts/",
        {
          ...formData,
          email_confirmed: false,
        },
        {
          headers: {
            "Content-Type": "application/json",
          },
          withCredentials: true,
        },
      )

      setMessage("Expert successfully added!")
      setTimeout(() => {
        router.push("/projects/experts")
      }, 2000)
    } catch (error) {
      console.error("Error adding expert:", error)
      setMessage("Failed to add expert.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div>
      <Nav />
      <form className="container mx-auto p-6 space-y-6" onSubmit={handleSubmit}>
        <div className="flex items-center gap-4 mb-6">
  
          <h1 className="text-3xl font-bold text-blue-600">Add Experts</h1>
        </div>

        {/* Basic Info */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <Label htmlFor="full_name">Full Name</Label>
            </CardHeader>
            <CardContent>
              <Input
                id="full_name"
                name="full_name"
                placeholder="Enter full name"
                value={formData.full_name}
                onChange={handleChange}
                required
              />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <Label htmlFor="linkedIn_profile_link">LinkedIn Profile</Label>
            </CardHeader>
            <CardContent>
              <Input
                id="linkedIn_profile_link"
                name="linkedIn_profile_link"
                placeholder="Enter LinkedIn profile URL"
                value={formData.linkedIn_profile_link}
                onChange={handleChange}
                required
              />
            </CardContent>
          </Card>
        </div>

        {/* Industry and Location */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <Label htmlFor="industry">Industry</Label>
            </CardHeader>
            <CardContent>
              <Input
                id="industry"
                name="industry"
                placeholder="Enter industry"
                value={formData.industry}
                onChange={handleChange}
                required
              />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <Label htmlFor="country_of_residence">Country of Residence</Label>
            </CardHeader>
            <CardContent>
              <Input
                id="country_of_residence"
                name="country_of_residence"
                placeholder="Enter country of residence"
                value={formData.country_of_residence}
                onChange={handleChange}
                required
              />
            </CardContent>
          </Card>
        </div>

        {/* Contact Information */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card>
            <CardHeader>
              <Label htmlFor="email">Email</Label>
            </CardHeader>
            <CardContent>
              <Input
                id="email"
                name="email"
                type="email"
                placeholder="Enter email address"
                value={formData.email}
                onChange={handleChange}
                required
              />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <Label htmlFor="phone_number">Phone Number</Label>
            </CardHeader>
            <CardContent>
              <Input
                id="phone_number"
                name="phone_number"
                placeholder="Enter phone number"
                value={formData.phone_number}
                onChange={handleChange}
                required
              />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <Label htmlFor="expert_cost">Expert Cost (USD)</Label>
            </CardHeader>
            <CardContent>
              <Input
                id="expert_cost"
                name="expert_cost"
                type="number"
                min="0"
                step="0.01"
                placeholder="Enter expert cost"
                value={formData.expert_cost}
                onChange={handleChange}
                required
              />
            </CardContent>
          </Card>
        </div>

        {/* Notes */}
        <Card>
          <CardHeader>
            <CardTitle>Notes</CardTitle>
          </CardHeader>
          <CardContent>
            <Textarea
              name="notes"
              placeholder="Enter additional notes about the expert"
              value={formData.notes}
              onChange={handleChange}
              className="min-h-[100px]"
            />
          </CardContent>
        </Card>

        {/* Submit */}
        <div className="flex justify-end gap-4">
          <Button type="button" variant="outline" onClick={() => router.back()}>
            Cancel
          </Button>
          <Button type="submit" disabled={loading}>
            {loading ? "Adding..." : "Add Expert"}
          </Button>
        </div>

        {message && (
          <p className={`text-center mt-4 ${message.includes("success") ? "text-green-600" : "text-red-600"}`}>
            {message}
          </p>
        )}
      </form>
    </div>
  )
}