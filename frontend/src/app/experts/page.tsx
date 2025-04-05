import { ExpertsTable } from "@/components/experts-table"
import { ExpertsProvider } from "@/components/experts-context"
import { Nav } from "@/components/nav"
import { Button } from "@/components/ui/button"
import { Plus } from "lucide-react"
import Link from "next/link"

export default function ExpertsPage() {
  return (
    <div className="min-h-screen bg-gray-100">
      <Nav />
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold text-blue-700 px-4 md:px-8 lg:px-8">Experts</h1>
          {/* <Link href="/experts/add">
            <Button className="bg-blue-600 hover:bg-blue-700 text-white flex items-center gap-2">
              <Plus className="h-4 w-4" />
              Add Expert
            </Button>
          </Link> */}
        </div>
        <ExpertsProvider>
          <main className="bg-white rounded-lg shadow-lg px-6 py-1">
            <ExpertsTable />
          </main>
        </ExpertsProvider>
      </div>
    </div>
  )
}