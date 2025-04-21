"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { updatePickResultAction } from "@/app/actions"
import { Check, X, Minus } from "lucide-react"
import { toast } from "@/components/ui/use-toast"

interface PickResultManagerProps {
  pickId: string
  currentResult: "win" | "loss" | "push" | "pending"
}

export default function PickResultManager({ pickId, currentResult }: PickResultManagerProps) {
  const [isUpdating, setIsUpdating] = useState(false)

  const updateResult = async (result: "win" | "loss" | "push") => {
    if (result === currentResult) return

    setIsUpdating(true)
    try {
      const response = await updatePickResultAction(pickId, result)

      if (response.success) {
        toast({
          title: "Result updated",
          description: `Pick result has been updated to ${result}`,
        })
      } else {
        toast({
          title: "Error",
          description: response.error || "Failed to update result",
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
      setIsUpdating(false)
    }
  }

  return (
    <div className="flex items-center gap-2">
      <Button
        size="sm"
        variant={currentResult === "win" ? "default" : "outline"}
        className={
          currentResult === "win" ? "bg-emerald-600 hover:bg-emerald-700" : "hover:bg-emerald-600 hover:text-white"
        }
        onClick={() => updateResult("win")}
        disabled={isUpdating}
      >
        <Check className="h-4 w-4 mr-1" />
        Win
      </Button>

      <Button
        size="sm"
        variant={currentResult === "loss" ? "default" : "outline"}
        className={
          currentResult === "loss" ? "bg-emerald-600 hover:bg-emerald-700" : "hover:bg-emerald-600 hover:text-white"
        }
        onClick={() => updateResult("loss")}
        disabled={isUpdating}
      >
        <X className="h-4 w-4 mr-1" />
        Loss
      </Button>

      <Button
        size="sm"
        variant={currentResult === "push" ? "default" : "outline"}
        className={
          currentResult === "push" ? "bg-emerald-600 hover:bg-emerald-700" : "hover:bg-emerald-600 hover:text-white"
        }
        onClick={() => updateResult("push")}
        disabled={isUpdating}
      >
        <Minus className="h-4 w-4 mr-1" />
        Push
      </Button>
    </div>
  )
}
