"use client"

import type React from "react"

import { useState } from "react"
import { Upload, FileText, AlertCircle, Check, type File } from "lucide-react"
import { Progress } from "@/components/ui/progress"
import { Alert, AlertDescription } from "@/components/ui/alert"

interface PdfUploadProps {
  onPdfUploaded: (text: string, fileName: string) => void
}

export default function PdfUpload({ onPdfUploaded }: PdfUploadProps) {
  const [isUploading, setIsUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const [fileName, setFileName] = useState<string | null>(null)

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    // Check if file is a PDF
    if (file.type !== "application/pdf") {
      setError("Please upload a PDF file")
      return
    }

    setFileName(file.name)
    setIsUploading(true)
    setError(null)
    setSuccess(false)

    try {
      // Simulate upload progress
      const progressInterval = setInterval(() => {
        setUploadProgress((prev) => {
          if (prev >= 90) {
            clearInterval(progressInterval)
            return 90
          }
          return prev + 10
        })
      }, 200)

      // Extract text from PDF
      const text = await extractTextFromPdf(file)

      clearInterval(progressInterval)
      setUploadProgress(100)
      setSuccess(true)
      setIsUploading(false)

      // Pass the extracted text to parent component
      onPdfUploaded(text, file.name)
    } catch (err) {
      setError("Failed to process PDF. Please try again.")
      setIsUploading(false)
      setUploadProgress(0)
    }
  }

  const extractTextFromPdf = async (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader()

      reader.onload = async (event) => {
        try {
          // In a real implementation, we would use a PDF parsing library
          // For this demo, we'll simulate text extraction
          // In production, you would use a library like pdf.js or a server-side solution

          // Simulate processing time
          await new Promise((r) => setTimeout(r, 1500))

          // Return a placeholder message for demo purposes
          // In a real app, this would be the actual extracted text
          resolve(
            `Extracted content from ${file.name}. This document appears to be about artificial intelligence and machine learning concepts. It covers topics like neural networks, deep learning, and natural language processing. There are several diagrams showing the architecture of neural networks and how they process information. The document also includes data tables comparing different machine learning algorithms and their performance metrics. There's a section on practical applications of AI in healthcare, finance, and education, with case studies and examples. The conclusion discusses ethical considerations and future directions in AI research.`,
          )
        } catch (error) {
          reject(error)
        }
      }

      reader.onerror = () => reject(new Error("Failed to read file"))

      reader.readAsArrayBuffer(file)
    })
  }

  return (
    <div className="w-full">
      <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-blue-500 transition-colors">
        <input
          type="file"
          id="pdf-upload"
          accept=".pdf"
          onChange={handleFileChange}
          className="hidden"
          disabled={isUploading}
        />
        <label htmlFor="pdf-upload" className="cursor-pointer flex flex-col items-center justify-center">
          {!fileName ? (
            <>
              <Upload className="h-10 w-10 text-gray-400 mb-2" />
              <p className="text-lg font-medium mb-1">Upload a PDF document</p>
              <p className="text-sm text-gray-500">Drag and drop or click to browse</p>
            </>
          ) : (
            <div className="flex items-center gap-2">
              <FileText className="h-6 w-6 text-blue-500" />
              <span className="font-medium">{fileName}</span>
            </div>
          )}
        </label>
      </div>

      {isUploading && (
        <div className="mt-4">
          <div className="flex justify-between text-sm mb-1">
            <span>Uploading...</span>
            <span>{uploadProgress}%</span>
          </div>
          <Progress value={uploadProgress} className="h-2" />
        </div>
      )}

      {error && (
        <Alert variant="destructive" className="mt-4">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {success && (
        <Alert className="mt-4 bg-green-50 text-green-800 border-green-200">
          <Check className="h-4 w-4 text-green-600" />
          <AlertDescription>PDF successfully processed!</AlertDescription>
        </Alert>
      )}
    </div>
  )
}

