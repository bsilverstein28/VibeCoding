import { getConsensusPicksForToday } from "@/lib/research-service"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ExternalLink, ThumbsUp } from "lucide-react"
import Link from "next/link"

export default async function ConsensusPicksDisplay() {
  const consensusPicks = await getConsensusPicksForToday()

  return (
    <Tabs defaultValue="spreads" className="w-full">
      <TabsList className="grid w-full grid-cols-3">
        <TabsTrigger value="spreads">Game Spreads</TabsTrigger>
        <TabsTrigger value="totals">Over/Unders</TabsTrigger>
        <TabsTrigger value="props">Player Props</TabsTrigger>
      </TabsList>

      <TabsContent value="spreads">
        <div className="grid gap-6 md:grid-cols-2">
          {consensusPicks.spreads.map((pick) => (
            <PickCard key={pick.id} pick={pick} type="spread" />
          ))}
          {consensusPicks.spreads.length === 0 && (
            <div className="col-span-2 text-center py-12">
              <p className="text-gray-500">No consensus spread picks found for today.</p>
            </div>
          )}
        </div>
      </TabsContent>

      <TabsContent value="totals">
        <div className="grid gap-6 md:grid-cols-2">
          {consensusPicks.totals.map((pick) => (
            <PickCard key={pick.id} pick={pick} type="total" />
          ))}
          {consensusPicks.totals.length === 0 && (
            <div className="col-span-2 text-center py-12">
              <p className="text-gray-500">No consensus over/under picks found for today.</p>
            </div>
          )}
        </div>
      </TabsContent>

      <TabsContent value="props">
        <div className="grid gap-6 md:grid-cols-2">
          {consensusPicks.playerProps.map((pick) => (
            <PickCard key={pick.id} pick={pick} type="prop" />
          ))}
          {consensusPicks.playerProps.length === 0 && (
            <div className="col-span-2 text-center py-12">
              <p className="text-gray-500">No consensus player prop picks found for today.</p>
            </div>
          )}
        </div>
      </TabsContent>
    </Tabs>
  )
}

function PickCard({ pick, type }: { pick: any; type: "spread" | "total" | "prop" }) {
  // Ensure we have valid data for all fields
  const title = pick.title || "Unknown matchup"
  const matchup = pick.matchup || ""
  const pickText = pick.pick || "No pick available"
  const rationale = pick.rationale || "No rationale provided"
  const consensusStrength = pick.consensus_strength || pick.consensusStrength || 0
  const sources = pick.sources || []

  return (
    <Card>
      <CardHeader className="pb-2">
        <div className="flex justify-between items-start">
          <div>
            <CardTitle>{title}</CardTitle>
            <CardDescription>{matchup}</CardDescription>
          </div>
          <ConsensusStrengthBadge strength={consensusStrength} />
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div>
            <h4 className="font-medium text-sm text-gray-500 mb-1">The Pick</h4>
            <p className="text-lg font-semibold">{pickText}</p>
          </div>

          <div>
            <h4 className="font-medium text-sm text-gray-500 mb-1">Rationale</h4>
            <p className="text-sm">{rationale}</p>
          </div>

          <div>
            <h4 className="font-medium text-sm text-gray-500 mb-1">Sources ({sources.length})</h4>
            {sources.length > 0 ? (
              <ul className="space-y-1">
                {sources.map((source: any, index: number) => (
                  <li key={index} className="text-sm flex items-center">
                    <ExternalLink className="h-3 w-3 mr-1 text-gray-400" />
                    <Link
                      href={source.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:underline truncate"
                    >
                      {source.name}
                    </Link>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-sm text-gray-500">No sources available</p>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

function ConsensusStrengthBadge({ strength }: { strength: number }) {
  let color = "bg-gray-100 text-gray-800"
  let label = "Low Consensus"

  if (strength >= 80) {
    color = "bg-green-100 text-green-800"
    label = "Strong Consensus"
  } else if (strength >= 60) {
    color = "bg-blue-100 text-blue-800"
    label = "Moderate Consensus"
  }

  return (
    <Badge variant="outline" className={`${color} flex items-center gap-1`}>
      <ThumbsUp className="h-3 w-3" />
      {label} ({strength}%)
    </Badge>
  )
}
