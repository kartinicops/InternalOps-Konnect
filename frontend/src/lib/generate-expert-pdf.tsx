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

interface ExpertAvailability {
  expert_availability_id: number
  project_publish_id: number
  available_time: string
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

// Get shortened month and year from a date string (Apr 20)
const getShortDateFormat = (dateString: string | null): string => {
  if (!dateString) return "Present"

  const formattedDate = formatDate(dateString)
  const parts = formattedDate.split(" ")
  if (parts.length === 2) {
    return `${parts[0]} ${parts[1].substring(0, 2)}`
  }
  return formattedDate
}

// Custom text rendering with perfect justification
const renderJustifiedText = (
  doc: jsPDF,
  text: string,
  x: number,
  y: number,
  maxWidth: number,
  lineHeight: number,
): number => {
  // Split text into paragraphs
  const paragraphs = text.split("\n")
  let currentY = y

  paragraphs.forEach((paragraph) => {
    if (!paragraph.trim()) {
      currentY += lineHeight
      return
    }

    // Get lines that would be created by splitting this paragraph
    const lines = doc.splitTextToSize(paragraph, maxWidth)

    // Process each line for justification
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i]
      const isLastLine = i === lines.length - 1

      if (isLastLine) {
        // Last line of paragraph is left-aligned
        doc.text(line, x, currentY)
      } else {
        // Justify all lines except the last one in the paragraph
        // Calculate the number of spaces and words
        const words = line.split(" ")
        const numWords = words.length
        const numSpaces = numWords - 1

        if (numSpaces > 0) {
          // Calculate width of line without spaces
          const textWidth = doc.getTextWidth(words.join(""))
          // Calculate extra space to distribute
          const extraSpace = maxWidth - textWidth
          // Calculate space width between words
          const spaceWidth = extraSpace / numSpaces

          let currentX = x
          // Draw each word with calculated spacing
          for (let j = 0; j < numWords; j++) {
            doc.text(words[j], currentX, currentY)
            if (j < numWords - 1) {
              currentX += doc.getTextWidth(words[j]) + spaceWidth
            }
          }
        } else {
          // Single word line, left-aligned
          doc.text(line, x, currentY)
        }
      }

      currentY += lineHeight
    }
  })

  return currentY
}

// Function to add text with yellow background and underline
const addHighlightedText = (
  doc: jsPDF,
  text: string,
  x: number,
  y: number,
  backgroundColor: [number, number, number] = [255, 250, 205], // Default pale yellow
  underline = true,
) => {
  const textWidth = doc.getTextWidth(text)
//   const padding = 2

  // Draw background rectangle
  doc.setFillColor(backgroundColor[0], backgroundColor[1], backgroundColor[2])
  doc.rect(x, y - 3, textWidth, 4, "F")

  // Add underline if requested
  if (underline) {
    doc.setDrawColor(0, 0, 0)
    doc.line(x, y + 1, x + textWidth, y + 1)
  }

  // Add the text
  doc.text(text, x, y)
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

    // Fetch expert availabilities if projectId is provided
    let expertAvailabilities: ExpertAvailability[] = []
    if (projectId) {
      try {
        // First, get the project_publish_id for this expert and project
        const publishedResponse = await API.get(`/project_published/?expert_id=${expertId}&project_id=${projectId}`)
        const publishedData = publishedResponse.data
        
        if (publishedData && publishedData.length > 0) {
          const projectPublishId = publishedData[0].project_publish_id
          
          // Then fetch availabilities using the project_publish_id
          const availabilityResponse = await API.get(`/expert_availabilities/?project_publish_id=${projectPublishId}`)
          expertAvailabilities = availabilityResponse.data || []
        }
      } catch (error) {
        console.error("Error fetching expert availabilities:", error)
        expertAvailabilities = []
      }
    }

    return {
      expert,
      experiences,
      screeningQuestions,
      expertAvailabilities,
    }
  } catch (error) {
    console.error("Error fetching expert data:", error)
    throw error
  }
}

