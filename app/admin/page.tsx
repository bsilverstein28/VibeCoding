import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ArrowLeft, Calendar } from "lucide-react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import ResearchAgent from "@/components/research-agent"
import { getAvailableModels } from "@/lib/ai-models"
import { getConsensusPicksForToday } from "@/lib/research-service"
import { getRecentResearchRuns } from "@/lib/database-service"
import { format } from "date-fns"
import PickResultManager from "@/components/pick-result-manager"
import CronStatus from "@/components/cron-status"

export default async function AdminPage() {
  // In a real implementation, you would check for admin authentication here

  // Get available AI models
  const availableModels = await getAvailableModels()

  // Get today's picks
  const todaysPicks = await getConsensusPicksForToday()

  // Get recent research runs
  const recentRuns = await getRecentResearchRuns(10)

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-gradient-to-r from-blue-600 to-blue-800 text-white py-8">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between">
            <h1 className="text-3xl font-bold">Admin Dashboard</h1>
            <Button asChild variant="outline" className="border-white hover:bg-emerald-600 text-white hover:text-white">
              <Link href="/">
                <ArrowLeft className="mr-1 h-4 w-4" /> Back to Site
              </Link>
            </Button>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <Tabs defaultValue="research" className="w-full">
          <TabsList className="grid w-full grid-cols-4 mb-8">
            <TabsTrigger value="research">Research</TabsTrigger>
            <TabsTrigger value="picks">Today's Picks</TabsTrigger>
            <TabsTrigger value="history">History</TabsTrigger>
            <TabsTrigger value="settings">Settings</TabsTrigger>
          </TabsList>

          <TabsContent value="research">
            <div className="grid gap-6">
              <ResearchAgent />

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Available AI Models</CardTitle>
                    <CardDescription>
                      The following AI models are available for research based on your API keys
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {availableModels.length > 0 ? (
                        <ul className="space-y-2">
                          {availableModels.map((model, index) => (
                            <li key={index} className="flex items-center gap-2">
                              <span className="w-3 h-3 bg-green-500 rounded-full"></span>
                              <span className="font-medium">{model.name}</span>
                              <span className="text-sm text-gray-500">({model.provider})</span>
                              {model.name === "Sonar Deep Research" && (
                                <span className="text-xs bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full">
                                  Default
                                </span>
                              )}
                            </li>
                          ))}
                        </ul>
                      ) : (
                        <p className="text-amber-600">
                          No AI models available. Please check your API keys in the environment variables.
                        </p>
                      )}
                    </div>
                  </CardContent>
                </Card>

                <CronStatus />
              </div>
            </div>
          </TabsContent>

          <TabsContent value="picks">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Calendar className="mr-2 h-5 w-5" />
                  Today's Picks
                </CardTitle>
                <CardDescription>Manage today's consensus picks and update their results</CardDescription>
              </CardHeader>
              <CardContent>
                <Tabs defaultValue="spreads" className="w-full">
                  <TabsList className="grid w-full grid-cols-3 mb-4">
                    <TabsTrigger value="spreads">Game Spreads</TabsTrigger>
                    <TabsTrigger value="totals">Over/Unders</TabsTrigger>
                    <TabsTrigger value="props">Player Props</TabsTrigger>
                  </TabsList>

                  <TabsContent value="spreads">
                    <div className="space-y-4">
                      {todaysPicks.spreads.length > 0 ? (
                        todaysPicks.spreads.map((pick) => (
                          <Card key={pick.id}>
                            <CardContent className="p-4">
                              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                                <div className="flex-1">
                                  <h3 className="font-semibold">{pick.title}</h3>
                                  <p className="text-sm text-gray-600">{pick.pick}</p>
                                  <p className="text-xs text-gray-500 mt-1">
                                    Consensus: {pick.consensus_strength || pick.consensusStrength}%
                                  </p>
                                </div>
                                <PickResultManager pickId={pick.id} currentResult={pick.result} />
                              </div>
                            </CardContent>
                          </Card>
                        ))
                      ) : (
                        <p className="text-center py-4 text-gray-500">No spread picks found for today.</p>
                      )}
                    </div>
                  </TabsContent>

                  <TabsContent value="totals">
                    <div className="space-y-4">
                      {todaysPicks.totals.length > 0 ? (
                        todaysPicks.totals.map((pick) => (
                          <Card key={pick.id}>
                            <CardContent className="p-4">
                              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                                <div className="flex-1">
                                  <h3 className="font-semibold">{pick.title}</h3>
                                  <p className="text-sm text-gray-600">{pick.pick}</p>
                                  <p className="text-xs text-gray-500 mt-1">
                                    Consensus: {pick.consensus_strength || pick.consensusStrength}%
                                  </p>
                                </div>
                                <PickResultManager pickId={pick.id} currentResult={pick.result} />
                              </div>
                            </CardContent>
                          </Card>
                        ))
                      ) : (
                        <p className="text-center py-4 text-gray-500">No total picks found for today.</p>
                      )}
                    </div>
                  </TabsContent>

                  <TabsContent value="props">
                    <div className="space-y-4">
                      {todaysPicks.playerProps.length > 0 ? (
                        todaysPicks.playerProps.map((pick) => (
                          <Card key={pick.id}>
                            <CardContent className="p-4">
                              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                                <div className="flex-1">
                                  <h3 className="font-semibold">{pick.title}</h3>
                                  <p className="text-sm text-gray-600">{pick.pick}</p>
                                  <p className="text-xs text-gray-500 mt-1">
                                    Consensus: {pick.consensus_strength || pick.consensusStrength}%
                                  </p>
                                </div>
                                <PickResultManager pickId={pick.id} currentResult={pick.result} />
                              </div>
                            </CardContent>
                          </Card>
                        ))
                      ) : (
                        <p className="text-center py-4 text-gray-500">No player prop picks found for today.</p>
                      )}
                    </div>
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="history">
            <Card>
              <CardHeader>
                <CardTitle>Research History</CardTitle>
                <CardDescription>View past research runs and their results</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="border rounded-md overflow-hidden">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Date
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Target Date
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Model
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Picks
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Duration
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Status
                          </th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {recentRuns.map((run) => (
                          <tr key={run.id}>
                            <td className="px-6 py-4 whitespace-nowrap text-sm">
                              {format(new Date(run.run_date), "MMM dd, yyyy HH:mm")}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm">
                              {format(new Date(run.target_date), "MMM dd, yyyy")}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm">{run.model_used}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm">{run.pick_count}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm">
                              {run.duration_ms ? `${(run.duration_ms / 1000).toFixed(1)}s` : "-"}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm">
                              <span
                                className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                                  run.status === "completed"
                                    ? "bg-green-100 text-green-800"
                                    : run.status === "in_progress"
                                      ? "bg-blue-100 text-blue-800"
                                      : "bg-red-100 text-red-800"
                                }`}
                              >
                                {run.status}
                              </span>
                            </td>
                          </tr>
                        ))}
                        {recentRuns.length === 0 && (
                          <tr>
                            <td colSpan={6} className="px-6 py-4 text-center text-sm text-gray-500">
                              No research runs found
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="settings">
            <Card>
              <CardHeader>
                <CardTitle>Research Settings</CardTitle>
                <CardDescription>Configure how the AI research process works</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <h3 className="text-lg font-medium mb-2">Betting Sites</h3>
                    <p className="text-sm text-gray-500 mb-4">
                      The following betting sites are included in the research process
                    </p>
                    <ul className="space-y-2 text-sm">
                      <li>ESPN Betting (https://www.espn.com/betting/nba/)</li>
                      <li>Action Network (https://www.actionnetwork.com/nba/picks)</li>
                      <li>CBS Sports (https://www.cbssports.com/nba/picks/)</li>
                      <li>The Athletic (https://theathletic.com/nba/betting/)</li>
                      <li>Vegas Insider (https://www.vegasinsider.com/nba/odds/las-vegas/)</li>
                      <li>Covers (https://www.covers.com/nba/picks-predictions)</li>
                      <li>Odds Shark (https://www.oddsshark.com/nba)</li>
                      <li>Sporting News (https://www.sportingnews.com/us/nba)</li>
                      <li>Rotogrinders (https://rotogrinders.com/sports/nba)</li>
                      <li>Bleacher Report (https://bleacherreport.com/nba-betting)</li>
                    </ul>
                  </div>

                  <div>
                    <h3 className="text-lg font-medium mb-2">Research Schedule</h3>
                    <p className="text-sm text-gray-500 mb-2">
                      The research process runs automatically at the following time:
                    </p>
                    <ul className="space-y-1 text-sm">
                      <li>• Daily at 11:00 AM EST - Daily research</li>
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
