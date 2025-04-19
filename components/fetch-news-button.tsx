"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { useToast } from "@/hooks/use-toast"
import { Search } from "lucide-react"
import { useRouter } from "next/navigation"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"

export function FetchNewsButton() {
  const [isOpen, setIsOpen] = useState(false)
  const [isFetching, setIsFetching] = useState(false)
  const [daysBack, setDaysBack] = useState(7)
  const { toast } = useToast()
  const router = useRouter()

  const handleFetchNews = async () => {
    setIsFetching(true)

    try {
      const response = await fetch("/api/news/fetch", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ daysBack }),
      })

      // Get the raw text response first
      const rawText = await response.text()

      // Try to parse as JSON
      let data
      try {
        data = JSON.parse(rawText)
      } catch (parseError) {
        console.error("Failed to parse response as JSON:", parseError)
        console.error("Raw response:", rawText)
        throw new Error(`Server returned invalid JSON: ${rawText.substring(0, 100)}...`)
      }

      if (!response.ok) {
        throw new Error(data.message || "Failed to fetch news")
      }

      // Calculate total articles inserted
      const totalInserted =
        data.results?.reduce((sum: number, result: any) => {
          return sum + (result.inserted || 0)
        }, 0) || 0

      toast({
        title: "News Articles Fetched",
        description: `Successfully fetched ${totalInserted} new articles for ${data.companiesProcessed || 0} companies.`,
      })

      // Close the dialog
      setIsOpen(false)

      // Refresh the page to show the new articles
      router.refresh()
    } catch (error) {
      console.error("Error fetching news:", error)
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to fetch news articles. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsFetching(false)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className="flex items-center gap-2">
          <Search className="h-4 w-4" />
          Fetch News Articles
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Fetch News Articles</DialogTitle>
          <DialogDescription>
            Search for news articles about your tracked companies. This may take a moment.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="daysBack" className="text-right">
              Days Back
            </Label>
            <Input
              id="daysBack"
              type="number"
              min="1"
              max="30"
              value={daysBack}
              onChange={(e) => setDaysBack(Number.parseInt(e.target.value))}
              className="col-span-3"
            />
          </div>
        </div>
        <DialogFooter>
          <Button onClick={handleFetchNews} disabled={isFetching}>
            {isFetching ? "Fetching..." : "Fetch News"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