// Load Montserrat font into the PDF document
const loadMontserratFont = async (doc: jsPDF): Promise<void> => {
  try {
    // Load Montserrat font files
    const fontPaths = {
      normal: "/fonts/Montserrat-Regular.ttf",
      bold: "/fonts/Montserrat-Bold.ttf",
      italic: "/fonts/Montserrat-Italic.ttf",
      bolditalic: "/fonts/Montserrat-BoldItalic.ttf"
    }

    // Function to fetch font file
    const loadFont = async (url: string): Promise<ArrayBuffer> => {
      const response = await fetch(url)
      if (!response.ok) {
        throw new Error(`Failed to load font from ${url}: ${response.statusText}`)
      }
      return await response.arrayBuffer()
    }

    // Convert ArrayBuffer to base64
    const arrayBufferToBase64 = (buffer: ArrayBuffer): string => {
      let binary = ""
      const bytes = new Uint8Array(buffer)
      const len = bytes.byteLength
      for (let i = 0; i < len; i++) {
        binary += String.fromCharCode(bytes[i])
      }
      return btoa(binary)
    }

    // Load Montserrat Regular
    const normalFont = await loadFont(fontPaths.normal)
    doc.addFileToVFS("Montserrat-Regular.ttf", arrayBufferToBase64(normalFont))
    doc.addFont("Montserrat-Regular.ttf", "Montserrat", "normal")

    // Load Montserrat Bold
    const boldFont = await loadFont(fontPaths.bold)
    doc.addFileToVFS("Montserrat-Bold.ttf", arrayBufferToBase64(boldFont))
    doc.addFont("Montserrat-Bold.ttf", "Montserrat", "bold")

    // Load Montserrat Italic
    try {
      const italicFont = await loadFont(fontPaths.italic)
      doc.addFileToVFS("Montserrat-Italic.ttf", arrayBufferToBase64(italicFont))
      doc.addFont("Montserrat-Italic.ttf", "Montserrat", "italic")
    } catch (error) {
      console.warn("Could not load Montserrat Italic font:", error)
    }
    try {
        const boldItalicFont = await loadFont(fontPaths.bolditalic)
        doc.addFileToVFS("Montserrat-BoldItalic.ttf", arrayBufferToBase64(boldItalicFont))
        doc.addFont("Montserrat-BoldItalic.ttf", "Montserrat", "bolditalic")
      } catch (error) {
        console.warn("Could not load Montserrat Bold Italic font:", error)
      }

    // Set Montserrat as the default font
    doc.setFont("Montserrat")

    return Promise.resolve()
  } catch (error) {
    console.error("Error loading Montserrat font:", error)
    return Promise.reject(error)
  }
}

