"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { Briefcase, Phone, Mail, MapPin } from "lucide-react"
import { FaLinkedin } from 'react-icons/fa'

interface ExpertModalProps {
  expert: {
    id: string
    fullName: string
    email: string
    phone: string
    linkedIn: string
    isFormer: boolean
    countryOfResidence: string
    career: Array<{
      title: string
      company_name: string
      dateRange: string
    }>
    projects: Array<{
      projectId: string
      projectName: string
    }> | null
  } | null
  pipeline: string[]; // Array of project names in the pipeline
  published: string[]; // Array of published project names
  projects: string[]; // Correct type: Array of project names (strings)
  isOpen: boolean
  onClose: () => void
  onAddToProject: () => void
}

interface Expert {
  id: string;
  fullName: string;
  industry: string;
  countryOfResidence: string;
  expertCost: number;
  email: string;
  phone: string;
  isFormer: boolean;
  linkedIn: string;
  career: Array<{
    title: string;
    company_name: string;
    dateRange: string;
  }>;
  pipeline: string[]; // Array of project names in the pipeline
  published: string[]; // Array of published project names
  projects: string[]; // Correct type: Array of project names (strings)
}


export function ExpertModal({ expert, isOpen, onClose, onAddToProject }: ExpertModalProps) {
  const [activeTab, setActiveTab] = useState<"career" | "projects">("career");

  if (!expert) return null;

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
            <span className="text-xl font-semibold">{expert.fullName}</span>
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6 px-6">
          {/* Contact Info */}
          <div className="grid grid-cols-2 gap-4 rounded-lg border bg-secondary/5 p-4">
            {[ 
              { icon: Mail, text: expert.email },
              { icon: Phone, text: expert.phone },
              { icon: FaLinkedin, text: expert.linkedIn, isLink: true },
              { icon: MapPin, text: expert.countryOfResidence }
            ].map((item, index) => (
              <div
                key={index}
                className="flex items-center gap-2 group cursor-pointer transition-all hover:bg-secondary/10 p-2 rounded"
              >
                <item.icon className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-all" />
                {item.isLink ? (
                  <a href={item.text} target="_blank" className="text-sm group-hover:text-primary transition-all">{item.text}</a>
                ) : (
                  <span className="text-sm group-hover:text-primary transition-all">{item.text}</span>
                )}
              </div>
            ))}
          </div>

          {/* Tab Buttons */}
          <div className="flex gap-6 border-b">
            {["career", "projects"].map((tab) => (
              <button
                key={tab}
                className={`relative pb-2 px-4 text-sm transition-all ${activeTab === tab ? "text-blue-600 font-semibold border-b-2 border-blue-600" : "text-muted-foreground hover:text-primary"}`}
                onClick={() => setActiveTab(tab as "career" | "projects")}
              >
                {tab.charAt(0).toUpperCase() + tab.slice(1)}
              </button>
            ))}
          </div>
        </div>

        <div className="flex-1 overflow-y-auto px-6 dialog-content">
          {/* Career Tab */}
          {activeTab === "career" && (
            <div className="space-y-4">
              {expert.career.length > 0 ? (
                expert.career.map((job, index) => (
                  <div
                    key={index}
                    className="flex items-start justify-between gap-3 p-2 rounded-lg transition-all hover:bg-secondary/10 cursor-pointer group"
                  >
                    <div className="flex items-start gap-3">
                      <Briefcase className="h-4 w-4 mt-1 text-muted-foreground group-hover:text-primary transition-all" />
                      <div>
                        <div className="font-medium group-hover:text-primary transition-all">{job.title}</div>
                        <div className="text-sm text-muted-foreground group-hover:text-muted-foreground/80 transition-all">{job.company_name}</div>
                        <div className="text-xs text-muted-foreground group-hover:text-muted-foreground/60 transition-all">{job.dateRange}</div>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <p>No career data available for this expert.</p>
              )}
            </div>
          )}

          {/* Projects Tab */}
          {activeTab === "projects" && (
            <div className="space-y-3">
              {expert.projects && expert.projects.length > 0 ? (
                expert.projects.map((project, index) => (
                  <div key={index} className="flex items-center gap-2">
                    <Briefcase className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-all" />
                    <span className="text-sm group-hover:text-primary">{project.projectName}</span> {/* Render project names */}
                  </div>
                ))
              ) : (
                <p>No projects assigned to this expert.</p>
              )}
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
  );
}
