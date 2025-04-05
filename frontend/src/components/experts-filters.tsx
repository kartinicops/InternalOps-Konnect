"use client";

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
import { useExperts } from "./experts-context";

export function ExpertsFilters() {
  const { filters, setFilters } = useExperts();

  const handleClearFilters = () => {
    setFilters({
      searchQuery: "",
      expertTitle: "",
      companies: "",
      employmentType: "current"
    });
  };

  return (
    <div className="p-6 min-h-[calc(100vh-16rem)] flex flex-col">
      {/* Filter Header */}
      <div className="flex justify-between items-center mb-6">
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
      <div className="relative mb-6">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
        <Input
          value={filters.searchQuery}
          onChange={(e) => setFilters({...filters, searchQuery: e.target.value})}
          placeholder="Search experts..."
          className="pl-10 bg-white border-gray-200 focus-visible:ring-blue-500 rounded-md"
        />
      </div>

      <Accordion type="multiple" defaultValue={["work-experience", "employment"]} className="space-y-4">
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
                value={filters.expertTitle}
                onChange={(e) => setFilters({...filters, expertTitle: e.target.value})}
                placeholder="Search by title..." 
                className="h-9 border-gray-300 focus-visible:ring-blue-500" 
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="companies" className="text-sm text-gray-700">Companies</Label>
              <Input 
                id="companies" 
                value={filters.companies}
                onChange={(e) => setFilters({...filters, companies: e.target.value})}
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
                    filters.employmentType === "current"
                      ? "bg-blue-600 text-white"
                      : "bg-white text-gray-700 hover:bg-gray-50"
                  }`}
                  onClick={() => setFilters({...filters, employmentType: "current"})}
                >
                  Current
                </button>
                <button
                  className={`w-1/2 py-2 text-sm font-medium transition-all ${
                    filters.employmentType === "former"
                      ? "bg-blue-600 text-white"
                      : "bg-white text-gray-700 hover:bg-gray-50"
                  }`}
                  onClick={() => setFilters({...filters, employmentType: "former"})}
                >
                  Former
                </button>
              </div>
            </div>
          </AccordionContent>
        </AccordionItem>
      </Accordion>

      {/* Apply Filters Button - Mobile Only */}
      <div className="mt-auto pt-6">
        <Button className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 md:hidden">
          Apply Filters
        </Button>
      </div>
    </div>
  );
}