import { NextResponse } from 'next/server'
import { GoogleGenerativeAI } from '@google/generative-ai'

if (!process.env.GOOGLE_API_KEY) {
  throw new Error('GOOGLE_API_KEY is not set in environment variables')
}

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY)

export async function POST(request: Request) {
  try {
    const formData = await request.formData()
    const file = formData.get('file') as File
    const assessmentResults = JSON.parse(formData.get('assessmentResults') as string)

    if (!file) {
      return NextResponse.json(
        { error: 'No file provided' },
        { status: 400 }
      )
    }

    if (!file.type.includes('pdf')) {
      return NextResponse.json(
        { error: 'File must be a PDF' },
        { status: 400 }
      )
    }

    // Read PDF content
    const arrayBuffer = await file.arrayBuffer()
    const pdfContent = await extractTextFromPDF(arrayBuffer)

    if (!pdfContent) {
      return NextResponse.json(
        { error: 'Could not extract text from PDF' },
        { status: 400 }
      )
    }

    // Analyze content with Gemini
    const model = genAI.getGenerativeModel({ model: "gemini-pro" })
    
    const prompt = `Analyze this educational content and provide a personalized explanation based on the user's assessment results:
    
    User's Assessment Results:
    - Cognitive Score: ${assessmentResults.cognitiveScore}
    - Emotional Score: ${assessmentResults.emotionalScore}
    - Physical Score: ${assessmentResults.physicalScore}
    
    Educational Content:
    ${pdfContent}
    
    Please provide:
    1. A concise summary of the content
    2. Key points to focus on
    3. A personalized explanation that takes into account the user's assessment scores
    4. Specific learning recommendations based on the user's profile
    5. The appropriate difficulty level (beginner, intermediate, or advanced)
    
    Format the response as JSON with the following structure:
    {
      "summary": "string",
      "keyPoints": ["string"],
      "personalizedExplanation": "string",
      "learningRecommendations": ["string"],
      "difficultyLevel": "beginner" | "intermediate" | "advanced"
    }`

    const result = await model.generateContent(prompt)
    const response = await result.response
    const text = response.text()
    
    try {
      // Parse the response
      const analysis = JSON.parse(text)
      
      // Validate the response structure
      if (!analysis.summary || !analysis.keyPoints || !analysis.personalizedExplanation || 
          !analysis.learningRecommendations || !analysis.difficultyLevel) {
        throw new Error('Invalid analysis format')
      }

      return NextResponse.json(analysis)
    } catch (parseError) {
      console.error('Error parsing Gemini response:', parseError)
      return NextResponse.json(
        { error: 'Failed to analyze educational content' },
        { status: 500 }
      )
    }
  } catch (error) {
    console.error('Error processing PDF:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Error processing PDF' },
      { status: 500 }
    )
  }
}

async function extractTextFromPDF(arrayBuffer: ArrayBuffer): Promise<string> {
  try {
    // This is a placeholder. You'll need to implement actual PDF text extraction
    // You can use libraries like pdf-parse or pdfjs-dist
    return "Sample PDF content"
  } catch (error) {
    console.error('Error extracting text from PDF:', error)
    throw new Error('Failed to extract text from PDF')
  }
} 