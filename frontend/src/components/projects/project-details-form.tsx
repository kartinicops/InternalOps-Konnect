import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar, MapPin, Globe, Clock } from "lucide-react";

export default function ProjectDetailsForm({ formData, setFormData, geographies }) {
  const getSelectedGeography = () => formData.geographyId && geographies.length > 0 ? 
    geographies.find(g => String(g.geography_id) === formData.geographyId) : undefined;
  
  const selectedGeo = getSelectedGeography();

  return (
    <Card className="shadow-lg border-0 overflow-hidden">
      <CardHeader className="bg-white border-b border-gray-100 py-4">
        <CardTitle className="text-xl font-semibold text-gray-800 flex items-center">
          <div className="w-1 h-6 bg-blue-600 mr-3 rounded-full"></div>Project Details
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6 p-6 bg-white">
        <div className="space-y-2">
          <Label htmlFor="projectName" className="font-medium text-gray-700">Project Name</Label>
          <Input 
            id="projectName" 
            value={formData.projectName} 
            onChange={e => setFormData(prev => ({ ...prev, projectName: e.target.value }))} 
            placeholder="Enter project name" 
            required 
          />
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="status" className="font-medium text-gray-700">Status</Label>
          <div className="flex items-center space-x-4">
            <div 
              className="relative w-16 h-8 rounded-full cursor-pointer flex items-center"
              style={{ backgroundColor: formData.status ? "#e2e8f0" : "#3b82f6" }}
              onClick={() => setFormData(prev => ({ ...prev, status: !prev.status }))}>
              <div 
                className="w-6 h-6 bg-white rounded-full shadow-md absolute transition-transform duration-200 ease-in-out"
                style={{ left: formData.status ? '2px' : 'calc(100% - 26px)' }}>
              </div>
            </div>
            <span className="text-sm font-medium text-gray-700">{formData.status ? "Closed" : "Active"}</span>
          </div>
        </div>

        <div className="grid gap-6 md:grid-cols-3">
          <div className="space-y-2">
            <Label htmlFor="startDate" className="font-medium text-gray-700 flex items-center gap-2">
              <Calendar className="h-4 w-4" /> Start Date
            </Label>
            <Input 
              type="date" 
              id="startDate" 
              value={formData.startDate} 
              onChange={e => setFormData(prev => ({ ...prev, startDate: e.target.value }))} 
              required 
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="endDate" className="font-medium text-gray-700 flex items-center gap-2">
              <Calendar className="h-4 w-4" /> End Date
            </Label>
            <Input 
              type="date" 
              id="endDate" 
              value={formData.endDate} 
              onChange={e => setFormData(prev => ({ ...prev, endDate: e.target.value }))} 
              required 
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="expectedCalls" className="font-medium text-gray-700">Expected Calls</Label>
            <Input 
              type="number" 
              id="expectedCalls" 
              value={formData.expectedCalls} 
              onChange={e => setFormData(prev => ({ ...prev, expectedCalls: parseInt(e.target.value) }))} 
              min="0" 
              required 
            />
          </div>
        </div>

        <div className="space-y-3">
          <Label className="font-medium text-gray-700 flex items-center gap-2">
            <MapPin className="h-4 w-4" /> Geography
          </Label>
          <Select 
            onValueChange={value => setFormData(prev => ({ ...prev, geographyId: value }))} 
            value={formData.geographyId}
          >
            <SelectTrigger className="w-full bg-white">
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
          
          {selectedGeo && (
            <div className="bg-blue-50 p-3 rounded-md border border-blue-100">
              <div className="space-y-1">
                <div className="flex items-center gap-2 text-blue-700">
                  <Globe className="h-4 w-4" />
                  <span className="font-medium">{selectedGeo.country}, {selectedGeo.city}</span>
                </div>
                <div className="flex items-center gap-2 text-blue-600 text-sm">
                  <Clock className="h-4 w-4" /><span>{selectedGeo.timezone}</span>
                </div>
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}