"use client";

import { useState, useEffect } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Trash2, Users, Building, Loader2 } from "lucide-react";
import API from "@/services/api";

export default function ClientDetailsForm({ projectId, formData, setFormData }) {
  const [newMember, setNewMember] = useState({
    client_name: "",
    client_email: "",
    phone_number: ""
  });

  const [loading, setLoading] = useState(false);
  const [projectCompany, setProjectCompany] = useState("");

  // Fetch client data when component mounts or projectId changes
  useEffect(() => {
    if (!projectId) return;
    fetchClientData();
    fetchProjectCompanyName();
  }, [projectId]);

  const fetchClientData = async () => {
    try {
      setLoading(true);
      
      // Fetch client companies for this project
      const companiesRes = await API.get("/project_client_company/");
      const projectCompanies = companiesRes.data.filter(
        company => company.project_id === parseInt(projectId)
      );
      
      // Fetch client teams
      const teamsRes = await API.get("/project_client_team/");
      const projectTeams = teamsRes.data.filter(
        team => team.project_id === parseInt(projectId)
      );
      
      // Fetch client members
      const membersRes = await API.get("/client_members/");
      const clientMembers = membersRes.data;
      
      // Prepare client teams with member data
      const teamsWithMembers = projectTeams.map(team => {
        const member = clientMembers.find(
          m => m.client_member_id === team.client_member_id
        );
        
        return {
          ...team,
          member: member || null
        };
      }).filter(team => team.member !== null);
      
      // Update formData with fetched client details
      setFormData(prev => ({
        ...prev,
        clientCompanies: projectCompanies,
        clientTeams: teamsWithMembers
      }));
      
    } catch (error) {
      console.error("Error fetching client data:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchProjectCompanyName = async () => {
    try {
      // Fetch project client companies
      const projectCompaniesRes = await API.get("/project_client_company/");
      
      // Find the company for this specific project
      const projectCompany = projectCompaniesRes.data.find(
        company => company.project_id === parseInt(projectId)
      );
  
      if (projectCompany && projectCompany.company_name) {
        setProjectCompany(projectCompany.company_name);
      }
    } catch (error) {
      console.error("Error fetching project company name:", error);
    }
  };

  const handleChangeClientName = (event) => {
    setProjectCompany(event.target.value);
  };

  const handleAddMember = () => {
    if (!newMember.client_name) return;

    setFormData(prev => ({
      ...prev,
      clientTeams: [
        ...(prev.clientTeams || []),
        {
          project_id: projectId,
          client_member_id: null,
          member: {
            ...newMember,
            client_member_id: null
          }
        }
      ]
    }));

    // Reset form
    setNewMember({
      client_name: "",
      client_email: "",
      phone_number: ""
    });
  };

  const handleRemoveMember = (index) => {
    setFormData(prev => ({
      ...prev,
      clientTeams: prev.clientTeams.filter((_, i) => i !== index)
    }));
  };

  const handleMemberChange = (index, field, value) => {
    setFormData(prev => {
      const updatedTeams = [...(prev.clientTeams || [])];
      
      if (!updatedTeams[index].member) {
        updatedTeams[index].member = {
          client_name: "",
          client_email: "",
          phone_number: "",
          client_member_id: updatedTeams[index].client_member_id
        };
      }
      
      updatedTeams[index].member[field] = value;
      return {
        ...prev,
        clientTeams: updatedTeams
      };
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
          <div className="text-center">
            <Loader2 className="h-8 w-8 animate-spin text-blue-600 mx-auto mb-4" />
            <p className="text-gray-500">Loading client details...</p>
          </div>
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
          {/* Combined Client Companies and Team Section */}
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-6 space-y-6">
            {/* Client Company Display */}
            {/* Client Company Display */}
            {projectCompany && (
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
            )}

            {/* Existing Companies Section */}
            {formData.clientCompanies && formData.clientCompanies.length > 0 && (
              <div>
                <h3 className="text-sm font-semibold text-gray-700 mb-3 flex items-center">
                  <Building className="h-4 w-4 mr-2 text-blue-500" />
                  Client Companies
                </h3>
                <div className="space-y-2">
                  {formData.clientCompanies.map((company, index) => (
                    <div 
                      key={company.client_company_id || `temp-${index}`}
                      className="bg-white p-3 rounded-lg border border-gray-200 flex justify-between items-center"
                    >
                      <span className="text-sm text-gray-800">{company.company_name}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Client Team Members Section */}
            <div>
              <h3 className="text-sm font-semibold text-gray-700 mb-3 flex items-center">
                <Users className="h-4 w-4 mr-2 text-blue-500" />
                Client Team Members
              </h3>
              
              {formData.clientTeams && formData.clientTeams.length > 0 ? (
                <div className="space-y-3">
                  {formData.clientTeams.map((team, index) => {
                    const member = team.member || {};
                    const memberName = member.client_name || "Unknown Member";
                    const memberEmail = member.client_email || "";
                    const memberPhone = member.phone_number || "";
                    
                    return (
                      <div 
                        key={index} 
                        className="bg-white p-3 rounded-lg border border-gray-200"
                      >
                        {/* <div className="flex justify-end items-center mb-2">
                          <Button 
                            type="button" 
                            variant="ghost" 
                            size="sm" 
                            onClick={() => handleRemoveMember(index)}
                            className="text-red-500 hover:bg-red-50 rounded-full"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div> */}
                        
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-2 items-center">
                          <Input 
                            value={memberName}
                            onChange={(e) => handleMemberChange(index, "client_name", e.target.value)}
                            placeholder="Member name"
                            className="text-sm h-8"
                          />
                          <Input 
                            value={memberEmail}
                            onChange={(e) => handleMemberChange(index, "client_email", e.target.value)}
                            placeholder="Email address"
                            className="text-sm h-8"
                          />
                          <Input 
                            value={memberPhone}
                            onChange={(e) => handleMemberChange(index, "phone_number", e.target.value)}
                            placeholder="Phone number"
                            className="text-sm h-8"
                          />
                          
                          {/* Tombol trash di ujung kanan */}
                          <div className="flex justify-end">
                            <Button 
                              type="button" 
                              variant="ghost" 
                              size="sm" 
                              onClick={() => handleRemoveMember(index)}
                              className="text-red-500 hover:bg-red-50 rounded-full"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>

                        
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="text-sm text-gray-500 bg-white p-3 rounded-lg border border-gray-200 text-center">
                  No team members added
                </div>
              )}
            </div>

            {/* Add New Member Form */}
            <div className="bg-white p-4 rounded-lg border border-gray-200">
              <h4 className="text-sm font-semibold text-gray-700 mb-3">Add New Team Member</h4>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <Input 
                  value={newMember.client_name}
                  onChange={(e) => setNewMember({...newMember, client_name: e.target.value})}
                  placeholder="Member name*"
                  className="text-sm"
                />
                <Input 
                  value={newMember.client_email}
                  onChange={(e) => setNewMember({...newMember, client_email: e.target.value})}
                  placeholder="Email address"
                  className="text-sm"
                />
                <Input 
                  value={newMember.phone_number}
                  onChange={(e) => setNewMember({...newMember, phone_number: e.target.value})}
                  placeholder="Phone number"
                  className="text-sm"
                />
              </div>
              <div className="mt-3 flex justify-end">
                <Button 
                  onClick={handleAddMember}
                  disabled={!newMember.client_name}
                  className="bg-blue-600 hover:bg-blue-700 text-white"
                >
                  Add Member
                </Button>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
