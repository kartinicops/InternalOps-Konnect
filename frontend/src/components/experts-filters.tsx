"use client";

import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Search, X } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { 
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger
} from "@/components/ui/accordion";
import { Switch } from "@/components/ui/switch";

export function ExpertsFilters() {
  const [employmentType, setEmploymentType] = useState<"current" | "former">("current");
  const [searchQuery, setSearchQuery] = useState("");
  const [expertTitle, setExpertTitle] = useState("");
  const [companies, setCompanies] = useState("");
  const [completedCall, setCompletedCall] = useState(false);
  const [published, setPublished] = useState(false);

  const handleClearFilters = () => {
    setSearchQuery("");
    setExpertTitle("");
    setCompanies("");
    setEmploymentType("current");
    setCompletedCall(false);
    setPublished(false);
  };

  return (
    <div className="space-y-6">
      {/* Filter Header */}
      <div className="flex justify-between items-center">
        <h2 className="text-lg font-semibold text-gray-900">Filters</h2>
        <Button 
          variant="ghost" 
          size="sm" 
          className="text-blue-600 hover:text-blue-800 hover:bg-blue-50 font-medium text-sm"
          onClick={handleClearFilters}
        >
          <X className="h-4 w-4 mr-1" />
          Clear all
        </Button>
      </div>

      {/* Search Bar */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
        <Input
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search experts..."
          className="pl-10 bg-white border-gray-300 focus-visible:ring-blue-500"
        />
      </div>

      <Accordion type="multiple" defaultValue={["work-experience", "employment", "other"]} className="space-y-4">
        {/* Work Experience Section */}
        <AccordionItem value="work-experience" className="border rounded-lg px-4 pb-2 bg-white shadow-sm">
          <AccordionTrigger className="py-3 hover:no-underline">
            <span className="text-base font-medium text-gray-900">Work Experience</span>
          </AccordionTrigger>
          <AccordionContent className="space-y-4 pt-2">
            <div className="space-y-2">
              <Label htmlFor="expert-title" className="text-sm text-gray-700">Title</Label>
              <Input 
                id="expert-title" 
                value={expertTitle}
                onChange={(e) => setExpertTitle(e.target.value)}
                placeholder="Search by title..." 
                className="h-9 border-gray-300 focus-visible:ring-blue-500" 
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="companies" className="text-sm text-gray-700">Companies</Label>
              <Input 
                id="companies" 
                value={companies}
                onChange={(e) => setCompanies(e.target.value)}
                placeholder="Search by company..." 
                className="h-9 border-gray-300 focus-visible:ring-blue-500" 
              />
            </div>
          </AccordionContent>
        </AccordionItem>

        {/* Employment Section */}
        <AccordionItem value="employment" className="border rounded-lg px-4 pb-2 bg-white shadow-sm">
          <AccordionTrigger className="py-3 hover:no-underline">
            <span className="text-base font-medium text-gray-900">Employment</span>
          </AccordionTrigger>
          <AccordionContent className="space-y-4 pt-2">
            <div className="space-y-2">
              <Label className="text-sm text-gray-700">Status</Label>
              <div className="flex w-full rounded-md border overflow-hidden">
                <button
                  className={`w-1/2 py-2 text-sm font-medium transition-all ${
                    employmentType === "current"
                      ? "bg-blue-600 text-white"
                      : "bg-white text-gray-700 hover:bg-gray-50"
                  }`}
                  onClick={() => setEmploymentType("current")}
                >
                  Current
                </button>
                <button
                  className={`w-1/2 py-2 text-sm font-medium transition-all ${
                    employmentType === "former"
                      ? "bg-blue-600 text-white"
                      : "bg-white text-gray-700 hover:bg-gray-50"
                  }`}
                  onClick={() => setEmploymentType("former")}
                >
                  Former
                </button>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="industry-select" className="text-sm text-gray-700">Industry</Label>
              <Select>
                <SelectTrigger id="industry-select" className="h-9 border-gray-300 focus:ring-blue-500">
                  <SelectValue placeholder="All industries" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All industries</SelectItem>
                  <SelectItem value="technology">Technology</SelectItem>
                  <SelectItem value="finance">Finance</SelectItem>
                  <SelectItem value="healthcare">Healthcare</SelectItem>
                  <SelectItem value="education">Education</SelectItem>
                  <SelectItem value="manufacturing">Manufacturing</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="location-select" className="text-sm text-gray-700">Location</Label>
              <Select>
                <SelectTrigger id="location-select" className="h-9 border-gray-300 focus:ring-blue-500">
                  <SelectValue placeholder="All locations" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All locations</SelectItem>
                  <SelectItem value="us">United States</SelectItem>
                  <SelectItem value="uk">United Kingdom</SelectItem>
                  <SelectItem value="eu">Europe</SelectItem>
                  <SelectItem value="asia">Asia</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </AccordionContent>
        </AccordionItem>

        {/* Other Filters Section */}
        <AccordionItem value="other" className="border rounded-lg px-4 pb-2 bg-white shadow-sm">
          <AccordionTrigger className="py-3 hover:no-underline">
            <span className="text-base font-medium text-gray-900">Other Filters</span>
          </AccordionTrigger>
          <AccordionContent className="space-y-4 pt-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="completed-call" className="text-sm text-gray-700">
                Has completed at least one call
              </Label>
              <Switch 
                id="completed-call" 
                checked={completedCall}
                onCheckedChange={setCompletedCall}
                className="data-[state=checked]:bg-blue-600"
              />
            </div>
            <div className="flex items-center justify-between">
              <Label htmlFor="published" className="text-sm text-gray-700">
                Has been published previously
              </Label>
              <Switch 
                id="published" 
                checked={published}
                onCheckedChange={setPublished}
                className="data-[state=checked]:bg-blue-600"
              />
            </div>
          </AccordionContent>
        </AccordionItem>
      </Accordion>

      {/* Apply Filters Button - Mobile Only */}
      <Button className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 md:hidden">
        Apply Filters
      </Button>
    </div>
  );
}