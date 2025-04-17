/**
 * Calculate the monthly mortgage payment using the standard amortization formula
 * @param principal The loan amount (after down payment)
 * @param annualInterestRate Annual interest rate as a percentage (e.g., 5.5)
 * @param loanTermYears Loan term in years (default: 30)
 * @returns Monthly mortgage payment
 */
export function calculateMonthlyMortgagePayment(
  principal: number,
  annualInterestRate: number,
  loanTermYears = 30,
): number {
  // Convert annual interest rate to monthly decimal rate
  const monthlyRate = annualInterestRate / 100 / 12

  // Total number of payments
  const numberOfPayments = loanTermYears * 12

  // Handle edge case of 0% interest
  if (annualInterestRate === 0) {
    return principal / numberOfPayments
  }

  // Calculate monthly payment using the amortization formula
  const monthlyPayment =
    (principal * monthlyRate * Math.pow(1 + monthlyRate, numberOfPayments)) /
    (Math.pow(1 + monthlyRate, numberOfPayments) - 1)

  return monthlyPayment
}

/**
 * Calculate the monthly home insurance cost
 * @param homePrice Total home price
 * @param annualRatePercentage Annual insurance rate as a percentage of home value (default: 0.5%)
 * @returns Monthly insurance cost
 */
export function calculateMonthlyInsurance(homePrice: number, annualRatePercentage = 0.5): number {
  return (homePrice * (annualRatePercentage / 100)) / 12
}

/**
 * Calculate the monthly property tax
 * @param annualTaxes Annual property taxes
 * @returns Monthly tax payment
 */
export function calculateMonthlyTaxes(annualTaxes: number): number {
  return annualTaxes / 12
}

/**
 * Calculate the total monthly payment including mortgage, taxes, and insurance
 * @param homePrice Total home price
 * @param downPaymentPercentage Down payment percentage (default: 20%)
 * @param annualInterestRate Annual interest rate as a percentage
 * @param annualTaxes Annual property taxes
 * @param loanTermYears Loan term in years (default: 30)
 * @returns Object containing detailed payment breakdown
 */
export function calculateTotalMonthlyPayment(
  homePrice: number,
  downPaymentPercentage = 20,
  annualInterestRate: number,
  annualTaxes: number,
  loanTermYears = 30,
): {
  principal: number
  downPayment: number
  monthlyMortgage: number
  monthlyTaxes: number
  monthlyInsurance: number
  totalMonthly: number
} {
  // Calculate down payment and loan principal
  const downPayment = homePrice * (downPaymentPercentage / 100)
  const principal = homePrice - downPayment

  // Calculate individual components
  const monthlyMortgage = calculateMonthlyMortgagePayment(principal, annualInterestRate, loanTermYears)
  const monthlyTaxes = calculateMonthlyTaxes(annualTaxes)
  const monthlyInsurance = calculateMonthlyInsurance(homePrice)

  // Calculate total monthly payment
  const totalMonthly = monthlyMortgage + monthlyTaxes + monthlyInsurance

  return {
    principal,
    downPayment,
    monthlyMortgage,
    monthlyTaxes,
    monthlyInsurance,
    totalMonthly,
  }
}

// Add a utility function to calculate the lowest monthly payment property
/**
 * Find the property with the lowest monthly payment
 * @param properties Array of properties to compare
 * @param mortgageSettings Mortgage settings to use for calculation
 * @returns The property with the lowest monthly payment or null if no properties
 */
export function findLowestMonthlyPaymentProperty(
  properties: Array<{
    id: string
    price: number
    taxes: number
  }>,
  mortgageSettings: {
    downPaymentPercentage: number
    interestRate: number
    loanTermYears: number
  },
): { id: string } | null {
  if (!properties.length) return null

  return properties.reduce((lowest, current) => {
    const lowestPayment = calculateTotalMonthlyPayment(
      lowest.price,
      mortgageSettings.downPaymentPercentage,
      mortgageSettings.interestRate,
      lowest.taxes,
      mortgageSettings.loanTermYears,
    ).totalMonthly

    const currentPayment = calculateTotalMonthlyPayment(
      current.price,
      mortgageSettings.downPaymentPercentage,
      mortgageSettings.interestRate,
      current.taxes,
      mortgageSettings.loanTermYears,
    ).totalMonthly

    return currentPayment < lowestPayment ? current : lowest
  })
}
