'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

interface EducationalContentAnalysisProps {
  analysis: {
    summary: string
    keyPoints: string[]
    personalizedExplanation: string
    learningRecommendations: string[]
    difficultyLevel: 'beginner' | 'intermediate' | 'advanced'
  }
}

export function EducationalContentAnalysis({ analysis }: EducationalContentAnalysisProps) {
  if (!analysis) {
    return (
      <div className="text-center text-gray-600">
        No analysis available
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Content Summary</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-gray-600">{analysis.summary}</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Key Points</CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="space-y-2">
            {analysis.keyPoints.map((point, index) => (
              <li key={index} className="flex items-start">
                <span className="text-primary mr-2">•</span>
                {point}
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Personalized Explanation</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-gray-600">{analysis.personalizedExplanation}</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Learning Recommendations</CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="space-y-2">
            {analysis.learningRecommendations.map((recommendation, index) => (
              <li key={index} className="flex items-start">
                <span className="text-primary mr-2">•</span>
                {recommendation}
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Difficulty Level</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center space-x-2">
            <span className={`px-3 py-1 rounded-full text-sm font-medium ${
              analysis.difficultyLevel === 'beginner' ? 'bg-green-100 text-green-800' :
              analysis.difficultyLevel === 'intermediate' ? 'bg-yellow-100 text-yellow-800' :
              'bg-red-100 text-red-800'
            }`}>
              {analysis.difficultyLevel.charAt(0).toUpperCase() + analysis.difficultyLevel.slice(1)}
            </span>
          </div>
        </CardContent>
      </Card>
    </div>
  )
} 