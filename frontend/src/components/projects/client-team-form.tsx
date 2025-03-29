// /components/projects/client-details-form.jsx
"use client";

import { useState, useEffect } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, Trash2, Users, Building, Edit, Check, X } from "lucide-react";

export default function ClientDetailsForm({ projectId, formData, setFormData }) {
  const [newMember, setNewMember] = useState({
    client_name: "",
    client_email: "",
    phone_number: "",
    client_company_id: ""
  });

  // Track which company is being edited
  const [editingCompanyIndex, setEditingCompanyIndex] = useState(null);
  const [editedCompanyName, setEditedCompanyName] = useState("");
  
  // Ensure we display existing client companies when the component loads
  useEffect(() => {
    const fetchClientCompanies = async () => {
      try {
        const response = await API.get(`/project_client_company/`);
        if (response.data) {
          // Filter companies for this project
          const projectCompanies = response.data.filter(
            company => company.project_id === parseInt(projectId) || company.project_id === projectId
          );
          
          // Update form data with the fetched companies
          setFormData(prev => ({
            ...prev,
            clientCompanies: projectCompanies
          }));
        }
      } catch (error) {
        console.error("Error fetching client companies:", error);
      }
    };
    
    // Only fetch if there are no client companies already loaded
    if (!formData.clientCompanies || formData.clientCompanies.length === 0) {
      fetchClientCompanies();
    }
  }, [projectId, setFormData]);

  // Filter client companies to only show ones for this project
  const projectClientCompanies = formData.clientCompanies
    ? formData.clientCompanies.filter(company => 
        company.project_id === parseInt(projectId) || company.project_id === projectId)
    : [];

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
      phone_number: "",
      client_company_id: ""
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
          client_company_id: "",
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

  // Start editing a company name
  const startEditingCompany = (index) => {
    setEditingCompanyIndex(index);
    setEditedCompanyName(projectClientCompanies[index].company_name);
  };

  // Save edited company name
  const saveCompanyEdit = () => {
    if (!editedCompanyName.trim()) return;
    
    setFormData(prev => {
      const updatedCompanies = [...prev.clientCompanies];
      const companyIndex = updatedCompanies.findIndex(
        c => c.client_company_id === projectClientCompanies[editingCompanyIndex].client_company_id
      );
      
      if (companyIndex !== -1) {
        updatedCompanies[companyIndex] = {
          ...updatedCompanies[companyIndex],
          company_name: editedCompanyName
        };
      }
      
      return {
        ...prev,
        clientCompanies: updatedCompanies
      };
    });
    
    setEditingCompanyIndex(null);
  };

  // Cancel company name editing
  const cancelCompanyEdit = () => {
    setEditingCompanyIndex(null);
  };

  return (
    <Card className="shadow-lg border-0 overflow-hidden">
      <CardHeader className="bg-white border-b border-gray-100 py-4">
        <CardTitle className="text-xl font-semibold text-gray-800 flex items-center">
          <div className="w-1 h-6 bg-blue-600 mr-3 rounded-full"></div>
          <Building className="h-5 w-5 mr-2" />Client Details
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6 p-6 bg-white">
        {/* Client Companies */}
        <div className="mb-6">
          <Label className="font-medium text-gray-700 mb-3 block">Client Companies</Label>
          
          {/* Existing Companies */}
          {projectClientCompanies.length > 0 ? (
            <div className="space-y-2 mb-4">
              {projectClientCompanies.map((company, index) => (
                <div key={company.client_company_id || `temp-${index}`} className="flex items-center justify-between bg-gray-50 p-3 rounded-md border border-gray-200 shadow-sm">
                  {editingCompanyIndex === index ? (
                    <div className="flex-1 flex items-center">
                      <Input 
                        value={editedCompanyName}
                        onChange={(e) => setEditedCompanyName(e.target.value)}
                        className="flex-1"
                        autoFocus
                      />
                      <div className="flex space-x-1 ml-2">
                        <Button 
                          type="button" 
                          variant="ghost" 
                          size="sm" 
                          onClick={saveCompanyEdit}
                          className="text-green-500 hover:text-green-700 hover:bg-green-50 rounded-full h-8 w-8 p-0"
                        >
                          <Check className="h-5 w-5" />
                        </Button>
                        <Button 
                          type="button" 
                          variant="ghost" 
                          size="sm" 
                          onClick={cancelCompanyEdit}
                          className="text-red-500 hover:text-red-700 hover:bg-red-50 rounded-full h-8 w-8 p-0"
                        >
                          <X className="h-5 w-5" />
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <>
                      <span className="font-medium">{company.company_name}</span>
                      <Button 
                        type="button" 
                        variant="ghost" 
                        size="sm" 
                        onClick={() => startEditingCompany(index)}
                        className="text-blue-500 hover:text-blue-700 hover:bg-blue-50 rounded-full h-8 w-8 p-0"
                      >
                        <Edit className="h-5 w-5" />
                      </Button>
                    </>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-6 border border-dashed border-gray-300 rounded-md bg-gray-50 mb-4">
              <p className="text-gray-500">No client companies added yet</p>
            </div>
          )}
        </div>

        {/* Client Team */}
        <div>
          <Label className="font-medium text-gray-700 mb-3 block">Client Members</Label>
          
          {/* Existing Members List */}
          {formData.clientTeams && formData.clientTeams.length > 0 ? (
            <div className="space-y-3 mb-4">
              {formData.clientTeams.map((team, index) => {
                const member = team.member || {};
                const memberName = member.client_name || "Unknown Member";
                const memberEmail = member.client_email || "";
                const memberPhone = member.phone_number || "";
                const memberCompanyId = member.client_company_id || "";
                
                return (
                  <div key={index} className="bg-gray-50 p-3 rounded-md border border-gray-200 shadow-sm">
                    <div className="flex justify-between mb-2">
                      <h3 className="font-medium">Team Member</h3>
                      <Button 
                        type="button" 
                        variant="ghost" 
                        size="sm" 
                        onClick={() => handleRemoveMember(index)}
                        className="text-gray-500 hover:text-red-500 hover:bg-red-50 rounded-full h-8 w-8 p-0"
                      >
                        <Trash2 className="h-5 w-5" />
                      </Button>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      <div>
                        <Label className="text-sm text-gray-600 mb-1 block">Name</Label>
                        <Input 
                          value={memberName}
                          onChange={(e) => handleMemberChange(index, "client_name", e.target.value)}
                          placeholder="Member name"
                          className="bg-white"
                        />
                      </div>
                      <div>
                        <Label className="text-sm text-gray-600 mb-1 block">Email</Label>
                        <Input 
                          value={memberEmail}
                          onChange={(e) => handleMemberChange(index, "client_email", e.target.value)}
                          placeholder="Email address"
                          className="bg-white"
                        />
                      </div>
                      <div>
                        <Label className="text-sm text-gray-600 mb-1 block">Phone</Label>
                        <Input 
                          value={memberPhone}
                          onChange={(e) => handleMemberChange(index, "phone_number", e.target.value)}
                          placeholder="Phone number"
                          className="bg-white"
                        />
                      </div>
                      <div>
                        <Label className="text-sm text-gray-600 mb-1 block">Company</Label>
                        <Select 
                          value={memberCompanyId ? String(memberCompanyId) : "none"} 
                          onValueChange={(value) => handleMemberChange(index, "client_company_id", value !== "none" ? parseInt(value) : null)}
                        >
                          <SelectTrigger className="bg-white">
                            <SelectValue placeholder="Select company" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="none">None</SelectItem>
                            {projectClientCompanies.map((company) => (
                              <SelectItem 
                                key={company.client_company_id} 
                                value={String(company.client_company_id)}
                              >
                                {company.company_name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-6 border border-dashed border-gray-300 rounded-md bg-gray-50 mb-4">
              <p className="text-gray-500">No client team members added yet</p>
            </div>
          )}

          {/* Add New Member Form */}
          <div className="bg-blue-50 p-4 rounded-md border border-blue-100">
            <h4 className="font-medium text-blue-700 mb-3">Add New Team Member</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div>
                <Label className="text-sm text-gray-600 mb-1 block">Name*</Label>
                <Input 
                  value={newMember.client_name}
                  onChange={(e) => setNewMember({...newMember, client_name: e.target.value})}
                  placeholder="Member name"
                  className="bg-white"
                />
              </div>
              <div>
                <Label className="text-sm text-gray-600 mb-1 block">Email</Label>
                <Input 
                  value={newMember.client_email}
                  onChange={(e) => setNewMember({...newMember, client_email: e.target.value})}
                  placeholder="Email address"
                  className="bg-white"
                />
              </div>
              <div>
                <Label className="text-sm text-gray-600 mb-1 block">Phone</Label>
                <Input 
                  value={newMember.phone_number}
                  onChange={(e) => setNewMember({...newMember, phone_number: e.target.value})}
                  placeholder="Phone number"
                  className="bg-white"
                />
              </div>
              <div>
                <Label className="text-sm text-gray-600 mb-1 block">Company</Label>
                <Select 
                  value={newMember.client_company_id ? String(newMember.client_company_id) : "none"} 
                  onValueChange={(value) => setNewMember({...newMember, client_company_id: value !== "none" ? parseInt(value) : null})}
                >
                  <SelectTrigger className="bg-white">
                    <SelectValue placeholder="Select company" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">None</SelectItem>
                    {projectClientCompanies.map((company) => (
                      <SelectItem 
                        key={company.client_company_id} 
                        value={String(company.client_company_id)}
                      >
                        {company.company_name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="mt-3 flex justify-end">
              <Button 
                type="button" 
                onClick={handleAddMember}
                className="bg-blue-600 hover:bg-blue-700 text-white"
                disabled={!newMember.client_name}
              >
                <Plus className="h-4 w-4 mr-1" />
                Add Member
              </Button>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}