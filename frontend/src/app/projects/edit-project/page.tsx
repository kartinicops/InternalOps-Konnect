// First, update the ProjectFormData interface to include the completed calls
// Add this in your types/projects.ts file

// types/projects.ts (you should add this to your completedCalls property)
// export interface ProjectFormData {
//   // ...existing properties
//   completedCalls: string;
//   // ...other properties
// }

"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import API from "@/services/api";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Loader2, Calendar, FileUp, FilePlus, X, ArrowLeft, MapPin, Globe, Clock, Building, FileText, HelpCircle, Plus, ListChecks, Trash2, AlertCircle, CheckCircle2 } from "lucide-react";
import { Nav } from "@/components/nav";
import { ProjectFormData } from "@/types/projects";
import { geographies as geographiesData } from "@/data/geographies";
import ProjectDetailsForm from "@/components/projects/project-details-form";
import CompaniesForm from "@/components/projects/companies-form";
import ScreeningQuestionsForm from "@/components/projects/screeninng-question-form";
import ClientRequirementsForm from "@/components/projects/client-requirements-form";
import ProjectFilesForm from "@/components/projects/project-files-form";
import ClientDetailsFormEdit from "@/components/projects/client-details-form-edit";
import CompletedCallsForm from "@/components/projects/completed-calls-form"; // We'll create this component

