"use client";

import { useState, useEffect, ChangeEvent, FormEvent } from "react";
import { useRouter } from "next/navigation";
import API from "@/services/api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Nav } from "@/components/nav";
import { Loader2, Calendar, FileUp, FilePlus, X, ArrowLeft, MapPin, Globe, Clock, Building, FileText, HelpCircle, Plus, ListChecks, Users } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { ProjectFormData, Company, Geography } from "@/types/projects";
// Import the geography data
import { geographies as geographiesData } from "@/data/geographies";

// Define types for client company and members
interface ClientCompany {
  company_name: string;
  client_company_id?: number; // Add ID field
}

interface ClientMember {
  client_name: string;
  client_email: string;
  phone_number: string;
  client_company_id?: number; // Add company ID field
}

export default function AddProject() {
  const router = useRouter();
  const [loading, setLoading] = useState<boolean>(false);
  const [fileUploading, setFileUploading] = useState<boolean>(false);
  const [formData, setFormData] = useState<ProjectFormData>({
    projectName: "", status: false, startDate: "", endDate: "", expectedCalls: "",
    clientRequirements: [], screeningQuestions: [], file: null, geographyId: "", companiesOfInterest: []
  });
  const [geographies, setGeographies] = useState<Geography[]>([]);
  const [companies, setCompanies] = useState<Company[]>([]);
  const [selectedCompany, setSelectedCompany] = useState<Company>({ company_name: "", is_past: false, is_current: false });
  const [newRequirement, setNewRequirement] = useState<string>("");
  const [newQuestion, setNewQuestion] = useState<string>("");
  
  // Client company and members state
  const [clientCompany, setClientCompany] = useState<ClientCompany>({ company_name: "" });
  const [clientMembers, setClientMembers] = useState<ClientMember[]>([]);
  const [newClientMember, setNewClientMember] = useState<ClientMember>({
    client_name: "",
    client_email: "",
    phone_number: ""
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Use either API data or the imported data for geographies
        try {
          const geoRes = await API.get("/projects_geography/");
          setGeographies(geoRes.data);
        } catch (error) {
          // Fallback to static data if API fails
          console.warn("Using static geography data");
          setGeographies(geographiesData);
        }
        
        const compRes = await API.get("/companies_of_interest/");
        setCompanies(compRes.data);
      } catch (error) {
        console.error("Error fetching data:", error);
        toast.error("Failed to load reference data");
      }
    };
    fetchData();
  }, []);

  // Fungsi untuk memvalidasi tipe file
  const validateFile = (file: File) => {
    const allowedTypes = [
      'application/pdf', 
      'application/msword', 
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'application/vnd.ms-excel', 
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    ];
    
    // Jika MIME type tidak dikenali, cek juga ekstensi file
    const fileExtension = file.name.split('.').pop()?.toLowerCase();
    const validExtensions = ['pdf', 'doc', 'docx', 'xls', 'xlsx'];
    
    if (!allowedTypes.includes(file.type) && !validExtensions.includes(fileExtension)) {
      toast.error("File type not supported. Please upload PDF, DOC, DOCX, XLS, or XLSX file.");
      return false;
    }
    
    // Batasan ukuran file (10MB)
    if (file.size > 10 * 1024 * 1024) {
      toast.error("File size too large. Maximum allowed is 10MB.");
      return false;
    }
    
    return true;
  };

  const handleChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { id, value, type } = e.target;
    
    // Khusus untuk input file
    if (id === "file") {
      const fileInput = e.target as HTMLInputElement;
      const files = fileInput.files;
      
      if (files && files.length > 0) {
        if (validateFile(files[0])) {
          setFormData(prev => ({ ...prev, file: files[0] }));
          toast.success(`File "${files[0].name}" selected successfully`);
        } else {
          // Reset input file jika validasi gagal
          fileInput.value = '';
        }
      }
    } else {
      setFormData(prev => ({ ...prev, [id]: type === "number" ? parseInt(value) : value }));
    }
  };

  const handleChangeCalls = (e:any) => {
    const { id, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [id]: id === "expectedCalls" ? Number(value) : value, // Konversi angka
    }));
  };

  

  const handleCompanyChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { id, value } = e.target;
    setSelectedCompany(prev => ({ ...prev, [id]: value }));
  };
  
  const handleClientCompanyChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { value } = e.target;
    setClientCompany({ company_name: value });
  };
  
  const handleClientMemberChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { id, value } = e.target;
    setNewClientMember(prev => ({ ...prev, [id]: value }));
  };

  const handleCheckboxChange = (id: string, checked: boolean) => {
    setSelectedCompany(prev => ({ ...prev, [id]: checked }));
  };

  const addCompany = () => {
    if (!selectedCompany.company_name.trim()) return toast.warning("Please enter a company name");
    setFormData(prev => ({ ...prev, companiesOfInterest: [...prev.companiesOfInterest, {...selectedCompany}] }));
    setSelectedCompany({ company_name: "", is_past: false, is_current: false });
  };

  const removeCompany = (index: number) => {
    setFormData(prev => ({ ...prev, companiesOfInterest: prev.companiesOfInterest.filter((_, i) => i !== index) }));
  };
  
  const addClientMember = () => {
    const { client_name, client_email, phone_number } = newClientMember;
    
    if (!client_name.trim()) {
      return toast.warning("Please enter client member name");
    }
    
    if (!client_email.trim() || !/\S+@\S+\.\S+/.test(client_email)) {
      return toast.warning("Please enter a valid email");
    }
  
    setClientMembers(prev => [...prev, { ...newClientMember }]);
    setNewClientMember({
      client_name: "",
      client_email: "",
      phone_number: ""
    });
  };
  
  const removeClientMember = (index: number) => {
    setClientMembers(prev => prev.filter((_, i) => i !== index));
  };
  
  const addRequirement = () => {
    if (!newRequirement.trim()) return toast.warning("Please enter a requirement");
    setFormData(prev => ({ ...prev, clientRequirements: [...prev.clientRequirements, newRequirement.trim()] }));
    setNewRequirement("");
  };
  
  const removeRequirement = (index: number) => {
    setFormData(prev => ({ ...prev, clientRequirements: prev.clientRequirements.filter((_, i) => i !== index) }));
  };
  
  const addQuestion = () => {
    if (!newQuestion.trim()) return toast.warning("Please enter a screening question");
    setFormData(prev => ({ ...prev, screeningQuestions: [...prev.screeningQuestions, newQuestion.trim()] }));
    setNewQuestion("");
  };
  
  const removeQuestion = (index: number) => {
    setFormData(prev => ({ ...prev, screeningQuestions: prev.screeningQuestions.filter((_, i) => i !== index) }));
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
  
    try {
      // Add client company first
      let clientCompanyId = null;
      if (clientCompany.company_name.trim()) {
        const clientCompanyRes = await API.post("/project_client_company/", {
          company_name: clientCompany.company_name
        });
        clientCompanyId = clientCompanyRes.data.client_company_id;
      }
  
      // Create the project with client_company_id
      const projectRes = await API.post("/projects/", {
        project_name: formData.projectName,
        status: formData.status,
        timeline_start: formData.startDate,
        timeline_end: formData.endDate,
        expected_calls: formData.expectedCalls,
        client_requirements: formData.clientRequirements.join("\n\n"),
        general_screening_questions: formData.screeningQuestions.join("\n\n"), // Keep this for backward compatibility
        geography_id: formData.geographyId ? parseInt(formData.geographyId) : null,
        client_company_id: clientCompanyId
      });
      const projectId = projectRes.data.project_id;
  
      // Add screening questions to dedicated API endpoint
      if (formData.screeningQuestions.length > 0) {
        await Promise.all(
          formData.screeningQuestions.map(question =>
            API.post("/screening_question/", {
              project_id: projectId,
              question: question
            })
          )
        );
      }
  
      // File upload logic
      if (formData.file) {
        setFileUploading(true);
  
        try {
          const formDataForUpload = new FormData();
  
          const fileExtension = formData.file.name.split('.').pop()?.toLowerCase();
          let fileType = 'pdf'; // default
          const extensionMap: {[key: string]: string} = {
            'xlsx': 'excel',
            'xls': 'excel',
            'doc': 'word',
            'docx': 'word',
            'pdf': 'pdf'
          };
  
          fileType = extensionMap[fileExtension] || fileType;
  
          formDataForUpload.append("file_path", formData.file);
          formDataForUpload.append("file_name", formData.file.name);
          formDataForUpload.append("file_type", fileType);
          formDataForUpload.append("project_id", projectId);
  
          await API.post("/projects_files/", formDataForUpload, {
            headers: {
              'Content-Type': 'multipart/form-data'
            }
          });
        } catch (uploadError) {
          console.error("Error uploading file:", uploadError);
          toast.error("Project created but file couldn't be uploaded. Please try adding the file later.");
        } finally {
          setFileUploading(false);
        }
      }
  
      // Add companies of interest
      await Promise.all(
        formData.companiesOfInterest.map(company =>
          API.post("/companies_of_interest/", {
            project_id: projectId,
            company_name: company.company_name,
            is_past: company.is_past,
            is_current: company.is_current
          })
        )
      );
  
      // Add client members
      if (clientMembers.length > 0) {
        await Promise.all(
          clientMembers.map(member =>
            API.post("/client_members/", {
              client_name: member.client_name,
              client_email: member.client_email,
              phone_number: member.phone_number,
              client_company_id: clientCompanyId
            })
          )
        );
      }
  
      toast.success("Project successfully created!");
      setTimeout(() => router.push("/projects"), 2000);
    } catch (error) {
      console.error("Error creating project:", error);
      toast.error("Failed to create project. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const getSelectedGeography = () => formData.geographyId && geographies.length > 0 ? 
    geographies.find(g => String(g.geography_id) === formData.geographyId) : undefined;
  
  const selectedGeo = getSelectedGeography();

  return (
    <div className="min-h-screen bg-gradient-to-br from-white to-gray-50">
      <Nav />
      <ToastContainer theme="colored" />
      
      <div className="container mx-auto py-8 px-4 max-w-5xl">
        <div className="flex items-center mb-8">
          <Button variant="ghost" onClick={() => router.push("/projects")} className="mr-4 text-blue-600 hover:text-blue-800 hover:bg-blue-50/50 rounded-full">
            <ArrowLeft className="h-4 w-4 mr-1" />Back
          </Button>
          <h1 className="text-3xl font-bold text-blue-600">Add New Project</h1>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Project Details Card */}
          <Card className="shadow-sm border border-gray-100 overflow-hidden rounded-xl bg-gradient-to-br from-white to-blue-50">
            <CardHeader className="bg-white border-b border-gray-100 py-4 px-6">
              <CardTitle className="text-lg font-semibold text-gray-800 flex items-center">
                <div className="w-1 h-5 bg-blue-600 mr-3 rounded-full"></div>Project Details
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6 p-6 relative">
              {/* Background decorative elements */}
              <div className="absolute top-0 right-0 w-64 h-64 bg-blue-100 rounded-full opacity-20 -mr-20 -mt-20"></div>
              <div className="absolute bottom-0 left-0 w-48 h-48 bg-blue-200 rounded-full opacity-10 -ml-16 -mb-16"></div>
              
              <div className="space-y-2 group relative z-10">
                <Label htmlFor="projectName" className="text-sm font-medium text-gray-700 flex items-center gap-2 group-hover:text-blue-600 transition-colors">
                  <FileText className="h-3.5 w-3.5 text-gray-500 group-hover:text-blue-500 transition-colors" /> Project Name <span className="text-red-500">*</span>
                </Label>
                <div className="relative">
                  <Input 
                    id="projectName" 
                    value={formData.projectName} 
                    onChange={handleChange} 
                    placeholder="Enter project name" 
                    required 
                    className="bg-white h-10 rounded-lg pl-9 text-sm focus:ring-blue-200 shadow-sm hover:shadow-md transition-shadow" 
                  />
                  <FileText className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                </div>
              </div>
              
              <div className="space-y-2 group relative z-10">
                <Label htmlFor="status" className="text-sm font-medium text-gray-700 flex items-center gap-2 group-hover:text-blue-600 transition-colors">
                  <div className="h-3.5 w-3.5 text-gray-500 flex items-center justify-center group-hover:text-blue-500 transition-colors">
                    <span className="block h-2 w-2 rounded-full bg-current"></span>
                  </div> Status
                </Label>
                <div className="flex items-center space-x-4">
                  <div className="relative w-16 h-8 rounded-full cursor-pointer flex items-center bg-gray-200 hover:bg-gray-300 transition-colors"
                    onClick={() => setFormData(prev => ({ ...prev, status: !prev.status }))}>
                    <div className="absolute inset-y-0 left-0 w-1/2 bg-white rounded-full shadow transition-transform duration-200 ease-in-out transform"
                      style={{ transform: formData.status ? 'translateX(100%)' : 'translateX(0)' }}></div>
                    <div className="absolute inset-0 flex items-center justify-between px-2">
                      <span className={`text-xs font-medium ${formData.status ? 'text-gray-400' : 'text-blue-600'}`}>ON</span>
                      <span className={`text-xs font-medium ${formData.status ? 'text-gray-700' : 'text-gray-400'}`}>OFF</span>
                    </div>
                  </div>
                  <span className="text-sm font-medium text-gray-700">{formData.status ? "Closed" : "Active"}</span>
                </div>
              </div>

              <div className="grid gap-6 md:grid-cols-3 relative z-10">
                <div className="space-y-2 group">
                  <Label htmlFor="startDate" className="text-sm font-medium text-gray-700 flex items-center gap-2 group-hover:text-blue-600 transition-colors">
                    <Calendar className="h-3.5 w-3.5 text-gray-500 group-hover:text-blue-500 transition-colors" /> Start Date <span className="text-red-500">*</span>
                  </Label>
                  <div className="relative">
                    <Input 
                      type="date" 
                      id="startDate" 
                      value={formData.startDate} 
                      onChange={handleChange} 
                      required 
                      className="bg-white h-10 rounded-lg pl-9 text-sm focus:ring-blue-200 shadow-sm hover:shadow-md transition-shadow"
                    />
                    <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  </div>
                </div>
                
                <div className="space-y-2 group">
                  <Label htmlFor="endDate" className="text-sm font-medium text-gray-700 flex items-center gap-2 group-hover:text-blue-600 transition-colors">
                    <Calendar className="h-3.5 w-3.5 text-gray-500 group-hover:text-blue-500 transition-colors" /> End Date <span className="text-red-500">*</span>
                  </Label>
                  <div className="relative">
                    <Input 
                      type="date" 
                      id="endDate" 
                      value={formData.endDate} 
                      onChange={handleChange} 
                      required 
                      className="bg-white h-10 rounded-lg pl-9 text-sm focus:ring-blue-200 shadow-sm hover:shadow-md transition-shadow"
                    />
                    <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  </div>
                </div>
                
                <div className="space-y-2 group">
                  <Label htmlFor="expectedCalls" className="text-sm font-medium text-gray-700 flex items-center gap-2 group-hover:text-blue-600 transition-colors">
                    <div className="h-3.5 w-3.5 text-gray-500 flex items-center justify-center group-hover:text-blue-500 transition-colors">#</div> Expected Calls <span className="text-red-500">*</span>
                  </Label>
                  <div className="relative">
                    <Input 
                      type="number" 
                      id="expectedCalls" 
                      value={formData.expectedCalls} 
                      onChange={handleChange} 
                      min="0" 
                      required 
                      className="bg-white h-10 rounded-lg pl-9 text-sm focus:ring-blue-200 shadow-sm hover:shadow-md transition-shadow"
                    />
                    <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">#</span>
                  </div>
                </div>
              </div>

              <div>
                  <Select 
                    onValueChange={(value) => setFormData(prev => ({ ...prev, geographyId: value }))} 
                    value={formData.geographyId}
                  >
                    <SelectTrigger className="w-full bg-white h-10 rounded-lg text-sm focus:ring-blue-200 shadow-sm hover:shadow-md transition-shadow">
                      <SelectValue placeholder="Select geography" />
                    </SelectTrigger>
                    <SelectContent className="bg-white">
                      {geographies.map((geo) => (
                        <SelectItem key={geo.geography_id} value={String(geo.geography_id)}>
                          {geo.country}, {geo.city} ({geo.timezone})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
            </CardContent>
          </Card>

          {/* Client Details Card */}
          <Card className="shadow-sm border border-gray-100 overflow-hidden rounded-xl bg-gradient-to-br from-white to-blue-50">
            <CardHeader className="bg-white border-b border-gray-100 py-4 px-6">
              <CardTitle className="text-lg font-semibold text-gray-800 flex items-center">
                <div className="w-1 h-5 bg-blue-600 mr-3 rounded-full"></div>
                <Users className="h-4 w-4 mr-2 text-blue-600" /> Client Details
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6 p-6 relative">
              {/* Background decorative elements */}
              <div className="absolute top-0 right-0 w-64 h-64 bg-blue-100 rounded-full opacity-20 -mr-20 -mt-20"></div>
              <div className="absolute bottom-0 left-0 w-48 h-48 bg-blue-200 rounded-full opacity-10 -ml-16 -mb-16"></div>
              
              {/* Client Company Section */}
              <div className="space-y-2 group relative z-10">
                <Label htmlFor="client_company" className="text-sm font-medium text-gray-700 flex items-center gap-2 group-hover:text-blue-600 transition-colors">
                  <Building className="h-3.5 w-3.5 text-gray-500 group-hover:text-blue-500 transition-colors" /> Client Company
                </Label>
                <div className="relative">
                  <Input 
                    id="client_company" 
                    value={clientCompany.company_name} 
                    onChange={handleClientCompanyChange} 
                    placeholder="Enter client company name"
                    className="bg-white h-10 rounded-lg pl-9 text-sm focus:ring-blue-200 shadow-sm hover:shadow-md transition-shadow"
                  />
                  <Building className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                </div>
              </div>

              {/* Client Members Section */}
              <div className="space-y-4 mt-6 relative z-10">
                <div className="flex items-center justify-between">
                  <Label className="text-sm font-medium text-gray-700 flex items-center gap-2">
                    <Users className="h-3.5 w-3.5 text-gray-500" /> Client Members
                  </Label>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-2 group">
                    <Label htmlFor="client_name" className="text-sm font-medium text-gray-700 flex items-center gap-2 group-hover:text-blue-600 transition-colors">
                      <div className="h-3.5 w-3.5 text-gray-500 flex items-center justify-center group-hover:text-blue-500 transition-colors">
                        <span className="block h-2 w-2 rounded-full bg-current"></span>
                      </div> Name
                    </Label>
                    <div className="relative">
                      <Input 
                        id="client_name" 
                        value={newClientMember.client_name} 
                        onChange={handleClientMemberChange}
                        placeholder="Enter client name" 
                        className="bg-white h-10 rounded-lg pl-9 text-sm focus:ring-blue-200 shadow-sm hover:shadow-md transition-shadow" 
                      />
                      <Users className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    </div>
                  </div>
                  <div className="space-y-2 group">
                    <Label htmlFor="client_email" className="text-sm font-medium text-gray-700 flex items-center gap-2 group-hover:text-blue-600 transition-colors">
                      <div className="h-3.5 w-3.5 text-gray-500 flex items-center justify-center group-hover:text-blue-500 transition-colors">@</div> Email
                    </Label>
                    <div className="relative">
                      <Input 
                        id="client_email" 
                        type="email"
                        value={newClientMember.client_email} 
                        onChange={handleClientMemberChange}
                        placeholder="Enter email address" 
                        className="bg-white h-10 rounded-lg pl-9 text-sm focus:ring-blue-200 shadow-sm hover:shadow-md transition-shadow" 
                      />
                      <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">@</div>
                    </div>
                  </div>
                  <div className="space-y-2 group">
                    <Label htmlFor="phone_number" className="text-sm font-medium text-gray-700 flex items-center gap-2 group-hover:text-blue-600 transition-colors">
                      <div className="h-3.5 w-3.5 text-gray-500 flex items-center justify-center group-hover:text-blue-500 transition-colors">#</div> Phone Number
                    </Label>
                    <div className="relative">
                      <Input 
                        id="phone_number" 
                        value={newClientMember.phone_number} 
                        onChange={handleClientMemberChange}
                        placeholder="Enter phone number" 
                        className="bg-white h-10 rounded-lg pl-9 text-sm focus:ring-blue-200 shadow-sm hover:shadow-md transition-shadow" 
                      />
                      <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">#</div>
                    </div>
                  </div>
                </div>
                <Button 
                  type="button" 
                  onClick={addClientMember} 
                  className="bg-blue-600 hover:bg-blue-700 text-white flex items-center gap-1 py-2 h-10 px-4 text-sm rounded-lg shadow-sm hover:shadow-md transition-all"
                >
<Plus className="h-4 w-4 mr-1" /> Add Client Member
                </Button>
                
                {clientMembers.length > 0 && (
                  <div className="space-y-2 mt-4">
                    <Label className="text-sm font-medium text-gray-700">Added Client Members:</Label>
                    {clientMembers.map((member, index) => (
                      <div key={index} className="flex items-center justify-between bg-white p-3 rounded-lg border border-gray-200 shadow-sm hover:shadow-md hover:border-blue-200 transition-all">
                        <div>
                          <span className="font-medium">{member.client_name}</span>
                          <div className="text-sm text-gray-500">{member.client_email}</div>
                          <div className="text-sm text-gray-500">{member.phone_number}</div>
                        </div>
                        <Button 
                          type="button" 
                          variant="ghost" 
                          size="sm" 
                          onClick={() => removeClientMember(index)}
                          className="text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-full h-8 w-8 p-0 transition-colors"
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Companies of Interest Card */}
          <Card className="shadow-sm border border-gray-100 overflow-hidden rounded-xl bg-gradient-to-br from-white to-blue-50 group">
            <CardHeader className="bg-white border-b border-gray-100 py-4 px-6 group-hover:bg-blue-50/50 transition-colors">
              <CardTitle className="text-lg font-semibold text-gray-800 flex items-center">
                <div className="w-1 h-5 bg-blue-600 mr-3 rounded-full"></div>
                <Building className="h-4 w-4 mr-2 text-blue-600 group-hover:text-blue-500 transition-colors" />Companies of Interest
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6 p-6 relative">
              {/* Background decorative elements */}
              <div className="absolute top-0 right-0 w-64 h-64 bg-blue-100 rounded-full opacity-20 -mr-20 -mt-20"></div>
              <div className="absolute bottom-0 left-0 w-48 h-48 bg-blue-200 rounded-full opacity-10 -ml-16 -mb-16"></div>
              
              <div className="space-y-4 relative z-10">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
                  <div className="md:col-span-2 space-y-2 group">
                    <Label htmlFor="company_name" className="text-sm font-medium text-gray-700 flex items-center gap-2 group-hover:text-blue-600 transition-colors">
                      <Building className="h-3.5 w-3.5 text-gray-500 group-hover:text-blue-500 transition-colors" /> Company Name
                    </Label>
                    <div className="relative">
                      <Input 
                        id="company_name" 
                        value={selectedCompany.company_name} 
                        onChange={handleCompanyChange} 
                        placeholder="Enter company name" 
                        className="bg-white h-10 rounded-lg pl-9 text-sm focus:ring-blue-200 shadow-sm hover:shadow-md transition-shadow" 
                      />
                      <Building className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    </div>
                  </div>
                  <div className="flex space-x-4 items-center">
                    <div className="flex items-center space-x-2">
                      <Checkbox 
                        id="is_past" 
                        checked={selectedCompany.is_past}
                        onCheckedChange={(checked) => handleCheckboxChange("is_past", !!checked)}
                        className="text-blue-600 border-gray-300 focus:ring-blue-200" 
                      />
                      <label htmlFor="is_past" className="text-sm font-medium text-gray-700 cursor-pointer hover:text-blue-600 transition-colors">Former</label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox 
                        id="is_current" 
                        checked={selectedCompany.is_current}
                        onCheckedChange={(checked) => handleCheckboxChange("is_current", !!checked)}
                        className="text-blue-600 border-gray-300 focus:ring-blue-200" 
                      />
                      <label htmlFor="is_current" className="text-sm font-medium text-gray-700 cursor-pointer hover:text-blue-600 transition-colors">Current</label>
                    </div>
                  </div>
                </div>
                
                <Button 
                  type="button" 
                  onClick={addCompany} 
                  className="bg-blue-600 hover:bg-blue-700 text-white flex items-center gap-1 py-2 h-10 w-full px-4 text-sm rounded-lg shadow-sm hover:shadow-md transition-all"
                >
                  <Plus className="h-4 w-4 mr-1" /> Add Company
                </Button>
                
                {formData.companiesOfInterest.length > 0 ? (
                  <div className="mt-4 space-y-2">
                    <Label className="text-sm font-medium text-gray-700">Added Companies:</Label>
                    <div className="space-y-2">
                      {formData.companiesOfInterest.map((company, index) => (
                        <div key={index} className="flex items-center justify-between bg-white p-3 rounded-lg border border-gray-200 shadow-sm hover:shadow-md hover:border-blue-200 transition-all">
                          <div className="flex-1">
                            <div className="font-medium">{company.company_name}</div>
                            <div className="text-sm text-gray-500 flex gap-2">
                              {company.is_past && <span className="bg-gray-100 px-2 py-0.5 rounded-full text-xs">Former</span>}
                              {company.is_current && <span className="bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full text-xs">Current</span>}
                            </div>
                          </div>
                          <Button 
                            type="button" 
                            variant="ghost" 
                            size="sm" 
                            onClick={() => removeCompany(index)}
                            className="text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-full h-8 w-8 p-0 transition-colors"
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-6 border border-dashed border-gray-300 rounded-lg bg-white/60 backdrop-blur-sm">
                    <Building className="h-10 w-10 text-gray-300 mx-auto mb-2" />
                    <p className="text-gray-500">No companies added yet</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Screening Questions Card */}
          <Card className="shadow-sm border border-gray-100 overflow-hidden rounded-xl bg-gradient-to-br from-white to-blue-50 group">
            <CardHeader className="bg-white border-b border-gray-100 py-4 px-6 group-hover:bg-blue-50/50 transition-colors">
              <CardTitle className="text-lg font-semibold text-gray-800 flex items-center justify-between">
                <div className="flex items-center">
                  <div className="w-1 h-5 bg-blue-600 mr-3 rounded-full"></div>
                  <HelpCircle className="h-4 w-4 mr-2 text-blue-600 group-hover:text-blue-500 transition-colors" />Screening Questions
                </div>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6 p-6 relative">
              {/* Background decorative elements */}
              <div className="absolute top-0 right-0 w-64 h-64 bg-blue-100 rounded-full opacity-20 -mr-20 -mt-20"></div>
              <div className="absolute bottom-0 left-0 w-48 h-48 bg-blue-200 rounded-full opacity-10 -ml-16 -mb-16"></div>
              
              <div className="space-y-4 relative z-10">
                <div className="flex-1 space-y-2 group">
                  <Label htmlFor="newQuestion" className="text-sm font-medium text-gray-700 flex items-center gap-2 group-hover:text-blue-600 transition-colors">
                    <ListChecks className="h-3.5 w-3.5 text-gray-500 group-hover:text-blue-500 transition-colors" />Add Question
                  </Label>
                  <div className="relative">
                    <Textarea 
                      id="newQuestion" 
                      value={newQuestion} 
                      onChange={(e) => setNewQuestion(e.target.value)}
                      placeholder="Enter screening question..." 
                      className="min-h-24 resize-y pr-12 bg-white rounded-lg text-sm focus:ring-blue-200 shadow-sm hover:shadow-md transition-shadow" 
                    />
                    <Button 
                      type="button" 
                      onClick={addQuestion}
                      className="absolute bottom-2 right-2 h-8 w-8 p-0 rounded-full bg-blue-600 hover:bg-blue-700 text-white shadow-md"
                    >
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
                
                {formData.screeningQuestions.length > 0 ? (
                  <div className="space-y-4 mt-6">
                    <h3 className="text-sm font-medium text-gray-800 flex items-center gap-2">
                      <span className="bg-blue-100 text-blue-700 w-6 h-6 rounded-full inline-flex items-center justify-center text-sm font-semibold">
                        {formData.screeningQuestions.length}
                      </span>Questions Added
                    </h3>
                    <div className="space-y-3">
                      {formData.screeningQuestions.map((question, index) => (
                        <div key={index} className="flex items-start p-4 bg-white rounded-lg border border-blue-100 shadow-sm relative group hover:shadow-md hover:border-blue-300 transition-all">
                          <div className="flex-1"><div className="text-gray-800 whitespace-pre-wrap">{question}</div></div>
                          <Button 
                            type="button" 
                            variant="ghost" 
                            size="sm" 
                            onClick={() => removeQuestion(index)}
                            className="absolute top-2 right-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-full h-8 w-8 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-8 border border-dashed border-blue-200 rounded-lg bg-white/60 backdrop-blur-sm">
                    <HelpCircle className="h-12 w-12 text-blue-300 mx-auto mb-3" />
                    <p className="text-blue-600 font-medium">No screening questions added yet</p>
                    <p className="text-blue-400 text-sm mt-1">Add questions to help screen candidates</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Client Requirements Card */}
          <Card className="shadow-sm border border-gray-100 overflow-hidden rounded-xl bg-gradient-to-br from-white to-blue-50 group">
            <CardHeader className="bg-white border-b border-gray-100 py-4 px-6 group-hover:bg-blue-50/50 transition-colors">
              <CardTitle className="text-lg font-semibold text-gray-800 flex items-center">
                <div className="w-1 h-5 bg-blue-600 mr-3 rounded-full"></div>
                <FileText className="h-4 w-4 mr-2 text-blue-600 group-hover:text-blue-500 transition-colors" />Client Requirements
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6 p-6 relative">
              {/* Background decorative elements */}
              <div className="absolute top-0 right-0 w-64 h-64 bg-blue-100 rounded-full opacity-20 -mr-20 -mt-20"></div>
              <div className="absolute bottom-0 left-0 w-48 h-48 bg-blue-200 rounded-full opacity-10 -ml-16 -mb-16"></div>
              
              <div className="space-y-4 relative z-10">
                <div className="flex-1 space-y-2 group">
                  <Label htmlFor="newRequirement" className="text-sm font-medium text-gray-700 flex items-center gap-2 group-hover:text-blue-600 transition-colors">
                    <ListChecks className="h-3.5 w-3.5 text-gray-500 group-hover:text-blue-500 transition-colors" />Add Requirement
                  </Label>
                  <div className="relative">
                    <Textarea 
                      id="newRequirement" 
                      value={newRequirement} 
                      onChange={(e) => setNewRequirement(e.target.value)}
                      placeholder="Enter client requirement..." 
                      className="min-h-24 resize-y pr-12 bg-white rounded-lg text-sm focus:ring-blue-200 shadow-sm hover:shadow-md transition-shadow" 
                    />
                    <Button 
                      type="button" 
                      onClick={addRequirement}
                      className="absolute bottom-2 right-2 h-8 w-8 p-0 rounded-full bg-blue-600 hover:bg-blue-700 text-white shadow-md"
                    >
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
                
                {formData.clientRequirements.length > 0 ? (
                  <div className="space-y-4 mt-6">
                    <h3 className="text-sm font-medium text-gray-800 flex items-center gap-2">
                      <span className="bg-blue-100 text-blue-700 w-6 h-6 rounded-full inline-flex items-center justify-center text-sm font-semibold">
                        {formData.clientRequirements.length}
                      </span>Requirements Added
                    </h3>
                    <div className="space-y-3">
                      {formData.clientRequirements.map((req, index) => (
                        <div key={index} className="flex items-start p-4 bg-white rounded-lg border border-blue-100 shadow-sm relative group hover:shadow-md hover:border-blue-300 transition-all">
                          <div className="flex-1"><div className="text-gray-800 whitespace-pre-wrap">{req}</div></div>
                          <Button 
                            type="button" 
                            variant="ghost" 
                            size="sm" 
                            onClick={() => removeRequirement(index)}
                            className="absolute top-2 right-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-full h-8 w-8 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-8 border border-dashed border-blue-200 rounded-lg bg-white/60 backdrop-blur-sm">
                    <FileText className="h-12 w-12 text-blue-300 mx-auto mb-3" />
                    <p className="text-blue-600 font-medium">No requirements added yet</p>
                    <p className="text-blue-400 text-sm mt-1">Add specific requirements from the client</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Project Files Card */}
          <Card className="shadow-sm border border-gray-100 overflow-hidden rounded-xl bg-gradient-to-br from-white to-blue-50 group">
            <CardHeader className="bg-white border-b border-gray-100 py-4 px-6 group-hover:bg-blue-50/50 transition-colors">
              <CardTitle className="text-lg font-semibold text-gray-800 flex items-center">
                <div className="w-1 h-5 bg-blue-600 mr-3 rounded-full"></div>
                <FileUp className="h-4 w-4 mr-2 text-blue-600 group-hover:text-blue-500 transition-colors" />Project Files
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6 relative">
              {/* Background decorative elements */}
              <div className="absolute top-0 right-0 w-64 h-64 bg-blue-100 rounded-full opacity-20 -mr-20 -mt-20"></div>
              <div className="absolute bottom-0 left-0 w-48 h-48 bg-blue-200 rounded-full opacity-10 -ml-16 -mb-16"></div>
              
              <div className="space-y-2 relative z-10 group">
                <Label htmlFor="file" className="text-sm font-medium text-gray-700 flex items-center gap-2 group-hover:text-blue-600 transition-colors">
                  <FileUp className="h-3.5 w-3.5 text-gray-500 group-hover:text-blue-500 transition-colors" /> Upload Document (Optional)
                </Label>
                {!formData.file ? (
                  <div className="border-2 border-dashed border-blue-200 rounded-lg p-8 text-center hover:border-blue-400 transition-colors cursor-pointer bg-white/60 backdrop-blur-sm hover:bg-blue-50/60">
                    <Input type="file" id="file" onChange={handleChange} className="hidden" accept=".pdf,.doc,.docx,.xls,.xlsx" />
                    <label htmlFor="file" className="cursor-pointer flex flex-col items-center gap-2">
                      <FileUp className="h-14 w-14 text-blue-500" />
                      <span className="text-sm text-gray-600 mt-2 font-medium">Drag and drop or click to upload</span>
                      <span className="text-xs text-gray-500">Supported formats: PDF, DOC, DOCX, XLS, XLSX (Max 10MB)</span>
                    </label>
                  </div>
                ) : (
                  <div className="flex items-center p-4 bg-white border border-blue-200 rounded-lg shadow-sm hover:shadow-md transition-all">
                    <FilePlus className="h-10 w-10 text-blue-500 mr-4" />
                    <div className="flex-1">
                      <p className="font-medium text-blue-700">{formData.file.name}</p>
                      <p className="text-sm text-blue-500">{Math.round(formData.file.size / 1024)} KB</p>
                      {fileUploading && (
                        <div className="mt-2 flex items-center text-blue-600">
                          <Loader2 className="h-4 w-4 animate-spin mr-2" />
                          <span>Preparing for upload...</span>
                        </div>
                      )}
                    </div>
                    <Button type="button" variant="ghost" size="sm" onClick={() => setFormData(prev => ({ ...prev, file: null }))}
                            className="text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-full h-8 w-8 p-0 transition-colors">
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          <div className="flex justify-end gap-4 pt-4">
            <Button 
              variant="outline" 
              type="button" 
              onClick={() => router.push("/projects")}
              className="h-10 px-5 border-gray-300 text-gray-700 hover:bg-gray-100 transition-colors rounded-lg"
            >
              Cancel
            </Button>
            <Button 
              type="submit" 
              disabled={loading || fileUploading}
              className="h-10 px-5 bg-blue-600 hover:bg-blue-700 text-white transition-colors rounded-lg shadow-sm hover:shadow-md"
            >
              {loading ? (<><Loader2 className="mr-2 h-4 w-4 animate-spin" />Creating...</>) : (<>Create Project</>)}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}