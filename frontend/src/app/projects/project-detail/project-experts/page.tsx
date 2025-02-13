'use client';
import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Search, Plus, Download } from "lucide-react";
import { Nav } from "@/components/nav";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import API from "@/services/api";

interface Expert {
  id: number;
  fullName: string;
  company: string;
  contactDetails: string;
  addedAt: string;
  pipelineAddedTime: string;
  publishedAddedTime: string;
  status?: string;
}

export default function ProjectExpertsPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState<"pipeline" | "published">("pipeline");
  const [pipelineExperts, setPipelineExperts] = useState<Expert[]>([]);
  const [publishedExperts, setPublishedExperts] = useState<Expert[]>([]);
  const [projectId, setProjectId] = useState<number | null>(null);
  const [projectName, setProjectName] = useState("");
  const searchParams = useSearchParams();
  const router = useRouter();

  const decodedProjectName = decodeURIComponent(searchParams.get("project") || "")
    .split("-")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");

  // Function to fetch experts for pipeline and published sections separately
  const fetchExpertsByProjectId = async (projectId: number) => {
    const pipelineResponse = await API.get(`/project_pipeline?project_id=${projectId}`);
    const publishedResponse = await API.get(`/project_published?project_id=${projectId}`);
    return {
      pipeline: pipelineResponse.data,
      published: publishedResponse.data,
    };
  };

  // Function to fetch expert details and their most recent experience (company)
  const fetchExpertDetailsAndExperience = async (expertId: number) => {
    try {
      // Fetch expert data (contact details, etc.)
      const expertResponse = await API.get(`/experts/${expertId}`);

      // Fetch all experiences for the given expert
      const expertExperienceResponse = await API.get(`/expert_experiences/?expert_id=${expertId}`);

      // Sort and get the latest experience based on start date
      const experience = expertExperienceResponse.data.sort((a: any, b: any) => {
        const dateA = new Date(a.start_date);
        const dateB = new Date(b.start_date);
        return dateB.getTime() - dateA.getTime(); // Sorting by date
      })[0];

      // Get company name from the most recent experience
      const company = experience?.company_name || "No Company"; // Default to "No Company" if no experience

      return {
        fullName: expertResponse.data.full_name,
        contactDetails: expertResponse.data.phone_number,
        company,  // Company from the most recent experience
      };
    } catch (error) {
      console.error("Error fetching expert details:", error);
      return {
        fullName: "Unknown",
        contactDetails: "No Contact",
        company: "No Company",
      };
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await API.get(`/projects/${searchParams.get("id")}`, { withCredentials: true });
        const project = response.data;
        const fetchedProjectId = project.project_id;
        const fetchedProjectName = project.project_name;

        setProjectId(fetchedProjectId);
        setProjectName(fetchedProjectName);

        if (fetchedProjectId) {
          const expertsFromProject = await fetchExpertsByProjectId(fetchedProjectId);

          // Fetch pipeline experts data and join with their most recent company name and contact details
          const pipelineExpertData = await Promise.all(
            expertsFromProject.pipeline.map(async (expert: any) => {
              const { fullName, company, contactDetails } = await fetchExpertDetailsAndExperience(expert.expert_id);
              return {
                id: expert.expert_id,
                fullName,
                company,
                contactDetails,
                addedAt: expert.created_at,
                pipelineAddedTime: expert.created_at,
                publishedAddedTime: expert.created_at,
                status: expert.status || "Not Available",
              };
            })
          );

          // Fetch published experts data and join with their most recent company name and contact details
          const publishedExpertData = await Promise.all(
            expertsFromProject.published.map(async (expert: any) => {
              const { fullName, company, contactDetails } = await fetchExpertDetailsAndExperience(expert.expert_id);
              return {
                id: expert.expert_id,
                fullName,
                company,
                contactDetails,
                addedAt: expert.created_at,
                pipelineAddedTime: expert.created_at,
                publishedAddedTime: expert.created_at,
                status: expert.status || "Not Available",
              };
            })
          );

          setPipelineExperts(pipelineExpertData);
          setPublishedExperts(publishedExpertData);
        }
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };

    fetchData();
  }, [searchParams]);

  const handleAddExpert = () => {
    router.push("/projects/experts/add");
  };

  const filteredExperts = (experts: Expert[]) => {
    return experts.filter((expert) =>
      (expert.fullName && expert.fullName.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (expert.company && expert.company.toLowerCase().includes(searchQuery.toLowerCase()))
    );
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Nav isProjectDetail projectName={projectName} />
      <main className="container mx-auto px-4 py-8">
        <div className="mb-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="relative flex-1 max-w-md w-full">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              placeholder="Search experts..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 rounded-full border-2 border-blue-200 focus:border-blue-400 focus:ring focus:ring-blue-200 focus:ring-opacity-50 bg-white"
            />
          </div>
          <div className="flex gap-2">
            <Button variant="outline" className="rounded-full border-2 border-blue-200 hover:border-blue-400 hover:bg-blue-50">
              <Download className="h-4 w-4 mr-2 text-blue-600" />
              Download
            </Button>
            <Button onClick={handleAddExpert} className="bg-blue-600 hover:bg-blue-700 text-white rounded-full">
              <Plus className="h-4 w-4 mr-2" />
              Add expert
            </Button>
          </div>
        </div>
        <div className="flex gap-6 border-b mb-6">
          {["pipeline", "published"].map((tab) => (
            <button
              key={tab}
              className={`relative pb-2 px-4 text-sm transition-all ${activeTab === tab ? "text-blue-600 font-semibold border-b-2 border-blue-600" : "text-muted-foreground hover:text-primary"}`}
              onClick={() => setActiveTab(tab as "pipeline" | "published")}
            >
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
            </button>
          ))}
        </div>
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Expert</TableHead>
                  <TableHead>Company</TableHead>
                  <TableHead>Contact details</TableHead>
                  <TableHead>Added time</TableHead>
                  {activeTab === "published" && <TableHead>Status</TableHead>}
                </TableRow>
              </TableHeader>
              <TableBody>
                {(activeTab === "pipeline" ? pipelineExperts : publishedExperts).map((expert) => (
                  <TableRow key={`${expert.id}-${expert.addedAt}`} className="hover:bg-gray-50">
                    <TableCell className="font-medium">{expert.fullName}</TableCell>
                    <TableCell>{expert.company}</TableCell>
                    <TableCell>{expert.contactDetails}</TableCell>
                    <TableCell>{expert.addedAt}</TableCell>
                    {activeTab === "published" && <TableCell><Badge>{expert.status}</Badge></TableCell>}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </div>
      </main>
    </div>
  );
}
