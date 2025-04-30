"use client";

import { useState, useEffect } from "react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import API from "@/services/api";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

interface Expert {
  expert_id: number;
  full_name: string;
  industry: string;
  email: string;
  country_of_residence: string;
  created_at: string;
  position?: string; // Added position field
}

interface PipelineProps {
  project_id: string;
  onSelectExpert?: (expertId: number) => void;
}

const Pipeline = ({ project_id, onSelectExpert }: PipelineProps) => {
  const [pipelineExperts, setPipelineExperts] = useState<Expert[]>([]);
  const [pipelineData, setPipelineData] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [movingExpert, setMovingExpert] = useState<number | null>(null);
  const [expertExperiences, setExpertExperiences] = useState<any[]>([]); // Store expert experiences

  useEffect(() => {
    const fetchPipelineData = async () => {
      setIsLoading(true);
      setError(null);
      try {
        // Fetch pipeline data for specific project
        const pipelineResponse = await API.get(`/project_pipeline/`, {
          params: { project_id },
          withCredentials: true,
        });

        // Filter pipeline data for this project
        const filteredPipelines = pipelineResponse.data.filter(
          (item: any) => item.project_id === parseInt(project_id)
        );

        setPipelineData(filteredPipelines);

        // Extract expert IDs
        const expertIds = filteredPipelines.map((item: any) => item.expert_id);

        if (expertIds.length > 0) {
          // Fetch expert details
          const expertsResponse = await API.get(`/experts/`, {
            params: { expert_ids: expertIds },
            withCredentials: true,
          });

          // Filter and set experts
          const filteredExperts = expertsResponse.data.filter((expert: Expert) => 
            expertIds.includes(expert.expert_id)
          );

          // Fetch expert experiences for each expert
          await fetchExpertExperiences(expertIds);

          setPipelineExperts(filteredExperts);
        } else {
          setPipelineExperts([]);
        }
      } catch (error) {
        console.error("Error fetching pipeline data:", error);
        setError("Failed to fetch pipeline data. Please try again.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchPipelineData();
  }, [project_id]);

  // Fetch expert experiences for experts
  const fetchExpertExperiences = async (expertIds: number[]) => {
    try {
      const experiencesResponse = await API.get(`/expert_experiences/`, {
        withCredentials: true,
      });
      
      // Filter experiences for our experts
      const filteredExperiences = experiencesResponse.data.filter(
        (experience: any) => expertIds.includes(experience.expert_id)
      );
      
      setExpertExperiences(filteredExperiences);
    } catch (error) {
      console.error("Error fetching expert experiences:", error);
    }
  };

  // Get the latest position for an expert
  const getExpertPosition = (expertId: number): string => {
    // Filter experiences for this expert
    const experiences = expertExperiences.filter(
      (exp) => exp.expert_id === expertId
    );
    
    // Sort by start_date to get the most recent one (assuming the format is consistent)
    const sortedExperiences = [...experiences].sort((a, b) => {
      return new Date(b.start_date).getTime() - new Date(a.start_date).getTime();
    });
    
    // Return the title of the most recent experience or empty string if none found
    return sortedExperiences.length > 0 ? sortedExperiences[0].title : '';
  };

  // Get added date from pipeline data
  const getAddedAt = (expertId: number): string => {
    const pipelineEntry = pipelineData.find((item) => item.expert_id === expertId);
    return pipelineEntry ? pipelineEntry.created_at : "";
  };

  const handleMoveToPublished = async (expertId: number) => {
    if (movingExpert !== null) return;
    setMovingExpert(expertId);

    try {
      // Find pipeline item to move
      const pipelineItem = pipelineData.find(
        (item) => item.expert_id === expertId && 
                  item.project_id === parseInt(project_id)
      );

      if (!pipelineItem) {
        throw new Error("Pipeline item not found");
      }

      // Payload for published endpoint - initial status is "Proposed" (status_id: 1)
      // When moving from pipeline to published, set initial availability to TBC by leaving it null
      const publishedPayload = {
        expert_id: expertId,
        project_id: parseInt(project_id),
        user_id: 5, // Default user ID
        status_id: 1, // Initial status is "Proposed" (1)
        expert_availability: null, // Initially null/TBC
        angles: "basic", // Default angles
        created_at: new Date().toISOString()
      };

      console.log("Sending payload:", publishedPayload);

      // Post to published endpoint
      await API.post("/project_published/", publishedPayload, {
        withCredentials: true,
        headers: {
          'Content-Type': 'application/json'
        }
      });

      // Delete from pipeline after successful movement to published
      await API.delete(`/project_pipeline/${pipelineItem.project_pipeline_id}/`, {
        withCredentials: true
      });

      // Update local state - remove from pipeline list
      setPipelineExperts((prevExperts) => 
        prevExperts.filter((expert) => expert.expert_id !== expertId)
      );

      toast.success("Expert moved to published successfully!", {
        position: "top-right",
        autoClose: 1500,
      });

    } catch (error: any) {
      console.error("Move to Published Error:", {
        response: error.response?.data,
        status: error.response?.status,
        message: error.message
      });
    
      // Show detailed error message
      const errorMessage = error.response?.data?.expert_availability?.[0] || 
                          error.response?.data?.message || 
                          "Failed to move expert. Please try again.";
      
      toast.error(errorMessage, {
        position: "top-right",
        autoClose: 5000,
      });
    } finally {
      setMovingExpert(null);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-gray-500">Loading pipeline data...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-red-500">{error}</div>
      </div>
    );
  }

  return (
    <div className="w-full">
      <ToastContainer />
      <div className="overflow-x-auto rounded-md border">
        <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Expert</TableHead>
            <TableHead>Position</TableHead>
            <TableHead>Industry</TableHead>
            <TableHead>Contact details</TableHead>
            <TableHead>Location</TableHead>
            <TableHead>Action</TableHead>
          </TableRow>
        </TableHeader>
          <TableBody>
            {pipelineExperts.length > 0 ? (
              pipelineExperts.map((expert) => (
                <TableRow 
                  key={expert.expert_id}
                  onClick={() => onSelectExpert && onSelectExpert(expert.expert_id)}
                  className="cursor-pointer hover:bg-gray-50"
                >
                  <TableCell className="font-medium">{expert.full_name}</TableCell>
                  <TableCell>{getExpertPosition(expert.expert_id)}</TableCell>
                  <TableCell>{expert.industry}</TableCell>
                  <TableCell>{expert.email}</TableCell>
                  <TableCell>{expert.country_of_residence}</TableCell>
                  <TableCell>
                    <Badge
                      className={`cursor-pointer ${
                        movingExpert === expert.expert_id
                          ? "bg-gray-300 text-gray-600 cursor-not-allowed"
                          : "bg-blue-100 text-blue-600 hover:bg-blue-200"
                      }`}
                      onClick={(e) => {
                        e.stopPropagation(); // Prevent triggering row click
                        movingExpert === null && 
                        handleMoveToPublished(expert.expert_id)
                      }}
                    >
                      {movingExpert === expert.expert_id ? "Moving..." : "Move to Published"}
                    </Badge>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={7} className="text-center text-gray-500">
                  No experts found in pipeline.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};

export default Pipeline;