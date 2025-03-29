import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { toast } from "react-toastify";
import { Building, Plus, X } from "lucide-react";

export default function CompaniesForm({ formData, setFormData }) {
  const [selectedCompany, setSelectedCompany] = useState({ 
    company_name: "", 
    is_past: false, 
    is_current: false 
  });

  const handleCompanyChange = (e) => {
    const { id, value } = e.target;
    setSelectedCompany(prev => ({ ...prev, [id]: value }));
  };

  const handleCheckboxChange = (id, checked) => {
    setSelectedCompany(prev => ({ ...prev, [id]: checked }));
  };

  const addCompany = () => {
    if (!selectedCompany.company_name.trim()) {
      toast.warning("Please enter a company name");
      return;
    }
    
    // Check for duplicates
    const isDuplicate = formData.companiesOfInterest.some(
      company => company.company_name.toLowerCase() === selectedCompany.company_name.toLowerCase()
    );
    
    if (isDuplicate) {
      toast.warning("This company is already added");
      return;
    }
    
    setFormData(prev => ({ 
      ...prev, 
      companiesOfInterest: [...prev.companiesOfInterest, {...selectedCompany}] 
    }));
    
    setSelectedCompany({ company_name: "", is_past: false, is_current: false });
  };

  const removeCompany = (index) => {
    setFormData(prev => ({ 
      ...prev, 
      companiesOfInterest: prev.companiesOfInterest.filter((_, i) => i !== index) 
    }));
  };

  return (
    <Card className="shadow-lg border-0 overflow-hidden">
      <CardHeader className="bg-white border-b border-gray-100 py-4">
        <CardTitle className="text-xl font-semibold text-gray-800 flex items-center">
          <div className="w-1 h-6 bg-blue-600 mr-3 rounded-full"></div>
          <Building className="h-5 w-5 mr-2" />Companies of Interest
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6 p-6 bg-white">
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
            <div className="md:col-span-2">
              <Label htmlFor="company_name" className="font-medium text-gray-700">Company Name</Label>
              <Input 
                id="company_name" 
                value={selectedCompany.company_name} 
                onChange={handleCompanyChange} 
                placeholder="Enter company name" 
                className="mt-1" 
              />
            </div>
            <div className="flex space-x-4 items-center">
              <div className="flex items-center space-x-2">
                <Checkbox 
                  id="is_past" 
                  checked={selectedCompany.is_past}
                  onCheckedChange={(checked) => handleCheckboxChange("is_past", !!checked)} 
                />
                <label htmlFor="is_past" className="text-sm font-medium">Past</label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox 
                  id="is_current" 
                  checked={selectedCompany.is_current}
                  onCheckedChange={(checked) => handleCheckboxChange("is_current", !!checked)} 
                />
                <label htmlFor="is_current" className="text-sm font-medium">Current</label>
              </div>
            </div>
          </div>
          
          <Button type="button" onClick={addCompany} className="w-full bg-blue-600 hover:bg-blue-700 text-white">
            <Plus className="h-4 w-4 mr-1" /> Add Company
          </Button>
          
          {formData.companiesOfInterest.length > 0 ? (
            <div className="mt-4 space-y-2">
              <Label className="font-medium text-gray-700">Companies:</Label>
              <div className="space-y-2">
                {formData.companiesOfInterest.map((company, index) => (
                  <div key={index} className="flex items-center justify-between bg-gray-50 p-3 rounded-md border border-gray-200 shadow-sm">
                    <div className="flex-1">
                      <div className="font-medium">{company.company_name}</div>
                      <div className="text-sm text-gray-500 flex gap-2">
                        {company.is_past && <span className="bg-gray-100 px-2 py-0.5 rounded-full text-xs">Past</span>}
                        {company.is_current && <span className="bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full text-xs">Current</span>}
                      </div>
                    </div>
                    <Button 
                      type="button" 
                      variant="ghost" 
                      size="sm" 
                      onClick={() => removeCompany(index)}
                      className="text-gray-500 hover:text-red-500 hover:bg-red-50 rounded-full h-8 w-8 p-0"
                    >
                      <X className="h-5 w-5" />
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="text-center py-6 border border-dashed border-gray-300 rounded-md bg-gray-50">
              <p className="text-gray-500">No companies added yet</p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}