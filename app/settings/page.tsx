"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { useToast } from "@/hooks/use-toast"
import { createClientSupabaseClient } from "@/lib/supabase"
import Link from "next/link"
import { Settings2, MessageSquareText, Sparkles } from "lucide-react"
import { TestEmailButton } from "@/components/test-email-button"
import { EmailConfigDebugger } from "@/components/email-config-debugger"

export default function SettingsPage() {
  const { toast } = useToast()
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [preferences, setPreferences] = useState({
    id: "",
    email: "",
    email_notifications: false,
    notification_time: "08:00",
  })

  useEffect(() => {
    async function loadPreferences() {
      try {
        const supabase = createClientSupabaseClient()

        const { data, error } = await supabase.from("user_preferences").select("*").limit(1).single()

        if (error && error.code !== "PGRST116") {
          throw error
        }

        if (data) {
          setPreferences({
            id: data.id,
            email: data.email || "",
            email_notifications: data.email_notifications,
            notification_time: data.notification_time || "08:00",
          })
        }
      } catch (error) {
        console.error("Error loading preferences:", error)
        toast({
          title: "Error",
          description: "Failed to load preferences",
          variant: "destructive",
        })
      } finally {
        setIsLoading(false)
      }
    }

    loadPreferences()
  }, [toast])

  const handleChange = (field: string, value: any) => {
    setPreferences((prev) => ({ ...prev, [field]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSaving(true)

    try {
      const supabase = createClientSupabaseClient()

      if (preferences.id) {
        // Update existing preferences
        const { error } = await supabase
          .from("user_preferences")
          .update({
            email: preferences.email,
            email_notifications: preferences.email_notifications,
            notification_time: preferences.notification_time,
            updated_at: new Date().toISOString(),
          })
          .eq("id", preferences.id)

        if (error) throw error
      } else {
        // Create new preferences
        const { data, error } = await supabase
          .from("user_preferences")
          .insert({
            email: preferences.email,
            email_notifications: preferences.email_notifications,
            notification_time: preferences.notification_time,
          })
          .select()

        if (error) throw error

        if (data && data[0]) {
          setPreferences((prev) => ({ ...prev, id: data[0].id }))
        }
      }

      toast({
        title: "Settings saved",
        description: "Your preferences have been updated.",
      })
    } catch (error) {
      console.error("Error saving preferences:", error)
      toast({
        title: "Error",
        description: "Failed to save preferences",
        variant: "destructive",
      })
    } finally {
      setIsSaving(false)
    }
  }

  if (isLoading) {
    return (
      <div className="space-y-6">
        <h1 className="text-3xl font-bold">Settings</h1>
        <Card>
          <CardHeader>
            <CardTitle>Loading...</CardTitle>
          </CardHeader>
          <CardContent>
            <p>Loading your preferences...</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Settings</h1>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <form onSubmit={handleSubmit}>
            <CardHeader>
              <CardTitle>Notification Preferences</CardTitle>
              <CardDescription>Configure how and when you want to receive updates.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="email">Email Address</Label>
                <div className="flex gap-2">
                  <Input
                    id="email"
                    type="email"
                    value={preferences.email}
                    onChange={(e) => handleChange("email", e.target.value)}
                    placeholder="your@email.com"
                    className="flex-1"
                  />
                  <TestEmailButton email={preferences.email} />
                </div>
                <p className="text-sm text-muted-foreground">Where to send your daily summaries</p>
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="email_notifications">Email Notifications</Label>
                  <p className="text-sm text-muted-foreground">Receive daily summaries via email</p>
                </div>
                <Switch
                  id="email_notifications"
                  checked={preferences.email_notifications}
                  onCheckedChange={(checked) => handleChange("email_notifications", checked)}
                />
              </div>

              {preferences.email_notifications && (
                <div className="space-y-2">
                  <Label htmlFor="notification_time">Notification Time</Label>
                  <Input
                    id="notification_time"
                    type="time"
                    value={preferences.notification_time}
                    onChange={(e) => handleChange("notification_time", e.target.value)}
                  />
                  <p className="text-sm text-muted-foreground">Choose when to receive your daily summary email.</p>
                </div>
              )}
            </CardContent>
            <CardFooter>
              <Button type="submit" disabled={isSaving}>
                {isSaving ? "Saving..." : "Save Settings"}
              </Button>
            </CardFooter>
          </form>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>AI Summary Settings</CardTitle>
            <CardDescription>Customize how AI summaries are generated</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <MessageSquareText className="h-5 w-5" />
                <h3 className="font-medium">Category Prompts</h3>
              </div>
              <p className="text-sm text-muted-foreground">
                Customize the AI prompts used for different company categories to get more relevant summaries.
              </p>
            </div>
          </CardContent>
          <CardFooter>
            <Button asChild variant="outline" className="w-full">
              <Link href="/settings/prompts" className="flex items-center justify-center gap-2">
                <Settings2 className="h-4 w-4" />
                Manage Category Prompts
              </Link>
            </Button>
          </CardFooter>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>AI Settings</CardTitle>
            <CardDescription>Configure AI-powered features</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-amber-500" />
                <h3 className="font-medium">OpenAI Integration</h3>
              </div>
              <p className="text-sm text-muted-foreground">
                Configure your OpenAI API key to enable AI-powered summaries of news articles.
              </p>
            </div>
          </CardContent>
          <CardFooter>
            <Button asChild variant="outline" className="w-full">
              <Link href="/settings/ai" className="flex items-center justify-center gap-2">
                <Sparkles className="h-4 w-4" />
                Configure AI Settings
              </Link>
            </Button>
          </CardFooter>
        </Card>
      </div>

      <EmailConfigDebugger />
    </div>
  )
}
