"use client"

import { ExternalLink, Trash2, Heart } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import type { Property } from "@/components/home-comparison"
import { cn } from "@/lib/utils"

interface PropertyCardProps {
  property: Property
  onRemove: (id: string) => void
  isBestValue: boolean
  isFavorite: boolean
  onToggleFavorite: (id: string) => void
}

export function PropertyCard({ property, onRemove, isBestValue, isFavorite, onToggleFavorite }: PropertyCardProps) {
  const pricePerSqFt = property.squareFeet ? (property.price / property.squareFeet).toFixed(2) : "N/A"

  return (
    <Card className={isBestValue ? "border-blue-500 border-2" : ""}>
      <CardHeader className="relative pb-2">
        <div className="flex justify-between items-start">
          <CardTitle className="text-lg truncate pr-16">{property.address}</CardTitle>
          <div className="absolute top-3 right-3 flex gap-2">
            <Button
              variant="ghost"
              size="icon"
              className={cn(
                "h-8 w-8 rounded-full",
                isFavorite ? "text-red-500 hover:text-red-600" : "text-slate-400 hover:text-red-400",
              )}
              onClick={() => onToggleFavorite(property.id)}
            >
              <Heart className="h-5 w-5" fill={isFavorite ? "currentColor" : "none"} />
              <span className="sr-only">{isFavorite ? "Remove from favorites" : "Add to favorites"}</span>
            </Button>
            <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => onRemove(property.id)}>
              <Trash2 className="h-4 w-4" />
              <span className="sr-only">Remove</span>
            </Button>
          </div>
        </div>
        <div className="text-sm text-muted-foreground">Source: {property.source}</div>
        <div className="flex gap-2 mt-2">
          {isBestValue && <Badge className="bg-blue-500 hover:bg-blue-600">Best Value</Badge>}
          {isFavorite && (
            <Badge variant="outline" className="border-red-200 text-red-500">
              Favorite
            </Badge>
          )}
        </div>
      </CardHeader>
      <CardContent className="pb-2">
        <div className="grid grid-cols-2 gap-x-4 gap-y-2">
          <div>
            <div className="text-sm font-medium">Price</div>
            <div className="text-xl font-bold">${property.price.toLocaleString()}</div>
          </div>
          <div>
            <div className="text-sm font-medium">Square Feet</div>
            <div>{property.squareFeet.toLocaleString()}</div>
          </div>
          <div>
            <div className="text-sm font-medium">Price/Sq.Ft</div>
            <div>${pricePerSqFt}</div>
          </div>
          <div>
            <div className="text-sm font-medium">Annual Taxes</div>
            <div>${property.taxes.toLocaleString()}</div>
          </div>
          <div>
            <div className="text-sm font-medium">Bedrooms</div>
            <div>{property.bedrooms}</div>
          </div>
          <div>
            <div className="text-sm font-medium">Bathrooms</div>
            <div>{property.bathrooms}</div>
          </div>
          <div>
            <div className="text-sm font-medium">Year Built</div>
            <div>{property.yearBuilt || "N/A"}</div>
          </div>
        </div>
      </CardContent>
      <CardFooter>
        <Button variant="outline" className="w-full hover:bg-blue-50 hover:text-blue-600" asChild>
          <a href={property.url} target="_blank" rel="noopener noreferrer">
            <ExternalLink className="mr-2 h-4 w-4" />
            View Listing
          </a>
        </Button>
      </CardFooter>
    </Card>
  )
}
