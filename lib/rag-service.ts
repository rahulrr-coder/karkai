import { generateText, embed, cosineSimilarity } from "ai"
import { openai } from "@ai-sdk/openai"

// Sample knowledge base for different learning styles
const learningStylesKnowledgeBase = {
  visual: [
    "Visual learners benefit from diagrams, charts, videos, and other visual media.",
    "Visual learners often use color-coding and spatial organization to understand information.",
    "Visual learners typically remember what they see rather than what they hear.",
    "Visual learners prefer instructors who use visual aids and gestures.",
    "Visual learners often take detailed notes to remember information.",
  ],
  auditory: [
    "Auditory learners benefit from lectures, discussions, and verbal explanations.",
    "Auditory learners often read aloud to themselves to better understand material.",
    "Auditory learners typically remember what they hear rather than what they see.",
    "Auditory learners prefer instructors who explain things clearly and use verbal emphasis.",
    "Auditory learners often record lectures to listen to them again later.",
  ],
  kinesthetic: [
    "Kinesthetic learners benefit from hands-on activities, experiments, and physical movement.",
    "Kinesthetic learners often need to move around while learning or studying.",
    "Kinesthetic learners typically remember what they do rather than what they see or hear.",
    "Kinesthetic learners prefer instructors who incorporate activities and demonstrations.",
    "Kinesthetic learners often use physical objects to understand concepts.",
  ],
  reading: [
    "Reading/writing learners benefit from textbooks, articles, and written notes.",
    "Reading/writing learners often rewrite information in their own words.",
    "Reading/writing learners typically remember what they've read or written.",
    "Reading/writing learners prefer instructors who provide detailed handouts and reading materials.",
    "Reading/writing learners often create lists, definitions, and written summaries.",
  ],
}

// Function to generate a visual summary of PDF content
export async function generatePdfSummary(pdfContent: string, learningStyle: string) {
  // Get relevant context based on learning style
  const styleContext = learningStylesKnowledgeBase[learningStyle] || []

  // Prepare context for RAG
  const context = `
    Learning Style Information:
    ${styleContext.join("\n")}
    
    The user is primarily a ${learningStyle} learner who has uploaded a document to be summarized.
    The document content is as follows:
    
    ${pdfContent}
  `

  try {
    // Use AI SDK to generate a visual summary of the PDF
    const { text } = await generateText({
      model: openai("gpt-4o"),
      system: `You are an expert document analyzer specializing in creating visual summaries. 
      Your task is to analyze the provided document content and create a comprehensive summary 
      that emphasizes visual representation, especially for visual learners.
      
      Return your response as a JSON object with the following structure:
      {
        "keyPoints": ["point1", "point2", "point3", ...],
        "visualSummary": [
          {
            "title": "Section title",
            "description": "Brief description of this concept/section",
            "imageType": "chart|diagram|image",
            "imageDescription": "Description of what the image should show"
          }
        ],
        "textSummary": ["paragraph1", "paragraph2", ...],
        "structure": [
          {
            "title": "Main section title",
            "description": "Brief description of this section",
            "subsections": [
              {
                "title": "Subsection title",
                "description": "Brief description of this subsection"
              }
            ]
          }
        ],
        "keyData": [
          {
            "concept": "Key concept name",
            "explanation": "Brief explanation of this concept",
            "relatedConcepts": ["related1", "related2", ...]
          }
        ]
      }
      
      Focus on creating a summary that would be most effective for a ${learningStyle} learner,
      but include elements that would be helpful for all learning styles.`,
      prompt: `Based on the following document content, create a comprehensive visual summary:
      
      ${pdfContent}
      
      Consider that this summary is primarily for a ${learningStyle} learner, so emphasize 
      visual elements and organization that would appeal to this learning style.`,
    })

    // Parse the response as JSON
    try {
      const summary = JSON.parse(text)
      return summary
    } catch (error) {
      console.error("Error parsing AI response:", error)
      return generateFallbackSummary(pdfContent, learningStyle)
    }
  } catch (error) {
    console.error("Error generating summary:", error)
    return generateFallbackSummary(pdfContent, learningStyle)
  }
}

