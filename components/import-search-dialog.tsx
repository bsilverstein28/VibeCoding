"use client"

import type React from "react"

import { useState, useRef } from "react"
import { Upload, FileUp } from "lucide-react"

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
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { useToast } from "@/hooks/use-toast"
import { generateId } from "@/utils/id-generator"
import type { SavedSearch } from "@/components/home-comparison"

interface ImportSearchDialogProps {
  onImport: (search: SavedSearch) => void
}

export function ImportSearchDialog({ onImport }: ImportSearchDialogProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [importCode, setImportCode] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const { toast } = useToast()

  const handleImport = () => {
    setIsLoading(true)
    setError(null)

    try {
      // Try to decode the import code
      let decodedData: any

      try {
        decodedData = JSON.parse(atob(decodeURIComponent(importCode)))
      } catch (e) {
        // If that fails, try parsing as direct JSON
        try {
          decodedData = JSON.parse(importCode)
        } catch (e2) {
          throw new Error("Invalid import code or data format")
        }
      }

      // Validate the data structure
      if (!decodedData || decodedData.type !== "listiq-shared-search" || !decodedData.data) {
        throw new Error("Invalid shared search data format")
      }

      const search = decodedData.data as SavedSearch

      // Validate required fields
      if (!search.name || !Array.isArray(search.properties) || !search.properties.length) {
        throw new Error("The shared search is missing required data")
      }

      // Generate a new ID for the imported search to avoid conflicts
      const importedSearch: SavedSearch = {
        ...search,
        id: generateId(),
        name: `${search.name} (Imported)`,
        savedAt: new Date().toISOString(),
      }

      // Call the onImport callback with the imported search
      onImport(importedSearch)

      // Show success message
      toast({
        title: "Search imported successfully",
        description: `"${importedSearch.name}" with ${importedSearch.properties.length} properties has been added to your saved searches.`,
      })

      // Close the dialog and reset state
      setIsOpen(false)
      setImportCode("")
      setError(null)
    } catch (error) {
      console.error("Import error:", error)
      setError(error instanceof Error ? error.message : "Failed to import search")
    } finally {
      setIsLoading(false)
    }
  }

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    const reader = new FileReader()
    reader.onload = (event) => {
      try {
        const fileContent = event.target?.result as string
        setImportCode(fileContent)
      } catch (error) {
        setError("Could not read the uploaded file")
      }
    }
    reader.onerror = () => {
      setError("Error reading the uploaded file")
    }
    reader.readAsText(file)
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className="gap-2">
          <Upload className="h-4 w-4" />
          Import Search
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Import Shared Search</DialogTitle>
          <DialogDescription>
            Paste a shared search code or upload a shared search file to import property comparisons.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          <div className="space-y-2">
            <Label htmlFor="import-code">Paste shared code or JSON</Label>
            <Textarea
              id="import-code"
              value={importCode}
              onChange={(e) => setImportCode(e.target.value)}
              placeholder="Paste the shared search code or JSON data here..."
              className="font-mono text-xs h-32"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="import-file">Or upload a shared search file</Label>
            <div className="flex items-center gap-2">
              <Input
                ref={fileInputRef}
                id="import-file"
                type="file"
                accept=".json"
                onChange={handleFileUpload}
                className="hidden"
              />
              <Button variant="outline" onClick={() => fileInputRef.current?.click()} className="w-full">
                <FileUp className="mr-2 h-4 w-4" />
                Select File
              </Button>
            </div>
          </div>

          {error && <div className="text-sm font-medium text-red-500">{error}</div>}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => setIsOpen(false)}>
            Cancel
          </Button>
          <Button onClick={handleImport} disabled={!importCode.trim() || isLoading}>
            {isLoading ? "Importing..." : "Import Search"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
