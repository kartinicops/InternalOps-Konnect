"use client"

import { useState, useEffect, ChangeEvent, FormEvent } from "react"
import { useRouter } from "next/navigation"
import API from "@/services/api"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Nav } from "@/components/nav"
import { Loader2, Calendar, ArrowLeft, MapPin, Globe, Clock, Briefcase, Mail, Phone, Plus, X, User } from "lucide-react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { ToastContainer, toast } from "react-toastify"
import "react-toastify/dist/ReactToastify.css"
import { FaLinkedin } from 'react-icons/fa'

export default function AddExpert() {
  const router = useRouter()
  const [loading, setLoading] = useState<boolean>(false)
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    phone: "",
    linkedIn: "",
    industry: "",
    countryOfResidence: "",
    expertCost: 0,
    isFormer: false,
  })
  
  const [careerEntries, setCareerEntries] = useState([
    { title: "", company_name: "", start_date: "", end_date: "" }
  ])

  const countries = [
    "United States", "Canada", "United Kingdom", "Germany", "France", 
    "Australia", "Japan", "China", "India", "Brazil", "Singapore", 
    "Netherlands", "Switzerland", "Sweden", "Norway"
  ]
  
  const industries = [
    "Technology", "Finance", "Healthcare", "Retail", "Manufacturing",
    "Education", "Energy", "Media", "Telecommunications", "Consulting",
    "Pharmaceuticals", "Automotive", "Aerospace", "Agriculture", "Transportation"
  ]

  const handleInputChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { id, value, type } = e.target
    
    setFormData(prev => ({ 
      ...prev, 
      [id]: type === "number" ? parseInt(value) : value 
    }))
  }

  const handleSelectChange = (name: string, value: string) => {
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const handleSwitchChange = () => {
    setFormData(prev => ({ ...prev, isFormer: !prev.isFormer }))
  }

  const handleCareerChange = (index: number, field: string, value: string) => {
    const updatedEntries = [...careerEntries]
    updatedEntries[index] = { ...updatedEntries[index], [field]: value }
    setCareerEntries(updatedEntries)
  }

  const addCareerEntry = () => {
    setCareerEntries([...careerEntries, { title: "", company_name: "", start_date: "", end_date: "" }])
  }

  const removeCareerEntry = (index: number) => {
    if (careerEntries.length <= 1) {
      toast.warning("At least one career entry is required")
      return
    }
    
    const updatedEntries = careerEntries.filter((_, i) => i !== index)
    setCareerEntries(updatedEntries)
  }

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setLoading(true)

    try {
      // First, create the expert
      const expertResponse = await API.post("/experts/", {
        full_name: formData.fullName,
        email: formData.email,
        phone_number: formData.phone,
        linkedIn_profile_link: formData.linkedIn,
        industry: formData.industry,
        country_of_residence: formData.countryOfResidence,
        expert_cost: formData.expertCost,
        is_former: formData.isFormer,
      })

      const expertId = expertResponse.data.expert_id

      // Then add career entries
      await Promise.all(
        careerEntries.map(entry => {
          if (entry.title && entry.company_name) {
            return API.post("/expert_experiences/", {
              expert_id: expertId,
              title: entry.title,
              company_name: entry.company_name,
              start_date: entry.start_date,
              end_date: entry.end_date,
            })
          }
          return Promise.resolve()
        })
      )

      toast.success("Expert and experiences successfully added!")
      setTimeout(() => router.push("/experts"), 2000)
    } catch (error) {
      console.error("Error adding expert or experiences:", error)
      toast.error("Failed to add expert or experiences. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <Nav />
      <ToastContainer theme="colored" />
      
      <div className="container mx-auto py-8 px-4 max-w-5xl">
        <div className="flex items-center mb-8">
          <Button variant="ghost" onClick={() => router.push("/experts")} className="mr-4 text-blue-600 hover:text-blue-800 hover:bg-blue-50">
            <ArrowLeft className="h-5 w-5 mr-1" />Back
          </Button>
          <h1 className="text-3xl font-bold text-blue-600">Add New Expert</h1>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Personal Information Card */}
          <Card className="shadow-lg border-0 overflow-hidden">
            <CardHeader className="bg-white border-b border-gray-100 py-4">
              <CardTitle className="text-xl font-semibold text-gray-800 flex items-center">
                <div className="w-1 h-6 bg-blue-600 mr-3 rounded-full"></div>
                <User className="h-5 w-5 mr-2" />Personal Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6 p-6 bg-white">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="fullName" className="font-medium text-gray-700 flex items-center gap-2">
                    <User className="h-4 w-4" /> Full Name
                  </Label>
                  <Input 
                    id="fullName" 
                    value={formData.fullName}
                    onChange={handleInputChange}
                    placeholder="Jane Doe"
                    required
                    className="bg-white"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="email" className="font-medium text-gray-700 flex items-center gap-2">
                    <Mail className="h-4 w-4" /> Email
                  </Label>
                  <Input 
                    id="email" 
                    type="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    placeholder="jane.doe@example.com"
                    required
                    className="bg-white"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="phone" className="font-medium text-gray-700 flex items-center gap-2">
                    <Phone className="h-4 w-4" /> Phone Number
                  </Label>
                  <Input 
                    id="phone" 
                    value={formData.phone}
                    onChange={handleInputChange}
                    placeholder="+1 123 456 7890"
                    className="bg-white"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="linkedIn" className="font-medium text-gray-700 flex items-center gap-2">
                    <FaLinkedin className="h-4 w-4" /> LinkedIn Profile
                  </Label>
                  <Input 
                    id="linkedIn" 
                    value={formData.linkedIn}
                    onChange={handleInputChange}
                    placeholder="https://linkedin.com/in/janedoe"
                    className="bg-white"
                  />
                </div>
              </div>
            </CardContent>
          </Card>
          
          {/* Professional Information Card */}
          <Card className="shadow-lg border-0 overflow-hidden">
            <CardHeader className="bg-white border-b border-gray-100 py-4">
              <CardTitle className="text-xl font-semibold text-gray-800 flex items-center">
                <div className="w-1 h-6 bg-blue-600 mr-3 rounded-full"></div>
                <Briefcase className="h-5 w-5 mr-2" />Professional Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6 p-6 bg-white">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="industry" className="font-medium text-gray-700">Industry</Label>
                  <Select 
                    onValueChange={(value) => handleSelectChange("industry", value)}
                    value={formData.industry}
                    required
                  >
                    <SelectTrigger className="bg-white">
                      <SelectValue placeholder="Select industry" />
                    </SelectTrigger>
                    <SelectContent>
                      {industries.map((industry) => (
                        <SelectItem key={industry} value={industry}>
                          {industry}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="countryOfResidence" className="font-medium text-gray-700 flex items-center gap-2">
                    <MapPin className="h-4 w-4" /> Country of Residence
                  </Label>
                  <Select 
                    onValueChange={(value) => handleSelectChange("countryOfResidence", value)}
                    value={formData.countryOfResidence}
                    required
                  >
                    <SelectTrigger className="bg-white">
                      <SelectValue placeholder="Select country" />
                    </SelectTrigger>
                    <SelectContent>
                      {countries.map((country) => (
                        <SelectItem key={country} value={country}>
                          {country}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="expertCost" className="font-medium text-gray-700">Expert Cost (USD)</Label>
                  <Input 
                    id="expertCost" 
                    type="number"
                    value={formData.expertCost}
                    onChange={handleInputChange}
                    placeholder="150"
                    min="0"
                    required
                    className="bg-white"
                  />
                </div>
                
                <div className="flex items-center space-x-4">
                  <Label htmlFor="isFormer" className="font-medium text-gray-700">Former Employee</Label>
                  <div className="relative w-16 h-8 rounded-full cursor-pointer flex items-center"
                    style={{ backgroundColor: formData.isFormer ? "#3b82f6" : "#e2e8f0" }}
                    onClick={handleSwitchChange}>
                    <div className="w-6 h-6 bg-white rounded-full shadow-md absolute transition-transform duration-200 ease-in-out"
                      style={{ left: formData.isFormer ? 'calc(100% - 26px)' : '2px' }}></div>
                  </div>
                  <span className="text-sm font-medium text-gray-700">{formData.isFormer ? "Yes" : "No"}</span>
                </div>
              </div>
            </CardContent>
          </Card>
          
          {/* Career History Card */}
          <Card className="shadow-lg border-0 overflow-hidden">
            <CardHeader className="bg-white border-b border-gray-100 py-4">
              <CardTitle className="text-xl font-semibold text-gray-800 flex items-center justify-between">
                <div className="flex items-center">
                  <div className="w-1 h-6 bg-blue-600 mr-3 rounded-full"></div>
                  <Briefcase className="h-5 w-5 mr-2" />Career History
                </div>
                <Button 
                  type="button" 
                  onClick={addCareerEntry}
                  className="bg-blue-600 hover:bg-blue-700 text-white flex items-center gap-1 py-1"
                >
                  <Plus className="h-4 w-4" />
                  Add Position
                </Button>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6 p-6 bg-white">
              {careerEntries.map((entry, index) => (
                <div key={index} className="border border-gray-200 rounded-lg p-4 space-y-4 hover:border-blue-400 transition-colors relative group shadow-sm">
                  <div className="flex justify-between items-center">
                    <h3 className="font-medium text-blue-600 flex items-center gap-2">
                      <Briefcase className="h-4 w-4" />
                      Position {index + 1}
                    </h3>
                    <Button 
                      type="button" 
                      variant="ghost" 
                      size="sm"
                      onClick={() => removeCareerEntry(index)}
                      className="text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-full h-8 w-8 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <X className="h-5 w-5" />
                    </Button>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor={`title-${index}`} className="font-medium text-gray-700">Job Title</Label>
                      <Input 
                        id={`title-${index}`}
                        value={entry.title}
                        onChange={(e) => handleCareerChange(index, "title", e.target.value)}
                        placeholder="Senior Manager"
                        required
                        className="bg-white"
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor={`company-${index}`} className="font-medium text-gray-700">Company Name</Label>
                      <Input 
                        id={`company-${index}`}
                        value={entry.company_name}
                        onChange={(e) => handleCareerChange(index, "company_name", e.target.value)}
                        placeholder="Acme Inc."
                        required
                        className="bg-white"
                      />
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor={`start_date-${index}`} className="font-medium text-gray-700 flex items-center gap-2">
                        <Calendar className="h-4 w-4" /> Start Date
                      </Label>
                      <Input 
                        id={`start_date-${index}`}
                        type="date"
                        value={entry.start_date}
                        onChange={(e) => handleCareerChange(index, "start_date", e.target.value)}
                        className="bg-white"
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor={`end_date-${index}`} className="font-medium text-gray-700 flex items-center gap-2">
                        <Calendar className="h-4 w-4" /> End Date
                      </Label>
                      <Input 
                        id={`end_date-${index}`}
                        type="date"
                        value={entry.end_date}
                        onChange={(e) => handleCareerChange(index, "end_date", e.target.value)}
                        placeholder="Leave blank if current position"
                        className="bg-white"
                      />
                    </div>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Form Actions */}
          <div className="flex justify-end gap-4 pt-4">
            <Button 
              variant="outline" 
              type="button" 
              onClick={() => router.push("/experts")}
              className="px-6 border-gray-300 text-gray-700 hover:bg-gray-100 transition-colors"
            >
              Cancel
            </Button>
            <Button 
              type="submit" 
              disabled={loading}
              className="px-6 bg-blue-600 hover:bg-blue-700 text-white transition-colors"
            >
              {loading ? (
                <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Saving...</>
              ) : (
                <>Save Expert</>
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}