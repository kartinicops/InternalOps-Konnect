'use client'

import { Building } from "lucide-react"
import { useState, useEffect, ChangeEvent, FormEvent } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import API from "@/services/api"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Nav } from "@/components/nav"
import { Loader2, Calendar, ArrowLeft, MapPin, Briefcase, Mail, Phone, Plus, X, User } from "lucide-react"
import { ToastContainer, toast } from "react-toastify"
import "react-toastify/dist/ReactToastify.css"
import { FaLinkedin } from 'react-icons/fa'
// Import our custom CountriesSelect component
import { CountriesSelect } from "@/components/countries-select"

// Import the ExpertStatusManager from its own file
import { ExpertStatusManager } from "@/components/expert-status-manager";

export default function EditExpert() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const expertId = searchParams.get("id")
  const projectId = searchParams.get("projectId") // Optional project ID if coming from a project
  
  const [loading, setLoading] = useState<boolean>(true)
  const [saving, setSaving] = useState<boolean>(false)
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    phone: "",
    linkedIn: "",
    industry: "",
    countryOfResidence: "",
    expertCost: 0,
    notes: "",
  })
  
  // Track original experience IDs to detect removed entries for deletion
  const [originalExperienceIds, setOriginalExperienceIds] = useState<number[]>([])
  
  const [careerEntries, setCareerEntries] = useState([
    { title: "", company_name: "", start_date: "", end_date: "", id: Date.now(), experience_id: null }
  ])

  // We don't need publishedData state anymore as the ExpertStatusManager fetches its own data

  // Handle status change function
  const handleStatusChange = (statusData) => {
    console.log("Status/availability changed:", statusData);
    // No need to update local state as the ExpertStatusManager handles its own state
    // We just need this for notification purposes
  };

  // Fetch the expert data on component mount
  useEffect(() => {
    const fetchExpertData = async () => {
      if (!expertId) {
        toast.error("No expert ID provided")
        router.push("/experts")
        return
      }

      try {
        // Fetch expert details
        const expertResponse = await API.get(`/experts/${expertId}`)
        const expertData = expertResponse.data

        // Set form data
        setFormData({
          fullName: expertData.full_name,
          email: expertData.email,
          phone: expertData.phone_number || "",
          linkedIn: expertData.linkedIn_profile_link || "",
          industry: expertData.industry,
          countryOfResidence: expertData.country_of_residence,
          expertCost: expertData.expert_cost,
          notes: expertData.notes || "", 
        })

        // Fetch expert experiences
        const experiencesResponse = await API.get(`/expert_experiences/?expert_id=${expertId}/`)
        const experiencesData = experiencesResponse.data
        
        // Filter experiences to only include those belonging to this expert
        const expertExperiences = experiencesData.filter(exp => exp.expert_id.toString() === expertId.toString())
        
        if (expertExperiences.length > 0) {
          // Store original experience IDs for tracking deletions
          const expIds = expertExperiences.map(exp => exp.experience_id)
          setOriginalExperienceIds(expIds)
          
          // Map experiences to our state format - keeping the MM-YYYY format from API
          const formattedExperiences = expertExperiences.map(exp => {
            return {
              title: exp.title,
              company_name: exp.company_name,
              // Keep original format (MM-YYYY) from API
              start_date: exp.start_date || "",
              end_date: exp.end_date || "",
              id: Date.now() + Math.random(),
              experience_id: exp.experience_id
            };
          });
          setCareerEntries(formattedExperiences)
        } else {
          // If no experiences found for this expert, initialize with one empty entry
          setCareerEntries([
            { title: "", company_name: "", start_date: "", end_date: "", id: Date.now(), experience_id: null }
          ])
        }
      } catch (error) {
        console.error("Error fetching expert data:", error)
        toast.error("Failed to load expert data")
      } finally {
        setLoading(false)
      }
    }

    fetchExpertData()
  }, [expertId, router])

  // This will handle the back button navigation
  const handleBack = () => {
    if (projectId) {
      router.push(`/projects/project-detail?id=${projectId}&tab=experts`)
    } else {
      router.push("/experts")
    }
  }

  const handleInputChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { id, value, type } = e.target
    
    setFormData(prev => ({ 
      ...prev, 
      [id]: type === "number" ? parseFloat(value) : value 
    }))
  }

  const handleSelectChange = (name: string, value: string) => {
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  // Date validation helper for MM-YYYY format
  const isValidDateFormat = (dateString: string): boolean => {
    if (!dateString) return true; // Empty is valid (for end date)
    
    // Validate MM-YYYY format
    const regex = /^(0[1-9]|1[0-2])-\d{4}$/;
    if (!regex.test(dateString)) return false;
    
    // Extract month and year
    const [month, year] = dateString.split('-').map(Number);
    
    // Validate month and year range
    return month >= 1 && month <= 12 && year >= 1900 && year <= new Date().getFullYear();
  }

  const handleCareerChange = (index: number, field: string, value: string) => {
    const updatedEntries = [...careerEntries];
    
    // Special validation for date fields
    if ((field === "start_date" || field === "end_date")) {
      // Allow typing as the user enters the date
      updatedEntries[index] = { ...updatedEntries[index], [field]: value };
    } else {
      updatedEntries[index] = { ...updatedEntries[index], [field]: value };
    }
    
    setCareerEntries(updatedEntries);
  }

  const addCareerEntry = () => {
    // Limit to a maximum of 5 entries
    if (careerEntries.length >= 5) {
      toast.info("Maximum of 5 positions allowed")
      return
    }
    
    // Use functional state update with unique ID
    setCareerEntries(prevEntries => [
      ...prevEntries, 
      { 
        title: "", 
        company_name: "", 
        start_date: "", 
        end_date: "",
        id: Date.now(), // Add a unique identifier
        experience_id: null // New entry - no server ID yet
      }
    ])
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
    setSaving(true)
  
    // Basic validation
    if (!formData.fullName || !formData.email || !formData.industry || !formData.countryOfResidence) {
      toast.error("Please fill in all required fields")
      setSaving(false)
      return
    }
  
    // Validate career entries including date format
    const invalidDates = careerEntries.some(entry => 
      (entry.start_date && !isValidDateFormat(entry.start_date)) || 
      (entry.end_date && !isValidDateFormat(entry.end_date))
    );
    
    if (invalidDates) {
      toast.error("Please use MM-YYYY format for all dates (e.g. 01-2020)")
      setSaving(false)
      return
    }
    
    // Validate at least one valid career entry
    const validCareerEntries = careerEntries.filter(entry => 
      entry.title.trim() && entry.company_name.trim() && entry.start_date
    )
  
    if (validCareerEntries.length === 0) {
      toast.error("Please add at least one valid career entry")
      setSaving(false)
      return
    }
  
    try {
      // Update expert data
      await API.put(`/experts/${expertId}/`, { // Added trailing slash
        full_name: formData.fullName,
        email: formData.email,
        phone_number: formData.phone || null,
        linkedIn_profile_link: formData.linkedIn || null,
        industry: formData.industry,
        country_of_residence: formData.countryOfResidence,
        expert_cost: formData.expertCost,
        notes: formData.notes || null,
      })
  
      // Process career entries
      
      // 1. Find experience IDs that need to be deleted (were in original list but not in current list)
      const currentExperienceIds = careerEntries
        .filter(entry => entry.experience_id !== null)
        .map(entry => entry.experience_id)
      
      const experienceIdsToDelete = originalExperienceIds.filter(
        id => !currentExperienceIds.includes(id)
      )
      
      // 2. Delete removed experiences
      const deletePromises = experienceIdsToDelete.map(id => 
        API.delete(`/expert_experiences/${id}/`)
      )
      
      await Promise.all(deletePromises)
      
      // 3. Update existing and create new entries
      const careerPromises = careerEntries.map(async entry => {
        // Send dates in the MM-YYYY format 
        const entryData = {
          expert_id: expertId,
          title: entry.title,
          company_name: entry.company_name,
          start_date: entry.start_date,
          end_date: entry.end_date || null,
        };

        if (entry.experience_id) {
          // Update existing entry
          return API.put(`/expert_experiences/${entry.experience_id}/`, entryData)
        } else {
          // Create new entry
          return API.post("/expert_experiences/", entryData)
        }
      })
  
      // Wait for all career entry operations to complete
      await Promise.all(careerPromises)
  
      toast.success("Expert successfully updated!")
      
      // Redirect after success
      setTimeout(() => {
        if (projectId) {
          router.push(`/projects/project-detail?id=${projectId}&tab=experts`)
        } else {
          router.push("/experts")
        }
      }, 2000)
  
    } catch (error: any) {
      console.error("Error updating expert:", error)
      
      // Handle specific errors
      if (error.response) {
        if (error.response.status === 400 && error.response.data.message?.includes('email')) {
          toast.error("An expert with this email already exists")
        } else {
          const errorMessage = error.response.data.message || 
            "Failed to update expert. Please try again."
          toast.error(errorMessage)
        }
      } else if (error.request) {
        toast.error("No response from server. Please check your connection.")
      } else {
        toast.error("An unexpected error occurred.")
      }
    } finally {
      setSaving(false)
    }
  }

  // Show loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-white to-gray-50 flex items-center justify-center">
        <Nav />
        <div className="flex flex-col items-center">
          <Loader2 className="h-12 w-12 text-blue-600 animate-spin mb-4" />
          <p className="text-lg text-gray-600">Loading expert data...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-white to-gray-50">
      <Nav />
      <ToastContainer theme="colored" />
      
      <div className="container mx-auto py-8 px-4 max-w-5xl">
        <div className="flex items-center mb-8">
          <Button variant="ghost" onClick={handleBack} className="mr-4 text-blue-600 hover:text-blue-800 hover:bg-blue-50/50 rounded-full">
            <ArrowLeft className="h-4 w-4 mr-1" />Back
          </Button>
          <h1 className="text-3xl font-bold text-blue-600">
            Edit Expert
          </h1>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">

          {/* Personal Information Card */}
          <Card className="shadow-sm border border-gray-100 overflow-hidden rounded-xl bg-gradient-to-br from-white to-blue-50">
            <CardHeader className="bg-white border-b border-gray-100 py-4 px-6">
              <CardTitle className="text-lg font-semibold text-gray-800 flex items-center">
                <div className="w-1 h-5 bg-blue-600 mr-3 rounded-full"></div>
                <User className="h-4 w-4 mr-2 text-blue-600" />Personal Information
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6 relative">
              {/* Background decorative elements */}
              <div className="absolute top-0 right-0 w-64 h-64 bg-blue-100 rounded-full opacity-20 -mr-20 -mt-20"></div>
              <div className="absolute bottom-0 left-0 w-48 h-48 bg-blue-200 rounded-full opacity-10 -ml-16 -mb-16"></div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5 relative z-10">
                <div className="space-y-2 group">
                  <Label htmlFor="fullName" className="text-sm font-medium text-gray-700 flex items-center gap-2 group-hover:text-blue-600 transition-colors">
                    <User className="h-3.5 w-3.5 text-gray-500 group-hover:text-blue-500 transition-colors" /> Full Name <span className="text-red-500">*</span>
                  </Label>
                  <div className="relative">
                    <Input 
                      id="fullName" 
                      value={formData.fullName}
                      onChange={handleInputChange}
                      placeholder="Jane Doe"
                      required
                      className="bg-white h-10 rounded-lg pl-9 text-sm focus:ring-blue-200 shadow-sm hover:shadow-md transition-shadow"
                    />
                    <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  </div>
                </div>
                
                <div className="space-y-2 group">
                  <Label htmlFor="email" className="text-sm font-medium text-gray-700 flex items-center gap-2 group-hover:text-blue-600 transition-colors">
                    <Mail className="h-3.5 w-3.5 text-gray-500 group-hover:text-blue-500 transition-colors" /> Email <span className="text-red-500">*</span>
                  </Label>
                  <div className="relative">
                    <Input 
                      id="email" 
                      type="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      placeholder="jane.doe@example.com"
                      required
                      className="bg-white h-10 rounded-lg pl-9 text-sm focus:ring-blue-200 shadow-sm hover:shadow-md transition-shadow"
                    />
                    <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  </div>
                </div>
                
                <div className="space-y-2 group">
                  <Label htmlFor="phone" className="text-sm font-medium text-gray-700 flex items-center gap-2 group-hover:text-blue-600 transition-colors">
                    <Phone className="h-3.5 w-3.5 text-gray-500 group-hover:text-blue-500 transition-colors" /> Phone Number
                  </Label>
                  <div className="relative">
                    <Input 
                      id="phone" 
                      value={formData.phone}
                      onChange={handleInputChange}
                      placeholder="+1 123 456 7890"
                      className="bg-white h-10 rounded-lg pl-9 text-sm focus:ring-blue-200 shadow-sm hover:shadow-md transition-shadow"
                    />
                    <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  </div>
                </div>
                
                <div className="space-y-2 group">
                  <Label htmlFor="linkedIn" className="text-sm font-medium text-gray-700 flex items-center gap-2 group-hover:text-blue-600 transition-colors">
                    <FaLinkedin className="h-3.5 w-3.5 text-gray-500 group-hover:text-blue-500 transition-colors" /> LinkedIn Profile
                  </Label>
                  <div className="relative">
                    <Input 
                      id="linkedIn" 
                      value={formData.linkedIn}
                      onChange={handleInputChange}
                      placeholder="https://linkedin.com/in/janedoe"
                      className="bg-white h-10 rounded-lg pl-9 text-sm focus:ring-blue-200 shadow-sm hover:shadow-md transition-shadow"
                    />
                    <FaLinkedin className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  </div>
                </div>
                
                {/* Biography field - full width across both columns */}
                <div className="space-y-2 group md:col-span-2">
                  <Label htmlFor="notes" className="text-sm font-medium text-gray-700 flex items-center gap-2 group-hover:text-blue-600 transition-colors">
                  <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="h-4 w-4 mr-2 text-blue-600"
                >
                  <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                  <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
                </svg>
                    Biography
                  </Label>
                  <div className="relative">
                    <textarea
                      id="notes"
                      value={formData.notes}
                      onChange={handleInputChange}
                      placeholder="Enter expert biography or additional notes..."
                      className="w-full min-h-[120px] bg-white rounded-lg p-3 pl-3 text-sm focus:ring-blue-200 shadow-sm hover:shadow-md transition-shadow resize-y border border-gray-300 focus:border-blue-300 focus:outline-none"
                    />
                    {/* <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="16"
                      height="16"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className="absolute left-3 top-3 h-4 w-4 text-gray-400"
                    >
                      <line x1="8" y1="6" x2="21" y2="6"></line>
                      <line x1="8" y1="12" x2="21" y2="12"></line>
                      <line x1="8" y1="18" x2="21" y2="18"></line>
                      <line x1="3" y1="6" x2="3.01" y2="6"></line>
                      <line x1="3" y1="12" x2="3.01" y2="12"></line>
                      <line x1="3" y1="18" x2="3.01" y2="18"></line>
                    </svg> */}
                  </div>
                  <p className="text-xs text-gray-500 ml-1">Provide a short biography or any additional information about the expert</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          {/* Professional Information Card */}
          <Card className="shadow-sm border border-gray-100 overflow-hidden rounded-xl bg-gradient-to-br from-white to-blue-50">
            <CardHeader className="bg-white border-b border-gray-100 py-4 px-6">
              <CardTitle className="text-lg font-semibold text-gray-800 flex items-center">
                <div className="w-1 h-5 bg-blue-600 mr-3 rounded-full"></div>
                <Briefcase className="h-4 w-4 mr-2 text-blue-600" />
                <span>Professional Information</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6 relative">
              {/* Background decorative elements */}
              <div className="absolute top-0 right-0 w-64 h-64 bg-blue-100 rounded-full opacity-20 -mr-20 -mt-20"></div>
              <div className="absolute bottom-0 left-0 w-48 h-48 bg-blue-200 rounded-full opacity-10 -ml-16 -mb-16"></div>
              
              {/* Main content with elevation */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5 relative z-10">
                {/* Industry field */}
                <div className="space-y-2 group">
                  <Label 
                    htmlFor="industry" 
                    className="text-sm font-medium text-gray-700 flex items-center gap-2 group-hover:text-blue-600 transition-colors"
                  >
                    <Briefcase className="h-3.5 w-3.5 text-gray-500 group-hover:text-blue-500 transition-colors" /> 
                    Industry
                    <span className="text-red-500">*</span>
                  </Label>
                  <div className="relative">
                    <Input 
                      id="industry" 
                      value={formData.industry}
                      onChange={handleInputChange}
                      placeholder="Enter industry"
                      required
                      className="bg-white h-10 rounded-lg pl-9 text-sm focus:ring-blue-200 shadow-sm hover:shadow-md transition-shadow"
                    />
                    <Briefcase className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  </div>
                  <p className="text-xs text-gray-500 ml-1">Specify the expert's primary industry</p>
                </div>
                
                {/* Country of Residence with custom component - SMALLER HEIGHT */}
                <div className="space-y-2 group">
                  <Label 
                    htmlFor="countryOfResidence" 
                    className="text-sm font-medium text-gray-700 flex items-center gap-2 group-hover:text-blue-600 transition-colors"
                  >
                    <MapPin className="h-3.5 w-3.5 text-gray-500 group-hover:text-blue-500 transition-colors" /> 
                    Country of Residence
                    <span className="text-red-500">*</span>
                  </Label>
                  <div className="h-10"> {/* Fixed height container for CountrySelect */}
                    <style jsx global>{`
                      /* Override for CountriesSelect component to make it smaller */
                      div[role="combobox"] {
                        height: 40px !important;
                        max-height: 40px !important;
                        min-height: 40px !important;
                      }
                      /* Adjust the inner content vertical alignment */
                      div[role="combobox"] > div {
                        display: flex;
                        align-items: center;
                        height: 100%;
                      }
                    `}</style>
                    <CountriesSelect
                      value={formData.countryOfResidence}
                      onChange={(value) => handleSelectChange("countryOfResidence", value)}
                      required={true}
                    />
                  </div>
                  <p className="text-xs text-gray-500 ml-1">Select the expert's current country of residence</p>
                </div>
                
                {/* Expert Cost */}
                <div className="space-y-2 group md:col-span-1">
                  <Label 
                    htmlFor="expertCost" 
                    className="text-sm font-medium text-gray-700 flex items-center gap-2 group-hover:text-blue-600 transition-colors"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-gray-500 group-hover:text-blue-500 transition-colors">
                      <path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
                    </svg>
                    Expert Cost (USD)
                    <span className="text-red-500">*</span>
                  </Label>
                  <div className="relative">
                    <Input 
                      id="expertCost" 
                      type="number"
                      value={formData.expertCost}
                      onChange={handleInputChange}
                      placeholder="150"
                      min="0"
                      required
                      className="bg-white h-10 rounded-lg pl-7 text-sm focus:ring-blue-200 shadow-sm hover:shadow-md transition-shadow"
                    />
                    <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 font-medium text-sm">$</span>
                  </div>
                  <p className="text-xs text-gray-500 ml-1">Hourly rate in USD</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          {/* Career History Card */}
          <Card className="shadow-sm border border-gray-100 overflow-hidden rounded-xl bg-gradient-to-br from-white to-blue-50 group">
            <CardHeader className="bg-white border-b border-gray-100 py-4 px-6 group-hover:bg-blue-50/50 transition-colors">
              <CardTitle className="text-lg font-semibold text-gray-800 flex items-center justify-between">
                <div className="flex items-center">
                  <div className="w-1 h-5 bg-blue-600 mr-3 rounded-full"></div>
                  <Briefcase className="h-4 w-4 mr-2 text-blue-600 group-hover:text-blue-500 transition-colors" />
                  Career History
                </div>
                <Button 
                  type="button" 
                  onClick={addCareerEntry}
                  className="bg-blue-600 hover:bg-blue-700 text-white flex items-center gap-1 py-1 h-8 px-3 text-xs rounded-lg z-20 relative"
                  disabled={careerEntries.length >= 5}
                >
                  <Plus className="h-3.5 w-3.5" />
                  Add Position
                  {careerEntries.length >= 5 && (
                    <span className="ml-1 text-xs text-blue-200">(Max 5)</span>
                  )}
                </Button>
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6 relative">
              {/* Background decorative elements */}
              <div className="absolute top-0 right-0 w-64 h-64 bg-blue-100 rounded-full opacity-20 -mr-20 -mt-20 z-0"></div>
              <div className="absolute bottom-0 left-0 w-48 h-48 bg-blue-200 rounded-full opacity-10 -ml-16 -mb-16 z-0"></div>
              
              <div className="relative z-10 space-y-4">
                {careerEntries.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-8 text-center">
                    <Briefcase className="h-8 w-8 text-gray-300 mb-2" />
                    <p className="text-gray-500">No positions added yet</p>
                    <Button 
                      type="button" 
                      onClick={addCareerEntry}
                      variant="ghost"
                      className="mt-4 text-blue-600 hover:text-blue-700 hover:bg-blue-50 z-20 relative"
                    >
                      <Plus className="h-4 w-4 mr-1" />
                      Add First Position
                    </Button>
                  </div>
                ) : (
                  careerEntries.map((entry, index) => (
                    <div key={entry.id} className="border border-gray-200 bg-white/80 backdrop-blur-sm rounded-lg p-4 space-y-4 hover:border-blue-400 transition-colors shadow-sm hover:shadow-md">
                      <div className="flex justify-between items-center">
                        <h3 className="text-sm font-medium text-blue-600 flex items-center gap-2">
                          <Briefcase className="h-3.5 w-3.5" />
                          Position {index + 1}
                          {index === 0 && (
                            <span className="text-xs bg-blue-100 text-blue-800 px-2 py-0.5 rounded-full">
                              Current/Most Recent
                            </span>
                          )}
                          {entry.experience_id && (
                            <span className="text-xs bg-green-100 text-green-800 px-2 py-0.5 rounded-full">
                              ID: {entry.experience_id}
                            </span>
                          )}
                        </h3>
                        <Button 
                          type="button" 
                          variant="ghost" 
                          size="sm"
                          onClick={() => removeCareerEntry(index)}
                          className="text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-full h-7 w-7 p-0 z-20 relative"
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor={`title-${index}`} className="text-sm font-medium text-gray-700 flex items-center gap-2">
                            <Briefcase className="h-3.5 w-3.5 text-gray-500" /> Job Title <span className="text-red-500">*</span>
                          </Label>
                          <div className="relative">
                            <Input 
                              id={`title-${index}`}
                              value={entry.title}
                              onChange={(e) => handleCareerChange(index, "title", e.target.value)}
                              placeholder="Senior Manager"
                              required
                              className="bg-white h-10 rounded-lg pl-9 text-sm focus:ring-blue-200 shadow-sm hover:shadow-md transition-shadow"
                            />
                            <Briefcase className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                          </div>
                        </div>
                        
                        <div className="space-y-2">
                          <Label htmlFor={`company-${index}`} className="text-sm font-medium text-gray-700 flex items-center gap-2">
                            <Building className="h-3.5 w-3.5 text-gray-500" /> Company <span className="text-red-500">*</span>
                          </Label>
                          <div className="relative">
                            <Input 
                              id={`company-${index}`}
                              value={entry.company_name}
                              onChange={(e) => handleCareerChange(index, "company_name", e.target.value)}
                              placeholder="Acme Inc."
                              required
                              className="bg-white h-10 rounded-lg pl-9 text-sm focus:ring-blue-200 shadow-sm hover:shadow-md transition-shadow"
                            />
                            <Building className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                          </div>
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor={`start_date-${index}`} className="text-sm font-medium text-gray-700 flex items-center gap-2">
                            <Calendar className="h-3.5 w-3.5 text-gray-500" /> Start Date <span className="text-red-500">*</span>
                          </Label>
                          <div className="relative">
                            <Input 
                              id={`start_date-${index}`}
                              type="text" 
                              value={entry.start_date}
                              onChange={(e) => handleCareerChange(index, "start_date", e.target.value)}
                              placeholder="MM-YYYY"
                              className="bg-white h-10 rounded-lg pl-9 text-sm focus:ring-blue-200 shadow-sm hover:shadow-md transition-shadow"
                            />
                            <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                          </div>
                          <p className="text-xs text-gray-500 ml-1">Format: MM-YYYY (e.g. 01-2020)</p>
                        </div>
                        
                        <div className="space-y-2">
                          <Label htmlFor={`end_date-${index}`} className="text-sm font-medium text-gray-700 flex items-center gap-2">
                            <Calendar className="h-3.5 w-3.5 text-gray-500" /> End Date
                          </Label>
                          <div className="relative">
                            <Input 
                              id={`end_date-${index}`}
                              type="text"
                              value={entry.end_date}
                              onChange={(e) => handleCareerChange(index, "end_date", e.target.value)}
                              placeholder="MM-YYYY"
                              className="bg-white h-10 rounded-lg pl-9 text-sm focus:ring-blue-200 shadow-sm hover:shadow-md transition-shadow"
                            />
                            <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                          </div>
                          <p className="text-xs text-gray-500 ml-1">Leave blank if current position</p>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>

          {/* Expert Status Card - Show for all experts, but filter by projectId if coming from a project */}
          <ExpertStatusManager 
            expertId={expertId}
            projectId={projectId}
            onStatusChange={handleStatusChange}
          />

          {/* Form Actions */}
          <div className="flex justify-end gap-4 pt-4">
            <Button 
              variant="outline" 
              type="button" 
              onClick={handleBack}
              className="h-10 px-5 border-gray-300 text-gray-700 hover:bg-gray-100 transition-colors rounded-lg"
            >
              Cancel
            </Button>
            <Button 
              type="submit" 
              disabled={saving}
              className="h-10 px-5 bg-blue-600 hover:bg-blue-700 text-white transition-colors rounded-lg"
            >
              {saving ? (
                <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Saving...</>
              ) : (
                <>Save Changes</>
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}