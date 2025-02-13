"use client";

import { useState } from "react";
import axios from "axios";
import { useRouter } from "next/navigation";
import { Calendar, Plus, Upload, X } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { DatePicker } from "@/components/ui/date-picker";
import { Nav } from "@/components/nav";

export default function AddProject() {
  const router = useRouter();
  const [projectName, setProjectName] = useState("");
  const [status, setStatus] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [expectedCalls, setExpectedCalls] = useState(0);
  const [companies, setCompanies] = useState<string[]>([""]);
  const [categories, setCategories] = useState<string[]>([""]);
  const [clientRequirements, setClientRequirements] = useState("");
  const [screeningQuestions, setScreeningQuestions] = useState("");
  const [files, setFiles] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  const addCompany = () => setCompanies([...companies, ""]);
  const removeCompany = (index: number) =>
    setCompanies(companies.filter((_, i) => i !== index));

  const updateCompany = (index: number, value: string) => {
    const newCompanies = [...companies];
    newCompanies[index] = value;
    setCompanies(newCompanies);
  };

  const addCategory = () => setCategories([...categories, ""]);
  const removeCategory = (index: number) =>
    setCategories(categories.filter((_, i) => i !== index));

  const updateCategory = (index: number, value: string) => {
    const newCategories = [...categories];
    newCategories[index] = value;
    setCategories(newCategories);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");

    try {
      const formData = new FormData();
      formData.append("project_name", projectName);
      formData.append("status", status);
      formData.append("timeline_start", startDate);
      formData.append("timeline_end", endDate);
      formData.append("expected_calls", expectedCalls.toString());
      formData.append("client_requirements", clientRequirements);
      formData.append("general_screening_questions", screeningQuestions);
      formData.append("companies", JSON.stringify(companies));
      formData.append("categories", JSON.stringify(categories));

      if (files) {
        formData.append("file", files);
      }

      await axios.post("/projects/", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
        withCredentials: true,
      });

      setMessage("Project successfully created!");
      setTimeout(() => {
        router.push("/projects"); // Redirect ke halaman proyek
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

        {/* Basic Info */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
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
              <Input
                id="status"
                placeholder="Enter project status"
                value={status}
                onChange={(e) => setStatus(e.target.value)}
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
                id="expectedCalls"
                type="number"
                min="0"
                placeholder="Enter expected calls"
                value={expectedCalls}
                onChange={(e) => setExpectedCalls(parseInt(e.target.value))}
                required
              />
            </CardContent>
          </Card>
        </div>

        {/* Timeline */}
        <Card>
          <CardHeader>
            <Label>Timeline</Label>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="startDate">Start Date</Label>
              <Input
                type="date"
                id="startDate"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                required
              />
            </div>
            <div>
              <Label htmlFor="endDate">End Date</Label>
              <Input
                type="date"
                id="endDate"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                required
              />
            </div>
          </CardContent>
        </Card>

        {/* Companies */}
        <Card>
          <CardHeader>
            <CardTitle>Companies of Interest</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {companies.map((company, index) => (
              <div key={index} className="flex gap-2">
                <Input
                  value={company}
                  onChange={(e) => updateCompany(index, e.target.value)}
                  placeholder="Enter company name"
                />
                <Button
                  type="button"
                  variant="outline"
                  size="icon"
                  onClick={() => removeCompany(index)}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            ))}
            <Button type="button" variant="outline" onClick={addCompany}>
              <Plus className="h-4 w-4 mr-2" />
              Add Company
            </Button>
          </CardContent>
        </Card>

        {/* Client Requirements */}
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

        {/* General Screening Questions */}
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

        {/* File Upload */}
        <Card>
          <CardHeader>
            <CardTitle>Upload Files</CardTitle>
          </CardHeader>
          <CardContent>
            <Input type="file" onChange={(e) => setFiles(e.target.files?.[0] || null)} />
          </CardContent>
        </Card>

        {/* Submit */}
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