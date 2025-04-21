import { NextResponse } from "next/server"
import { seedDatabase } from "@/lib/seed-database"

export async function GET() {
  try {
    const result = await seedDatabase()

    if (result.success) {
      return NextResponse.json({ message: "Database initialized successfully" })
    } else {
      return NextResponse.json({ error: "Failed to initialize database" }, { status: 500 })
    }
  } catch (error) {
    console.error("Error initializing database:", error)
    return NextResponse.json({ error: "An unexpected error occurred" }, { status: 500 })
  }
}
