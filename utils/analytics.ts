// Function to track custom events
export const trackEvent = (action: string, category: string, label?: string, value?: number) => {
  if (typeof window.gtag !== "undefined") {
    window.gtag("event", action, {
      event_category: category,
      event_label: label,
      value: value,
    })
  }
}

// Example usage:
// Import { trackEvent } from "@/utils/analytics"
// trackEvent("click", "property_card", "view_listing", property.id)
