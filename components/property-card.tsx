"use client"

import { ExternalLink, Trash2, Heart, DollarSign } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Checkbox } from "@/components/ui/checkbox"
import { Separator } from "@/components/ui/separator"
import type { Property } from "@/components/home-comparison"
import type { MortgageSettings } from "@/components/mortgage-settings"
import { calculateTotalMonthlyPayment } from "@/utils/mortgage-calculator"
import { cn } from "@/lib/utils"
import { EditPropertyDialog } from "@/components/edit-property-dialog"

// Update the PropertyCardProps interface to include isLowestPayment
interface PropertyCardProps {
  property: Property
  onRemove: (id: string) => void
  isBestValue: boolean
  isLowestPayment?: boolean
  isFavorite: boolean
  onToggleFavorite: (id: string) => void
  isSelectionMode?: boolean
  isSelected?: boolean
  onToggleSelect?: () => void
  mortgageSettings?: MortgageSettings
  onUpdate: (updatedProperty: Property) => void
}

// Update the function parameters to include isLowestPayment with a default value
export function PropertyCard({
  property,
  onRemove,
  isBestValue,
  isLowestPayment = false,
  isFavorite,
  onToggleFavorite,
  isSelectionMode = false,
  isSelected = false,
  onToggleSelect,
  mortgageSettings,
  onUpdate,
}: PropertyCardProps) {
  const pricePerSqFt = property.squareFeet ? (property.price / property.squareFeet).toFixed(2) : "N/A"

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
    <Card
      className={cn(
        isBestValue ? "border-blue-500 border-2" : "",
        isSelected ? "ring-2 ring-blue-500 ring-offset-2" : "",
      )}
    >
      <CardHeader className="relative pb-2">
        <div className="flex justify-between items-start">
          <div className="flex items-center gap-2">
            {isSelectionMode && <Checkbox checked={isSelected} onCheckedChange={onToggleSelect} className="mt-1" />}
            <CardTitle className="text-lg truncate pr-16">{property.address}</CardTitle>
          </div>
          <div className="absolute top-3 right-3 flex gap-2">
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
            <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => onRemove(property.id)}>
              <Trash2 className="h-4 w-4" />
              <span className="sr-only">Remove</span>
            </Button>
          </div>
        </div>
        <div className="text-sm text-muted-foreground">Source: {property.source}</div>
        {/* Add the "Lowest Payment" badge to the badges section (around line 58) */}
        <div className="flex gap-2 mt-2">
          {isBestValue && <Badge className="bg-blue-500 hover:bg-blue-600">Best Value</Badge>}
          {isLowestPayment && <Badge className="bg-green-500 hover:bg-green-600">Lowest Payment</Badge>}
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

        {mortgageSettings?.enabled && mortgagePayment && (
          <>
            <Separator className="my-3" />
            <div className="space-y-2">
              <div className="flex items-center gap-1 text-sm font-medium text-blue-600">
                <DollarSign className="h-4 w-4" />
                <span>Mortgage Details ({mortgageSettings.interestRate}% rate)</span>
              </div>
              <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-sm">
                <div>
                  <div className="text-xs text-muted-foreground">Down Payment</div>
                  <div>${mortgagePayment.downPayment.toLocaleString()}</div>
                </div>
                <div>
                  <div className="text-xs text-muted-foreground">Loan Amount</div>
                  <div>${mortgagePayment.principal.toLocaleString()}</div>
                </div>
                <div>
                  <div className="text-xs text-muted-foreground">Monthly Mortgage</div>
                  <div>${Math.round(mortgagePayment.monthlyMortgage).toLocaleString()}</div>
                </div>
                <div>
                  <div className="text-xs text-muted-foreground">Monthly Taxes</div>
                  <div>${Math.round(mortgagePayment.monthlyTaxes).toLocaleString()}</div>
                </div>
                <div>
                  <div className="text-xs text-muted-foreground">Monthly Insurance</div>
                  <div>${Math.round(mortgagePayment.monthlyInsurance).toLocaleString()}</div>
                </div>
                <div>
                  <div className="text-xs font-medium">Total Monthly</div>
                  <div className="font-bold">${Math.round(mortgagePayment.totalMonthly).toLocaleString()}</div>
                </div>
              </div>
            </div>
          </>
        )}
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
