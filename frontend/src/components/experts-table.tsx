"use client"

import React from "react"

import { useState, useEffect } from "react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Edit2, Trash2, Eye, Search, X, User, UserCheck, Plus } from "lucide-react"
import { ExpertModal } from "./expert-modal"
import { ProjectSelectModal } from "./project-select-modal"
import API from "@/services/api"
import Link from "next/link"
import { ToastContainer, toast } from "react-toastify"
import "react-toastify/dist/ReactToastify.css"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { useExperts } from "./experts-context"

export interface Expert {
  id: string
  fullName: string
  industry: string
  countryOfResidence: string
  expertCost: number
  email: string
  phone: string
  isFormer: boolean
  notes: string
  linkedIn: string
  career: Array<{
    title: string
    company_name: string
    dateRange: string
    end_date: string | null
  }>
  projects: Array<{
    id: string
    projectName: string
  }>
}

export function ExpertsTable() {
  // Get experts from context
  const { experts, filteredExperts, loading, selectedExpert, setSelectedExpert, refreshExperts, filters, setFilters } =
    useExperts()

  // Local state
  const [isProjectModalOpen, setIsProjectModalOpen] = useState(false)
  const [expertToDelete, setExpertToDelete] = useState<Expert | null>(null)
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)
  const [currentFilterActive, setCurrentFilterActive] = useState(false)
  const [formerFilterActive, setFormerFilterActive] = useState(false)
  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 10

  // Use the full experts list instead of filteredExperts to ensure we're working with all experts
  const [displayExperts, setDisplayExperts] = useState<Expert[]>([])

  // Update displayExperts whenever experts or filters change
  useEffect(() => {
    // Start with all experts
    let result = [...experts]

    // Apply search filter if it exists
    if (filters.searchQuery) {
      const searchLower = filters.searchQuery.toLowerCase()
      result = result.filter(
        (expert) =>
          expert.fullName.toLowerCase().includes(searchLower) ||
          expert.email.toLowerCase().includes(searchLower) ||
          expert.industry.toLowerCase().includes(searchLower) ||
          expert.countryOfResidence.toLowerCase().includes(searchLower) ||
          (expert.career &&
            expert.career.some(
              (job) =>
                job.title.toLowerCase().includes(searchLower) || job.company_name.toLowerCase().includes(searchLower),
            )),
      )
    }

    // Apply current/former filters
    if (currentFilterActive || formerFilterActive) {
      result = result.filter((expert) => {
        // Check if expert has any current experience (end_date is null)
        const hasCurrent = expert.career && expert.career.some((job) => job.end_date === null)

        // Current filter is active and expert has current experience
        if (currentFilterActive && hasCurrent) {
          return true
        }

        // Former filter is active and expert has no current experience (all experiences have end_date)
        if (formerFilterActive && !hasCurrent) {
          return true
        }

        return false
      })
    }

    setDisplayExperts(result)
    // Reset to first page when filters change
    setCurrentPage(1)
  }, [experts, filters.searchQuery, currentFilterActive, formerFilterActive])

  // Calculate pagination
  const totalPages = Math.ceil(displayExperts.length / itemsPerPage)
  const currentExperts = displayExperts.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage)

  // Page change handler
  const handlePageChange = (page: number) => {
    setCurrentPage(page)
  }

  // Toggle handlers for filters
  const toggleCurrentFilter = () => {
    setCurrentFilterActive(!currentFilterActive)
  }

  const toggleFormerFilter = () => {
    setFormerFilterActive(!formerFilterActive)
  }

  const handleAddToProject = () => {
    setIsProjectModalOpen(true)
  }

  const handleProjectSelect = async (projectId: string) => {
    if (selectedExpert) {
      try {
        const response = await API.post("/project_pipeline/", {
          expert_id: selectedExpert.id,
          project_id: projectId,
        })
        console.log("Expert added to project:", response.data)
        toast.success("Expert added to project successfully.")
        setIsProjectModalOpen(false)
        refreshExperts() // Refresh the data to update the UI
      } catch (error) {
        console.error("Error adding expert to project:", error)
        toast.error("Failed to add expert to project. Please try again.")
      }
    }
  }

  const handleDeleteExpert = (expert: Expert, e: React.MouseEvent) => {
    e.stopPropagation() // Prevent row click event
    setExpertToDelete(expert)
    setIsDeleteModalOpen(true)
  }

  const confirmDelete = async () => {
    if (!expertToDelete) return

    try {
      await API.delete(`/experts/${expertToDelete.id}`)
      toast.success(`${expertToDelete.fullName} has been deleted.`)
      refreshExperts() // Refresh the data to update the UI
    } catch (error) {
      console.error("Error deleting expert:", error)
      toast.error("Failed to delete expert. Please try again.")
    } finally {
      setIsDeleteModalOpen(false)
      setExpertToDelete(null)
    }
  }

  const handleClearFilters = () => {
    // Clear search filters
    setFilters({
      searchQuery: "",
      expertTitle: "",
      companies: "",
    })

    // Reset toggle filters
    setCurrentFilterActive(false)
    setFormerFilterActive(false)
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {/* Toast Container for notifications */}
      <ToastContainer
        position="top-right"
        autoClose={5000}
        hideProgressBar={false}
        newestOnTop
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
      />

      {/* Enhanced Search and Filters Section with soft blue theme */}
      <div className="flex flex-col">
        <div className="py-4 border-b border-blue-100">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            {/* Search with blue styling */}
            <div className="relative flex items-center w-full md:w-1/3">
              <Search className="absolute left-3 text-blue-500" />
              <Input
                type="text"
                placeholder="Search experts..."
                value={filters.searchQuery}
                onChange={(e) => setFilters({ ...filters, searchQuery: e.target.value })}
                className="pl-10 rounded-full border border-blue-200 focus:border-blue-400 focus:ring focus:ring-blue-100 focus:ring-opacity-50 bg-white"
              />
            </div>

            {/* Independently Toggleable Expert Filters with soft blue theme */}
            <div className="flex items-center gap-3 flex-wrap justify-center md:justify-end">
              <div className="flex items-center gap-2">
                <Button
                  onClick={toggleCurrentFilter}
                  variant="outline"
                  className={`rounded-full px-3 py-1 h-9 text-sm flex items-center gap-1.5 ${
                    currentFilterActive
                      ? "bg-blue-100 text-blue-700 border border-blue-200 hover:bg-blue-200"
                      : "bg-white border border-blue-200 text-blue-600 hover:bg-blue-50 hover:border-blue-300"
                  }`}
                >
                  <User className="h-4 w-4" />
                  Current
                </Button>

                <Button
                  onClick={toggleFormerFilter}
                  variant="outline"
                  className={`rounded-full px-3 py-1 h-9 text-sm flex items-center gap-1.5 ${
                    formerFilterActive
                      ? "bg-blue-100 text-blue-700 border border-blue-200 hover:bg-blue-200"
                      : "bg-white border border-blue-200 text-blue-600 hover:bg-blue-50 hover:border-blue-300"
                  }`}
                >
                  <UserCheck className="h-4 w-4" />
                  Former
                </Button>
              </div>
              {(currentFilterActive || formerFilterActive || filters.searchQuery) && (
                <Button
                  variant="outline"
                  size="sm"
                  className="text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded-full border border-blue-200"
                  onClick={handleClearFilters}
                >
                  <X className="h-4 w-4 mr-1" />
                  Clear all filters
                </Button>
              )}

              {/* Add New Expert button with blue theme */}
              <Link href="/add-expert" passHref>
                <Button className="bg-blue-600 hover:bg-blue-700 text-white shadow-sm rounded-full">
                  <Plus className="mr-2 h-4 w-4" /> New Expert
                </Button>
              </Link>
            </div>
          </div>

          {/* Filter status indicator */}
          <div className="mt-2 flex justify-between items-center">
            <div className="text-sm text-blue-600">
              {displayExperts.length === experts.length ? (
                <span>Showing all experts ({experts.length})</span>
              ) : (
                <span>
                  Filtered: {displayExperts.length} of {experts.length} experts
                </span>
              )}
            </div>

            {filters.searchQuery && (
              <Button
                variant="outline"
                size="sm"
                className="text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded-full border border-blue-200"
                onClick={() => setFilters({ ...filters, searchQuery: "" })}
              >
                <X className="h-4 w-4 mr-1" />
                Clear search
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* Enhanced Table with Soft Blue Theme */}
      <div className="rounded-xl border border-blue-100 bg-white overflow-hidden shadow-md">
        <Table>
          <TableHeader className="bg-blue-50">
            <TableRow className="border-b border-blue-100">
              <TableHead className="w-[30px] font-semibold text-blue-800"></TableHead>
              <TableHead className="font-semibold text-blue-800">Expert</TableHead>
              <TableHead className="font-semibold text-blue-800">Position</TableHead>
              <TableHead className="font-semibold text-blue-800">Company</TableHead>
              <TableHead className="font-semibold text-blue-800">Industry</TableHead>
              <TableHead className="font-semibold text-blue-800">Location</TableHead>
              <TableHead className="font-semibold text-blue-800">Cost</TableHead>
              <TableHead className="text-right font-semibold text-blue-800">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {currentExperts.length === 0 ? (
              <TableRow>
                <TableCell colSpan={8} className="h-24 text-center text-gray-500">
                  {displayExperts.length === 0
                    ? experts.length === 0
                      ? "No experts found. Add your first expert."
                      : "No experts match the current filters. Try adjusting your filter selection."
                    : "No experts on this page. Try going to a different page."}
                </TableCell>
              </TableRow>
            ) : (
              currentExperts.map((expert) => {
                // Check if expert has current position (any career item with null end_date)
                const hasCurrent = expert.career && expert.career.some((job) => job.end_date === null)

                return (
                  <TableRow
                    key={expert.id}
                    className="cursor-pointer transition-colors hover:bg-gray-50 border-b border-blue-50"
                    onClick={() => setSelectedExpert(expert)}
                  >
                    <TableCell>
                      <input
                        type="checkbox"
                        className="rounded border-blue-300 text-blue-600 focus:ring-blue-500 focus:ring-offset-0"
                        onClick={(e) => e.stopPropagation()}
                      />
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-3 pr-8">
                        <div>
                          <div className="font-medium text-gray-900">{expert.fullName}</div>
                          <div className="text-sm text-gray-500">{expert.email}</div>
                        </div>
                        {/* {!hasCurrent && (
                          <Badge
                            variant="secondary"
                            className="ml-2 bg-blue-50 text-blue-600 hover:bg-blue-100 px-3 py-1 rounded-full text-xs"
                          >
                            Former
                          </Badge>
                        )} */}
                      </div>
                    </TableCell>
                    <TableCell>
                      {expert.career && expert.career.length > 0 ? (
                        expert.career[0].title
                      ) : (
                        <span className="text-gray-400 italic">Not specified</span>
                      )}
                    </TableCell>
                    <TableCell>
                      {expert.career && expert.career.length > 0 ? (
                        expert.career[0].company_name
                      ) : (
                        <span className="text-gray-400 italic">Not specified</span>
                      )}
                    </TableCell>
                    <TableCell>
                      <span className="inline-flex items-center rounded-full bg-blue-50 px-3 py-1 text-xs font-medium text-blue-600">
                        {expert.industry}
                      </span>
                    </TableCell>
                    <TableCell>{expert.countryOfResidence}</TableCell>
                    <TableCell className="font-medium text-blue-700">${expert.expertCost.toLocaleString()}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-3" onClick={(e) => e.stopPropagation()}>

                        <Link
                          href={`/edit-expert?id=${expert.id}`}
                          passHref
                          onClick={(e) => {
                            e.stopPropagation() // Prevent row click event
                          }}
                        >
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-9 w-9 text-blue-400 hover:text-blue-600 hover:bg-blue-50 rounded-full"
                          >
                            <Edit2 className="h-4 w-4" />
                            <span className="sr-only">Edit</span>
                          </Button>
                        </Link>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-9 w-9 text-blue-400 hover:text-red-600 hover:bg-red-50 rounded-full"
                          onClick={(e) => handleDeleteExpert(expert, e)}
                        >
                          <Trash2 className="h-4 w-4" />
                          <span className="sr-only">Delete</span>
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                )
              })
            )}
          </TableBody>
        </Table>
      </div>

      <ExpertModal
        expert={selectedExpert}
        isOpen={selectedExpert !== null}
        onClose={() => setSelectedExpert(null)}
        onAddToProject={handleAddToProject}
        pipeline={
          selectedExpert
            ? selectedExpert.projects
                .filter((project) => project.projectName.includes("pipeline"))
                .map((project) => project.projectName)
            : []
        }
        published={
          selectedExpert
            ? selectedExpert.projects
                .filter((project) => project.projectName.includes("published"))
                .map((project) => project.projectName)
            : []
        }
        projects={selectedExpert ? selectedExpert.projects.map((project) => project.projectName) : []}
      />

      <ProjectSelectModal
        isOpen={isProjectModalOpen}
        onClose={() => setIsProjectModalOpen(false)}
        onSelect={handleProjectSelect}
      />

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={isDeleteModalOpen} onOpenChange={setIsDeleteModalOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Expert</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete {expertToDelete?.fullName}? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDelete} className="bg-red-600 text-white hover:bg-red-700">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Enhanced Pagination with Soft Blue Theme */}
      {displayExperts.length > 0 && (
        <div className="flex items-center justify-between px-4 py-3 mt-4 bg-white rounded-xl shadow-sm border border-blue-100">
          <div className="text-sm text-gray-600">
            Showing{" "}
            <span className="font-medium text-blue-700">
              {Math.min(displayExperts.length, (currentPage - 1) * itemsPerPage + 1)}
            </span>{" "}
            to{" "}
            <span className="font-medium text-blue-700">
              {Math.min(displayExperts.length, currentPage * itemsPerPage)}
            </span>{" "}
            of <span className="font-medium text-blue-700">{displayExperts.length}</span> experts
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage === 1}
              className="h-9 w-9 p-0 rounded-full border border-blue-200 bg-white text-blue-500 hover:bg-blue-50 disabled:opacity-40"
            >
              &lt;
            </Button>
            {Array.from({ length: totalPages }, (_, i) => i + 1)
              .filter(
                (page) => page === 1 || page === totalPages || (page >= currentPage - 1 && page <= currentPage + 1),
              )
              .map((page, index, array) => {
                // Add ellipsis
                if (index > 0 && array[index - 1] !== page - 1) {
                  return (
                    <React.Fragment key={`ellipsis-${page}`}>
                      <span className="flex items-center justify-center h-9 w-9 text-blue-400">...</span>
                      <Button
                        key={page}
                        variant={currentPage === page ? "default" : "outline"}
                        size="sm"
                        onClick={() => handlePageChange(page)}
                        className={`h-9 w-9 p-0 rounded-full ${
                          currentPage === page
                            ? "bg-blue-500 text-white border-0 shadow-md"
                            : "bg-white text-blue-600 border border-blue-200 hover:bg-blue-50"
                        }`}
                      >
                        {page}
                      </Button>
                    </React.Fragment>
                  )
                }
                return (
                  <Button
                    key={page}
                    variant={currentPage === page ? "default" : "outline"}
                    size="sm"
                    onClick={() => handlePageChange(page)}
                    className={`h-9 w-9 p-0 rounded-full ${
                      currentPage === page
                        ? "bg-blue-500 text-white border-0 shadow-md"
                        : "bg-white text-blue-600 border border-blue-200 hover:bg-blue-50"
                    }`}
                  >
                    {page}
                  </Button>
                )
              })}
            <Button
              variant="outline"
              size="sm"
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={currentPage === totalPages}
              className="h-9 w-9 p-0 rounded-full border border-blue-200 bg-white text-blue-500 hover:bg-blue-50 disabled:opacity-40"
            >
              &gt;
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}

