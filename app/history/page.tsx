import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Calendar, ChevronLeft, TrendingUp } from "lucide-react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { getHistoricalResults } from "@/lib/research-service"

export default async function HistoryPage() {
  const historicalResults = await getHistoricalResults()

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-gradient-to-r from-blue-900 to-indigo-800 text-white py-8">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between">
            <h1 className="text-3xl font-bold flex items-center">
              <Calendar className="mr-2 h-6 w-6" />
              Historical Results
            </h1>
            <Button asChild variant="outline" className="text-white border-white hover:bg-white/10">
              <Link href="/">
                <ChevronLeft className="mr-1 h-4 w-4" /> Back to Today's Picks
              </Link>
            </Button>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h2 className="text-2xl font-bold mb-2 flex items-center">
            <TrendingUp className="mr-2 h-5 w-5 text-emerald-600" />
            Performance Tracking
          </h2>
          <p className="text-gray-600">Track how our consensus picks have performed over time</p>
        </div>

        <Tabs defaultValue="weekly" className="w-full">
          <TabsList className="grid w-full grid-cols-3 mb-8">
            <TabsTrigger value="weekly">Last 7 Days</TabsTrigger>
            <TabsTrigger value="monthly">Last 30 Days</TabsTrigger>
            <TabsTrigger value="season">Season to Date</TabsTrigger>
          </TabsList>

          <TabsContent value="weekly">
            <PerformanceStats stats={historicalResults.weekly} />
            <HistoricalPicksList picks={historicalResults.weekly.picks} />
          </TabsContent>

          <TabsContent value="monthly">
            <PerformanceStats stats={historicalResults.monthly} />
            <HistoricalPicksList picks={historicalResults.monthly.picks} />
          </TabsContent>

          <TabsContent value="season">
            <PerformanceStats stats={historicalResults.season} />
            <HistoricalPicksList
              picks={historicalResults.season.picks.slice(0, 10)}
              showViewMore={historicalResults.season.picks.length > 10}
            />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}

function PerformanceStats({ stats }: { stats: any }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-gray-500">Win-Loss Record</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-2xl font-bold">
            {stats.wins}-{stats.losses}
          </p>
          <p className="text-sm text-gray-500">({(stats.winPercentage * 100).toFixed(1)}% win rate)</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-gray-500">Spread Picks</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-2xl font-bold">{stats.spreadRecord}</p>
          <p className="text-sm text-gray-500">({(stats.spreadWinPercentage * 100).toFixed(1)}% win rate)</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-gray-500">Over/Under Picks</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-2xl font-bold">{stats.totalRecord}</p>
          <p className="text-sm text-gray-500">({(stats.totalWinPercentage * 100).toFixed(1)}% win rate)</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-gray-500">Player Props</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-2xl font-bold">{stats.propRecord}</p>
          <p className="text-sm text-gray-500">({(stats.propWinPercentage * 100).toFixed(1)}% win rate)</p>
        </CardContent>
      </Card>
    </div>
  )
}

function HistoricalPicksList({ picks, showViewMore = false }: { picks: any[]; showViewMore?: boolean }) {
  return (
    <div>
      <h3 className="text-xl font-bold mb-4">Recent Picks</h3>
      <div className="space-y-4">
        {picks.map((pick, index) => (
          <Card key={index}>
            <CardContent className="p-4">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <span
                      className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                        pick.result === "win" ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"
                      }`}
                    >
                      {pick.result === "win" ? "W" : "L"}
                    </span>
                    <p className="font-semibold">
                      {pick.date} - {pick.title}
                    </p>
                  </div>
                  <p className="text-sm text-gray-600 mt-1">{pick.pick}</p>
                </div>
                <div className="text-sm">
                  <span className="text-gray-500">Consensus: </span>
                  <span className="font-medium">{pick.consensusStrength}%</span>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {showViewMore && (
        <div className="mt-6 text-center">
          <Button variant="outline">View More Results</Button>
        </div>
      )}
    </div>
  )
}
