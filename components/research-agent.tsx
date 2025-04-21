"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Bot, Check, Loader2 } from "lucide-react"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { DatePicker } from "@/components/ui/date-picker"
import { format } from "date-fns"
import { Badge } from "@/components/ui/badge"
import TriggerResearch from "./trigger-research"

// Mock available models for client-side rendering
// In a real implementation, you would fetch this from an API endpoint
const AVAILABLE_MODELS = [
  { name: "Perplexity Sonar Pro", provider: "Perplexity AI" },
  { name: "GPT-4o", provider: "OpenAI" },
  { name: "Gemini 1.5 Pro", provider: "Google" },
  { name: "DeepSeek R1", provider: "DeepInfra" },
]

export default function ResearchAgent() {
  const [isResearching, setIsResearching] = useState(false)
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date())
  const [customPrompt, setCustomPrompt] = useState("")
  const [researchResults, setResearchResults] = useState<string | null>(null)
  const [selectedModel, setSelectedModel] = useState<string | null>("Perplexity Sonar Pro") // Default to Perplexity Sonar Pro

  const handleResearch = async (type = "custom") => {
    setIsResearching(true)
    setResearchResults(null)

    try {
      // Format the date for the API
      const formattedDate = selectedDate ? format(selectedDate, "yyyy-MM-dd") : format(new Date(), "yyyy-MM-dd")

      // In a real implementation, this would call your API to perform the research
      const response = await fetch("/api/research", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          type: type === "custom" ? "all" : type,
          date: formattedDate,
          model: selectedModel,
          customPrompt: type === "custom" ? customPrompt : undefined,
        }),
      })

      if (!response.ok) {
        throw new Error(`API error: ${response.status}`)
      }

      const data = await response.json()

      // Get a summary of the research
      const summaryResponse = await fetch("/api/summarize", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          picks: data.picks,
          type: type === "custom" ? "all" : type,
        }),
      })

      if (!summaryResponse.ok) {
        throw new Error(`Summary API error: ${summaryResponse.status}`)
      }

      const summaryData = await summaryResponse.json()

      setResearchResults(summaryData.summary)
    } catch (error) {
      console.error("Research error:", error)
      setResearchResults("An error occurred while performing research. Please try again.")
    } finally {
      setIsResearching(false)
    }
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center">
          <Bot className="mr-2 h-5 w-5 text-emerald-600" />
          Research Agent
        </CardTitle>
        <CardDescription>Use AI to research and analyze betting picks across multiple websites</CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="quick" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="quick">Quick Research</TabsTrigger>
            <TabsTrigger value="custom">Custom Research</TabsTrigger>
            <TabsTrigger value="manual">Manual Trigger</TabsTrigger>
          </TabsList>

          <TabsContent value="quick" className="space-y-4">
            <div className="flex flex-col space-y-2">
              <Label htmlFor="date">Date to Research</Label>
              <DatePicker date={selectedDate} setDate={setSelectedDate} className="w-full" />
            </div>

            <div className="space-y-2">
              <Label>AI Model</Label>
              <div className="flex flex-wrap gap-2">
                {AVAILABLE_MODELS.map((model) => (
                  <Badge
                    key={model.name}
                    variant={selectedModel === model.name ? "default" : "outline"}
                    className={
                      selectedModel === model.name
                        ? "bg-emerald-600"
                        : "hover:bg-emerald-600 hover:text-white cursor-pointer"
                    }
                    onClick={() => setSelectedModel(model.name)}
                  >
                    {selectedModel === model.name && <Check className="mr-1 h-3 w-3" />}
                    {model.name} ({model.provider})
                  </Badge>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Button
                variant="outline"
                className="w-full hover:bg-emerald-600 hover:text-white"
                onClick={() => handleResearch("spreads")}
                disabled={isResearching}
              >
                Research Game Spreads
              </Button>
              <Button
                variant="outline"
                className="w-full hover:bg-emerald-600 hover:text-white"
                onClick={() => handleResearch("totals")}
                disabled={isResearching}
              >
                Research Over/Unders
              </Button>
              <Button
                variant="outline"
                className="w-full hover:bg-emerald-600 hover:text-white"
                onClick={() => handleResearch("props")}
                disabled={isResearching}
              >
                Research Player Props
              </Button>
            </div>
          </TabsContent>

          <TabsContent value="custom" className="space-y-4">
            <div className="flex flex-col space-y-2">
              <Label htmlFor="date">Date to Research</Label>
              <DatePicker date={selectedDate} setDate={setSelectedDate} className="w-full" />
            </div>

            <div className="space-y-2">
              <Label>AI Model</Label>
              <div className="flex flex-wrap gap-2">
                {AVAILABLE_MODELS.map((model) => (
                  <Badge
                    key={model.name}
                    variant={selectedModel === model.name ? "default" : "outline"}
                    className={
                      selectedModel === model.name
                        ? "bg-emerald-600"
                        : "hover:bg-emerald-600 hover:text-white cursor-pointer"
                    }
                    onClick={() => setSelectedModel(model.name)}
                  >
                    {selectedModel === model.name && <Check className="mr-1 h-3 w-3" />}
                    {model.name} ({model.provider})
                  </Badge>
                ))}
              </div>
            </div>

            <div className="flex flex-col space-y-2">
              <Label htmlFor="prompt">Custom Research Instructions</Label>
              <Textarea
                id="prompt"
                placeholder="E.g., Find consensus picks for NBA games where home teams are underdogs..."
                value={customPrompt}
                onChange={(e) => setCustomPrompt(e.target.value)}
                rows={4}
                className="resize-none"
              />
            </div>

            <Button
              className="w-full bg-emerald-600 hover:bg-emerald-700"
              onClick={() => handleResearch()}
              disabled={isResearching}
            >
              {isResearching ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Researching...
                </>
              ) : (
                "Start Custom Research"
              )}
            </Button>
          </TabsContent>

          <TabsContent value="manual" className="space-y-4">
            <TriggerResearch />
          </TabsContent>
        </Tabs>

        {isResearching && (
          <div className="mt-6 text-center">
            <Loader2 className="h-8 w-8 animate-spin mx-auto text-emerald-600" />
            <p className="mt-2 text-sm text-gray-500">Researching betting picks across multiple websites...</p>
          </div>
        )}

        {researchResults && (
          <div className="mt-6">
            <h3 className="text-lg font-semibold mb-2">Research Results</h3>
            <div className="bg-gray-50 p-4 rounded-md whitespace-pre-line">{researchResults}</div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
