"use client";

import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import API from "@/services/api";

interface Project {
  project_id: string;
  project_name: string;
  status: boolean; // 'false' for active, 'true' for closed
}

interface ProjectSelectModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (projectId: string) => void;
  expertId: string; // Pass the selected expert's ID
}

export function ProjectSelectModal({ isOpen, onClose, onSelect, expertId }: ProjectSelectModalProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false); // New state for submission loading
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Fetch projects from API
  useEffect(() => {
    const fetchProjects = async () => {
      setLoading(true);
      try {
        const response = await API.get("/projects", { withCredentials: true });
        setProjects(response.data);
      } catch (error) {
        console.error("Error fetching projects:", error);
        setErrorMessage("Failed to load projects.");
      } finally {
        setLoading(false);
      }
    };

    if (isOpen) {
      fetchProjects();
    }
  }, [isOpen]);

  const filteredProjects = projects.filter((project) =>
    project.project_name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Handle project selection
  const handleProjectSelect = async (projectId: string) => {
    setSubmitting(true);
    try {
      await API.post(
        "/project_pipeline/",
        { expert_id: expertId, project_id: projectId },
        { withCredentials: true }
      );

      setSuccessMessage("Expert added to project successfully!");
      onSelect(projectId); // Update parent state

      // Show success message briefly before closing the modal
      setTimeout(() => {
        setSuccessMessage(null);
        setSubmitting(false);
        onClose(); // Close modal
      }, 1500); // Close after 1.5 seconds
    } catch (error) {
      console.error("Error adding expert to project:", error);
      setErrorMessage("Failed to add expert to project.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px] bg-white p-0 rounded-lg overflow-hidden">
        <DialogHeader className="px-4 py-3 flex flex-row items-center justify-between border-b">
          <DialogTitle className="text-lg font-semibold">Select Project</DialogTitle>
        </DialogHeader>

        <div className="p-4">
          {/* Success message */}
          {successMessage && <div className="mb-4 text-green-500">{successMessage}</div>}
          {/* Error message */}
          {errorMessage && <div className="mb-4 text-red-500">{errorMessage}</div>}

          <div className="relative mb-4">
            <Search className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
            <Input
              placeholder="Search projects..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 pr-4 py-2 rounded-full border-2 border-gray-200 focus:border-blue-500 focus:ring focus:ring-blue-200 focus:ring-opacity-50 bg-white text-sm"
            />
          </div>

          {/* Project List */}
          <div className="max-h-[300px] overflow-y-auto pr-2 -mr-2">
            {loading ? (
              <div className="text-center py-4">Loading projects...</div>
            ) : filteredProjects.length === 0 ? (
              <div className="text-center py-4 text-gray-500">No projects found</div>
            ) : (
              filteredProjects.map((project) => (
                <div
                  key={project.project_id}
                  onClick={() => !submitting && handleProjectSelect(project.project_id)}
                  className={`flex items-start justify-between p-3 cursor-pointer ${
                    submitting ? "opacity-50 cursor-not-allowed" : "hover:bg-gray-50"
                  } rounded-lg transition-all duration-200 mb-1 border border-transparent hover:border-gray-200`}
                >
                  <div className="space-y-1 flex-grow mr-4">
                    <div className="font-medium text-base">{project.project_name}</div>
                  </div>
                  <Badge
                    className={`${
                      project.status ? "bg-red-100 text-red-800" : "bg-green-100 text-green-800"
                    } hover:bg-gray-200 px-2 py-0.5 text-xs font-medium rounded-full`}
                  >
                    {project.status ? "Closed" : "Active"}
                  </Badge>
                </div>
              ))
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}