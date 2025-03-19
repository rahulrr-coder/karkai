import { GoogleGenerativeAI } from '@google/generative-ai'

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY!)

export interface AssessmentResult {
  cognitiveScore: number
  emotionalScore: number
  physicalScore: number
  recommendations: string[]
  generatedImage: string
}

export interface AssessmentError {
  message: string
  status?: number
}

export interface EducationalContentAnalysis {
  summary: string
  keyPoints: string[]
  personalizedExplanation: string
  learningRecommendations: string[]
  difficultyLevel: 'beginner' | 'intermediate' | 'advanced'
}

export async function processPDF(
  file: File,
  assessmentResults: {
    cognitiveScore: number
    emotionalScore: number
    physicalScore: number
  }
): Promise<EducationalContentAnalysis> {
  try {
    if (!file) {
      throw new Error('No file provided')
    }

    if (!file.type.includes('pdf')) {
      throw new Error('File must be a PDF')
    }

    const formData = new FormData()
    formData.append('file', file)
    formData.append('assessmentResults', JSON.stringify(assessmentResults))

    const response = await fetch('/api/process-pdf', {
      method: 'POST',
      body: formData,
    })

    const data = await response.json()

    if (!response.ok) {
      throw new Error(data.error || 'Error processing PDF')
    }

    return data
  } catch (error) {
    console.error('Error processing PDF:', error)
    throw error instanceof Error ? error : new Error('Unknown error occurred while processing PDF')
  }
}

async function extractTextFromPDF(arrayBuffer: ArrayBuffer): Promise<string> {
  // This is a placeholder. You'll need to implement actual PDF text extraction
  // You can use libraries like pdf-parse or pdfjs-dist
  return "Sample PDF content"
} 