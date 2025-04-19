"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { useToast } from "@/hooks/use-toast"
import { Sparkles } from "lucide-react"
import { useRouter } from "next/navigation"

export function GenerateSummaryButton() {
  const [isGenerating, setIsGenerating] = useState(false)
  const { toast } = useToast()
  const router = useRouter()

  const handleGenerateSummary = async () => {
    setIsGenerating(true)

    try {
      // First, make the request with explicit error handling
      const response = await fetch("/api/summaries/generate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify({}), // Empty object to generate for all companies
      })

      // Get the raw text response first
      const rawText = await response.text()

      // Check if the response starts with HTML or error messages
      if (rawText.trim().startsWith("<") || rawText.includes("Internal server error")) {
        console.error("Server returned HTML or error page instead of JSON:", rawText.substring(0, 200))
        throw new Error("Server error: The API returned an HTML response instead of JSON")
      }

      // Try to parse as JSON
      let data
      try {
        data = JSON.parse(rawText)
      } catch (parseError) {
        console.error("Failed to parse response as JSON:", parseError)
        console.error("Raw response:", rawText.substring(0, 200))
        throw new Error("Server returned invalid JSON response")
      }

      // Check if the response was successful
      if (!response.ok) {
        throw new Error(data?.message || `Error ${response.status}: ${response.statusText}`)
      }

      const aiNote = data.usedAI === false ? " (using fallback method)" : ""

      toast({
        title: "Summary Generated",
        description: `Successfully created a summary based on ${data.articleCount} articles${aiNote}.`,
      })

      // Refresh the page to show the new summary
      router.refresh()
    } catch (error) {
      console.error("Error generating summary:", error)
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to generate summary. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsGenerating(false)
    }
  }

  return (
    <Button onClick={handleGenerateSummary} disabled={isGenerating} className="flex items-center gap-2">
      <Sparkles className="h-4 w-4" />
      {isGenerating ? "Generating..." : "Generate AI Summary"}
    </Button>
  )
}
