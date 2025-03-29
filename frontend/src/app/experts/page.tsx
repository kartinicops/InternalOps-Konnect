import { ExpertsFilters } from "@/components/experts-filters"
import { ExpertsTable } from "@/components/experts-table"
import { Nav } from "@/components/nav"
import { Button } from "@/components/ui/button"
import { Plus } from "lucide-react"
import Link from "next/link"

export default function ExpertsPage() {
  return (
    <div className="min-h-screen bg-gray-100">
      <Nav />
      <div className="container mx-auto p-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold text-blue-600">Experts</h1>
          <Link href="/experts/add">
            <Button className="bg-blue-600 hover:bg-blue-700 text-white flex items-center gap-2">
              <Plus className="h-4 w-4" />
              Add Expert
            </Button>
          </Link>
        </div>
        <div className="flex flex-col md:flex-row gap-6">
          <aside className="w-full md:w-1/4">
            <div className="bg-white rounded-lg shadow-lg p-6">
              <ExpertsFilters />
            </div>
          </aside>
          <main className="flex-1">
            <div className="bg-white rounded-lg shadow-lg p-6">
              <ExpertsTable />
            </div>
          </main>
        </div>
      </div>
    </div>
  )
}