"use client"

import { useState, useEffect } from "react"
import { CheckCircle, ChevronRight, Brain, ArrowRight } from "lucide-react"
import { useRouter } from "next/navigation"

const BrainTypeAssessment = () => {
  const router = useRouter()
  const [currentStep, setCurrentStep] = useState(0)
  const [answers, setAnswers] = useState({})
  const [isCompleted, setIsCompleted] = useState(false)
  const [result, setResult] = useState(null)
  const [selectedQuestions, setSelectedQuestions] = useState([])

  // Larger pool of questions
  const questionPool = [
    {
      id: "q1",
      text: "When learning something new, I prefer to:",
      options: [
        { id: "a", text: "See diagrams, charts, or demonstrations", type: "visual" },
        { id: "b", text: "Listen to verbal instructions or explanations", type: "auditory" },
        { id: "c", text: "Try it out and learn through practice", type: "kinesthetic" },
        { id: "d", text: "Read written instructions or explanations", type: "reading" },
      ],
    },
    {
      id: "q2",
      text: "When solving problems, I tend to:",
      options: [
        { id: "a", text: "Visualize the solution in my mind", type: "visual" },
        { id: "b", text: "Talk through the problem out loud", type: "auditory" },
        { id: "c", text: "Use a hands-on approach to figure it out", type: "kinesthetic" },
        { id: "d", text: "Write down the steps and analyze them", type: "reading" },
      ],
    },
    {
      id: "q3",
      text: "I remember information best when:",
      options: [
        { id: "a", text: "I see it written or in an image", type: "visual" },
        { id: "b", text: "I hear it in a discussion or lecture", type: "auditory" },
        { id: "c", text: "I physically interact with the material", type: "kinesthetic" },
        { id: "d", text: "I read and take detailed notes", type: "reading" },
      ],
    },
    {
      id: "q4",
      text: "When recalling directions to a location, I usually:",
      options: [
        { id: "a", text: "Picture a map or landmarks in my mind", type: "visual" },
        { id: "b", text: "Remember verbal directions that were given", type: "auditory" },
        { id: "c", text: "Remember the feeling of traveling the route", type: "kinesthetic" },
        { id: "d", text: "Refer to written directions I noted down", type: "reading" },
      ],
    },
    {
      id: "q5",
      text: "When explaining a concept to someone else, I prefer to:",
      options: [
        { id: "a", text: "Draw a diagram or show images", type: "visual" },
        { id: "b", text: "Explain it verbally with emphasis on key points", type: "auditory" },
        { id: "c", text: "Demonstrate with hands-on examples", type: "kinesthetic" },
        { id: "d", text: "Provide written explanations with details", type: "reading" },
      ],
    },
    {
      id: "q6",
      text: "When attending a presentation, I prefer:",
      options: [
        { id: "a", text: "Slides with graphs, charts, and images", type: "visual" },
        { id: "b", text: "A speaker who explains concepts clearly", type: "auditory" },
        { id: "c", text: "Interactive demonstrations or activities", type: "kinesthetic" },
        { id: "d", text: "Detailed handouts with written information", type: "reading" },
      ],
    },
    {
      id: "q7",
      text: "When I need to concentrate, I prefer:",
      options: [
        { id: "a", text: "A clean, organized space with minimal visual distractions", type: "visual" },
        { id: "b", text: "A quiet environment or specific background sounds", type: "auditory" },
        { id: "c", text: "The ability to move around or fidget while thinking", type: "kinesthetic" },
        { id: "d", text: "Taking notes or writing down my thoughts", type: "reading" },
      ],
    },
    {
      id: "q8",
      text: "When remembering a movie, I most easily recall:",
      options: [
        { id: "a", text: "The visual scenes and how things looked", type: "visual" },
        { id: "b", text: "The dialogue and soundtrack", type: "auditory" },
        { id: "c", text: "The emotions I felt and physical reactions I had", type: "kinesthetic" },
        { id: "d", text: "The plot details and character development", type: "reading" },
      ],
    },
    {
      id: "q9",
      text: "When learning a new skill, I prefer to:",
      options: [
        { id: "a", text: "Watch someone demonstrate it first", type: "visual" },
        { id: "b", text: "Have someone explain the steps verbally", type: "auditory" },
        { id: "c", text: "Try it myself right away, even if I make mistakes", type: "kinesthetic" },
        { id: "d", text: "Read instructions or a manual thoroughly first", type: "reading" },
      ],
    },
    {
      id: "q10",
      text: "When giving directions to someone, I typically:",
      options: [
        { id: "a", text: "Draw a map or use visual landmarks", type: "visual" },
        { id: "b", text: "Explain the route step by step verbally", type: "auditory" },
        { id: "c", text: "Walk with them or gesture to show the way", type: "kinesthetic" },
        { id: "d", text: "Write down detailed instructions", type: "reading" },
      ],
    },
  ]

  // Function to randomly select questions
  const selectRandomQuestions = () => {
    // Shuffle the question pool using Fisher-Yates algorithm
    const shuffled = [...questionPool]
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1))
      ;[shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]]
    }

    // Take the first 5 questions
    return shuffled.slice(0, 5)
  }

  // Initialize or reset questions
  useEffect(() => {
    setSelectedQuestions(selectRandomQuestions())
  }, [isCompleted])

  const handleSelectOption = (questionId, optionId, optionType) => {
    setAnswers({
      ...answers,
      [questionId]: { optionId, optionType },
    })
  }

  const handleNext = () => {
    if (currentStep < selectedQuestions.length - 1) {
      setCurrentStep(currentStep + 1)
    } else {
      // Calculate results
      const typeCounts = Object.values(answers).reduce((counts, answer) => {
        counts[answer.optionType] = (counts[answer.optionType] || 0) + 1
        return counts
      }, {})

      // Find dominant brain type
      let dominantType = "visual"
      let highestCount = 0

      Object.entries(typeCounts).forEach(([type, count]) => {
        if (count > highestCount) {
          highestCount = count
          dominantType = type
        }
      })

      // Get percentages
      const total = Object.values(typeCounts).reduce((sum, count) => sum + count, 0)
      const percentages = {}

      Object.entries(typeCounts).forEach(([type, count]) => {
        percentages[type] = Math.round((count / total) * 100)
      })

      const resultData = {
        dominantType,
        percentages,
        recommendedContentTypes: getRecommendedContentTypes(dominantType),
      }

      setResult(resultData)
      setIsCompleted(true)

      // Store result in localStorage for use in other routes
      localStorage.setItem("brainTypeResult", JSON.stringify(resultData))
    }
  }

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1)
    }
  }

  const handleRestart = () => {
    setCurrentStep(0)
    setAnswers({})
    setIsCompleted(false)
    setResult(null)
    // New questions will be selected via the useEffect when isCompleted changes
  }

  const getRecommendedContentTypes = (dominantType) => {
    switch (dominantType) {
      case "visual":
        return ["Diagrams", "Charts", "Videos", "Infographics", "Mind maps"]
      case "auditory":
        return ["Lectures", "Podcasts", "Discussions", "Audio explanations", "Verbal quizzes"]
      case "kinesthetic":
        return [
          "Hands-on exercises",
          "Interactive simulations",
          "Physical models",
          "Role-playing activities",
          "Experiments",
        ]
      case "reading":
        return ["Detailed texts", "Written guides", "Note-taking exercises", "Case studies", "Research papers"]
      default:
        return ["Mixed content types"]
    }
  }

  const getTypeLabel = (type) => {
    switch (type) {
      case "visual":
        return "Visual Learner"
      case "auditory":
        return "Auditory Learner"
      case "kinesthetic":
        return "Kinesthetic Learner"
      case "reading":
        return "Reading/Writing Learner"
      default:
        return "Mixed Learner"
    }
  }

  const getTypeDescription = (type) => {
    switch (type) {
      case "visual":
        return "You learn best through visual aids such as diagrams, charts, and demonstrations. You often think in pictures and prefer to see information represented visually rather than explained verbally."
      case "auditory":
        return "You learn best through listening and speaking. You benefit from lectures, discussions, and verbal explanations. You often process information by talking through it."
      case "kinesthetic":
        return "You learn best through hands-on experiences and physical engagement. You prefer practical applications and learn effectively by doing rather than watching or listening."
      case "reading":
        return "You learn best through reading and writing. You enjoy working with text, taking detailed notes, and processing information through written words."
      default:
        return "You have a balanced learning style that incorporates multiple approaches."
    }
  }

  const handleViewRecommendations = () => {
    router.push("/recommendations")
  }

  const currentQuestion = selectedQuestions[currentStep]
  const currentAnswer = answers[currentQuestion?.id]
  const isOptionSelected = Boolean(currentAnswer)

  const progress = Math.round((currentStep / selectedQuestions.length) * 100)

  if (isCompleted && result) {
    return (
      <div className="max-w-3xl mx-auto p-6 bg-white rounded-xl shadow-lg">
        <div className="text-center mb-8">
          <div className="inline-flex p-3 rounded-full bg-blue-100 mb-4">
            <Brain size={32} className="text-blue-600" />
          </div>
          <h1 className="text-2xl font-bold text-gray-800">Your Brain Type Results</h1>
          <p className="text-gray-600 mt-2">Based on your responses, we've identified your primary learning style</p>
        </div>

        <div className="bg-blue-50 p-6 rounded-lg mb-8">
          <h2 className="text-xl font-semibold text-blue-800">
            You are primarily a {getTypeLabel(result.dominantType)}
          </h2>
          <p className="mt-3">{getTypeDescription(result.dominantType)}</p>
        </div>

        <div className="mb-8">
          <h3 className="text-lg font-medium mb-4">Your Learning Style Breakdown</h3>
          <div className="space-y-4">
            {Object.entries(result.percentages).map(([type, percentage]) => (
              <div key={type}>
                <div className="flex justify-between mb-1">
                  <span className="text-sm font-medium">{getTypeLabel(type)}</span>
                  <span className="text-sm">{percentage}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className={`h-2 rounded-full ${
                      type === "visual"
                        ? "bg-blue-600"
                        : type === "auditory"
                          ? "bg-green-600"
                          : type === "kinesthetic"
                            ? "bg-purple-600"
                            : "bg-amber-600"
                    }`}
                    style={{ width: `${percentage}%` }}
                  ></div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="mb-8">
          <h3 className="text-lg font-medium mb-4">Recommended Content Types</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {result.recommendedContentTypes.map((contentType, index) => (
              <div key={index} className="flex items-center p-3 bg-gray-50 rounded-lg">
                <CheckCircle size={18} className="text-green-600 mr-2" />
                <span>{contentType}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="flex flex-col sm:flex-row justify-center gap-4">
          <button
            onClick={handleRestart}
            className="px-6 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300 transition-colors"
          >
            Retake Assessment
          </button>
          <button
            onClick={handleViewRecommendations}
            className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors flex items-center justify-center"
          >
            View Personalized Content
            <ArrowRight size={18} className="ml-2" />
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-3xl mx-auto p-6 bg-white rounded-xl shadow-lg">
      <div className="mb-6">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium">
            Question {currentStep + 1} of {selectedQuestions.length}
          </span>
          <span className="text-sm font-medium">{progress}% Complete</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div className="bg-blue-600 h-2 rounded-full transition-all" style={{ width: `${progress}%` }}></div>
        </div>
      </div>

      <div className="mb-8">
        <h2 className="text-xl font-semibold mb-6">{currentQuestion?.text}</h2>

        <div className="space-y-3">
          {currentQuestion?.options.map((option) => (
            <div
              key={option.id}
              onClick={() => handleSelectOption(currentQuestion.id, option.id, option.type)}
              className={`p-4 border rounded-lg cursor-pointer transition-colors ${
                currentAnswer?.optionId === option.id
                  ? "border-blue-500 bg-blue-50"
                  : "border-gray-200 hover:border-blue-300"
              }`}
            >
              <div className="flex items-center">
                <div
                  className={`w-5 h-5 rounded-full border flex items-center justify-center ${
                    currentAnswer?.optionId === option.id ? "border-blue-500 bg-blue-100" : "border-gray-300"
                  }`}
                >
                  {currentAnswer?.optionId === option.id && <div className="w-3 h-3 rounded-full bg-blue-500"></div>}
                </div>
                <span className="ml-3">{option.text}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="flex justify-between">
        <button
          onClick={handlePrevious}
          disabled={currentStep === 0}
          className={`px-4 py-2 rounded-md ${
            currentStep === 0
              ? "bg-gray-100 text-gray-400 cursor-not-allowed"
              : "bg-gray-100 text-gray-700 hover:bg-gray-200"
          }`}
        >
          Previous
        </button>

        <button
          onClick={handleNext}
          disabled={!isOptionSelected}
          className={`px-6 py-2 rounded-md flex items-center ${
            isOptionSelected ? "bg-blue-600 text-white hover:bg-blue-700" : "bg-blue-300 text-white cursor-not-allowed"
          }`}
        >
          {currentStep < selectedQuestions.length - 1 ? (
            <>
              Next
              <ChevronRight size={18} className="ml-1" />
            </>
          ) : (
            <>
              Finish Assessment
              <ArrowRight size={18} className="ml-1" />
            </>
          )}
        </button>
      </div>
    </div>
  )
}

export default BrainTypeAssessment

