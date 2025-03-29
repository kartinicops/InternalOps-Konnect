"use client";

import { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import { Nav } from "@/components/nav";
import { Input } from "@/components/ui/input";
import { Search, Filter, ArrowUpDown, Pencil, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import API from "@/services/api";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

interface Project {
  project_id: number;
  project_name: string;
  status: boolean;
  timeline_start: string;
  timeline_end: string;
  expected_calls: number;
  completed_calls: number;
  client_requirements: string;
  client_company_id: number;
  geography_id: number;
  created_at: string;
}

export default function ProjectsPage() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");
  const [statusFilter, setStatusFilter] = useState<string[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [deleteProjectId, setDeleteProjectId] = useState<number | null>(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [clients, setClients] = useState<Record<number, string>>({});
  const [geographies, setGeographies] = useState<Record<number, string>>({});

  useEffect(() => {
    const fetchProjects = async () => {
      try {
        await API.get("/api/csrf/");
        const response = await API.get("/projects/", { withCredentials: true });
        const projectsData = response.data;
        setProjects(projectsData);
  
        // Fetch clients and geographies
        const fetchClients = async () => {
          try {
            const clientResponse = await API.get("/project_client_company/", { withCredentials: true });
            const clientData = clientResponse.data.reduce((acc: Record<number, string>, client: any) => {
              acc[client.client_company_id] = client.company_name;
              return acc;
            }, {});
            setClients(clientData);
          } catch (error) {
            console.error("Error fetching clients:", error);
          }
        };
  
        const fetchGeographies = async () => {
          try {
            const geoResponse = await API.get("/projects_geography/", { withCredentials: true });
            const geoData = geoResponse.data.reduce((acc: Record<number, string>, geo: any) => {
              acc[geo.geography_id] = geo.country;
              return acc;
            }, {});
            setGeographies(geoData);
          } catch (error) {
            console.error("Error fetching geographies:", error);
          }
        };
  
        await Promise.all([fetchClients(), fetchGeographies()]);
      } catch (error) {
        console.error("Error fetching projects:", error);
      } finally {
        setLoading(false);
      }
    };
  
    fetchProjects();
  }, []);
  
  const filteredAndSortedProjects = useMemo(() => {
    let filtered = projects;

    if (statusFilter.length > 0) {
      filtered = filtered.filter((project) => {
        return statusFilter.includes(project.status ? "closed" : "active");
      });
    }

    if (searchTerm) {
      filtered = filtered.filter((project) =>
        project.project_name.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    return filtered.sort((a, b) => {
      if (sortOrder === "asc") {
        return a.project_name.localeCompare(b.project_name);
      } else {
        return b.project_name.localeCompare(a.project_name);
      }
    });
  }, [projects, sortOrder, statusFilter, searchTerm]);

  const handleDelete = async () => {
    if (deleteProjectId !== null) {
      setShowDeleteModal(false);
  
      try {
        await API.delete(`/projects/${deleteProjectId}`, { withCredentials: true });
        toast.success("Project deleted successfully!", {
          position: "top-right",
          autoClose: 2000,
          onClose: () => {
            setProjects((prev) => prev.filter((project) => project.project_id !== deleteProjectId));
          },
        });
      } catch (error) {
        console.error("Error deleting project:", error);
        toast.error("Failed to delete project.", {
          position: "top-right",
          autoClose: 2000,
        });
      }
    }
  };
  
  const handleDeleteClick = (projectId: number) => {
    setDeleteProjectId(projectId);
    setShowDeleteModal(true);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-blue-500 mx-auto"></div>
          <p className="mt-4 text-lg text-gray-600">Loading projects...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <Nav />
      <main className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold text-blue-600 px-4 md:px-8 lg:px-8">Projects</h1>
        </div>

        <div className="bg-white rounded-lg shadow-lg overflow-hidden mx-auto py-2 px-4 md:px-6 lg:px-8">
          {/* Search and Filter Section */}
          <div className="py-4 border-b border-gray-200">
            <div className="flex flex-col md:flex-row justify-between items-center gap-4">
              <div className="relative flex items-center w-full md:w-1/3">
                <Search className="absolute left-3 text-gray-400" />
                <Input
                  type="text"
                  placeholder="Search projects..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 rounded-full border-2 border-blue-200 focus:border-blue-400 focus:ring focus:ring-blue-200 focus:ring-opacity-50 bg-white"
                />
              </div>
              <div className="flex items-center gap-2 flex-wrap justify-center md:justify-end">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" className="flex items-center">
                      <Filter className="mr-2 h-4 w-4" /> Filter
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent>
                    <DropdownMenuCheckboxItem
                      checked={statusFilter.includes("active")}
                      onCheckedChange={(checked) =>
                        setStatusFilter(
                          checked ? [...statusFilter, "active"] : statusFilter.filter((item) => item !== "active")
                        )
                      }
                    >
                      Active
                    </DropdownMenuCheckboxItem>
                    <DropdownMenuCheckboxItem
                      checked={statusFilter.includes("closed")}
                      onCheckedChange={(checked) =>
                        setStatusFilter(
                          checked ? [...statusFilter, "closed"] : statusFilter.filter((item) => item !== "closed")
                        )
                      }
                    >
                      Closed
                    </DropdownMenuCheckboxItem>
                  </DropdownMenuContent>
                </DropdownMenu>
                <Button
                  variant="outline"
                  onClick={() => setSortOrder(sortOrder === "asc" ? "desc" : "asc")}
                  className="flex items-center"
                >
                  <ArrowUpDown className="mr-2 h-4 w-4" />
                  Sort: {sortOrder === "asc" ? "A-Z" : "Z-A"}
                </Button>
                <Link href="/add-project" passHref>
                  <Button className="bg-blue-600 hover:bg-blue-700 text-white">+ New Project</Button>
                </Link>
              </div>
            </div>
          </div>

          {/* Project Table */}
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>{/* No whitespace */}
                  <TableHead className="text-center whitespace-nowrap">Project</TableHead>{/* No whitespace */}
                  <TableHead className="text-center whitespace-nowrap">Client</TableHead>{/* No whitespace */}
                  <TableHead className="text-center whitespace-nowrap">Geographies</TableHead>{/* No whitespace */}
                  <TableHead className="text-center whitespace-nowrap">Status</TableHead>{/* No whitespace */}
                  <TableHead className="text-center whitespace-nowrap">Timeline</TableHead>{/* No whitespace */}
                  <TableHead className="text-center whitespace-nowrap">Expected Calls</TableHead>{/* No whitespace */}
                  <TableHead className="text-center whitespace-nowrap">Completed Calls</TableHead>{/* No whitespace */}
                  <TableHead className="text-center whitespace-nowrap w-[100px]">Actions</TableHead>{/* No whitespace */}
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredAndSortedProjects.map((project) => (
                  <TableRow key={project.project_id} className="text-center">{/* No whitespace */}
                    <TableCell className="py-3">
                      <Link
                        href={`/projects/project-detail?id=${project.project_id}`}
                        className="text-blue-600 hover:underline font-medium"
                      >
                        {project.project_name}
                      </Link>
                    </TableCell>{/* No whitespace */}
                    <TableCell className="py-3">{clients[project.client_company_id] || "Unknown"}</TableCell>{/* No whitespace */}
                    <TableCell className="py-3">{geographies[project.geography_id] || "Unknown"}</TableCell>{/* No whitespace */}
                    <TableCell className="py-3">
                      <Badge
                        variant={project.status ? "default" : "secondary"}
                        className={`px-3 py-1 rounded-md ${
                          project.status ? "bg-green-100 text-green-800" : "bg-blue-100 text-blue-800"
                        }`}
                      >
                        {project.status ? "Closed" : "Active"}
                      </Badge>
                    </TableCell>{/* No whitespace */}
                    <TableCell className="py-3 whitespace-nowrap">{`${project.timeline_start} - ${project.timeline_end}`}</TableCell>{/* No whitespace */}
                    <TableCell className="py-3">{project.expected_calls}</TableCell>{/* No whitespace */}
                    <TableCell className="py-3">{project.completed_calls}</TableCell>{/* No whitespace */}
                    <TableCell className="py-3">
                      <div className="flex justify-center gap-1">
                        <Link href={`/projects/edit-project?id=${project.project_id}`} passHref>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="hover:text-blue-600 transition-colors duration-200 p-1"
                          >
                            <Pencil className="h-5 w-5" />
                          </Button>
                        </Link>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDeleteClick(project.project_id)}
                          className="hover:text-red-600 transition-colors duration-200 p-1"
                        >
                          <Trash2 className="h-5 w-5" />
                        </Button>
                      </div>
                    </TableCell>{/* No whitespace */}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </div>
      </main>

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
          <div className="bg-white rounded-lg p-6 shadow-lg max-w-sm w-full mx-4">
            <h2 className="text-xl font-semibold mb-4">Are you sure you want to delete this project?</h2>
            <div className="flex justify-end gap-3 mt-6">
              <Button
                onClick={() => setShowDeleteModal(false)}
                variant="outline"
                className="px-4 bg-gray-200 text-gray-700 hover:bg-gray-300"
              >
                Cancel
              </Button>
              <Button
                onClick={handleDelete}
                className="px-4 bg-red-600 text-white hover:bg-red-700"
              >
                Delete
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* React Toast Container */}
      <ToastContainer />
    </div>
  );
}