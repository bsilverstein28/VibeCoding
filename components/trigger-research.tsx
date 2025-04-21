"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { DatePicker } from "@/components/ui/date-picker"
import { Label } from "@/components/ui/label"
import { Loader2 } from "lucide-react"
import { format } from "date-fns"
import { triggerResearchAction } from "@/app/actions"
import { toast } from "@/components/ui/use-toast"

export default function TriggerResearch() {
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date())
  const [isResearching, setIsResearching] = useState(false)

  const handleTriggerResearch = async () => {
    if (!selectedDate) return

    setIsResearching(true)
    try {
      const formattedDate = format(selectedDate, "yyyy-MM-dd")
      const result = await triggerResearchAction(formattedDate)

      if (result.success) {
        toast({
          title: "Research triggered",
          description: `Research for ${format(selectedDate, "MMM dd, yyyy")} has been triggered successfully`,
        })
      } else {
        toast({
          title: "Error",
          description: result.error || "Failed to trigger research",
          variant: "destructive",
        })
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "An unexpected error occurred",
        variant: "destructive",
      })
    } finally {
      setIsResearching(false)
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col space-y-2">
        <Label htmlFor="date">Date to Research</Label>
        <DatePicker date={selectedDate} setDate={setSelectedDate} className="w-full" />
      </div>

      <Button className="w-full" onClick={handleTriggerResearch} disabled={isResearching || !selectedDate}>
        {isResearching ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Researching...
          </>
        ) : (
          "Trigger Research Now"
        )}
      </Button>
    </div>
  )
}
