import { initializeSources } from "./database-service"

/**
 * Initialize the database with required data
 */
export async function seedDatabase() {
  try {
    // Initialize betting sources
    await initializeSources()

    console.log("Database seeded successfully")
    return { success: true }
  } catch (error) {
    console.error("Error seeding database:", error)
    return { success: false, error }
  }
}
