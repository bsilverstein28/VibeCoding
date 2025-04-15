import { HomeComparison } from "@/components/home-comparison"

export default function HomePage() {
  return (
    <main>
      <div className="container mx-auto py-8 px-4">
        <h1 className="text-3xl font-bold mb-2 text-slate-900">Find Your Perfect Home</h1>
        <p className="text-muted-foreground mb-8">
          Compare multiple properties side by side to find your perfect home.
        </p>
        <HomeComparison />
      </div>
    </main>
  )
}