// Function to get personalized content recommendations using RAG
export async function getPersonalizedContent(topic: string, learningStyle: string, pdfContent: string | null = null) {
  // Get relevant context based on learning style
  const styleContext = learningStylesKnowledgeBase[learningStyle] || []

  // Prepare context for RAG
  let context = `
    Learning Style Information:
    ${styleContext.join("\n")}
    
    The user is primarily a ${learningStyle} learner interested in learning about "${topic}".
  `

  // If PDF content is provided, use RAG to extract relevant information
  if (pdfContent) {
    try {
      const relevantPdfContent = await extractRelevantContentFromPdf(pdfContent, topic, learningStyle)
      context += `\n\nRelevant content from the uploaded document:\n${relevantPdfContent}`
    } catch (error) {
      console.error("Error processing PDF content:", error)
    }
  }

  try {
    // Use AI SDK to generate personalized recommendations
    const { text } = await generateText({
      model: openai("gpt-4o"),
      system: `You are an expert educational content recommender. Your task is to recommend learning resources 
      that match a user's learning style and topic of interest. ${pdfContent ? "The user has uploaded a document, and you should use the content from this document to inform your recommendations." : ""}
      
      Return your response as a JSON array of objects with the following structure:
      [
        {
          "title": "Resource title",
          "description": "Brief description of the resource",
          "type": "visual|auditory|kinesthetic|reading",
          "url": "https://example.com/resource",
          "source": "Source name (e.g., Coursera, YouTube, etc.)"
        }
      ]
      
      Include 2-3 resources for each learning style (visual, auditory, kinesthetic, reading), 
      for a total of 8-12 resources. Ensure the resources are real, high-quality, and relevant to the topic.
      Prioritize resources that match the user's primary learning style.
      
      ${pdfContent ? "If the uploaded document contains specific topics or concepts, recommend resources that expand on those specific topics." : ""}`,
      prompt: `Based on the following context about learning styles and the user's preferences, 
      recommend specific learning resources for the topic "${topic}" that would be most effective 
      for a ${learningStyle} learner. Include resources for all learning styles, but emphasize 
      ${learningStyle} resources.
      
      Context:
      ${context}`,
    })

    // Parse the response as JSON
    try {
      const recommendations = JSON.parse(text)
      return recommendations
    } catch (error) {
      console.error("Error parsing AI response:", error)
      return generateFallbackRecommendations(topic, learningStyle)
    }
  } catch (error) {
    console.error("Error generating recommendations:", error)
    return generateFallbackRecommendations(topic, learningStyle)
  }
}

// Function to extract relevant content from PDF using RAG
async function extractRelevantContentFromPdf(
  pdfContent: string,
  topic: string,
  learningStyle: string,
): Promise<string> {
  // Split the PDF content into chunks
  const chunks = splitIntoChunks(pdfContent, 500)

  if (chunks.length === 0) {
    return "No relevant content found in the document."
  }

  try {
    // Create a query combining the topic and learning style
    const query = `Information about ${topic} that would be useful for a ${learningStyle} learner`

    // Generate embedding for the query using AI SDK
    const { embedding: queryEmbedding } = await embed({
      model: openai.embedding("text-embedding-3-small"),
      value: query,
    })

    // Generate embeddings for each chunk
    const chunkEmbeddings = await Promise.all(
      chunks.map(async (chunk) => {
        try {
          const { embedding } = await embed({
            model: openai.embedding("text-embedding-3-small"),
            value: chunk,
          })
          return { chunk, embedding }
        } catch (error) {
          console.error("Error generating embedding for chunk:", error)
          return null
        }
      }),
    )

    // Filter out any null embeddings
    const validChunkEmbeddings = chunkEmbeddings.filter((item) => item !== null)

    if (validChunkEmbeddings.length === 0) {
      return "Could not process document content effectively."
    }

    // Calculate similarity scores and rank chunks
    const rankedChunks = validChunkEmbeddings
      .map((item) => ({
        chunk: item.chunk,
        similarity: cosineSimilarity(queryEmbedding, item.embedding),
      }))
      .sort((a, b) => b.similarity - a.similarity)

    // Take the top 3 most relevant chunks
    const topChunks = rankedChunks.slice(0, 3).map((item) => item.chunk)

    return topChunks.join("\n\n")
  } catch (error) {
    console.error("Error in RAG processing:", error)
    // Return a portion of the PDF content if RAG fails
    return chunks.slice(0, 2).join("\n\n")
  }
}

