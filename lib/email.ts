import { ServerClient } from "postmark"

// Initialize Postmark client
let postmarkClient: ServerClient | null = null

// Add more detailed initialization with error handling
function getPostmarkClient() {
  if (postmarkClient) return postmarkClient

  const apiToken = process.env.POSTMARK_API_TOKEN
  if (!apiToken) {
    console.error("POSTMARK_API_TOKEN environment variable is not set")
    return null
  }

  try {
    postmarkClient = new ServerClient(apiToken)
    return postmarkClient
  } catch (error) {
    console.error("Error initializing Postmark client:", error)
    return null
  }
}

type EmailData = {
  to: string
  subject: string
  text: string
  html: string
}

export async function sendEmail(data: EmailData): Promise<{ success: boolean; message: string }> {
  try {
    const client = getPostmarkClient()
    if (!client) {
      return {
        success: false,
        message: "Postmark client is not initialized. Check your POSTMARK_API_TOKEN environment variable.",
      }
    }

    const fromEmail = process.env.EMAIL_FROM
    if (!fromEmail) {
      return {
        success: false,
        message: "Sender email address is not set. Check your EMAIL_FROM environment variable.",
      }
    }

    // Validate recipient email
    if (!data.to || !data.to.includes("@")) {
      return {
        success: false,
        message: "Invalid recipient email address.",
      }
    }

    console.log(`Attempting to send email from ${fromEmail} to ${data.to}`)

    const response = await client.sendEmail({
      From: fromEmail,
      To: data.to,
      Subject: data.subject,
      TextBody: data.text,
      HtmlBody: data.html,
      MessageStream: "outbound",
    })

    console.log("Email sent with Postmark MessageID:", response.MessageID)
    return {
      success: true,
      message: `Email sent successfully with MessageID: ${response.MessageID}`,
    }
  } catch (error) {
    console.error("Error sending email with Postmark:", error)
    const errorMessage = error instanceof Error ? error.message : String(error)
    return {
      success: false,
      message: `Failed to send email: ${errorMessage}`,
    }
  }
}

export function formatSummaryEmail(summary: any, articles: any[], companies: any[]): { text: string; html: string } {
  // Format the plain text version
  let text = `Daily Tech News Summary - ${new Date(summary.summary_date).toLocaleDateString()}

${summary.summary_text}

`
  \
  text += "COMPANIES COVERED:
"
  companies.forEach((company) =>
  text += `- ${company.name}
`
  )

  text += "
TOP ARTICLES:
"
  articles.slice(0, 5).forEach((article) =>
  text += `- ${article.title}
`
  text += `  ${article.url}
`
  )

  const appUrl = process.env.NEXT_PUBLIC_APP_URL || ""
  text += "
  View
  the
  full
  summary
  at: " + appUrl + "/summaries/" + summary.id

  // Format the HTML version
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h1 style="color: #3b82f6; font-size: 24px;">Daily Tech News Summary</h1>
      <p style="color: #6b7280; font-size: 16px;">${new Date(summary.summary_date).toLocaleDateString()}</p>
      
      <div style="margin: 20px 0; line-height: 1.6; color: #1f2937;">
        ${summary.summary_text
          .split("\n")
          .map((paragraph) => `<p>${paragraph}</p>`)
          .join("")}
      </div>
      
      <div style="margin: 20px 0;">
        <h2 style="font-size: 18px; color: #4b5563;">Companies Covered</h2>
        <ul style="padding-left: 20px;">
          ${companies.map((company) => `<li>${company.name}</li>`).join("")}
        </ul>
      </div>
      
      <div style="margin: 20px 0;">
        <h2 style="font-size: 18px; color: #4b5563;">Top Articles</h2>
        <ul style="padding-left: 20px;">
          ${articles
            .slice(0, 5)
            .map(
              (article) => `
            <li>
              <a href="${article.url}" style="color: #3b82f6; text-decoration: none;">
                ${article.title}
              </a>
              <span style="color: #6b7280; font-size: 14px;"> - ${article.source || "Unknown source"}</span>
            </li>
          `,
            )
            .join("")}
        </ul>
      </div>
      
      <div style="margin: 30px 0; padding-top: 20px; border-top: 1px solid #e5e7eb; text-align: center;">
        <a href="${appUrl}/summaries/${summary.id}" 
           style="background-color: #3b82f6; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">
          View Full Summary
        </a>
      </div>
      
      <div style="margin-top: 30px; font-size: 12px; color: #9ca3af; text-align: center;">
        <p>This email was sent from your Tech News Aggregator.</p>
        <p>To manage your notification preferences, visit the <a href="${appUrl}/settings" style="color: #3b82f6;">settings page</a>.</p>
      </div>
    </div>
  `

  return { text, html }
}
