"use client"

import { ExternalLink, Heart, DollarSign } from "lucide-react"

import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import type { Property } from "@/components/home-comparison"
import type { MortgageSettings } from "@/components/mortgage-settings"
import { calculateTotalMonthlyPayment } from "@/utils/mortgage-calculator"
import { cn } from "@/lib/utils"
import { EditPropertyDialog } from "@/components/edit-property-dialog"

// Update the ComparisonTableProps interface to include lowestPaymentId
interface ComparisonTableProps {
  properties: Property[]
  bestValueId?: string | null
  lowestPaymentId?: string | null
  favoriteIds: Set<string>
  onToggleFavorite: (id: string) => void
  isSelectionMode?: boolean
  selectedPropertyIds?: Set<string>
  onToggleSelect?: (id: string) => void
  mortgageSettings?: MortgageSettings
  onUpdate: (updatedProperty: Property) => void
}

// Update the function parameters to include lowestPaymentId
export function ComparisonTable({
  properties,
  bestValueId,
  lowestPaymentId,
  favoriteIds,
  onToggleFavorite,
  isSelectionMode = false,
  selectedPropertyIds = new Set(),
  onToggleSelect,
  mortgageSettings,
  onUpdate,
}: ComparisonTableProps) {
  if (properties.length === 0) {
    return <div>No properties to compare</div>
  }

  return (
    <div className="overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow>
            {isSelectionMode && <TableHead className="w-[40px]"></TableHead>}
            <TableHead>Property</TableHead>
            <TableHead>Price</TableHead>
            <TableHead>Sq. Ft.</TableHead>
            <TableHead>$/Sq. Ft.</TableHead>
            <TableHead>Taxes</TableHead>
            <TableHead>Beds</TableHead>
            <TableHead>Baths</TableHead>
            <TableHead>Year</TableHead>
            {mortgageSettings?.enabled && (
              <TableHead>
                <div className="flex items-center gap-1">
                  <DollarSign className="h-4 w-4" />
                  <span>Monthly Payment</span>
                </div>
              </TableHead>
            )}
            <TableHead>Source</TableHead>
            <TableHead>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {properties.map((property) => {
            const pricePerSqFt = property.squareFeet ? (property.price / property.squareFeet).toFixed(2) : "N/A"
            // Inside the map function, add a variable to check if the current property has the lowest payment (around line 73)
            const isBestValue = property.id === bestValueId
            const isLowestPayment = property.id === lowestPaymentId
            const isFavorite = favoriteIds.has(property.id)
            const isSelected = selectedPropertyIds.has(property.id)

            // Calculate mortgage payment if enabled
            const mortgagePayment = mortgageSettings?.enabled
              ? calculateTotalMonthlyPayment(
                  property.price,
                  mortgageSettings.downPaymentPercentage,
                  mortgageSettings.interestRate,
                  property.taxes,
                  mortgageSettings.loanTermYears,
                )
              : null

            return (
              // Update the TableRow className to include the green background for lowest payment (around line 92)
              <TableRow
                key={property.id}
                className={cn(
                  isBestValue ? "bg-blue-50" : "",
                  isLowestPayment ? "bg-green-50" : "",
                  isSelected ? "bg-blue-100" : "",
                )}
              >
                {isSelectionMode && (
                  <TableCell>
                    <Checkbox checked={isSelected} onCheckedChange={() => onToggleSelect?.(property.id)} />
                  </TableCell>
                )}
                <TableCell className="font-medium">
                  {/* Add the "Lowest Payment" badge to the badges section (around line 102) */}
                  <div className="flex items-center gap-2">
                    {property.address}
                    {isBestValue && <Badge className="bg-blue-500 hover:bg-blue-600">Best Value</Badge>}
                    {isLowestPayment && <Badge className="bg-green-500 hover:bg-green-600">Lowest Payment</Badge>}
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
                {mortgageSettings?.enabled && mortgagePayment && (
                  <TableCell>
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <div className="font-bold cursor-help">
                            ${Math.round(mortgagePayment.totalMonthly).toLocaleString()}
                          </div>
                        </TooltipTrigger>
                        <TooltipContent side="top" className="w-64">
                          <div className="space-y-2">
                            <div className="font-medium">Mortgage Details ({mortgageSettings.interestRate}% rate)</div>
                            <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-sm">
                              <div>Down Payment:</div>
                              <div>${mortgagePayment.downPayment.toLocaleString()}</div>
                              <div>Loan Amount:</div>
                              <div>${mortgagePayment.principal.toLocaleString()}</div>
                              <div>Monthly Mortgage:</div>
                              <div>${Math.round(mortgagePayment.monthlyMortgage).toLocaleString()}</div>
                              <div>Monthly Taxes:</div>
                              <div>${Math.round(mortgagePayment.monthlyTaxes).toLocaleString()}</div>
                              <div>Monthly Insurance:</div>
                              <div>${Math.round(mortgagePayment.monthlyInsurance).toLocaleString()}</div>
                            </div>
                          </div>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  </TableCell>
                )}
                <TableCell>{property.source}</TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <EditPropertyDialog property={property} onUpdate={onUpdate} />
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
