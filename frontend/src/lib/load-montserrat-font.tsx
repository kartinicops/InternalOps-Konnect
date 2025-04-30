import { jsPDF } from "jspdf"

/**
 * Loads the Montserrat font family into a jsPDF document
 * @param doc The jsPDF document instance
 */
export const loadMontserratFont = async (doc: jsPDF): Promise<void> => {
  try {
    // Load the font files from the public directory
    const fontPaths = {
      normal: '/fonts/Montserrat-Regular.ttf',
      bold: '/fonts/Montserrat-Bold.ttf',
      italic: '/fonts/Montserrat-Italic.ttf',
      bolditalic: '/fonts/Montserrat-BoldItalic.ttf',
    }

    // Function to fetch and convert font to base64
    const loadFont = async (url: string): Promise<ArrayBuffer> => {
      const response = await fetch(url)
      if (!response.ok) {
        throw new Error(`Failed to load font from ${url}: ${response.statusText}`)
      }
      return await response.arrayBuffer()
    }

    // Load Montserrat Regular
    const normalFont = await loadFont(fontPaths.normal)
    doc.addFileToVFS('Montserrat-Regular.ttf', arrayBufferToBase64(normalFont))
    doc.addFont('Montserrat-Regular.ttf', 'Montserrat', 'normal')

    // Load Montserrat Bold 
    const boldFont = await loadFont(fontPaths.bold)
    doc.addFileToVFS('Montserrat-Bold.ttf', arrayBufferToBase64(boldFont))
    doc.addFont('Montserrat-Bold.ttf', 'Montserrat', 'bold')

    // Optionally load Montserrat Italic if needed
    try {
      const italicFont = await loadFont(fontPaths.italic)
      doc.addFileToVFS('Montserrat-Italic.ttf', arrayBufferToBase64(italicFont))
      doc.addFont('Montserrat-Italic.ttf', 'Montserrat', 'italic')
    } catch (error) {
      console.warn('Could not load Montserrat Italic font, will fall back to normal')
    }

    // Optionally load Montserrat Bold Italic if needed
    try {
      const boldItalicFont = await loadFont(fontPaths.bolditalic)
      doc.addFileToVFS('Montserrat-BoldItalic.ttf', arrayBufferToBase64(boldItalicFont))
      doc.addFont('Montserrat-BoldItalic.ttf', 'Montserrat', 'bolditalic')
    } catch (error) {
      console.warn('Could not load Montserrat Bold Italic font, will fall back to bold')
    }

    // Set Montserrat as the default font
    doc.setFont('Montserrat')
    
    return Promise.resolve()
  } catch (error) {
    console.error('Error loading Montserrat font:', error)
    return Promise.reject(error)
  }
}

/**
 * Converts an ArrayBuffer to a base64 string
 * @param buffer The ArrayBuffer to convert
 * @returns A base64 string
 */
function arrayBufferToBase64(buffer: ArrayBuffer): string {
  let binary = ''
  const bytes = new Uint8Array(buffer)
  const len = bytes.byteLength
  
  for (let i = 0; i < len; i++) {
    binary += String.fromCharCode(bytes[i])
  }
  
  return btoa(binary)
}