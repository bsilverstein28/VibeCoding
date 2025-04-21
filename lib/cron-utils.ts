import { format } from "date-fns"

/**
 * Log a cron job event with timestamp and structured data
 */
export function logCronEvent(jobName: string, status: "start" | "success" | "error", details?: any) {
  const timestamp = format(new Date(), "yyyy-MM-dd HH:mm:ss")
  const logData = {
    timestamp,
    job: jobName,
    status,
    ...(details ? { details } : {}),
  }

  if (status === "error") {
    console.error(`[CRON] ${jobName} - ERROR:`, logData)
  } else {
    console.log(`[CRON] ${jobName} - ${status.toUpperCase()}:`, logData)
  }
}

/**
 * Send a notification about cron job status
 * This is a placeholder for future implementation
 */
export async function notifyCronStatus(jobName: string, status: "success" | "error", details?: any) {
  // In the future, you could implement email notifications or other alerts here
  // For now, we'll just log the event
  logCronEvent(jobName, status, details)
}
