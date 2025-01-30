import { useState, useEffect, useMemo } from 'react'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import API from "@/services/api" // Gunakan service API

interface Project {
  id: string
  name: string
  client: string
  published: number
  completedCalls: number
  projectPublished: string
  geographies: string[]
  status: 'active' | 'close'
}

export function ProjectTable({ sortOrder, statusFilter }: { sortOrder: 'asc' | 'desc', statusFilter: string[] }) {
  const [projects, setProjects] = useState<Project[]>([])

  useEffect(() => {
    const fetchProjects = async () => {
      try {
        const response = await API.get("/projects/"); // Sesuaikan dengan endpoint Django
        setProjects(response.data);
      } catch (error) {
        console.error("Error fetching projects:", error);
      }
    };

    fetchProjects();
  }, []);

  const filteredAndSortedProjects = useMemo(() => {
    let filtered = projects;

    if (statusFilter.length > 0) {
      filtered = filtered.filter(project => statusFilter.includes(project.status));
    }

    return filtered.sort((a, b) => (sortOrder === 'asc' ? a.name.localeCompare(b.name) : b.name.localeCompare(a.name)));
  }, [projects, sortOrder, statusFilter]);

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Project</TableHead>
            <TableHead>Client</TableHead>
            <TableHead>Published</TableHead>
            <TableHead>Completejjjjjjjjjjjjjjjjjjd calls</TableHead>
            <TableHead>Project published</TableHead>
            <TableHead>Geographies</TableHead>
            <TableHead>Status</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {filteredAndSortedProjects.map((project) => (
            <TableRow key={project.id}>
              <TableCell className="font-medium">{project.name}</TableCell>
              <TableCell>{project.client}</TableCell>
              <TableCell>{project.published}</TableCell>
              <TableCell>{project.completedCalls}</TableCell>
              <TableCell>{project.projectPublished}</TableCell>
              <TableCell>
                <div className="flex flex-wrap gap-1">
                  {project.geographies.map((geography) => (
                    <Badge key={geography} variant="secondary" className="rounded-md">
                      {geography}
                    </Badge>
                  ))}
                </div>
              </TableCell>
              <TableCell>
                <Badge variant={project.status === 'active' ? 'default' : 'secondary'} className="rounded-md">
                  {project.status}
                </Badge>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}