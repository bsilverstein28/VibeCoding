import { Suspense } from "react"
import ConsensusPicksDisplay from "@/components/consensus-picks-display"
import LoadingConsensus from "@/components/loading-consensus"
import { Button } from "@/components/ui/button"
import { ArrowRight, Calendar, TrendingUp } from "lucide-react"
import Link from "next/link"

export default function Home() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-blue-900 to-indigo-800 text-white py-16">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center">
            <h1 className="text-4xl md:text-5xl font-bold mb-4">NBA Consensus Picks</h1>
            <p className="text-xl mb-8">
              AI-powered research across multiple betting sites to find the strongest consensus picks
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button asChild size="lg" className="bg-emerald-600 hover:bg-emerald-700">
                <Link href="#today-picks">
                  Today's Picks <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
              <Button asChild size="lg" className="bg-amber-500 hover:bg-amber-600 text-white">
                <Link href="/history">
                  <Calendar className="mr-2 h-4 w-4" /> Historical Results
                </Link>
              </Button>
              <Button asChild size="lg" className="bg-sky-500 hover:bg-sky-600 text-white">
                <Link href="/admin">Admin Dashboard</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <section id="today-picks" className="py-12 container mx-auto px-4">
        <div className="mb-8">
          <h2 className="text-3xl font-bold mb-2 flex items-center">
            <TrendingUp className="mr-2 h-6 w-6 text-emerald-600" />
            Today's Consensus Picks
          </h2>
          <p className="text-gray-600">Updated daily with AI-researched consensus picks from top betting analysts</p>
        </div>

        <Suspense fallback={<LoadingConsensus />}>
          <ConsensusPicksDisplay />
        </Suspense>
      </section>

      {/* How It Works */}
      <section className="py-12 bg-gray-100">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold mb-8 text-center">How It Works</h2>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-white p-6 rounded-lg shadow-md">
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mb-4">
                <span className="text-blue-800 font-bold text-xl">1</span>
              </div>
              <h3 className="text-xl font-semibold mb-2">AI Research</h3>
              <p className="text-gray-600">
                Our AI agents scan multiple betting websites daily to collect expert picks and analysis.
              </p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-md">
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mb-4">
                <span className="text-blue-800 font-bold text-xl">2</span>
              </div>
              <h3 className="text-xl font-semibold mb-2">Consensus Analysis</h3>
              <p className="text-gray-600">
                We identify picks that have strong agreement across multiple reputable sources.
              </p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-md">
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mb-4">
                <span className="text-blue-800 font-bold text-xl">3</span>
              </div>
              <h3 className="text-xl font-semibold mb-2">Detailed Summaries</h3>
              <p className="text-gray-600">
                Each consensus pick includes rationale, confidence level, and links to original sources.
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
