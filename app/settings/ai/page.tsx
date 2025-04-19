"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useToast } from "@/hooks/use-toast"
import { ArrowLeft, Key, Save } from "lucide-react"

export default function AISettingsPage() {
  const { toast } = useToast()
  const [apiKey, setApiKey] = useState("")
  const [isSaving, setIsSaving] = useState(false)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    // Check if we have an API key in localStorage (just for UI display)
    const storedKey = localStorage.getItem("openai_api_key_set")
    if (storedKey === "true") {
      setApiKey("••••••••••••••••••••••••••••••")
    }
    setIsLoading(false)
  }, [])

  const handleSave = async () => {
    setIsSaving(true)
    try {
      // Save to .env.local (this would be handled by a server endpoint in a real app)
      // For this demo, we'll just simulate success and store a flag in localStorage

      // In a real implementation, you would send the API key to a secure server endpoint
      // that would store it in environment variables or a secure vault

      // IMPORTANT: This is just for demonstration. In a real app, never store API keys in localStorage
      localStorage.setItem("openai_api_key_set", "true")

      toast({
        title: "API Key Saved",
        description: "Your OpenAI API key has been saved. Restart the application for changes to take effect.",
      })

      // Mask the API key in the UI
      setApiKey("••••••••••••••••••••••••••••••")
    } catch (error) {
      console.error("Error saving API key:", error)
      toast({
        title: "Error",
        description: "Failed to save API key",
        variant: "destructive",
      })
    } finally {
      setIsSaving(false)
    }
  }

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center">
          <Button asChild variant="ghost" size="sm" className="mr-4">
            <Link href="/settings">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Settings
            </Link>
          </Button>
          <h1 className="text-3xl font-bold">AI Settings</h1>
        </div>
        <Card>
          <CardHeader>
            <CardTitle>Loading...</CardTitle>
          </CardHeader>
          <CardContent>
            <p>Loading AI settings...</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center">
        <Button asChild variant="ghost" size="sm" className="mr-4">
          <Link href="/settings">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Settings
          </Link>
        </Button>
        <h1 className="text-3xl font-bold">AI Settings</h1>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>OpenAI API Configuration</CardTitle>
          <CardDescription>Configure your OpenAI API key to enable AI-powered summaries</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="apiKey">OpenAI API Key</Label>
            <div className="flex gap-2">
              <Input
                id="apiKey"
                type="password"
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                placeholder="sk-..."
                className="font-mono"
              />
            </div>
            <p className="text-sm text-muted-foreground">
              Your API key is stored securely and never shared. You can get an API key from{" "}
              <a
                href="https://platform.openai.com/api-keys"
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary hover:underline"
              >
                OpenAI's website
              </a>
              .
            </p>
          </div>

          <div className="space-y-2 rounded-md border p-4">
            <div className="flex items-center gap-2">
              <Key className="h-5 w-5 text-amber-500" />
              <h3 className="font-medium">Important Security Note</h3>
            </div>
            <p className="text-sm text-muted-foreground">
              In a production environment, API keys should be stored as environment variables on the server, not in the
              browser. For this demo, we're simulating the storage of your API key.
            </p>
          </div>
        </CardContent>
        <CardFooter>
          <Button
            onClick={handleSave}
            disabled={isSaving || !apiKey || apiKey.startsWith("•")}
            className="flex items-center gap-2"
          >
            <Save className="h-4 w-4" />
            {isSaving ? "Saving..." : "Save API Key"}
          </Button>
        </CardFooter>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>How to Set Up Your OpenAI API Key</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p>To properly set up your OpenAI API key for this application:</p>

          <ol className="list-decimal pl-5 space-y-2">
            <li>
              Create an account on{" "}
              <a
                href="https://platform.openai.com"
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary hover:underline"
              >
                OpenAI's platform
              </a>
            </li>
            <li>
              Navigate to the{" "}
              <a
                href="https://platform.openai.com/api-keys"
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary hover:underline"
              >
                API keys section
              </a>
            </li>
            <li>Create a new API key</li>
            <li>Add the API key to your environment variables:</li>
          </ol>

          <div className="bg-muted p-3 rounded-md font-mono text-sm">
            <p>OPENAI_API_KEY=your_api_key_here</p>
          </div>

          <p>
            For local development, add this to your <code>.env.local</code> file.
          </p>
          <p>For production, add this to your environment variables in your hosting platform.</p>
        </CardContent>
      </Card>
    </div>
  )
}
