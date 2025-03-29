"use client";

import { useState, useEffect } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Trash2, Building, Plus, Loader2 } from "lucide-react";
import API from "@/services/api";

export default function ClientDetailsFormEdit({ projectId, formData, setFormData }) {
  const [loading, setLoading] = useState(false);
  const [projectCompany, setProjectCompany] = useState("");
  const [clientCompanyId, setClientCompanyId] = useState(null);

  useEffect(() => {
    if (!projectId) return;
    fetchProjectClientCompanyId();
  }, [projectId]);

  useEffect(() => {
    if (!clientCompanyId) return;
    fetchClientCompanyAndMembers();
  }, [clientCompanyId]);

  const fetchProjectClientCompanyId = async () => {
    try {
      setLoading(true);
      const projectRes = await API.get(`/projects/${projectId}`);
      const { client_company_id } = projectRes.data;
      setClientCompanyId(client_company_id);
    } catch (error) {
      console.error("Error fetching client company ID:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchClientCompanyAndMembers = async () => {
    try {
      setLoading(true);
      const companyRes = await API.get("/project_client_company/");
      const companyData = companyRes.data.find(company => company.client_company_id === clientCompanyId);
      setProjectCompany(companyData?.company_name || "");

      const membersRes = await API.get("/client_members/");
      const clientMembers = membersRes.data.filter(member => member.client_company_id === clientCompanyId);

      setFormData(prev => ({
        ...prev,
        clientCompanyId: clientCompanyId, // Store the company ID for later use
        clientCompanies: companyData ? [companyData] : [],
        clientTeams: clientMembers.map(member => ({
          project_id: projectId,
          client_member_id: member.client_member_id,
          existing: true, // Mark existing members
          member: {
            client_name: member.client_name,
            client_email: member.client_email,
            phone_number: member.phone_number || "",
            original_email: member.client_email // Store original email for comparison
          }
        }))
      }));
    } catch (error) {
      console.error("Error fetching client company and members:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleChangeClientName = (event) => {
    setProjectCompany(event.target.value);
    
    // Update company name in formData
    setFormData(prev => {
      if (prev.clientCompanies && prev.clientCompanies.length > 0) {
        const updatedCompanies = [...prev.clientCompanies];
        updatedCompanies[0] = {
          ...updatedCompanies[0],
          company_name: event.target.value
        };
        return { ...prev, clientCompanies: updatedCompanies };
      }
      return prev;
    });
  };

  const handleMemberChange = (index, field, value) => {
    setFormData(prev => {
      const updatedTeams = [...(prev.clientTeams || [])];
      if (!updatedTeams[index].member) {
        updatedTeams[index].member = {
          client_name: "",
          client_email: "",
          phone_number: "",
          client_company_id: formData.clientCompanyId
        };
      }
      
      updatedTeams[index].member[field] = value;
      
      // Track changes for existing members
      if (updatedTeams[index].existing) {
        updatedTeams[index].changed = true;
        
        // Special handling for email changes
        if (field === "client_email") {
          updatedTeams[index].email_changed = 
            value !== updatedTeams[index].member.original_email;
        }
      }
      
      return { ...prev, clientTeams: updatedTeams };
    });
  };

  const handleAddMember = () => {
    setFormData(prev => ({
      ...prev,
      clientTeams: [
        ...(prev.clientTeams || []),
        {
          project_id: projectId,
          is_new: true,
          existing: false,
          member: {
            client_name: "",
            client_email: "",
            phone_number: "",
            client_company_id: formData.clientCompanyId // Use the current company ID
          }
        }
      ]
    }));
  };

  const handleDeleteMember = (index) => {
    setFormData(prev => {
      const updatedTeams = [...(prev.clientTeams || [])];
      
      // Simply remove the member from the array
      updatedTeams.splice(index, 1);
      
      return { ...prev, clientTeams: updatedTeams };
    });
  };

  if (loading) {
    return (
      <Card className="shadow-lg border-0 overflow-hidden">
        <CardHeader className="bg-white border-b border-gray-100 py-4">
          <CardTitle className="text-xl font-semibold text-gray-800 flex items-center">
            <div className="w-1 h-6 bg-blue-600 mr-3 rounded-full"></div>
            <Building className="h-5 w-5 mr-2" />Client Details
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6 flex justify-center items-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-blue-600 mx-auto mb-4" />
          <p className="text-gray-500">Loading client details...</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="shadow-lg border-0 overflow-hidden">
      <CardHeader className="bg-white border-b border-gray-100 py-4">
        <CardTitle className="text-xl font-semibold text-gray-800 flex items-center">
          <div className="w-1 h-6 bg-blue-600 mr-3 rounded-full"></div>
          <Building className="h-5 w-5 mr-2" />Client Details
        </CardTitle>
      </CardHeader>
      
      <CardContent className="p-6 bg-white">
        <div className="grid grid-cols-1 gap-6">
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-6 space-y-6">
            <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm">
              <Label htmlFor="companyName" className="text-sm font-medium text-gray-700 mb-1.5 block">
                Client Company
              </Label>
              <div className="flex items-center">
                <Building className="h-5 w-5 mr-2 text-primary" />
                <Input
                  id="companyName"
                  value={projectCompany}
                  onChange={handleChangeClientName}
                  placeholder="Enter client company name"
                  className="flex-1 text-sm"
                />
              </div>
            </div>

            <div className="flex justify-between items-center">
              <h3 className="text-sm font-semibold text-gray-700">Client Team Members</h3>
              <Button 
                type="button" 
                onClick={handleAddMember}
                className="h-8 w-8 p-0 rounded-full bg-blue-600 hover:bg-blue-700 text-white shadow-md"
              >
                <Plus className="h-4 w-4" />
              </Button>
            </div>

            <div className="space-y-3">
              {formData.clientTeams?.map((team, index) => {
                const member = team.member || {};
                return (
                  <div key={index} className="bg-white p-3 rounded-lg border border-gray-200 flex items-center gap-3">
                    <Input 
                      value={member.client_name || ""}
                      onChange={(e) => handleMemberChange(index, "client_name", e.target.value)}
                      placeholder="Member name"
                      className="text-sm h-8"
                    />
                    <Input 
                      value={member.client_email || ""}
                      onChange={(e) => handleMemberChange(index, "client_email", e.target.value)}
                      placeholder="Email address"
                      className={`text-sm h-8 ${team.existing ? "bg-gray-50" : ""}`}
                    />
                    <Input 
                      value={member.phone_number || ""}
                      onChange={(e) => handleMemberChange(index, "phone_number", e.target.value)}
                      placeholder="Phone number"
                      className="text-sm h-8"
                    />
                    <Button type="button" onClick={() => handleDeleteMember(index)} className="text-red-500 hover:text-red-600">
                      <Trash2 className="h-5 w-5" />
                    </Button>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}