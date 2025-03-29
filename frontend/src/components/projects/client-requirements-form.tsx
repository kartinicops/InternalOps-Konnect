import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "react-toastify";
import { FileText, ListChecks, Plus, X } from "lucide-react";

export default function ClientRequirementsForm({ formData, setFormData }) {
  const [newRequirement, setNewRequirement] = useState("");

  const addRequirement = () => {
    if (!newRequirement.trim()) {
      toast.warning("Please enter a requirement");
      return;
    }
    
    // Check for duplicates
    const isDuplicate = formData.clientRequirements.some(
      req => req.toLowerCase() === newRequirement.trim().toLowerCase()
    );
    
    if (isDuplicate) {
      toast.warning("This requirement is already added");
      return;
    }
    
    setFormData(prev => ({ 
      ...prev, 
      clientRequirements: [...prev.clientRequirements, newRequirement.trim()] 
    }));
    
    setNewRequirement("");
  };
  
  const removeRequirement = (index) => {
    setFormData(prev => ({ 
      ...prev, 
      clientRequirements: prev.clientRequirements.filter((_, i) => i !== index) 
    }));
  };

  return (
    <Card className="shadow-lg border-0 overflow-hidden">
      <CardHeader className="bg-white border-b border-gray-100 py-4">
        <CardTitle className="text-xl font-semibold text-gray-800 flex items-center">
          <div className="w-1 h-6 bg-blue-600 mr-3 rounded-full"></div>
          <FileText className="h-5 w-5 mr-2 text-blue-600" />Client Requirements
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6 p-6 bg-white">
        <div className="space-y-4">
          <div className="flex-1 space-y-2">
            <Label htmlFor="newRequirement" className="font-medium text-gray-700 flex items-center gap-2">
              <ListChecks className="h-4 w-4 text-blue-600" />Add Requirement
            </Label>
            <div className="relative">
              <Textarea 
                id="newRequirement" 
                value={newRequirement} 
                onChange={(e) => setNewRequirement(e.target.value)}
                placeholder="Enter client requirement..." 
                className="min-h-24 resize-y pr-12" 
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
              <h3 className="font-medium text-gray-800 flex items-center gap-2">
                <span className="bg-blue-100 text-blue-700 w-6 h-6 rounded-full inline-flex items-center justify-center text-sm font-semibold">
                  {formData.clientRequirements.length}
                </span>Requirements Added
              </h3>
              <div className="space-y-3">
                {formData.clientRequirements.map((req, index) => (
                  <div key={index} className="flex items-start p-4 bg-blue-50 rounded-lg border border-blue-100 shadow-sm relative group">
                    <div className="flex-1">
                      <div className="text-gray-800 whitespace-pre-wrap">{req}</div>
                    </div>
                    <Button 
                      type="button" 
                      variant="ghost" 
                      size="sm" 
                      onClick={() => removeRequirement(index)}
                      className="absolute top-2 right-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-full h-8 w-8 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <X className="h-5 w-5" />
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="text-center py-8 border border-dashed border-blue-200 rounded-lg bg-blue-50">
              <FileText className="h-12 w-12 text-blue-300 mx-auto mb-3" />
              <p className="text-blue-600 font-medium">No requirements added yet</p>
              <p className="text-blue-400 text-sm mt-1">Add specific requirements from the client</p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}