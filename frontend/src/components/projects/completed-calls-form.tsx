import React from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { CheckCircle2 } from "lucide-react";
import { TooltipProvider, TooltipRoot, TooltipTrigger, TooltipContent } from "@/components/ui/tooltip";

const CompletedCallsForm = ({ formData, setFormData }) => {
  const handleChange = (e) => {
    const value = e.target.value;
    // Allow only numbers
    if (value === "" || /^[0-9]+$/.test(value)) {
      setFormData({
        ...formData,
        completedCalls: value,
      });
    }
  };

  // Calculate progress percentage
  const calculateProgress = () => {
    const expected = parseInt(formData.expectedCalls) || 0;
    const completed = parseInt(formData.completedCalls) || 0;
    
    if (expected === 0) return 0;
    return Math.min(Math.round((completed / expected) * 100), 100);
  };
  
  const progress = calculateProgress();
  
  // Determine progress color
  const getProgressColor = () => {
    if (progress < 30) return "bg-red-500";
    if (progress < 70) return "bg-yellow-500";
    return "bg-green-500";
  };

  return (
    <Card className="border-0 shadow-md">
      <CardHeader className="bg-slate-50 pb-4 border-b border-slate-100">
        <div className="flex items-center">
          <CheckCircle2 className="h-5 w-5 text-blue-500 mr-2" />
          <CardTitle className="text-lg text-gray-800">Project Progress</CardTitle>
        </div>
        <CardDescription>
          Track and update the number of completed calls for this project
        </CardDescription>
      </CardHeader>
      <CardContent className="p-6">
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <Label htmlFor="expectedCalls" className="text-gray-700">
                Expected Calls
              </Label>
              <Input
                id="expectedCalls"
                type="text"
                className="mt-1 bg-gray-100 text-gray-800 cursor-not-allowed"
                placeholder="Enter expected calls"
                value={formData.expectedCalls}
                disabled
              />
              <p className="text-xs text-gray-500 mt-1">
                To change expected calls, update it in the Project Details section
              </p>
            </div>
            
            <div>
              <Label htmlFor="completedCalls" className="text-gray-700">
                Completed Calls
              </Label>
              <TooltipProvider>
                <TooltipRoot>
                  <TooltipTrigger asChild>
                    <Input
                      id="completedCalls"
                      type="text"
                      className="mt-1"
                      placeholder="Enter completed calls"
                      value={formData.completedCalls}
                      onChange={handleChange}
                    />
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Update the number of completed calls for this project</p>
                  </TooltipContent>
                </TooltipRoot>
              </TooltipProvider>
              <p className="text-xs text-gray-500 mt-1">
                Enter the current number of completed calls
              </p>
            </div>
          </div>
          
          {/* Progress Bar */}
          <div className="mt-6">
            <div className="flex justify-between mb-1">
              <span className="text-sm font-medium text-gray-700">Project Progress</span>
              <span className="text-sm font-medium text-gray-700">{progress}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2.5">
              <div 
                className={`h-2.5 rounded-full ${getProgressColor()}`} 
                style={{ width: `${progress}%` }}
              ></div>
            </div>
            <div className="flex justify-between mt-2">
              <div className="text-xs text-gray-500">
                {formData.completedCalls || 0} / {formData.expectedCalls || 0} calls completed
              </div>
              {progress >= 100 && (
                <div className="text-xs text-green-600 font-medium">
                  Project target completed!
                </div>
              )}
            </div>
          </div>
          
          {/* Information Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
            <div className="bg-blue-50 p-3 rounded-lg border border-blue-100">
              <div className="text-sm font-medium text-blue-700">Expected</div>
              <div className="text-2xl font-bold text-blue-800">{formData.expectedCalls || 0}</div>
              <div className="text-xs text-blue-600">Total calls needed</div>
            </div>
            
            <div className="bg-green-50 p-3 rounded-lg border border-green-100">
              <div className="text-sm font-medium text-green-700">Completed</div>
              <div className="text-2xl font-bold text-green-800">{formData.completedCalls || 0}</div>
              <div className="text-xs text-green-600">Calls finished</div>
            </div>
            
            <div className="bg-yellow-50 p-3 rounded-lg border border-yellow-100">
              <div className="text-sm font-medium text-yellow-700">Remaining</div>
              <div className="text-2xl font-bold text-yellow-800">
                {Math.max(0, (parseInt(formData.expectedCalls) || 0) - (parseInt(formData.completedCalls) || 0))}
              </div>
              <div className="text-xs text-yellow-600">Calls to complete</div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default CompletedCallsForm;