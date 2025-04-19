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
      // Make the API request
      const response = await fetch("/api/summaries/generate-simple", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
      })

      // Check if the response is OK
      if (!response.ok) {
        throw new Error(`Server error: ${response.status}`)
      }

      // Parse the JSON response
      const data = await response.json()

      // Show success message
      toast({
        title: "Summary Generated",
        description: `Successfully created a summary based on ${data.articleCount || 0} articles.`,
      })

      // Refresh the page to show the new summary
      router.refresh()
    } catch (error) {
      console.error("Error generating summary:", error)
      toast({
        title: "Error",
        description: "Failed to generate summary. Please try again later.",
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
