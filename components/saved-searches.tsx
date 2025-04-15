"use client"

import type React from "react"

import { useState } from "react"
import { BookMarked, Clock, Trash2 } from "lucide-react"

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { ScrollArea } from "@/components/ui/scroll-area"
import { useToast } from "@/hooks/use-toast"
import type { SavedSearch } from "@/components/home-comparison"

interface SavedSearchesProps {
  savedSearches: SavedSearch[]
  onLoad: (searchId: string) => void
  onDelete: (searchId: string) => void
}

export function SavedSearches({ savedSearches, onLoad, onDelete }: SavedSearchesProps) {
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const { toast } = useToast()

  const handleLoad = (searchId: string, searchName: string) => {
    onLoad(searchId)
    toast({
      title: "Search loaded",
      description: `Loaded "${searchName}" search.`,
    })
  }

  const handleDelete = (searchId: string, searchName: string, e: React.MouseEvent) => {
    e.stopPropagation()
    onDelete(searchId)
    toast({
      title: "Search deleted",
      description: `"${searchName}" has been deleted.`,
    })
  }

  if (savedSearches.length === 0) {
    return (
      <Button variant="outline" className="gap-2" disabled>
        <BookMarked className="h-4 w-4" />
        No Saved Searches
      </Button>
    )
  }

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" className="gap-2">
            <BookMarked className="h-4 w-4" />
            Saved Searches
            <span className="ml-1 rounded-full bg-blue-100 px-2 py-0.5 text-xs text-blue-600">
              {savedSearches.length}
            </span>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-56">
          <DropdownMenuLabel>Saved Searches</DropdownMenuLabel>
          <DropdownMenuSeparator />
          {savedSearches.slice(0, 5).map((search) => (
            <DropdownMenuItem key={search.id} onClick={() => handleLoad(search.id, search.name)}>
              <div className="flex w-full items-center justify-between">
                <span className="truncate mr-2">{search.name}</span>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-6 w-6 text-slate-400 hover:text-red-500"
                  onClick={(e) => handleDelete(search.id, search.name, e)}
                >
                  <Trash2 className="h-3 w-3" />
                  <span className="sr-only">Delete</span>
                </Button>
              </div>
            </DropdownMenuItem>
          ))}
          {savedSearches.length > 5 && (
            <DropdownMenuItem onClick={() => setIsDialogOpen(true)}>
              <span className="text-blue-600">View all saved searches</span>
            </DropdownMenuItem>
          )}
        </DropdownMenuContent>
      </DropdownMenu>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>All Saved Searches</DialogTitle>
            <DialogDescription>Select a search to load or delete saved searches you no longer need.</DialogDescription>
          </DialogHeader>
          <ScrollArea className="h-[300px] pr-4">
            <div className="space-y-2">
              {savedSearches.map((search) => (
                <div
                  key={search.id}
                  className="flex items-center justify-between rounded-md border p-3 hover:bg-slate-50 cursor-pointer"
                  onClick={() => {
                    handleLoad(search.id, search.name)
                    setIsDialogOpen(false)
                  }}
                >
                  <div className="space-y-1">
                    <div className="font-medium">{search.name}</div>
                    <div className="flex items-center text-sm text-muted-foreground">
                      <Clock className="mr-1 h-3 w-3" />
                      <span>
                        {new Date(search.savedAt).toLocaleDateString()} • {search.properties.length}{" "}
                        {search.properties.length === 1 ? "property" : "properties"}
                      </span>
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 text-slate-400 hover:text-red-500"
                    onClick={(e) => {
                      handleDelete(search.id, search.name, e)
                      if (savedSearches.length <= 1) {
                        setIsDialogOpen(false)
                      }
                    }}
                  >
                    <Trash2 className="h-4 w-4" />
                    <span className="sr-only">Delete</span>
                  </Button>
                </div>
              ))}
            </div>
          </ScrollArea>
        </DialogContent>
      </Dialog>
    </>
  )
}
