import { useState, useEffect } from "react"
import { 
  Dialog, 
  DialogContent,
  DialogTitle 
} from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { Briefcase, Phone, Mail, MapPin, Calendar, Building, FolderOpen, X, FileText } from 'lucide-react'
import { FaLinkedin } from 'react-icons/fa'
import { motion, AnimatePresence } from "framer-motion"

interface ExpertModalProps {
  expert: {
    id: string
    fullName: string
    email: string
    phone: string
    linkedIn: string
    isFormer: boolean
    countryOfResidence: string
    notes: string
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
  pipeline: string[];
  published: string[];
  projects: string[];
  isOpen: boolean
  onClose: () => void
  onAddToProject: () => void
}

export function ExpertModal({ expert, isOpen, onClose, onAddToProject, pipeline, published, projects }: ExpertModalProps) {
  const [activeTab, setActiveTab] = useState<"career" | "projects" | "notes">("career");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    return () => setMounted(false);
  }, []);

  if (!expert) return null;

  // Get initials for the avatar
  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(part => part[0])
      .join('')
      .toUpperCase()
      .substring(0, 2);
  };

  // Helper function to determine expert status
  const isExpertInPipeline = pipeline.includes(expert.id);
  const isExpertPublished = published.includes(expert.id);
  const isExpertInProjects = projects.includes(expert.id);
  const isExpertAssigned = isExpertInPipeline || isExpertPublished || isExpertInProjects;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent 
        closeButton={false} 
        className="max-w-2xl p-0 rounded-lg h-[85vh] overflow-hidden shadow-md border-0 bg-white flex flex-col"
      >
        {/* Accessibility title */}
        <DialogTitle className="sr-only">Expert Profile: {expert.fullName}</DialogTitle>
        
        {/* Subtle background gradient */}
        <div className="absolute inset-0 overflow-hidden rounded-xl z-0">
          <div className="absolute bottom-[-30%] left-[-10%] w-[400px] h-[400px] rounded-full bg-blue-100/10 blur-3xl"></div>
        </div>
        
        {/* Close button */}
        <div className="absolute right-5 top-5 z-30">
          <button 
            onClick={() => onClose()}
            className="flex items-center justify-center h-8 w-8 rounded-full bg-white/60 text-blue-600 hover:bg-white hover:text-blue-700 transition-all duration-200"
            aria-label="Close dialog"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Combined profile section - clean modern layout */}
        <div className="relative z-10">
          {/* Header section with all contact info integrated */}
          <div className="px-8 py-8 bg-gradient-to-r from-blue-400 to-blue-300">
            <div className="flex items-start gap-5">
              {/* Avatar with clean styling */}
              <div className="relative">
                <div className="w-16 h-16 rounded-xl bg-white/30 flex items-center justify-center text-white text-2xl font-medium border border-white/30">
                  {getInitials(expert.fullName)}
                </div>
                {expert.isFormer && (
                  <div className="absolute -bottom-2 -right-2">
                    <Badge className="bg-white text-blue-600 border-0 shadow-sm py-0.5 px-2 rounded-full text-xs font-medium">
                      Former
                    </Badge>
                  </div>
                )}
              </div>

              {/* Expert info in clean typography - all contact info integrated here */}
              <div className="flex-1">
                <div className="flex flex-wrap items-center gap-2 mb-1">
                  <h1 className="text-xl font-bold text-white">{expert.fullName}</h1>
                  
                  {isExpertAssigned && (
                    <div className="flex gap-2 items-center">
                      {isExpertPublished ? (
                        <Badge className="bg-green-400/90 text-white border-0 py-0.5 px-2 rounded-full">
                          Published
                        </Badge>
                      ) : (
                        <Badge className="bg-blue-400/90 text-white border-0 py-0.5 px-2 rounded-full">
                          Pipeline
                        </Badge>
                      )}
                    </div>
                  )}
                </div>
                
                {expert.career && expert.career.length > 0 && (
                  <p className="text-sm text-white font-medium mb-3">
                    {expert.career[0].title} at {expert.career[0].company_name}
                  </p>
                )}
                
                {/* Contact information consolidated here */}
                <div className="grid grid-cols-1 gap-2 mt-2">
                  <div className="flex items-center text-white/90">
                    <MapPin className="h-3.5 w-3.5 mr-2" />
                    <span className="text-sm">{expert.countryOfResidence}</span>
                  </div>
                  
                  <div className="flex flex-wrap gap-4">
                    <a 
                      href={`mailto:${expert.email}`}
                      className="flex items-center text-white/90 hover:text-white transition-all"
                    >
                      <Mail className="h-3.5 w-3.5 mr-2" />
                      <span className="text-sm">{expert.email}</span>
                    </a>
                    
                    <a 
                      href={`tel:${expert.phone}`}
                      className="flex items-center text-white/90 hover:text-white transition-all"
                    >
                      <Phone className="h-3.5 w-3.5 mr-2" />
                      <span className="text-sm">{expert.phone}</span>
                    </a>
                    
                    <a 
                      href={expert.linkedIn}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center text-white/90 hover:text-white transition-all"
                    >
                      <FaLinkedin className="h-3.5 w-3.5 mr-2" />
                      <span className="text-sm">LinkedIn</span>
                    </a>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        

        {/* Minimalist tab navigation */}
        <div className="relative px-8 pt-5 z-10">
          <div className="flex border-b border-gray-200">
            {[
              { id: "career", label: "Experience", icon: Briefcase },
              { id: "projects", label: "Projects", icon: FolderOpen },
              { id: "notes", label: "Notes", icon: FileText }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as "career" | "projects" | "notes")}
                className={`
                  flex items-center gap-2 px-4 py-2 transition-all duration-200 border-b-2 -mb-px
                  ${activeTab === tab.id 
                    ? "text-blue-500 border-blue-500" 
                    : "text-gray-500 border-transparent hover:text-blue-400 hover:border-blue-200"}
                `}
              >
                <tab.icon className="h-4 w-4" />
                <span className="font-medium text-sm">{tab.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Content area with clean cards */}
        <div className="relative flex-1 overflow-auto px-8 py-5 z-10">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.2 }}
              className="h-full"
            >
              {/* Career Experience Tab */}
              {activeTab === "career" && (
                <div className="space-y-3">
                  {expert.career.length > 0 ? (
                    <div className="space-y-3">
                      {expert.career.map((job, index) => (
                        <motion.div
                          key={index}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ 
                            opacity: 1, 
                            y: 0,
                            transition: { delay: index * 0.05 }
                          }}
                          className="relative"
                        >
                          <div className="rounded-lg p-4 transition-all duration-200 hover:shadow-md border border-gray-100 bg-white">
                            <div className="flex items-start gap-3">
                              <div className="h-9 w-9 rounded-md bg-blue-100 flex items-center justify-center text-blue-500 flex-shrink-0">
                                <Building className="h-4 w-4" />
                              </div>
                              <div className="flex-1">
                                <div className="flex flex-wrap items-center justify-between gap-2 mb-1">
                                  <h3 className="text-sm font-semibold text-gray-800">{job.title}</h3>
                                  <div className="flex items-center text-xs text-gray-500 bg-gray-50 px-2 py-0.5 rounded-full">
                                    <Calendar className="h-3 w-3 mr-1 text-blue-400" />
                                    {job.dateRange}
                                  </div>
                                </div>
                                <p className="text-blue-600 text-xs font-medium">{job.company_name}</p>
                              </div>
                            </div>
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  ) : (
                    <div className="flex flex-col items-center justify-center py-8 rounded-lg border border-gray-100 bg-white">
                      <p className="text-gray-500 text-sm text-center">No career data available</p>
                    </div>
                  )}
                </div>
              )}

              {/* Projects Tab */}
              {activeTab === "projects" && (
                <div className="space-y-3">
                  {expert.projects && expert.projects.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {expert.projects.map((project, index) => (
                        <motion.div 
                          key={index} 
                          initial={{ opacity: 0, scale: 0.98 }}
                          animate={{ 
                            opacity: 1, 
                            scale: 1,
                            transition: { delay: index * 0.03 }
                          }}
                        >
                          <div className="h-full p-4 rounded-lg border border-gray-100 bg-white hover:shadow-sm transition-all duration-200">
                            <h3 className="text-sm font-medium text-gray-800">{project.projectName}</h3>
                            <div className="flex items-center mt-1">
                              <div className="text-xs text-gray-500">
                                ID: {project.projectId}
                              </div>
                            </div>
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  ) : (
                    <div className="flex flex-col items-center justify-center py-8 rounded-lg border border-gray-100 bg-white">
                      <p className="text-gray-500 text-sm text-center">No projects assigned</p>
                    </div>
                  )}
                </div>
              )}

              {/* Notes Tab */}
              {activeTab === "notes" && (
                <div className="space-y-3">
                  {expert.notes ? (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="relative"
                    >
                      <div className="rounded-lg p-4 transition-all duration-200 hover:shadow-md border border-gray-100 bg-white">
                        <div className="flex items-start gap-3">
                          <div className="h-9 w-9 rounded-md bg-blue-100 flex items-center justify-center text-blue-500 flex-shrink-0">
                            <FileText className="h-4 w-4" />
                          </div>
                          <div className="flex-1">
                            <h3 className="text-sm font-semibold text-gray-800 mb-2">Expert Notes</h3>
                            <div className="text-sm text-gray-600 whitespace-pre-wrap">
                              {expert.notes}
                            </div>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  ) : (
                    <div className="flex flex-col items-center justify-center py-8 rounded-lg border border-gray-100 bg-white">
                      <p className="text-gray-500 text-sm text-center">No notes available for this expert</p>
                    </div>
                  )}
                </div>
              )}
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Clean modern footer */}
        <div className="border-t border-gray-100 bg-white px-8 py-3 flex justify-end items-center z-10">
          <button 
            onClick={onAddToProject}
            disabled={isExpertAssigned}
            className={`
              flex items-center gap-2 px-4 py-1.5 rounded-md text-sm font-medium transition-all duration-200
              ${isExpertAssigned 
                ? 'bg-gray-100 text-gray-400 cursor-not-allowed' 
                : 'bg-blue-500 text-white hover:bg-blue-600'}
            `}
          >
            <span>{isExpertAssigned ? 'Already Assigned' : 'Add to Project'}</span>
          </button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
