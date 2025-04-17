import { ArrowRight, Heart, Save, Search, Home, BarChart3, Star, DollarSign, Edit2 } from "lucide-react"
import Link from "next/link"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

export default function HowItWorksPage() {
  return (
    <div className="container mx-auto py-8 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold mb-4">How ListIQ Works</h1>
          <p className="text-xl text-muted-foreground">Compare properties side by side to find your perfect home</p>
        </div>

        <div className="space-y-12">
          {/* Introduction */}
          <section>
            <h2 className="text-2xl font-semibold mb-4">Getting Started</h2>
            <p className="text-lg mb-6">
              ListIQ helps you compare multiple properties side by side, analyzing key metrics like price per square
              foot and monthly payments to help you find the best value. Follow these simple steps to get started:
            </p>
          </section>

          {/* Step 1 */}
          <Card>
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="flex items-center justify-center w-10 h-10 rounded-full bg-blue-100 text-blue-600">
                  <Home className="h-5 w-5" />
                </div>
                <CardTitle>Step 1: Add Properties</CardTitle>
              </div>
              <CardDescription>Start by adding the properties you want to compare</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <p>Enter details for each property you want to compare. You can add as many properties as you like.</p>
              <ul className="list-disc pl-6 space-y-2">
                <li>
                  <strong>Property URL:</strong> Paste the listing URL from Zillow, Redfin, or other real estate sites
                  (the source will be automatically detected)
                </li>
                <li>
                  <strong>Address:</strong> Enter the property address
                </li>
                <li>
                  <strong>Price and Square Footage:</strong> Enter these key details for value comparison
                </li>
                <li>
                  <strong>Additional Details:</strong> Add information like taxes, bedrooms, bathrooms, and year built
                </li>
              </ul>
              <div className="bg-slate-50 p-4 rounded-md">
                <p className="text-sm text-slate-700">
                  <strong>Pro Tip:</strong> The more details you add, the more accurate your comparison will be. At
                  minimum, you need the URL, address, price, and square footage.
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Step 2 */}
          <Card>
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="flex items-center justify-center w-10 h-10 rounded-full bg-blue-100 text-blue-600">
                  <BarChart3 className="h-5 w-5" />
                </div>
                <CardTitle>Step 2: Compare Properties</CardTitle>
              </div>
              <CardDescription>View your properties side by side in different formats</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <p>Once you've added properties, you can compare them in different views:</p>
              <ul className="list-disc pl-6 space-y-2">
                <li>
                  <strong>Cards View:</strong> See properties as individual cards for a visual comparison
                </li>
                <li>
                  <strong>Table View:</strong> Compare all properties in a detailed table format
                </li>
                <li>
                  <strong>Best Value Indicator:</strong> Properties with the lowest price per square foot are
                  automatically highlighted as "Best Value"
                </li>
                <li>
                  <strong>Sort Options:</strong> Sort properties by price, square footage, bedrooms, and more to find
                  exactly what you're looking for
                </li>
              </ul>
              <div className="bg-slate-50 p-4 rounded-md">
                <p className="text-sm text-slate-700">
                  <strong>Pro Tip:</strong> The table view is great for comparing specific metrics across all properties
                  at once.
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Step 3 - NEW Mortgage Calculator */}
          <Card>
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="flex items-center justify-center w-10 h-10 rounded-full bg-blue-100 text-blue-600">
                  <DollarSign className="h-5 w-5" />
                </div>
                <CardTitle>Step 3: Calculate Monthly Payments</CardTitle>
              </div>
              <CardDescription>See the true cost of ownership with mortgage calculations</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <p>Use the built-in mortgage calculator to understand the true monthly cost of each property:</p>
              <ul className="list-disc pl-6 space-y-2">
                <li>
                  <strong>Mortgage Settings:</strong> Customize interest rate, down payment percentage, and loan term
                </li>
                <li>
                  <strong>Complete Cost Breakdown:</strong> See mortgage payment, property taxes, and home insurance
                  costs
                </li>
                <li>
                  <strong>Lowest Payment Indicator:</strong> Properties with the lowest total monthly payment are
                  highlighted as "Lowest Payment"
                </li>
                <li>
                  <strong>Sort by Monthly Payment:</strong> Find the most affordable properties based on total monthly
                  cost
                </li>
              </ul>
              <div className="bg-slate-50 p-4 rounded-md">
                <p className="text-sm text-slate-700">
                  <strong>Pro Tip:</strong> The "Best Value" (price per square foot) and "Lowest Payment" (monthly cost)
                  indicators may highlight different properties, giving you multiple perspectives on value.
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Step 4 - Favorite Properties (was Step 3) */}
          <Card>
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="flex items-center justify-center w-10 h-10 rounded-full bg-blue-100 text-blue-600">
                  <Heart className="h-5 w-5" />
                </div>
                <CardTitle>Step 4: Favorite Properties</CardTitle>
              </div>
              <CardDescription>Mark properties you're most interested in</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <p>As you compare properties, you can mark your favorites:</p>
              <ul className="list-disc pl-6 space-y-2">
                <li>Click the heart icon on any property to add it to your favorites</li>
                <li>View only your favorite properties by clicking the "Favorites" tab</li>
                <li>Favorites are saved in your browser, so you can come back to them later</li>
              </ul>
              <div className="bg-slate-50 p-4 rounded-md">
                <p className="text-sm text-slate-700">
                  <strong>Pro Tip:</strong> Use favorites to narrow down your top choices after comparing all
                  properties.
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Step 5 - Edit Properties (NEW) */}
          <Card>
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="flex items-center justify-center w-10 h-10 rounded-full bg-blue-100 text-blue-600">
                  <Edit2 className="h-5 w-5" />
                </div>
                <CardTitle>Step 5: Edit Properties</CardTitle>
              </div>
              <CardDescription>Update property details as needed</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <p>Keep your property information accurate and up-to-date:</p>
              <ul className="list-disc pl-6 space-y-2">
                <li>Click the pencil icon on any property to edit its details</li>
                <li>Update prices if they change, or correct any information</li>
                <li>Add missing details you discover later</li>
                <li>Changes are saved automatically to your comparison</li>
              </ul>
              <div className="bg-slate-50 p-4 rounded-md">
                <p className="text-sm text-slate-700">
                  <strong>Pro Tip:</strong> If you change the property URL, the system will attempt to auto-detect the
                  new source and address.
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Step 6 - Save Searches (was Step 4) */}
          <Card>
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="flex items-center justify-center w-10 h-10 rounded-full bg-blue-100 text-blue-600">
                  <Save className="h-5 w-5" />
                </div>
                <CardTitle>Step 6: Save Your Searches</CardTitle>
              </div>
              <CardDescription>Save your comparisons to revisit later</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <p>Don't lose your research! Save your property comparisons:</p>
              <ul className="list-disc pl-6 space-y-2">
                <li>Click "Save Search" to name and save your current set of properties</li>
                <li>Access your saved searches anytime from the "Saved Searches" dropdown</li>
                <li>Load any saved search to continue your comparison where you left off</li>
                <li>Share your searches with others via a link or downloadable file</li>
              </ul>
              <div className="bg-slate-50 p-4 rounded-md">
                <p className="text-sm text-slate-700">
                  <strong>Pro Tip:</strong> Create different saved searches for different neighborhoods or property
                  types you're considering.
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Additional Tips */}
          <section>
            <h2 className="text-2xl font-semibold mb-4">Additional Tips</h2>
            <div className="grid gap-6 md:grid-cols-2">
              <Card>
                <CardHeader>
                  <div className="flex items-center gap-2">
                    <Search className="h-5 w-5 text-blue-600" />
                    <CardTitle className="text-lg">Research Multiple Areas</CardTitle>
                  </div>
                </CardHeader>
                <CardContent>
                  <p>
                    Create separate saved searches for different neighborhoods to compare not just individual
                    properties, but entire areas.
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <div className="flex items-center gap-2">
                    <Star className="h-5 w-5 text-blue-600" />
                    <CardTitle className="text-lg">Focus on Value Metrics</CardTitle>
                  </div>
                </CardHeader>
                <CardContent>
                  <p>
                    Pay special attention to the price per square foot and monthly payment calculations, as these can
                    significantly impact the long-term value of your investment.
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <div className="flex items-center gap-2">
                    <DollarSign className="h-5 w-5 text-blue-600" />
                    <CardTitle className="text-lg">Adjust Mortgage Settings</CardTitle>
                  </div>
                </CardHeader>
                <CardContent>
                  <p>
                    Try different interest rates and down payment amounts to see how they affect your monthly payments
                    and help you plan your budget.
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <div className="flex items-center gap-2">
                    <BarChart3 className="h-5 w-5 text-blue-600" />
                    <CardTitle className="text-lg">Compare Multiple Metrics</CardTitle>
                  </div>
                </CardHeader>
                <CardContent>
                  <p>
                    Don't just look at price - consider square footage, monthly payments, taxes, and location to get a
                    complete picture of each property's value.
                  </p>
                </CardContent>
              </Card>
            </div>
          </section>

          {/* Call to Action */}
          <div className="text-center pt-8">
            <h2 className="text-2xl font-semibold mb-4">Ready to Find Your Perfect Home?</h2>
            <Button size="lg" asChild>
              <Link href="/">
                Start Comparing Properties <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
