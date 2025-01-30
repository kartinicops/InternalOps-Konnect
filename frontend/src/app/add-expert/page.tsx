'use client'

import { useState } from 'react'
import { UserPlus } from 'lucide-react'
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card"

export default function AddExpertPage() {
  const [isRecordingAgreed, setIsRecordingAgreed] = useState(false)

  return (
    <div className="container mx-auto py-8 px-4">
      <Card className="max-w-3xl mx-auto">
        <CardHeader>
          <div className="flex items-center space-x-4">
            <div className="p-2 bg-blue-100 rounded-full">
              <UserPlus className="h-6 w-6 text-blue-600" />
            </div>
            <div>
              <CardTitle>Add New Expert</CardTitle>
              <CardDescription>Create a new expert profile with their professional details</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="email" placeholder="expert@example.com" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="phone">Phone</Label>
              <Input id="phone" type="tel" placeholder="+1 (555) 000-0000" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="timezone">Timezone</Label>
              <Input id="timezone" placeholder="UTC+0" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="linkedin">LinkedIn URL</Label>
              <Input id="linkedin" type="url" placeholder="https://linkedin.com/in/username" />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="biography">Expert Biography</Label>
            <div className="border rounded-md p-2 bg-white space-y-2">
              <div className="flex items-center space-x-2 border-b pb-2">
                <Button variant="ghost" size="sm" className="h-8">B</Button>
                <Button variant="ghost" size="sm" className="h-8">I</Button>
                <Button variant="ghost" size="sm" className="h-8">U</Button>
                <div className="h-4 w-px bg-gray-200" />
                <Button variant="ghost" size="sm" className="h-8">
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4">
                    <path fillRule="evenodd" d="M2 4.75A.75.75 0 012.75 4h14.5a.75.75 0 010 1.5H2.75A.75.75 0 012 4.75zm0 10.5a.75.75 0 01.75-.75h14.5a.75.75 0 010 1.5H2.75a.75.75 0 01-.75-.75zM2 10a.75.75 0 01.75-.75h7.5a.75.75 0 010 1.5h-7.5A.75.75 0 012 10z" clipRule="evenodd" />
                  </svg>
                </Button>
              </div>
              <Textarea 
                id="biography" 
                className="border-0 focus-visible:ring-0 resize-none" 
                rows={6}
                placeholder="Write the expert's biography and experience here..."
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="regions">Regional Knowledge</Label>
            <Input 
              id="regions" 
              placeholder="Select relevant geographies" 
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="rate">Hourly Rate (€/hour)</Label>
            <Input 
              id="rate" 
              type="number" 
              min="0"
              step="0.01"
              placeholder="100.00"
              className="max-w-[200px]"
            />
          </div>

          <div className="flex items-center space-x-2">
            <input
              type="checkbox"
              id="recording-consent"
              className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-600"
              checked={isRecordingAgreed}
              onChange={(e) => setIsRecordingAgreed(e.target.checked)}
            />
            <Label htmlFor="recording-consent" className="text-sm text-gray-600">
              Expert agrees to being recorded
            </Label>
          </div>
        </CardContent>
        <CardFooter className="flex justify-end space-x-4">
          <Button variant="outline">Cancel</Button>
          <Button className="bg-blue-600 text-white hover:bg-blue-700">
            Create Expert Profile
          </Button>
        </CardFooter>
      </Card>
    </div>
  )
}