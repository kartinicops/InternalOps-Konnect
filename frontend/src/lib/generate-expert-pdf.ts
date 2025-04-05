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
  notes?: string
  availability?: boolean
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
  project_id: number | null
  question: string
  answer: string
}

// Get expert initials from full name
const getInitials = (name: string): string => {
  return name
    .split(" ")
    .map((part) => part.charAt(0))
    .join("")
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
const fetchExpertData = async (expertId: number, projectId: number | null = null) => {
  try {
    // Fetch expert details
    const expertResponse = await API.get(`/experts/${expertId}/`)
    const expert: Expert = expertResponse.data

    // Fetch expert experiences
    const experiencesResponse = await API.get(`/expert_experiences/?expert_id=${expertId}`)
    const experiences: Experience[] = experiencesResponse.data.filter((exp: Experience) => exp.expert_id === expertId)

    // Fetch published assignments to check availability
    if (projectId) {
      const publishedResponse = await API.get(`/project_published/?expert_id=${expertId}`)
      const publishedAssignments = publishedResponse.data.filter((item: any) => item.expert_id === expertId)
      
      // Check availability for the specific project if projectId is provided
      const projectAvailability = publishedAssignments.find(
        (item: any) => item.project_id === projectId && item.expert_id === expertId,
      )
      expert.availability = projectAvailability ? projectAvailability.availability : false
    }

    // Fetch screening questions and answers
    let screeningQuestions: ScreeningQuestion[] = []

    // If projectId is provided, fetch screening questions for that specific project
    if (projectId) {
      // Fetch project-specific screening questions
      const projectScreeningResponse = await API.get(`/screening_question/?project_id=${projectId}`)
      const projectQuestions = projectScreeningResponse.data || []

      // Fetch expert's answers for this project
      const expertAnswersResponse = await API.get(`/screening_answer/?expert_id=${expertId}&project_id=${projectId}`)
      const expertAnswers = expertAnswersResponse.data || []

      // Combine questions with expert's answers
      screeningQuestions = projectQuestions.map((question: any) => {
        // Find the corresponding answer for this question
        const answer = expertAnswers.find((a: any) => a.question_id === question.question_id)

        return {
          question_id: question.question_id,
          expert_id: expertId,
          project_id: projectId,
          question: question.question,
          answer: answer ? answer.answer : "No answer provided",
        }
      })
    } else {
      // Fallback to general screening questions if no projectId is provided
      const screeningResponse = await API.get(`/screening_question/?expert_id=${expertId}`)
      screeningQuestions = screeningResponse.data
    }

    return {
      expert,
      experiences,
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
export const generateExpertsPDF = async (expertIds: number[], projectId: number | null = null): Promise<Blob> => {
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

  // Get project name if projectId is provided
  let projectName = ""
  if (projectId) {
    try {
      const projectResponse = await API.get(`/projects/${projectId}/`)
      projectName = projectResponse.data.project_name || "Project Details"
    } catch (error) {
      console.error(`Error fetching project ${projectId}:`, error)
      projectName = "Project Details"
    }
  }

  // For each expert ID
  for (let i = 0; i < expertIds.length; i++) {
    const expertId = expertIds[i]

    // Add a new page for each expert except the first one
    if (i > 0) {
      doc.addPage()
    }

    try {
      // Fetch expert data with the projectId to get project-specific screening questions
      const { expert, experiences, screeningQuestions } = await fetchExpertData(expertId, projectId)

      // Set elegant fonts and styling
      doc.setFont("helvetica", "bold")
      doc.setFontSize(20)

      // Add Konnect logo (without background) - positioned at right side
      try {
        // Load the logo from the public directory
        const logo = new Image()
        logo.src = "/konnect-logo.jpeg"

        // Add logo to PDF (right-aligned in the header)
        doc.addImage(logo, "PNG", 19, 5, 25, 25)
      } catch (error) {
        console.error("Error adding logo to PDF:", error)
        // Fallback text if logo fails to load
        doc.setTextColor(50, 50, 50)
        doc.text("KONNECT", 170, 15, { align: "center" })
      }

      // Get expert's latest job title from experiences instead of initials
      let latestTitle = "Expert"

      if (experiences && experiences.length > 0) {
        // Sort experiences by end date (null/Present should be first)
        const sortedExperiences = [...experiences].sort((a, b) => {
          if (!a.end_date) return -1
          if (!b.end_date) return 1
          return b.end_date.localeCompare(a.end_date)
        })

        // Use the most recent job title
        latestTitle = sortedExperiences[0].title
      }

      // Display latest title instead of initials - moved further up
      doc.setFontSize(16)
      doc.setFont("helvetica", "bold")
      doc.text(latestTitle, 20, 35)

      // About section - moved up
      doc.setFont("helvetica", "bold")
      doc.setFontSize(11)
      doc.text("Biography", 20, 45)

      // Display expert notes from API - moved up
      doc.setFont("helvetica", "normal")
      doc.setFontSize(9)

      // Get notes from expert data or use default text
      const expertNotes = expert.notes || "No additional information available about this expert."

      // Handle multi-line notes with text wrapping
      const splitNotes = doc.splitTextToSize(expertNotes, 170)
      doc.text(splitNotes, 20, 55)

      // Calculate the height of the notes section
      const notesHeight = splitNotes.length * 5

      // Calculate the position for the next section
      const separatorY = 60 + notesHeight

      // Career History section with adjusted position and formatting
      doc.setFont("helvetica", "bold")
      doc.setFontSize(11)

      // Calculate position based on the notes section
      const careerHistoryY = separatorY + 5
      doc.text("CAREER HISTORY", 20, careerHistoryY)

      let currentY = careerHistoryY + 10 // Starting Y position for career history entries

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

          // Title on left side

          // Title and company on the same line
          doc.setFont("helvetica", "normal")
          doc.setFontSize(10)
          doc.text(`${exp.title} at ${exp.company_name}`, 20, currentY)

          // Duration on right side
          doc.setFont("helvetica", "normal")
          doc.setFontSize(9)
          const dateRange = formatDateRange(exp.start_date, exp.end_date)
          doc.text(dateRange, 190, currentY, { align: "right" })

          // Company name below title

          // Adjust vertical position for next experience entry
          currentY += 10
        })
      } else {
        doc.setFont("helvetica", "italic")
        doc.setFontSize(10)
        doc.text("No career history available", 20, currentY)
        currentY += 15
      }

      // Add some padding between sections
      currentY += 5

      // Screening Questions section
      doc.setFont("helvetica", "bold")
      doc.setFontSize(11)
      doc.text("SCREENING QUESTIONS", 20, currentY)

      let questionsYPosition = currentY + 10

      if (screeningQuestions && screeningQuestions.length > 0) {
        screeningQuestions.forEach((question, index) => {
          // Check if we need to add a new page
          if (questionsYPosition > 250) {
            doc.addPage()
            questionsYPosition = 20 // Reset Y position on new page
          }

          // Display the question and answer in a single box
          const questionText = question.question || "No question available"
          const answerText = question.answer || "No answer provided"

          // Format the content with question and answer in the same box
          const boxContent = [`Question ${index + 1}: ${questionText}`, `Answer: ${answerText}`]

          // Split text to fit within box width
          const splitContent = doc.splitTextToSize(boxContent.join("\n\n"), 160)

          // Calculate box height based on content
          const boxHeight = splitContent.length * 5 + 10

          // Draw a single box for both question and answer
          doc.setDrawColor(200, 200, 200)
          doc.setFillColor(245, 245, 245)
          doc.roundedRect(20, questionsYPosition, 170, boxHeight, 2, 2, "FD")

          // Add the content inside the box
          doc.setFont("helvetica", "normal")
          doc.setFontSize(9)
          doc.text(splitContent, 25, questionsYPosition + 8)

          // Adjust vertical position for next question
          questionsYPosition += boxHeight + 10
        })
      } else {
        doc.setFont("helvetica", "italic")
        doc.setFontSize(10)
        doc.text("No screening questions available", 20, questionsYPosition + 10)
        questionsYPosition += 20
      }

      // Add availability status after screening questions
      if (projectId) {
        // Add some padding
        questionsYPosition += 10
        
        doc.setFont("helvetica", "bold")
        doc.setFontSize(11)
        doc.text("AVAILABILITY", 20, questionsYPosition)
        
        questionsYPosition += 10
        
        doc.setFontSize(10)
        if (expert.availability) {
          doc.setTextColor(0, 128, 0) // Green color for Available
          doc.text("Available", 20, questionsYPosition)
        } else {
          doc.setTextColor(220, 53, 69) // Red color for Unavailable
          doc.text("Unavailable", 20, questionsYPosition)
        }
        // Reset text color
        doc.setTextColor(0, 0, 0)
      }

      // Improved Footer with soft blue underline - less wide
      doc.setDrawColor(220, 235, 250) // Light blue
      doc.setLineWidth(0.5)
      doc.line(20, 280, 190, 280)

      doc.setFont("helvetica", "normal")
      doc.setFontSize(8)
      doc.setTextColor(100, 100, 100)
      doc.text("KONNECT Expert Profile", 20, 287)
      doc.text(`Page ${i + 1} of ${expertIds.length}`, 190, 287, { align: "right" })
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