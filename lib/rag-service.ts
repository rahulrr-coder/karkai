import { generateText } from "ai"
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

// Function to get personalized content recommendations using RAG
export async function getPersonalizedContent(topic: string, learningStyle: string) {
  // Get relevant context based on learning style
  const styleContext = learningStylesKnowledgeBase[learningStyle] || []

  // Combine context for RAG
  const context = `
    Learning Style Information:
    ${styleContext.join("\n")}
    
    The user is primarily a ${learningStyle} learner interested in learning about "${topic}".
  `

  try {
    // Use AI SDK to generate personalized recommendations [^4]
    const { text } = await generateText({
      model: openai("gpt-4o"),
      system: `You are an expert educational content recommender. Your task is to recommend learning resources 
      that match a user's learning style and topic of interest. Provide a diverse set of high-quality resources 
      that align with their learning preferences.
      
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
      Prioritize resources that match the user's primary learning style.`,
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

