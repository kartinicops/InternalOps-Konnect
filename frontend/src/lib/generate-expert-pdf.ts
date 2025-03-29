import { jsPDF } from "jspdf"
import "jspdf-autotable"
import API from "@/services/api"

// Types based on your existing components
interface Expert {
  expert_id: number
  full_name: string
  linkedIn_profile_link: string
  industry: string
  country_of_residence: string
  email: string
  phone_number: string
  expert_cost: number
  created_at?: string
}

interface Experience {
  experience_id: number
  expert_id: number
  company_name: string
  title: string
  start_date: string
  end_date: string | null
}

interface Project {
  project_id: number
  project_name: string
  status: boolean
}

interface ScreeningQuestion {
  question_id: number | null
  expert_id: number | null
  answer: string
}

// Format date from API (e.g., "01-2017" to "Jan 2017")
const formatDate = (dateString: string | null): string => {
  if (!dateString) return "Present"

  const [month, year] = dateString.split("-")
  if (!month || !year) return dateString

  try {
    const date = new Date(Number.parseInt(year), Number.parseInt(month) - 1)
    return date.toLocaleDateString("en-US", {
      month: "short",
      year: "numeric",
    })
  } catch (error) {
    return dateString
  }
}

// Fetch all data for a single expert
const fetchExpertData = async (expertId: number) => {
  try {
    // Fetch expert details
    const expertResponse = await API.get(`/experts/${expertId}/`)
    const expert: Expert = expertResponse.data

    // Fetch expert experiences
    const experiencesResponse = await API.get(`/expert_experiences/?expert_id=${expertId}`)
    const experiences: Experience[] = experiencesResponse.data.filter((exp: Experience) => exp.expert_id === expertId)

    // Fetch projects
    const pipelineResponse = await API.get(`/project_pipeline/?expert_id=${expertId}`)
    const publishedResponse = await API.get(`/project_published/?expert_id=${expertId}`)

    const pipelineAssignments = pipelineResponse.data.filter((item: any) => item.expert_id === expertId)

    const publishedAssignments = publishedResponse.data.filter((item: any) => item.expert_id === expertId)

    const projectIds = [
      ...pipelineAssignments.map((item: any) => item.project_id),
      ...publishedAssignments.map((item: any) => item.project_id),
    ]

    const uniqueProjectIds = [...new Set(projectIds)]

    let projects: Project[] = []
    if (uniqueProjectIds.length > 0) {
      projects = await Promise.all(
        uniqueProjectIds.map(async (projectId) => {
          try {
            const projectResponse = await API.get(`/projects/${projectId}/`)
            return projectResponse.data
          } catch (error) {
            console.error(`Error fetching project ${projectId}:`, error)
            return null
          }
        }),
      )
      projects = projects.filter(Boolean)
    }

    // Fetch screening questions
    const screeningResponse = await API.get(`/screening_question/?expert_id=${expertId}`)
    const screeningQuestions: ScreeningQuestion[] = screeningResponse.data

    return {
      expert,
      experiences,
      projects,
      screeningQuestions,
    }
  } catch (error) {
    console.error("Error fetching expert data:", error)
    throw error
  }
}

// Replace the drawIcon function with a simpler version that just returns the label
const drawIcon = (doc: jsPDF, iconType: string, x: number, y: number) => {
  doc.setFontSize(9)
  doc.setFont("helvetica", "bold")

  // Use text labels instead of icons
  const labels: Record<string, string> = {
    industry: "Industry:",
    location: "Location:",
    email: "Email:",
    phone: "Phone:",
    linkedin: "LinkedIn:",
    cost: "Hourly Rate:",
  }

  // Add label to the PDF
  doc.text(labels[iconType], x, y)
}

// Format date range for career history
const formatDateRange = (startDate: string, endDate: string | null): string => {
  const formatShortDate = (date: string): string => {
    const [month, year] = date.split("-")
    if (!month || !year) return date

    try {
      const date = new Date(Number.parseInt(year), Number.parseInt(month) - 1)
      return date.toLocaleDateString("en-US", {
        month: "short",
        year: "numeric",
      })
    } catch (error) {
      return date
    }
  }

  const start = formatShortDate(startDate)
  const end = endDate ? formatShortDate(endDate) : "Present"
  return `${start} - ${end}`
}