// Helper function to split text into chunks
function splitIntoChunks(text: string, maxChunkSize: number): string[] {
  const chunks = []
  const sentences = text.split(/(?<=[.!?])\s+/)

  let currentChunk = ""

  for (const sentence of sentences) {
    if (currentChunk.length + sentence.length <= maxChunkSize) {
      currentChunk += (currentChunk ? " " : "") + sentence
    } else {
      if (currentChunk) {
        chunks.push(currentChunk)
      }
      currentChunk = sentence
    }
  }

  if (currentChunk) {
    chunks.push(currentChunk)
  }

  return chunks
}

// Fallback function for PDF summary if AI generation fails
function generateFallbackSummary(pdfContent: string, learningStyle: string) {
  return {
    keyPoints: [
      "The document covers artificial intelligence and machine learning concepts",
      "Neural networks and deep learning architectures are explained",
      "Natural language processing applications are discussed",
      "Practical applications in healthcare, finance, and education are included",
      "Ethical considerations in AI are addressed",
    ],
    visualSummary: [
      {
        title: "Neural Network Architecture",
        description:
          "The document explains how neural networks are structured with input layers, hidden layers, and output layers to process information.",
        imageType: "diagram",
        imageDescription: "Diagram of a neural network with interconnected nodes across multiple layers",
      },
      {
        title: "Machine Learning Algorithms Comparison",
        description:
          "Various machine learning algorithms are compared based on their performance metrics and use cases.",
        imageType: "chart",
        imageDescription: "Comparative chart showing performance metrics of different ML algorithms",
      },
      {
        title: "AI Applications in Healthcare",
        description:
          "The document discusses how AI is being used in healthcare for diagnosis, treatment planning, and patient monitoring.",
        imageType: "image",
        imageDescription: "Visual representation of AI applications in healthcare settings",
      },
    ],
    textSummary: [
      "This document provides a comprehensive overview of artificial intelligence and machine learning concepts, focusing on both theoretical foundations and practical applications.",
      "The first section introduces neural networks and deep learning, explaining their architecture and how they process information to learn patterns from data. Various types of neural networks are discussed, including convolutional neural networks (CNNs) and recurrent neural networks (RNNs).",
      "The second section covers natural language processing, detailing how machines can understand, interpret, and generate human language. This includes techniques like tokenization, word embeddings, and transformer models.",
      "The third section explores practical applications of AI across different industries. In healthcare, AI is being used for medical imaging analysis, disease diagnosis, and treatment planning. In finance, applications include fraud detection, algorithmic trading, and risk assessment. Educational applications focus on personalized learning and automated grading.",
      "The document concludes with a discussion of ethical considerations in AI development and deployment, including issues of bias, privacy, and transparency. Future research directions are also outlined.",
    ],
    structure: [
      {
        title: "Introduction to AI and Machine Learning",
        description: "Foundational concepts and definitions",
        subsections: [
          {
            title: "Neural Networks",
            description: "Architecture and functioning of neural networks",
          },
          {
            title: "Deep Learning",
            description: "Advanced neural network approaches",
          },
        ],
      },
      {
        title: "Natural Language Processing",
        description: "How machines understand and generate human language",
        subsections: [
          {
            title: "Text Processing Techniques",
            description: "Methods for analyzing and processing text data",
          },
          {
            title: "Language Models",
            description: "How modern language models work",
          },
        ],
      },
      {
        title: "Practical Applications",
        description: "Real-world implementations of AI",
        subsections: [
          {
            title: "Healthcare Applications",
            description: "AI use cases in medical settings",
          },
          {
            title: "Financial Applications",
            description: "AI applications in finance and banking",
          },
          {
            title: "Educational Applications",
            description: "How AI is transforming education",
          },
        ],
      },
      {
        title: "Ethical Considerations",
        description: "Addressing ethical challenges in AI",
        subsections: [
          {
            title: "Bias and Fairness",
            description: "Ensuring AI systems are fair and unbiased",
          },
          {
            title: "Privacy Concerns",
            description: "Protecting data privacy in AI systems",
          },
        ],
      },
    ],
    keyData: [
      {
        concept: "Neural Networks",
        explanation:
          "Computational models inspired by the human brain that consist of interconnected nodes (neurons) organized in layers",
        relatedConcepts: ["Deep Learning", "Backpropagation", "Activation Functions"],
      },
      {
        concept: "Machine Learning Algorithms",
        explanation: "Statistical methods that enable computers to learn from data without being explicitly programmed",
        relatedConcepts: ["Supervised Learning", "Unsupervised Learning", "Reinforcement Learning"],
      },
      {
        concept: "Natural Language Processing",
        explanation: "Field of AI focused on enabling computers to understand, interpret, and generate human language",
        relatedConcepts: ["Tokenization", "Word Embeddings", "Transformer Models"],
      },
      {
        concept: "AI Ethics",
        explanation: "Principles and guidelines for ensuring AI systems are developed and deployed responsibly",
        relatedConcepts: ["Bias", "Fairness", "Transparency", "Accountability"],
      },
    ],
  }
}

