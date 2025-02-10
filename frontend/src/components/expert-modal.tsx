"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { Star, Briefcase, Phone, Mail, Globe, MapPin } from "lucide-react"

interface ExpertModalProps {
  expert: {
    id: string
    title: string
    company: string
    dateRange: string
    lastPublished: string
    projects: number
    calls: number
    isFormer: boolean
    email: string
    phone: string
    timezone: string
    location: string
    career: Array<{
      title: string
      company: string
      dateRange: string
    }>
    projects: Array<{
      name: string
      status: string
      rating: number
    }>
  } | null
  isOpen: boolean
  onClose: () => void
  onAddToProject: () => void
}

export function ExpertModal({ expert, isOpen, onClose, onAddToProject }: ExpertModalProps) {
  const [activeTab, setActiveTab] = useState<"career" | "projects">("career")

  if (!expert) return null

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl h-[80vh] bg-white flex flex-col">
        <DialogHeader className="space-y-1 p-6 pb-2">
          <DialogTitle className="flex items-start gap-2">
            {expert.isFormer && (
              <Badge
                variant="secondary"
                className="h-5 rounded text-xs font-normal transition-all hover:bg-secondary/80"
              >
                Former
              </Badge>
            )}
            <span className="text-xl font-semibold">{expert.title}</span>
          </DialogTitle>
          <div className="text-base font-medium text-muted-foreground">{expert.company}</div>
        </DialogHeader>

        <div className="space-y-6 px-6">
          {/* Contact Info */}
          <div className="grid grid-cols-2 gap-4 rounded-lg border bg-secondary/5 p-4">
            {[
              { icon: Mail, text: expert.email },
              { icon: Phone, text: expert.phone },
              { icon: Globe, text: expert.timezone },
              { icon: MapPin, text: expert.location },
            ].map((item, index) => (
              <div
                key={index}
                className="flex items-center gap-2 group cursor-pointer transition-all hover:bg-secondary/10 p-2 rounded"
              >
                <item.icon className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-all" />
                <span className="text-sm group-hover:text-primary transition-all">{item.text}</span>
              </div>
            ))}
          </div>

          {/* Tab Buttons */}
          <div className="flex gap-6 border-b">
            {["career", "projects"].map((tab) => (
              <button
                key={tab}
                className={`relative pb-2 px-4 text-sm transition-all ${
                  activeTab === tab
                    ? "text-blue-600 font-semibold border-b-2 border-blue-600"
                    : "text-muted-foreground hover:text-primary"
                }`}
                onClick={() => setActiveTab(tab as "career" | "projects")}
              >
                {tab.charAt(0).toUpperCase() + tab.slice(1)}
              </button>
            ))}
          </div>
        </div>

        <div className="flex-1 overflow-y-auto px-6 dialog-content">
          {activeTab === "career" && (
            <div className="space-y-4">
              {expert.career.map((job, index) => (
                <div
                  key={index}
                  className="flex items-start justify-between gap-3 p-2 rounded-lg transition-all hover:bg-secondary/10 cursor-pointer group"
                >
                  <div className="flex items-start gap-3">
                    <Briefcase className="h-4 w-4 mt-1 text-muted-foreground group-hover:text-primary transition-all" />
                    <div>
                      <div className="font-medium group-hover:text-primary transition-all">{job.title}</div>
                      <div className="text-sm text-muted-foreground group-hover:text-muted-foreground/80 transition-all">
                        {job.company}
                      </div>
                    </div>
                  </div>
                  <div className="text-sm text-muted-foreground group-hover:text-muted-foreground/80 transition-all text-right">
                    {job.dateRange}
                  </div>
                </div>
              ))}
            </div>
          )}

          {activeTab === "projects" && (
            <div className="space-y-3">
              {expert.projects.map((project, index) => (
                <div
                  key={index}
                  className="rounded-lg border p-3 transition-all hover:border-primary hover:bg-secondary/5 cursor-pointer"
                >
                  <div className="font-medium group-hover:text-primary transition-all">{project.name}</div>
                  <div className="mt-2 flex items-center justify-between text-sm">
                    <Badge variant="secondary" className="transition-all hover:bg-secondary/80">
                      {project.status}
                    </Badge>
                    <div className="flex items-center gap-0.5">
                      {[...Array(5)].map((_, i) => (
                        <Star
                          key={i}
                          className={`h-4 w-4 transition-all ${
                            i < project.rating
                              ? "text-yellow-400 hover:text-yellow-500"
                              : "text-gray-200 hover:text-gray-300"
                          }`}
                          fill="currentColor"
                        />
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <Separator className="my-1" />

        {/* Footer Buttons */}
        <div className="flex justify-end p-2 space-x-2">
          <Button
            variant="outline"
            onClick={onClose}
            className="transition-all hover:bg-blue-100 hover:text-primary hover:border-primary"
          >
            Close
          </Button>

          <Button className="transition-all hover:bg-blue-100 hover:shadow-md" onClick={onAddToProject}>
            <Briefcase className="mr-2 h-4 w-4" />
            Add to Project
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}