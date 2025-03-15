"use client"

import { useState, useEffect } from "react"
import { FileText, BookOpen, Brain, ImageIcon, List, BarChart, Lightbulb } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"

interface PdfSummaryProps {
  pdfContent: string
  brainType: string
  summaryData: any
  isLoading: boolean
}

export default function PdfSummary({ pdfContent, brainType, summaryData, isLoading }: PdfSummaryProps) {
  const [activeTab, setActiveTab] = useState("visual")

  useEffect(() => {
    // Set the default tab based on brain type
    if (brainType) {
      setActiveTab(brainType)
    }
  }, [brainType])

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="flex items-center gap-2 mb-4">
          <FileText className="h-5 w-5 text-blue-600" />
          <h2 className="text-xl font-bold">Analyzing Document</h2>
        </div>

        <div className="space-y-4">
          <Skeleton className="h-8 w-full" />
          <Skeleton className="h-40 w-full" />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Skeleton className="h-64 w-full" />
            <Skeleton className="h-64 w-full" />
          </div>
          <Skeleton className="h-40 w-full" />
        </div>
      </div>
    )
  }

  if (!summaryData) return null

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2 mb-4">
        <FileText className="h-5 w-5 text-blue-600" />
        <h2 className="text-xl font-bold">Document Summary</h2>
      </div>

      <Card className="bg-blue-50 border-blue-200">
        <CardHeader className="pb-2">
          <CardTitle className="text-lg flex items-center gap-2">
            <Lightbulb className="h-5 w-5 text-amber-500" />
            Key Takeaways
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="list-disc pl-5 space-y-2">
            {summaryData.keyPoints.map((point, index) => (
              <li key={index}>{point}</li>
            ))}
          </ul>
        </CardContent>
      </Card>

      <Tabs defaultValue={activeTab} value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid grid-cols-4 mb-4">
          <TabsTrigger value="visual" className="flex items-center gap-1">
            <ImageIcon className="h-4 w-4" /> Visual
          </TabsTrigger>
          <TabsTrigger value="auditory" className="flex items-center gap-1">
            <BookOpen className="h-4 w-4" /> Text
          </TabsTrigger>
          <TabsTrigger value="kinesthetic" className="flex items-center gap-1">
            <List className="h-4 w-4" /> Structure
          </TabsTrigger>
          <TabsTrigger value="reading" className="flex items-center gap-1">
            <BarChart className="h-4 w-4" /> Data
          </TabsTrigger>
        </TabsList>

        <TabsContent value="visual" className="space-y-4">
          <div className="bg-white p-4 rounded-lg border">
            <h3 className="text-lg font-medium mb-4">Visual Summary</h3>

            {summaryData.visualSummary.map((item, index) => (
              <div key={index} className="mb-6">
                <h4 className="font-medium text-blue-800 mb-2">{item.title}</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <p className="text-gray-700">{item.description}</p>
                  </div>
                  <div className="bg-gray-100 rounded-lg p-4 flex items-center justify-center">
                    {item.imageType === "chart" ? (
                      <div className="w-full h-48 flex flex-col items-center justify-center">
                        <BarChart className="h-16 w-16 text-blue-500 mb-2" />
                        <p className="text-center text-sm text-gray-500">
                          {item.imageDescription || "Chart visualization of the concept"}
                        </p>
                      </div>
                    ) : item.imageType === "diagram" ? (
                      <div className="w-full h-48 flex flex-col items-center justify-center">
                        <Brain className="h-16 w-16 text-purple-500 mb-2" />
                        <p className="text-center text-sm text-gray-500">
                          {item.imageDescription || "Diagram illustrating the concept"}
                        </p>
                      </div>
                    ) : (
                      <div className="w-full h-48 flex flex-col items-center justify-center">
                        <ImageIcon className="h-16 w-16 text-green-500 mb-2" />
                        <p className="text-center text-sm text-gray-500">
                          {item.imageDescription || "Visual representation"}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="auditory" className="space-y-4">
          <div className="bg-white p-4 rounded-lg border">
            <h3 className="text-lg font-medium mb-4">Text Summary</h3>
            <div className="prose max-w-none">
              {summaryData.textSummary.map((paragraph, index) => (
                <p key={index} className="mb-4">
                  {paragraph}
                </p>
              ))}
            </div>
          </div>
        </TabsContent>

        <TabsContent value="kinesthetic" className="space-y-4">
          <div className="bg-white p-4 rounded-lg border">
            <h3 className="text-lg font-medium mb-4">Document Structure</h3>

            <div className="space-y-4">
              {summaryData.structure.map((section, index) => (
                <div key={index} className="border-l-4 border-blue-500 pl-4 py-2">
                  <h4 className="font-medium">{section.title}</h4>
                  <p className="text-sm text-gray-600">{section.description}</p>

                  {section.subsections && section.subsections.length > 0 && (
                    <div className="mt-2 ml-4 space-y-2">
                      {section.subsections.map((subsection, subIndex) => (
                        <div key={subIndex} className="border-l-2 border-gray-300 pl-3 py-1">
                          <p className="text-sm font-medium">{subsection.title}</p>
                          <p className="text-xs text-gray-600">{subsection.description}</p>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </TabsContent>

        <TabsContent value="reading" className="space-y-4">
          <div className="bg-white p-4 rounded-lg border">
            <h3 className="text-lg font-medium mb-4">Key Data & Concepts</h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {summaryData.keyData.map((item, index) => (
                <Card key={index} className="border-l-4 border-green-500">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-base">{item.concept}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm">{item.explanation}</p>

                    {item.relatedConcepts && item.relatedConcepts.length > 0 && (
                      <div className="mt-2 flex flex-wrap gap-2">
                        {item.relatedConcepts.map((related, relIndex) => (
                          <Badge key={relIndex} variant="outline">
                            {related}
                          </Badge>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}

