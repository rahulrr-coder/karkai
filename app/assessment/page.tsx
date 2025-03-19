'use client'

import { useState } from 'react'
import { BrainAssessment } from '@/components/brain-assessment'
import { PDFUpload } from '@/components/pdf-upload'
import { EducationalContentAnalysis } from '@/components/educational-content-analysis'
import { processPDF } from '@/lib/pdf-service'
import { Button } from '@/components/ui/button'

interface Analysis {
  summary: string
  keyPoints: string[]
  personalizedExplanation: string
  learningRecommendations: string[]
  difficultyLevel: 'beginner' | 'intermediate' | 'advanced'
}

export default function AssessmentPage() {
  const [assessmentResults, setAssessmentResults] = useState<{
    cognitiveScore: number
    emotionalScore: number
    physicalScore: number
  } | null>(null)
  const [analysis, setAnalysis] = useState<Analysis | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [isProcessing, setIsProcessing] = useState(false)

  const handleAssessmentComplete = (results: {
    cognitiveScore: number
    emotionalScore: number
    physicalScore: number
  }) => {
    setAssessmentResults(results)
  }

  const handleUpload = async (file: File) => {
    if (!assessmentResults) {
      setError('Please complete the brain assessment first')
      return
    }

    try {
      setIsProcessing(true)
      setError(null)
      const results = await processPDF(file, assessmentResults)
      setAnalysis(results)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error processing PDF')
    } finally {
      setIsProcessing(false)
    }
  }

  const handleReset = () => {
    setAssessmentResults(null)
    setAnalysis(null)
    setError(null)
  }

  return (
    <div className="container mx-auto py-8 space-y-8">
      <h1 className="text-3xl font-bold text-center mb-8">Brain Assessment & Learning Analysis</h1>

      {!assessmentResults ? (
        <div className="max-w-2xl mx-auto">
          <BrainAssessment onComplete={handleAssessmentComplete} />
        </div>
      ) : !analysis ? (
        <div className="max-w-2xl mx-auto space-y-6">
          <div className="bg-green-50 p-4 rounded-lg">
            <h2 className="text-lg font-semibold text-green-800 mb-2">Assessment Complete!</h2>
            <p className="text-green-700">
              Cognitive Score: {assessmentResults.cognitiveScore}%<br />
              Emotional Score: {assessmentResults.emotionalScore}%<br />
              Physical Score: {assessmentResults.physicalScore}%
            </p>
          </div>

          <PDFUpload onUpload={handleUpload} />
          
          {isProcessing && (
            <div className="text-center text-gray-600">
              Processing your educational content...
            </div>
          )}

          {error && (
            <div className="bg-red-50 p-4 rounded-lg">
              <p className="text-red-700">{error}</p>
            </div>
          )}
        </div>
      ) : (
        <div className="max-w-4xl mx-auto space-y-6">
          <EducationalContentAnalysis analysis={analysis} />
          
          <div className="flex justify-center">
            <Button onClick={handleReset} variant="outline">
              Start New Assessment
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}

