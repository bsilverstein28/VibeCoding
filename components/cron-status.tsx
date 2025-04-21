"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Loader2, RefreshCw } from "lucide-react"
import { toast } from "@/components/ui/use-toast"
import { triggerCronJobAction } from "@/app/actions"

export default function CronStatus() {
  const [isLoading, setIsLoading] = useState(false)
  const [lastRun, setLastRun] = useState<string | null>(null)

  const triggerManualRun = async () => {
    setIsLoading(true)
    try {
      const result = await triggerCronJobAction()

      if (result.success) {
        toast({
          title: "Cron job triggered successfully",
          description: `Found ${result.data.pickCount.total} consensus picks for ${result.data.date}`,
        })
      } else {
        throw new Error(result.error)
      }

      setLastRun(new Date().toLocaleTimeString())
    } catch (error) {
      console.error("Error triggering cron job:", error)
      toast({
        title: "Error triggering cron job",
        description: error instanceof Error ? error.message : "Unknown error",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Scheduled Jobs</CardTitle>
        <CardDescription>Status of automated research jobs</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="flex flex-col space-y-2">
            <h3 className="text-sm font-medium">Daily Research Schedule</h3>
            <ul className="text-sm text-gray-500">
              <li>• 11:00 AM EST - Daily research run</li>
            </ul>
          </div>

          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-medium">Manual Trigger</h3>
              {lastRun && <p className="text-xs text-gray-500">Last triggered: {lastRun}</p>}
            </div>
            <Button variant="outline" size="sm" onClick={triggerManualRun} disabled={isLoading}>
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Running...
                </>
              ) : (
                <>
                  <RefreshCw className="mr-2 h-4 w-4" />
                  Run Now
                </>
              )}
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
