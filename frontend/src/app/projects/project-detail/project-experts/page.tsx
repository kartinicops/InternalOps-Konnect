"use client";
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
  addedBy: string;
  addedAt: string;
  status?: string;
}

export default function ProjectExpertsPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState<"pipeline" | "published">("pipeline");
  const [experts, setExperts] = useState<Expert[]>([]);
  const [projectId, setProjectId] = useState<number | null>(null);
  const [projectName, setProjectName] = useState("");
  const searchParams = useSearchParams();
  const router = useRouter();

  const decodedProjectName = decodeURIComponent(searchParams.get("project") || "")
    .split("-")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");

  useEffect(() => {
    const fetchData = async () => {
      try {
        await API.get("/api/csrf/");

        const response = await API.get(`/projects/${searchParams.get("id")}`, { withCredentials: true });
        const project = response.data;
        const fetchedProjectId = project.project_id;
        const fetchedProjectName = project.project_name;

        setProjectId(fetchedProjectId);
        setProjectName(fetchedProjectName);

        if (fetchedProjectId) {
          const [pipelineResponse, publishedResponse] = await Promise.all([
            API.get(`/project_pipeline?project_id=${fetchedProjectId}`),
            API.get(`/project_published?project_id=${fetchedProjectId}`)
          ]);

          const mappedData = [
            ...pipelineResponse.data.map((expert:any) => ({ ...expert, status: "pipeline" })),
            ...publishedResponse.data.map((expert:any) => ({ ...expert, status: "published" }))
          ];

          setExperts(mappedData);
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

  const filteredExperts = experts.filter((expert) =>
    (expert.fullName && expert.fullName.toLowerCase().includes(searchQuery.toLowerCase())) ||
    (expert.company && expert.company.toLowerCase().includes(searchQuery.toLowerCase()))
  );
  

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
                  <TableHead>Added by</TableHead>
                  <TableHead>Added time</TableHead>
                  {activeTab === "published" && <TableHead>Status</TableHead>}
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredExperts.map((expert) => (
                  <TableRow key={expert.id} className="hover:bg-gray-50">
                    <TableCell className="font-medium">{expert.fullName}</TableCell>
                    <TableCell>{expert.company}</TableCell>
                    <TableCell>{expert.contactDetails}</TableCell>
                    <TableCell>{expert.addedBy}</TableCell>
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
