"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Edit2 } from "lucide-react"

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
import { useToast } from "@/hooks/use-toast"
import { extractSourceFromUrl, extractAddressFromUrl } from "@/utils/url-helpers"
import type { Property } from "@/components/home-comparison"

interface EditPropertyDialogProps {
  property: Property
  onUpdate: (updatedProperty: Property) => void
  buttonVariant?: "default" | "outline" | "ghost" | "link"
  buttonSize?: "default" | "sm" | "lg" | "icon"
  className?: string
}

export function EditPropertyDialog({
  property,
  onUpdate,
  buttonVariant = "ghost",
  buttonSize = "icon",
  className,
}: EditPropertyDialogProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [editedProperty, setEditedProperty] = useState<Property>({ ...property })
  const { toast } = useToast()

  // Reset the form when the dialog opens with the current property data
  useEffect(() => {
    if (isOpen) {
      setEditedProperty({ ...property })
    }
  }, [isOpen, property])

  // Update source and address when URL changes
  useEffect(() => {
    if (editedProperty.url !== property.url) {
      // Extract source from URL
      const source = extractSourceFromUrl(editedProperty.url)
      if (source) {
        setEditedProperty((prev) => ({
          ...prev,
          source,
        }))
      }

      // Extract address from URL
      const address = extractAddressFromUrl(editedProperty.url)
      if (address) {
        setEditedProperty((prev) => ({
          ...prev,
          address,
        }))
      }
    }
  }, [editedProperty.url, property.url])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setEditedProperty({
      ...editedProperty,
      [name]: name === "url" || name === "address" || name === "source" ? value : Number(value),
    })
  }

  const handleSubmit = () => {
    // Validate required fields
    if (!editedProperty.url || !editedProperty.address || !editedProperty.price || !editedProperty.squareFeet) {
      toast({
        title: "Missing required fields",
        description: "Please fill in all required fields: URL, Address, Price, and Square Feet.",
        variant: "destructive",
      })
      return
    }

    // Update the property
    onUpdate(editedProperty)

    // Close the dialog
    setIsOpen(false)

    // Show success message
    toast({
      title: "Property updated",
      description: `${editedProperty.address} has been updated successfully.`,
    })
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant={buttonVariant} size={buttonSize} className={className}>
          <Edit2 className="h-4 w-4" />
          <span className="sr-only">Edit property</span>
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Edit Property</DialogTitle>
          <DialogDescription>
            Update the details for this property. Fields marked with * are required.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-6 py-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="edit-url">Property URL *</Label>
            <Input
              id="edit-url"
              name="url"
              value={editedProperty.url}
              onChange={handleInputChange}
              placeholder="https://www.zillow.com/..."
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="edit-source">Source</Label>
            <Input
              id="edit-source"
              name="source"
              value={editedProperty.source}
              onChange={handleInputChange}
              placeholder="Auto-detected from URL"
            />
          </div>
          <div className="space-y-2 sm:col-span-2">
            <Label htmlFor="edit-address">Address *</Label>
            <Input
              id="edit-address"
              name="address"
              value={editedProperty.address}
              onChange={handleInputChange}
              placeholder="123 Main St, City, State ZIP"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="edit-price">Price ($) *</Label>
            <Input
              id="edit-price"
              name="price"
              type="number"
              value={editedProperty.price || ""}
              onChange={handleInputChange}
              placeholder="350000"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="edit-squareFeet">Square Feet *</Label>
            <Input
              id="edit-squareFeet"
              name="squareFeet"
              type="number"
              value={editedProperty.squareFeet || ""}
              onChange={handleInputChange}
              placeholder="2000"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="edit-taxes">Annual Taxes ($)</Label>
            <Input
              id="edit-taxes"
              name="taxes"
              type="number"
              value={editedProperty.taxes || ""}
              onChange={handleInputChange}
              placeholder="5000"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="edit-bedrooms">Bedrooms</Label>
            <Input
              id="edit-bedrooms"
              name="bedrooms"
              type="number"
              value={editedProperty.bedrooms || ""}
              onChange={handleInputChange}
              placeholder="3"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="edit-bathrooms">Bathrooms</Label>
            <Input
              id="edit-bathrooms"
              name="bathrooms"
              type="number"
              value={editedProperty.bathrooms || ""}
              onChange={handleInputChange}
              placeholder="2"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="edit-yearBuilt">Year Built</Label>
            <Input
              id="edit-yearBuilt"
              name="yearBuilt"
              type="number"
              value={editedProperty.yearBuilt || ""}
              onChange={handleInputChange}
              placeholder="2000"
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => setIsOpen(false)}>
            Cancel
          </Button>
          <Button onClick={handleSubmit}>Save Changes</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
