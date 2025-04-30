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
        className="max-w-3xl p-0 rounded-2xl h-[85vh] overflow-hidden shadow-lg border-0 bg-white flex flex-col"
      >
        {/* Accessibility title */}
        <DialogTitle className="sr-only">Expert Profile: {expert.fullName}</DialogTitle>
        
        {/* Modern Layout with Sidebar */}
        <div className="flex h-full">
          {/* Sidebar */}
          <div className="w-64 bg-blue-50 border-r border-blue-100 flex flex-col">
            {/* Expert Profile Summary */}
            <div className="p-6">
              {/* Avatar */}
              <div className="mb-4 flex justify-center">
                <div className="relative">
                  <div className="w-24 h-24 rounded-full bg-blue-200 flex items-center justify-center text-blue-600 text-2xl font-semibold border-4 border-white shadow-sm">
                    {getInitials(expert.fullName)}
                  </div>
                  {expert.isFormer && (
                    <div className="absolute -bottom-1 -right-1">
                      <Badge className="bg-white text-blue-500 border border-blue-100 py-0.5 px-2 rounded-full text-xs font-medium shadow-sm">
                        Former
                      </Badge>
                    </div>
                  )}
                </div>
              </div>
              
              {/* Name and Status */}
              <div className="text-center mb-4">
                <h1 className="text-lg font-bold text-gray-800 mb-1">{expert.fullName}</h1>
                {expert.career && expert.career.length > 0 && (
                  <p className="text-xs text-blue-600 font-medium">
                    {expert.career[0].title}
                  </p>
                )}
                {expert.career && expert.career.length > 0 && (
                  <p className="text-xs text-gray-500 mt-0.5">
                    {expert.career[0].company_name}
                  </p>
                )}
              </div>
              
              {/* Status Badge */}
              {isExpertAssigned && (
                <div className="flex justify-center mb-4">
                  {isExpertPublished ? (
                    <Badge className="bg-green-100 text-green-700 border border-green-200 py-1 px-3 rounded-full text-xs">
                      Published
                    </Badge>
                  ) : (
                    <Badge className="bg-blue-100 text-blue-700 border border-blue-200 py-1 px-3 rounded-full text-xs">
                      Pipeline
                    </Badge>
                  )}
                </div>
              )}
              
              {/* Contact Info */}
              <div className="space-y-3 mt-6">
                <div className="flex items-center text-gray-600 text-sm">
                  <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center mr-3">
                    <MapPin className="h-4 w-4 text-blue-500" />
                  </div>
                  <span>{expert.countryOfResidence}</span>
                </div>
                
                <a 
                  href={`mailto:${expert.email}`}
                  className="flex items-center text-gray-600 text-sm hover:text-blue-600 transition-colors"
                >
                  <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center mr-3">
                    <Mail className="h-4 w-4 text-blue-500" />
                  </div>
                  <span className="truncate">{expert.email}</span>
                </a>
                
                <a 
                  href={`tel:${expert.phone}`}
                  className="flex items-center text-gray-600 text-sm hover:text-blue-600 transition-colors"
                >
                  <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center mr-3">
                    <Phone className="h-4 w-4 text-blue-500" />
                  </div>
                  <span>{expert.phone}</span>
                </a>
                
                <a 
                  href={expert.linkedIn}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center text-gray-600 text-sm hover:text-blue-600 transition-colors"
                >
                  <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center mr-3">
                    <FaLinkedin className="h-4 w-4 text-blue-500" />
                  </div>
                  <span>LinkedIn</span>
                </a>
              </div>
            </div>
            
            {/* Action Button */}
            <div className="mt-auto p-4 border-t border-blue-100">
              <button 
                onClick={onAddToProject}
                disabled={isExpertAssigned}
                className={`
                  w-full flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-medium transition-all duration-200
                  ${isExpertAssigned 
                    ? 'bg-gray-100 text-gray-400 cursor-not-allowed' 
                    : 'bg-blue-500 text-white hover:bg-blue-600 shadow-sm hover:shadow'}
                `}
              >
                <span>{isExpertAssigned ? 'Already Assigned' : 'Add to Project'}</span>
              </button>
            </div>
          </div>
          
          {/* Main Content Area */}
          <div className="flex-1 flex flex-col">
            {/* Close button */}
            <div className="absolute right-4 top-4 z-30">
              <button 
                onClick={() => onClose()}
                className="flex items-center justify-center h-8 w-8 rounded-full bg-gray-100 text-gray-500 hover:bg-blue-100 hover:text-blue-600 transition-all duration-200"
                aria-label="Close dialog"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
            
            {/* Tab Navigation */}
            <div className="px-6 pt-6 pb-2">
              <div className="flex space-x-1 bg-blue-50 p-1 rounded-lg">
                {[
                  { id: "career", label: "Experience", icon: Briefcase },
                  { id: "projects", label: "Projects", icon: FolderOpen },
                  { id: "notes", label: "Notes", icon: FileText }
                ].map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id as "career" | "projects" | "notes")}
                    className={`
                      flex items-center justify-center gap-2 py-2 px-4 rounded-md flex-1 transition-all duration-200
                      ${activeTab === tab.id 
                        ? "bg-white text-blue-600 shadow-sm" 
                        : "text-gray-600 hover:bg-blue-100/50 hover:text-blue-500"}
                    `}
                  >
                    <tab.icon className="h-4 w-4" />
                    <span className="font-medium text-sm">{tab.label}</span>
                  </button>
                ))}
              </div>
            </div>
            
            {/* Content area */}
            <div className="flex-1 overflow-auto px-6 py-4">
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
                    <div className="space-y-4">
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
                            >
                              <div className="rounded-xl p-4 border border-blue-100 bg-white hover:shadow-md transition-all duration-200 hover:border-blue-200">
                                <div className="flex items-start">
                                  <div className="mr-4 mt-1">
                                    <div className="h-10 w-10 rounded-lg bg-blue-100 flex items-center justify-center text-blue-500">
                                      <Building className="h-5 w-5" />
                                    </div>
                                  </div>
                                  <div className="flex-1">
                                    <div className="flex flex-wrap items-start justify-between gap-2">
                                      <div>
                                        <h3 className="text-base font-semibold text-gray-800">{job.title}</h3>
                                        <p className="text-blue-600 text-sm">{job.company_name}</p>
                                      </div>
                                      <div className="flex items-center text-xs text-gray-500 bg-blue-50 px-3 py-1 rounded-full">
                                        <Calendar className="h-3 w-3 mr-1.5 text-blue-400" />
                                        {job.dateRange}
                                      </div>
                                    </div>
                                  </div>
                                </div>
                              </div>
                            </motion.div>
                          ))}
                        </div>
                      ) : (
                        <div className="flex flex-col items-center justify-center py-12 rounded-lg border border-blue-100 bg-blue-50">
                          <Briefcase className="h-12 w-12 text-blue-300 mb-3" />
                          <p className="text-gray-500 text-sm">No career data available</p>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Projects Tab */}
                  {activeTab === "projects" && (
                    <div>
                      {expert.projects && expert.projects.length > 0 ? (
                        <div className="grid grid-cols-1 gap-3">
                          {expert.projects.map((project, index) => (
                            <motion.div 
                              key={index} 
                              initial={{ opacity: 0, x: -10 }}
                              animate={{ 
                                opacity: 1, 
                                x: 0,
                                transition: { delay: index * 0.05 }
                              }}
                            >
                              <div className="p-4 rounded-xl border border-blue-100 bg-white hover:shadow-md transition-all duration-200 hover:border-blue-200">
                                <div className="flex items-center">
                                  <div className="mr-4">
                                    <div className="h-10 w-10 rounded-lg bg-blue-100 flex items-center justify-center text-blue-500">
                                      <FolderOpen className="h-5 w-5" />
                                    </div>
                                  </div>
                                  <div>
                                    <h3 className="text-base font-semibold text-gray-800">{project.projectName}</h3>
                                    <div className="mt-1 text-xs text-gray-500">
                                      ID: {project.projectId}
                                    </div>
                                  </div>
                                </div>
                              </div>
                            </motion.div>
                          ))}
                        </div>
                      ) : (
                        <div className="flex flex-col items-center justify-center py-12 rounded-lg border border-blue-100 bg-blue-50">
                          <FolderOpen className="h-12 w-12 text-blue-300 mb-3" />
                          <p className="text-gray-500 text-sm">No projects assigned</p>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Notes Tab */}
                  {activeTab === "notes" && (
                    <div>
                      {expert.notes ? (
                        <motion.div
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                        >
                          <div className="rounded-xl p-5 border border-blue-100 bg-white">
                            <div className="flex items-start mb-4">
                              <div className="h-8 w-8 rounded-lg bg-blue-100 flex items-center justify-center text-blue-500 mr-3">
                                <FileText className="h-4 w-4" />
                              </div>
                              <h3 className="text-lg font-semibold text-gray-800">Expert Notes</h3>
                            </div>
                            <div className="text-sm text-gray-600 whitespace-pre-wrap leading-relaxed pl-11">
                              {expert.notes}
                            </div>
                          </div>
                        </motion.div>
                      ) : (
                        <div className="flex flex-col items-center justify-center py-12 rounded-lg border border-blue-100 bg-blue-50">
                          <FileText className="h-12 w-12 text-blue-300 mb-3" />
                          <p className="text-gray-500 text-sm">No notes available for this expert</p>
                        </div>
                      )}
                    </div>
                  )}
                </motion.div>
              </AnimatePresence>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}