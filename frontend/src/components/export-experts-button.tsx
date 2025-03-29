"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { FileDown } from "lucide-react"
import { generateExpertsPDF } from "@/lib/generate-expert-pdf"
import { toast } from "react-toastify"

interface ExportExpertsButtonProps {
  expertIds: number[]
  disabled?: boolean
  variant?: "default" | "outline" | "secondary" | "ghost" | "link" | "destructive"
}

const ExportExpertsButton = ({ expertIds, disabled = false, variant = "outline" }: ExportExpertsButtonProps) => {
  const [isExporting, setIsExporting] = useState(false)

  const handleExportPDF = async () => {
    if (expertIds.length === 0) {
      toast.error("No experts selected for export")
      return
    }

    try {
      setIsExporting(true)

      // Generate the PDF
      const pdfBlob = await generateExpertsPDF(expertIds)

      // Create a download link
      const url = URL.createObjectURL(pdfBlob)
      const link = document.createElement("a")
      link.href = url
      link.download =
        expertIds.length === 1 ? `expert-profile-${expertIds[0]}.pdf` : `expert-profiles-${expertIds.length}.pdf`

      // Trigger download
      document.body.appendChild(link)
      link.click()

      // Clean up
      document.body.removeChild(link)
      URL.revokeObjectURL(url)

      toast.success(`${expertIds.length} expert profile${expertIds.length > 1 ? "s" : ""} exported successfully`)
    } catch (error) {
      console.error("Error exporting experts:", error)
      toast.error("Failed to export expert profiles")
    } finally {
      setIsExporting(false)
    }
  }

  return (
    <Button variant={variant} onClick={handleExportPDF} disabled={disabled || isExporting || expertIds.length === 0}>
      {isExporting ? "Exporting..." : "Export to PDF"}
      <FileDown className="ml-2 h-4 w-4" />
    </Button>
  )
}

export default ExportExpertsButton