"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { useToast } from "@/hooks/use-toast"
import { Mail } from "lucide-react"

interface SendEmailButtonProps {
  summaryId: string
}

export function SendEmailButton({ summaryId }: SendEmailButtonProps) {
  const [isSending, setIsSending] = useState(false)
  const { toast } = useToast()

  const handleSendEmail = async () => {
    setIsSending(true)

    try {
      const response = await fetch(`/api/summaries/${summaryId}/send-email`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.message || "Failed to send email")
      }

      toast({
        title: "Email Sent",
        description: data.message,
      })
    } catch (error) {
      console.error("Error sending email:", error)
      toast({
        title: "Error",
        description: "Failed to send email. Please check your email settings.",
        variant: "destructive",
      })
    } finally {
      setIsSending(false)
    }
  }

  return (
    <Button onClick={handleSendEmail} disabled={isSending} variant="outline" className="flex items-center gap-2">
      <Mail className="h-4 w-4" />
      {isSending ? "Sending..." : "Send Email"}
    </Button>
  )
}
