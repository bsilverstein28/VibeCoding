/**
 * Environment variable configuration
 * Centralizes access to environment variables and provides fallbacks
 */

export const envConfig = {
  // Base URL for API calls
  baseUrl: process.env.VERCEL_URL
    ? `https://${process.env.VERCEL_URL}`
    : process.env.NEXT_PUBLIC_SITE_URL ||
      (process.env.NODE_ENV === "production"
        ? "https://your-production-domain.com" // Replace with your actual domain
        : "http://localhost:3000"),

  // Cron job configuration
  cronSecret: process.env.CRON_SECRET || "",

  // Database configuration
  supabaseUrl: process.env.SUPABASE_URL || "",
  supabaseServiceKey: process.env.SUPABASE_SERVICE_ROLE_KEY || "",
  supabaseAnonKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "",

  // AI model API keys
  openaiApiKey: process.env.OPENAI_API_KEY || "",
  geminiApiKey: process.env.GEMINI_API_KEY || "",
  deepseekApiKey: process.env.DEEPSEEK_API_KEY || "",
  deepinfraApiKey: process.env.DEEPINFRA_API_KEY || "",
  sonarApiKey: process.env.SONAR_API_KEY || "",

  // Check if we're in development mode
  isDevelopment: process.env.NODE_ENV === "development",

  // Check if we're in production mode
  isProduction: process.env.NODE_ENV === "production",
}
