"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { useToast } from "@/hooks/use-toast"
import { Trash2 } from "lucide-react"
import { useRouter } from "next/navigation"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"

interface DeleteCompanyButtonProps {
  companyId: string
  companyName: string
  onDeleted?: () => void
}

export function DeleteCompanyButton({ companyId, companyName, onDeleted }: DeleteCompanyButtonProps) {
  const [isDeleting, setIsDeleting] = useState(false)
  const [showConfirmDialog, setShowConfirmDialog] = useState(false)
  const { toast } = useToast()
  const router = useRouter()

  const handleDelete = async () => {
    setIsDeleting(true)

    try {
      const response = await fetch(`/api/companies/${companyId}`, {
        method: "DELETE",
        headers: {
          "Cache-Control": "no-cache",
        },
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || "Failed to delete company")
      }

      toast({
        title: "Company Deleted",
        description: `${companyName} has been removed from your tracked companies.`,
      })

      // Call the onDeleted callback if provided
      if (onDeleted) {
        onDeleted()
      }

      // Force a hard refresh of the page
      window.location.href = "/companies"
    } catch (error) {
      console.error("Error deleting company:", error)
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to delete company",
        variant: "destructive",
      })
    } finally {
      setIsDeleting(false)
      setShowConfirmDialog(false)
    }
  }

  return (
    <>
      <Button
        variant="ghost"
        size="sm"
        className="text-destructive"
        onClick={() => setShowConfirmDialog(true)}
        disabled={isDeleting}
      >
        <Trash2 className="h-4 w-4" />
      </Button>

      <AlertDialog open={showConfirmDialog} onOpenChange={setShowConfirmDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Company</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete {companyName}? This will also remove all associated news articles and
              summary references. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              disabled={isDeleting}
            >
              {isDeleting ? "Deleting..." : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