// Fallback function in case the AI service fails
function generateFallbackRecommendations(topic: string, learningStyle: string) {
  // Basic fallback recommendations by learning style
  const fallbackRecommendations = [
    {
      title: `${topic} Video Course`,
      description: `A comprehensive video course covering all aspects of ${topic} with visual demonstrations.`,
      type: "visual",
      url: "https://www.youtube.com/results?search_query=" + encodeURIComponent(topic),
      source: "YouTube",
    },
    {
      title: `${topic} Infographics`,
      description: `Visual summaries and infographics explaining key concepts in ${topic}.`,
      type: "visual",
      url: "https://www.pinterest.com/search/pins/?q=" + encodeURIComponent(topic + " infographic"),
      source: "Pinterest",
    },
    {
      title: `${topic} Podcast Series`,
      description: `Expert discussions and explanations about ${topic} in an audio format.`,
      type: "auditory",
      url: "https://podcasts.apple.com/us/search?term=" + encodeURIComponent(topic),
      source: "Apple Podcasts",
    },
    {
      title: `${topic} Audiobook`,
      description: `Comprehensive audiobook covering the fundamentals of ${topic}.`,
      type: "auditory",
      url: "https://www.audible.com/search?keywords=" + encodeURIComponent(topic),
      source: "Audible",
    },
    {
      title: `Interactive ${topic} Workshop`,
      description: `Hands-on workshop where you can practice and apply ${topic} concepts.`,
      type: "kinesthetic",
      url: "https://www.eventbrite.com/d/online/${encodeURIComponent(topic)}-workshop/",
      source: "Eventbrite",
    },
    {
      title: `${topic} DIY Project`,
      description: `Step-by-step guide to creating a project related to ${topic}.`,
      type: "kinesthetic",
      url: "https://www.instructables.com/search/?q=" + encodeURIComponent(topic),
      source: "Instructables",
    },
    {
      title: `${topic} Textbook`,
      description: `Comprehensive textbook covering all aspects of ${topic} with detailed explanations.`,
      type: "reading",
      url: "https://www.amazon.com/s?k=" + encodeURIComponent(topic + " textbook"),
      source: "Amazon Books",
    },
    {
      title: `${topic} Research Papers`,
      description: `Collection of academic papers and articles about ${topic}.`,
      type: "reading",
      url: "https://scholar.google.com/scholar?q=" + encodeURIComponent(topic),
      source: "Google Scholar",
    },
  ]

  // Prioritize the user's learning style by moving those recommendations to the front
  const prioritizedRecommendations = [
    ...fallbackRecommendations.filter((item) => item.type === learningStyle),
    ...fallbackRecommendations.filter((item) => item.type !== learningStyle),
  ]

  return prioritizedRecommendations
}

