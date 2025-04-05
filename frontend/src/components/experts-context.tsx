"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import API from "@/services/api";
import { toast } from "react-toastify";
import { Expert } from "@/components/experts-table";

interface ExpertsContextType {
  experts: Expert[];
  filteredExperts: Expert[];
  loading: boolean;
  filters: {
    searchQuery: string;
    expertTitle: string;
    companies: string;
    employmentType: "current" | "former";
  };
  setFilters: React.Dispatch<React.SetStateAction<ExpertsContextType["filters"]>>;
  selectedExpert: Expert | null;
  setSelectedExpert: React.Dispatch<React.SetStateAction<Expert | null>>;
  refreshExperts: () => Promise<void>;
}

const ExpertsContext = createContext<ExpertsContextType | undefined>(undefined);

export const ExpertsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [experts, setExperts] = useState<Expert[]>([]);
  const [filteredExperts, setFilteredExperts] = useState<Expert[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedExpert, setSelectedExpert] = useState<Expert | null>(null);
  
  const [filters, setFilters] = useState({
    searchQuery: "",
    expertTitle: "",
    companies: "",
    employmentType: "current" as const
  });

  // Fetch experts data
  const fetchExpertsWithDetails = async () => {
    try {
      setLoading(true);

      // Fetch experts data
      const expertResponse = await API.get("/experts/");
      const expertsData = expertResponse.data.map((expert: any) => ({
        id: expert.expert_id,
        fullName: expert.full_name,
        industry: expert.industry,
        countryOfResidence: expert.country_of_residence,
        expertCost: expert.expert_cost,
        email: expert.email,
        phone: expert.phone_number,
        linkedIn: expert.linkedIn_profile_link,
        isFormer: false, // Will be determined by career data
      }));

      // Fetch career data
      const careerResponse = await API.get("/expert_experiences");
      const careerData = careerResponse.data;

      // Fetch project data
      const projectsResponse = await API.get("/projects");
      const projectsData = projectsResponse.data.map((project: any) => ({
        id: project.project_id,
        projectName: project.project_name,
      }));

      // Fetch pipeline and published projects
      const pipelineResponse = await API.get("/project_pipeline");
      const pipelineData = pipelineResponse.data.map((projectPipeline: any) => ({
        expertId: projectPipeline.expert_id,
        projectId: projectPipeline.project_id,
      }));

      const publishedResponse = await API.get("/project_published");
      const publishedData = publishedResponse.data.map((projectPublished: any) => ({
        expertId: projectPublished.expert_id,
        projectId: projectPublished.project_id,
      }));

      // Merge project data with expert data (both pipeline and published)
      const expertsWithDetails = expertsData.map((expert: any) => {
        const expertCareer = careerData.filter((career: any) => career.expert_id === expert.id);
        
        // Determine if expert is former based on career data
        // An expert is "former" if all their experiences have end_dates
        const isFormer = expertCareer.length > 0 && 
          expertCareer.every((career: any) => career.end_date !== null);
        
        // Directly linking project ids to experts from pipeline and published projects
        const expertPipelineProjects = pipelineData
          .filter((pipeline: any) => pipeline.expertId === expert.id)
          .map((pipeline: any) => {
            return projectsData.find((project: any) => project.id === pipeline.projectId);
          })
          .filter(Boolean);

        const expertPublishedProjects = publishedData
          .filter((published: any) => published.expertId === expert.id)
          .map((published: any) => {
            return projectsData.find((project: any) => project.id === published.projectId);
          })
          .filter(Boolean);

        return {
          ...expert,
          isFormer,
          // Sort career experiences to get the most recent first
          // If end_date is null, it's a current position (should be first)
          // Otherwise, sort by start_date descending
          career: expertCareer
            .map((career: any) => ({
              title: career.title,
              company_name: career.company_name,
              start_date: career.start_date,
              end_date: career.end_date,
              dateRange: `${career.start_date} - ${career.end_date || 'Present'}`,
            }))
            .sort((a: any, b: any) => {
              // If one has end_date null and the other doesn't, null comes first
              if (a.end_date === null && b.end_date !== null) return -1;
              if (a.end_date !== null && b.end_date === null) return 1;
              
              // Otherwise sort by start_date descending (most recent first)
              return new Date(b.start_date).getTime() - new Date(a.start_date).getTime();
            }),
          projects: [...expertPipelineProjects, ...expertPublishedProjects],
        };
      });

      setExperts(expertsWithDetails);
      setFilteredExperts(expertsWithDetails);
    } catch (error) {
      console.error("Error fetching experts with details:", error);
      toast.error("Failed to load experts data. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // Initial data fetch
  useEffect(() => {
    fetchExpertsWithDetails();
  }, []);

  // Apply filters whenever filters or experts change
  useEffect(() => {
    if (experts.length === 0) return;

    let filtered = [...experts];

    // Filter by search query (name or email)
    if (filters.searchQuery) {
      const query = filters.searchQuery.toLowerCase();
      filtered = filtered.filter(
        (expert) =>
          expert.fullName.toLowerCase().includes(query) ||
          expert.email.toLowerCase().includes(query)
      );
    }

    // Filter by employment type
    if (filters.employmentType) {
      filtered = filtered.filter((expert) =>
        filters.employmentType === "former" ? expert.isFormer : !expert.isFormer
      );
    }

    // Filter by expert title
    if (filters.expertTitle) {
      const titleQuery = filters.expertTitle.toLowerCase();
      filtered = filtered.filter((expert) =>
        expert.career.some((c) => c.title.toLowerCase().includes(titleQuery))
      );
    }

    // Filter by companies
    if (filters.companies) {
      const companyQuery = filters.companies.toLowerCase();
      filtered = filtered.filter((expert) =>
        expert.career.some((c) => c.company_name.toLowerCase().includes(companyQuery))
      );
    }



    setFilteredExperts(filtered);
  }, [filters, experts]);

  return (
    <ExpertsContext.Provider
      value={{
        experts,
        filteredExperts,
        loading,
        filters,
        setFilters,
        selectedExpert,
        setSelectedExpert,
        refreshExperts: fetchExpertsWithDetails
      }}
    >
      {children}
    </ExpertsContext.Provider>
  );
};

export const useExperts = () => {
  const context = useContext(ExpertsContext);
  if (context === undefined) {
    throw new Error("useExperts must be used within an ExpertsProvider");
  }
  return context;
};