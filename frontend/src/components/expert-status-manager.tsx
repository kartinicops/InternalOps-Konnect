'use client';

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectGroup, SelectItem, SelectLabel, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Calendar as CalendarIcon, Clock, Check, AlertCircle, Loader2, User } from "lucide-react";
import API from "@/services/api";
import { toast } from "react-toastify";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { format } from "date-fns";
import { cn } from "@/lib/page";

interface ExpertStatusManagerProps {
  expertId: string;
  projectId?: string | null; // Optional - if provided, will only show status for this project
  onStatusChange?: (statusData: any) => void;
}

export function ExpertStatusManager({ expertId, projectId, onStatusChange = () => {} }: ExpertStatusManagerProps) {
  const [publishedProjects, setPublishedProjects] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [statusData, setStatusData] = useState<{ [key: string]: any }>({});
  const [showManager, setShowManager] = useState(false);
  
  // Date and time selection state
  const [selectedDates, setSelectedDates] = useState<{ [key: string]: Date | null }>({});
  const [selectedTimes, setSelectedTimes] = useState<{ [key: string]: string }>({});
  
  // Project names mapping
  const [projectNames, setProjectNames] = useState<{ [key: string]: string }>({});

  // Status options - each with a unique string id
  const statusOptions = [
    { id: "status-1", numId: 1, label: "Proposed" },
    { id: "status-2", numId: 2, label: "Schedule Call" },
    { id: "status-3", numId: 3, label: "Rejected" }
  ];

  // Load published data for this expert
  useEffect(() => {
    const fetchData = async () => {
      if (!expertId) return;
      
      setIsLoading(true);
      
      try {
        // Fetch all published entries for this expert
        const response = await API.get(`/project_published/`, {
          params: { expert_id: expertId },
          withCredentials: true
        });
        
        // Filter by project ID if provided
        let filteredData = response.data;
        if (projectId) {
          filteredData = filteredData.filter((item: any) => 
            item.project_id === parseInt(projectId)
          );
        }
        
        // If there's at least one result, show the manager
        setShowManager(filteredData.length > 0);
        
        if (filteredData.length > 0) {
          // Prepare initial state for each project
          const initialStatusData = {};
          const initialDates = {};
          const initialTimes = {};
          
          // Get unique project IDs to fetch their names
          const uniqueProjectIds = [...new Set(filteredData.map((item: any) => item.project_id))];
          const projectNamesMap = {};
          
          // Fetch project names
          await Promise.all(
            uniqueProjectIds.map(async (id) => {
              try {
                const projectResponse = await API.get(`/projects/${id}/`);
                projectNamesMap[id] = projectResponse.data.project_name || `Project ${id}`;
              } catch (error) {
                console.error(`Error fetching project ${id}:`, error);
                projectNamesMap[id] = `Project ${id}`;
              }
            })
          );
          
          setProjectNames(projectNamesMap);
          
          // Process each project entry
          filteredData.forEach((item: any) => {
            const projectKey = `project-${item.project_id}`;
            
            // Store the full published data
            initialStatusData[projectKey] = item;
            
            // Parse availability date if exists
            if (item.expert_availability) {
              try {
                // Example: "Thursday, 17 April 2025 at 08 AM (Jakarta time)"
                // Parse this string to get date and time
                const dateTimeString = item.expert_availability;
                
                // Extract date part
                const datePart = dateTimeString.split(" at ")[0];
                
                // Extract time part 
                const timePart = dateTimeString.split(" at ")[1].split(" ")[0] + " " + 
                                 dateTimeString.split(" at ")[1].split(" ")[1];
                
                // Try to parse date
                const dateObj = new Date(datePart);
                if (!isNaN(dateObj.getTime())) {
                  initialDates[projectKey] = dateObj;
                }
                
                // Store time (e.g. "08 AM")
                initialTimes[projectKey] = timePart;
              } catch (err) {
                console.error("Error parsing datetime:", err);
              }
            }
          });
          
          // Set state with parsed data
          setPublishedProjects(filteredData);
          setStatusData(initialStatusData);
          setSelectedDates(initialDates);
          setSelectedTimes(initialTimes);
        }
      } catch (error) {
        console.error("Error fetching expert published data:", error);
        toast.error("Failed to load expert status data");
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchData();
  }, [expertId, projectId]);

  // Handle status change
  const handleStatusChange = (projectId: string, statusId: string) => {
    const projectKey = `project-${projectId}`;
    
    // Get the numeric status ID from the string ID
    const numericStatusId = statusOptions.find(option => option.id === statusId)?.numId || 1;
    
    // Update status data with the numeric ID (which the API expects)
    setStatusData(prev => ({
      ...prev,
      [projectKey]: {
        ...prev[projectKey],
        status_id: numericStatusId
      }
    }));
  };

  // Handle date change
  const handleDateChange = (projectId: string, date: Date | null) => {
    const projectKey = `project-${projectId}`;
    setSelectedDates(prev => ({
      ...prev,
      [projectKey]: date
    }));
  };

  // Handle time change
  const handleTimeChange = (projectId: string, time: string) => {
    const projectKey = `project-${projectId}`;
    setSelectedTimes(prev => ({
      ...prev,
      [projectKey]: time
    }));
  };

  // Save changes for a specific project
  const saveChanges = async (projectId: string) => {
    const projectKey = `project-${projectId}`;
    const project = statusData[projectKey];
    
    if (!project) {
      toast.error("Project data not found");
      return;
    }
    
    setIsSaving(true);
    
    try {
      // Format availability datetime string if date is selected
      let availabilityString = null;
      
      if (selectedDates[projectKey]) {
        const dateStr = format(selectedDates[projectKey], "EEEE, dd MMMM yyyy");
        const timeStr = selectedTimes[projectKey] || "09 AM"; // Default to 09 AM if no time selected
        availabilityString = `${dateStr} at ${timeStr} (Jakarta time)`;
      }
      
      // Prepare update payload
      const updateData = {
        expert_id: project.expert_id,
        project_id: parseInt(projectId),
        user_id: project.user_id,
        status_id: project.status_id,
        expert_availability: availabilityString,
        angles: project.angles,
      };
      
      // Update project published status
      await API.put(`/project_published/${project.project_publish_id}/`, updateData);
      
      // Call parent callback
      onStatusChange({
        projectId: parseInt(projectId),
        statusId: project.status_id,
        availability: availabilityString
      });
      
      toast.success("Expert status updated successfully");
    } catch (error) {
      console.error("Error updating expert status:", error);
      toast.error("Failed to update expert status");
    } finally {
      setIsSaving(false);
    }
  };

  // Don't render anything if expert is not published for any project
  if (!showManager) {
    return null;
  }

  // Generate time options (1-hour increments)
  const timeOptions = [];
  for (let hour = 7; hour <= 21; hour++) {
    const period = hour < 12 ? "AM" : "PM";
    const displayHour = hour > 12 ? hour - 12 : hour;
    const paddedHour = displayHour.toString().padStart(2, "0");
    const timeString = `${paddedHour} ${period}`;
    timeOptions.push({ id: `time-${hour}`, value: timeString });
  }

  return (
    <Card className="shadow-sm border border-gray-100 overflow-hidden rounded-xl bg-gradient-to-br from-white to-blue-50">
      <CardHeader className="bg-white border-b border-gray-100 py-4 px-6">
        <CardTitle className="text-lg font-semibold text-gray-800 flex items-center">
          <div className="w-1 h-5 bg-blue-600 mr-3 rounded-full"></div>
          <User className="h-4 w-4 mr-2 text-blue-600" />
          Expert Availability & Status
        </CardTitle>
      </CardHeader>
      
      <CardContent className="p-6 relative">
        {/* Background decorative elements */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-blue-100 rounded-full opacity-20 -mr-20 -mt-20"></div>
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-blue-200 rounded-full opacity-10 -ml-16 -mb-16"></div>
        
        {isLoading ? (
          <div className="flex items-center justify-center py-6">
            <Loader2 className="h-6 w-6 animate-spin text-blue-600 mr-2" />
            <span className="text-blue-600">Loading status information...</span>
          </div>
        ) : (
          <div className="space-y-6 relative z-10">
            {publishedProjects.map((project) => {
              const projectKey = `project-${project.project_id}`;
              const currentProject = statusData[projectKey];
              
              if (!currentProject) return null;
              
              // Find the status option that matches the current status_id
              const currentStatusOption = statusOptions.find(
                option => option.numId === currentProject.status_id
              );
              
              return (
                <div 
                key={`project-container-${project.project_id}-${project.project_publish_id}`} 
                className="border border-gray-200 rounded-lg p-5 bg-white shadow-sm hover:shadow-md transition-shadow"
              >
                              <h3 className="text-sm font-medium mb-4 flex items-center">
                    <span className="bg-blue-100 text-blue-700 rounded-full w-6 h-6 inline-flex items-center justify-center mr-2">
                      {project.project_id}
                    </span>
                    {projectNames[project.project_id] || `Project ${project.project_id}`}
                  </h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                    {/* Status Selector */}
                    <div className="space-y-2">
                      <Label className="text-sm font-medium text-gray-700">Status</Label>
                      <Select 
                        value={currentStatusOption?.id} 
                        onValueChange={(value) => handleStatusChange(project.project_id.toString(), value)}
                      >
                        <SelectTrigger className="w-full h-10">
                          <SelectValue placeholder="Select Status" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectGroup>
                            <SelectLabel>Status</SelectLabel>
                            {statusOptions.map((status) => (
                              <SelectItem 
                                key={`${status.id}-${project.project_id}`} 
                                value={status.id}
                              >
                                {status.label}
                              </SelectItem>
                            ))}
                          </SelectGroup>
                        </SelectContent>
                      </Select>
                    </div>
                    
                    {/* Date Picker */}
                    <div className="space-y-2">
                      <Label className="text-sm font-medium text-gray-700">Availability Date</Label>
                      <Popover>
                        <PopoverTrigger asChild>
                          <Button
                            variant="outline"
                            className={cn(
                              "w-full h-10 justify-start text-left font-normal bg-white",
                              !selectedDates[projectKey] && "text-muted-foreground"
                            )}
                          >
                            <CalendarIcon className="mr-2 h-4 w-4" />
                            {selectedDates[projectKey] ? (
                              format(selectedDates[projectKey], "PPP")
                            ) : (
                              "Select date"
                            )}
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
                          <Calendar
                            mode="single"
                            selected={selectedDates[projectKey] || undefined}
                            onSelect={(date) => handleDateChange(project.project_id.toString(), date)}
                            initialFocus
                          />
                        </PopoverContent>
                      </Popover>
                    </div>
                    
                    {/* Time Selector */}
                    <div className="space-y-2">
                      <Label className="text-sm font-medium text-gray-700">Availability Time</Label>
                      <Select 
                        value={selectedTimes[projectKey] ? 
                          timeOptions.find(t => t.value === selectedTimes[projectKey])?.id : ""
                        } 
                        onValueChange={(value) => {
                          const selectedTime = timeOptions.find(t => t.id === value)?.value || "";
                          handleTimeChange(project.project_id.toString(), selectedTime);
                        }}
                      >
                        <SelectTrigger className="w-full h-10">
                          <SelectValue placeholder="Select Time" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectGroup>
                            <SelectLabel>Time</SelectLabel>
                            {timeOptions.map((time) => (
                              <SelectItem 
                                key={`${time.id}-${project.project_id}`} 
                                value={time.id}
                              >
                                {time.value}
                              </SelectItem>
                            ))}
                          </SelectGroup>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  
                  {/* Current Availability Display */}
                  {currentProject.expert_availability && (
                    <div className="mt-4 bg-blue-50 p-3 rounded-md text-sm text-blue-800 flex items-center">
                      <Clock className="h-3.5 w-3.5 mr-2 text-blue-700" />
                      <span>Current Availability: {currentProject.expert_availability}</span>
                    </div>
                  )}
                  
                  {/* Save Button */}
                  <div className="mt-5 flex justify-end">
                    <Button
                      onClick={() => saveChanges(project.project_id.toString())}
                      disabled={isSaving}
                      className="bg-blue-600 hover:bg-blue-700 text-white"
                    >
                      {isSaving ? (
                        <>
                          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                          Saving...
                        </>
                      ) : (
                        <>
                          <Check className="h-4 w-4 mr-2" />
                          Save Changes
                        </>
                      )}
                    </Button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
}