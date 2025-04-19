"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { AlertCircle, ChevronDown, ChevronUp } from "lucide-react"

export function EmailConfigDebugger() {
  const [isOpen, setIsOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [configData, setConfigData] = useState<any>(null)

  const checkConfig = async () => {
    setIsLoading(true)
    try {
      const response = await fetch("/api/debug/email-config")
      const data = await response.json()
      setConfigData(data)
    } catch (error) {
      console.error("Error checking email config:", error)
      setConfigData({ error: "Failed to check email configuration" })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Card className="mt-6 border-dashed border-yellow-500">
      <CardHeader className="cursor-pointer" onClick={() => setIsOpen(!isOpen)}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <AlertCircle className="h-5 w-5 text-yellow-500" />
            <CardTitle className="text-base">Email Configuration Debugger</CardTitle>
          </div>
          {isOpen ? <ChevronUp className="h-5 w-5" /> : <ChevronDown className="h-5 w-5" />}
        </div>
        <CardDescription>Troubleshoot email configuration issues</CardDescription>
      </CardHeader>

      {isOpen && (
        <>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-4">
              This tool checks your email configuration settings and helps diagnose any issues.
            </p>

            {configData && (
              <div className="bg-muted p-3 rounded-md text-sm font-mono overflow-auto max-h-60">
                <pre>{JSON.stringify(configData, null, 2)}</pre>
              </div>
            )}
          </CardContent>
          <CardFooter>
            <Button onClick={checkConfig} disabled={isLoading} variant="outline">
              {isLoading ? "Checking..." : "Check Email Configuration"}
            </Button>
          </CardFooter>
        </>
      )}
    </Card>
  )
}
