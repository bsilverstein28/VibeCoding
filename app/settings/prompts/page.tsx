"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { useToast } from "@/hooks/use-toast"
import { createClientSupabaseClient } from "@/lib/supabase"
import { ArrowLeft, Save } from "lucide-react"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"

type CategoryPrompt = {
  id: string
  category: string
  system_prompt: string
  user_prompt: string
  created_at: string
  updated_at: string
}

export default function PromptsSettingsPage() {
  const { toast } = useToast()
  const [isLoading, setIsLoading] = useState(true)
  const [prompts, setPrompts] = useState<CategoryPrompt[]>([])
  const [savingCategory, setSavingCategory] = useState<string | null>(null)

  useEffect(() => {
    async function loadPrompts() {
      try {
        const supabase = createClientSupabaseClient()
        const { data, error } = await supabase.from("category_prompts").select("*").order("category")

        if (error) {
          throw error
        }

        setPrompts(data || [])
      } catch (error) {
        console.error("Error loading prompts:", error)
        toast({
          title: "Error",
          description: "Failed to load category prompts",
          variant: "destructive",
        })
      } finally {
        setIsLoading(false)
      }
    }

    loadPrompts()
  }, [toast])

  const handlePromptChange = (id: string, field: keyof CategoryPrompt, value: string) => {
    setPrompts((prevPrompts) =>
      prevPrompts.map((prompt) => (prompt.id === id ? { ...prompt, [field]: value } : prompt)),
    )
  }

  const handleSavePrompt = async (prompt: CategoryPrompt) => {
    setSavingCategory(prompt.category)

    try {
      const supabase = createClientSupabaseClient()
      const { error } = await supabase
        .from("category_prompts")
        .update({
          system_prompt: prompt.system_prompt,
          user_prompt: prompt.user_prompt,
          updated_at: new Date().toISOString(),
        })
        .eq("id", prompt.id)

      if (error) {
        throw error
      }

      toast({
        title: "Prompt updated",
        description: `The prompt for ${prompt.category} has been updated.`,
      })
    } catch (error) {
      console.error("Error saving prompt:", error)
      toast({
        title: "Error",
        description: "Failed to save prompt",
        variant: "destructive",
      })
    } finally {
      setSavingCategory(null)
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
          <h1 className="text-3xl font-bold">Category Prompts</h1>
        </div>
        <Card>
          <CardHeader>
            <CardTitle>Loading...</CardTitle>
          </CardHeader>
          <CardContent>
            <p>Loading category prompts...</p>
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
        <h1 className="text-3xl font-bold">Category Prompts</h1>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Customize AI Summary Prompts</CardTitle>
          <CardDescription>
            Customize the prompts used to generate AI summaries for different company categories.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="mb-4 text-sm text-muted-foreground">
            Each company category can have its own specialized prompt to generate more relevant summaries. The system
            prompt sets the AI's role and context, while the user prompt provides specific instructions for the summary.
          </p>

          <Accordion type="single" collapsible className="w-full">
            {prompts.map((prompt) => (
              <AccordionItem key={prompt.id} value={prompt.id}>
                <AccordionTrigger className="text-lg font-medium">{prompt.category}</AccordionTrigger>
                <AccordionContent>
                  <div className="space-y-4 pt-2">
                    <div className="space-y-2">
                      <Label htmlFor={`system-${prompt.id}`}>System Prompt</Label>
                      <Textarea
                        id={`system-${prompt.id}`}
                        value={prompt.system_prompt}
                        onChange={(e) => handlePromptChange(prompt.id, "system_prompt", e.target.value)}
                        rows={3}
                        className="font-mono text-sm"
                      />
                      <p className="text-xs text-muted-foreground">
                        Sets the AI's role and behavior. This is the context given to the AI.
                      </p>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor={`user-${prompt.id}`}>User Prompt</Label>
                      <Textarea
                        id={`user-${prompt.id}`}
                        value={prompt.user_prompt}
                        onChange={(e) => handlePromptChange(prompt.id, "user_prompt", e.target.value)}
                        rows={5}
                        className="font-mono text-sm"
                      />
                      <p className="text-xs text-muted-foreground">
                        The specific instructions for generating the summary. This is combined with the article data.
                      </p>
                    </div>

                    <div className="flex justify-end">
                      <Button
                        onClick={() => handleSavePrompt(prompt)}
                        disabled={savingCategory === prompt.category}
                        className="flex items-center gap-2"
                      >
                        <Save className="h-4 w-4" />
                        {savingCategory === prompt.category ? "Saving..." : "Save Changes"}
                      </Button>
                    </div>
                  </div>
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </CardContent>
      </Card>
    </div>
  )
}
