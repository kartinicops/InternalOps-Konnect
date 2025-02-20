"use client";

import { useState } from "react";
import axios from "axios";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Nav } from "@/components/nav";

export default function AddProject() {
  const router = useRouter();
  const [projectName, setProjectName] = useState("");
  const [status, setStatus] = useState(false);
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [expectedCalls, setExpectedCalls] = useState(0);
  const [clientRequirements, setClientRequirements] = useState("");
  const [screeningQuestions, setScreeningQuestions] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");

    try {
        // **1. Buat proyek baru**
        const projectData = {
            project_name: projectName,
            status: status,
            timeline_start: startDate,
            timeline_end: endDate,
            expected_calls: expectedCalls,
            client_requirements: clientRequirements,
            general_screening_questions: screeningQuestions,
        };

        const projectResponse = await axios.post("http://127.0.0.1:8000/projects/", projectData, {
            headers: { "Content-Type": "application/json" },
            withCredentials: true,
        });

        const projectId = projectResponse.data.project_id; // Ambil ID proyek dari response

        // **Pastikan projectId tidak null atau undefined**
        if (!projectId) {
            throw new Error("Project ID is missing. File upload aborted.");
        }

        // **2. Upload file (jika ada)**
        if (file) {
            const formData = new FormData();
            formData.append("project_id", projectId.toString()); // Pastikan ID dikirim dengan benar
            formData.append("file_path", file); // Kirim file

            await axios.post("http://127.0.0.1:8000/projects_files/", formData, {
                withCredentials: true, // Biarkan Axios menangani header multipart
            });
        }

        setMessage("Project successfully created!");
        setTimeout(() => {
            router.push("/projects");
        }, 2000);
    } catch (error) {
        console.error("Error creating project:", error);
        setMessage("Failed to create project.");
    } finally {
        setLoading(false);
    }
};


  return (
    <div>
      <Nav />
      <form className="container mx-auto p-6 space-y-6" onSubmit={handleSubmit}>
        <h1 className="text-3xl font-bold">Add New Project</h1>

        <Card>
          <CardHeader>
            <Label htmlFor="projectName">Project Name</Label>
          </CardHeader>
          <CardContent>
            <Input
              id="projectName"
              placeholder="Enter project name"
              value={projectName}
              onChange={(e) => setProjectName(e.target.value)}
              required
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <Label htmlFor="status">Status</Label>
          </CardHeader>
          <CardContent>
            <select
              id="status"
              value={status.toString()}
              onChange={(e) => setStatus(e.target.value === "true")}
              className="w-full p-2 border rounded"
            >
              <option value="true">Active</option>
              <option value="false">Inactive</option>
            </select>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <Label>Timeline</Label>
          </CardHeader>
          <CardContent className="space-y-4">
            <Input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              required
            />
            <Input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              required
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <Label htmlFor="expectedCalls">Expected Calls</Label>
          </CardHeader>
          <CardContent>
            <Input
              type="number"
              min="0"
              placeholder="Enter expected calls"
              value={expectedCalls}
              onChange={(e) => setExpectedCalls(parseInt(e.target.value))}
              required
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Client Requirements</CardTitle>
          </CardHeader>
          <CardContent>
            <Textarea
              placeholder="Enter client requirements"
              value={clientRequirements}
              onChange={(e) => setClientRequirements(e.target.value)}
              required
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>General Screening Questions</CardTitle>
          </CardHeader>
          <CardContent>
            <Textarea
              placeholder="Enter general screening questions"
              value={screeningQuestions}
              onChange={(e) => setScreeningQuestions(e.target.value)}
              required
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Upload Project File</CardTitle>
          </CardHeader>
          <CardContent>
            <Input
              type="file"
              accept=".pdf,.doc,.docx,.xls,.xlsx"
              onChange={(e) => setFile(e.target.files?.[0] || null)}
            />
          </CardContent>
        </Card>

        <div className="flex justify-end gap-4">
          <Button variant="outline" type="reset">
            Cancel
          </Button>
          <Button type="submit" disabled={loading}>
            {loading ? "Creating..." : "Create Project"}
          </Button>
        </div>

        {message && <p className="text-center mt-4">{message}</p>}
      </form>
    </div>
  );
}