// Generate PDF for multiple experts
const generateExpertsPDF = async (expertIds: number[], projectId: number | null = null): Promise<Blob> => {
  // Create a new PDF document (A4 size)
  const doc = new jsPDF()

  // Try to load Montserrat font
  try {
    await loadMontserratFont(doc)
  } catch (error) {
    console.warn("Could not load Montserrat font, using default font instead:", error)
  }

  // Set document properties
  doc.setProperties({
    title: "Konnect Expert Profiles",
    subject: "Expert Details",
    author: "Konnect",
    keywords: "experts, profiles, consulting",
    creator: "PDF Generator",
  })

  // Define page margins and content width
  const leftMargin = 25 // Increased left margin for better indentation
  const rightMargin = 25 // Right margin same as left for consistency
  const contentWidth = 210 - leftMargin - rightMargin // A4 width (210mm) minus margins
  const lineHeight = 6 // Line height for text

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
      // Fetch expert data with the projectId to get project-specific screening questions and availabilities
      const { expert, experiences, screeningQuestions, expertAvailabilities } = await fetchExpertData(expertId, projectId)

      // ================ HEADER SECTION ================
      // Set the green background (full width) - Changed from original (33, 96, 1) to a moderate green
      doc.setFillColor(45, 115, 25) // Moderately dark green color - less light than before
      doc.rect(0, 0, 210, 24, "F")

      // Add "Not for distribution outside your firm" text in header (centered as shown in image)
      try {
        doc.setFont("Montserrat", "bold")
      } catch (error) {
        doc.setFont("helvetica", "bold")
      }
      doc.setTextColor(255, 255, 255) // White text
      doc.setFontSize(12)

      // Align text with the right margin
      doc.text("Not for distribution", 210 - rightMargin, 10, { align: "right" })
      doc.text("outside your firm", 210 - rightMargin, 16, { align: "right" })

      // Add Konnect logo in left side of header
      try {
        // In a real implementation, you'd load the logo from your assets
        const logo = new Image()
        logo.src = "/konnect-logo.jpeg"

        // Add logo to PDF with white border as shown in your example
        doc.addImage(logo, "JPEG", leftMargin, 5, 45, 15)
      } catch (error) {
        console.error("Error adding logo to PDF:", error)
        // Fallback text if logo fails to load
        doc.setTextColor(255, 255, 255)
        doc.text("KONNECT", leftMargin, 15)
      }

      // ================ PROFILE TITLE SECTION ================
      // Get expert's latest job title from experiences
      let latestTitle = "Expert"
      let latestCompany = ""
      let latestStartDate = ""
      let latestEndDate = ""

      if (experiences && experiences.length > 0) {
        // Sort experiences by end date (null/Present should be first)
        const sortedExperiences = [...experiences].sort((a, b) => {
          if (!a.end_date) return -1
          if (!b.end_date) return 1
          return b.end_date.localeCompare(a.end_date)
        })

        // Use the most recent job title
        latestTitle = sortedExperiences[0].title
        latestCompany = sortedExperiences[0].company_name
        latestStartDate = sortedExperiences[0].start_date
        latestEndDate = sortedExperiences[0].end_date
      }

      // Reset text color for main content
      doc.setTextColor(0, 0, 0)

      // Profile title with exact formatting as shown in Image 1
      try {
        doc.setFont("Montserrat", "bold")
      } catch (error) {
        doc.setFont("helvetica", "bold")
      }

      // Profile section moved higher up (Y position reduced from 40 to 34)
      // Title: "Profile X: [Title] at [Company]" - With exact formatting from Image 1
      doc.setFontSize(10)
      const profileTitle = `Profile ${i + 1}: ${latestTitle} at ${latestCompany}`

      // Add highlighted text with yellow background and underline
      addHighlightedText(doc, profileTitle, leftMargin, 34, [255, 249, 196], true)

      // Date range: "(Apr 20 – Jul 22)" - With exact formatting from Image 1
      const startShort = getShortDateFormat(latestStartDate)
      const endShort = latestEndDate ? getShortDateFormat(latestEndDate) : "Present"
      const dateRange = `(${startShort} – ${endShort})`

      // Add highlighted text with yellow background and underline (Y position reduced from 45 to 39)
      addHighlightedText(doc, dateRange, leftMargin, 39, [255, 249, 196], true)
      // Credits: "[2 Credits]" - With exact formatting from Image 1 (Y position reduced from 50 to 44)
      try {
        doc.setFont("Montserrat", "bolditalic")
      } catch (error) {
        doc.setFont("helvetica", "bolditalic")
      }

      // Add highlighted text with gray background, no underline
      addHighlightedText(doc, "[2 Credits]", leftMargin, 44, [220, 220, 220], false)
      // Reset font to normal
      try {
        doc.setFont("Montserrat", "normal")
      } catch (error) {
        doc.setFont("helvetica", "normal")
      }

      // ================ EXPERT BIO SECTION ================
      // Expert bio with perfect justification
      try {
        doc.setFont("Montserrat", "normal")
      } catch (error) {
        doc.setFont("helvetica", "normal")
      }
      doc.setFontSize(10)

      const expertNotes = expert.notes || "The expert has over 15 years of experience in the insurance industry, with a strong focus on sales and marketing. She previously worked as an Associate Director at Fuse Group, an innovative insurtech platform that connects a wide range of insurance products from multiple providers with diverse distribution channels. She was in charge of deveective sales and expanding distribution networks.\n\nShe confirmed that she is well-equipped to cover the listed topic. She would be happy to provide insights into the landscape of sales channels within the insurance industry. Please see below her screening responses:"

      // Use custom justified text renderer with slightly reduced paragraph spacing
      let currentY = 55
      currentY = renderJustifiedText(doc, expertNotes, leftMargin, currentY, contentWidth, lineHeight - 0.75) // Slightly reduced line height for paragraph spacing

      // Add spacing after bio section
        currentY += 6

      // ================ SCREENING QUESTIONS SECTION ================
      if (screeningQuestions && screeningQuestions.length > 0) {
        // Introduction text - only if there are screening questions
        try {
          doc.setFont("Montserrat", "normal")
        } catch (error) {
          doc.setFont("helvetica", "normal")
        }
        doc.setFontSize(10)

        // Process each screening question
// In the screening questions section, replace this part:
screeningQuestions.forEach((question, index) => {
  // Check if we need to add a new page
  if (currentY > 260) {
    // Leaving room for footer
    doc.addPage()
    currentY = 20 // Reset Y position on new page
  }

  // Question title - Format: "#1 - a) Question text"
  try {
    doc.setFont("Montserrat", "bold")
  } catch (error) {
    doc.setFont("helvetica", "bold")
  }
  doc.setFontSize(10)
  doc.setTextColor(0, 0, 0) // Black for question

  const questionNumber = `#${index + 1} - ${question.question}`
  doc.text(questionNumber, leftMargin, currentY)
  currentY += 4 // Reduced from 6 to 4 for tighter spacing

  // Answer with RED text - exactly like in the PDF
  try {
    doc.setFont("Montserrat", "normal")
  } catch (error) {
    doc.setFont("helvetica", "normal")
  }
  doc.setTextColor(255, 0, 0) // Red color for answers

  // Use custom justified text for answers (in red)
  currentY = renderJustifiedText(doc, question.answer, leftMargin, currentY, contentWidth, lineHeight - 1) // Reduced line height
  currentY += 2 // Reduced from 4 to 2 for tighter spacing after each answer
})
      }

      // ================ EMPLOYMENT HISTORY SECTION ================
      // Reset text color to black
      doc.setTextColor(0, 0, 0)
        currentY += 4

      try {
        doc.setFont("Montserrat", "bold")
      } catch (error) {
        doc.setFont("helvetica", "bold")
      }
      doc.setFontSize(10)
      doc.text("Employment History", leftMargin, currentY)
      currentY += 6.5

      if (experiences && experiences.length > 0) {
        // Sort experiences by date (most recent first)
        const sortedExperiences = [...experiences].sort((a, b) => {
          const aEnd = a.end_date || "9999-12"
          const bEnd = b.end_date || "9999-12"
          return bEnd.localeCompare(aEnd)
        })

        try {
          doc.setFont("Montserrat", "normal")
        } catch (error) {
          doc.setFont("helvetica", "normal")
        }
        doc.setFontSize(10)

        sortedExperiences.forEach((exp) => {
          if (currentY > 260) {
            doc.addPage()
            currentY = 6.5
          }

          // Format as in PDF: "MMM YY - Present | Title at Company"
          const dateRange = formatDate(exp.start_date) + " - " + (exp.end_date ? formatDate(exp.end_date) : "Present")
          const position = `${dateRange} | ${exp.title} at ${exp.company_name}`
          doc.text(position, leftMargin, currentY)
          currentY += 6.5
        })
      }

      // ================ AVAILABILITY SECTION ================
      if (projectId && expertAvailabilities && expertAvailabilities.length > 0) {
        currentY += 4
        try {
          doc.setFont("Montserrat", "bold")
        } catch (error) {
          doc.setFont("helvetica", "bold")
        }
        doc.setFontSize(10)
        doc.text("Availabilities", leftMargin, currentY)
        currentY += 6.5

        try {
          doc.setFont("Montserrat", "normal")
        } catch (error) {
          doc.setFont("helvetica", "normal")
        }
        doc.setFontSize(10)
        
        // Display availabilities from API
        if (expertAvailabilities.length === 1) {
          // If only one availability, don't use bullet points
          doc.text(expertAvailabilities[0].available_time, leftMargin, currentY)
        } else {
          // If more than one availability, use bullet points
          const bulletPoint = "• "
          const bulletIndent = 3  // Indentation for bullet points
          
          expertAvailabilities.forEach((availability, index) => {
            if (currentY > 260) {
              doc.addPage()
              currentY = 20
            }
            
            doc.text(bulletPoint, leftMargin, currentY)
            doc.text(availability.available_time, leftMargin + bulletIndent, currentY)
            currentY += 6
          })
        }
      }
    } catch (error) {
      console.error(`Error generating PDF for expert ${expertId}:`, error)
      // Add error message to the page
      try {
        doc.setFont("Montserrat", "bold")
      } catch (error) {
        doc.setFont("helvetica", "bold")
      }
      doc.setFontSize(10)
      doc.setTextColor(255, 0, 0)
      doc.text(`Error loading data for expert ID: ${expertId}`, 105, 150, { align: "center" })
    }
  }

  // Return the PDF as a blob
  return new Blob([doc.output("arraybuffer")], { type: "application/pdf" })
}

// Export the generator function directly (not a React component)
const ExpertProfileGenerator = async (expertIds: number[], projectId: number | null = null): Promise<Blob> => {
  // Validate input
  if (!expertIds || !Array.isArray(expertIds) || expertIds.length === 0) {
    throw new Error("Invalid expert IDs provided. Must be a non-empty array.")
  }

  try {
    // Call the PDF generator function
    return await generateExpertsPDF(expertIds, projectId)
  } catch (error) {
    console.error("Error in ExpertProfileGenerator:", error)
    throw error
  }
}

export default ExpertProfileGenerator