"use client";

import { useState, useMemo } from "react";
import { ExpertsFilters } from "@/components/experts-filters";
import { ExpertsTable } from "@/components/experts-table";
import { Nav } from "@/components/nav";
import { Button } from "@/components/ui/button";
import { Plus, Filter, DownloadCloud } from "lucide-react";
import Link from "next/link";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Expert } from "@/components/experts-table";

export default function ExpertsPage() {
  const [experts, setExperts] = useState<Expert[]>([]);
  const [filteredExperts, setFilteredExperts] = useState<Expert[]>([]);

  // Filtering logic to be passed to ExpertsFilters
  const filterExperts = (
    experts: Expert[], 
    {
      searchQuery,
      employmentType,
      expertTitle,
      companies,
      industry,
      location,
      completedCall,
      published
    }: {
      searchQuery: string;
      employmentType: "current" | "former" | "all";
      expertTitle: string;
      companies: string;
      industry: string;
      location: string;
      completedCall: boolean;
      published: boolean;
    }
  ) => {
    return experts.filter(expert => {
      // Search query filter (name, email)
      const matchesSearch = !searchQuery || 
        expert.fullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        expert.email.toLowerCase().includes(searchQuery.toLowerCase());

      // Employment type filter
      const matchesEmploymentType = 
        employmentType === "all" || 
        (employmentType === "current" && !expert.isFormer) || 
        (employmentType === "former" && expert.isFormer);

      // Title filter
      const matchesTitle = !expertTitle || 
        expert.career.some(job => 
          job.title.toLowerCase().includes(expertTitle.toLowerCase())
        );

      // Companies filter
      const matchesCompanies = !companies || 
        expert.career.some(job => 
          job.company_name.toLowerCase().includes(companies.toLowerCase())
        );

      // Industry filter
      const matchesIndustry = industry === "all" || 
        expert.industry.toLowerCase() === industry.toLowerCase();

      // Location filter
      const matchesLocation = location === "all" || 
        expert.countryOfResidence.toLowerCase() === location.toLowerCase();

      // Completed call filter (placeholder - adjust based on actual data structure)
      const matchesCompletedCall = !completedCall;

      // Published filter (check if expert has any projects)
      const matchesPublished = !published || expert.projects.length > 0;

      return matchesSearch && 
             matchesEmploymentType && 
             matchesTitle && 
             matchesCompanies && 
             matchesIndustry && 
             matchesLocation && 
             matchesCompletedCall && 
             matchesPublished;
    });
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Nav />
      <div className="container mx-auto px-4 py-8">
        {/* Header with actions */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Experts</h1>
            <p className="text-gray-500 mt-1">Manage and organize your experts database</p>
          </div>
          <div className="flex items-center gap-3 self-end sm:self-auto">
            <Button 
              variant="outline" 
              className="border-gray-300 text-gray-700 hover:bg-gray-50 hidden md:flex items-center gap-2"
            >
              <DownloadCloud className="h-4 w-4" />
              Export
            </Button>
            <Link href="/experts/add">
              <Button className="bg-blue-600 hover:bg-blue-700 text-white flex items-center gap-2">
                <Plus className="h-4 w-4" />
                Add Expert
              </Button>
            </Link>
          </div>
        </div>

        {/* Mobile filter button */}
        <Sheet>
          <SheetTrigger asChild>
            <Button 
              variant="outline" 
              className="mb-4 w-full justify-between md:hidden border-gray-300"
            >
              <span className="flex items-center">
                <Filter className="h-4 w-4 mr-2" />
                Filter Experts
              </span>
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="w-[300px] sm:w-[400px] p-0">
            <div className="p-6">
              <ExpertsFilters 
                experts={experts}
                onFilteredExpertsChange={setFilteredExperts}
                filterFunction={filterExperts}
              />
            </div>
          </SheetContent>
        </Sheet>

        <div className="flex flex-col md:flex-row gap-6">
          {/* Sidebar filters - desktop */}
          <aside className="w-full md:w-1/4 lg:w-1/5 hidden md:block">
            <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-6 sticky top-20">
              <ExpertsFilters 
                experts={experts}
                onFilteredExpertsChange={setFilteredExperts}
                filterFunction={filterExperts}
              />
            </div>
          </aside>
          
          {/* Main content */}
          <main className="flex-1">
            <div className="bg-transparent">
              <ExpertsTable 
                experts={filteredExperts.length > 0 ? filteredExperts : experts}
                onExpertsLoaded={setExperts}
              />
            </div>
            
            {/* Pagination */}
            <div className="mt-6 flex items-center justify-between">
              <p className="text-sm text-gray-500">
                Showing <span className="font-medium">1</span> to <span className="font-medium">10</span> of{" "}
                <span className="font-medium">{experts.length}</span> experts
              </p>
              <div className="flex gap-1">
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="border-gray-300 text-gray-700 hover:bg-gray-50"
                  disabled
                >
                  Previous
                </Button>
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="border-gray-300 text-gray-700 hover:bg-gray-50"
                >
                  Next
                </Button>
              </div>
            </div>
          </main>
        </div>
      </div>
    </div>
  );
}