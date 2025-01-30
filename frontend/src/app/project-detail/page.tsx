'use client';

import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Button } from "@/components/ui/button";
import { Nav } from "@/components/nav";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Calendar, FileText, Users, AlertCircle, Download } from 'lucide-react';
import API from '@/services/api';

interface Project {
  project_id: number;
  project_name: string;
  status: string;
  timeline_start: string;
  timeline_end: string;
  expected_calls: number;
  completed_calls: number;
  client_requirements: string;
  created_at: string;
  geography: string;
  companies_of_interest: string[]; // Array dari company names
  general_screening_questions: string; // Longtext berisi pertanyaan dengan newline
  files: { name: string; url: string }[]; // File list untuk download
}

export default function ProjectDetailPage() {
  const searchParams = useSearchParams();
  const id = searchParams.get('id');
  const [project, setProject] = useState<Project | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;

    const fetchProject = async () => {
      try {
        await API.get("/api/csrf/"); // Pastikan CSRF token diambil
        const response = await API.get(`/projects/${id}/`, { withCredentials: true });
        setProject(response.data);
      } catch (error) {
        console.error("Error fetching project:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchProject();
  }, [id]);

  if (loading) {
    return <div className="flex items-center justify-center h-screen">Loading project details...</div>;
  }

  if (!project) {
    return <div className="flex items-center justify-center h-screen">Project not found</div>;
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="border-b bg-white shadow-sm">
        <Nav isProjectDetail={true} projectName={project.project_name} />
      </div>
      
      <div className="container mx-auto py-8 px-4 sm:px-6 lg:px-8">
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Status</CardTitle>
              <Badge variant={project.status === "active" ? "default" : "secondary"}>{project.status}</Badge>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{project.status}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Timeline</CardTitle>
              <Calendar className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{`${project.timeline_start} - ${project.timeline_end}`}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Expected Calls</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{project.expected_calls}</div>
            </CardContent>
          </Card>
        </div>

        <div className="mt-8 grid gap-6 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Companies of Interest</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="list-disc pl-5 space-y-1">
                {project.companies_of_interest?.length ? (
                  project.companies_of_interest.map((company, index) => (
                    <li key={index}>{company}</li>
                  ))
                ) : (
                  <p>No companies listed.</p>
                )}
              </ul>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Client Requirements</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center space-x-2">
                <AlertCircle className="h-4 w-4 text-muted-foreground" />
                <p>{project.client_requirements || "No requirements provided."}</p>
              </div>
            </CardContent>
          </Card>
        </div>

        <Card className="mt-8">
          <CardHeader>
            <CardTitle>General Screening Questions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              <div>
                <ol className="list-decimal pl-6 space-y-2">
                  {project.general_screening_questions ? (
                    project.general_screening_questions
                      .split("\n") // Pisahkan berdasarkan newline
                      .map((question, index) => (
                        <li key={index}>{question.replace(/^(Question\s*\d+\s*:\s*)/, "").trim()}</li> // Hapus "Question 1 :", "Question 2 :", dst.
                      ))
                  ) : (
                    <p>No screening questions available.</p>
                  )}
                </ol>

              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="mt-8">
          <CardHeader>
            <CardTitle>Files</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2">
              {project.files?.length ? (
                project.files.map((file) => (
                  <li key={file.name}>
                    <Button variant="outline" asChild className="w-full justify-start">
                      <Link href={file.url} download>
                        <FileText className="mr-2 h-4 w-4" />
                        {file.name}
                        <Download className="ml-auto h-4 w-4" />
                      </Link>
                    </Button>
                  </li>
                ))
              ) : (
                <p>No files available.</p>
              )}
            </ul>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
