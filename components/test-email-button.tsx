"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { useToast } from "@/hooks/use-toast"
import { Send } from "lucide-react"

interface TestEmailButtonProps {
  email: string
}

export function TestEmailButton({ email }: TestEmailButtonProps) {
  const [isSending, setIsSending] = useState(false)
  const { toast } = useToast()

  const handleSendTestEmail = async () => {
    if (!email) {
      toast({
        title: "Email Required",
        description: "Please enter an email address first",
        variant: "destructive",
      })
      return
    }

    setIsSending(true)

    try {
      const response = await fetch("/api/test-email", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.message || `Error ${response.status}: Failed to send test email`)
      }

      toast({
        title: "Test Email Sent",
        description: `A test email has been sent to ${email}`,
      })
    } catch (error) {
      console.error("Error sending test email:", error)

      // Provide more detailed error message
      const errorMessage =
        error instanceof Error ? error.message : "Failed to send test email. Please check your email settings."

      toast({
        title: "Email Error",
        description: errorMessage,
        variant: "destructive",
      })
    } finally {
      setIsSending(false)
    }
  }

  return (
    <Button
      onClick={handleSendTestEmail}
      disabled={isSending || !email}
      variant="outline"
      size="sm"
      className="flex items-center gap-1"
    >
      <Send className="h-3 w-3" />
      {isSending ? "Sending..." : "Test"}
    </Button>
  )
}
