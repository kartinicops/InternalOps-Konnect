"use client"

import { useState } from 'react'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Switch } from "@/components/ui/switch"
import { Bold, Italic, Underline, LinkIcon, List, ListOrdered, AlignLeft, AlignCenter, AlignRight, Table, Image, Code, HelpCircle, Eye, EyeOff } from 'lucide-react'

export default function SendEmail() {
  const [emailContent, setEmailContent] = useState(`Hi XXX,

This is regarding the consultation on the XXX space.

Consultation terms:
1. Your current employment status is employed at XXX
2. If your current employment is incomplete or inaccurate, do not proceed with any consultation and please let us know immediately.
3. You will be compensated at the rate of XXX USD/hour, which will be pro-rated based on the amount of time spent with the Client in the Consultation.
4. You confirm your agreement to our Privacy Policy which sets our personal information collection and sharing practices.
5. You accept and will continue to comply with the Konnect Expert Terms and Conditions.

If you agree to and confirm the above consultation and compliance terms, please click the "Confirm" button below.

Let me know if you have any questions. Thank you.

Best regards,
Konnect Legal & Compliance Team
Mobile: (+62) 813-1041-1582
Website: https://www.konnect.co.id
----------------------------------------`)
  const [isPreviewMode, setIsPreviewMode] = useState(false)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    // Handle email submission
  }

  const toolbarButtons = [
    { icon: Bold, label: "Bold" },
    { icon: Italic, label: "Italic" },
    { icon: Underline, label: "Underline" },
    { icon: LinkIcon, label: "Insert link" },
    { icon: List, label: "Bullet list" },
    { icon: ListOrdered, label: "Numbered list" },
    { icon: AlignLeft, label: "Align left" },
    { icon: AlignCenter, label: "Align center" },
    { icon: AlignRight, label: "Align right" },
    { icon: Table, label: "Insert table" },
    { icon: Image, label: "Insert image" },
    { icon: Code, label: "Insert code" },
  ]

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 p-4 md:p-8">
      <Card className="mx-auto max-w-4xl shadow-lg">
        <CardHeader className="bg-primary text-primary-foreground">
          <CardTitle className="text-2xl font-bold">Compose Email</CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-4">
              <div className="grid gap-2">
                <Label htmlFor="to" className="text-sm font-medium">To:</Label>
                <Input id="to" type="email" required className="border-gray-300" />
              </div>
              
              <div className="grid gap-2">
                <Label htmlFor="subject" className="text-sm font-medium">Subject:</Label>
                <Input 
                  id="subject" 
                  defaultValue="Konnect Confirmation of Interest"
                  required 
                  className="border-gray-300"
                />
              </div>

              <div className="grid gap-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="message" className="text-sm font-medium">Message:</Label>
                  <div className="flex items-center space-x-2">
                    <Switch
                      id="preview-mode"
                      checked={isPreviewMode}
                      onCheckedChange={setIsPreviewMode}
                    />
                    <Label htmlFor="preview-mode" className="text-sm">
                      {isPreviewMode ? 'Preview' : 'Edit'}
                    </Label>
                  </div>
                </div>
                <Card className="overflow-hidden">
                  {!isPreviewMode && (
                    <div className="flex flex-wrap items-center gap-1 border-b p-2 bg-gray-50">
                      {toolbarButtons.map((button, index) => (
                        <Button key={index} variant="ghost" size="sm" className="h-8 w-8 p-0" title={button.label}>
                          <button.icon className="h-4 w-4" />
                        </Button>
                      ))}
                      <Button variant="ghost" size="sm" className="h-8 w-8 p-0" title="Help">
                        <HelpCircle className="h-4 w-4" />
                      </Button>
                    </div>
                  )}
                  <Tabs defaultValue="edit" className="w-full">
                    <TabsList className="hidden">
                      <TabsTrigger value="edit">Edit</TabsTrigger>
                      <TabsTrigger value="preview">Preview</TabsTrigger>
                    </TabsList>
                    <TabsContent value="edit" className={isPreviewMode ? 'hidden' : ''}>
                      <textarea
                        className="min-h-[400px] w-full resize-y border-0 bg-transparent p-3 text-sm focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50"
                        value={emailContent}
                        onChange={(e) => setEmailContent(e.target.value)}
                      />
                    </TabsContent>
                    <TabsContent value="preview" className={!isPreviewMode ? 'hidden' : ''}>
                      <div className="min-h-[400px] w-full p-3 text-sm whitespace-pre-wrap">
                        {emailContent}
                      </div>
                    </TabsContent>
                  </Tabs>
                </Card>
                <div className="text-sm text-gray-500 flex justify-between items-center mt-2">
                  <span>Character count: {emailContent.length}</span>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => setIsPreviewMode(!isPreviewMode)}
                    className="text-primary"
                  >
                    {isPreviewMode ? <EyeOff className="h-4 w-4 mr-2" /> : <Eye className="h-4 w-4 mr-2" />}
                    {isPreviewMode ? 'Edit' : 'Preview'}
                  </Button>
                </div>
              </div>
            </div>

            <div className="flex justify-end space-x-4">
              <Button variant="outline" type="button">
                Save Draft
              </Button>
              <Button type="submit" className="bg-primary text-primary-foreground hover:bg-primary/90">
                Send Email
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}