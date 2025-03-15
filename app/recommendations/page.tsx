"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Brain, BookOpen, Video, Headphones, Dumbbell, ArrowLeft, Search, Loader2, FileText } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { getPersonalizedContent, generatePdfSummary } from "@/lib/rag-service"
import PdfUpload from "@/components/pdf-upload"
import PdfSummary from "@/components/pdf-summary"

export default function RecommendationsPage() {
  const router = useRouter()
  const [brainType, setBrainType] = useState(null)
  const [topic, setTopic] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [recommendations, setRecommendations] = useState(null)
  const [activeTab, setActiveTab] = useState("all")
  const [pdfContent, setPdfContent] = useState<string | null>(null)
  const [pdfFileName, setPdfFileName] = useState<string | null>(null)
  const [showPdfUpload, setShowPdfUpload] = useState(true) // Changed to true by default
  const [pdfSummary, setPdfSummary] = useState(null)

  useEffect(() => {
    // Retrieve brain type result from localStorage
    const storedResult = localStorage.getItem("brainTypeResult")
    if (storedResult) {
      setBrainType(JSON.parse(storedResult))
    } else {
      // Redirect to assessment if no result is found
      router.push("/")
    }
  }, [router])

  const handleSearch = async () => {
    if ((!topic && !pdfContent) || !brainType) return

    setIsLoading(true)
    try {
      const content = await getPersonalizedContent(topic, brainType.dominantType, pdfContent)
      setRecommendations(content)
      setActiveTab("all")
    } catch (error) {
      console.error("Error fetching recommendations:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleKeyDown = (e) => {
    if (e.key === "Enter") {
      handleSearch()
    }
  }

  const handlePdfUploaded = async (text: string, fileName: string) => {
    setPdfContent(text)
    setPdfFileName(fileName)

    // Auto-set a generic topic based on filename
    if (!topic) {
      const topicFromFilename = fileName.replace(".pdf", "").replace(/[-_]/g, " ")
      setTopic(topicFromFilename)
    }

    // Generate PDF summary
    setIsLoading(true)
    try {
      const summary = await generatePdfSummary(text, brainType?.dominantType || "visual")
      setPdfSummary(summary)
      setRecommendations(null) // Clear any previous recommendations
    } catch (error) {
      console.error("Error generating PDF summary:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const getLearningTypeIcon = (type) => {
    switch (type) {
      case "visual":
        return <Video className="h-5 w-5 text-blue-500" />
      case "auditory":
        return <Headphones className="h-5 w-5 text-green-500" />
      case "kinesthetic":
        return <Dumbbell className="h-5 w-5 text-purple-500" />
      case "reading":
        return <BookOpen className="h-5 w-5 text-amber-500" />
      default:
        return <Brain className="h-5 w-5 text-gray-500" />
    }
  }

  const getTypeColor = (type) => {
    switch (type) {
      case "visual":
        return "bg-blue-100 text-blue-800 hover:bg-blue-200"
      case "auditory":
        return "bg-green-100 text-green-800 hover:bg-green-200"
      case "kinesthetic":
        return "bg-purple-100 text-purple-800 hover:bg-purple-200"
      case "reading":
        return "bg-amber-100 text-amber-800 hover:bg-amber-200"
      default:
        return "bg-gray-100 text-gray-800 hover:bg-gray-200"
    }
  }

  const filteredRecommendations = recommendations
    ? activeTab === "all"
      ? recommendations
      : recommendations.filter((item) => item.type === activeTab)
    : []

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="flex items-center mb-8">
        <Button variant="ghost" size="icon" onClick={() => router.push("/")} className="mr-2" aria-label="Go back">
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <h1 className="text-2xl font-bold">Personalized Learning Content</h1>
      </div>

      {brainType && (
        <div className="mb-8">
          <div className="flex items-center gap-2 mb-2">
            <Brain className="h-5 w-5 text-blue-600" />
            <h2 className="text-lg font-medium">
              Your Learning Style:{" "}
              <span className="font-bold">
                {brainType.dominantType.charAt(0).toUpperCase() + brainType.dominantType.slice(1)} Learner
              </span>
            </h2>
          </div>
          <p className="text-gray-600 mb-4">
            Upload a PDF document to get a personalized visual summary based on your learning style.
          </p>

          <div className="flex gap-2 flex-wrap">
            {Object.entries(brainType.percentages).map(([type, percentage]) => (
              <Badge key={type} variant="secondary" className={getTypeColor(type)}>
                {type.charAt(0).toUpperCase() + type.slice(1)}: {percentage}%
              </Badge>
            ))}
          </div>
        </div>
      )}

      <div className="mb-6">
        <div className="flex gap-2 mb-4">
          <Button
            variant={!showPdfUpload ? "default" : "outline"}
            onClick={() => setShowPdfUpload(false)}
            className="flex items-center gap-2"
          >
            <Search className="h-4 w-4" />
            Search by Topic
          </Button>
          <Button
            variant={showPdfUpload ? "default" : "outline"}
            onClick={() => setShowPdfUpload(true)}
            className="flex items-center gap-2"
          >
            <FileText className="h-4 w-4" />
            Upload PDF
          </Button>
        </div>

        {!showPdfUpload ? (
          <div className="flex gap-2 mb-4">
            <Input
              type="text"
              placeholder="Enter a topic (e.g., 'Machine Learning', 'History', 'Photography')"
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              onKeyDown={handleKeyDown}
              className="flex-1"
            />
            <Button onClick={handleSearch} disabled={isLoading || !topic}>
              {isLoading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Search className="h-4 w-4 mr-2" />}
              Find Content
            </Button>
          </div>
        ) : (
          <div className="mb-4">
            <PdfUpload onPdfUploaded={handlePdfUploaded} />
          </div>
        )}
      </div>

      {isLoading && (
        <div className="flex justify-center items-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
          <span className="ml-2 text-lg">Analyzing document and generating visual summary...</span>
        </div>
      )}

      {/* PDF Summary Section */}
      {pdfContent && pdfFileName && (
        <div className="mb-8">
          <PdfSummary
            pdfContent={pdfContent}
            brainType={brainType?.dominantType || "visual"}
            summaryData={pdfSummary}
            isLoading={isLoading}
          />
        </div>
      )}

      {/* Original Recommendations Section (now secondary) */}
      {recommendations && !isLoading && (
        <>
          <div className="mt-12 mb-4">
            <h2 className="text-xl font-bold">Related Learning Resources</h2>
            <p className="text-gray-600">Additional resources that complement the document content</p>
          </div>

          <Tabs defaultValue="all" value={activeTab} onValueChange={setActiveTab} className="mb-6">
            <TabsList className="grid grid-cols-5 mb-4">
              <TabsTrigger value="all">All</TabsTrigger>
              <TabsTrigger value="visual" className="flex items-center gap-1">
                <Video className="h-4 w-4" /> Visual
              </TabsTrigger>
              <TabsTrigger value="auditory" className="flex items-center gap-1">
                <Headphones className="h-4 w-4" /> Auditory
              </TabsTrigger>
              <TabsTrigger value="kinesthetic" className="flex items-center gap-1">
                <Dumbbell className="h-4 w-4" /> Kinesthetic
              </TabsTrigger>
              <TabsTrigger value="reading" className="flex items-center gap-1">
                <BookOpen className="h-4 w-4" /> Reading
              </TabsTrigger>
            </TabsList>

            <TabsContent value="all" className="mt-0">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredRecommendations.map((item, index) => (
                  <Card key={index}>
                    <CardHeader className="pb-2">
                      <div className="flex justify-between items-start">
                        <CardTitle className="text-lg">{item.title}</CardTitle>
                        {getLearningTypeIcon(item.type)}
                      </div>
                      <CardDescription>{item.source}</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-gray-600">{item.description}</p>
                    </CardContent>
                    <CardFooter>
                      <Button variant="outline" className="w-full" asChild>
                        <a href={item.url} target="_blank" rel="noopener noreferrer">
                          View Resource
                        </a>
                      </Button>
                    </CardFooter>
                  </Card>
                ))}
              </div>
            </TabsContent>

            {/* Other tab contents remain the same */}
            <TabsContent value="visual" className="mt-0">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredRecommendations.map((item, index) => (
                  <Card key={index}>
                    <CardHeader className="pb-2">
                      <div className="flex justify-between items-start">
                        <CardTitle className="text-lg">{item.title}</CardTitle>
                        <Video className="h-5 w-5 text-blue-500" />
                      </div>
                      <CardDescription>{item.source}</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-gray-600">{item.description}</p>
                    </CardContent>
                    <CardFooter>
                      <Button variant="outline" className="w-full" asChild>
                        <a href={item.url} target="_blank" rel="noopener noreferrer">
                          View Resource
                        </a>
                      </Button>
                    </CardFooter>
                  </Card>
                ))}
              </div>
            </TabsContent>

            {/* Other tab contents remain the same */}
          </Tabs>
        </>
      )}

      {!recommendations && !pdfSummary && !isLoading && (
        <div className="text-center py-12 bg-gray-50 rounded-lg">
          <FileText className="h-12 w-12 mx-auto text-gray-400 mb-4" />
          <h3 className="text-xl font-medium text-gray-700 mb-2">Upload a PDF to get started</h3>
          <p className="text-gray-500 max-w-md mx-auto">
            Upload a PDF document to receive a personalized visual summary based on your learning style.
          </p>
        </div>
      )}
    </div>
  )
}