// Generate PDF for multiple experts
export const generateExpertsPDF = async (expertIds: number[]): Promise<Blob> => {
  // Create a new PDF document
  const doc = new jsPDF()

  // Set document properties
  doc.setProperties({
    title: "Konnect Expert Profiles",
    subject: "Expert Details",
    author: "Konnect",
    keywords: "experts, profiles, consulting",
    creator: "PDF Generator",
  })

  // For each expert ID
  for (let i = 0; i < expertIds.length; i++) {
    const expertId = expertIds[i]

    // Add a new page for each expert except the first one
    if (i > 0) {
      doc.addPage()
    }

    try {
      // Fetch expert data
      const { expert, experiences, projects, screeningQuestions } = await fetchExpertData(expertId)

      // Set elegant fonts and styling
      doc.setFont("helvetica", "bold")
      doc.setFontSize(20)

      // Add company logo/header
      doc.setFillColor(240, 240, 240)
      doc.rect(0, 0, 210, 25, "F")
      doc.setTextColor(50, 50, 50)
      doc.text("KONNECT EXPERT", 105, 15, { align: "center" })

      // Expert name and title
      doc.setFontSize(16)
      doc.text(expert.full_name, 20, 40)

      // Current position if available
      if (experiences && experiences.length > 0) {
        // Sort experiences to get the current one
        const sortedExperiences = [...experiences].sort((a, b) => {
          if (!a.end_date) return -1
          if (!b.end_date) return 1
          return new Date(b.end_date).getTime() - new Date(a.end_date).getTime()
        })

        const currentPosition = sortedExperiences[0]
        doc.setFont("helvetica", "normal")
        doc.setFontSize(12)
        doc.text(`${currentPosition.title} at ${currentPosition.company_name}`, 20, 48)
      }

      // Basic info section - with icons, no heading
      doc.setDrawColor(220, 220, 220)
      doc.setLineWidth(0.5)
      doc.line(20, 55, 190, 55)

      // Basic information with icons
      doc.setFont("helvetica", "normal")
      doc.setFontSize(9)

      // Left column
      const leftColumnX = 20
      const iconOffset = 25 // Increased offset for text labels

      // Industry
      drawIcon(doc, "industry", leftColumnX, 65)
      doc.setFont("helvetica", "normal")
      doc.text(expert.industry, leftColumnX + iconOffset, 65)

      // Location
      drawIcon(doc, "location", leftColumnX, 73)
      doc.setFont("helvetica", "normal")
      doc.text(expert.country_of_residence, leftColumnX + iconOffset, 73)

      // Email
      drawIcon(doc, "email", leftColumnX, 81)
      doc.setFont("helvetica", "normal")
      doc.text(expert.email, leftColumnX + iconOffset, 81)

      // Right column
      const rightColumnX = 110
      const rightIconOffset = 25 // Increased offset for text labels

      // Phone
      drawIcon(doc, "phone", rightColumnX, 65)
      doc.setFont("helvetica", "normal")
      doc.text(expert.phone_number || "Not provided", rightColumnX + rightIconOffset, 65)

      // LinkedIn
      drawIcon(doc, "linkedin", rightColumnX, 73)
      doc.setFont("helvetica", "normal")
      const linkedInText = expert.linkedIn_profile_link || "Not provided"
      // Handle long LinkedIn URLs by truncating if necessary
      doc.text(
        linkedInText.length > 30 ? linkedInText.substring(0, 27) + "..." : linkedInText,
        rightColumnX + rightIconOffset,
        73,
      )

      // Hourly Rate
      drawIcon(doc, "cost", rightColumnX, 81)
      doc.setFont("helvetica", "normal")
      doc.text(`$${expert.expert_cost}/hr`, rightColumnX + rightIconOffset, 81)

      // Career History section with new layout
      doc.setFont("helvetica", "bold")
      doc.setFontSize(11)
      doc.text("CAREER HISTORY", 20, 95)

      let currentY = 105 // Starting Y position for career history entries

      if (experiences && experiences.length > 0) {
        // Sort experiences by date
        const sortedExperiences = [...experiences].sort((a, b) => {
          const aEnd = a.end_date || "9999-12"
          const bEnd = b.end_date || "9999-12"
          return bEnd.localeCompare(aEnd)
        })

        sortedExperiences.forEach((exp) => {
          // Check if we need to add a new page
          if (currentY > 250) {
            doc.addPage()
            currentY = 20 // Reset Y position on new page
          }

          // Date range (left column)
          doc.setFont("helvetica", "normal")
          doc.setFontSize(9)
          const dateRange = formatDateRange(exp.start_date, exp.end_date)
          doc.text(dateRange, 20, currentY)

          // Separator
          doc.text("|", 85, currentY)

          // Position and company (right column)
          const position = `${exp.title} at ${exp.company_name}`

          // Handle long text wrapping
          const maxWidth = 95 // Width available for position text
          const splitPosition = doc.splitTextToSize(position, maxWidth)

          doc.text(splitPosition, 90, currentY)

          // Adjust vertical position based on whether text wrapped
          currentY += splitPosition.length > 1 ? splitPosition.length * 5 + 3 : 8
        })
      } else {
        doc.setFont("helvetica", "italic")
        doc.setFontSize(10)
        doc.text("No career history available", 20, currentY)
        currentY += 15
      }

      // Add some padding between sections
      currentY += 5

      // Projects section
      doc.setFont("helvetica", "bold")
      doc.setFontSize(11)
      doc.text("PROJECTS", 20, currentY)
      currentY += 10

      if (projects && projects.length > 0) {
        projects.forEach((project) => {
          // Check if we need to add a new page
          if (currentY > 250) {
            doc.addPage()
            currentY = 20 // Reset Y position on new page
          }

          // Project name (left side)
          doc.setFont("helvetica", "normal") // Ensure normal font weight for project name
          doc.setFontSize(10)
          doc.text(project.project_name, 20, currentY)

          // Status without border (right side)
          const status = project.status ? "Closed" : "Active"

          // Add status text without border
          doc.setFont("helvetica", "normal")
          doc.setFontSize(8)
          // Set green color for "Active" status
          if (!project.status) {
            doc.setTextColor(0, 128, 0) // Green color for Active
          } else {
            doc.setTextColor(0, 0, 0) // Black color for Closed
          }
          doc.text(status, 170, currentY, { align: "right" })
          // Reset text color back to default
          doc.setTextColor(0, 0, 0)

          currentY += 8
        })
      } else {
        doc.setFont("helvetica", "italic")
        doc.setFontSize(10)
        doc.text("No projects available", 20, currentY)
        currentY += 15
      }

      // Update the starting position for the next section (Screening Questions)
      let questionsYPosition = currentY + 10

      // Screening Questions section
      doc.setFont("helvetica", "bold")
      doc.setFontSize(11)
      doc.text("SCREENING QUESTIONS", 20, questionsYPosition)

      if (screeningQuestions && screeningQuestions.length > 0) {
        questionsYPosition += 10

        screeningQuestions.forEach((question, index) => {
          // Check if we need to add a new page
          if (questionsYPosition > 250) {
            doc.addPage()
            questionsYPosition = 20 // Reset Y position on new page
          }

          doc.setFont("helvetica", "bold")
          doc.setFontSize(10)
          doc.text(`Question ${index + 1}:`, 20, questionsYPosition)

          doc.setFont("helvetica", "normal")
          // Handle multi-line answers with text wrapping
          const splitAnswer = doc.splitTextToSize(question.answer || "No answer provided", 160)
          doc.text(splitAnswer, 20, questionsYPosition + 6)

          questionsYPosition += 10 + splitAnswer.length * 5
        })
      } else {
        doc.setFont("helvetica", "italic")
        doc.setFontSize(10)
        doc.text("No screening questions available", 20, questionsYPosition + 10)
      }

      // Footer
      doc.setFont("helvetica", "italic")
      doc.setFontSize(8)
      doc.text(`Generated on ${new Date().toLocaleDateString()}`, 105, 285, { align: "center" })
      doc.text(`Page ${i + 1} of ${expertIds.length}`, 105, 290, { align: "center" })
    } catch (error) {
      console.error(`Error generating PDF for expert ${expertId}:`, error)
      // Add error message to the page
      doc.setFont("helvetica", "bold")
      doc.setFontSize(12)
      doc.setTextColor(255, 0, 0)
      doc.text(`Error loading data for expert ID: ${expertId}`, 105, 150, { align: "center" })
    }
  }

  // Return the PDF as a blob
  return new Blob([doc.output("arraybuffer")], { type: "application/pdf" })
}