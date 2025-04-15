/**
 * Extracts the source name from a URL
 * @param url The URL to extract the source from
 * @returns The extracted source name or an empty string if not found
 */
export function extractSourceFromUrl(url: string): string {
  if (!url) return ""

  try {
    // Try to parse the URL
    let domain: string

    // Check if the URL has a protocol, if not add one for parsing
    if (!url.startsWith("http://") && !url.startsWith("https://")) {
      url = "https://" + url
    }

    // Extract the hostname from the URL
    const urlObj = new URL(url)
    domain = urlObj.hostname

    // Remove www. if present
    domain = domain.replace(/^www\./, "")

    // Extract the domain name (e.g., zillow.com -> zillow)
    const domainParts = domain.split(".")
    if (domainParts.length >= 2) {
      const siteName = domainParts[domainParts.length - 2]

      // Map common real estate sites
      const siteMap: Record<string, string> = {
        zillow: "Zillow",
        redfin: "Redfin",
        realtor: "Realtor.com",
        trulia: "Trulia",
        homes: "Homes.com",
        century21: "Century 21",
        coldwellbanker: "Coldwell Banker",
        remax: "RE/MAX",
        compass: "Compass",
        movoto: "Movoto",
        homesnap: "Homesnap",
        apartments: "Apartments.com",
        loopnet: "LoopNet",
        auction: "Auction.com",
        foreclosure: "Foreclosure.com",
        homefinder: "HomeFinder",
        point2homes: "Point2 Homes",
        estately: "Estately",
        mlslistings: "MLS Listings",
        sothebysrealty: "Sotheby's",
        christiesrealestate: "Christie's",
        berkshirehathaway: "Berkshire Hathaway",
        kw: "Keller Williams",
      }

      // Return the mapped name or capitalize the first letter of the domain
      return siteMap[siteName.toLowerCase()] || siteName.charAt(0).toUpperCase() + siteName.slice(1)
    }

    return ""
  } catch (error) {
    console.error("Error extracting source from URL:", error)
    return ""
  }
}

/**
 * Extracts the address from a real estate URL
 * @param url The URL to extract the address from
 * @returns The extracted address or an empty string if not found
 */
export function extractAddressFromUrl(url: string): string {
  if (!url) return ""

  try {
    // Check if the URL has a protocol, if not add one for parsing
    if (!url.startsWith("http://") && !url.startsWith("https://")) {
      url = "https://" + url
    }

    const urlObj = new URL(url)
    const hostname = urlObj.hostname.replace(/^www\./, "")
    const pathname = urlObj.pathname

    // Handle different real estate sites
    if (hostname.includes("redfin.com")) {
      // Format: redfin.com/STATE/CITY/ADDRESS-ZIP/home/ID
      const parts = pathname.split("/").filter(Boolean)
      if (parts.length >= 3) {
        const state = parts[0]
        const city = parts[1]

        // The address part might include the ZIP code
        const addressPart = parts[2]

        // Extract street address and ZIP if possible
        const addressMatch = addressPart.match(/^(.*)-(\d+)$/)
        if (addressMatch) {
          const street = addressMatch[1].replace(/-/g, " ")
          const zip = addressMatch[2]
          return `${street}, ${city}, ${state} ${zip}`
        }

        // If no ZIP in the URL, just use what we have
        const street = addressPart.replace(/-/g, " ")
        return `${street}, ${city}, ${state}`
      }
    } else if (hostname.includes("zillow.com")) {
      // Handle multiple Zillow URL formats

      // Format 1: zillow.com/homedetails/ADDRESS/ID_zpid/
      // Example: zillow.com/homedetails/13-Laurie-Ln-South-Salem-NY-10590/247836482_zpid/
      if (pathname.includes("/homedetails/")) {
        const parts = pathname.split("/").filter(Boolean)
        if (parts.length >= 2 && parts[0] === "homedetails") {
          // The address is the second part, before the ID
          const addressPart = parts[1]
          // Replace hyphens with spaces, except those in state codes
          const formattedAddress = addressPart.replace(/-/g, " ")

          // Try to extract and format state and zip
          // Pattern: something-something-STATE-ZIP
          const stateZipMatch = addressPart.match(/^(.*)-([A-Z]{2})-(\d+)$/)
          if (stateZipMatch) {
            const mainPart = stateZipMatch[1].replace(/-/g, " ")
            const state = stateZipMatch[2]
            const zip = stateZipMatch[3]
            return `${mainPart}, ${state} ${zip}`
          }

          return formattedAddress
        }
      }

      // Format 2: zillow.com/homes/ADDRESS_rb/
      const parts = pathname.split("/").filter(Boolean)
      if (parts.length >= 2 && parts[0] === "homes") {
        let addressPart = parts[1].replace(/_rb\/?$/, "")
        addressPart = addressPart.replace(/-/g, " ")
        return addressPart
      }
    } else if (hostname.includes("realtor.com")) {
      // Format: realtor.com/realestateandhomes-detail/FULL-ADDRESS_ID
      const parts = pathname.split("/").filter(Boolean)
      if (parts.length >= 2 && parts[0] === "realestateandhomes-detail") {
        let addressPart = parts[1].split("_")[0]
        addressPart = addressPart.replace(/-/g, " ")
        return addressPart
      }
    } else if (hostname.includes("trulia.com")) {
      // Format: trulia.com/p/STATE/CITY/ADDRESS-CITY-STATE-ZIP/ID
      const parts = pathname.split("/").filter(Boolean)
      if (parts.length >= 4 && parts[0] === "p") {
        const state = parts[1]
        const city = parts[2]
        let addressPart = parts[3].split("/")[0]

        // Try to extract just the street address
        const streetMatch = addressPart.match(/^(.*?)-[^-]+-[^-]+-\d+$/)
        if (streetMatch) {
          const street = streetMatch[1].replace(/-/g, " ")
          return `${street}, ${city}, ${state}`
        }

        // If pattern doesn't match, just clean up what we have
        addressPart = addressPart.replace(/-/g, " ")
        return addressPart
      }
    } else if (hostname.includes("homes.com")) {
      // Format: homes.com/property/ADDRESS/ID/
      const parts = pathname.split("/").filter(Boolean)
      if (parts.length >= 2 && parts[0] === "property") {
        let addressPart = parts[1]
        addressPart = addressPart.replace(/-/g, " ")
        return addressPart
      }
    }

    // For other sites or if patterns don't match, return empty string
    return ""
  } catch (error) {
    console.error("Error extracting address from URL:", error)
    return ""
  }
}
