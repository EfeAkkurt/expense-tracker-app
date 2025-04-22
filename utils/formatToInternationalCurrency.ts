/**
 * Formats a number to a specified currency format
 * @param value - Number to format
 * @param locale - Locale to use for formatting (default: 'en-US')
 * @param currency - Currency code (default: 'USD')
 * @param minimumFractionDigits - Minimum fraction digits (default: 0)
 * @returns Formatted currency string
 */
export const formatToInternationalCurrency = (
  value: number | string,
  locale: string = "en-US",
  currency: string = "USD",
  minimumFractionDigits: number = 0
): string => {
  if (value === undefined || value === null) {
    return "0";
  }

  // Convert to number if it's a string
  const numValue = typeof value === "string" ? parseFloat(value) : value;

  // Check if it's a valid number
  if (isNaN(numValue)) {
    return "0";
  }

  return new Intl.NumberFormat(locale, {
    style: "currency",
    currency: currency,
    minimumFractionDigits,
  }).format(numValue);
};
