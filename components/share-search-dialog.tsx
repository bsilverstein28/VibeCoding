"use client"

import { useState, useRef, useEffect } from "react"
import { Share2, Copy, Check, Download } from "lucide-react"

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
import { useToast } from "@/hooks/use-toast"
import type { SavedSearch } from "@/components/home-comparison"

interface ShareSearchDialogProps {
  search: SavedSearch
  buttonVariant?: "default" | "outline" | "ghost" | "link"
  buttonSize?: "default" | "sm" | "lg" | "icon"
  className?: string
}

export function ShareSearchDialog({
  search,
  buttonVariant = "ghost",
  buttonSize = "icon",
  className,
}: ShareSearchDialogProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [isCopied, setIsCopied] = useState(false)
  const { toast } = useToast()
  const inputRef = useRef<HTMLInputElement>(null)

  // Generate shareable code
  const shareableCode = encodeURIComponent(btoa(JSON.stringify({ type: "listiq-shared-search", data: search })))

  // Create shareable URL
  const shareableUrl =
    typeof window !== "undefined" ? `${window.location.origin}?shared=${shareableCode}` : `?shared=${shareableCode}`

  // Reset copy state when dialog opens
  useEffect(() => {
    if (isOpen) {
      setIsCopied(false)
    }
  }, [isOpen])

  // Select all text when input is focused
  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.select()
    }
  }, [isOpen])

  const handleCopy = () => {
    if (inputRef.current) {
      inputRef.current.select()
      navigator.clipboard.writeText(shareableUrl)
      setIsCopied(true)

      toast({
        title: "Link copied",
        description: "The shareable link has been copied to your clipboard.",
      })

      // Reset copy state after 2 seconds
      setTimeout(() => {
        setIsCopied(false)
      }, 2000)
    }
  }

  const handleDownload = () => {
    // Create a downloadable file with the search data
    const fileName = `${search.name.replace(/\s+/g, "-").toLowerCase()}-shared-search.json`
    const fileContent = JSON.stringify({ type: "listiq-shared-search", data: search }, null, 2)

    const blob = new Blob([fileContent], { type: "application/json" })
    const url = URL.createObjectURL(blob)

    const link = document.createElement("a")
    link.href = url
    link.download = fileName
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)

    toast({
      title: "Search exported",
      description: `"${search.name}" has been exported as ${fileName}.`,
    })
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant={buttonVariant} size={buttonSize} className={className}>
          <Share2 className="h-4 w-4" />
          <span className="sr-only">Share search</span>
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Share "{search.name}"</DialogTitle>
          <DialogDescription>
            Share this search with others so they can see the same property comparisons. Contains{" "}
            {search.properties.length} {search.properties.length === 1 ? "property" : "properties"}.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <p className="text-sm font-medium">Shareable link</p>
            <div className="flex items-center space-x-2">
              <Input ref={inputRef} value={shareableUrl} readOnly className="font-mono text-xs" />
              <Button variant="outline" size="icon" onClick={handleCopy} className="flex-shrink-0">
                {isCopied ? <Check className="h-4 w-4 text-green-500" /> : <Copy className="h-4 w-4" />}
              </Button>
            </div>
          </div>

          <div className="space-y-2">
            <p className="text-sm font-medium">Or download as file</p>
            <Button variant="outline" onClick={handleDownload} className="w-full">
              <Download className="mr-2 h-4 w-4" />
              Download Search Data
            </Button>
          </div>
        </div>

        <DialogFooter>
          <Button onClick={() => setIsOpen(false)}>Close</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
