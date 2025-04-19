"use client"

import { useState, useEffect } from "react"
import { Save } from "lucide-react"

import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
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
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useToast } from "@/hooks/use-toast"
import type { Property, SavedSearch } from "@/components/home-comparison"

interface SaveSearchDialogProps {
  properties: Property[]
  onSave: (name: string, properties: Property[], existingSearchId?: string) => void
  disabled?: boolean
  existingSearches: SavedSearch[]
  currentSearch?: SavedSearch | null
}

export function SaveSearchDialog({
  properties,
  onSave,
  disabled = false,
  existingSearches,
  currentSearch,
}: SaveSearchDialogProps) {
  const [name, setName] = useState("")
  const [isOpen, setIsOpen] = useState(false)
  const [showDuplicateAlert, setShowDuplicateAlert] = useState(false)
  const [duplicateSearchId, setDuplicateSearchId] = useState<string | undefined>(undefined)
  const { toast } = useToast()

  // Set the name field to the current search name if updating
  useEffect(() => {
    if (isOpen && currentSearch) {
      setName(currentSearch.name)
    } else if (isOpen) {
      setName("")
    }
  }, [isOpen, currentSearch])

  const checkForDuplicateName = (searchName: string): SavedSearch | undefined => {
    // Don't consider it a duplicate if we're updating the current search
    if (currentSearch && currentSearch.name === searchName) {
      return undefined
    }

    return existingSearches.find((search) => search.name === searchName)
  }

  const handleSave = () => {
    if (!name.trim()) {
      toast({
        title: "Name required",
        description: "Please enter a name for this search",
        variant: "destructive",
      })
      return
    }

    // Check if a search with this name already exists
    const duplicateSearch = checkForDuplicateName(name.trim())
    if (duplicateSearch) {
      setDuplicateSearchId(duplicateSearch.id)
      setShowDuplicateAlert(true)
      return
    }

    // If no duplicate, proceed with save
    proceedWithSave()
  }

  const proceedWithSave = () => {
    onSave(name.trim(), properties, currentSearch?.id)
    setName("")
    setIsOpen(false)
    setDuplicateSearchId(undefined)

    toast({
      title: currentSearch ? "Search updated" : "Search saved",
      description: `Your search "${name}" has been ${currentSearch ? "updated" : "saved"}.`,
    })
  }

  const handleOverride = () => {
    // Close the alert and proceed with save
    setShowDuplicateAlert(false)
    proceedWithSave()
  }

  const handleCancelOverride = () => {
    // Just close the alert, keep the dialog open
    setShowDuplicateAlert(false)
  }

  return (
    <>
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogTrigger asChild>
          <Button variant="outline" className="gap-2" disabled={disabled || properties.length === 0}>
            <Save className="h-4 w-4" />
            {currentSearch ? "Update Search" : "Save Search"}
          </Button>
        </DialogTrigger>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>{currentSearch ? "Update Search" : "Save Search"}</DialogTitle>
            <DialogDescription>
              {currentSearch
                ? `Update your saved search with the current ${properties.length} properties.`
                : `Save your current search to access it later. This will save all ${properties.length} properties currently in your comparison.`}
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="search-name" className="text-right">
                Name
              </Label>
              <Input
                id="search-name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="col-span-3"
                placeholder="e.g., Downtown Condos"
                autoFocus
              />
            </div>
          </div>
          <DialogFooter>
            <Button type="submit" onClick={handleSave}>
              {currentSearch ? "Update" : "Save"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <AlertDialog open={showDuplicateAlert} onOpenChange={setShowDuplicateAlert}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Search name already exists</AlertDialogTitle>
            <AlertDialogDescription>
              A search with the name "{name}" already exists. Do you want to override it with your current properties?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={handleCancelOverride}>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleOverride} className="bg-destructive text-destructive-foreground">
              Override Existing Search
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
