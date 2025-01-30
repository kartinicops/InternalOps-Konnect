'use client'
import { useState } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button"
import { Search, Plus, Download, Briefcase } from 'lucide-react'


const handleDownloadExperts = () => {
  // Mock download logic
  const data = JSON.stringify(experts, null, 2)
  const blob = new Blob([data], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = 'experts.json'
  a.click()
  URL.revokeObjectURL(url)
}

const handleAddToProject = () => {
  // Logic for adding experts to project
  console.log("Add to Project clicked")
}
interface Expert {
  id: string;
  title: string;
  company: string;
  dateRange: string;
  lastPublished: string;
  projects: number;
  calls: number;
  isFormer: boolean;
}

const experts: Expert[] = [
  {
    id: "1",
    title: "Head of Sales France Benelux Nordics & Export",
    company: "TEREOS",
    dateRange: "Apr 2022 - Feb 2023",
    lastPublished: "-",
    projects: 1,
    calls: 0,
    isFormer: true,
  },
  {
    id: "2",
    title: "Total Rewards and Data Management",
    company: "Hyundai Asia Resources, Inc. (HARI)",
    dateRange: "Mar 2018 - Aug 2020",
    lastPublished: "9 Dec 2024 15:57",
    projects: 1,
    calls: 0,
    isFormer: true,
  },
  // Add more experts as needed
];

export function ExpertsTable() {
  const [selectedExperts, setSelectedExperts] = useState<string[]>([]);

  const handleCheckboxChange = (id: string) => {
    setSelectedExperts((prev) =>
      prev.includes(id)
        ? prev.filter((expertId) => expertId !== id)
        : [...prev, id]
    );
  };

  return (
    <div>
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[30px]"></TableHead>
              <TableHead>Title</TableHead>
              <TableHead>Company</TableHead>
              <TableHead>Last published</TableHead>
              <TableHead className="text-center">Projects</TableHead>
              <TableHead className="text-center">Calls</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {experts.map((expert) => (
              <TableRow key={expert.id}>
                <TableCell>
                  <input
                    type="checkbox"
                    className="rounded border-gray-300"
                    onChange={() => handleCheckboxChange(expert.id)}
                  />
                </TableCell>
                <TableCell>
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      {expert.isFormer && (
                        <Badge variant="secondary" className="text-xs">
                          Former
                        </Badge>
                      )}
                      <span>{expert.title}</span>
                    </div>
                    <div className="text-sm text-gray-500">
                      {expert.dateRange}
                    </div>
                  </div>
                </TableCell>
                <TableCell>{expert.company}</TableCell>
                <TableCell>{expert.lastPublished}</TableCell>
                <TableCell className="text-center">{expert.projects}</TableCell>
                <TableCell className="text-center">{expert.calls}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {selectedExperts.length > 0 && (
        <div className="mt-4 flex">
            <Button className="ml-4" onClick={handleDownloadExperts}>
              <Download className="h-4 w-4 mr-2" />
              Download Experts
            </Button>
            <Button className="ml-4" onClick={handleAddToProject}>
              <Briefcase className="h-4 w-4 mr-2" />
              Add to Project
            </Button>
        </div>
      )}
    </div>
  );
}