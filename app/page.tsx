import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { Button } from "@/components/ui/button"
import { Brain, ArrowRight, BookOpen, Video, Headphones, Dumbbell } from "lucide-react"
import Link from "next/link"

export default async function Home() {
  const session = await getServerSession(authOptions)

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-gray-50">
      <div className="container mx-auto px-4 py-16">
        <div className="text-center mb-16">
          <div className="inline-flex p-4 rounded-full bg-blue-100 mb-4">
            <Brain className="h-8 w-8 text-blue-600" />
          </div>
          <h1 className="text-4xl md:text-5xl font-bold mb-6 bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-purple-600">
            Discover Your Learning Style
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto mb-8">
            Take our brain type assessment to understand how you learn best and get personalized content
            recommendations.
          </p>
          <div className="flex justify-center gap-4">
            {session ? (
              <Link href="/assessment">
                <Button size="lg" className="text-lg px-8">
                  Take Assessment <ArrowRight className="ml-2" />
                </Button>
              </Link>
            ) : (
              <Link href="/api/auth/signin">
                <Button size="lg" className="text-lg px-8">
                  Sign in to Start <ArrowRight className="ml-2" />
                </Button>
              </Link>
            )}
          </div>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 max-w-6xl mx-auto">
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
            <div className="inline-flex p-3 rounded-full bg-blue-50 mb-4">
              <Video className="h-6 w-6 text-blue-600" />
            </div>
            <h3 className="text-lg font-semibold mb-2">Visual Learners</h3>
            <p className="text-gray-600">
              Learn through seeing and visualizing information with diagrams, charts, and videos.
            </p>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
            <div className="inline-flex p-3 rounded-full bg-green-50 mb-4">
              <Headphones className="h-6 w-6 text-green-600" />
            </div>
            <h3 className="text-lg font-semibold mb-2">Auditory Learners</h3>
            <p className="text-gray-600">
              Process information best through listening, discussions, and verbal instructions.
            </p>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
            <div className="inline-flex p-3 rounded-full bg-purple-50 mb-4">
              <Dumbbell className="h-6 w-6 text-purple-600" />
            </div>
            <h3 className="text-lg font-semibold mb-2">Kinesthetic Learners</h3>
            <p className="text-gray-600">Learn by doing, experiencing, and hands-on activities.</p>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
            <div className="inline-flex p-3 rounded-full bg-amber-50 mb-4">
              <BookOpen className="h-6 w-6 text-amber-600" />
            </div>
            <h3 className="text-lg font-semibold mb-2">Reading/Writing Learners</h3>
            <p className="text-gray-600">Prefer learning through reading and writing text-based content.</p>
          </div>
        </div>
      </div>
    </div>
  )
}

