"use client"

import { ExternalLink, Heart } from "lucide-react"

import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import type { Property } from "@/components/home-comparison"
import { cn } from "@/lib/utils"

interface ComparisonTableProps {
  properties: Property[]
  bestValueId?: string | null
  favoriteIds: Set<string>
  onToggleFavorite: (id: string) => void
}

export function ComparisonTable({ properties, bestValueId, favoriteIds, onToggleFavorite }: ComparisonTableProps) {
  if (properties.length === 0) {
    return <div>No properties to compare</div>
  }

  return (
    <div className="overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Property</TableHead>
            <TableHead>Price</TableHead>
            <TableHead>Sq. Ft.</TableHead>
            <TableHead>$/Sq. Ft.</TableHead>
            <TableHead>Taxes</TableHead>
            <TableHead>Beds</TableHead>
            <TableHead>Baths</TableHead>
            <TableHead>Year</TableHead>
            <TableHead>Source</TableHead>
            <TableHead>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {properties.map((property) => {
            const pricePerSqFt = property.squareFeet ? (property.price / property.squareFeet).toFixed(2) : "N/A"
            const isBestValue = property.id === bestValueId
            const isFavorite = favoriteIds.has(property.id)

            return (
              <TableRow key={property.id} className={isBestValue ? "bg-blue-50" : ""}>
                <TableCell className="font-medium">
                  <div className="flex items-center gap-2">
                    {property.address}
                    {isBestValue && <Badge className="bg-blue-500 hover:bg-blue-600">Best Value</Badge>}
                    {isFavorite && (
                      <Badge variant="outline" className="border-red-200 text-red-500">
                        Favorite
                      </Badge>
                    )}
                  </div>
                </TableCell>
                <TableCell>${property.price.toLocaleString()}</TableCell>
                <TableCell>{property.squareFeet.toLocaleString()}</TableCell>
                <TableCell>${pricePerSqFt}</TableCell>
                <TableCell>${property.taxes.toLocaleString()}</TableCell>
                <TableCell>{property.bedrooms}</TableCell>
                <TableCell>{property.bathrooms}</TableCell>
                <TableCell>{property.yearBuilt || "N/A"}</TableCell>
                <TableCell>{property.source}</TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
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
                    <a
                      href={property.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center text-blue-600 hover:underline"
                    >
                      <ExternalLink className="h-4 w-4 mr-1" />
                      View
                    </a>
                  </div>
                </TableCell>
              </TableRow>
            )
          })}
        </TableBody>
      </Table>
    </div>
  )
}
