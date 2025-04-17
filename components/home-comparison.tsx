"use client"

import type React from "react"
import { useState, useEffect, useMemo } from "react"
import { Plus, Heart } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ComparisonTable } from "@/components/comparison-table"
import { PropertyCard } from "@/components/property-card"
import { SaveSearchDialog } from "@/components/save-search-dialog"
import { SavedSearches } from "@/components/saved-searches"
import { SortSelect, type SortOption } from "@/components/sort-select"
import { ImportSearchDialog } from "@/components/import-search-dialog"
import { useToast } from "@/hooks/use-toast"
import { generateId } from "@/utils/id-generator"
import { extractSourceFromUrl, extractAddressFromUrl } from "@/utils/url-helpers"

export type Property = {
  id: string
  url: string
  address: string
  price: number
  squareFeet: number
  taxes: number
  bedrooms: number
  bathrooms: number
  yearBuilt: number
  source: string
}

export type SavedSearch = {
  id: string
  name: string
  properties: Property[]
  savedAt: string
}

export type SortField =
  | "price-asc"
  | "price-desc"
  | "squareFeet-asc"
  | "squareFeet-desc"
  | "pricePerSqFt-asc"
  | "pricePerSqFt-desc"
  | "bedrooms-asc"
  | "bedrooms-desc"
  | "bathrooms-asc"
  | "bathrooms-desc"
  | "taxes-asc"
  | "taxes-desc"
  | "yearBuilt-asc"
  | "yearBuilt-desc"

const sortOptions: SortOption[] = [
  { value: "price-asc", label: "Price: Low to High" },
  { value: "price-desc", label: "Price: High to Low" },
  { value: "squareFeet-asc", label: "Square Feet: Low to High" },
  { value: "squareFeet-desc", label: "Square Feet: High to Low" },
  { value: "pricePerSqFt-asc", label: "Price/Sq.Ft: Low to High" },
  { value: "pricePerSqFt-desc", label: "Price/Sq.Ft: High to Low" },
  { value: "bedrooms-asc", label: "Bedrooms: Low to High" },
  { value: "bedrooms-desc", label: "Bedrooms: High to Low" },
  { value: "bathrooms-asc", label: "Bathrooms: Low to High" },
  { value: "bathrooms-desc", label: "Bathrooms: High to Low" },
  { value: "taxes-asc", label: "Taxes: Low to High" },
  { value: "taxes-desc", label: "Taxes: High to Low" },
  { value: "yearBuilt-asc", label: "Year Built: Oldest First" },
  { value: "yearBuilt-desc", label: "Year Built: Newest First" },
]