export default function EditProject() {
  const router = useRouter();
  const [projectId, setProjectId] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [initialLoading, setInitialLoading] = useState<boolean>(true);
  const [loadingError, setLoadingError] = useState<string | null>(null);
  const [fileUploading, setFileUploading] = useState<boolean>(false);
  const [formData, setFormData] = useState<ProjectFormData>({
    projectName: "", status: true, startDate: "", endDate: "", expectedCalls: "",
    completedCalls: "", // Add this field
    clientRequirements: [], screeningQuestions: [], file: null, geographyId: "", 
    companiesOfInterest: [],
    clientCompanies: [],
    clientTeams: []
  });
  const [geographies, setGeographies] = useState([]);
  const [projectFiles, setProjectFiles] = useState([]);
  const [clientCompanies, setClientCompanies] = useState([]);
  const [clientTeams, setClientTeams] = useState([]);
  const [clientMembers, setClientMembers] = useState([]);

  // Get project ID from URL
  useEffect(() => {
    const url = new URL(window.location.href);
    const id = url.searchParams.get('id');
    
    if (id) {
      setProjectId(id);
    } else {
      setLoadingError("Project ID is missing. Please select a project from the projects list.");
      setInitialLoading(false);
    }
  }, []);

  // Fetch project data
  useEffect(() => {
    if (!projectId) return;
    fetchProjectData();
  }, [projectId]);

  const fetchProjectData = async () => {
    try {
      setInitialLoading(true);
      
      // Fetch geographies
      try {
        const geoRes = await API.get("/projects_geography/");
        setGeographies(geoRes.data);
      } catch (error) {
        console.warn("Using static geography data due to API error");
        setGeographies(geographiesData);
      }
      
      // Fetch project with retry
      let projectData = null;
      let retries = 3;
      
      while (retries > 0 && !projectData) {
        try {
          const projectRes = await API.get(`/projects/${projectId}/`);
          projectData = projectRes.data;
        } catch (error) {
          retries--;
          if (retries === 0) throw new Error("Failed to fetch project data after multiple attempts");
          await new Promise(resolve => setTimeout(resolve, 1000));
        }
      }
      
      if (!projectData) throw new Error("Could not retrieve project data");
      
      // Get companies of interest
      const companiesOfInterest = await fetchCompaniesOfInterest();
      
      // Get project files
      const projectFiles = await fetchProjectFiles();
      setProjectFiles(projectFiles);
      
      // Fetch client details data
      await fetchClientDetails();
      
      // Parse data
      const clientRequirements = projectData.client_requirements 
        ? projectData.client_requirements.split("\n\n").filter(Boolean) 
        : [];
        
      const screeningQuestions = projectData.general_screening_questions 
        ? projectData.general_screening_questions.split("\n\n").filter(Boolean) 
        : [];
      
      // Set form data
      setFormData({
        projectName: projectData.project_name || "",
        status: projectData.status === true,
        startDate: projectData.timeline_start || "",
        endDate: projectData.timeline_end || "",
        expectedCalls: projectData.expected_calls || 0,
        completedCalls: projectData.completed_calls || 0, // Add this field
        clientRequirements: clientRequirements,
        screeningQuestions: screeningQuestions,
        file: null,
        geographyId: projectData.geography_id ? String(projectData.geography_id) : "",
        companiesOfInterest: companiesOfInterest,
        clientCompanies: clientCompanies,
        clientTeams: clientTeams
      });
    } catch (error) {
      console.error("Error fetching project data:", error);
      setLoadingError("Failed to load project data. Please try again.");
    } finally {
      setInitialLoading(false);
    }
  };

  const fetchClientDetails = async () => {
    try {
      // Fetch client companies
      const clientCompaniesRes = await API.get("/project_client_company/");
      const fetchedClientCompanies = clientCompaniesRes.data.filter(
        company => company.project_id === parseInt(projectId)
      );
      setClientCompanies(fetchedClientCompanies);

      // Fetch client teams
      const clientTeamsRes = await API.get("/project_client_team/");
      const fetchedClientTeams = clientTeamsRes.data.filter(
        team => team.project_id === parseInt(projectId)
      );
      setClientTeams(fetchedClientTeams);

      // Fetch client members
      const clientMembersRes = await API.get("/client_members/");
      setClientMembers(clientMembersRes.data);

      // Prepare client teams with member data
      const teamsWithMembers = fetchedClientTeams.map(team => {
        const member = clientMembersRes.data.find(
          m => m.client_member_id === team.client_member_id
        );
        return {
          ...team,
          member: member || null
        };
      });

      setClientTeams(teamsWithMembers);
      
      return {
        clientCompanies: fetchedClientCompanies,
        clientTeams: teamsWithMembers
      };
    } catch (error) {
      console.error("Error fetching client details:", error);
      return {
        clientCompanies: [],
        clientTeams: []
      };
    }
  };

  const fetchCompaniesOfInterest = async () => {
    try {
      const res = await API.get(`/companies_of_interest/`);
      
      // Filter companies of interest hanya untuk project yang sedang diedit
      const filteredCompanies = res.data.filter(
        (company) => company.project_id === parseInt(projectId)
      );
      
      return filteredCompanies || [];
    } catch (err) {
      console.error("Error fetching companies:", err);
      return [];
    }
  };

  const fetchProjectFiles = async () => {
    try {
      const res = await API.get(`/projects_files/?project_id=${projectId}`);
      const filesData = Array.isArray(res.data) ? res.data : [];
      return filesData.filter(file => 
        file.project_id === parseInt(projectId) || 
        file.project_id === projectId
      );
    } catch (err) {
      console.error("Error fetching files:", err);
      return [];
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!projectId) {
      toast.error("Cannot update: Project ID is missing");
      return;
    }
    
    // Basic validation
    if (!formData.projectName.trim()) {
      toast.error("Project name is required");
      return;
    }
    
    if (!formData.startDate || !formData.endDate) {
      toast.error("Start and end dates are required");
      return;
    }
    
    if (new Date(formData.endDate) < new Date(formData.startDate)) {
      toast.error("End date must be after start date");
      return;
    }

    // Validate completed calls
    const expectedCalls = parseInt(formData.expectedCalls.toString());
    const completedCalls = parseInt(formData.completedCalls.toString());
    
    if (isNaN(completedCalls)) {
      toast.error("Completed calls must be a valid number");
      return;
    }
    
    if (completedCalls < 0) {
      toast.error("Completed calls cannot be negative");
      return;
    }
    
    if (completedCalls > expectedCalls) {
      toast.warning("Completed calls exceed expected calls");
      // Continue anyway - not a blocker
    }
    
    setLoading(true);
    
    try {
      const updateOperations = [];
      
      // Update basic project info
      updateOperations.push(updateProjectInfo());
      
      // Handle file upload
      if (formData.file) {
        setFileUploading(true);
        updateOperations.push(uploadFile());
      }
      
      // Update companies
      updateOperations.push(updateCompanies());
      
      // Update client details
      updateOperations.push(updateClientDetails());
      
      // Execute all operations
      const results = await Promise.allSettled(updateOperations);
      
      const rejected = results.filter(r => r.status === 'rejected');
      
      if (rejected.length === 0) {
        toast.success("Project successfully updated!");
        setTimeout(() => router.push("/projects"), 2000);
      } else if (rejected.length < results.length) {
        toast.warning("Project partially updated. Some changes may not have been saved.");
        setTimeout(() => router.push("/projects"), 3000);
      } else {
        toast.error("Failed to update project. Please try again.");
      }
    } catch (error) {
      console.error("Error in update process:", error);
      toast.error("Failed to update project. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const updateProjectInfo = async () => {
    return API.put(`/projects/${projectId}/`, {
      project_name: formData.projectName,
      status: formData.status,
      timeline_start: formData.startDate,
      timeline_end: formData.endDate,
      expected_calls: formData.expectedCalls,
      completed_calls: formData.completedCalls, // Add the completed calls field here
      client_requirements: formData.clientRequirements.join("\n\n"),
      general_screening_questions: formData.screeningQuestions.join("\n\n"),
      geography_id: formData.geographyId ? parseInt(formData.geographyId) : null
    }).catch(error => {
      console.error("Error updating project information:", error);
      throw new Error("Failed to update project basic information");
    });
  };

  const uploadFile = async () => {
    try {
      const fileData = new FormData();
      
      const fileExtension = formData.file.name.split('.').pop()?.toLowerCase();
      let fileType = 'pdf';

      const extensionMap = {
        'xlsx': 'excel', 'xls': 'excel',
        'doc': 'word', 'docx': 'word',
        'pdf': 'pdf'
      };

      fileType = extensionMap[fileExtension] || fileType;

      fileData.append("file_path", formData.file);
      fileData.append("file_name", formData.file.name);
      fileData.append("file_type", fileType);
      fileData.append("project_id", projectId);

      await API.post("/projects_files/", fileData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      
      // Refresh file list
      const files = await fetchProjectFiles();
      setProjectFiles(files);
      setFormData(prev => ({ ...prev, file: null }));
    } catch (error) {
      console.error("Error uploading file:", error);
      throw new Error("Failed to upload file");
    } finally {
      setFileUploading(false);
    }
  };

  const updateCompanies = async () => {
    try {
      // Get existing companies
      const existingCompaniesRes = await API.get(`/companies_of_interest/?project_id=${projectId}`);
      const existingCompanies = existingCompaniesRes.data || [];
      
      // Compare existing and new companies
      const newCompanies = formData.companiesOfInterest;
      
      // Companies to delete (exist in DB but not in new data)
      const companiesToDelete = existingCompanies.filter(
        existing => !newCompanies.some(
          newCompany => 
            newCompany.company_name === existing.company_name &&
            newCompany.is_past === existing.is_past &&
            newCompany.is_current === existing.is_current
        )
      );
      
      // Companies to add (exist in new data but not in DB)
      const companiesToAdd = newCompanies.filter(
        newCompany => !existingCompanies.some(
          existing => 
            existing.company_name === newCompany.company_name &&
            existing.is_past === newCompany.is_past &&
            existing.is_current === newCompany.is_current
        )
      );
      
      // Delete companies no longer in the list
      const deletePromises = companiesToDelete.map(company => 
        API.delete(`/companies_of_interest/${company.company_of_interest_id}/`)
      );
      await Promise.all(deletePromises);
      
      // Add new companies
      const addPromises = companiesToAdd.map(company => 
        API.post("/companies_of_interest/", {
          project_id: projectId,
          company_name: company.company_name,
          is_past: company.is_past,
          is_current: company.is_current
        })
      );
      await Promise.all(addPromises);
      
      // Log the changes for tracking
      console.log({
        companiesDeleted: companiesToDelete.length,
        companiesAdded: companiesToAdd.length
      });
    } catch (error) {
      console.error("Error updating companies:", error);
      throw new Error("Failed to update companies of interest");
    }
  };

  const updateClientDetails = async () => {
    try {
      // Validate input data
      if (!projectId) {
        throw new Error("Project ID is missing");
      }
  
      // Handle client companies
      const existingCompaniesRes = await API.get("/project_client_company/");
      const existingCompanies = existingCompaniesRes.data.filter(
        company => company.project_id === parseInt(projectId)
      );
      
      // Prepare company operations
      const companiesToDelete = existingCompanies.filter(
        existing => !formData.clientCompanies.some(
          newCompany => newCompany.client_company_id === existing.client_company_id
        )
      );
      
      const companiesToAdd = formData.clientCompanies.filter(
        newCompany => !existingCompanies.some(
          existing => existing.client_company_id === newCompany.client_company_id
        )
      );
  
      // Delete companies no longer associated with the project
      const deleteCompanyPromises = companiesToDelete.map(company => 
        API.delete(`/project_client_company/${company.client_company_id}/`)
      );
      await Promise.all(deleteCompanyPromises);
  
      // Add new companies
      const addCompanyPromises = companiesToAdd.map(company => 
        API.post("/project_client_company/", {
          project_id: projectId,
          company_name: company.company_name
        })
      );
      const addedCompanies = await Promise.all(addCompanyPromises);
  
      // Map of newly added companies
      const newCompanyIds = {};
      addedCompanies.forEach((result, index) => {
        const originalCompany = companiesToAdd[index];
        newCompanyIds[`new-${originalCompany.company_name}`] = result.data.client_company_id;
      });
  
      // Handle client teams and members
      const existingTeamsRes = await API.get("/project_client_team/");
      const existingTeams = existingTeamsRes.data.filter(
        team => team.project_id === parseInt(projectId)
      );
  
      // Delete existing team associations
      const deleteTeamPromises = existingTeams.map(team => 
        API.delete(`/project_client_team/${team.client_team_id}/`)
      );
      await Promise.all(deleteTeamPromises);
  
      // Process members
      const processedMembers = [];
      for (const team of formData.clientTeams || []) {
        // Skip if no member data
        if (!team.member) continue;
  
        // Validate member data
        if (!team.member.client_name || !team.member.client_email) {
          console.warn("Skipping member due to incomplete data", team.member);
          continue;
        }
  
        // Handle company ID for new companies
        let memberCompanyId = team.member.client_company_id;
        if (typeof memberCompanyId === 'string' && memberCompanyId.startsWith('new-')) {
          memberCompanyId = newCompanyIds[memberCompanyId] || null;
        }
  
        try {
          // Prepare member payload
          const memberPayload = {
            client_name: team.member.client_name.trim(),
            client_email: team.member.client_email.trim(),
            phone_number: team.member.phone_number ? team.member.phone_number.trim() : null,
            client_company_id: memberCompanyId
          };
  
          // Validate email format
          const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
          if (!emailRegex.test(memberPayload.client_email)) {
            console.warn("Invalid email format", memberPayload.client_email);
            continue;
          }
  
          let memberId;
  
          // Handle existing vs new members
          if (team.existing && team.client_member_id) {
            // Update existing member
            const updateResponse = await API.put(`/client_members/${team.client_member_id}/`, memberPayload);
            memberId = team.client_member_id;
            processedMembers.push({
              ...memberPayload,
              client_member_id: memberId,
              status: 'updated'
            });
          } else {
            // Create new member
            const memberRes = await API.post("/client_members/", memberPayload);
            
            if (!memberRes.data || !memberRes.data.client_member_id) {
              throw new Error("Failed to create member: No member ID returned");
            }
            
            memberId = memberRes.data.client_member_id;
            processedMembers.push({
              ...memberPayload,
              client_member_id: memberId,
              status: 'created'
            });
          }
  
          // Create team association
          await API.post("/project_client_team/", {
            project_id: projectId,
            client_member_id: memberId
          });
  
        } catch (memberError) {
          console.error("Error processing member:", memberError);
          
          // Log detailed error information
          if (memberError.response) {
            console.error("Full error response:", memberError.response);
            
            // More detailed error handling
            if (memberError.response.status === 400) {
              toast.error(`Unable to process member ${team.member.client_name}. Validation failed.`);
              
              // Log specific validation errors if available
              if (memberError.response.data && memberError.response.data.errors) {
                console.error("Validation errors:", memberError.response.data.errors);
              }
            } else if (memberError.response.status === 409) {
              toast.error(`Member ${team.member.client_name} might already exist.`);
            } else {
              toast.error(`Failed to process member ${team.member.client_name}`);
            }
          } else {
            toast.error(`Unexpected error with member ${team.member.client_name}`);
          }
  
          // Continue processing other members
          continue;
        }
      }
  
      // Log processed members
      console.log("Processed Members:", processedMembers);
  
      // Log successful update
      console.log("Client details updated successfully");
      return true;
  
    } catch (error) {
      console.error("Comprehensive error in updating client details:", error);
      
      // Global error handling
      if (error.response) {
        // Server responded with an error
        console.error("Full error response:", error.response);
        toast.error("Failed to update client details. Please check the input.");
      } else if (error.request) {
        // Request made but no response received
        toast.error("Network error. Please check your connection.");
      } else {
        // Something else went wrong
        toast.error("An unexpected error occurred while updating client details.");
      }
  
      // Rethrow to allow caller to handle
      throw error;
    }
  };

  const deleteFile = async (fileId) => {
    try {
      await API.delete(`/projects_files/${fileId}/`);
      setProjectFiles(prev => prev.filter(file => file.file_id !== fileId));
      toast.success("File deleted successfully");
    } catch (error) {
      console.error("Error deleting file:", error);
      toast.error("Failed to delete file. Please try again.");
    }
  };

  // Loading state
  if (initialLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-blue-500 mx-auto"></div>
          <p className="mt-4 text-lg text-gray-600">Loading edit project...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (loadingError) {
    return (
      <div className="min-h-screen bg-gray-100">
        <Nav />
        <div className="container mx-auto py-16 px-4 max-w-5xl">
          <Card className="shadow-lg border-0">
            <CardContent className="p-6">
              <div className="flex flex-col items-center justify-center py-8 space-y-4">
                <AlertCircle className="h-16 w-16 text-red-500" />
                <h2 className="text-2xl font-bold text-gray-800">Error Loading Project</h2>
                <p className="text-gray-600 text-center">{loadingError}</p>
                <div className="flex space-x-3 mt-4">
                  <Button onClick={() => router.push("/projects")} variant="outline">
                    Back to Projects
                  </Button>
                  <Button 
                    onClick={() => window.location.reload()} 
                    className="bg-blue-600 hover:bg-blue-700 text-white">
                    Try Again
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <Nav />
      <ToastContainer theme="colored" position="top-right" autoClose={5000} />
      
      <div className="container mx-auto py-8 px-4 max-w-5xl">
        <div className="flex items-center mb-8">
          <Button variant="ghost" onClick={() => router.push("/projects")} 
                  className="mr-4 text-blue-600 hover:text-blue-800 hover:bg-blue-50">
            <ArrowLeft className="h-5 w-5 mr-1" />Back
          </Button>
          <h1 className="text-3xl font-bold text-blue-600">Edit Project</h1>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Project Details */}
          <ProjectDetailsForm 
            formData={formData} 
            setFormData={setFormData} 
            geographies={geographies} 
          />
          
          {/* Completed Calls - New Component */}
          <CompletedCallsForm
            formData={formData}
            setFormData={setFormData}
          />
          
          {/* Companies of Interest */}
          <CompaniesForm 
            formData={formData} 
            setFormData={setFormData} 
          />
          
          {/* Client Details */}
          <ClientDetailsFormEdit
            projectId={projectId} 
            formData={formData} 
            setFormData={setFormData} 
          />
          
          {/* Screening Questions */}
          <ScreeningQuestionsForm 
            formData={formData} 
            setFormData={setFormData}
            projectId={projectId} 
          />
                    
          {/* Client Requirements */}
          <ClientRequirementsForm 
            formData={formData} 
            setFormData={setFormData} 
          />
          
          {/* Project Files */}
          <ProjectFilesForm 
            formData={formData} 
            setFormData={setFormData} 
            projectFiles={projectFiles} 
            fileUploading={fileUploading}
            deleteFile={deleteFile}
          />

          <div className="flex justify-end gap-4 pt-4">
            <Button variant="outline" type="button" onClick={() => router.push("/projects")}
                    className="px-6 border-gray-300 text-gray-700 hover:bg-gray-100 transition-colors">
              Cancel
            </Button>
            <Button type="submit" disabled={loading || fileUploading}
                    className="px-6 bg-blue-600 hover:bg-blue-700 text-white transition-colors">
              {loading ? (<><Loader2 className="mr-2 h-4 w-4 animate-spin" />Updating...</>) : (<>Update Project</>)}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}