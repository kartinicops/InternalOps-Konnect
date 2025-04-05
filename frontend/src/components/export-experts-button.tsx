import React, { useState } from "react"
import { Button } from "@/components/ui/button"
import { FileText, Loader2 } from "lucide-react"
import { generateExpertsPDF } from "@/lib/generate-expert-pdf"
import { useSearchParams } from "next/navigation"
import { toast } from "react-toastify"

interface ExportExpertsButtonProps {
  expertIds: number[]
  disabled?: boolean
}

const ExportExpertsButton = ({ expertIds, disabled = false }: ExportExpertsButtonProps) => {
  const [isExporting, setIsExporting] = useState(false)
  const searchParams = useSearchParams()
  const projectId = searchParams.get("id")

  const handleExport = async () => {
    if (expertIds.length === 0) {
      toast.warn("Please select at least one expert to export")
      return
    }

    setIsExporting(true)
    try {
      // Use the project ID in the PDF generation if available
      const projectIdNumber = projectId ? parseInt(projectId) : null
      const pdfBlob = await generateExpertsPDF(expertIds, projectIdNumber)
      
      // Create a URL for the blob
      const url = URL.createObjectURL(pdfBlob)
      
      // Create a temporary link and trigger download
      const link = document.createElement("a")
      link.href = url
      link.download = `expert-profiles-${new Date().toISOString().split("T")[0]}.pdf`
      document.body.appendChild(link)
      link.click()
      
      // Clean up
      document.body.removeChild(link)
      URL.revokeObjectURL(url)
      
      toast.success(`${expertIds.length} expert profile${expertIds.length > 1 ? 's' : ''} exported successfully`)
    } catch (error) {
      console.error("Error exporting expert profiles:", error)
      toast.error("Failed to export expert profiles. Please try again.")
    } finally {
      setIsExporting(false)
    }
  }

  return (
    <Button
      variant="outline"
      onClick={handleExport}
      disabled={disabled || isExporting || expertIds.length === 0}
      className="bg-white text-gray-700 hover:bg-blue-50 hover:text-blue-700 border border-gray-300"
    >
      {isExporting ? (
        <>
          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
          Exporting...
        </>
      ) : (
        <>
          <FileText className="h-4 w-4 mr-2" />
          Export PDF
        </>
      )}
    </Button>
  )
}

export default ExportExpertsButton