export function HomeComparison() {
  const [properties, setProperties] = useState<Property[]>([])
  const [favoriteIds, setFavoriteIds] = useState<Set<string>>(new Set())
  const [savedSearches, setSavedSearches] = useState<SavedSearch[]>([])
  const [activeTab, setActiveTab] = useState<string>("cards")
  const [sortBy, setSortBy] = useState<SortField>("price-asc")
  const { toast } = useToast()

  const [currentProperty, setCurrentProperty] = useState<Partial<Property>>({
    id: generateId(),
    url: "",
    address: "",
    price: 0,
    squareFeet: 0,
    taxes: 0,
    bedrooms: 0,
    bathrooms: 0,
    yearBuilt: 0,
    source: "",
  })

  // Check for shared search in URL on initial load
  useEffect(() => {
    if (typeof window !== "undefined") {
      const urlParams = new URLSearchParams(window.location.search)
      const sharedSearch = urlParams.get("shared")

      if (sharedSearch) {
        try {
          // Try to decode and parse the shared search
          const decodedData = JSON.parse(atob(decodeURIComponent(sharedSearch)))

          if (decodedData && decodedData.type === "listiq-shared-search" && decodedData.data) {
            const search = decodedData.data as SavedSearch

            // Generate a new ID for the imported search
            const importedSearch: SavedSearch = {
              ...search,
              id: generateId(),
              name: `${search.name} (Shared)`,
              savedAt: new Date().toISOString(),
            }

            // Add to saved searches
            setSavedSearches((prev) => [importedSearch, ...prev])

            // Load the properties
            setProperties(importedSearch.properties)

            // Show notification
            toast({
              title: "Shared search loaded",
              description: `"${importedSearch.name}" with ${importedSearch.properties.length} properties has been loaded.`,
            })

            // Remove the shared parameter from URL to prevent reloading on refresh
            const newUrl = window.location.pathname
            window.history.replaceState({}, document.title, newUrl)
          }
        } catch (error) {
          console.error("Error loading shared search:", error)
          toast({
            title: "Error loading shared search",
            description: "The shared search data could not be loaded. It may be invalid or corrupted.",
            variant: "destructive",
          })
        }
      }
    }
  }, [toast])

  // Load favorites and saved searches from localStorage on component mount
  useEffect(() => {
    try {
      const savedFavorites = localStorage.getItem("listiq-favorites")
      if (savedFavorites) {
        setFavoriteIds(new Set(JSON.parse(savedFavorites)))
      }

      const savedSearchesData = localStorage.getItem("listiq-saved-searches")
      if (savedSearchesData) {
        setSavedSearches(JSON.parse(savedSearchesData))
      }

      // Load saved sort preference
      const savedSort = localStorage.getItem("listiq-sort-preference")
      if (savedSort) {
        setSortBy(savedSort as SortField)
      }
    } catch (error) {
      console.error("Error loading data from localStorage:", error)
    }
  }, [])

  // Save favorites to localStorage whenever they change
  useEffect(() => {
    try {
      localStorage.setItem("listiq-favorites", JSON.stringify([...favoriteIds]))
    } catch (error) {
      console.error("Error saving favorites to localStorage:", error)
    }
  }, [favoriteIds])

  // Save searches to localStorage whenever they change
  useEffect(() => {
    try {
      localStorage.setItem("listiq-saved-searches", JSON.stringify(savedSearches))
    } catch (error) {
      console.error("Error saving searches to localStorage:", error)
    }
  }, [savedSearches])

  // Save sort preference to localStorage whenever it changes
  useEffect(() => {
    try {
      localStorage.setItem("listiq-sort-preference", sortBy)
    } catch (error) {
      console.error("Error saving sort preference to localStorage:", error)
    }
  }, [sortBy])

  // Update source and address when URL changes
  useEffect(() => {
    if (currentProperty.url) {
      // Extract source from URL
      const source = extractSourceFromUrl(currentProperty.url)
      if (source && (!currentProperty.source || currentProperty.source === "")) {
        setCurrentProperty((prev) => ({
          ...prev,
          source,
        }))
      }

      // Extract address from URL
      const address = extractAddressFromUrl(currentProperty.url)
      if (address && (!currentProperty.address || currentProperty.address === "")) {
        setCurrentProperty((prev) => ({
          ...prev,
          address,
        }))
      }
    }
  }, [currentProperty.url])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setCurrentProperty({
      ...currentProperty,
      [name]: name === "url" || name === "address" || name === "source" ? value : Number(value),
    })
  }

  const addProperty = () => {
    if (!currentProperty.url || !currentProperty.address || !currentProperty.price || !currentProperty.squareFeet) {
      return
    }

    try {
      // Ensure all required fields are present and properly typed
      const newProperty: Property = {
        id: currentProperty.id || generateId(),
        url: currentProperty.url || "",
        address: currentProperty.address || "",
        price: Number(currentProperty.price) || 0,
        squareFeet: Number(currentProperty.squareFeet) || 0,
        taxes: Number(currentProperty.taxes) || 0,
        bedrooms: Number(currentProperty.bedrooms) || 0,
        bathrooms: Number(currentProperty.bathrooms) || 0,
        yearBuilt: Number(currentProperty.yearBuilt) || 0,
        source: currentProperty.source || extractSourceFromUrl(currentProperty.url) || "Unknown",
      }

      setProperties((prev) => [...prev, newProperty])

      // Reset the form with a new ID
      setCurrentProperty({
        id: generateId(),
        url: "",
        address: "",
        price: 0,
        squareFeet: 0,
        taxes: 0,
        bedrooms: 0,
        bathrooms: 0,
        yearBuilt: 0,
        source: "",
      })
    } catch (error) {
      console.error("Error adding property:", error)
      toast({
        title: "Error",
        description: "There was a problem adding the property. Please try again.",
        variant: "destructive",
      })
    }
  }

  const removeProperty = (id: string) => {
    setProperties(properties.filter((property) => property.id !== id))

    // Also remove from favorites if it was favorited
    if (favoriteIds.has(id)) {
      const newFavorites = new Set(favoriteIds)
      newFavorites.delete(id)
      setFavoriteIds(newFavorites)
    }
  }

  const toggleFavorite = (id: string) => {
    const newFavorites = new Set(favoriteIds)
    const property = properties.find((p) => p.id === id)

    if (!property) return

    if (newFavorites.has(id)) {
      newFavorites.delete(id)
      toast({
        title: "Removed from favorites",
        description: `${property.address} has been removed from your favorites.`,
      })
    } else {
      newFavorites.add(id)
      toast({
        title: "Added to favorites",
        description: `${property.address} has been added to your favorites.`,
      })
    }

    setFavoriteIds(newFavorites)
  }

  const saveSearch = (name: string, propertiesToSave: Property[]) => {
    const newSearch: SavedSearch = {
      id: generateId(),
      name,
      properties: propertiesToSave,
      savedAt: new Date().toISOString(),
    }

    setSavedSearches([newSearch, ...savedSearches])
  }

  const loadSearch = (searchId: string) => {
    const search = savedSearches.find((s) => s.id === searchId)
    if (!search) return

    setProperties(search.properties)

    // Update favorites to include any favorited properties in the loaded search
    const newFavorites = new Set(favoriteIds)
    search.properties.forEach((property) => {
      if (favoriteIds.has(property.id)) {
        newFavorites.add(property.id)
      }
    })
    setFavoriteIds(newFavorites)
  }

  const deleteSearch = (searchId: string) => {
    setSavedSearches(savedSearches.filter((search) => search.id !== searchId))
  }

  const importSearch = (search: SavedSearch) => {
    setSavedSearches([search, ...savedSearches])
  }

  const getBestValue = () => {
    if (properties.length === 0) return null

    return properties.reduce((best, current) => {
      const bestRatio = best.price / best.squareFeet
      const currentRatio = current.price / current.squareFeet
      return currentRatio < bestRatio ? current : best
    })
  }

  const bestValue = getBestValue()

  // Filter properties based on active tab
  const unsortedProperties =
    activeTab === "favorites" ? properties.filter((property) => favoriteIds.has(property.id)) : properties

  // Sort properties based on selected sort option
  const sortedProperties = useMemo(() => {
    if (!unsortedProperties.length) return []

    const [field, direction] = sortBy.split("-") as [keyof Property | "pricePerSqFt", "asc" | "desc"]

    return [...unsortedProperties].sort((a, b) => {
      let valueA: number
      let valueB: number

      // Handle special case for price per square foot
      if (field === "pricePerSqFt") {
        valueA = a.price / a.squareFeet
        valueB = b.price / b.squareFeet
      } else {
        valueA = a[field] as number
        valueB = b[field] as number
      }

      // Handle null/undefined values
      if (valueA === null || valueA === undefined) valueA = 0
      if (valueB === null || valueB === undefined) valueB = 0

      return direction === "asc" ? valueA - valueB : valueB - valueA
    })
  }, [unsortedProperties, sortBy])

  return (
    <div className="space-y-8">
      <Card>
        <CardHeader>
          <CardTitle>Add Property</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            <div className="space-y-2">
              <Label htmlFor="url">Property URL</Label>
              <Input
                id="url"
                name="url"
                placeholder="https://www.zillow.com/..."
                value={currentProperty.url}
                onChange={handleInputChange}
              />
              <p className="text-xs text-muted-foreground">Paste URL from Zillow, Redfin, Realtor.com, etc.</p>
            </div>
            <div className="space-y-2">
              <Label htmlFor="source">Source</Label>
              <Input
                id="source"
                name="source"
                placeholder="Auto-detected from URL"
                value={currentProperty.source}
                onChange={handleInputChange}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="address">Address</Label>
              <Input
                id="address"
                name="address"
                placeholder="Auto-detected from URL"
                value={currentProperty.address}
                onChange={handleInputChange}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="price">Price ($)</Label>
              <Input
                id="price"
                name="price"
                type="number"
                placeholder="350000"
                value={currentProperty.price || ""}
                onChange={handleInputChange}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="squareFeet">Square Feet</Label>
              <Input
                id="squareFeet"
                name="squareFeet"
                type="number"
                placeholder="2000"
                value={currentProperty.squareFeet || ""}
                onChange={handleInputChange}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="taxes">Annual Taxes ($)</Label>
              <Input
                id="taxes"
                name="taxes"
                type="number"
                placeholder="5000"
                value={currentProperty.taxes || ""}
                onChange={handleInputChange}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="bedrooms">Bedrooms</Label>
              <Input
                id="bedrooms"
                name="bedrooms"
                type="number"
                placeholder="3"
                value={currentProperty.bedrooms || ""}
                onChange={handleInputChange}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="bathrooms">Bathrooms</Label>
              <Input
                id="bathrooms"
                name="bathrooms"
                type="number"
                placeholder="2"
                value={currentProperty.bathrooms || ""}
                onChange={handleInputChange}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="yearBuilt">Year Built</Label>
              <Input
                id="yearBuilt"
                name="yearBuilt"
                type="number"
                placeholder="2000"
                value={currentProperty.yearBuilt || ""}
                onChange={handleInputChange}
              />
            </div>
          </div>
        </CardContent>
        <CardFooter>
          <Button onClick={addProperty} className="w-full">
            <Plus className="mr-2 h-4 w-4" />
            Add Property
          </Button>
        </CardFooter>
      </Card>

      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="w-full sm:w-auto">
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList>
              <TabsTrigger value="cards">Cards</TabsTrigger>
              <TabsTrigger value="table">Table</TabsTrigger>
              <TabsTrigger value="favorites" className="flex items-center gap-1">
                <Heart className="h-4 w-4" />
                <span>Favorites</span>
                {favoriteIds.size > 0 && (
                  <span className="ml-1 rounded-full bg-red-100 px-2 py-0.5 text-xs text-red-600">
                    {favoriteIds.size}
                  </span>
                )}
              </TabsTrigger>
            </TabsList>
          </Tabs>
        </div>

        <div className="flex gap-2 w-full sm:w-auto">
          {properties.length > 0 && (
            <div className="mr-2">
              <SortSelect
                options={sortOptions}
                value={sortBy}
                onChange={(value) => setSortBy(value as SortField)}
                placeholder="Sort by..."
              />
            </div>
          )}
          <SaveSearchDialog properties={properties} onSave={saveSearch} />
          <ImportSearchDialog onImport={importSearch} />
          <SavedSearches savedSearches={savedSearches} onLoad={loadSearch} onDelete={deleteSearch} />
        </div>
      </div>

      {properties.length > 0 ? (
        <Tabs value={activeTab} onValueChange={setActiveTab} className="mt-0">
          <TabsContent value="cards">
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {sortedProperties.map((property) => (
                <PropertyCard
                  key={property.id}
                  property={property}
                  onRemove={removeProperty}
                  isBestValue={bestValue?.id === property.id}
                  isFavorite={favoriteIds.has(property.id)}
                  onToggleFavorite={toggleFavorite}
                />
              ))}
            </div>
          </TabsContent>
          <TabsContent value="table">
            <ComparisonTable
              properties={sortedProperties}
              bestValueId={bestValue?.id}
              favoriteIds={favoriteIds}
              onToggleFavorite={toggleFavorite}
            />
          </TabsContent>
          <TabsContent value="favorites">
            {sortedProperties.length === 0 ? (
              <div className="text-center py-12">
                <Heart className="mx-auto h-12 w-12 text-slate-300 mb-4" />
                <h3 className="text-lg font-medium mb-2">No favorites yet</h3>
                <p className="text-muted-foreground mb-4">
                  Click the heart icon on any property to add it to your favorites.
                </p>
              </div>
            ) : (
              <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {sortedProperties.map((property) => (
                  <PropertyCard
                    key={property.id}
                    property={property}
                    onRemove={removeProperty}
                    isBestValue={bestValue?.id === property.id}
                    isFavorite={true}
                    onToggleFavorite={toggleFavorite}
                  />
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      ) : (
        <div className="text-center py-12">
          <div className="mx-auto h-12 w-12 text-slate-300 mb-4">🏠</div>
          <h3 className="text-lg font-medium mb-2">No properties added yet</h3>
          <p className="text-muted-foreground mb-4">Add properties using the form above or load a saved search.</p>
        </div>
      )}
    </div>
  )
}
