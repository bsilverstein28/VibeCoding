import { Skeleton } from "@/components/ui/skeleton"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

export default function LoadingConsensus() {
  return (
    <Tabs defaultValue="spreads" className="w-full">
      <TabsList className="grid w-full grid-cols-3">
        <TabsTrigger value="spreads">Game Spreads</TabsTrigger>
        <TabsTrigger value="totals">Over/Unders</TabsTrigger>
        <TabsTrigger value="props">Player Props</TabsTrigger>
      </TabsList>

      <TabsContent value="spreads">
        <div className="grid gap-6 md:grid-cols-2">
          {[1, 2, 3, 4].map((i) => (
            <LoadingCard key={i} />
          ))}
        </div>
      </TabsContent>

      <TabsContent value="totals">
        <div className="grid gap-6 md:grid-cols-2">
          {[1, 2, 3, 4].map((i) => (
            <LoadingCard key={i} />
          ))}
        </div>
      </TabsContent>

      <TabsContent value="props">
        <div className="grid gap-6 md:grid-cols-2">
          {[1, 2, 3, 4].map((i) => (
            <LoadingCard key={i} />
          ))}
        </div>
      </TabsContent>
    </Tabs>
  )
}

function LoadingCard() {
  return (
    <Card>
      <CardHeader className="pb-2">
        <div className="flex justify-between items-start">
          <div className="space-y-2">
            <Skeleton className="h-6 w-48" />
            <Skeleton className="h-4 w-32" />
          </div>
          <Skeleton className="h-6 w-32" />
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div>
            <Skeleton className="h-4 w-20 mb-2" />
            <Skeleton className="h-6 w-40" />
          </div>

          <div>
            <Skeleton className="h-4 w-20 mb-2" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-full mt-1" />
            <Skeleton className="h-4 w-3/4 mt-1" />
          </div>

          <div>
            <Skeleton className="h-4 w-20 mb-2" />
            <Skeleton className="h-4 w-40 mt-1" />
            <Skeleton className="h-4 w-36 mt-1" />
            <Skeleton className="h-4 w-44 mt-1" />
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
