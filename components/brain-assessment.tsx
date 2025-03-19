'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Label } from '@/components/ui/label'

interface Question {
  id: number
  text: string
  category: 'cognitive' | 'emotional' | 'physical'
  options: {
    value: number
    label: string
  }[]
}

const questions: Question[] = [
  {
    id: 1,
    text: "How well can you focus on tasks for extended periods?",
    category: "cognitive",
    options: [
      { value: 1, label: "Very Poor" },
      { value: 2, label: "Poor" },
      { value: 3, label: "Average" },
      { value: 4, label: "Good" },
      { value: 5, label: "Excellent" }
    ]
  },
  {
    id: 2,
    text: "How would you rate your memory?",
    category: "cognitive",
    options: [
      { value: 1, label: "Very Poor" },
      { value: 2, label: "Poor" },
      { value: 3, label: "Average" },
      { value: 4, label: "Good" },
      { value: 5, label: "Excellent" }
    ]
  },
  {
    id: 3,
    text: "How well do you manage stress?",
    category: "emotional",
    options: [
      { value: 1, label: "Very Poor" },
      { value: 2, label: "Poor" },
      { value: 3, label: "Average" },
      { value: 4, label: "Good" },
      { value: 5, label: "Excellent" }
    ]
  },
  {
    id: 4,
    text: "How would you rate your emotional stability?",
    category: "emotional",
    options: [
      { value: 1, label: "Very Poor" },
      { value: 2, label: "Poor" },
      { value: 3, label: "Average" },
      { value: 4, label: "Good" },
      { value: 5, label: "Excellent" }
    ]
  },
  {
    id: 5,
    text: "How would you rate your physical energy levels?",
    category: "physical",
    options: [
      { value: 1, label: "Very Poor" },
      { value: 2, label: "Poor" },
      { value: 3, label: "Average" },
      { value: 4, label: "Good" },
      { value: 5, label: "Excellent" }
    ]
  },
  {
    id: 6,
    text: "How well do you sleep?",
    category: "physical",
    options: [
      { value: 1, label: "Very Poor" },
      { value: 2, label: "Poor" },
      { value: 3, label: "Average" },
      { value: 4, label: "Good" },
      { value: 5, label: "Excellent" }
    ]
  }
]

interface BrainAssessmentProps {
  onComplete: (results: {
    cognitiveScore: number
    emotionalScore: number
    physicalScore: number
  }) => void
}

export function BrainAssessment({ onComplete }: BrainAssessmentProps) {
  const [currentQuestion, setCurrentQuestion] = useState(0)
  const [answers, setAnswers] = useState<Record<number, number>>({})
  const [isComplete, setIsComplete] = useState(false)

  const handleAnswer = (value: string) => {
    const newAnswers = {
      ...answers,
      [questions[currentQuestion].id]: parseInt(value)
    }
    setAnswers(newAnswers)

    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1)
    } else {
      calculateResults(newAnswers)
    }
  }

  const calculateResults = (answers: Record<number, number>) => {
    const cognitiveQuestions = questions.filter(q => q.category === 'cognitive')
    const emotionalQuestions = questions.filter(q => q.category === 'emotional')
    const physicalQuestions = questions.filter(q => q.category === 'physical')

    const cognitiveScore = Math.round(
      (cognitiveQuestions.reduce((sum, q) => sum + (answers[q.id] || 0), 0) / 
      (cognitiveQuestions.length * 5)) * 100
    )

    const emotionalScore = Math.round(
      (emotionalQuestions.reduce((sum, q) => sum + (answers[q.id] || 0), 0) / 
      (emotionalQuestions.length * 5)) * 100
    )

    const physicalScore = Math.round(
      (physicalQuestions.reduce((sum, q) => sum + (answers[q.id] || 0), 0) / 
      (physicalQuestions.length * 5)) * 100
    )

    setIsComplete(true)
    onComplete({ cognitiveScore, emotionalScore, physicalScore })
  }

  if (isComplete) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Assessment Complete!</CardTitle>
        </CardHeader>
        <CardContent>
          <p>Thank you for completing the brain assessment. You can now proceed to upload educational content for personalized learning.</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Brain Assessment</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          <div className="space-y-2">
            <h3 className="text-lg font-medium">
              Question {currentQuestion + 1} of {questions.length}
            </h3>
            <p className="text-gray-600">{questions[currentQuestion].text}</p>
          </div>
          
          <RadioGroup
            onValueChange={handleAnswer}
            defaultValue={answers[questions[currentQuestion].id]?.toString()}
          >
            {questions[currentQuestion].options.map((option) => (
              <div key={option.value} className="flex items-center space-x-2">
                <RadioGroupItem value={option.value.toString()} id={`option-${option.value}`} />
                <Label htmlFor={`option-${option.value}`}>{option.label}</Label>
              </div>
            ))}
          </RadioGroup>
        </div>
      </CardContent>
    </Card>
  )
} 